import { parse } from "./peg-calc-parser";
import * as fs from "fs";
import * as util from "util";
import { evaluateAST } from "./evaluate";
let code = fs.readFileSync("./example.code") + "";
let ast = parse(code);
console.log(util.inspect(ast, { depth: 10 }));
// evaluateAST(ast);
