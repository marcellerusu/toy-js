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
import { Let, Id, Eq, Num, OpenParen, CloseParen, Comma, Command, JsOp, Def, Return, End, DataClass, New, Dot, Class, Get, Str, Bang, OpenSquare, CloseSquare, If, Else, PlusEq, While, Do, Regex, Continue, Break, Export, Default, Spread, Arrow, Is, Bind, Not, For, Of, OpenBrace, CloseBrace, Colon, Import, From, Type } from "./lexer.mjs";
export class NamedLet {
  constructor(name, expr, type) {
    this.name = name;
    this.expr = expr;
    this.type = type;
  }
};
export class NumExpr {
  constructor(value) {
    this.value = value;
  }
};
export class RegexNode {
  constructor(value) {
    this.value = value;
  }
};
export class StrExpr {
  constructor(value) {
    this.value = value;
  }
};
export class FunctionCall {
  constructor(lhs_expr, args) {
    this.lhs_expr = lhs_expr;
    this.args = args;
  }
};
export class IdLookup {
  constructor(name) {
    this.name = name;
  }
};
export class CommandExpr {
  constructor(name, expr) {
    this.name = name;
    this.expr = expr;
  }
};
export class JsOpExpr {
  constructor(lhs, type, rhs) {
    this.lhs = lhs;
    this.type = type;
    this.rhs = rhs;
  }
};
export class FunctionDef {
  constructor(name, args, body, type) {
    this.name = name;
    this.args = args;
    this.body = body;
    this.type = type;
  }
};
export class ReturnExpr {
  constructor(expr) {
    this.expr = expr;
  }
};
export class ContinueStatement {};
export class BreakStatement {};
export class NewExpr {
  constructor(expr) {
    this.expr = expr;
  }
};
export class NotExpr {
  constructor(expr) {
    this.expr = expr;
  }
};
export class DataClassDef {
  constructor(name, properties) {
    this.name = name;
    this.properties = properties;
  }
};
export class DotAccess {
  constructor(lhs, property) {
    this.lhs = lhs;
    this.property = property;
  }
};
export class ClassDef {
  constructor(name, properties, entries) {
    this.name = name;
    this.properties = properties;
    this.entries = entries;
  }
};
export class ClassInstanceEntry {
  constructor(name, expr) {
    this.name = name;
    this.expr = expr;
  }
};
export class ClassGetterExpr {
  constructor(name, expr) {
    this.name = name;
    this.expr = expr;
  }
};
export class PrefixDotLookup {
  constructor(name) {
    this.name = name;
  }
};
export class PrefixBindLookup {
  constructor(name) {
    this.name = name;
  }
};
export class ArrayLiteral {
  constructor(elements) {
    this.elements = elements;
  }
};
export class ObjLit {
  constructor(entries) {
    this.entries = entries;
  }
};
export class SimpleObjEntry {
  constructor(name, expr) {
    this.name = name;
    this.expr = expr;
  }
};
export class IfStatement {
  constructor(branches) {
    this.branches = branches;
  }
};
export class IfBranch {
  constructor(test_expr, body) {
    this.test_expr = test_expr;
    this.body = body;
  }
};
export class ElseIfBranch {
  constructor(test_expr, body) {
    this.test_expr = test_expr;
    this.body = body;
  }
};
export class ElseBranch {
  constructor(body) {
    this.body = body;
  }
};
export class NodeAssignment {
  constructor(lhs_expr, rhs_expr) {
    this.lhs_expr = lhs_expr;
    this.rhs_expr = rhs_expr;
  }
};
export class NodePlusAssignment {
  constructor(lhs_expr, rhs_expr) {
    this.lhs_expr = lhs_expr;
    this.rhs_expr = rhs_expr;
  }
};
export class WhileStatement {
  constructor(test_expr, body) {
    this.test_expr = test_expr;
    this.body = body;
  }
};
export class PropertyLookup {
  constructor(lhs, property) {
    this.lhs = lhs;
    this.property = property;
  }
};
export class ExportDefault {
  constructor(expr) {
    this.expr = expr;
  }
};
export class ExportStatement {
  constructor(statement) {
    this.statement = statement;
  }
};
export class SpreadExpr {
  constructor(expr) {
    this.expr = expr;
  }
};
export class SpreadArg {
  constructor(name) {
    this.name = name;
  }
};
export class SimpleArg {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
};
export class SimpleDefaultArg {
  constructor(name, expr) {
    this.name = name;
    this.expr = expr;
  }
};
export class ArrowFn {
  constructor(arg_name, return_expr) {
    this.arg_name = arg_name;
    this.return_expr = return_expr;
  }
};
export class IsOperator {
  constructor(lhs, rhs) {
    this.lhs = lhs;
    this.rhs = rhs;
  }
};
export class IsNotOperator {
  constructor(lhs, rhs) {
    this.lhs = lhs;
    this.rhs = rhs;
  }
};
export class BoundFunctionDef {
  constructor(name, args, body) {
    this.name = name;
    this.args = args;
    this.body = body;
  }
};
export class ForLoop {
  constructor(iter_name, iterable_expr, body) {
    this.iter_name = iter_name;
    this.iterable_expr = iterable_expr;
    this.body = body;
  }
};
export class ParenExpr {
  constructor(expr) {
    this.expr = expr;
  }
};
export class RenamedProperty {
  constructor(old_name, new_name) {
    this.old_name = old_name;
    this.new_name = new_name;
  }
};
export class RegularObjectProperty {
  constructor(name) {
    this.name = name;
  }
};
export class LetObjectDeconstruction {
  constructor(entries, rhs) {
    this.entries = entries;
    this.rhs = rhs;
  }
};
export class LetArrDeconstruction {
  constructor(entries, rhs) {
    this.entries = entries;
    this.rhs = rhs;
  }
};
export class ArrComma {};
export class ArrNameEntry {
  constructor(name) {
    this.name = name;
  }
};
export class ImportStatement {
  constructor(imports, path) {
    this.imports = imports;
    this.path = path;
  }
};
export class DefaultImport {
  constructor(name, path) {
    this.name = name;
    this.path = path;
  }
};
export class NamedClassArg {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
};
export class DefaultNamedClassArg {
  constructor(name, expr) {
    this.name = name;
    this.expr = expr;
  }
};
export class ObjClassArg {
  constructor(entries) {
    this.entries = entries;
  }
};
export class ObjClassArgEntry {
  constructor(name) {
    this.name = name;
  }
};
export class DefaultObjClassArg {
  constructor(name, expr) {
    this.name = name;
    this.expr = expr;
  }
};
export class NumT {};
export class StrT {};
export class BoolT {};
export class ArrayT {
  constructor(type) {
    this.type = type;
  }
};
export class TypeDef {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
};
export class TypeIdLookup {
  constructor(name) {
    this.name = name;
  }
};
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
  }
  index = 0;
  get cur_token() {
    return this.tokens[this.index];
  };
  get prev_token() {
    return this.tokens[this.index - 1];
  };
  consume(TokenClass) {
    if (this.cur_token instanceof TokenClass) {
      this.index += 1;
      return this.prev_token;
    } else {
      panic("[lang:" + this.cur_token.line + "] Expected " + TokenClass + ", got " + this.cur_token.constructor);
    };
  };
  clone_and_parse_until(...end_tokens) {
    let cloned = new Parser(this.tokens);
    cloned.index = this.index;
    let result = cloned.parse(...end_tokens);
    this.index = cloned.index;
    return result;
  };
  parse(...end_tokens) {
    let ast = [];
    let has_reached_end_token = () => {
      if (end_tokens.length === 0) {
        return false;
      };
      return end_tokens.some((EndTokenClass) => this.cur_token instanceof EndTokenClass);
    };
    while (this.index < this.tokens.length && !has_reached_end_token()) {
      let statement_or_expr = this.parse_statement();
      if (!statement_or_expr) {
        statement_or_expr = this.parse_expr();
        if (!statement_or_expr) {
          console.log(this.prev_token, this.cur_token, this.tokens[this.index + 1]);
          panic("can't parse statement or expr");
        };
      };
      if (this.scan(If) && this.prev_token.line === this.cur_token.line) {
        statement_or_expr = this.parse_postfix_if(statement_or_expr);
      };
      ast.push(statement_or_expr);
    };
    return ast;
  };
  scan(...TokenClasses) {
    let i = 0;
    for (let TokenClass of TokenClasses) {
      if (!(this.tokens[this.index + i] instanceof TokenClass)) {
        return null;
      };
      i += 1;
    };
    return this.tokens[this.index + i - 1];
  };
  parse_statement() {
    if (this.scan(Let, OpenBrace)) {
      return this.parse_let_obj();
    } else if (this.scan(Let, OpenSquare)) {
      return this.parse_let_arr();
    } else if (this.scan(Let)) {
      return this.parse_let();
    } else if (this.scan(Def, Bind)) {
      return this.parse_bound_def();
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
    } else if (this.scan(Import, Id)) {
      return this.parse_default_import();
    } else if (this.scan(Import)) {
      return this.parse_obj_import();
    } else if (this.scan(For)) {
      return this.parse_for_loop();
    };
  };
  first_parse_expr() {
    if (this.scan(Num)) {
      return this.parse_num();
    } else if (this.scan(Regex)) {
      return this.parse_regex();
    } else if (this.scan(Str)) {
      return this.parse_str();
    } else if (this.scan(OpenParen)) {
      return this.parse_paren_expr();
    } else if (this.scan(Id, Arrow)) {
      return this.parse_arrow_fn();
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
    } else if (this.scan(OpenBrace)) {
      return this.parse_obj_lit();
    } else if (this.scan(Spread)) {
      return this.parse_spread();
    } else if (this.scan(Bind, Id)) {
      return this.parse_prefix_bind_lookup();
    } else if (this.scan(Dot, Id)) {
      return this.parse_prefix_dot_lookup();
    } else if (this.scan(Type)) {
      return this.parse_type_def();
    };
  };
  parse_type_def() {
    this.consume(Type);
    let { name } = this.consume(Id);
    this.consume(Eq);
    let type = this.parse_type_expr();
    return new TypeDef(name, type);
  };
  ASSIGNABLE_NODES = [DotAccess, PrefixDotLookup, IdLookup, PropertyLookup];
  parse_node_assignment(lhs_expr) {
    this.consume(Eq);
    let rhs_expr = this.parse_expr();
    return new NodeAssignment(lhs_expr, rhs_expr);
  };
  parse_node_plus_assignment(lhs_expr) {
    this.consume(PlusEq);
    let rhs_expr = this.parse_expr();
    return new NodePlusAssignment(lhs_expr, rhs_expr);
  };
  can_assign(expr) {
    return (this.scan(Eq) || this.scan(PlusEq)) && this.ASSIGNABLE_NODES.includes(expr.constructor);
  };
  parse_expr_assignment(expr) {
    if (this.scan(Eq)) {
      return this.parse_node_assignment(expr);
    } else if (this.scan(PlusEq)) {
      return this.parse_node_plus_assignment(expr);
    } else {
      panic("cannot assign");
    };
  };
  is_dot_access() {
    return this.scan(Dot) && this.prev_token.line === this.cur_token.line;
  };
  is_property_lookup() {
    return this.scan(OpenSquare) && this.prev_token.line === this.cur_token.line;
  };
  parse_expr() {
    let expr = this.first_parse_expr();
    if (!expr) {
      return undefined;
    };
    while (true) {
      if (this.scan(JsOp)) {
        expr = this.parse_js_op(expr);
      } else if (this.is_dot_access()) {
        expr = this.parse_dot_access(expr);
      } else if (this.is_property_lookup()) {
        expr = this.parse_property_lookup(expr);
      } else if (this.scan(OpenParen)) {
        expr = this.parse_function_call(expr);
      } else if (this.scan(Is, Not)) {
        expr = this.parse_is_not_operator(expr);
      } else if (this.scan(Is)) {
        expr = this.parse_is_operator(expr);
      } else if (this.can_assign(expr)) {
        return this.parse_expr_assignment(expr);
      } else {
        break;
      };
    };
    return expr;
  };
  parse_default_import() {
    this.consume(Import);
    let { name } = this.consume(Id);
    this.consume(From);
    let { value: path } = this.consume(Str);
    return new DefaultImport(name, path);
  };
  parse_obj_import() {
    this.consume(Import);
    this.consume(OpenBrace);
    let imports = [];
    while (!this.scan(CloseBrace)) {
      let { name } = this.consume(Id);
      imports.push(name);
      if (!this.scan(CloseBrace)) {
        this.consume(Comma);
      };
    };
    this.consume(CloseBrace);
    this.consume(From);
    let { value: path } = this.consume(Str);
    return new ImportStatement(imports, path);
  };
  parse_paren_expr() {
    this.consume(OpenParen);
    let expr = this.parse_expr();
    this.consume(CloseParen);
    return new ParenExpr(expr);
  };
  parse_for_loop() {
    this.consume(For);
    this.consume(Let);
    let { name: iter_name } = this.consume(Id);
    this.consume(Of);
    let iterable_expr = this.parse_expr();
    this.consume(Do);
    let body = this.clone_and_parse_until(End);
    this.consume(End);
    return new ForLoop(iter_name, iterable_expr, body);
  };
  parse_is_not_operator(lhs) {
    this.consume(Is);
    this.consume(Not);
    let rhs = this.parse_expr();
    return new IsNotOperator(lhs, rhs);
  };
  parse_is_operator(lhs) {
    this.consume(Is);
    let rhs = this.parse_expr();
    return new IsOperator(lhs, rhs);
  };
  parse_arrow_fn() {
    let { name: arg_name } = this.consume(Id);
    this.consume(Arrow);
    let return_expr = this.parse_statement() || this.parse_expr();
    return new ArrowFn(arg_name, return_expr);
  };
  parse_spread() {
    this.consume(Spread);
    let expr = this.parse_expr();
    return new SpreadExpr(expr);
  };
  parse_export_default() {
    this.consume(Export);
    this.consume(Default);
    let expr = this.parse_expr();
    return new ExportDefault(expr);
  };
  parse_export() {
    this.consume(Export);
    let statement = this.parse_statement();
    return new ExportStatement(statement);
  };
  parse_property_lookup(lhs) {
    this.consume(OpenSquare);
    let property = this.parse_expr();
    this.consume(CloseSquare);
    return new PropertyLookup(lhs, property);
  };
  parse_while() {
    this.consume(While);
    let test_expr = this.parse_expr();
    this.consume(Do);
    let body = this.clone_and_parse_until(End);
    this.consume(End);
    return new WhileStatement(test_expr, body);
  };
  parse_postfix_if(lhs) {
    this.consume(If);
    let test_expr = this.parse_expr();
    return new IfStatement([new IfBranch(test_expr, [lhs])]);
  };
  parse_else_if() {
    this.consume(Else);
    this.consume(If);
    let test_expr = this.parse_expr();
    let body = this.clone_and_parse_until(Else, End);
    return new ElseIfBranch(test_expr, body);
  };
  parse_else() {
    this.consume(Else);
    let body = this.clone_and_parse_until(End);
    return new ElseBranch(body);
  };
  parse_pass_branch() {
    this.consume(If);
    let test_expr = this.parse_expr();
    let pass_body = this.clone_and_parse_until(Else, End);
    return new IfBranch(test_expr, pass_body);
  };
  parse_if() {
    let branches = [];
    branches.push(this.parse_pass_branch());
    while (!this.scan(End)) {
      if (this.scan(Else, If)) {
        branches.push(this.parse_else_if());
      } else if (this.scan(Else)) {
        branches.push(this.parse_else());
      };
    };
    this.consume(End);
    return new IfStatement(branches);
  };
  parse_obj_lit() {
    let entries = [];
    this.consume(OpenBrace);
    while (!this.scan(CloseBrace)) {
      let { name } = this.consume(Id);
      this.consume(Colon);
      let expr = this.parse_expr();
      entries.push(new SimpleObjEntry(name, expr));
      if (this.scan(Comma)) {
        this.consume(Comma);
      };
    };
    this.consume(CloseBrace);
    return new ObjLit(entries);
  };
  parse_array() {
    let elements = [];
    this.consume(OpenSquare);
    while (!this.scan(CloseSquare)) {
      elements.push(this.parse_expr());
      if (!this.scan(CloseSquare)) {
        this.consume(Comma);
      };
    };
    this.consume(CloseSquare);
    return new ArrayLiteral(elements);
  };
  parse_not_expr() {
    this.consume(Bang);
    let expr = this.parse_expr();
    return new NotExpr(expr);
  };
  parse_prefix_bind_lookup() {
    this.consume(Bind);
    let { name } = this.consume(Id);
    return new PrefixBindLookup(name);
  };
  parse_prefix_dot_lookup() {
    this.consume(Dot);
    let { name } = this.consume(Id);
    return new PrefixDotLookup(name);
  };
  parse_class_instance_entry() {
    let { name } = this.consume(Id);
    this.consume(Eq);
    let expr = this.parse_expr();
    return new ClassInstanceEntry(name, expr);
  };
  parse_getter() {
    this.consume(Get);
    let { name } = this.consume(Id);
    this.consume(Eq);
    let expr = this.parse_expr();
    return new ClassGetterExpr(name, expr);
  };
  parse_class_entry() {
    if (this.scan(Id, Eq)) {
      return this.parse_class_instance_entry();
    } else if (this.scan(Get)) {
      return this.parse_getter();
    } else if (this.scan(Def)) {
      return this.parse_def();
    } else {
      panic("no class entry found");
    };
  };
  parse_obj_args() {
    this.consume(OpenBrace);
    let entries = [];
    while (!this.scan(CloseBrace)) {
      if (this.scan(Id, Eq)) {
        let { name } = this.consume(Id);
        this.consume(Eq);
        let default_value = this.parse_expr();
        entries.push(new DefaultObjClassArg(name, default_value));
      } else if (this.scan(Id)) {
        let { name } = this.consume(Id);
        entries.push(new ObjClassArgEntry(name));
      };
      if (this.scan(Comma)) {
        this.consume(Comma);
      };
    };
    this.consume(CloseBrace);
    return new ObjClassArg(entries);
  };
  parse_class_arg() {
    if (this.scan(Id, Eq)) {
      let { name } = this.consume(Id);
      this.consume(Eq);
      let expr = this.parse_expr();
      return new DefaultNamedClassArg(name, expr);
    } else if (this.scan(Id)) {
      let { name } = this.consume(Id);
      let type = this.parse_type_annotation();
      return new NamedClassArg(name, type);
    } else if (this.scan(OpenBrace)) {
      return this.parse_obj_args();
    };
  };
  parse_class_args() {
    this.consume(OpenParen);
    let properties = [];
    while (!this.scan(CloseParen)) {
      properties.push(this.parse_class_arg());
      if (this.scan(Comma)) {
        this.consume(Comma);
      };
    };
    this.consume(CloseParen);
    return properties;
  };
  parse_class() {
    this.consume(Class);
    let { name } = this.consume(Id);
    let properties = null;
    if (this.scan(OpenParen)) {
      properties = this.parse_class_args();
    };
    let entries = [];
    while (!this.scan(End) && this.cur_token) {
      entries.push(this.parse_class_entry());
    };
    this.consume(End);
    return new ClassDef(name, properties, entries);
  };
  parse_dot_access(lhs) {
    this.consume(Dot);
    let { name: property } = this.consume(Id);
    return new DotAccess(lhs, property);
  };
  parse_new_expr() {
    this.consume(New);
    let expr = this.parse_expr();
    return new NewExpr(expr);
  };
  parse_arg_defs() {
    this.consume(OpenParen);
    let args = [];
    while (!(this.cur_token instanceof CloseParen)) {
      if (this.scan(Id, Eq)) {
        let { name: arg_name } = this.consume(Id);
        this.consume(Eq);
        let expr = this.parse_expr();
        args.push(new SimpleDefaultArg(arg_name, expr));
      } else if (this.scan(Id)) {
        let { name: arg_name } = this.consume(Id);
        let type = this.parse_type_annotation();
        args.push(new SimpleArg(arg_name, type));
      } else if (this.scan(Spread)) {
        this.consume(Spread);
        let { name: arg_name } = this.consume(Id);
        args.push(new SpreadArg(arg_name));
      } else if (this.scan(OpenBrace)) {
        args.push(this.parse_obj_args());
      } else {
        panic("arg type not supported");
      };
      if (!this.scan(Comma)) {
        break;
      };
      this.consume(Comma);
    };
    this.consume(CloseParen);
    return args;
  };
  parse_arg_names() {
    this.consume(OpenParen);
    let args = [];
    while (!this.scan(CloseParen)) {
      let { name } = this.consume(Id);
      let type = this.parse_type_annotation();
      args.push(new NamedClassArg(name, type));
      if (!this.scan(CloseParen)) {
        this.consume(Comma);
      };
    };
    this.consume(CloseParen);
    return args;
  };
  parse_data_class_def() {
    this.consume(DataClass);
    let { name } = this.consume(Id);
    let properties = null;
    if (this.scan(OpenParen)) {
      properties = this.parse_arg_names();
    };
    return new DataClassDef(name, properties);
  };
  parse_return() {
    this.consume(Return);
    let expr = this.parse_expr();
    return new ReturnExpr(expr);
  };
  parse_continue() {
    this.consume(Continue);
    return new ContinueStatement();
  };
  parse_break() {
    this.consume(Break);
    return new BreakStatement();
  };
  parse_bound_def() {
    this.consume(Def);
    this.consume(Bind);
    let { name } = this.consume(Id);
    let args = [];
    if (this.scan(OpenParen)) {
      args = this.parse_arg_defs();
    };
    let body = this.clone_and_parse_until(End);
    this.consume(End);
    return new BoundFunctionDef(name, args, body);
  };
  parse_def() {
    this.consume(Def);
    let { name } = this.consume(Id);
    let args = [];
    if (this.scan(OpenParen)) {
      args = this.parse_arg_defs();
    };
    let type = this.parse_type_annotation();
    let body = [];
    if (this.scan(Eq)) {
      this.consume(Eq);
      let expr = this.parse_expr();
      if (!(expr instanceof ReturnExpr)) {
        expr = new ReturnExpr(expr);
      };
      body.push(expr);
    } else {
      body = this.clone_and_parse_until(End);
      let non_returnable = [ReturnExpr, IfStatement, NamedLet];
      if (body.length > 0 && non_returnable.every((Klass) => !(body.at(-1) instanceof Klass))) {
        body = [...body.slice(0, -1), new ReturnExpr(body.at(-1))];
      };
      this.consume(End);
    };
    return new FunctionDef(name, args, body, type);
  };
  parse_js_op(lhs_expr) {
    let { op } = this.consume(JsOp);
    let rhs_expr = this.parse_expr();
    return new JsOpExpr(lhs_expr, op, rhs_expr);
  };
  parse_command() {
    let { name } = this.consume(Command);
    let expr = this.parse_expr();
    if (!expr) {
      panic("no expr");
    };
    return new CommandExpr(name, expr);
  };
  parse_id_lookup() {
    let { name } = this.consume(Id);
    return new IdLookup(name);
  };
  parse_function_call(expr) {
    this.consume(OpenParen);
    let args = [];
    while (!(this.cur_token instanceof CloseParen)) {
      let arg = this.parse_expr();
      args.push(arg);
      if (!this.scan(Comma)) {
        break;
      };
      this.consume(Comma);
    };
    this.consume(CloseParen);
    return new FunctionCall(expr, args);
  };
  parse_str() {
    let { value } = this.consume(Str);
    return new StrExpr(value);
  };
  parse_regex() {
    let { value } = this.consume(Regex);
    return new RegexNode(value);
  };
  parse_num() {
    let { value } = this.consume(Num);
    return new NumExpr(value);
  };
  parse_renamed_property() {
    let { name: old_name } = this.consume(Id);
    this.consume(Colon);
    let { name: new_name } = this.consume(Id);
    return new RenamedProperty(old_name, new_name);
  };
  parse_regular_object_property() {
    let { name } = this.consume(Id);
    return new RegularObjectProperty(name);
  };
  parse_obj_deconstruction_entry() {
    if (this.scan(Id, Colon)) {
      return this.parse_renamed_property();
    } else if (this.scan(Id)) {
      return this.parse_regular_object_property();
    } else {
      panic("unknown object deconstruction entry");
    };
  };
  parse_let_arr() {
    this.consume(Let);
    this.consume(OpenSquare);
    let entries = [];
    while (!this.scan(CloseSquare)) {
      if (this.scan(Comma)) {
        this.consume(Comma);
        entries.push(new ArrComma());
      };
      if (this.scan(Comma)) {
        continue;
      };
      if (this.scan(Id)) {
        let { name } = this.consume(Id);
        entries.push(new ArrNameEntry(name));
      } else {
        entries.push(this.parse_obj_deconstruction());
      };
    };
    this.consume(CloseSquare);
    this.consume(Eq);
    let rhs = this.parse_expr();
    return new LetArrDeconstruction(entries, rhs);
  };
  parse_obj_deconstruction() {
    this.consume(OpenBrace);
    let entries = [];
    while (!this.scan(CloseBrace)) {
      entries.push(this.parse_obj_deconstruction_entry());
      if (!this.scan(CloseBrace)) {
        this.consume(Comma);
      };
    };
    this.consume(CloseBrace);
    return entries;
  };
  parse_let_obj() {
    this.consume(Let);
    let entries = this.parse_obj_deconstruction();
    this.consume(Eq);
    let rhs = this.parse_expr();
    return new LetObjectDeconstruction(entries, rhs);
  };
  parse_type_expr() {
    if (!(this.scan(Id))) panic(`assertion failed: this.scan(Id)`);;
    if (this.scan(Id).name === "num") {
      this.consume(Id);
      return new NumT();
    } else if (this.scan(Id).name === "str") {
      this.consume(Id);
      return new StrT();
    } else if (this.scan(Id).name === "bool") {
      this.consume(Id);
      return new BoolT();
    } else if (this.scan(Id).name === "Array") {
      this.consume(Id);
      let [type] = this.parse_type_params();
      return new ArrayT(type);
    } else if (this.scan(Id)) {
      let { name } = this.consume(Id);
      return new TypeIdLookup(name);
    } else {
      panic("type not implemented " + this.cur_token.name);
    };
  };
  parse_type_annotation() {
    if (!this.scan(Colon)) {
      return null;
    };
    this.consume(Colon);
    return this.parse_type_expr();
  };
  parse_type_params() {
    let types = [];
    this.consume(OpenSquare);
    while (!this.scan(CloseSquare)) {
      types.push(this.parse_type_expr());
      if (this.scan(Comma)) {
        this.consume(Comma);
      };
    };
    this.consume(CloseSquare);
    return types;
  };
  parse_let() {
    this.consume(Let);
    let { name } = this.consume(Id);
    let type = this.parse_type_annotation();
    this.consume(Eq);
    let expr = this.parse_expr();
    return new NamedLet(name, expr, type);
  };
};
export default Parser;

