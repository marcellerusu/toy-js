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
import { IdLookup, NamedLet, NumExpr, FunctionCall, CommandExpr, JsOpExpr, FunctionDef, ReturnExpr, DataClassDef, NewExpr, DotAccess, ClassDef, ClassInstanceEntry, ClassGetterExpr, PrefixDotLookup, StrExpr, NotExpr, ArrayLiteral, IfStatement, NodeAssignment, NodePlusAssignment, WhileStatement, RegexNode, ContinueStatement, BreakStatement, IfBranch, ElseIfBranch, ElseBranch, PropertyLookup, ExportDefault, ExportStatement, SpreadExpr, SimpleArg, SpreadArg, ArrowFn, IsOperator, BoundFunctionDef, ForLoop, IsNotOperator, ParenExpr, LetObjectDeconstruction, RegularObjectProperty, RenamedProperty, ImportStatement, DefaultImport, LetArrDeconstruction, ArrNameEntry, ArrComma, DefaultObjClassArg, NamedClassArg, ObjClassArg, SimpleDefaultArg, ObjLit, SimpleObjEntry, PrefixBindLookup, NumberT, StrT } from "./parser.mjs";
class TypeChecker {
  constructor(ast) {
    this.ast = ast;
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
    } else {
      panic("Unknown node "+node.constructor.name);
    };
  };
  infer(expr) {
    if (expr instanceof NumExpr) {
      return NumberT;
    } else if (expr instanceof StrExpr) {
      return StrT;
    } else {
      panic("Can't infer "+expr.constructor.name);
    };
  };
  panic_mismatch(name, expected, got) {
    return panic("type mismatch: expected `"+name+"` to be a "+expected+" but it was a "+got);
  };
  check_named_let({ name, expr, type }) {
    if (type instanceof this.infer(expr)) {
      return null;
    } else {
      this.panic_mismatch(name, type.constructor.name, this.infer(expr).name);
    };
  };
};
export default TypeChecker;

