import { Let, Id, Eq, Num, OpenParen, CloseParen, Comma } from "./lexer.mjs";

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

// [ Let {}, Id { value: 'a' }, Eq {}, Num { value: 10 } ]
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

  parse_expr() {
    if (this.scan(Num)) {
      return this.parse_num();
    } else if (this.scan(Id, OpenParen)) {
      return this.parse_function_call();
    } else if (this.scan(Id)) {
      return this.parse_id_lookup();
    }
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
