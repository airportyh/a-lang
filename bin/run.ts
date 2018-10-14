import * as nearley from "nearley";
import * as grammar from "../parser/parser.js";
import * as fs from "fs";
import { tokenize } from "../tokenize/tokenize";
import { evaluate } from "../evaluate/evaluate";

const filename = process.argv[2];

if (!filename) {
    console.log("Expected a file name.");
    process.exit(1);
}
console.log(`Executing file "${filename}"`);

// Create a Parser object from our grammar.
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
const code = fs.readFileSync(filename) + "";
console.log("Program:");
console.log("----------------------------------------------");
const lines = code.split("\n");
lines.forEach((line, idx) => {
    console.log(`${idx + 1}:  ${line}`);
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
if (parser.results.length === 0) {
    console.log("No parse tree found.");
    process.exit(1);
}
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