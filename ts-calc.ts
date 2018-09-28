import * as assert from "assert";
import { toRPN, parse } from "./shunting-yard-parser";
import * as util from "util";
import { evaluate } from "./evaluate";

assert.deepEqual();

assert.equal(evaluate("2 * 4 - 6 / 2 + 9"), 14);

console.log("ok");