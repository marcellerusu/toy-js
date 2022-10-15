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
};
Array.prototype.zip = function(other) {
  let zipped = [];
  for (let i = 0; i < this.length; i++) {
    zipped.push([this[i], other[i]]);
  }
  return zipped;
};
Array.prototype.uniq_by = function(predicate) {
  return this.filter((x, i) => i === this.findIndex(y => predicate(x, y)))
};
Array.prototype.join_by = function(merge_fn) {
  let merged = this[0];
  for (let item of this.slice(1)) {
    merged = merge_fn(merged, item);
  }
  return merged;
};
import { IdLookup, NamedLet, NumExpr, FunctionCall, CommandExpr, JsOpExpr, FunctionDef, ReturnExpr, DataClassDef, NewExpr, DotAccess, ClassDef, ClassInstanceEntry, ClassGetterExpr, PrefixDotLookup, StrExpr, NotExpr, ArrayLiteral, IfStatement, NodeAssignment, NodePlusAssignment, WhileStatement, RegexNode, ContinueStatement, BreakStatement, IfBranch, ElseIfBranch, ElseBranch, PropertyLookup, ExportDefault, ExportStatement, SpreadExpr, SimpleArg, SpreadArg, ArrowFn, IsOperator, BoundFunctionDef, ForLoop, IsNotOperator, ParenExpr, LetObjectDeconstruction, RegularObjectProperty, RenamedProperty, ImportStatement, DefaultImport, LetArrDeconstruction, ArrNameEntry, ArrComma, DefaultObjClassArg, NamedClassArg, ObjClassArg, SimpleDefaultArg, ObjLit, SimpleObjEntry, PrefixBindLookup, NumT, StrT, ArrayT, TypeDef, TypeIdLookup, BoolT } from "./parser.mjs";
import Lexer from "./lexer.mjs";
import Parser from "./parser.mjs";
import fs from "fs";
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
class ClassT {
  constructor(methods, getters, properties) {
    this.methods = methods;
    this.getters = getters;
    this.properties = properties;
  }
};
class CombinedT {
  constructor(root_t, properties) {
    this.root_t = root_t;
    this.properties = properties;
  }
};
class RegexT {};
let BUILTIN_TYPES = { console: new ObjT({ log: new FnT(new AnyT(), new NilT()) }), process: new ObjT({ argv: new ArrayT(new StrT()) }), RegExp: new RegexT() };
let Buffer = new ObjT({ toString: new FnT([], new StrT()) });
let BUILTIN_PACKAGES = { fs: new ObjT({ readFileSync: new FnT([{ type: new StrT() }], Buffer) }) };
class TypeChecker {
  constructor(ast, types = BUILTIN_TYPES, self = {  }) {
    this.ast = ast;
    this.types = types;
    this.self = self;
  }
  check() {
    for (let statement of this.ast) {
      this.check_statement(statement);
    };
    return null;
  };
  check_statement(node, is_exported = false) {
    if (node instanceof NamedLet) {
      this.check_named_let(node, is_exported);
    } else if (node instanceof FunctionDef) {
      this.check_function_def(node);
    } else if (node instanceof ReturnExpr) {
      this.check_expr(node.expr);
    } else if (node instanceof FunctionCall) {
      this.check_function_call(node);
    } else if (node instanceof LetArrDeconstruction) {
      this.check_let_arr_deconstruction(node);
    } else if (node instanceof DataClassDef) {
      this.check_data_class_def(node, is_exported);
    } else if (node instanceof TypeDef) {
      this.check_type_def(node);
    } else if (node instanceof DefaultImport) {
      this.check_default_import(node);
    } else if (node instanceof ExportStatement) {
      this.check_export_statement(node);
    } else if (node instanceof ClassDef) {
      this.check_class_def(node);
    } else {
      panic("Unknown statement " + node.constructor.name);
    };
  };
  check_class_arg(node) {
    if (!(node instanceof NamedClassArg)) panic(`assertion failed: node instanceof NamedClassArg`);;
    return node.type || new AnyT();
  };
  check_class_instance_entry({ name, expr }) {
    return [name, this.infer(expr)];
  };
  check_class_getter_expr({ name, expr }) {
    return [name, this.infer(expr)];
  };
  check_class_entry(entry) {
    if (entry instanceof ClassInstanceEntry) {
      return this.check_class_instance_entry(entry);
    } else if (entry instanceof ClassGetterExpr) {
      return this.check_class_getter_expr(entry);
    } else if (entry instanceof FunctionDef) {
      return this.check_function_def(entry);
    } else {
      console.log(entry);
      panic("unknown class entry");
    };
  };
  infer_prefix_dot_lookup({ name }) {
    if (!(this.self)) panic(`assertion failed: this.self`);;
    return this.self[name];
  };
  check_class_def({ name, properties, entries }) {
    for (let property of properties) {
      this.self[property.name] = this.check_class_arg(property);
    };
    for (let entry of entries) {
      let [name, type] = this.check_class_entry(entry);
      this.self[name] = type;
    };
    return panic("class def not implemented");
  };
  check_export_statement({ statement }) {
    if (!(statement instanceof DataClassDef)) panic(`assertion failed: statement instanceof DataClassDef`);;
    return this.check_statement(statement, true);
  };
  check_default_import({ name, path }) {
    if (BUILTIN_PACKAGES[path]) {
      this.types[name] = BUILTIN_PACKAGES[path];
    } else if (path.startsWith("./")) {
      let code = fs.readFileSync(path + ".lang").toString();
      let tokens = new Lexer(code).tokenize();
      let ast = new Parser(tokens).parse();
      let tc = new TypeChecker(ast).check();
      console.log(tc.types);
      if (!(false)) panic(`assertion failed: false`);;
    } else {
      panic("unknown package " + path);
    };
  };
  check_type_def({ name, type }) {
    this.types[name] = type;
    return null;
  };
  check_data_class_def({ name, properties }, is_exported) {
    if (!(properties.every((p) => p instanceof NamedClassArg))) panic(`assertion failed: properties.every((p) => p instanceof NamedClassArg)`);;
    let property_types = properties.map((p) => [p.name, p.type]);
    this.types[name] = new DataClassT(property_types);
    this.types[name].exported = is_exported;
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
    let tc = new TypeChecker(body, sub_types, this.self);
    if (!type) {
      type = tc.infer(body.at(-1));
    };
    this.types[name] = new FnT(args, type);
    for (let arg of args) {
      sub_types[arg.name] = arg.type || new AnyT();
    };
    console.log(sub_types);
    return tc.check();
  };
  infer_id_lookup({ name }) {
    if (name === "null") {
      return new NilT();
    };
    if (name === "true" || name === "false") {
      return new BoolT();
    };
    if (this.types[name]) {
      return this.types[name];
    };
    return panic("unknown type for " + name);
  };
  infer_str_method(method_name) {
    if (method_name === "slice") {
      return new FnT([{ type: new NumT() }], new StrT());
    } else if (method_name === "match") {
      let ret_t = new CombinedT(new ArrayT(), { index: new NumT(), input: new StrT(), groups: new NilT() });
      return new FnT([{ type: new RegexT() }], ret_t);
    } else {
      panic("unknown str method " + method_name);
    };
  };
  infer_dot_access({ lhs, property }) {
    let lhs_t = this.infer(lhs);
    if (lhs_t instanceof AnyT) {
      return lhs_t;
    };
    if (lhs_t instanceof ArrayT) {
      return this.infer_array_method(lhs_t, property);
    } else if (lhs_t instanceof ObjT) {
      return lhs_t.properties[property];
    } else if (lhs_t instanceof NumT) {
      return this.infer_number_method(property);
    } else if (lhs_t instanceof StrT) {
      return this.infer_str_method(property);
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
  infer_property_lookup({ lhs, property }) {
    let lhs_t = this.infer(lhs);
    let property_t = this.infer(property);
    if (lhs_t instanceof StrT) {
      if (property_t instanceof NumT) {
        return new StrT();
      };
      panic("unknown property `" + property + "` on str");
    } else {
      panic("property lookup");
    };
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
    } else if (expr instanceof PrefixDotLookup) {
      return this.infer_prefix_dot_lookup(expr);
    } else if (expr instanceof PropertyLookup) {
      return this.infer_property_lookup(expr);
    } else {
      console.log(expr);
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
  resolve(type) {
    if (!(type instanceof TypeIdLookup)) {
      return type;
    };
    return this.types[type.name];
  };
  is_match(a, b) {
    a = this.resolve(a);
    b = this.resolve(b);
    if (a instanceof UnionT) {
      panic("fixme: union types can't be unwrapped like this");
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
    if (!(this.infer(lhs_expr) instanceof FnT)) panic(`assertion failed: this.infer(lhs_expr) instanceof FnT`);;
    let { args: fn_arg_types } = this.infer(lhs_expr);
    if (fn_arg_types instanceof AnyT) {
      return null;
    };
    if (fn_arg_types.length !== args.length) {
      panic("args length mismatch");
    };
    for (let iter of args.zip(fn_arg_types)) {
      let [value, { type }] = iter;
      if (type instanceof RegexT) {
        console.log(value, this.infer(value), this.resolve(this.infer(value)), type);
      };
      if (!this.is_match(this.infer(value), type)) {
        this.panic_mismatch(this.pretty(value), type.constructor.name, this.infer(value).constructor.name);
      };
    };
    return null;
  };
  check_named_let({ name, expr, type }, is_exported) {
    if (this.types[name]) {
      panic("`" + name + "` already declared");
    };
    type = this.resolve(type);
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
    this.types[name].exported = is_exported;
    return null;
  };
};
export default TypeChecker;

