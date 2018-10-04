import * as assert from "assert";
import { isNumber } from "util";

export type State = "open" | "number" | "word" | "start-indent-block" | "collect-line-indent" | "collect-string";
export type Op = "+" | "-" | "*" | "/" | "^";
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
{ type: "string", string: string };

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

function isLetterOrDigit(char: string) {
    return isLetter(char) || isDigit(char);
}

function isDigit(char: string) {
    const charCode = char.charCodeAt(0);
    return charCode >= zeroCharCode && charCode <= nineCharCode;
}

function isOperator(char: string): char is Op {
    return "+-*/^><=,".indexOf(char) !== -1;
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
        // console.log("state", state);
        // console.log("indentStack", indentStack);
        // console.log("char", char);
        if (state === "collect-line-indent") {
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
        } else if (state === "open") {
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
            } else if (char === '"') {
                state = "collect-string";
            } else {
                throw new Error("Does not compute: " + JSON.stringify(char));
            }
        } else if (state === "number") {
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
            } else if (char === '"') {
                pushNumber();
                state = "collect-string";
            } else {
                throw new Error("Does not compute: " + JSON.stringify(char));
            }
        } else if (state === "word") {
            if (isLetterOrDigit(char)) {
                word += char;
            } else if (char === "(") {
                pushWord();
                tokens.push({ type: "leftparan" });
            } else if (char === ")") {
                pushWord();
                tokens.push({ type: "rightparan" });
            } else if (char === " ") {
                pushWord();
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
            } else if (char === '"') {
                pushWord();
                state = "collect-string";
            } else {
                throw new Error("Does not compute: " + JSON.stringify(char));
            }
        } else if (state === "start-indent-block") {
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
            } else {
                throw new Error("Does not compute: " + JSON.stringify(char));
            }
        } else if (state === "collect-string") {
            if (char === '"') {
                tokens.push({
                    type: 'string',
                    string: string
                });
                state = "open";
            } else {
                string += char;
            }
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