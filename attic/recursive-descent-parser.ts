import { Op, tokenize, Token } from "./tokenize";
import * as assert from "assert";

// -- Grammar
// -- =======
// -- 3 + 2 * 4
// --
// -- Expr -> Expr + Term | Term
// -- Term -> Term * Factor | Factor
// -- Factor -> ( Expr ) | Number
// --
// -- Non-Left-Recursive Form
// -- =======================
// -- Expr -> Term Expr_
// -- Expr_ -> + Term Expr_ | Epsilon
// -- Term -> Factor Term_
// -- Term_ -> * Factor Term_ | Epsilon
// -- Factor -> ( Expr ) | Number

type Expr = { type: "expr", term: Term, expr_: Expr_ };
type Expr_ = 
{ type: "expr_rest", term: Term, expr_: Expr_ } |
{ type: "expr_epsilon" };
type Term = { type: "term", factor: Factor, term_: Term_ };
type Term_ = 
{ type: "term_rest", factor: Factor, term_: Term_ } |
{ type: "term_epsilon" };
type Factor = 
{ type: "expr", expr: Expr } |
{ type: "number", value: number };

export function parse(input: string): Expr {
    let tokens = tokenize(input);
    return parseExpr(tokens, 0);
}

function indent(amount: number) {
    return Array(amount + 1).join("  ");
}

function parseExpr(tokens: Token[], level: number): Expr {
    console.log(indent(level) + "parseExpr", tokens);
    let term = parseTerm(tokens, level + 1);
    let expr_ = parseExpr_(tokens, level + 1);
    return {
        type: "expr",
        term,
        expr_
    };
}

function parseExpr_(tokens: Token[], level: number): Expr_ {
    console.log(indent(level) + "parseExpr_", tokens);
    let token = tokens[0];
    if (token && token.type === "operator" && token.op === "+") {
        tokens.shift();
        let term = parseTerm(tokens, level + 1);
        let expr_ = parseExpr_(tokens, level + 1);
        return {
            type: "expr_rest",
            term,
            expr_
        };
    } else {
        return { type: "expr_epsilon" };
    }

}

function parseTerm(tokens: Token[], level: number): Term {
    console.log(indent(level) + "parseTerm", tokens);
    assert.notEqual(tokens.length, 0);
    let factor = parseFactor(tokens, level + 1);
    let term_ = parseTerm_(tokens, level + 1);
    return {
        type: "term",
        factor,
        term_
    };
}

function parseTerm_(tokens: Token[], level: number): Term_ {
    console.log(indent(level) + "parseTerm_", tokens);
    let token = tokens[0];
    if (token && token.type === "operator" && token.op === "*") {
        let operator = token;
        tokens.shift();
        let factor = parseFactor(tokens, level + 1);
        let term_ = parseTerm_(tokens, level + 1);
        return { type: "term_rest", factor: factor, term_: term_ };
    } else {
        return { type: "term_epsilon" };
    }
}

function parseFactor(tokens: Token[], level: number): Factor {
    console.log(indent(level) + "parseFactor", tokens);
    assert.notEqual(tokens.length, 0);
    let token = tokens[0];
    if (token.type === "number") {
        tokens.shift();
        return { type: "number", value: token.value };
    } else if (token.type === "leftparan") {
        tokens.shift();
        let expr = parseExpr(tokens, level + 1);
        assert.equal(tokens[0].type, "rightparan");
        return { type: "expr", expr: expr };
    } else {
        assert.fail("Unexpected state");
    }
}