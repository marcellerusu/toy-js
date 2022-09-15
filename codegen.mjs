import { IdLookup, NamedLet, NumExpr, FunctionCall } from "./parser.mjs";

class CodeGenError extends Error {}

// [ NamedLet { name: 'a', expr: NumExpr { value: 10 } } ]
// [ FunctionCall { name: 'print', args: [ [IdLookup] ] } ]
class CodeGen {
  prelude = `
function print(...args) {
  console.log(...args);
}
`.trimStart();

  constructor(ast) {
    this.ast = ast;
  }

  eval() {
    let js = this.prelude;
    for (let statement of this.ast) {
      if (statement instanceof NamedLet) {
        js += this.eval_let(statement);
      } else if (statement instanceof FunctionCall) {
        js += this.eval_function_call(statement);
      } else {
        console.log(statement);
        throw new CodeGenError();
      }
      js += ";\n";
    }
    return js;
  }

  eval_expr(expr) {
    if (expr instanceof NumExpr) {
      return this.eval_num(expr);
    } else if (expr instanceof IdLookup) {
      return this.eval_id_lookup(expr);
    } else {
      throw new CodeGenError();
    }
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
