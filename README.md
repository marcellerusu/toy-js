# toy-js

Toy compile to js language, developed as a youtube series to attempt to build a bootstrapped compiler/transpiler

See the youtube series [here](https://www.youtube.com/watch?v=TXEn17hBAFc&list=PLEpvTEuFyPtrD2gYvX277Q8wMpAA3qz7R)

# Progress

- [x] can compile the lexer
- [x] can compile the parser
- [ ] can compile the codegen

# Syntax

this snippet shows off some of the usable features so far

```
let ten = comptime! 5 + 5
def add(a, b)
  return undefined if !a || !b
  return a + b
end

print(ten)

dataclass Person(name, age)

let p = new Person("marcelle", 25)

class Lexer(program_string)

# more, see the .lang source files for mroe

```
