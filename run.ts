import * as nearley from "nearley";
import * as grammar from "./nearley-grammar.js";
import * as fs from "fs";
import { tokenize } from "./tokenize/tokenize";
import { evaluate } from "./evaluate";

// Create a Parser object from our grammar.
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
const code = fs.readFileSync("./example.code") + "";
console.log("Program:");
console.log("----------------------------------------------");
const lines = code.split("\n");
lines.forEach((line, idx) => {
    console.log(`${idx + 1}\t${line}`);
});
console.log();

const tokens = tokenize(code);
console.log("Lexer Output:")
console.log("----------------------------------------------");
tokens.forEach((token, idx) => {
    console.log(idx, token);
});
console.log();

parser.feed(tokens);
const ast = parser.results[0][0];
console.log("Parser Output:");
console.log("----------------------------------------------");
console.log(JSON.stringify(ast, null, "  "));
console.log();

console.log("Program Output:");
console.log("----------------------------------------------");
const context = {};
evaluate(ast, context);

console.log("");
console.log("End Program State:");
console.log("----------------------------------------------");
console.log(context);