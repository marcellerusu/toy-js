class Panic extends Error {}
function panic(reason) {
  throw new Panic(reason);
}
export class Id {
  constructor(line, name) {
    this.line = line;
    this.name = name;
  }
}
export class Num {
  constructor(line, value, is_negative) {
    this.line = line;
    this.value = value;
    this.is_negative = is_negative;
  }
}
export class Command {
  constructor(line, name) {
    this.line = line;
    this.name = name;
  }
}
export class Str {
  constructor(line, value) {
    this.line = line;
    this.value = value;
  }
}
export class Regex {
  constructor(line, value) {
    this.line = line;
    this.value = value;
  }
}
export class JsOp {
  constructor(line, op) {
    this.line = line;
    this.op = op;
  }
}
export class Let {
  constructor(line) {
    this.line = line;
  }
}
export class Eq {
  constructor(line) {
    this.line = line;
  }
}
export class PlusEq {
  constructor(line) {
    this.line = line;
  }
}
export class OpenParen {
  constructor(line) {
    this.line = line;
  }
}
export class CloseParen {
  constructor(line) {
    this.line = line;
  }
}
export class Comma {
  constructor(line) {
    this.line = line;
  }
}
export class Def {
  constructor(line) {
    this.line = line;
  }
}
export class End {
  constructor(line) {
    this.line = line;
  }
}
export class Return {
  constructor(line) {
    this.line = line;
  }
}
export class DataClass {
  constructor(line) {
    this.line = line;
  }
}
export class New {
  constructor(line) {
    this.line = line;
  }
}
export class Dot {
  constructor(line) {
    this.line = line;
  }
}
export class Class {
  constructor(line) {
    this.line = line;
  }
}
export class Get {
  constructor(line) {
    this.line = line;
  }
}
export class Bang {
  constructor(line) {
    this.line = line;
  }
}
export class OpenSquare {
  constructor(line) {
    this.line = line;
  }
}
export class CloseSquare {
  constructor(line) {
    this.line = line;
  }
}
export class If {
  constructor(line) {
    this.line = line;
  }
}
export class Else {
  constructor(line) {
    this.line = line;
  }
}
export class Or {
  constructor(line) {
    this.line = line;
  }
}
export class And {
  constructor(line) {
    this.line = line;
  }
}
export class TripleEq {
  constructor(line) {
    this.line = line;
  }
}
export class NotTripleEq {
  constructor(line) {
    this.line = line;
  }
}
export class While {
  constructor(line) {
    this.line = line;
  }
}
export class Break {
  constructor(line) {
    this.line = line;
  }
}
export class Continue {
  constructor(line) {
    this.line = line;
  }
}
export class Do {
  constructor(line) {
    this.line = line;
  }
}
export class Export {
  constructor(line) {
    this.line = line;
  }
}
export class Default {
  constructor(line) {
    this.line = line;
  }
}
export class Spread {
  constructor(line) {
    this.line = line;
  }
}
export class Arrow {
  constructor(line) {
    this.line = line;
  }
}
export class Bind {
  constructor(line) {
    this.line = line;
  }
}
export class Is {
  constructor(line) {
    this.line = line;
  }
}
export class Not {
  constructor(line) {
    this.line = line;
  }
}
export class For {
  constructor(line) {
    this.line = line;
  }
}
export class Of {
  constructor(line) {
    this.line = line;
  }
}
export class OpenBrace {
  constructor(line) {
    this.line = line;
  }
}
export class CloseBrace {
  constructor(line) {
    this.line = line;
  }
}
export class Colon {
  constructor(line) {
    this.line = line;
  }
}
export class Import {
  constructor(line) {
    this.line = line;
  }
}
export class From {
  constructor(line) {
    this.line = line;
  }
}
class Lexer {
  constructor(str) {
    this.str = str;
  }
  index = 0;
  get rest_of_string() {
    return this.str.slice(this.index);
  }
  get cur() {
    return this.str[this.index];
  }
  matched = null;
  scan(regex) {
    let result = this.rest_of_string.match(regex);
    if (!result || result.index !== 0) {
      return false;
    }
    this.index += result[0].length;
    this.matched = result[0];
    return true;
  }
  parse_str() {
    let str = "";
    this.index += 1;
    while (
      this.cur !== '"' ||
      (this.str[this.index - 1] === "\\" && this.str[this.index - 2] !== "\\")
    ) {
      str += this.cur;
      this.index += 1;
      if (this.cur === "\n") {
        panic("no new lines");
      }
    }
    this.index += 1;
    return str;
  }
  tokenize() {
    let tokens = [];
    let line = 0;
    while (this.index < this.str.length) {
      if (this.scan(/\n/)) {
        line += 1;
        continue;
      } else if (this.scan(/\s+/)) {
        continue;
      } else if (this.scan(/let\b/)) {
        tokens.push(new Let(line));
      } else if (this.scan(/while\b/)) {
        tokens.push(new While(line));
      } else if (this.scan(/export\b/)) {
        tokens.push(new Export(line));
      } else if (this.scan(/import\b/)) {
        tokens.push(new Import(line));
      } else if (this.scan(/from\b/)) {
        tokens.push(new From(line));
      } else if (this.scan(/default\b/)) {
        tokens.push(new Default(line));
      } else if (this.scan(/do\b/)) {
        tokens.push(new Do(line));
      } else if (this.scan(/for\b/)) {
        tokens.push(new For(line));
      } else if (this.scan(/of\b/)) {
        tokens.push(new Of(line));
      } else if (this.scan(/\/.*\//)) {
        tokens.push(new Regex(line, this.matched));
      } else if (this.scan(/continue\b/)) {
        tokens.push(new Continue(line));
      } else if (this.scan(/break\b/)) {
        tokens.push(new Break(line));
      } else if (this.scan(/def\b/)) {
        tokens.push(new Def(line));
      } else if (this.scan(/if\b/)) {
        tokens.push(new If(line));
      } else if (this.scan(/else\b/)) {
        tokens.push(new Else(line));
      } else if (this.scan(/end\b/)) {
        tokens.push(new End(line));
      } else if (this.scan(/return\b/)) {
        tokens.push(new Return(line));
      } else if (this.scan(/dataclass\b/)) {
        tokens.push(new DataClass(line));
      } else if (this.cur === '"') {
        let parsed_str = this.parse_str();
        tokens.push(new Str(line, parsed_str));
      } else if (this.scan(/class\b/)) {
        tokens.push(new Class(line));
      } else if (this.scan(/get\b/)) {
        tokens.push(new Get(line));
      } else if (this.scan(/new\b/)) {
        tokens.push(new New(line));
      } else if (this.scan(/is\b/)) {
        tokens.push(new Is(line));
      } else if (this.scan(/not\b/)) {
        tokens.push(new Not(line));
      } else if (this.scan(/\.\.\./)) {
        tokens.push(new Spread(line));
      } else if (this.scan(/\./)) {
        tokens.push(new Dot(line));
      } else if (this.scan(/\(/)) {
        tokens.push(new OpenParen(line));
      } else if (this.scan(/\)/)) {
        tokens.push(new CloseParen(line));
      } else if (this.scan(/\[/)) {
        tokens.push(new OpenSquare(line));
      } else if (this.scan(/\]/)) {
        tokens.push(new CloseSquare(line));
      } else if (this.scan(/\{/)) {
        tokens.push(new OpenBrace(line));
      } else if (this.scan(/\}/)) {
        tokens.push(new CloseBrace(line));
      } else if (this.scan(/,/)) {
        tokens.push(new Comma(line));
      } else if (this.scan(/[a-zA-Z_]+\!/)) {
        tokens.push(new Command(line, this.matched));
      } else if (this.scan(/[a-zA-Z_]+/)) {
        tokens.push(new Id(line, this.matched));
      } else if (this.scan(/\+=/)) {
        tokens.push(new PlusEq(line));
      } else if (this.scan(/[0-9]+/)) {
        tokens.push(new Num(line, Number(this.matched)));
      } else if (this.scan(/-[0-9]+/)) {
        tokens.push(new Num(line, Number(this.matched), true));
      } else if (this.scan(/[\+\-\*\/\%\<\>]|>=|<=|&&|\|\||===|!==/)) {
        tokens.push(new JsOp(line, this.matched));
      } else if (this.scan(/=>/)) {
        tokens.push(new Arrow(line));
      } else if (this.scan(/::/)) {
        tokens.push(new Bind(line));
      } else if (this.scan(/:/)) {
        tokens.push(new Colon(line));
      } else if (this.scan(/=/)) {
        tokens.push(new Eq(line));
      } else if (this.scan(/\!/)) {
        tokens.push(new Bang(line));
      } else {
        panic("nothing found");
      }
    }
    return tokens;
  }
}
export default Lexer;
