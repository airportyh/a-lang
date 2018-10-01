import * as nearley from "nearley";
import * as grammar from "./nearley-grammar.js";
import * as fs from "fs";
import { tokenize } from "./tokenize/tokenize";

// Create a Parser object from our grammar.
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
const code = fs.readFileSync("./example.code") + "";
const tokens = tokenize(code);
tokens.forEach((token, idx) => {
    console.log(idx, token);
});

parser.feed(tokens);

// parser.results is an array of possible parsings.
console.log(JSON.stringify(parser.results, null, "  "));