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
} from "./parser.mjs";
import vm from "vm";

let eval_context = vm.createContext();

class CodeGenError extends Error {}

class CodeGen {
  prelude = ``;

  js = "";
  constructor(
    ast,
    { first_run, indentation } = { first_run: true, indentation: 0 }
  ) {
    this.ast = ast;
    this.first_run = first_run;
    this.indentation = indentation;
  }

  get padding() {
    let str = "";
    for (let i = 0; i < this.indentation; i++) {
      str += " ";
    }
    return str;
  }

  eval() {
    if (this.first_run) {
      this.js = this.prelude;
    } else {
      this.js = "";
    }

    for (let statement of this.ast) {
      this.js += this.padding;
      if (statement instanceof NamedLet) {
        this.js += this.eval_let(statement);
      } else if (statement instanceof FunctionCall) {
        this.js += this.eval_function_call(statement);
      } else if (statement instanceof FunctionDef) {
        this.js += this.eval_function_def(statement);
      } else if (statement instanceof ReturnExpr) {
        this.js += this.eval_return_expr(statement);
      } else if (statement instanceof DataClassDef) {
        this.js += this.eval_data_class_def(statement);
      } else if (statement instanceof ClassDef) {
        this.js += this.eval_class_def(statement);
      } else if (statement instanceof IfStatement) {
        this.js += this.eval_if_statement(statement);
      } else if (statement instanceof NodeAssignment) {
        this.js += this.eval_node_assignment(statement);
      } else if (statement instanceof NodePlusAssignment) {
        this.js += this.eval_node_plus_assignment(statement);
      } else if (statement instanceof WhileStatement) {
        this.js += this.eval_while_statement(statement);
      } else if (statement instanceof ContinueStatement) {
        this.js += this.eval_continue();
      } else if (statement instanceof BreakStatement) {
        this.js += this.eval_break();
      } else {
        this.js += this.eval_expr(statement);
      }
      this.js += ";\n";
    }
    return this.js;
  }

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
    } else if (expr instanceof ArrayLiteral) {
      return this.eval_array_literal(expr);
    } else if (expr instanceof PropertyLookup) {
      return this.eval_property_lookup(expr);
    } else {
      throw new CodeGenError();
    }
  }

  eval_property_lookup({ lhs, property }) {
    return `${this.eval_expr(lhs)}[${this.eval_expr(property)}]`;
  }

  eval_continue() {
    return "continue";
  }

  eval_break() {
    return "break";
  }

  eval_while_statement({ test_expr, body }) {
    let w = `while (${this.eval_expr(test_expr)}) {\n`;
    w += this.eval_body(body);
    w += `${this.padding}}`;
    return w;
  }

  eval_node_plus_assignment({ lhs_expr, rhs_expr }) {
    let lhs = this.eval_expr(lhs_expr),
      rhs = this.eval_expr(rhs_expr);
    return `${lhs} += ${rhs}`;
  }

  eval_node_assignment({ lhs_expr, rhs_expr }) {
    let lhs = this.eval_expr(lhs_expr),
      rhs = this.eval_expr(rhs_expr);
    return `${lhs} = ${rhs}`;
  }

  eval_body(body, indent_by = 2) {
    return (
      new CodeGen(body, {
        indentation: this.indentation + indent_by,
        first_run: false,
      })
        .eval()
        .trimEnd() + "\n"
    );
  }

  eval_if_statement({ branches }) {
    let _if = "";
    for (let branch of branches) {
      if (branch instanceof IfBranch) {
        _if += `if (${this.eval_expr(branch.test_expr)}) {\n`;
        _if += this.eval_body(branch.body);
        _if += `${this.padding}}`;
      } else if (branch instanceof ElseIfBranch) {
        _if += ` else if (${this.eval_expr(branch.test_expr)}) {\n`;
        _if += this.eval_body(branch.body);
        _if += `${this.padding}}`;
      } else if (branch instanceof ElseBranch) {
        _if += ` else {\n`;
        _if += this.eval_body(branch.body);
        _if += `${this.padding}}`;
      }
    }
    return _if;
  }

  eval_array_literal({ elements }) {
    return `[${elements.map(this.eval_expr.bind(this)).join(", ")}]`;
  }

  eval_prefix_dot_lookup({ name }) {
    return `this.${name}`;
  }

  eval_implicit_constructor_helper(properties) {
    let c = `${this.padding}  constructor(${properties.join(", ")}) {\n`;
    c +=
      properties
        .map((property) => `${this.padding}    this.${property} = ${property};`)
        .join("\n") + "\n";
    c += `${this.padding}  }\n`;
    return c;
  }

  eval_class_instance_entry({ name, expr }) {
    return `${this.padding}  ${name} = ${this.eval_expr(expr)}`;
  }

  eval_class_getter_expr({ name, expr }) {
    let g = `${this.padding}  get ${name}() {\n`;
    g += `${this.padding}    return ${this.eval_expr(expr)};\n`;
    g += `${this.padding}  }`;
    return g;
  }

  eval_method({ name, args, body }) {
    let f = `  ${name}(${args.join(", ")}) {\n`;
    f += this.eval_body(body, 4);
    f += `${this.padding}  }`;
    return f;
  }

  eval_class_entry(entry) {
    if (entry instanceof ClassInstanceEntry) {
      return this.eval_class_instance_entry(entry);
    } else if (entry instanceof ClassGetterExpr) {
      return this.eval_class_getter_expr(entry);
    } else if (entry instanceof FunctionDef) {
      return this.eval_method(entry);
    } else {
      throw new CodeGenError(
        `not supported class entry - ${entry} | ${typeof entry}`
      );
    }
  }

  eval_class_def({ name, properties, entries }) {
    let c = `class ${name} {\n`;
    if (properties) {
      c += this.eval_implicit_constructor_helper(properties);
    }
    for (let entry of entries) {
      c += this.eval_class_entry(entry) + ";\n";
    }
    c += "}";
    return c;
  }

  eval_dot_access({ lhs, property }) {
    return `${this.eval_expr(lhs)}.${property}`;
  }

  eval_new_expr({ expr }) {
    return `new ${this.eval_expr(expr)}`;
  }

  eval_not_expr({ expr }) {
    return `!${this.eval_expr(expr)}`;
  }

  eval_empty_data_class_def(name) {
    return `class ${name} {}`;
  }

  eval_data_class_def({ name, properties }) {
    if (!properties) return this.eval_empty_data_class_def(name);
    let c = `class ${name} {\n`;
    c += this.eval_implicit_constructor_helper(properties);
    c += `${this.padding}}`;
    return c;
  }

  eval_js_op_expr({ lhs, type, rhs }) {
    return `${this.eval_expr(lhs)} ${type} ${this.eval_expr(rhs)}`;
  }

  eval_command_expr({ name, expr }) {
    if (name !== "comptime!") throw new CodeGenError();
    let result = this.eval_expr(expr);
    return vm.runInContext(this.js + result, eval_context);
  }

  eval_id_lookup({ name }) {
    return name;
  }

  eval_function_call({ lhs_expr, args }) {
    let js_args = args.map(this.eval_expr.bind(this)).join(", ");
    return `${this.eval_expr(lhs_expr)}(${js_args})`;
  }

  eval_num({ value }) {
    return value;
  }

  eval_regex_node({ value }) {
    return value;
  }

  eval_str({ value }) {
    return `"${value}"`;
  }

  eval_let({ name, expr }) {
    return `let ${name} = ${this.eval_expr(expr)}`;
  }

  eval_return_expr({ expr }) {
    return `return ${this.eval_expr(expr)}`;
  }

  eval_function_def({ name, args, body }) {
    let f = `function ${name}(${args.join(", ")}) {\n`;
    f += this.eval_body(body);
    f += "}";
    return f;
  }
}

export default CodeGen;
