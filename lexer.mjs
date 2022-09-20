class LexerError extends Error {}

class Token {
  constructor(line) {
    this.line = line;
  }
}

class Value extends Token {
  constructor(line, value) {
    super(line);
    this.value = value;
  }
}

export class Id extends Value {}
export class Num extends Value {}
export class Let extends Token {}
export class Eq extends Token {}
export class PlusEq extends Token {}
export class OpenParen extends Token {}
export class CloseParen extends Token {}
export class Comma extends Token {}
export class Command extends Value {}
export class JsOp extends Value {}
export class Def extends Token {}
export class End extends Token {}
export class Return extends Token {}
export class DataClass extends Token {}
export class New extends Token {}
export class Dot extends Token {}
export class Class extends Token {}
export class Get extends Token {}
export class Bang extends Token {}
export class Str extends Value {}
export class OpenSquare extends Token {}
export class CloseSquare extends Token {}
export class If extends Token {}
export class Else extends Token {}
export class Or extends Token {}
export class And extends Token {}
export class TripleEq extends Token {}
export class NotTripleEq extends Token {}
export class While extends Token {}
export class Break extends Token {}
export class Continue extends Token {}
export class Do extends Token {}
export class Regex extends Value {}

class Lexer {
  index = 0;
  constructor(str) {
    this.str = str;
  }

  matched = null;
  get rest_of_string() {
    return this.str.slice(this.index);
  }

  scan(regex) {
    let result = this.rest_of_string.match(regex);
    if (!result || result.index !== 0) return false;
    this.index += result[0].length;
    this.matched = result[0];
    return true;
  }

  tokenize() {
    let tokens = [];
    let line = 0;
    while (this.index < this.str.length) {
      if (this.scan(/\n/)) {
        line++;
        continue;
      } else if (this.scan(/\s+/)) {
        continue;
      } else if (this.scan(/let/)) {
        tokens.push(new Let(line));
      } else if (this.scan(/while/)) {
        tokens.push(new While(line));
      } else if (this.scan(/do/)) {
        tokens.push(new Do(line));
      } else if (this.scan(/\/.*\//)) {
        tokens.push(new Regex(line, this.matched));
      } else if (this.scan(/continue/)) {
        tokens.push(new Continue(line));
      } else if (this.scan(/break/)) {
        tokens.push(new Break(line));
      } else if (this.scan(/def/)) {
        tokens.push(new Def(line));
      } else if (this.scan(/if/)) {
        tokens.push(new If(line));
      } else if (this.scan(/else/)) {
        tokens.push(new Else(line));
      } else if (this.scan(/end/)) {
        tokens.push(new End(line));
      } else if (this.scan(/return/)) {
        tokens.push(new Return(line));
      } else if (this.scan(/dataclass/)) {
        tokens.push(new DataClass(line));
      } else if (this.scan(/".*"/)) {
        tokens.push(new Str(line, this.matched.slice(1, -1)));
      } else if (this.scan(/class/)) {
        tokens.push(new Class(line));
      } else if (this.scan(/get/)) {
        tokens.push(new Get(line));
      } else if (this.scan(/new/)) {
        tokens.push(new New(line));
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
      } else if (this.scan(/,/)) {
        tokens.push(new Comma(line));
      } else if (this.scan(/[a-zA-Z_]+\!/)) {
        tokens.push(new Command(line, this.matched));
      } else if (this.scan(/[a-zA-Z_]+/)) {
        tokens.push(new Id(line, this.matched));
      } else if (this.scan(/\+=/)) {
        tokens.push(new PlusEq(line));
      } else if (this.scan(/[\+\-\*\/\%\<\>]|>=|<=|&&|\|\||===|!==/)) {
        tokens.push(new JsOp(line, this.matched));
      } else if (this.scan(/=/)) {
        tokens.push(new Eq(line));
      } else if (this.scan(/\!/)) {
        tokens.push(new Bang(line));
      } else if (this.scan(/[0-9]+/)) {
        tokens.push(new Num(line, Number(this.matched)));
      } else {
        throw new LexerError("No token found");
      }
    }
    return tokens;
  }
}

export default Lexer;
