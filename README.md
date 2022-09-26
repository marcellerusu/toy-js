# Why am I doing this?

https://justforfunnoreally.dev/

# toy-js

A compile-to-js language written in itself

See the youtube series [here](https://www.youtube.com/watch?v=TXEn17hBAFc&list=PLEpvTEuFyPtrD2gYvX277Q8wMpAA3qz7R)

The results are as of bootstrapping there were ~1500 lines of toy-js vs the ~2000 lines of javascript, meaning there's been a roughly 25% reduction in code size. This is mostly due to the dataclass syntax.


# Progress

- [x] can compile the lexer
- [x] can compile the parser
- [x] can compile the codegen

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

# more, see the .lang source files for more

```
