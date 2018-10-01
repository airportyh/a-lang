import * as nearley from "nearley";
import * as grammar from "./nearley-grammar.js";
import { tokenize } from "./tokenize";

// Create a Parser object from our grammar.
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

parser.feed(tokenize("1 + (2 * 2)"));

// parser.results is an array of possible parsings.
console.log(JSON.stringify(parser.results, null, "  "));