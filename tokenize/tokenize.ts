import * as assert from "assert";

export type State = "open" | "number" | "word" | "start-indent-block" | "collect-line-indent" | "collect-string";
export type Op = "+" | "-" | "*" | "/" | "^" | ">" | "<" | "=" | "[" | "]" | "==" | ">=" | "<=" | ",";
const operators = new Set([
    "+", "-", "*", "/", "^", ">", "<", "=", "[", "]",
    "==", ">=", "<=", ","
]);
export type Operator = { type: "operator", op: Op };
export type Token = 
{ type: "number", value: number } |
Operator |
{ type: "leftparan" } |
{ type: "rightparan" } |
{ type: "newline" } |
{ type: "word", word: string } |
{ type: "blockbegin" } |
{ type: "blockend" } |
{ type: "string_literal", string: string };

type IndentChar = " " | "\t";

const aCharCode = 'a'.charCodeAt(0);
const zCharCode = 'z'.charCodeAt(0);
const ACharCode = 'A'.charCodeAt(0);
const ZCharCode = 'Z'.charCodeAt(0);
const zeroCharCode = '0'.charCodeAt(0);
const nineCharCode = '9'.charCodeAt(0);

function isLetter(char: string) {
    const charCode = char.charCodeAt(0);
    return (charCode >= aCharCode && charCode <= zCharCode) || 
        (charCode >= ACharCode && charCode <= ZCharCode);
}

function isLetterOrDigitOrUnderscore(char: string) {
    return isLetter(char) || isDigit(char) || char === "_";
}

function isDigit(char: string) {
    const charCode = char.charCodeAt(0);
    return charCode >= zeroCharCode && charCode <= nineCharCode;
}

function isOperator(char: string): char is Op {
    return operators.has(char);
}

function isIndentChar(char: string): char is IndentChar {
    return char === " " || char === "\t";
}

function peek<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
}

