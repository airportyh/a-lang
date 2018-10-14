import * as nearley from "nearley";
import * as yargs from "yargs";
import * as grammar from "../parser/parser.js";
import * as fs from "fs";
import { tokenize, Token } from "../tokenize/tokenize";
import { evaluate } from "../evaluate/evaluate";

main();

function main() {
    const args = yargs.argv;
    const filename = args._[0];

    if (!filename) {
        console.log("Expected a file name.");
        process.exit(1);
    }

    // Create a Parser object from our grammar.
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const code = fs.readFileSync(filename) + "";
    if (args.v) {
        printProgram(code);
    }

    const tokens = tokenize(code);
    if (args.v) {
        printLexerTokens(tokens);
    }

    parser.feed(tokens);
    if (parser.results.length === 0) {
        console.log("No parse tree found.");
        process.exit(1);
    }
    const ast = parser.results[0][0];
    if (args.v) {
        printParseTree(ast);
    }

    if (args.v) {
        console.log("Program Output:");
        console.log("----------------------------------------------");
    }
    const context = {};
    evaluate(ast, context);

    if (args.v) {
        printEndState(context);
    }
}

function printProgram(code: string): void {
    console.log("Program:");
    console.log("----------------------------------------------");
    const lines = code.split("\n");
    lines.forEach((line, idx) => {
        console.log(`${idx + 1}:  ${line}`);
    });
    console.log();
}

function printLexerTokens(tokens: Token[]): void {
    console.log("Lexer Output:")
    console.log("----------------------------------------------");
    tokens.forEach((token, idx) => {
        console.log(idx, token);
    });
    console.log();
}

function printParseTree(ast) {
    console.log("Parser Output:");
    console.log("----------------------------------------------");
    console.log(JSON.stringify(ast, null, "  "));
    console.log();
}

function printEndState(context) {
    console.log("");
    console.log("End Program State:");
    console.log("----------------------------------------------");
    console.log(context);
}
