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
Array.prototype.uniq_by = function(fn) {
  return this.filter((x, i) => i === this.findIndex(y => fn(x, y)))
};
import { IdLookup, NamedLet, NumExpr, FunctionCall, CommandExpr, JsOpExpr, FunctionDef, ReturnExpr, DataClassDef, NewExpr, DotAccess, ClassDef, ClassInstanceEntry, ClassGetterExpr, PrefixDotLookup, StrExpr, NotExpr, ArrayLiteral, IfStatement, NodeAssignment, NodePlusAssignment, WhileStatement, RegexNode, ContinueStatement, BreakStatement, IfBranch, ElseIfBranch, ElseBranch, PropertyLookup, ExportDefault, ExportStatement, SpreadExpr, SimpleArg, SpreadArg, ArrowFn, IsOperator, BoundFunctionDef, ForLoop, IsNotOperator, ParenExpr, LetObjectDeconstruction, RegularObjectProperty, RenamedProperty, ImportStatement, DefaultImport, LetArrDeconstruction, ArrNameEntry, ArrComma, DefaultObjClassArg, NamedClassArg, ObjClassArg, SimpleDefaultArg, ObjLit, SimpleObjEntry, PrefixBindLookup, NumberT, StrT } from "./parser.mjs";
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
class ArrayT {
  constructor(type) {
    this.type = type;
  }
};
class UnionT {
  constructor(types) {
    this.types = types;
  }
};
let BUILTIN_TYPES = { console: new ObjT({ log: new FnT(new AnyT(), new NilT()) }) };
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
    } else {
      panic("Unknown statement " + node.constructor.name);
    };
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
  infer(expr) {
    if (expr instanceof NumExpr) {
      return new NumberT();
    } else if (expr instanceof StrExpr) {
      return new StrT();
    } else if (expr instanceof ReturnExpr) {
      return this.infer(expr.expr);
    } else if (expr instanceof JsOpExpr) {
      return this.infer_js_op(expr.type).return_type;
    } else if (expr instanceof IdLookup) {
      if (this.types[expr.name]) {
        return this.types[expr.name];
      };
      console.log(expr);
      panic("unknown type for " + expr.name);
    } else if (expr instanceof FunctionCall) {
      return this.infer(expr.lhs_expr).return_type;
    } else if (expr instanceof DotAccess) {
      let lhs_t = this.infer(expr.lhs);
      if (lhs_t instanceof ArrayT) {
        return this.infer_array_method(lhs_t, expr.property);
      } else {
        return this.infer(expr.lhs).properties[expr.property];
      };
    } else if (expr instanceof ArrayLiteral) {
      return this.infer_array_literal(expr);
    } else {
      panic("Cant infer " + expr.constructor.name);
    };
  };
  infer_array_method(arr_t, property) {
    if (property === "push") {
      return new FnT([{ type: arr_t.type }], new NumberT());
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
      return new FnT([{ type: new NumberT() }, { type: new NumberT() }], new NumberT());
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
    } else {
      panic("check_expr: Unknown node " + expr.constructor.name);
    };
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

