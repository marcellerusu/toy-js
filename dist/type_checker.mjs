class Panic extends Error {}
function panic(reason) {
  throw new Panic(reason);
}
Array.prototype.sum = function () {
  let sum = 0;
  for (let item of this) {
    sum += item;
  }
  return sum;
};
Array.prototype.zip = function (other) {
  let zipped = [];
  for (let i = 0; i < this.length; i++) {
    zipped.push([this[i], other[i]]);
  }
  return zipped;
};
import {
  IdLookup,
  NamedLet,
  NumExpr,
  FunctionCall,
  CommandExpr,
  JsOpExpr,
  FunctionDef,
  ReturnExpr,
  DataClassDef,
  NewExpr,
  DotAccess,
  ClassDef,
  ClassInstanceEntry,
  ClassGetterExpr,
  PrefixDotLookup,
  StrExpr,
  NotExpr,
  ArrayLiteral,
  IfStatement,
  NodeAssignment,
  NodePlusAssignment,
  WhileStatement,
  RegexNode,
  ContinueStatement,
  BreakStatement,
  IfBranch,
  ElseIfBranch,
  ElseBranch,
  PropertyLookup,
  ExportDefault,
  ExportStatement,
  SpreadExpr,
  SimpleArg,
  SpreadArg,
  ArrowFn,
  IsOperator,
  BoundFunctionDef,
  ForLoop,
  IsNotOperator,
  ParenExpr,
  LetObjectDeconstruction,
  RegularObjectProperty,
  RenamedProperty,
  ImportStatement,
  DefaultImport,
  LetArrDeconstruction,
  ArrNameEntry,
  ArrComma,
  DefaultObjClassArg,
  NamedClassArg,
  ObjClassArg,
  SimpleDefaultArg,
  ObjLit,
  SimpleObjEntry,
  PrefixBindLookup,
  NumberT,
  StrT,
} from "./parser.mjs";
class TypeChecker {
  constructor(ast, types = {}) {
    this.ast = ast;
    this.types = types;
  }
  check() {
    for (let statement of this.ast) {
      this.check_statement(statement);
    }
    return null;
  }
  check_statement(node) {
    if (node instanceof NamedLet) {
      this.check_named_let(node);
    } else if (node instanceof FunctionDef) {
      this.check_function_def(node);
    } else {
      panic("Unknown node " + node.constructor.name);
    }
  }
  check_function_def({ name, args, body, type }) {
    this.types[name] = { return_type: type, args: args };
    return null;
  }
  infer(expr) {
    if (expr instanceof NumExpr) {
      return new NumberT();
    } else if (expr instanceof StrExpr) {
      return new StrT();
    } else if (expr instanceof IdLookup) {
      return this.types[expr.name];
    } else if (expr instanceof FunctionCall) {
      return this.infer(expr.lhs_expr).return_type;
    } else {
      panic("Can't infer " + expr.constructor.name);
    }
  }
  panic_mismatch(name, expected, got) {
    return panic(
      "type mismatch: expected `" +
        name +
        "` to be a " +
        expected +
        " but it was a " +
        got
    );
  }
  is_match(a, b) {
    return a.constructor === b.constructor;
  }
  check_expr(expr) {
    if (expr instanceof FunctionCall) {
      this.check_function_call(expr);
    } else {
      panic("check_expr: Unknown node " + expr.constructor.name);
    }
  }
  pretty(obj) {
    return obj.constructor.name + "(" + JSON.stringify(obj) + ")";
  }
  check_function_call({ lhs_expr, args }) {
    let { args: fn_arg_types } = this.infer(lhs_expr);
    for (let iter of args.zip(fn_arg_types)) {
      let [value, { type }] = iter;
      if (!this.is_match(this.infer(value), type)) {
        this.panic_mismatch(
          this.pretty(value),
          type.constructor.name,
          this.infer(value).constructor.name
        );
      }
    }
    return null;
  }
  check_named_let({ name, expr, type }) {
    console.log(expr);
    this.check_expr(expr);
    console.log(name, type, this.infer(expr));
    if (this.is_match(type, this.infer(expr))) {
      null;
    } else {
      this.panic_mismatch(name, type.constructor.name, this.infer(expr));
    }
  }
}
export default TypeChecker;
