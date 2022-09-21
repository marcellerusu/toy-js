class Panic extends Error {}
function panic(reason) {
  throw new Panic(reason);
}
import fs from "fs";
import Lexer from "./lexer.mjs";
import Parser from "./parser.mjs";
import CodeGen from "../codegen.mjs";
let [, , file_name] = process.argv;
let str = fs.readFileSync(file_name).toString();
let lexer = new Lexer(str);
let tokens = lexer.tokenize();
let parser = new Parser(tokens);
let ast = parser.parse();
let code_gen = new CodeGen(ast);
let js = code_gen.eval();
console.log(js);
