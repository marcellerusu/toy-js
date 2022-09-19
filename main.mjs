import fs from "fs";
import Lexer from "./lexer.mjs";
import Parser from "./parser.mjs";
import CodeGen from "./codegen.mjs";

let str = fs.readFileSync("./test.lang").toString();

let lexer = new Lexer(str);
let tokens = lexer.tokenize();
let parser = new Parser(tokens);
let ast = parser.parse();
let code_gen = new CodeGen(ast);
let js = code_gen.eval();

// console.log(tokens);
// console.log(ast[0].entries[2]);
// console.log(ast);
console.log(js);
