import {
  IdLookup,
  NamedLet,
  NumExpr,
  FunctionCall,
  CommandExpr,
  JsOpExpr,
} from "./parser.mjs";
import vm from "vm";
let eval_context = vm.createContext();

class CodeGenError extends Error {}

class CodeGen {
  prelude = `
function print(...args) {
  console.log(...args);
}
function add(a, b) {
  return a + b;
}
`.trimStart();

  js = "";
  constructor(ast) {
    this.ast = ast;
  }

  eval() {
    this.js = this.prelude;
    for (let statement of this.ast) {
      if (statement instanceof NamedLet) {
        this.js += this.eval_let(statement);
      } else if (statement instanceof FunctionCall) {
        this.js += this.eval_function_call(statement);
      } else {
        console.log(statement);
        throw new CodeGenError();
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
    } else {
      throw new CodeGenError();
    }
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
}

export default CodeGen;
