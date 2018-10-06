import { Op } from "./tokenize/tokenize";

interface Dictionary<T> {
    [key: string]: T;
}

type Statement = Assignment | FunctionCall | IfStatement;
type Assignment = { type: "assignment", lhs: Identifier, rhs: Expression };
type Identifier = { type: "identifier", name: string };
type Expression = BinaryExpression | Identifier | ArrayLiteral | StringLiteral | Num | FunctionCall | Negative;
type Negative = { type: "negative", value: Expression };
type Num = { type: "number", value: number };
type BinaryExpression = { type: "bin_op", op: Op, lhs: Expression, rhs: Expression };
type FunctionCall = { type: "function_call", fn: string, arguments: Expression[] };
type ArrayLiteral = { type: "array_literal", items: Expression[] };
type StringLiteral = { type: "string_literal", string: string };
type IfStatement = {
    type: "if_statement", 
    cond: Expression, 
    consequent: Statement[],
    alternate: Statement[]
};
type Value = any;
type ProgramContext = {
    [key: string]: number;
};

const functionMap: Dictionary<Function> = {
    print: (...args) => console.log(args.join("")),
    log: (n) => Math.log(n) / Math.log(10),
    log2: (n) => Math.log(n) / Math.log(2),
    ln: Math.log,
    sin: Math.sin,
    round: Math.round
}

const operatorMap: Dictionary<Function> = {
    "+": (n, m) => n + m,
    "-": (n, m) => n - m,
    "*": (n, m) => n * m,
    "/": (n, m) => n / m,
    "^": Math.pow,
    ">": (n, m) => n > m,
    "<": (n, m) => n < m,
};

export function evaluate(statements: Statement[], context: ProgramContext): void {
    return evaluateStatements(statements, context);
}

export function evaluateStatements(statements: Statement[], context: ProgramContext): void {
    for (let statement of statements) {
        evaluateStatement(statement, context);
    }
}

function evaluateStatement(statement: Statement, context: ProgramContext): void {
    if (statement.type === "assignment") {
        context[statement.lhs.name] = evaluateExpression(statement.rhs, context);
    } else if (statement.type === "function_call") {
        return evaluateExpression(statement, context);
    } else if (statement.type === "if_statement") {
        let cond = evaluateExpression(statement.cond, context);
        if (cond === true) {
            evaluateStatements(statement.consequent, context);
        } else if (cond === false) {
            evaluateStatements(statement.alternate, context);
        } else {
            throw new Error(`Condition result is supposed to be a boolean, but was ${JSON.stringify(cond)}`);
        }
    } else {
        throw new Error(`Unknown statement type ${statement["type"]}: : ${JSON.stringify(statement)}.`);
    }
}

function evaluateExpression(expression: Expression, context: ProgramContext): Value {
    if (expression.type === "number") {
        return expression.value;
    } else if (expression.type === "bin_op") {
        let lhs = evaluateExpression(expression.lhs, context);
        let rhs = evaluateExpression(expression.rhs, context);
        if (typeof lhs !== "number" || typeof rhs !== "number") {
            throw new Error(
                `Cannot perform ${JSON.stringify(lhs)}` +
                ` ${expression.op} ${JSON.stringify(rhs)} because` +
                `I can only do that with numbers.`);
        }
        return operatorMap[expression.op](lhs, rhs);
    } else if (expression.type === "identifier") {
        if (!(expression.name in context)) {
            throw new Error(`Variable ${expression.name} is not found.`);
        }
        return context[expression.name];
    } else if (expression.type === "array_literal") {
        return expression.items.map((item) => evaluateExpression(item, context));
    } else if (expression.type === "string_literal") {
        return expression.string;
    } else if (expression.type === "function_call") {
        let args = expression.arguments.map((arg) => evaluateExpression(arg, context));
        return functionMap[expression.fn](...args);
    } else if (expression.type === "negative") {
        return - evaluateExpression(expression.value, context);
    } else {
        throw new Error(`Unknown expression type ${expression["type"]}: ${JSON.stringify(expression)}`);
    }
}