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
        
    it("tokenizes indentation blocks", () => {
        const code = [
            "if n > 0:",
            "   print(n)"
        ].join("\n");
        expect(tokenize(code))
        .toEqual([
            { type: 'word', word: 'if' },
            { type: 'word', word: 'n' },
            { type: 'operator', op: '>' },
            { type: 'number', value: 0 },
            { type: 'blockbegin' },
            { type: 'newline' },
            { type: 'word', word: 'print' },
            { type: 'leftparan' },
            { type: 'word', word: 'n' },
            { type: 'rightparan' },
            { type: 'blockend' },
        ]);
    });

    it("tokenizes indentation blocks with multiple indented lines", () => {
        const code = [
            "if n > 0:",
            "   print(n)",
            "   print(n)",
            "   print(n)"
        ].join("\n");
        expect(tokenize(code))
        .toEqual([
            { type: 'word', word: 'if' },
            { type: 'word', word: 'n' },
            { type: 'operator', op: '>' },
            { type: 'number', value: 0 },
            { type: 'blockbegin' },
            { type: 'newline' },
            { type: 'word', word: 'print' },
            { type: 'leftparan' },
            { type: 'word', word: 'n' },
            { type: 'rightparan' },
            { type: 'newline' },
            { type: 'word', word: 'print' },
            { type: 'leftparan' },
            { type: 'word', word: 'n' },
            { type: 'rightparan' },
            { type: 'newline' },
            { type: 'word', word: 'print' },
            { type: 'leftparan' },
            { type: 'word', word: 'n' },
            { type: 'rightparan' },
            { type: 'blockend' },
        ]);
    });

    it("disallows indentation at the beginning of a program", () => {
        expect(() => tokenize("   1 + 2"))
        .toThrow(/Unexpected indentation/);
    });

    it("closes block when there is de-indentation", () => {
        const code = [
            "if n > 0:",
            "   print(n)",
            "print(n)"
        ].join("\n");
        expect(tokenize(code))
        .toEqual([
            { type: 'word', word: 'if' },
            { type: 'word', word: 'n' },
            { type: 'operator', op: '>' },
            { type: 'number', value: 0 },
            { type: 'blockbegin' },
            { type: 'newline' },
            { type: 'word', word: 'print' },
            { type: 'leftparan' },
            { type: 'word', word: 'n' },
            { type: 'rightparan' },
            { type: 'newline' },
            { type: 'blockend' },
            { type: 'word', word: 'print' },
            { type: 'leftparan' },
            { type: 'word', word: 'n' },
            { type: 'rightparan' }
        ]);
    });

    it("requires indentation after block marker (:)", () => {
        const code = [
            "abc:",
            "def"
        ].join("\n");
        expect(() => tokenize(code))
        .toThrow(/Indentation expected here/);
    });

    it("allows 2-level indentation", () => {
        const code = [
            "abc:",
            "   def:",
            "       ghi"
        ].join("\n");
        expect(tokenize(code))
        .toEqual([
            { type: 'word', word: 'abc' },
            { type: 'blockbegin' },
            { type: 'newline' },
            { type: 'word', word: 'def' },
            { type: 'blockbegin' },
            { type: 'newline' },
            { type: 'word', word: 'ghi' },
            { type: 'blockend' },
            { type: 'blockend' }
        ]);
    });

    it("disallows improper de-indentation", () => {
        const code = [
            "abc:",
            "    def",
            "   ghi"
        ].join("\n");
        expect(() => tokenize(code))
        .toThrow(/Unexpected indentation/);
    });

    it("disallows indenting more without the block marker (:)", () => {
        const code = [
            "abc:",
            "    def",
            "        ghi"
        ].join("\n");
        expect(() => tokenize(code))
        .toThrow(/Unexpected indentation/);
    });

    it("second level block must indent more than previous", () => {
        const code = [
            "abc:",
            "    def:",
            "  ghi"
        ].join("\n");
        expect(() => tokenize(code))
        .toThrow(/Invalid indentation/);
    });

    it("works for this complex example", () => {
        const code = [
            "if n > 0:",
            "    print(n)",
            "    if m < 0:",
            "        print(m)",
            "    print(n * 2)",
            "print(n + m)"
        ].join("\n");
        expect(tokenize(code))
        .toEqual([
            { type: 'word', word: 'if' },
            { type: 'word', word: 'n' },
            { type: 'operator', op: '>' },
            { type: 'number', value: 0 },
            { type: 'blockbegin' },
            { type: 'newline' },
            { type: 'word', word: 'print' },
            { type: 'leftparan' },
            { type: 'word', word: 'n' },
            { type: 'rightparan' },
            { type: 'newline' },
            { type: 'word', word: 'if' },
            { type: 'word', word: 'm' },
            { type: 'operator', op: '<' },
            { type: 'number', value: 0 },
            { type: 'blockbegin' },
            { type: 'newline' },
            { type: 'word', word: 'print' },
            { type: 'leftparan' },
            { type: 'word', word: 'm' },
            { type: 'rightparan' },
            { type: 'newline' },
            { type: 'blockend' },
            { type: 'word', word: 'print' },
            { type: 'leftparan' },
            { type: 'word', word: 'n' },
            { type: 'operator', op: '*' },
            { type: 'number', value: 2 },
            { type: 'rightparan' },
            { type: 'newline' },
            { type: 'blockend' },
            { type: 'word', word: 'print' },
            { type: 'leftparan' },
            { type: 'word', word: 'n' },
            { type: 'operator', op: '+' },
            { type: 'word', word: 'm' },
            { type: 'rightparan' }
        ]);
    });

    it("tokenizes function definitions", () => {
        const code = [
            "hello(subject):",
            "    print(subject)"
        ].join("\n");
        expect(tokenize(code))
        .toEqual([
            { type: "word" , word: "hello" }, 
            { type: "leftparan" }, 
            { type: "word" , word: "subject" }, 
            { type: "rightparan" }, 
            { type: "blockbegin" }, 
            { type: "newline" }, 
            { type: "word" , word: "print" }, 
            { type: "leftparan" }, 
            { type: "word" , word: "subject" }, 
            { type: "rightparan" }, 
            { type: "blockend" }
        ]);
    });

    it("parses 2-character operators", () => {
        expect(tokenize("1 >= 2 == 3 <= 4"))
        .toEqual([
            { type: "number", value: 1 },
            { type: "operator", op: ">=" },
            { type: "number", value: 2 },
            { type: "operator", op: "==" },
            { type: "number", value: 3 },
            { type: "operator", op: "<=" },
            { type: "number", value: 4 }
        ]);
        expect(tokenize("1=="))
        .toEqual([
            { type: "number", value: 1 },
            { type: "operator", op: "==" }
        ]);
        expect(tokenize("n=="))
        .toEqual([
            { type: "word", word: "n" },
            { type: "operator", op: "==" }
        ]);
        const code = [
            'yes:',
            '  >='
        ].join("\n");
        expect(tokenize(code))
        .toEqual([
            { type: "word", word: "yes" },
            { type: "blockbegin" },
            { type: "newline" },
            { type: "operator", op: ">=" },
            { type: "blockend" }
        ]);
    });
})