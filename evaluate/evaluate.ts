import { Op } from "../tokenize/tokenize";
import * as _ from "lodash";
import * as readline from "readline";

type Dictionary<T> = {
    [key: string]: T
};

type Statement = Assignment | FunctionCall | IfStatement | WhileLoop | FunctionDefinition | ReturnStatement;
type Assignment = { type: "assignment", lhs: Identifier, rhs: Expression };
type Identifier = { type: "identifier", name: string };
type Expression = BinaryExpression | Identifier | ArrayLiteral | StringLiteral | Num | FunctionCall | Negative | IndexAccess;
type Negative = { type: "negative", value: Expression };
type Num = { type: "number", value: number };
type WhileLoop = { type: "while_loop", cond: Expression, body: Statement[] };
type BinaryExpression = { type: "bin_op", op: Op, lhs: Expression, rhs: Expression };
type FunctionCall = { type: "function_call", fn: string, arguments: Expression[] };
type ArrayLiteral = { type: "array_literal", items: Expression[] };
type StringLiteral = { type: "string_literal", string: string };
type IndexAccess = { type: "index_access", subject: Expression, index: Expression };
type FunctionDefinition = {
    type: "function_definition", 
    name: string, 
    parameters: Identifier[],
    body: Statement[]
};
type ReturnStatement = {
    type: "return_statement",
    value: Expression
};

type IfStatement = {
    type: "if_statement", 
    clauses: IfClause[],
    alternate: Statement[]
};

type IfClause = {
    type: "if_clause",
    cond: Expression,
    consequent: Statement[]
};

type Value = any;
type ProgramContext = {
    [key: string]: any;
};

const functionMap: Dictionary<Function> = {
    print: (...args) => console.log(args.join("")),
    log: (n) => Math.log(n) / Math.log(10),
    log2: (n) => Math.log(n) / Math.log(2),
    ln: Math.log,
    sin: Math.sin,
    round: Math.round,
    sqr: (n) => n * n,
    sqrt: Math.sqrt,
    length: lengthFn,
    string: String,
    number: Number
};

const asyncFunctionMap: Dictionary<Function> = {
    prompt: promptFn
};

function promptFn(prompt) {
    return new Promise((accept) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(prompt + " ", (answer) => {
            accept(answer);
            rl.close();
        });
    });
}

function lengthFn(thing) {
    if (!_.isArray(thing) && !_.isString(thing)) {
        throw new Error(`Attempting to get the length of something that is neither a string or an array (${JSON.stringify(thing)}). Sorry but I can't do that, Dave.`);
    }
    return thing.length;
}

function addFn(n, m) {
    if ((_.isArray(n) && !_.isArray(m)) ||
        (_.isArray(m) && !_.isArray(n))) {
        throw new Error(`Attempting to add an array (${JSON.stringify(n)}) to a non-array (${JSON.stringify(m)}). Sorry but I can't do that, Dave.`);
    } else if (_.isArray(n) && _.isArray(m)) {
        return n.concat(m);
    }
    const typeN = typeof n;
    const typeM = typeof m;
    if (typeN !== typeM) {
        throw new Error(`Attempting to add a ${typeN} (${JSON.stringify(n)}) to a ${typeM} (${JSON.stringify(m)}). Sorry but I can't do that, Dave.`);
    } else {
        return n + m;
    }
}

const operatorMap: Dictionary<Function> = {
    "+": addFn,
    "-": (n, m) => n - m,
    "*": (n, m) => n * m,
    "/": (n, m) => n / m,
    "^": Math.pow,
    ">": (n, m) => n > m,
    "<": (n, m) => n < m,
    ">=": (n, m) => n >= m,
    "<=": (n, m) => n <= m,
    "==": (n, m) => n === m
};

export async function evaluate(statements: Statement[], context: ProgramContext): Promise<void> {
    return await evaluateStatements(statements, context);
}

