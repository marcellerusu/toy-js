# toy-js

A compile-to-js language written in itself

So far it has a semi-functional formatter and type checker is in progress

Some of the work has been done on [youtube](https://www.youtube.com/watch?v=TXEn17hBAFc&list=PLEpvTEuFyPtrD2gYvX277Q8wMpAA3qz7R)

The results are as of bootstrapping there were ~1500 lines of toy-js vs the ~2000 lines of javascript, meaning there's been a roughly 25% reduction in code size. This is mostly due to the dataclass syntax.

# Progress

## Bootstrapping [DONE]

- [x] can compile the lexer
- [x] can compile the parser
- [x] can compile the codegen

## Formatting

- [x] can format the formatter
- [ ] can format lexer
- [ ] can format parser
- [ ] can format codegen

## Type Checker

- [x] basic functions
- [x] primitives (number, string)
- [x] builtins for console
- [x] basic let type inference
- [x] infer array type
- [ ] lexer.lang
  - [x] #scan
  - [x] getters & instance var defs
- [ ] ... more

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

# more, see the .lang source files for more

```

https://justforfunnoreally.dev/
