import { parse } from "./calc";
import * as util from "util";
import { evaluateAST } from "./evaluate";

let ast = parse("x = 24 / 6 - 1\ny = 4");
console.log(util.inspect(ast, { depth: 10 }));
// console.log("answer:", evaluateAST(ast));
