class Id {
  constructor(line, name) {
    this.line = line;
    this.name = name;
  }
}
class Command {
  constructor(line, name) {
    this.line = line;
    this.name = name;
  }
}
class Num {
  constructor(line, value) {
    this.line = line;
    this.value = value;
  }
}
class Str {
  constructor(line, value) {
    this.line = line;
    this.value = value;
  }
}
class Regex {
  constructor(line, value) {
    this.line = line;
    this.value = value;
  }
}
class JsOp {
  constructor(line, op) {
    this.line = line;
    this.op = op;
  }
}
class Let {
  constructor(line) {
    this.line = line;
  }
}
class Eq {
  constructor(line) {
    this.line = line;
  }
}
class PlusEq {
  constructor(line) {
    this.line = line;
  }
}
class OpenParen {
  constructor(line) {
    this.line = line;
  }
}
class CloseParen {
  constructor(line) {
    this.line = line;
  }
}
class Comma {
  constructor(line) {
    this.line = line;
  }
}
class Def {
  constructor(line) {
    this.line = line;
  }
}
class End {
  constructor(line) {
    this.line = line;
  }
}
class Return {
  constructor(line) {
    this.line = line;
  }
}
class DataClass {
  constructor(line) {
    this.line = line;
  }
}
class New {
  constructor(line) {
    this.line = line;
  }
}
class Dot {
  constructor(line) {
    this.line = line;
  }
}
class Class {
  constructor(line) {
    this.line = line;
  }
}
class Get {
  constructor(line) {
    this.line = line;
  }
}
class Bang {
  constructor(line) {
    this.line = line;
  }
}
class OpenSquare {
  constructor(line) {
    this.line = line;
  }
}
class CloseSquare {
  constructor(line) {
    this.line = line;
  }
}
class If {
  constructor(line) {
    this.line = line;
  }
}
class Else {
  constructor(line) {
    this.line = line;
  }
}
class Or {
  constructor(line) {
    this.line = line;
  }
}
class And {
  constructor(line) {
    this.line = line;
  }
}
class TripleEq {
  constructor(line) {
    this.line = line;
  }
}
class NotTripleEq {
  constructor(line) {
    this.line = line;
  }
}
class While {
  constructor(line) {
    this.line = line;
  }
}
class Break {
  constructor(line) {
    this.line = line;
  }
}
class Continue {
  constructor(line) {
    this.line = line;
  }
}
class Do {
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
  tokenize() {
    let tokens = [];
    let line = 0;
    while (this.index < this.str.length) {
      if (this.scan(/\n/)) {
        line += 1;
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
        console.error("oh no");
      }
    }
    return tokens;
  }
}

export default Lexer;
