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
import Lexer from "./lexer.mjs";
import Parser from "./parser.mjs";
import fs from "fs";
import { IdLookup, NamedLet, NumExpr, FunctionCall, CommandExpr, JsOpExpr, FunctionDef, ReturnExpr, DataClassDef, NewExpr, DotAccess, ClassDef, ClassInstanceEntry, ClassGetterExpr, PrefixDotLookup, StrExpr, NotExpr, ArrayLiteral, IfStatement, NodeAssignment, NodePlusAssignment, WhileStatement, RegexNode, ContinueStatement, BreakStatement, IfBranch, PrefixBindLookup, ElseIfBranch, ElseBranch, PropertyLookup, ExportDefault, ExportStatement, SpreadExpr, SimpleArg, SpreadArg, ArrowFn, IsOperator, BoundFunctionDef, ForLoop, IsNotOperator, ParenExpr, LetObjectDeconstruction, RegularObjectProperty, RenamedProperty, ImportStatement, DefaultImport, LetArrDeconstruction, ArrNameEntry, ArrComma, DefaultObjClassArg, NamedClassArg, ObjClassArg, SimpleDefaultArg, ObjLit, SimpleObjEntry, ObjClassArgEntry } from "./parser.mjs";
class Formatter {
  constructor(ast, { indentation, parents } = { indentation: 0, parents: [] }) {
    this.ast = ast;
    this.indentation = indentation;
    this.parents = parents;
  }
  get padding() {
    return Array(this.indentation + 1).join(" ");
  };
  indent() {
    return this.indentation += 2;
  };
  dedent() {
    return this.indentation += -2;
  };
  space_for(count, max = 5) {
    let space = " ";
    if (count > max) {
      this.indentation += 2;
      space = "\n" + this.padding;
      this.indentation += -2;
    };
    return space;
  };
  format() {
    let output = "";
    let i = 0;
    for (let node of this.ast) {
      output += this.padding;
      output += this.format_node(node, i === this.ast.length - 1);
      output += "\n";
      i += 1;
    };
    return output;
  };
  get is_in_if() {
    return this.parents.at(-1) === IfBranch || this.parents.at(-1) === ElseIfBranch || this.parents.at(-1) === ElseBranch;
  };
  format_node(node, is_last = false) {
    if (node instanceof FunctionDef) {
      return this.format_function_def(node);
    } else if (node instanceof ReturnExpr) {
      return this.format_return_expr(node, is_last && !this.is_in_if);
    } else if (node instanceof NumExpr) {
      return this.format_num_expr(node);
    } else if (node instanceof NamedLet) {
      return this.format_named_let(node);
    } else if (node instanceof JsOpExpr) {
      return this.format_js_op_expr(node);
    } else if (node instanceof StrExpr) {
      return "\"" + node.value + "\"";
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
      return "." + node.name;
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
    } else if (node instanceof PrefixBindLookup) {
      return this.format_prefix_bind_lookup(node);
    } else if (node instanceof PropertyLookup) {
      return this.format_property_lookup(node);
    } else if (node instanceof NewExpr) {
      return this.format_new_expr(node);
    } else if (node instanceof ObjLit) {
      return this.format_obj_lit(node);
    } else if (node instanceof NotExpr) {
      return "!" + this.format_node(node.expr);
    } else if (node instanceof ArrowFn) {
      return this.format_arrow_fn(node);
    } else if (node instanceof LetArrDeconstruction) {
      return this.format_let_arr_deconstruction(node);
    } else if (node instanceof LetObjectDeconstruction) {
      return this.format_let_object_deconstruction(node);
    } else {
      panic("Format not implemented for " + node.constructor.name);
    };
  };
  format_arrow_fn({ arg_name, return_expr }) {
    return arg_name + " => " + this.format_node(return_expr);
  };
  format_let_arr_entry(entry) {
    if (entry instanceof ArrComma) {
      return "";
    } else if (entry instanceof ArrNameEntry) {
      return entry.name;
    } else {
      panic("Let arr unknown " + entry.constructor.name);
    };
  };
  format_let_arr_deconstruction({ entries, rhs }) {
    return "let [" + entries.map(this.format_let_arr_entry.bind(this)).join(", ") + "] = " + this.format_node(rhs);
  };
  format_let_object_entry(entry) {
    if (entry instanceof RegularObjectProperty) {
      return entry.name;
    } else if (entry instanceof RenamedProperty) {
      return entry.old_name + ": " + entry.new_name;
    } else {
      panic("Let arr unknown " + entry.constructor.name);
    };
  };
  format_let_object_deconstruction({ entries, rhs }) {
    return "let { " + entries.map(this.format_let_object_entry.bind(this)).join(", ") + " } = " + this.format_node(rhs);
  };
  format_obj_lit_entry(entry) {
    if (entry instanceof SimpleObjEntry) {
      return entry.name + ": " + this.format_node(entry.expr);
    } else {
      panic("Object literal entry not found " + entry.constructor.name);
    };
  };
  format_obj_lit({ entries }) {
    let entries_js = entries.map(this.format_obj_lit_entry.bind(this));
    if (entries_js.map((x) => x.length).sum() > 35) {
      this.indent();
      let obj_lit = "{\n" + this.padding + entries.map(this.format_obj_lit_entry.bind(this)).join(",\n" + this.padding) + ",\n";
      this.dedent();
      return obj_lit + this.padding + "}";
    } else {
      return "{ " + entries_js.join(", ") + " }";
    };
  };
  format_new_expr({ expr }) {
    return "new " + this.format_node(expr);
  };
  format_property_lookup({ lhs, property }) {
    return this.format_node(lhs) + "[" + this.format_node(property) + "]";
  };
  format_prefix_bind_lookup({ name }) {
    return "::" + name;
  };
  format_command_expr({ name, expr }) {
    return name + " " + this.format_node(expr);
  };
  format_is_operator({ lhs, rhs }) {
    return this.format_node(lhs) + " is " + this.format_node(rhs);
  };
  format_if_branch({ test_expr, body }) {
    let i = "if " + this.format_node(test_expr) + "\n";
    i += this.format_body(body, IfBranch);
    return i;
  };
  format_else_if_branch({ test_expr, body }) {
    let i = "else if " + this.format_node(test_expr) + "\n";
    i += this.format_body(body, ElseIfBranch);
    return i;
  };
  format_else_branch({ body }) {
    return "else\n" + this.format_body(body, ElseBranch);
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
  is_one_line_return(body) {
    return body.length === 1 && body[0] instanceof ReturnExpr;
  };
  is_early_return(branches) {
    return branches.length === 1 && branches[0] instanceof IfBranch && this.is_one_line_return(branches[0].body);
  };
  format_if_statement({ branches }) {
    if (this.is_early_return(branches)) {
      let { test_expr,body } = branches[0];
      return this.format_node(body[0]) + " if " + this.format_node(test_expr);
    } else {
      return branches.map(this.format_branch.bind(this)).join(this.padding) + this.padding + "end";
    };
  };
  format_class_entry(entry) {
    if (entry instanceof ClassGetterExpr) {
      return "get " + entry.name + " = " + this.format_node(entry.expr);
    } else if (entry instanceof FunctionDef) {
      return this.format_function_def(entry);
    } else {
      panic("class entry: " + entry.constructor.name);
    };
  };
  format_class_obj_arg(node) {
    if (node instanceof ObjClassArgEntry) {
      return node.name;
    } else if (node instanceof DefaultObjClassArg) {
      return node.name + " = " + this.format_node(node.expr);
    } else {
      panic("obj arg: " + node.constructor.name);
    };
  };
  format_class_arg(arg) {
    if (arg instanceof NamedClassArg) {
      return arg.name;
    } else if (arg instanceof ObjClassArg) {
      return "{ " + arg.entries.map(this.format_class_obj_arg.bind(this)).join(", ") + " }";
    } else {
      panic("class arg: " + arg.constructor.name);
    };
  };
  format_class_def({ name, properties, entries }) {
    let c = "class " + name;
    if (properties) {
      c += "(" + properties.map(this.format_class_arg.bind(this)).join(", ") + ")";
    };
    c += "\n";
    this.indent();
    c += this.padding + entries.map(this.format_class_entry.bind(this)).join("\n\n" + this.padding);
    this.dedent();
    c += "\n";
    return c += "end";
  };
  format_dot_access({ lhs, property }) {
    return this.format_node(lhs) + "." + property;
  };
  format_function_call({ lhs_expr, args }) {
    let start = "";
    let separator = ", ";
    let ending = "";
    if (args.length > 2) {
      this.indentation += 2;
      start = "\n" + this.padding;
      separator = ",\n" + this.padding;
      this.indentation += -2;
      ending = ",\n" + this.padding;
    };
    let args_output = start + args.map(this.format_node.bind(this)).join(separator);
    args_output += ending;
    return this.format_node(lhs_expr) + "(" + args_output + ")";
  };
  format_node_assignment({ lhs_expr, rhs_expr }) {
    return this.format_node(lhs_expr) + " = " + this.format_node(rhs_expr);
  };
  format_node_plus_assignment({ lhs_expr, rhs_expr }) {
    return this.format_node(lhs_expr) + " += " + this.format_node(rhs_expr);
  };
  format_for_loop({ iter_name, iterable_expr, body }) {
    let f = "for let " + iter_name + " of " + this.format_node(iterable_expr) + " do\n";
    f += this.format_body(body, ForLoop);
    f += this.padding + "end";
    return f;
  };
  format_import_statement({ imports, path }) {
    let space = this.space_for(imports.length);
    let i = "import {" + space + imports.join("," + space) + "," + space[0] + "}";
    i += " from " + "\"" + path + "\"";
    return i;
  };
  format_default_import({ name, path }) {
    return "import " + name + " from " + "\"" + path + "\"";
  };
  format_array_literal({ elements }) {
    if (elements.length === 0) {
      return "[]";
    };
    let space = this.space_for(elements.length);
    return "[" + space + elements.map(this.format_node.bind(this)).join("," + space) + "," + space[0] + "]";
  };
  format_js_op_expr({ lhs, type, rhs }) {
    return this.format_node(lhs) + " " + type + " " + this.format_node(rhs);
  };
  format_named_let({ name, expr }) {
    return "let " + name + " = " + this.format_node(expr);
  };
  format_num_expr({ value }) {
    return value;
  };
  format_return_expr({ expr }, is_last) {
    if (is_last) {
      return this.format_node(expr);
    };
    return "return " + this.format_node(expr);
  };
  format_body(body, parent, indent_by = 2) {
    return new Formatter(body, { indentation: this.indentation + indent_by, parents: this.parents.concat(parent) }).format().trimEnd() + "\n";
  };
  format_arg(arg_node) {
    if (arg_node instanceof SimpleArg) {
      return arg_node.name;
    } else if (arg_node instanceof SimpleDefaultArg) {
      return arg_node.name + " = " + this.format_node(arg_node.expr);
    } else if (arg_node instanceof ObjClassArg) {
      return this.format_class_arg(arg_node);
    } else {
      console.log(arg_node);
      panic("Arg format not implemented for " + node.constructor.name);
    };
  };
  too_long_for_one_liner(expr) {
    if (!expr) {
      return false;
    };
    let str = this.format_node(expr);
    return str.includes("\n") || str.length > 50;
  };
  format_function_def({ name, args, body }) {
    if (body.length > 1 || body[0] instanceof IfStatement || this.too_long_for_one_liner(body[0])) {
      let f = "def " + name;
      if (args.length > 0) {
        let args_f = args.map(this.format_arg.bind(this)).join(", ");
        f += "(" + args_f + ")";
      };
      f += "\n";
      f += this.format_body(body, FunctionDef);
      f += this.padding + "end";
      return f;
    } else {
      return "def " + name + "(" + args.map(this.format_arg.bind(this)).join(", ") + ") = " + this.format_node(body[0], true);
    };
  };
};
let [, , file_name] = process.argv;
let str = fs.readFileSync(file_name).toString();
let tokens = new Lexer(str).tokenize();
let ast = new Parser(tokens).parse();
let output = new Formatter(ast).format();
fs.writeFileSync(file_name, output);

