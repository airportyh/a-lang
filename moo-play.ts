import * as moo from "moo";

const lexer = moo.compile({
    whitespace: / +/,
    number: /[0-9]+(?:\.[0-9]+)?/,
    operator: /[\+\-\*\/]/
});

lexer.reset("1 / 1");
console.log(lexer.next());
console.log(lexer.next());
console.log(lexer.next());
console.log(lexer.next());
console.log(lexer.next());