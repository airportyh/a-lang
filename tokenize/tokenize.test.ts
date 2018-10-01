import { tokenize } from "./tokenize";

describe('tokenize', () => {
    it('tokenizes a number', () => {
        expect(tokenize('1'))
        .toEqual([{ type: 'number', value: 1 }]);
    });

    it('tokenizes a multi-digit number', () => {
        expect(tokenize('130'))
        .toEqual([{ type: 'number', value: 130 }]);
    });

    it('tokenizes a plus', () => {
        expect(tokenize('+'))
        .toEqual([{ type: 'operator', op: '+' }]);
    });

    it('tokenizes operators', () => {
        expect(tokenize('+-*/^'))
        .toEqual([
            { type: 'operator', op: '+' },
            { type: 'operator', op: '-' },
            { type: 'operator', op: '*' },
            { type: 'operator', op: '/' },
            { type: 'operator', op: '^' }
        ]);
    });

    it('tokenizes multiple tokens', () => {
        expect(tokenize('1+2'))
        .toEqual([
            { type: 'number', value: 1 },
            { type: 'operator', op: '+' },
            { type: 'number', value: 2 }
        ]);
    });

    it('ignores spaces in between', () => {
        expect(tokenize('1 +  2'))
        .toEqual([
            { type: 'number', value: 1 },
            { type: 'operator', op: '+' },
            { type: 'number', value: 2 }
        ]);
    });

    it("tokenizes paranthesis", () => {
        expect(tokenize('(1) + 2'))
        .toEqual([
            { type: 'leftparan' },
            { type: 'number', value: 1 },
            { type: 'rightparan' },
            { type: 'operator', op: '+' },
            { type: 'number', value: 2 }
        ]);
    });

    it("tokenizes this complex combination", () => {
        expect(tokenize("(1 + 2) * 3"))
        .toEqual([
            { type: "leftparan" },
            { type: "number",   value: 1 },
            { type: "operator", op: "+" },
            { type: "number",   value: 2 },
            { type: "rightparan" },
            { type: "operator", op: "*" },
            { type: "number",   value: 3 }
        ]);
    });

    it("tokenizes and ignores spaces inside of parans", () => {
        expect(tokenize("( 1 + 2 ) * 3"))
        .toEqual([
            { type: "leftparan" },
            { type: "number",   value: 1 },
            { type: "operator", op: "+" },
            { type: "number",   value: 2 },
            { type: "rightparan" },
            { type: "operator", op: "*" },
            { type: "number",   value: 3 }
        ]);
    });

    it("tokenizes newlines", () => {
        expect(tokenize("1\n2"))
        .toEqual([
            { type: 'number', value: 1 },
            { type: 'newline' },
            { type: 'number', value: 2 }
        ]);
        expect(tokenize("+\n-"))
        .toEqual([
            { type: 'operator', op: '+' },
            { type: 'newline' },
            { type: 'operator', op: '-' }
        ]);
    });

    it("tokenizes a leftparan after a number", () => {
        expect(tokenize("1(2)"))
        .toEqual([
            { type: 'number', value: 1 },
            { type: 'leftparan' },
            { type: 'number', value: 2 },
            { type: 'rightparan' }
        ]);
    });

    it("tokenizes words", () => {
        expect(tokenize("a bear ate a frog"))
        .toEqual([
            { type: 'word', word: 'a' },
            { type: 'word', word: 'bear' },
            { type: 'word', word: 'ate' },
            { type: 'word', word: 'a' },
            { type: 'word', word: 'frog' }
        ]);
    });

    it("tokenizes words and allows words to have capitalization and numbers", () => {
        expect(tokenize("pEoPle1 * Bears2"))
        .toEqual([
            { type: 'word', word: 'pEoPle1' },
            { type: 'operator', op: '*' },
            { type: 'word', word: 'Bears2' }
        ]);
    });

    // Indented blocks
    // https://en.wikipedia.org/wiki/Off-side_rule
        
    // it("tokenizes indentation blocks", () => {
    //     const code = [
    //         "if n:",
    //         "   print(n)"
    //     ].join("\n");
    //     expect(tokenize(code))
    //     .toEqual([
    //         { type: 'word', word: 'if' },
    //         { type: 'word', word: 'n' },
    //         { type: 'blockbegin' },
    //         { type: 'word', word: 'print' },
    //         { type: 'leftparan' },
    //         { type: 'word', word: 'n' },
    //         { type: 'rightparan' },
    //         { type: 'blockend' },
    //     ]);
    // });
})