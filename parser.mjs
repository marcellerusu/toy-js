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
  If,
  Else,
  PlusEq,
  While,
  Do,
  Regex,
  Continue,
  Break,
  Export,
  Default,
} from "./dist/lexer.mjs";

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

export class RegexNode {
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

export class ContinueStatement {}

export class BreakStatement {}

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

export class IfStatement {
  constructor(branches) {
    this.branches = branches;
  }
}

export class IfBranch {
  constructor(test_expr, body) {
    this.test_expr = test_expr;
    this.body = body;
  }
}

export class ElseIfBranch {
  constructor(test_expr, body) {
    this.test_expr = test_expr;
    this.body = body;
  }
}

export class ElseBranch {
  constructor(body) {
    this.body = body;
  }
}

export class NodeAssignment {
  constructor(lhs_expr, rhs_expr) {
    this.lhs_expr = lhs_expr;
    this.rhs_expr = rhs_expr;
  }
}

export class NodePlusAssignment {
  constructor(lhs_expr, rhs_expr) {
    this.lhs_expr = lhs_expr;
    this.rhs_expr = rhs_expr;
  }
}

export class WhileStatement {
  constructor(test_expr, body) {
    this.test_expr = test_expr;
    this.body = body;
  }
}

export class PropertyLookup {
  constructor(lhs, property) {
    this.lhs = lhs;
    this.property = property;
  }
}

export class ExportDefault {
  constructor(expr) {
    this.expr = expr;
  }
}

export class ExportStatement {
  constructor(statement) {
    this.statement = statement;
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
      console.error(
        `[lexer.lang:${this.cur_token.line}] Expected ${TokenClass}, got ${this.cur_token.constructor}`
      );
      throw new ParseError();
    }
  }

  clone_and_parse_until(...end_tokens) {
    let cloned = new Parser(this.tokens);
    cloned.index = this.index;
    let result = cloned.parse(...end_tokens);
    this.index = cloned.index;
    return result;
  }

  parse(...end_tokens) {
    let ast = [];

    let has_reached_end_token = () => {
      if (end_tokens.length === 0) return false;
      return end_tokens.some(
        (EndTokenClass) => this.cur_token instanceof EndTokenClass
      );
    };

    while (this.index < this.tokens.length && !has_reached_end_token()) {
      let statement_or_expr = this.parse_statement();

      if (!statement_or_expr) {
        statement_or_expr = this.parse_expr();

        if (!statement_or_expr) {
          console.log(this.cur_token);
          throw new ParseError();
        }
      }

      if (this.scan(If) && this.prev_token.line === this.cur_token.line) {
        statement_or_expr = this.parse_postfix_if(statement_or_expr);
      } else if (this.scan(If)) {
        throw new ParseError("Unexpected If");
      }

      ast.push(statement_or_expr);
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
    } else if (this.scan(Continue)) {
      return this.parse_continue();
    } else if (this.scan(Break)) {
      return this.parse_break();
    } else if (this.scan(Class)) {
      return this.parse_class();
    } else if (this.scan(If)) {
      return this.parse_if();
    } else if (this.scan(While)) {
      return this.parse_while();
    } else if (this.scan(Export, Default)) {
      return this.parse_export_default();
    } else if (this.scan(Export)) {
      return this.parse_export();
    }
  }

