class Panic extends Error {}
function panic(reason) {
  throw new Panic(reason);
}
import Lexer from "./dist/lexer.mjs";
import Parser from "./dist/parser.mjs";
import fs from "fs";
import { IdLookup, NamedLet, NumExpr, FunctionCall, CommandExpr, JsOpExpr, FunctionDef, ReturnExpr, DataClassDef, NewExpr, DotAccess, ClassDef, ClassInstanceEntry, ClassGetterExpr, PrefixDotLookup, StrExpr, NotExpr, ArrayLiteral, IfStatement, NodeAssignment, NodePlusAssignment, WhileStatement, RegexNode, ContinueStatement, BreakStatement, IfBranch, ElseIfBranch, ElseBranch, PropertyLookup, ExportDefault, ExportStatement, SpreadExpr, SimpleArg, SpreadArg, ArrowFn, IsOperator, BoundFunctionDef, ForLoop, IsNotOperator, ParenExpr, LetObjectDeconstruction, RegularObjectProperty, RenamedProperty, ImportStatement, DefaultImport, LetArrDeconstruction, ArrNameEntry, ArrComma, DefaultObjClassArg, NamedClassArg, ObjClassArg, SimpleDefaultArg, ObjLit, SimpleObjEntry } from "./dist/parser.mjs";
class Formatter {
  constructor(ast, { indentation } = { indentation: 0 }) {
    this.ast = ast;
    this.indentation = indentation;
  }
  get padding() {
    return Array(this.indentation+1).join(" ");
  };
  format() {
    let output = "";
    let i = 0;
    for (let node of this.ast) {
      output += this.padding;
      output += this.format_node(node, i===this.ast.length-1);
      output += "\n";
      i += 1;
    };
    return output;
  };
  format_node(node, is_last = false) {
    if (node instanceof FunctionDef) {
      return this.format_function_def(node);
    } else if (node instanceof ReturnExpr) {
      return this.format_return_expr(node, is_last);
    } else if (node instanceof NumExpr) {
      return this.format_num_expr(node);
    } else if (node instanceof NamedLet) {
      return this.format_named_let(node);
    } else if (node instanceof JsOpExpr) {
      return this.format_js_op_expr(node);
    } else if (node instanceof IdLookup) {
      return node.name;
    } else {
      panic("Format not implemented for "+node.constructor.name);
    };
  };
  format_js_op_expr({ lhs, type, rhs }) {
    return this.format_node(lhs)+" "+type+" "+this.format_node(rhs);
  };
  format_named_let({ name, expr }) {
    return "let "+name+" = "+this.format_node(expr);
  };
  format_num_expr({ value }) {
    return value;
  };
  format_return_expr({ expr }, is_last) {
    if (is_last) {
      return this.format_node(expr);
    };
    return "return "+this.format_node(expr);
  };
  format_body(body, indent_by = 2) {
    return new Formatter(body, { indentation: this.indentation+indent_by }).format().trimEnd()+"\n";
  };
  format_arg(arg_node) {
    if (arg_node instanceof SimpleArg) {
      return arg_node.name;
    } else {
      panic("Arg format not implemented for "+node.constructor.name);
    };
  };
  format_function_def({ name, args, body }) {
    let f = "def "+name;
    if (args.length>0) {
      let args_f = args.map(this.format_arg.bind(this)).join(", ");
      f += "("+args_f+")";
    };
    f += "\n";
    f += this.format_body(body);
    f += "end";
    return f;
  };
};
let [, , file_name] = process.argv;
let str = fs.readFileSync(file_name).toString();
let tokens = new Lexer(str).tokenize();
let ast = new Parser(tokens).parse();
let output = new Formatter(ast).format();
fs.writeFileSync(file_name, output);

