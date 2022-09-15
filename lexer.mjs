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

// [new Let(), new Id("a"), new Eq(), new Num(10)]
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
      } else if (this.scan(/=/)) {
        tokens.push(new Eq());
      } else if (this.scan(/\(/)) {
        tokens.push(new OpenParen());
      } else if (this.scan(/\)/)) {
        tokens.push(new CloseParen());
      } else if (this.scan(/,/)) {
        tokens.push(new Comma());
      } else if (this.scan(/[a-zA-Z]+\!/)) {
        tokens.push(new Command(this.matched));
      } else if (this.scan(/[a-zA-Z]+/)) {
        tokens.push(new Id(this.matched));
      } else if (this.scan(/[0-9]+/)) {
        tokens.push(new Num(Number(this.matched)));
      }
    }
    return tokens;
  }
}

export default Lexer;
