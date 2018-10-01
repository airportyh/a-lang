import * as assert from "assert";
import { isNumber } from "util";

export type State = "open" | "number" | "word";
export type Op = "+" | "-" | "*" | "/" | "^";
export type Operator = { type: "operator", op: Op };
export type Token = 
{ type: "number", value: number } |
Operator |
{ type: "leftparan" } |
{ type: "rightparan" } |
{ type: "newline" } |
{ type: "word", word: string };

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
    return "+-*/^".indexOf(char) !== -1;
}

export function tokenize(input: string): Token[] {
    let i: number = 0;
    let tokens: Token[] = [];
    let state: State = "open";
    let digits: string = "";
    let word: string = "";
    while (i < input.length) {
        let char: string = input[i];
        if (state === "open") {
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
            } else {
                throw new Error("Does not compute: " + JSON.stringify(char));
            }
        }
        i++;
    }
    if (state === "number") {
        pushNumber();
    } else if (state === "word") {
        pushWord();
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
}