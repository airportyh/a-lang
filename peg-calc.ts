import { parse } from "./calc";
import * as util from "util";
import { evaluateAST } from "./evaluate";

let ast = parse("(1 + 2) * 3 - (6 / 2)");
console.log(util.inspect(ast, { depth: 10 }));
console.log("answer:", evaluateAST(ast));