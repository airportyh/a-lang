import { Node, parse } from "./shunting-yard-parser";

export function evaluate(input: string): number {
    return evaluateAST(parse(input));
}

export function evaluateAST(node: Node): number {
    if (typeof node === "number") {
        return node;
    } else {
        let lhs = evaluateAST(node.lhs);
        let rhs = evaluateAST(node.rhs);
        if (node.op === "+") {
            return lhs + rhs;
        } else if (node.op === "-") {
            return lhs - rhs;
        } else if (node.op === "*") {
            return lhs * rhs;
        } else if (node.op === "/") {
            return lhs / rhs;
        } else if (node.op === "^") {
            return Math.pow(lhs, rhs);
        } else {
            throw new Error("Unknown operator:" + node.op);
        }
    }
}