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
}
import fs from "fs";
import Lexer from "./lexer.mjs";
import Parser from "./parser.mjs";
import TypeChecker from "./type_checker.mjs";
import CodeGen from "./codegen.mjs";
let [, , file_name, option] = process.argv;
let str = fs.readFileSync(file_name).toString();
let lexer = new Lexer(str);
let tokens = lexer.tokenize();
let parser = new Parser(tokens);
let ast = parser.parse();
if (option==="-t") {
  new TypeChecker(ast).check();
};
let code_gen = new CodeGen(ast);
let js = code_gen.eval();
console.log(js);

