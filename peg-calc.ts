import { parse } from "./calc";
import * as util from "util";
import { evaluateAST } from "./evaluate";

let code = 
`x = 24 / 6 - 1
y = x * x
print(x, 3 + y)`;
let ast = parse(code);
console.log(util.inspect(ast, { depth: 10 }));
// console.log("answer:", evaluateAST(ast));
