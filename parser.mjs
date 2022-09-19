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
  Def,
  Return,
  End,
  DataClass,
  New,
  Dot,
  Class,
  Get,
  Str,
  Bang,
  OpenSquare,
  CloseSquare,
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

export class StrExpr {
  constructor(value) {
    this.value = value;
  }
}

export class FunctionCall {
  constructor(lhs_expr, args) {
    this.lhs_expr = lhs_expr;
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

export class FunctionDef {
  constructor(name, args, body) {
    this.name = name;
    this.args = args;
    this.body = body;
  }
}

export class ReturnExpr {
  constructor(expr) {
    this.expr = expr;
  }
}

export class NewExpr {
  constructor(expr) {
    this.expr = expr;
  }
}

export class NotExpr {
  constructor(expr) {
    this.expr = expr;
  }
}
export class DataClassDef {
  constructor(name, properties) {
    this.name = name;
    this.properties = properties;
  }
}

export class DotAccess {
  constructor(lhs, property) {
    this.lhs = lhs;
    this.property = property;
  }
}

export class ClassDef {
  constructor(name, properties, entries) {
    this.name = name;
    this.properties = properties;
    this.entries = entries;
  }
}

export class ClassInstanceEntry {
  constructor(name, expr) {
    this.name = name;
    this.expr = expr;
  }
}

export class ClassGetterExpr {
  constructor(name, expr) {
    this.name = name;
    this.expr = expr;
  }
}

export class PrefixDotLookup {
  constructor(name) {
    this.name = name;
  }
}

export class ArrayLiteral {
  constructor(elements) {
    this.elements = elements;
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

  clone_and_parse_until(EndTokenClass) {
    let cloned = new Parser(this.tokens);
    cloned.index = this.index;
    let result = cloned.parse(EndTokenClass);
    this.index = cloned.index;
    return result;
  }

  parse(EndTokenClass = null) {
    let ast = [];

    let has_reached_end_token = () => {
      if (!EndTokenClass) return false;
      return this.cur_token instanceof EndTokenClass;
    };

    while (this.index < this.tokens.length && !has_reached_end_token()) {
      let statement = this.parse_statement();
      if (statement) {
        ast.push(statement);
      } else {
        let expr = this.parse_expr();
        if (!expr) throw new ParseError();
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
    } else if (this.scan(Def)) {
      return this.parse_def();
    } else if (this.scan(DataClass)) {
      return this.parse_data_class_def();
    } else if (this.scan(Return)) {
      return this.parse_return();
    } else if (this.scan(Class)) {
      return this.parse_class();
    }
  }

  first_parse_expr() {
    if (this.scan(Num)) {
      return this.parse_num();
    } else if (this.scan(Str)) {
      return this.parse_str();
    } else if (this.scan(Id)) {
      return this.parse_id_lookup();
    } else if (this.scan(Command)) {
      return this.parse_command();
    } else if (this.scan(New)) {
      return this.parse_new_expr();
    } else if (this.scan(Bang)) {
      return this.parse_not_expr();
    } else if (this.scan(OpenSquare)) {
      return this.parse_array();
    } else if (this.scan(Dot, Id)) {
      return this.parse_prefix_dot_lookup();
    }
  }

  parse_expr() {
    let expr = this.first_parse_expr();
    if (!expr) return;

    while (true) {
      if (this.scan(JsOp)) {
        expr = this.parse_js_op(expr);
      } else if (
        this.scan(Dot) &&
        this.prev_token.line === this.cur_token.line
      ) {
        expr = this.parse_dot_access(expr);
      } else if (this.scan(OpenParen)) {
        expr = this.parse_function_call(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  parse_array() {
    let elements = [];
    this.consume(OpenSquare);
    while (!this.scan(CloseSquare)) {
      elements.push(this.parse_expr());
      if (!this.scan(CloseSquare)) this.consume(Comma);
    }
    this.consume(CloseSquare);
    return new ArrayLiteral(elements);
  }

  parse_not_expr() {
    this.consume(Bang);
    let expr = this.parse_expr();
    return new NotExpr(expr);
  }

  parse_prefix_dot_lookup() {
    this.consume(Dot);
    let { value: name } = this.consume(Id);
    return new PrefixDotLookup(name);
  }

  parse_class_instance_entry() {
    let { value: name } = this.consume(Id);
    this.consume(Eq);
    let expr = this.parse_expr();
    return new ClassInstanceEntry(name, expr);
  }

  parse_getter() {
    this.consume(Get);
    let { value: name } = this.consume(Id);
    this.consume(Eq);
    let expr = this.parse_expr();
    return new ClassGetterExpr(name, expr);
  }

  parse_class_entry() {
    if (this.scan(Id, Eq)) {
      return this.parse_class_instance_entry();
    } else if (this.scan(Get)) {
      return this.parse_getter();
    } else if (this.scan(Def)) {
      return this.parse_def();
    } else {
      throw new ParseError("no class entry found");
    }
  }

  parse_class() {
    this.consume(Class);
    let { value: name } = this.consume(Id);
    let properties = null;
    if (this.scan(OpenParen)) {
      properties = this.parse_arg_names();
    }
    let entries = [];
    while (!this.scan(End)) {
      entries.push(this.parse_class_entry());
    }
    this.consume(End);
    return new ClassDef(name, properties, entries);
  }

  parse_dot_access(lhs) {
    this.consume(Dot);
    let { value: property } = this.consume(Id);
    return new DotAccess(lhs, property);
  }

  parse_new_expr() {
    this.consume(New);
    let expr = this.parse_expr();
    return new NewExpr(expr);
  }

  parse_arg_names() {
    this.consume(OpenParen);
    let args = [];
    while (!(this.cur_token instanceof CloseParen)) {
      let { value: arg_name } = this.consume(Id);
      args.push(arg_name);
      if (!this.scan(Comma)) break;
      this.consume(Comma);
    }
    this.consume(CloseParen);
    return args;
  }

  parse_data_class_def() {
    this.consume(DataClass);
    let { value: name } = this.consume(Id);
    let properties = null;
    if (this.scan(OpenParen)) properties = this.parse_arg_names();
    return new DataClassDef(name, properties);
  }

  parse_return() {
    this.consume(Return);
    let expr = this.parse_expr();
    return new ReturnExpr(expr);
  }

  parse_def() {
    this.consume(Def);
    let { value: name } = this.consume(Id);
    let args = [];
    if (this.scan(OpenParen)) args = this.parse_arg_names();
    let body = this.clone_and_parse_until(End);
    this.consume(End);
    return new FunctionDef(name, args, body);
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

  parse_function_call(expr) {
    this.consume(OpenParen);
    let args = [];
    while (!(this.cur_token instanceof CloseParen)) {
      let arg = this.parse_expr();
      args.push(arg);
      if (!this.scan(Comma)) break;
      this.consume(Comma);
    }
    this.consume(CloseParen);
    return new FunctionCall(expr, args);
  }

  parse_str() {
    let { value } = this.consume(Str);
    return new StrExpr(value);
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
