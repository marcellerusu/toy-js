import {
  Let,
  Id,
  Eq,
  Num,
  OpenParen,
  CloseParen,
  Comma,
  Command,
  JsOp,
} from "./lexer.mjs";

class ParseError extends Error {}

export class NamedLet {
  constructor(name, expr) {
    this.name = name;
    this.expr = expr;
  }
}

export class NumExpr {
  constructor(value) {
    this.value = value;
  }
}

export class FunctionCall {
  constructor(name, args) {
    this.name = name;
    this.args = args;
  }
}

export class IdLookup {
  constructor(name) {
    this.name = name;
  }
}
export class CommandExpr {
  constructor(name, expr) {
    this.name = name;
    this.expr = expr;
  }
}

export class JsOpExpr {
  constructor(lhs, type, rhs) {
    this.lhs = lhs;
    this.type = type;
    this.rhs = rhs;
  }
}

class Parser {
  index = 0;
  constructor(tokens) {
    this.tokens = tokens;
  }

  get cur_token() {
    return this.tokens[this.index];
  }

  get prev_token() {
    return this.tokens[this.index - 1];
  }

  consume(TokenClass) {
    if (this.cur_token instanceof TokenClass) {
      this.index += 1;
      return this.prev_token;
    } else {
      throw new ParseError();
    }
  }

  parse() {
    let ast = [];

    while (this.index < this.tokens.length) {
      let statement = this.parse_statement();
      if (statement) {
        ast.push(statement);
      } else {
        let expr = this.parse_expr();
        if (!expr) throw ParseError();
        ast.push(expr);
      }
    }

    return ast;
  }

  scan(...TokenClasses) {
    let i = 0;
    for (let TokenClass of TokenClasses) {
      if (!(this.tokens[this.index + i] instanceof TokenClass)) {
        return false;
      }
      i++;
    }
    return true;
  }

  parse_statement() {
    if (this.scan(Let)) {
      return this.parse_let();
    }
  }

  first_parse_expr() {
    if (this.scan(Num)) {
      return this.parse_num();
    } else if (this.scan(Id, OpenParen)) {
      return this.parse_function_call();
    } else if (this.scan(Id)) {
      return this.parse_id_lookup();
    } else if (this.scan(Command)) {
      return this.parse_command();
    }
  }

  parse_expr() {
    let expr = this.first_parse_expr();
    if (!expr) return;
    if (this.scan(JsOp)) {
      return this.parse_js_op(expr);
    } else {
      return expr;
    }
  }

  parse_js_op(lhs_expr) {
    let { value: type } = this.consume(JsOp);
    let rhs_expr = this.parse_expr();
    return new JsOpExpr(lhs_expr, type, rhs_expr);
  }

  parse_command() {
    let { value: name } = this.consume(Command);
    let expr = this.parse_expr();
    if (!expr) throw new ParseError();
    return new CommandExpr(name, expr);
  }

  parse_id_lookup() {
    let { value: name } = this.consume(Id);
    return new IdLookup(name);
  }

  // [Id, OpenParen, ...(arg, comma), CloseParen]
  parse_function_call() {
    let { value: name } = this.consume(Id);
    this.consume(OpenParen);
    let args = [];
    while (true) {
      let arg = this.parse_expr();
      args.push(arg);
      if (!this.scan(Comma)) break;
      this.consume(Comma);
    }
    this.consume(CloseParen);
    return new FunctionCall(name, args);
  }

  parse_num() {
    let { value } = this.consume(Num);
    return new NumExpr(value);
  }

  parse_let() {
    this.consume(Let);
    let { value: name } = this.consume(Id);
    this.consume(Eq);
    let expr = this.parse_expr();
    return new NamedLet(name, expr);
  }
}

export default Parser;
