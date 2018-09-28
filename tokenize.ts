import * as assert from "assert";

export type State = "open" | "number";
export type Op = "+" | "-" | "*" | "/" | "^";
export type Operator = { type: "operator", op: Op };
export type Token = 
{ type: "number", value: number } |
Operator |
{ type: "leftparan" } |
{ type: "rightparan" } |
{ type: "newline" };

export function tokenize(input: string): Token[] {
    let i: number = 0;
    let tokens: Token[] = [];
    let state: State = "open";
    let digits: string = "";
    while (i < input.length) {
        let char: string = input[i];
        // console.log("state", state);
        // console.log("");
        // console.log("char", JSON.stringify(char));
        // console.log("");
        if (state === "open") {
            if ("0123456789".indexOf(char) !== -1) {
                state = "number";
                digits += char;
            } else if (char === " ") {
                state = "open";
            } else if (char === "(") {
                tokens.push({ type: "leftparan" });
            } else if (char === ")") {
                tokens.push({ type: "rightparan" });
            } else if (
                char === "+" ||
                char === "-" ||
                char === "*" ||
                char === "/" ||
                char === "^"
                ) {
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
            if ("0123456789".indexOf(char) !== -1) {
                digits += char;
            } else if (char === "(") {
                tokens.push({
                    type: "number",
                    value: Number(digits)
                });
                tokens.push({ type: "leftparan" });
                digits = "";
                state = "open";
            } else if (char === ")") {
                tokens.push({
                    type: "number",
                    value: Number(digits)
                });
                tokens.push({ type: "rightparan" });
                digits = "";
                state = "open";
            } else if (char === " ") {
                tokens.push({
                    type: "number",
                    value: Number(digits)
                });
                digits = "";
                state = "open";
            } else if (char === "\n") {
                tokens.push({
                    type: "number",
                    value: Number(digits)
                });
                digits = "";
                state = "open";
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
        tokens.push({
            type: "number",
            value: Number(digits)
        });
    }
    return tokens;
}

export function testTokenize(): void {
    assert.deepEqual(tokenize("1 + 1"), [
        { type: "number",   value: 1 },
        { type: "operator", op: "+" },
        { type: "number",   value: 1 }
    ]);

    assert.deepEqual(tokenize("(1 + 2) * 3"), [
        { type: "leftparan" },
        { type: "number",   value: 1 },
        { type: "operator", op: "+" },
        { type: "number",   value: 2 },
        { type: "rightparan" },
        { type: "operator", op: "*" },
        { type: "number",   value: 3 }
    ]);
}