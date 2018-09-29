import { parse } from "./peg-calc-parser";
import { Op } from "./tokenize";

export function evaluate(input: string): void {
    return evaluateAST(parse(input));
}

type Statement = Assignment | FunctionCall;
type Assignment = { type: "assignment", lhs: Identifier, rhs: Expression };
type Identifier = { type: "identifier", name: string };
type Expression = BinaryExpression | Identifier | Num;
type Num = { type: "number", value: number };
type BinaryExpression = { type: "bin_op", op: Op, lhs: Expression, rhs: Expression };
type FunctionCall = { type: "function_call", fn: Identifier, args: Expression[] };

type ProgramContext = {
    [key: string]: number;
};

export function evaluateAST(statements: Statement[]): void {
    let context: ProgramContext = {};
    for (let statement of statements) {
        evaluateStatement(statement, context);
    }
}

function evaluateStatement(statement: Statement, context: ProgramContext): void {
    if (statement.type === "assignment") {
        context[statement.lhs.name] = evaluateExpression(statement.rhs, context);
    } else if (statement.type === "function_call") {
        if (statement.fn.name === "print") {
            let args = evaluateExpression(statement.args[0], context);
            console.log(args);
        } else {
            throw new Error(`Function ${statement.fn.name} is not found.`);
        }
    }
}

function evaluateExpression(expression: Expression, context: ProgramContext): number {
    if (expression.type === "number") {
        return expression.value;
    } else if (expression.type === "bin_op") {
        let lhs = evaluateExpression(expression.lhs, context);
        let rhs = evaluateExpression(expression.rhs, context);
        if (expression.op === "+") {
            return lhs + rhs;
        } else if (expression.op === "-") {
            return lhs - rhs;
        } else if (expression.op === "*") {
            return lhs * rhs;
        } else if (expression.op === "/") {
            return lhs / rhs;
        } else if (expression.op === "^") {
            return Math.pow(lhs, rhs);
        }
    } else if (expression.type === "identifier") {
        if (!(expression.name in context)) {
            throw new Error(`Variable ${expression.name} is not found.`);
        }
        return context[expression.name];
    }
}