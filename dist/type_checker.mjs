class Panic extends Error {}
function panic(reason) {
  throw new Panic(reason);
}
Array.prototype.sum = function() {
  let sum = 0;
  for (let item of this) {
    sum += item;
  }
  return sum;
}
Array.prototype.zip = function(other) {
  let zipped = [];
  for (let i = 0; i < this.length; i++) {
    zipped.push([this[i], other[i]]);
  }
  return zipped;
}
Array.prototype.uniq_by = function(predicate) {
  return this.filter((x, i) => i === this.findIndex(y => predicate(x, y)))
};
import { IdLookup, NamedLet, NumExpr, FunctionCall, CommandExpr, JsOpExpr, FunctionDef, ReturnExpr, DataClassDef, NewExpr, DotAccess, ClassDef, ClassInstanceEntry, ClassGetterExpr, PrefixDotLookup, StrExpr, NotExpr, ArrayLiteral, IfStatement, NodeAssignment, NodePlusAssignment, WhileStatement, RegexNode, ContinueStatement, BreakStatement, IfBranch, ElseIfBranch, ElseBranch, PropertyLookup, ExportDefault, ExportStatement, SpreadExpr, SimpleArg, SpreadArg, ArrowFn, IsOperator, BoundFunctionDef, ForLoop, IsNotOperator, ParenExpr, LetObjectDeconstruction, RegularObjectProperty, RenamedProperty, ImportStatement, DefaultImport, LetArrDeconstruction, ArrNameEntry, ArrComma, DefaultObjClassArg, NamedClassArg, ObjClassArg, SimpleDefaultArg, ObjLit, SimpleObjEntry, PrefixBindLookup, NumT, StrT, ArrayT } from "./parser.mjs";
import Lexer from "./lexer.mjs";
import Parser from "./parser.mjs";
class FnT {
  constructor(args, return_type) {
    this.args = args;
    this.return_type = return_type;
  }
};
class AnyT {};
class NilT {};
class ObjT {
  constructor(properties) {
    this.properties = properties;
  }
};
class UnionT {
  constructor(types) {
    this.types = types;
  }
};
class DataClassT {
  constructor(properties) {
    this.properties = properties;
  }
};
let BUILTIN_TYPES = { console: new ObjT({ log: new FnT(new AnyT(), new NilT()) }), process: new ObjT({ argv: new ArrayT(new StrT()) }) };
class TypeChecker {
  constructor(ast, types = BUILTIN_TYPES) {
    this.ast = ast;
    this.types = types;
  }
  check() {
    for (let statement of this.ast) {
      this.check_statement(statement);
    };
    return null;
  };
  check_statement(node) {
    if (node instanceof NamedLet) {
      this.check_named_let(node);
    } else if (node instanceof FunctionDef) {
      this.check_function_def(node);
    } else if (node instanceof ReturnExpr) {
      this.check_expr(node.expr);
    } else if (node instanceof FunctionCall) {
      this.check_function_call(node);
    } else if (node instanceof LetArrDeconstruction) {
      this.check_let_arr_deconstruction(node);
    } else if (node instanceof DataClassDef) {
      this.check_data_class_def(node);
    } else {
      panic("Unknown statement " + node.constructor.name);
    };
  };
  check_data_class_def({ name, properties }) {
    if (!(properties.every((p) => p instanceof NamedClassArg))) panic(`assertion failed: properties.every((p) => p instanceof NamedClassArg)`);;
    let property_types = properties.map((p) => [p.name, p.type]);
    this.types[name] = new DataClassT(property_types);
    return null;
  };
  check_let_arr_deconstruction({ entries, rhs }) {
    let { type } = this.infer(rhs);
    for (let entry of entries) {
      if (entry instanceof ArrComma) {
        continue;
      };
      if (entry instanceof ArrNameEntry) {
        this.types[entry.name] = type;
      } else {
        console.log(entry);
        panic("unknown array entry " + entry.constructor.name);
      };
    };
    return null;
  };
  check_function_def({ name, args, body, type }) {
    let sub_types = Object.assign({  }, this.types);
    let tc = new TypeChecker(body, sub_types);
    if (!type) {
      type = tc.infer(body.at(-1));
    };
    this.types[name] = new FnT(args, type);
    for (let arg of args) {
      sub_types[arg.name] = arg.type;
    };
    return tc.check();
  };
  infer_id_lookup({ name }) {
    if (this.types[name]) {
      return this.types[name];
    };
    return panic("unknown type for " + name);
  };
  infer_dot_access({ lhs, property }) {
    let lhs_t = this.infer(lhs);
    if (lhs_t instanceof ArrayT) {
      return this.infer_array_method(lhs_t, property);
    } else if (lhs_t instanceof ObjT) {
      return lhs_t.properties[property];
    } else if (lhs_t instanceof NumT) {
      return this.infer_number_method(property);
    } else if (lhs_t instanceof DataClassT) {
      let p = lhs_t.properties.find((p) => p[0] === property);
      if (!(p !== undefined)) panic(`assertion failed: p !== undefined`);;
      return p[1];
    } else {
      panic("unknown lhs of dot access " + lhs_t.constructor.name);
    };
  };
  infer_new_expr({ expr }) {
    if (!(expr instanceof FunctionCall)) panic(`assertion failed: expr instanceof FunctionCall`);;
    let { lhs_expr } = expr;
    let class_t = this.infer(lhs_expr);
    if (!(class_t instanceof DataClassT)) panic(`assertion failed: class_t instanceof DataClassT`);;
    return class_t;
  };
  infer(expr) {
    if (expr instanceof NumExpr) {
      return new NumT();
    } else if (expr instanceof StrExpr) {
      return new StrT();
    } else if (expr instanceof ReturnExpr) {
      return this.infer(expr.expr);
    } else if (expr instanceof JsOpExpr) {
      return this.infer_js_op(expr.type).return_type;
    } else if (expr instanceof IdLookup) {
      return this.infer_id_lookup(expr);
    } else if (expr instanceof FunctionCall) {
      return this.infer(expr.lhs_expr).return_type;
    } else if (expr instanceof DotAccess) {
      return this.infer_dot_access(expr);
    } else if (expr instanceof ArrayLiteral) {
      return this.infer_array_literal(expr);
    } else if (expr instanceof NewExpr) {
      return this.infer_new_expr(expr);
    } else {
      panic("Cant infer " + expr.constructor.name);
    };
  };
  infer_number_method(property) {
    if (property === "toString") {
      return new FnT([], new StrT());
    } else {
      panic("unknown property `" + property + "` on num");
    };
  };
  infer_array_method(arr_t, property) {
    if (property === "push") {
      return new FnT([{ type: arr_t.type }], new NumT());
    } else {
      panic("unknown array method " + property);
    };
  };
  infer_array_literal({ elements }) {
    let types = elements.map(this.infer.bind(this)).uniq_by(this.is_match.bind(this));
    if (types.length === 1) {
      return new ArrayT(types[0]);
    } else {
      return new ArrayT(new UnionT(types));
    };
  };
  panic_mismatch(name, expected, got) {
    return panic("type mismatch: expected `" + name + "` to be a " + expected + " but it was a " + got);
  };
  is_match(a, b) {
    if (a instanceof UnionT) {
      return a.types.some((type) => this.is_match(type, b));
    } else if (b instanceof UnionT) {
      return this.is_match(b, a);
    };
    return a.constructor === b.constructor;
  };
  infer_js_op(type) {
    if (type === "+") {
      return new FnT([{ type: new NumT() }, { type: new NumT() }], new NumT());
    } else if (type === "++") {
      return new FnT([{ type: new StrT() }, { type: new StrT() }], new StrT());
    } else {
      panic("unknown js op type " + type);
    };
  };
  check_js_op_expr({ lhs, rhs, type }) {
    let lhs_t = this.infer(lhs);
    let rhs_t = this.infer(rhs);
    if (!this.is_match(lhs_t, rhs_t)) {
      console.log(lhs_t, rhs_t);
      panic("js operands don't match");
    };
    let { args,return_type } = this.infer_js_op(type);
    if (!this.is_match(lhs_t, args[0].type)) {
      console.log(type, return_type);
      console.log(lhs_t, args[0].type);
      panic("js op arg type mismatch");
    };
    if (!this.is_match(lhs_t, return_type)) {
      panic("js op return type mismatch");
    };
  };
  check_expr(expr) {
    if (expr instanceof FunctionCall) {
      this.check_function_call(expr);
    } else if (expr instanceof NumExpr) {
      null;
    } else if (expr instanceof StrExpr) {
      null;
    } else if (expr instanceof JsOpExpr) {
      this.check_js_op_expr(expr);
    } else if (expr instanceof ArrayLiteral) {
      this.check_array_literal(expr);
    } else if (expr instanceof IdLookup) {
      if (!this.types[expr.name]) {
        panic("can't find `" + expr.name + "`");
      };
    } else if (expr instanceof NewExpr) {
      this.check_new_expr(expr);
    } else if (expr instanceof DotAccess) {
      this.check_dot_access(expr);
    } else {
      panic("check_expr: Unknown expr " + expr.constructor.name);
    };
  };
  check_dot_access({ lhs, property }) {
    console.log(lhs, property);
    let lhs_t = this.infer(lhs);
    if (lhs_t instanceof DataClassT) {
      if (!(lhs_t.properties.some((p) => p[0] === property))) panic(`assertion failed: lhs_t.properties.some((p) => p[0] === property)`);;
    } else {
      panic("Not able to dot access on " + lhs_t.constructor.name);
    };
  };
  check_new_expr({ expr }) {
    if (!(expr instanceof FunctionCall)) panic(`assertion failed: expr instanceof FunctionCall`);;
    let { lhs_expr,args } = expr;
    let class_t = this.infer(lhs_expr);
    if (!(class_t instanceof DataClassT)) panic(`assertion failed: class_t instanceof DataClassT`);;
    let { properties } = class_t;
    for (let iter of args.zip(properties)) {
      let [arg, arg_t] = iter;
      let [, type] = arg_t;
      if (!(this.is_match(this.infer(arg), type))) panic(`assertion failed: this.is_match(this.infer(arg), type)`);;
    };
    return null;
  };
  check_array_literal({ elements }) {
    return elements.map(this.check_expr.bind(this));
  };
  pretty(obj) {
    return obj.constructor.name + "(" + JSON.stringify(obj) + ")";
  };
  check_function_call({ lhs_expr, args }) {
    for (let arg of args) {
      this.check_expr(arg);
    };
    let { args: fn_arg_types } = this.infer(lhs_expr);
    if (fn_arg_types instanceof AnyT) {
      return null;
    };
    if (fn_arg_types.length !== args.length) {
      panic("args length mismatch");
    };
    for (let iter of args.zip(fn_arg_types)) {
      let [value, { type }] = iter;
      if (!this.is_match(this.infer(value), type)) {
        this.panic_mismatch(this.pretty(value), type.constructor.name, this.infer(value).constructor.name);
      };
    };
    return null;
  };
  check_named_let({ name, expr, type }) {
    this.check_expr(expr);
    let inferred_type = this.infer(expr);
    if (!type) {
      this.types[name] = inferred_type;
    } else if (this.is_match(type, this.infer(expr))) {
      this.types[name] = type;
    } else {
      console.log(name, type, this.infer(expr));
      console.log(expr);
      this.panic_mismatch(name, type.constructor.name, this.infer(expr).constructor.name);
    };
  };
};
export default TypeChecker;

