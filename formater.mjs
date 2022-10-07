class Panic extends Error {}
function panic(reason) {
  throw new Panic(reason);
}
import Lexer from "./dist/lexer.mjs";
import Parser from "./dist/parser.mjs";
import fs from "fs";
import { IdLookup, NamedLet, NumExpr, FunctionCall, CommandExpr, JsOpExpr, FunctionDef, ReturnExpr, DataClassDef, NewExpr, DotAccess, ClassDef, ClassInstanceEntry, ClassGetterExpr, PrefixDotLookup, StrExpr, NotExpr, ArrayLiteral, IfStatement, NodeAssignment, NodePlusAssignment, WhileStatement, RegexNode, ContinueStatement, BreakStatement, IfBranch, ElseIfBranch, ElseBranch, PropertyLookup, ExportDefault, ExportStatement, SpreadExpr, SimpleArg, SpreadArg, ArrowFn, IsOperator, BoundFunctionDef, ForLoop, IsNotOperator, ParenExpr, LetObjectDeconstruction, RegularObjectProperty, RenamedProperty, ImportStatement, DefaultImport, LetArrDeconstruction, ArrNameEntry, ArrComma, DefaultObjClassArg, NamedClassArg, ObjClassArg, SimpleDefaultArg, ObjLit, SimpleObjEntry, ObjClassArgEntry } from "./dist/parser.mjs";
class Formatter {
  constructor(ast, { indentation, parents } = { indentation: 0, parents: [] }) {
    this.ast = ast;
    this.indentation = indentation;
    this.parents = parents;
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
  get is_in_if() {
    return this.parents.at(-1)===IfBranch||this.parents.at(-1)===ElseIfBranch||this.parents.at(-1)===ElseBranch;
  };
  format_node(node, is_last = false) {
    if (node instanceof FunctionDef) {
      return this.format_function_def(node);
    } else if (node instanceof ReturnExpr) {
      return this.format_return_expr(node, is_last&&!this.is_in_if);
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
    } else if (node instanceof IfStatement) {
      return this.format_if_statement(node);
    } else if (node instanceof NodeAssignment) {
      return this.format_node_assignment(node);
    } else if (node instanceof IsOperator) {
      return this.format_is_operator(node);
    } else if (node instanceof CommandExpr) {
      return this.format_command_expr(node);
    } else {
      panic("Format not implemented for "+node.constructor.name);
    };
  };
  format_command_expr({ name, expr }) {
    return name+" "+this.format_node(expr);
  };
  format_is_operator({ lhs, rhs }) {
    return this.format_node(lhs)+" is "+this.format_node(rhs);
  };
  format_if_branch({ test_expr, body }) {
    let i = "if "+this.format_node(test_expr)+"\n";
    i += this.format_body(body, IfBranch);
    return i;
  };
  format_else_if_branch({ test_expr, body }) {
    let i = "else if "+this.format_node(test_expr)+"\n";
    i += this.format_body(body, ElseIfBranch);
    return i;
  };
  format_else_branch({ body }) {
    return "else\n"+this.format_body(body, ElseBranch);
  };
  format_branch(branch) {
    if (branch instanceof IfBranch) {
      return this.format_if_branch(branch);
    } else if (branch instanceof ElseIfBranch) {
      return this.format_else_if_branch(branch);
    } else if (branch instanceof ElseBranch) {
      return this.format_else_branch(branch);
    } else {
      panic("not implemented if branch");
    };
  };
  format_if_statement({ branches }) {
    return branches.map(this.format_branch.bind(this)).join(this.padding)+this.padding+"end";
  };
  format_class_entry(entry) {
    if (entry instanceof ClassGetterExpr) {
      return "get "+entry.name+" = "+this.format_node(entry.expr);
    } else if (entry instanceof FunctionDef) {
      return this.format_function_def(entry);
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
  format_node_assignment({ lhs_expr, rhs_expr }) {
    return this.format_node(lhs_expr)+" = "+this.format_node(rhs_expr);
  };
  format_node_plus_assignment({ lhs_expr, rhs_expr }) {
    return this.format_node(lhs_expr)+" += "+this.format_node(rhs_expr);
  };
  format_for_loop({ iter_name, iterable_expr, body }) {
    let f = "for let "+iter_name+" of "+this.format_node(iterable_expr)+" do\n";
    f += this.format_body(body, ForLoop);
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
  format_body(body, parent, indent_by = 2) {
    return new Formatter(body, { indentation: this.indentation+indent_by, parents: this.parents.concat(parent) }).format().trimEnd()+"\n";
  };
  format_arg(arg_node) {
    if (arg_node instanceof SimpleArg) {
      return arg_node.name;
    } else if (arg_node instanceof SimpleDefaultArg) {
      return arg_node.name+" = "+this.format_node(arg_node.expr);
    } else {
      console.log(arg_node);
      panic("Arg format not implemented for "+node.constructor.name);
    };
  };
  format_function_def({ name, args, body }) {
    if (body.length>1||body[0] instanceof IfStatement) {
      let f = "def "+name;
      if (args.length>0) {
        let args_f = args.map(this.format_arg.bind(this)).join(", ");
        f += "("+args_f+")";
      };
      f += "\n";
      f += this.format_body(body, FunctionDef);
      f += this.padding+"end";
      return f;
    } else {
      return "def "+name+" = "+this.format_node(body[0], true);
    };
  };
};
let [, , file_name] = process.argv;
let str = fs.readFileSync(file_name).toString();
let tokens = new Lexer(str).tokenize();
let ast = new Parser(tokens).parse();
let output = new Formatter(ast).format();
fs.writeFileSync(file_name, output);

