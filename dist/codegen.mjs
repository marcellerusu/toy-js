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
import { IdLookup, NamedLet, NumExpr, FunctionCall, CommandExpr, JsOpExpr, FunctionDef, ReturnExpr, DataClassDef, NewExpr, DotAccess, ClassDef, ClassInstanceEntry, ClassGetterExpr, PrefixDotLookup, StrExpr, NotExpr, ArrayLiteral, IfStatement, NodeAssignment, NodePlusAssignment, WhileStatement, RegexNode, ContinueStatement, BreakStatement, IfBranch, ElseIfBranch, ElseBranch, PropertyLookup, ExportDefault, ExportStatement, SpreadExpr, SimpleArg, SpreadArg, ArrowFn, IsOperator, BoundFunctionDef, ForLoop, IsNotOperator, ParenExpr, LetObjectDeconstruction, RegularObjectProperty, RenamedProperty, ImportStatement, DefaultImport, LetArrDeconstruction, ArrNameEntry, ArrComma, DefaultObjClassArg, NamedClassArg, DefaultNamedClassArg, ObjClassArg, SimpleDefaultArg, ObjLit, SimpleObjEntry, PrefixBindLookup, TypeDef } from "./parser.mjs";
import vm from "vm";
let eval_context = vm.createContext();
class CodeGen {
  constructor(ast, { first_run, indentation } = { first_run: true, indentation: 0 }) {
    this.ast = ast;
    this.first_run = first_run;
    this.indentation = indentation;
  }
  prelude = "class Panic extends Error {}\n" + "function panic(reason) {\n" + "  throw new Panic(reason);\n" + "}\n" + "Array.prototype.sum = function() {\n" + "  let sum = 0;\n" + "  for (let item of this) {\n" + "    sum += item;\n" + "  }\n" + "  return sum;\n" + "};\n" + "Array.prototype.zip = function(other) {\n" + "  let zipped = [];\n" + "  for (let i = 0; i < this.length; i++) {\n" + "    zipped.push([this[i], other[i]]);\n" + "  }\n" + "  return zipped;\n" + "};\n" + "Array.prototype.uniq_by = function(predicate) {\n" + "  return this.filter((x, i) => i === this.findIndex(y => predicate(x, y)))\n" + "};\n" + "Array.prototype.join_by = function(merge_fn) {\n" + "  let merged = this[0];\n" + "  for (let item of this.slice(1)) {\n" + "    merged = merge_fn(merged, item);\n" + "  }\n" + "  return merged;\n" + "};\n";
  js = "";
  get padding() {
    return new Array(this.indentation + 1).join(" ");
  };
  eval() {
    if (this.first_run) {
      this.js = this.prelude;
    } else {
      this.js = "";
    };
    for (let statement of this.ast) {
      if (statement instanceof TypeDef) {
        continue;
      };
      this.js += this.padding;
      let statement_js = this.eval_statement(statement);
      if (!statement_js) {
        this.js += this.eval_expr(statement);
      } else {
        this.js += statement_js;
      };
      this.js += ";\n";
    };
    return this.js;
  };
  eval_statement(statement) {
    if (statement instanceof NamedLet) {
      return this.eval_let(statement);
    } else if (statement instanceof FunctionCall) {
      return this.eval_function_call(statement);
    } else if (statement instanceof FunctionDef) {
      return this.eval_function_def(statement);
    } else if (statement instanceof BoundFunctionDef) {
      return this.eval_bound_function_def(statement);
    } else if (statement instanceof ReturnExpr) {
      return this.eval_return_expr(statement);
    } else if (statement instanceof DataClassDef) {
      return this.eval_data_class_def(statement);
    } else if (statement instanceof ClassDef) {
      return this.eval_class_def(statement);
    } else if (statement instanceof IfStatement) {
      return this.eval_if_statement(statement);
    } else if (statement instanceof NodeAssignment) {
      return this.eval_node_assignment(statement);
    } else if (statement instanceof WhileStatement) {
      return this.eval_while_statement(statement);
    } else if (statement instanceof ContinueStatement) {
      return this.eval_continue();
    } else if (statement instanceof BreakStatement) {
      return this.eval_break();
    } else if (statement instanceof ExportDefault) {
      return this.eval_export_default(statement);
    } else if (statement instanceof ExportStatement) {
      return this.eval_export_statement(statement);
    } else if (statement instanceof ForLoop) {
      return this.eval_for_loop(statement);
    } else if (statement instanceof LetObjectDeconstruction) {
      return this.eval_let_object_deconstruction(statement);
    } else if (statement instanceof ImportStatement) {
      return this.eval_import_statement(statement);
    } else if (statement instanceof DefaultImport) {
      return this.eval_default_import(statement);
    } else if (statement instanceof LetArrDeconstruction) {
      return this.eval_let_arr_deconstruction(statement);
    };
  };
  eval_expr(expr) {
    if (expr instanceof NumExpr) {
      return this.eval_num(expr);
    } else if (expr instanceof RegexNode) {
      return this.eval_regex_node(expr);
    } else if (expr instanceof StrExpr) {
      return this.eval_str(expr);
    } else if (expr instanceof IdLookup) {
      return this.eval_id_lookup(expr);
    } else if (expr instanceof FunctionCall) {
      return this.eval_function_call(expr);
    } else if (expr instanceof CommandExpr) {
      return this.eval_command_expr(expr);
    } else if (expr instanceof JsOpExpr) {
      return this.eval_js_op_expr(expr);
    } else if (expr instanceof NewExpr) {
      return this.eval_new_expr(expr);
    } else if (expr instanceof NotExpr) {
      return this.eval_not_expr(expr);
    } else if (expr instanceof DotAccess) {
      return this.eval_dot_access(expr);
    } else if (expr instanceof PrefixDotLookup) {
      return this.eval_prefix_dot_lookup(expr);
    } else if (expr instanceof PrefixBindLookup) {
      return this.eval_prefix_bind_lookup(expr);
    } else if (expr instanceof ArrayLiteral) {
      return this.eval_array_literal(expr);
    } else if (expr instanceof ObjLit) {
      return this.eval_obj_lit(expr);
    } else if (expr instanceof PropertyLookup) {
      return this.eval_property_lookup(expr);
    } else if (expr instanceof SpreadExpr) {
      return this.eval_spread_expr(expr);
    } else if (expr instanceof ArrowFn) {
      return this.eval_arrow_fn(expr);
    } else if (expr instanceof IsOperator) {
      return this.eval_is_operator(expr);
    } else if (expr instanceof IsNotOperator) {
      return this.eval_is_not_operator(expr);
    } else if (expr instanceof ParenExpr) {
      return this.eval_paren_expr(expr);
    } else if (expr instanceof NodePlusAssignment) {
      return this.eval_node_plus_assignment(expr);
    } else {
      console.log(expr);
      panic("no expr");
    };
  };
  eval_let_arr_deconstruction({ entries, rhs }) {
    let l = "let [";
    for (let entry of entries) {
      if (entry instanceof ArrComma) {
        l += ", ";
      } else if (entry instanceof ArrNameEntry) {
        l += entry.name;
      } else if (entry instanceof Array) {
        l += this.eval_object_deconstruction(entry);
      } else {
        console.error(entry);
        panic("not valid array deconstruction property");
      };
    };
    l += "] = " + this.eval_expr(rhs);
    return l;
  };
  replace_relative(path) {
    if (path.startsWith("./")) {
      return path + ".mjs";
    } else {
      return path;
    };
  };
  eval_default_import({ name, path }) {
    return "import " + name + " from " + "\"" + this.replace_relative(path) + "\"";
  };
  eval_import_statement({ imports, path }) {
    return "import { " + imports.join(", ") + " } from " + "\"" + this.replace_relative(path) + "\"";
  };
  eval_object_deconstruction(entries) {
    let js_entries = entries.map((entry) => {
    if (entry instanceof RegularObjectProperty) {
      return entry.name;
    } else if (entry instanceof RenamedProperty) {
      return entry.old_name + ": " + entry.new_name;
    }
    }).join(",");
    return "{ " + js_entries + " }";
  };
  eval_let_object_deconstruction({ entries, rhs }) {
    return "let " + this.eval_object_deconstruction(entries) + " = " + this.eval_expr(rhs);
  };
  eval_paren_expr({ expr }) {
    return "(" + this.eval_expr(expr) + ")";
  };
  eval_for_loop({ iter_name, iterable_expr, body }) {
    let f = "for (let " + iter_name + " of " + this.eval_expr(iterable_expr) + ") {\n";
    f += this.eval_body(body);
    f += this.padding + "}";
    return f;
  };
  eval_is_operator({ lhs, rhs }) {
    return this.eval_expr(lhs) + " instanceof " + this.eval_expr(rhs);
  };
  eval_is_not_operator({ lhs, rhs }) {
    return "!(" + this.eval_expr(lhs) + " instanceof " + this.eval_expr(rhs) + ")";
  };
  eval_arrow_fn({ arg_name, return_expr }) {
    if (return_expr instanceof IfStatement) {
      return_expr.branches = return_expr.branches.map((branch) => {
      if (branch.body.at(-1) instanceof ReturnExpr) {
        return branch;
      } else {
        branch.body = [...branch.body.slice(0, -1), new ReturnExpr(branch.body[branch.body.length - 1])];
        return branch;
      }
      });
      let a = "(" + arg_name + ") => {\n";
      a += this.padding + this.eval_if_statement(return_expr) + "\n";
      a += this.padding + "}";
      return a;
    } else {
      return "(" + arg_name + ") => " + this.eval_expr(return_expr);
    };
  };
  eval_spread_expr({ expr }) {
    return "..." + this.eval_expr(expr);
  };
  eval_export_default({ expr }) {
    return "export default " + this.eval_expr(expr);
  };
  eval_export_statement({ statement }) {
    return "export " + this.eval_statement(statement);
  };
  eval_property_lookup({ lhs, property }) {
    return this.eval_expr(lhs) + "[" + this.eval_expr(property) + "]";
  };
  eval_continue() {
    return "continue";
  };
  eval_break() {
    return "break";
  };
  eval_while_statement({ test_expr, body }) {
    let w = "while (" + this.eval_expr(test_expr) + ") {\n";
    w += this.eval_body(body);
    w += this.padding + "}";
    return w;
  };
  eval_node_plus_assignment({ lhs_expr, rhs_expr }) {
    let lhs = this.eval_expr(lhs_expr);
    let rhs = this.eval_expr(rhs_expr);
    return lhs + " += " + rhs;
  };
  eval_node_assignment({ lhs_expr, rhs_expr }) {
    let lhs = this.eval_expr(lhs_expr);
    let rhs = this.eval_expr(rhs_expr);
    return lhs + " = " + rhs;
  };
  eval_body(body, indent_by = 2) {
    return new CodeGen(body, { indentation: this.indentation + indent_by, first_run: false }).eval().trimEnd() + "\n";
  };
  eval_if_statement({ branches }) {
    let _if = "";
    for (let branch of branches) {
      if (branch instanceof IfBranch) {
        _if += "if (" + this.eval_expr(branch.test_expr) + ") {\n";
        _if += this.eval_body(branch.body);
        _if += this.padding + "}";
      } else if (branch instanceof ElseIfBranch) {
        _if += " else if (" + this.eval_expr(branch.test_expr) + ") {\n";
        _if += this.eval_body(branch.body);
        _if += this.padding + "}";
      } else if (branch instanceof ElseBranch) {
        _if += " else {\n";
        _if += this.eval_body(branch.body);
        _if += this.padding + "}";
      };
    };
    return _if;
  };
  eval_array_literal({ elements }) {
    return "[" + elements.map(this.eval_expr.bind(this)).join(", ") + "]";
  };
  eval_obj_lit({ entries }) {
    let l = "{ ";
    l += entries.map((entry) => {
    if (entry instanceof SimpleObjEntry) {
      return entry.name + ": " + this.eval_expr(entry.expr);
    } else {
      return panic("invalid obj entry");
    }
    }).join(", ");
    l += " }";
    return l;
  };
  eval_prefix_bind_lookup({ name }) {
    return "this." + name + ".bind(this)";
  };
  eval_prefix_dot_lookup({ name }) {
    return "this." + name;
  };
  eval_obj_class_arg({ entries }) {
    let entries_js = entries.map((entry) => entry.name).join(", ");
    if (entries.some((entry) => entry instanceof DefaultObjClassArg)) {
      let default_js = entries.filter((entry) => entry instanceof DefaultObjClassArg).map((entry) => entry.name + ": " + this.eval_expr(entry.expr)).join(", ");
      return "{ " + entries_js + " } = { " + default_js + " }";
    } else {
      return "{ " + entries_js + " }";
    };
  };
  eval_implicit_constructor_helper(properties) {
    let args = properties.map((arg) => {
    if (arg instanceof NamedClassArg) {
      return arg.name;
    } else if (arg instanceof DefaultNamedClassArg) {
      return arg.name + " = " + this.eval_expr(arg.expr);
    } else if (arg instanceof ObjClassArg) {
      return this.eval_obj_class_arg(arg);
    }
    }).join(", ");
    let c = this.padding + "  constructor(" + args + ") {\n";
    c += properties.flatMap((property) => {
    if (property.entries) {
      return property.entries.map((entry) => entry.name);
    } else if (property instanceof NamedClassArg || property instanceof DefaultNamedClassArg) {
      return property.name;
    } else {
      return property;
    }
    }).map((property) => this.padding + "    this." + property + " = " + property + ";").join("\n") + "\n";
    c += this.padding + "  }\n";
    return c;
  };
  eval_class_instance_entry({ name, expr }) {
    return this.padding + "  " + name + " = " + this.eval_expr(expr);
  };
  eval_class_getter_expr({ name, expr }) {
    let g = this.padding + "  get " + name + "() {\n";
    g += this.padding + "    return " + this.eval_expr(expr) + ";\n";
    g += this.padding + "  }";
    return g;
  };
  eval_method({ name, args, body }) {
    let js_args = args.map(this.eval_function_arg.bind(this)).join(", ");
    let f = "  " + name + "(" + js_args + ") {\n";
    f += this.eval_body(body, 4);
    f += this.padding + "  }";
    return f;
  };
  eval_class_entry(entry) {
    if (entry instanceof ClassInstanceEntry) {
      return this.eval_class_instance_entry(entry);
    } else if (entry instanceof ClassGetterExpr) {
      return this.eval_class_getter_expr(entry);
    } else if (entry instanceof FunctionDef) {
      return this.eval_method(entry);
    } else {
      panic("not supported class entry - " + entry + " | " + typeof(entry));
    };
  };
  eval_class_def({ name, properties, entries }) {
    let c = "class " + name + " {\n";
    if (properties) {
      c += this.eval_implicit_constructor_helper(properties);
    };
    for (let entry of entries) {
      c += this.eval_class_entry(entry) + ";\n";
    };
    c += "}";
    return c;
  };
  eval_dot_access({ lhs, property }) {
    return this.eval_expr(lhs) + "." + property;
  };
  eval_new_expr({ expr }) {
    return "new " + this.eval_expr(expr);
  };
  eval_not_expr({ expr }) {
    return "!" + this.eval_expr(expr);
  };
  eval_empty_data_class_def(name) {
    return "class " + name + " {}";
  };
  eval_data_class_def({ name, properties }) {
    if (!properties) {
      return this.eval_empty_data_class_def(name);
    };
    let c = "class " + name + " {\n";
    c += this.eval_implicit_constructor_helper(properties);
    c += this.padding + "}";
    return c;
  };
  convert_js_op_type(type) {
    if (type === "++") {
      return "+";
    };
    return type;
  };
  eval_js_op_expr({ lhs, type, rhs }) {
    return this.eval_expr(lhs) + " " + this.convert_js_op_type(type) + " " + this.eval_expr(rhs);
  };
  eval_command_expr({ name, expr }) {
    if (name === "comptime!") {
      let result = this.eval_expr(expr);
      return vm.runInContext(this.js + result, eval_context);
    } else if (name === "assert_not_reached!") {
      let rhs = this.eval_expr(expr);
      return "panic(" + rhs + ")";
    } else if (name === "panic!") {
      return "panic('break')";
    } else if (name === "assert!") {
      let rhs = this.eval_expr(expr);
      return "if (!(" + rhs + ")) panic(`assertion failed: " + rhs + "`);";
    } else {
      panic("not known command: " + name);
    };
  };
  eval_function_call({ lhs_expr, args }) {
    let js_args = args.map(this.eval_expr.bind(this)).join(", ");
    return this.eval_expr(lhs_expr) + "(" + js_args + ")";
  };
  eval_num({ value, is_negative }) {
    if (is_negative) {
      return "-" + value;
    };
    return value;
  };
  eval_id_lookup({ name }) {
    return name;
  };
  eval_regex_node({ value }) {
    return value;
  };
  eval_str({ value }) {
    return "\"" + value + "\"";
  };
  eval_let({ name, expr }) {
    return "let " + name + " = " + this.eval_expr(expr);
  };
  eval_return_expr({ expr }) {
    return "return " + this.eval_expr(expr);
  };
  eval_function_arg(node) {
    if (node instanceof SimpleArg) {
      return node.name;
    } else if (node instanceof SpreadArg) {
      return "..." + node.name;
    } else if (node instanceof SimpleDefaultArg) {
      return node.name + " = " + this.eval_expr(node.expr);
    } else if (node instanceof ObjClassArg) {
      return this.eval_obj_class_arg(node);
    } else {
      console.log(node);
      panic("not support arg");
    };
  };
  eval_bound_function_def({ name, args, body }) {
    let js_args = args.map(this.eval_function_arg.bind(this)).join(", ");
    let f = "let " + name + " = (" + js_args + ") => {\n";
    f += this.eval_body(body);
    f += this.padding + "}";
    return f;
  };
  eval_function_def({ name, args, body }) {
    let js_args = args.map(this.eval_function_arg.bind(this)).join(", ");
    let f = "function " + name + "(" + js_args + ") {\n";
    f += this.eval_body(body);
    f += this.padding + "}";
    return f;
  };
};
export default CodeGen;

