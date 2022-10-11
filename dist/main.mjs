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
Array.prototype.zip = function(other) {
  let zipped = [];
  for (let i = 0; i < this.length; i++) {
    zipped.push([this[i], other[i]]);
  }
  return zipped;
}
import fs from "fs";
import Lexer from "./lexer.mjs";
import Parser from "./parser.mjs";
import TypeChecker from "./type_checker.mjs";
import CodeGen from "./codegen.mjs";
import { inspect } from "util";
let [, , file_name, option] = process.argv;
let str = fs.readFileSync(file_name).toString();
let lexer = new Lexer(str);
let tokens = lexer.tokenize();
let parser = new Parser(tokens);
let ast = parser.parse();
if (option === "-t") {
  new TypeChecker(ast).check();
};
if (option === "-tc") {
  let tc = new TypeChecker(ast);
  tc.check();
  console.log(inspect(tc.types, { depth: null }));
  process.exit(0);
};
let code_gen = new CodeGen(ast);
let js = code_gen.eval();
console.log(js);

