// Algorithm from https://en.wikipedia.org/wiki/Shunting-yard_algorithm

import { Token, tokenize, Op, Operator } from "./tokenize";
import * as assert from "assert";

export function toRPN(input: string): Token[] {
    let tokens = tokenize(input);
    let queue: Token[] = [];
    let operatorStack: Token[] = [];
    for (let token of tokens) {
        if (token.type === "number") {
            queue.push(token);
        } else if (token.type === "operator") {
            let currentOp = peek(operatorStack);
            while (currentOp && 
                currentOp.type === "operator" && 
                precedes(currentOp.op, token.op)) {
                queue.push(currentOp);
                operatorStack.pop()
                currentOp = peek(operatorStack);
            }
            operatorStack.push(token);
        } else if (token.type === "leftparan") {
            operatorStack.push(token);
        } else if (token.type === "rightparan") {
            while(operatorStack.length > 0 && peek(operatorStack).type !== "leftparan") {
                queue.push(operatorStack.pop());
            }
            assert.equal(operatorStack.pop().type, "leftparan");
        }
    }
    while(operatorStack.length > 0) {
        queue.push(operatorStack.pop());
    }
    return queue;
}

export function parse(input: string): Node {
    return buildAST(toRPN(input));
}

export type Node = number | { lhs: Node, op: Op, rhs: Node };

export function buildAST(rpnTokens: Token[]): Node {
    let stack: Node[] = [];
    for (let token of rpnTokens) {
        if (token.type === "operator") {
            let rhs = stack.pop();
            let lhs = stack.pop();
            stack.push({ lhs, op: token.op, rhs });
        } else if (token.type === "number") {
            stack.push(token.value);
        } else {
            throw new Error("Invalid token");
        }
    }
    return stack.pop();
}

function peek<T>(arr: T[]): T {
    return arr[arr.length - 1];
}

const precedenceTable = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "^": 3
};

function precedes(op1: Op, op2: Op): boolean {
    return precedenceTable[op1] >= precedenceTable[op2];
}
