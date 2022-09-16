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
} from "./parser.mjs";
import vm from "vm";
let eval_context = vm.createContext();

class CodeGenError extends Error {}

class CodeGen {
  prelude = `
function print(...args) {
  console.log(...args);
}
`.trimStart();

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
    } else if (expr instanceof DotAccess) {
      return this.eval_dot_access(expr);
    } else {
      throw new CodeGenError();
    }
  }

  eval_dot_access({ lhs, property }) {
    return `${this.eval_expr(lhs)}.${property}`;
  }

  eval_new_expr({ expr }) {
    return `new ${this.eval_expr(expr)}`;
  }

  eval_data_class_def({ name, properties }) {
    return `
class ${name} {
${this.padding}  constructor(${properties.join(", ")}) {
${properties
  .map((property) => `${this.padding}    this.${property} = ${property};`)
  .join("\n")}
${this.padding}  }
}`.trimStart();
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

  eval_function_call({ name, args }) {
    return `${name}(${args.map(this.eval_expr.bind(this)).join(", ")})`;
  }

  eval_num({ value }) {
    return value;
  }

  eval_let({ name, expr }) {
    return `let ${name} = ${this.eval_expr(expr)}`;
  }

  eval_return_expr({ expr }) {
    return `return ${this.eval_expr(expr)}`;
  }

  eval_function_def({ name, args, body }) {
    let f = `function ${name}(${args.join(", ")}) {\n`;
    f += new CodeGen(body, {
      indentation: this.indentation + 2,
      first_run: false,
    }).eval();
    f += "}";
    return f;
  }
}

export default CodeGen;