export function tokenize(input: string): Token[] {
    let i: number = 0;
    let tokens: Token[] = [];
    let state: State = "collect-line-indent";
    let digits: string = "";
    let word: string = "";
    let indentation: string = "";
    let indentStack: string[] = [];
    let string: string = "";
    while (i < input.length) {
        let char: string = input[i];
        let twoChar: string = input.substr(i, 2);
        // console.log("state", state);
        // console.log("indentStack", indentStack);
        // console.log("char", char);
        switch (state) {
            case "collect-line-indent":
                if (isIndentChar(char)) {
                    indentation += char;
                } else {
                    while (indentStack.length > 0 &&
                        peek(indentStack) !== indentation) {
                        indentStack.pop();
                        tokens.push({ type: "blockend" });
                    }
                    if (indentStack.length === 0 && indentation !== "") {
                        throw new Error("Unexpected indentation");
                    }
                    indentation = "";
                    state = "open";
                    continue;
                }
                break;
            case "open":
                if (isDigit(char)) {
                    state = "number";
                    digits += char;
                } else if (isLetter(char)) {
                    word = char;
                    state = "word";
                } else if (char === " ") {
                    state = "open";
                } else if (char === "(") {
                    tokens.push({ type: "leftparan" });
                } else if (char === ")") {
                    tokens.push({ type: "rightparan" });
                } else if (isOperator(twoChar)) {
                    tokens.push({
                        type: "operator",
                        op: twoChar
                    });
                    i = i + 1;
                } else if (isOperator(char)) {
                    tokens.push({
                        type: "operator",
                        op: char
                    });
                } else if (char === "\n") {
                    tokens.push({
                        type: "newline"
                    });
                    state = "collect-line-indent";
                } else if (char === ":") {
                    startIndent();
                    state = "start-indent-block";
                } else if (char === '"') {
                    string = "";
                    state = "collect-string";
                } else {
                    throw new Error(`Tokenizer error: encountered ${JSON.stringify(char)} in state ${state}.`);
                }
                break;
            case "number":
                if (isDigit(char)) {
                    digits += char;
                } else if (char === "(") {
                    pushNumber();
                    tokens.push({ type: "leftparan" });
                } else if (char === ")") {
                    pushNumber();
                    tokens.push({ type: "rightparan" });
                } else if (char === " ") {
                    pushNumber();
                } else if (isOperator(twoChar)) {
                    pushNumber();
                    tokens.push({
                        type: "operator",
                        op: twoChar
                    });
                    i = i + 1;
                } else if (isOperator(char)) {
                    pushNumber();
                    tokens.push({
                        type: "operator",
                        op: char
                    });
                } else if (char === "\n") {
                    pushNumber();
                    tokens.push({
                        type: "newline"
                    });
                    state = "collect-line-indent";
                } else if (char === ":") {
                    pushNumber();
                    startIndent();
                    state = "start-indent-block";
                } else if (char === '"') {
                    pushNumber();
                    string = "";
                    state = "collect-string";
                } else {
                    throw new Error(`Tokenizer error: encountered ${JSON.stringify(char)} in state ${state}.`);
                }
                break;
            case "word":
                if (isLetterOrDigitOrUnderscore(char)) {
                    word += char;
                } else if (char === "(") {
                    pushWord();
                    tokens.push({ type: "leftparan" });
                } else if (char === ")") {
                    pushWord();
                    tokens.push({ type: "rightparan" });
                } else if (char === " ") {
                    pushWord();
                } else if (isOperator(twoChar)) {
                    pushWord();
                    tokens.push({
                        type: "operator",
                        op: twoChar
                    });
                    i = i + 1;
                } else if (isOperator(char)) {
                    pushWord();
                    tokens.push({
                        type: "operator",
                        op: char
                    });
                } else if (char === "\n") {
                    pushWord();
                    tokens.push({
                        type: "newline"
                    });
                    state = "collect-line-indent";
                } else if (char === ":") {
                    pushWord();
                    startIndent();
                    state = "start-indent-block";
                } else if (char === '"') {
                    pushWord();
                    string = "";
                    state = "collect-string";
                } else {
                    throw new Error(`Tokenizer error: encountered ${JSON.stringify(char)} in state ${state}.`);
                }
                break;
            case "start-indent-block":
                if (char === " " || char === "\t") {
                    indentation += char;
                } else if (isLetter(char)) {
                    word = char;
                    pushIndent();
                    state = "word";
                } else if (isDigit(char)) {
                    digits = char;
                    pushIndent();
                    state = "number";
                } else if (char === "(") {
                    pushIndent();
                    state = "open";
                    tokens.push({ type: "leftparan" });
                } else if (char === ")") {
                    pushIndent();
                    state = "open";
                    tokens.push({ type: "rightparan" });
                } else if (isOperator(twoChar)) {
                    pushIndent();
                    state = "open";
                    tokens.push({
                        type: "operator",
                        op: twoChar
                    });
                    i = i + 1;
                } else if (isOperator(char)) {
                    pushIndent();
                    state = "open";
                    tokens.push({
                        type: "operator",
                        op: char
                    });
                } else if (char === "\n") {
                    pushIndent();
                    tokens.push({
                        type: "newline"
                    });
                    state = "collect-line-indent";
                } else if (char === '"') {
                    pushIndent();
                    string = "";
                    state = "collect-string";
                } else {
                    throw new Error(`Tokenizer error: encountered ${JSON.stringify(char)} in state ${state}.`);
                }
                break;
            case "collect-string":
                if (char === '"') {
                    tokens.push({
                        type: 'string_literal',
                        string: string
                    });
                    string = "";
                    state = "open";
                } else if (char === '\\') {
                    const nextChar = input[++i];
                    if (nextChar === '"') {
                        string += nextChar;
                    } else if (nextChar === 'n') {
                        string += "\n";
                    } else if (nextChar === 't') {
                        string += "\t";
                    } else if (nextChar === 'r') {
                        string += "\r";
                    } else {
                        string += nextChar;
                    }
                } else {
                    string += char;
                }
                break;
        }
        i++;
    }
    if (state === "number") {
        pushNumber();
    } else if (state === "word") {
        pushWord();
    }

    while (indentStack.length) {
        indentStack.pop();
        tokens.push({ type: "blockend" });
    }

    return tokens;

    function pushNumber(): void {
        tokens.push({
            type: "number",
            value: Number(digits)
        });
        digits = "";
        state = "open";
    }

    function pushWord(): void {
        tokens.push({
            type: "word",
            word
        });
        word = "";
        state = "open";
    }

    function startIndent(): void {
        tokens.push({
            type: "blockbegin"
        });
        assert.equal(input[i + 1], "\n");
        tokens.push({
            type: "newline"
        });
        i++;
        indentation = "";
        state = "start-indent-block";
    }

    function pushIndent(): void {
        if (indentation.length === 0) { 
            throw new Error("Indentation expected here.");
        }
        let prevIndent = peek(indentStack) || "";
        if (indentation.substr(0, prevIndent.length) !== prevIndent) {
            // the previous indent must be the prefix of the
            // new indent, otherwise the indentation is invalid
            throw new Error("Invalid indentation.");
        }
        indentStack.push(indentation);
        indentation = "";
    }
}