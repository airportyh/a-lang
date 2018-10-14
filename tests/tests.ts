import * as assert from "assert";
import { toRPN, parse } from "./shunting-yard-parser";
import * as util from "util";
import { evaluate } from "./evaluate";
import { tokenize } from "./tokenize";

assert.deepEqual(toRPN("1 + 1"), 
    [{ type: 'number', value: 1 },
    { type: 'number', value: 1 },
    { type: 'operator', op: '+' }
    ]);

assert.deepEqual(toRPN("2 - 4 + 5"),
    [{ type: 'number', value: 2 },
    { type: 'number', value: 4 },
    { type: 'operator', op: '-' },
    { type: 'number', value: 5 },
    { type: 'operator', op: '+' }
    ]);

assert.deepEqual(toRPN("2 + 4 * 5"),
    [{ type: 'number', value: 2 },
    { type: 'number', value: 4 },
    { type: 'number', value: 5 },
    { type: 'operator', op: '*' },
    { type: 'operator', op: '+' }]);

assert.deepEqual(toRPN("2 * 4 + 5"),
    [{ type: 'number', value: 2 },
    { type: 'number', value: 4 },
    { type: 'operator', op: '*' },
    { type: 'number', value: 5 },
    { type: 'operator', op: '+' }]);

assert.deepEqual(toRPN("2 * 4 - 6 / 2 + 9"),
    [{ type: 'number', value: 2 },
    { type: 'number', value: 4 },
    { type: 'operator', op: '*' },
    { type: 'number', value: 6 },
    { type: 'number', value: 2 },
    { type: 'operator', op: '/' },
    { type: 'operator', op: '-' },
    { type: 'number', value: 9 },
    { type: 'operator', op: '+' }]);

assert.deepEqual(toRPN("(2 - 4) * 5"), 
    [{ type: 'number', value: 2 },
    { type: 'number', value: 4 },
    { type: 'operator', op: '-' },
    { type: 'number', value: 5 },
    { type: 'operator', op: '*' }]);

assert.equal(evaluate("2 * 4 - 6 / 2 + 9"), 14);
assert.equal(evaluate("(5 - 2) * 5"), 15);

// const code = 
// `1 + 2
// 2 * 5 
// 3 + 3`;

// assert.deepEqual(tokenize(code), 
//     [ { type: 'number', value: 1 },
//     { type: 'operator', op: '+' },
//     { type: 'number', value: 2 },
//     { type: 'newline' },
//     { type: 'number', value: 2 },
//     { type: 'operator', op: '*' },
//     { type: 'number', value: 5 },
//     { type: 'newline' },
//     { type: 'number', value: 3 },
//     { type: 'operator', op: '+' },
//     { type: 'number', value: 3 } ]);

// console.log(toRPN(code));

// assert.deepEqual(parse(code), [
//     { lhs: 1, op: '+', rhs: 2 },
//     { lhs: 2, op: '*', rhs: 5 },
//     { lhs: 3, op: '+', rhs: 3 }
// ]);

console.log("ok");