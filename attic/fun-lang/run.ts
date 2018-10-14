import * as nearley from "nearley";
import * as grammar from "./grammar.js";
import * as fs from "fs";

// Create a Parser object from our grammar.
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
const code = fs.readFileSync("./example.code") + "";

parser.feed(code);

console.log(JSON.stringify(parser.results, null, "  "));