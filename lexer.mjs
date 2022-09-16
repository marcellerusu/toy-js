class LexerError extends Error {}
export class Value {
  constructor(value) {
    this.value = value;
  }
}

export class Id extends Value {}
export class Num extends Value {}

export class Let {}
export class Eq {}
export class OpenParen {}
export class CloseParen {}
export class Comma {}
export class Command extends Value {}
export class JsOp extends Value {}
export class Def {}
export class End {}
export class Return {}
export class DataClass {}
export class New {}
export class Dot {}

class Lexer {
  index = 0;
  constructor(str) {
    this.str = str;
  }

  matched = null;
  get rest_of_string() {
    return this.str.slice(this.index);
  }

  // let a = 10
  scan(regex) {
    let result = this.rest_of_string.match(regex);
    if (!result || result.index !== 0) return false;
    this.index += result[0].length;
    this.matched = result[0];
    return true;
  }

  tokenize() {
    let tokens = [];
    while (this.index < this.str.length) {
      if (this.scan(/\s+/)) {
        continue;
      } else if (this.scan(/let/)) {
        tokens.push(new Let());
      } else if (this.scan(/def/)) {
        tokens.push(new Def());
      } else if (this.scan(/end/)) {
        tokens.push(new End());
      } else if (this.scan(/return/)) {
        tokens.push(new Return());
      } else if (this.scan(/dataclass/)) {
        tokens.push(new DataClass());
      } else if (this.scan(/new/)) {
        tokens.push(new New());
      } else if (this.scan(/\./)) {
        tokens.push(new Dot());
      } else if (this.scan(/=/)) {
        tokens.push(new Eq());
      } else if (this.scan(/\(/)) {
        tokens.push(new OpenParen());
      } else if (this.scan(/\)/)) {
        tokens.push(new CloseParen());
      } else if (this.scan(/,/)) {
        tokens.push(new Comma());
      } else if (this.scan(/[a-zA-Z_]+\!/)) {
        tokens.push(new Command(this.matched));
      } else if (this.scan(/[a-zA-Z_]+/)) {
        tokens.push(new Id(this.matched));
      } else if (this.scan(/[\+\-\*\/\%]/)) {
        tokens.push(new JsOp(this.matched));
      } else if (this.scan(/[0-9]+/)) {
        tokens.push(new Num(Number(this.matched)));
      } else {
        throw new LexerError("No token found");
      }
    }
    return tokens;
  }
}

export default Lexer;