  first_parse_expr() {
    if (this.scan(Num)) {
      return this.parse_num();
    } else if (this.scan(Regex)) {
      return this.parse_regex();
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

  ASSIGNABLE_NODES = [DotAccess, PrefixDotLookup, IdLookup];
  parse_node_assignment(lhs_expr) {
    this.consume(Eq);
    let rhs_expr = this.parse_expr();
    return new NodeAssignment(lhs_expr, rhs_expr);
  }

  parse_node_plus_assignment(lhs_expr) {
    this.consume(PlusEq);
    let rhs_expr = this.parse_expr();
    return new NodePlusAssignment(lhs_expr, rhs_expr);
  }

  parse_expr() {
    let expr = this.first_parse_expr();
    if (!expr) return;

    if (this.ASSIGNABLE_NODES.includes(expr.constructor)) {
      if (this.scan(Eq)) {
        return this.parse_node_assignment(expr);
      } else if (this.scan(PlusEq)) {
        return this.parse_node_plus_assignment(expr);
      }
    }

    while (true) {
      if (this.scan(JsOp)) {
        expr = this.parse_js_op(expr);
      } else if (
        this.scan(Dot) &&
        this.prev_token.line === this.cur_token.line
      ) {
        expr = this.parse_dot_access(expr);
      } else if (
        this.scan(OpenSquare) &&
        this.prev_token.line === this.cur_token.line
      ) {
        expr = this.parse_property_lookup(expr);
      } else if (this.scan(OpenParen)) {
        expr = this.parse_function_call(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  parse_export_default() {
    this.consume(Export);
    this.consume(Default);
    let expr = this.parse_expr();
    return new ExportDefault(expr);
  }

  parse_export() {
    this.consume(Export);
    let statement = this.parse_statement();
    return new ExportStatement(statement);
  }

  parse_property_lookup(lhs) {
    this.consume(OpenSquare);
    let property = this.parse_expr();
    this.consume(CloseSquare);
    return new PropertyLookup(lhs, property);
  }

  parse_while() {
    this.consume(While);
    let test_expr = this.parse_expr();
    this.consume(Do);
    let body = this.clone_and_parse_until(End);
    this.consume(End);
    return new WhileStatement(test_expr, body);
  }

  parse_postfix_if(lhs) {
    this.consume(If);
    let test_expr = this.parse_expr();
    return new IfStatement([new IfBranch(test_expr, [lhs])]);
  }

  parse_else_if() {
    this.consume(Else);
    this.consume(If);
    let test_expr = this.parse_expr();
    let body = this.clone_and_parse_until(Else, End);
    return new ElseIfBranch(test_expr, body);
  }

  parse_else() {
    this.consume(Else);
    let body = this.clone_and_parse_until(End);
    return new ElseBranch(body);
  }

  parse_pass_branch() {
    this.consume(If);
    let test_expr = this.parse_expr();
    let pass_body = this.clone_and_parse_until(Else, End);
    return new IfBranch(test_expr, pass_body);
  }

  parse_if() {
    let branches = [];
    branches.push(this.parse_pass_branch());

    while (!this.scan(End)) {
      if (this.scan(Else, If)) {
        branches.push(this.parse_else_if());
      } else if (this.scan(Else)) {
        branches.push(this.parse_else());
      }
    }

    this.consume(End);
    return new IfStatement(branches);
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
    let { name } = this.consume(Id);
    return new PrefixDotLookup(name);
  }

  parse_class_instance_entry() {
    let { name } = this.consume(Id);
    this.consume(Eq);
    let expr = this.parse_expr();
    return new ClassInstanceEntry(name, expr);
  }

  parse_getter() {
    this.consume(Get);
    let { name } = this.consume(Id);
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
    let { name } = this.consume(Id);
    let properties = null;
    if (this.scan(OpenParen)) {
      properties = this.parse_arg_names();
    }
    let entries = [];
    while (!this.scan(End) && this.cur_token) {
      entries.push(this.parse_class_entry());
    }
    this.consume(End);
    return new ClassDef(name, properties, entries);
  }

  parse_dot_access(lhs) {
    this.consume(Dot);
    let { name: property } = this.consume(Id);
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
      let { name: arg_name } = this.consume(Id);
      args.push(arg_name);
      if (!this.scan(Comma)) break;
      this.consume(Comma);
    }
    this.consume(CloseParen);
    return args;
  }

  parse_data_class_def() {
    this.consume(DataClass);
    let { name } = this.consume(Id);
    let properties = null;
    if (this.scan(OpenParen)) properties = this.parse_arg_names();
    return new DataClassDef(name, properties);
  }

  parse_return() {
    this.consume(Return);
    let expr = this.parse_expr();
    return new ReturnExpr(expr);
  }

  parse_continue() {
    this.consume(Continue);
    return new ContinueStatement();
  }

  parse_break() {
    this.consume(Break);
    return new BreakStatement();
  }
  parse_def() {
    this.consume(Def);
    let { name } = this.consume(Id);
    let args = [];
    if (this.scan(OpenParen)) args = this.parse_arg_names();
    let body = this.clone_and_parse_until(End);
    this.consume(End);
    return new FunctionDef(name, args, body);
  }

  parse_js_op(lhs_expr) {
    let { op } = this.consume(JsOp);
    let rhs_expr = this.parse_expr();
    return new JsOpExpr(lhs_expr, op, rhs_expr);
  }

  parse_command() {
    let { name } = this.consume(Command);
    let expr = this.parse_expr();
    if (!expr) throw new ParseError();
    return new CommandExpr(name, expr);
  }

  parse_id_lookup() {
    let { name } = this.consume(Id);
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

  parse_regex() {
    let { value } = this.consume(Regex);
    return new RegexNode(value);
  }

  parse_num() {
    let { value } = this.consume(Num);
    return new NumExpr(value);
  }

  parse_let() {
    this.consume(Let);
    let { name } = this.consume(Id);
    this.consume(Eq);
    let expr = this.parse_expr();
    return new NamedLet(name, expr);
  }
}

export default Parser;
