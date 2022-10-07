class Panic extends Error {}
function panic(reason) {
  throw new Panic(reason);
}
import Lexer from "./dist/lexer.mjs";
import Parser from "./dist/parser.mjs";
import fs from "fs";
import { IdLookup, NamedLet, NumExpr, FunctionCall, CommandExpr, JsOpExpr, FunctionDef, ReturnExpr, DataClassDef, NewExpr, DotAccess, ClassDef, ClassInstanceEntry, ClassGetterExpr, PrefixDotLookup, StrExpr, NotExpr, ArrayLiteral, IfStatement, NodeAssignment, NodePlusAssignment, WhileStatement, RegexNode, ContinueStatement, BreakStatement, IfBranch, ElseIfBranch, ElseBranch, PropertyLookup, ExportDefault, ExportStatement, SpreadExpr, SimpleArg, SpreadArg, ArrowFn, IsOperator, BoundFunctionDef, ForLoop, IsNotOperator, ParenExpr, LetObjectDeconstruction, RegularObjectProperty, RenamedProperty, ImportStatement, DefaultImport, LetArrDeconstruction, ArrNameEntry, ArrComma, DefaultObjClassArg, NamedClassArg, ObjClassArg, SimpleDefaultArg, ObjLit, SimpleObjEntry, ObjClassArgEntry } from "./dist/parser.mjs";
class Formatter {
  constructor(ast, { indentation } = { indentation: 0 }) {
    this.ast = ast;
    this.indentation = indentation;
  }
  get padding() {
    return Array(this.indentation+1).join(" ");
  };
  indent() {
    return this.indentation += 2;
  };
  dedent() {
    return this.indentation += -2;
  };
  space_for(count, max = 5) {
    let space = " ";
    if (count>max) {
      this.indentation += 2;
      space = "\n"+this.padding;
      this.indentation += -2;
    };
    return space;
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
    } else if (node instanceof StrExpr) {
      return "\""+node.value+"\"";
    } else if (node instanceof ForLoop) {
      return this.format_for_loop(node);
    } else if (node instanceof IdLookup) {
      return node.name;
    } else if (node instanceof ArrayLiteral) {
      return this.format_array_literal(node);
    } else if (node instanceof DefaultImport) {
      return this.format_default_import(node);
    } else if (node instanceof ImportStatement) {
      return this.format_import_statement(node);
    } else if (node instanceof PrefixDotLookup) {
      return "."+node.name;
    } else if (node instanceof NodePlusAssignment) {
      return this.format_node_plus_assignment(node);
    } else if (node instanceof FunctionCall) {
      return this.format_function_call(node);
    } else if (node instanceof DotAccess) {
      return this.format_dot_access(node);
    } else if (node instanceof ClassDef) {
      return this.format_class_def(node);
    } else {
      panic("Format not implemented for "+node.constructor.name);
    };
  };
  format_class_entry(entry) {
    if (entry instanceof ClassGetterExpr) {
      return "get "+entry.name+" = "+this.format_node(entry.expr);
    } else {
      panic("class entry: "+entry.constructor.name);
    };
  };
  format_class_obj_arg(node) {
    if (node instanceof ObjClassArgEntry) {
      return node.name;
    } else if (node instanceof DefaultObjClassArg) {
      return node.name+" = "+this.format_node(node.expr);
    } else {
      panic("obj arg: "+node.constructor.name);
    };
  };
  format_class_arg(arg) {
    if (arg instanceof NamedClassArg) {
      return arg.name;
    } else if (arg instanceof ObjClassArg) {
      return "{ "+arg.entries.map(this.format_class_obj_arg.bind(this)).join(", ")+" }";
    } else {
      panic("class arg: "+arg.constructor.name);
    };
  };
  format_class_def({ name, properties, entries }) {
    let c = "class "+name;
    if (properties) {
      c += "("+properties.map(this.format_class_arg.bind(this)).join(", ")+")";
    };
    c += "\n";
    this.indent();
    c += this.padding+entries.map(this.format_class_entry.bind(this)).join("\n\n"+this.padding);
    this.dedent();
    c += "\n";
    return c += "end";
  };
  format_dot_access({ lhs, property }) {
    return this.format_node(lhs)+"."+property;
  };
  format_function_call({ lhs_expr, args }) {
    let start = "";
    let separator = ", ";
    let ending = "";
    if (args.length>2) {
      this.indentation += 2;
      start = "\n"+this.padding;
      separator = ",\n"+this.padding;
      this.indentation += -2;
      ending = ",\n"+this.padding;
    };
    let args_output = start+args.map(this.format_node.bind(this)).join(separator);
    args_output += ending;
    return this.format_node(lhs_expr)+"("+args_output+")";
  };
  format_node_plus_assignment({ lhs_expr, rhs_expr }) {
    return this.format_node(lhs_expr)+" += "+this.format_node(rhs_expr);
  };
  format_for_loop({ iter_name, iterable_expr, body }) {
    let f = "for let "+iter_name+" of "+this.format_node(iterable_expr)+" do\n";
    f += this.format_body(body);
    f += this.padding+"end";
    return f;
  };
  format_import_statement({ imports, path }) {
    let space = this.space_for(imports.length);
    let i = "import {"+space+imports.join(","+space)+","+space[0]+"}";
    i += " from "+"\""+path+"\"";
    return i;
  };
  format_default_import({ name, path }) {
    return "import "+name+" from "+"\""+path+"\"";
  };
  format_array_literal({ elements }) {
    let space = this.space_for(imports.length);
    return "["+space+elements.map(this.format_node.bind(this)).join(","+space)+","+space[0]+"]";
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
      console.log(arg_node);
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