export async function evaluateStatements(statements: Statement[], context: ProgramContext): Promise<void> {
    for (let statement of statements) {
        await evaluateStatement(statement, context);
    }
}

async function evaluateStatement(statement: Statement, context: ProgramContext): Promise<void> {
    if (statement.type === "assignment") {
        context[statement.lhs.name] = await evaluateExpression(statement.rhs, context);
    } else if (statement.type === "function_call") {
        return await evaluateExpression(statement, context);
    } else if (statement.type === "if_statement") {
        let cond: boolean = false;
        for (const clause of statement.clauses) {
            cond = await evaluateExpression(clause.cond, context);
            if (typeof cond !== "boolean") {
                throw new Error(`Condition result is supposed to be a boolean, but was ${JSON.stringify(cond)}`);
            }
            if (cond) {
                await evaluateStatements(clause.consequent, context);
                break;
            }
        }
        if (!cond) {
            await evaluateStatements(statement.alternate, context);
        }
    } else if (statement.type === "while_loop") {
        let cond = await evaluateExpression(statement.cond, context);
        while (cond === true) {
            await evaluateStatements(statement.body, context);
            cond = await evaluateExpression(statement.cond, context);
            if (typeof cond !== "boolean") {
                throw new Error(`Condition result is supposed to be a boolean, but was ${JSON.stringify(cond)}`);
            }
        }
    } else if (statement.type === "function_definition") {
        context[statement.name] = statement;
    } else {
        throw new Error(`Unknown statement type ${statement["type"]}: : ${JSON.stringify(statement)}.`);
    }
}

async function evaluateExpression(expression: Expression, context: ProgramContext): Promise<Value> {
    if (expression.type === "number") {
        return expression.value;
    } else if (expression.type === "bin_op") {
        let lhs = await evaluateExpression(expression.lhs, context);
        let rhs = await evaluateExpression(expression.rhs, context);
        return operatorMap[expression.op](lhs, rhs);
    } else if (expression.type === "identifier") {
        if (!(expression.name in context)) {
            throw new Error(`Variable ${expression.name} is not found.`);
        }
        return context[expression.name];
    } else if (expression.type === "array_literal") {
        return await Promise.all(expression.items.map((item) => evaluateExpression(item, context)));
    } else if (expression.type === "string_literal") {
        return expression.string;
    } else if (expression.type === "function_call") {
        let args = await Promise.all(expression.arguments.map((arg) => evaluateExpression(arg, context)));
        let fn = context[expression.fn];
        if (fn) {
            return await evaluateCustomFunction(fn, args, context);
        } else if (expression.fn in functionMap) {
            fn = functionMap[expression.fn];
            return fn(...args);
        } else if (expression.fn in asyncFunctionMap) {
            fn = asyncFunctionMap[expression.fn];
            return await fn(...args);
        } else {
            throw new Error(`Function ${expression.fn} is not available.`);
        }
    } else if (expression.type === "negative") {
        return - await evaluateExpression(expression.value, context);
    } else if (expression.type === "index_access") {
        const subject = await evaluateExpression(expression.subject, context);
        const index = await evaluateExpression(expression.index, context);
        if (!_.isArray(subject) && !_.isString(subject)) {
            throw new Error(`Attempting to perform index access of something that is neither an array or string: ${JSON.stringify(subject)}. Sorry, but I can't do that Dave.`)
        }
        return subject[index];
    } else {
        throw new Error(`Unknown expression type ${expression["type"]}: ${JSON.stringify(expression)}`);
    }
}

async function evaluateCustomFunction(fun: FunctionDefinition, args: any[], context: ProgramContext): Promise<any> {
    for (let i = 0; i < fun.parameters.length; i++) {
        let param = fun.parameters[i];
        context[param.name] = args[i];
    }
    for (let statement of fun.body) {
        if (statement.type === "return_statement") {
            let result = await evaluateExpression(statement.value, context);
            return result;
        } else {
            await evaluateStatement(statement, context);
        }
    }
    return null;
}