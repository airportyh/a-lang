const code = 
`def hello():
    print(name)

hello()

if n:
    print(n)
`;

for (let token of tokenize(code)) {
    console.log(token);
}

type State = "open" | "word" | "collect-indent";

function * tokenize(input: string): IterableIterator<string> {
    let state: State = "collect-indent";
    let currentWord: string = "";
    let indentStack: number[] = [];
    let currentIndentation = 0;
    for (let i = 0; i < input.length; i++) {
        let char = input[i];
        if (state === "open") {
            if (char.match(/^[a-zA-Z]$/)) {
                currentWord += char;
                state = "word";
            } else if (char === " ") {
            } else if (char === "(") {
                yield "(";
            } else if (char === ")") {
                yield ")";
            } else if (char === ":") {
                yield ":";
            } else if (char === "\n") {
                state = "collect-indent";
                currentIndentation = 0;
            } else {
                throw new Error();
            }
        } else if (state === "word") {
            if (char.match(/^[a-zA-Z]$/)) {
                currentWord += char;
            } else if (char === " ") {
                state = "open";
                yield currentWord;
                currentWord = "";
            } else if (char === "(") {
                state = "open";
                yield currentWord;
                currentWord = "";
                yield "(";
            } else if (char === ")") {
                state = "open";
                yield currentWord;
                currentWord = "";
                yield ")";
            } else if (char === ":") {
                state = "open";
                yield currentWord;
                currentWord = "";
                yield ":";
            } else if (char === "\n") {
                state = "collect-indent";
                yield currentWord;
                currentWord = "";
            } else {
                throw new Error();
            }
        } else if (state === "collect-indent") {
            if (char === " ") {
                currentIndentation++;
            } else if (char === "\n") {
                if (currentIndentation > 0) {
                    throw new Error("Shouldn't have indentation on an empty line.");
                } else {
                    state = "collect-indent";
                }
            } else if (char.match(/^[a-zA-Z]$/)) {
                // console.log("---indent/dedent")
                if (indentStack.length > 0) {
                    // console.log("indentStack", indentStack);
                    let delta = currentIndentation - peek(indentStack);
                    if (delta > 0) {
                        // console.log('indent');
                        if (currentIndentation > 0) {
                            indentStack.push(currentIndentation);
                            yield `block-start`;
                        }
                    } else if (delta < 0) {
                        while (indentStack.length && 
                            peek(indentStack) > currentIndentation) {
                            indentStack.pop();
                            // console.log('dedent');
                            yield `block-end`;
                        }
                    } else {
                        // console.log('do nothing');
                        // do nothing
                    }
                } else {
                    // console.log("else indent");
                    if (currentIndentation > 0) {
                        indentStack.push(currentIndentation);
                        yield `block-start`;
                    }
                }
                currentWord = char;
                state = "word";
            } else {
                throw new Error();
            }
        }
    }
    while (indentStack.length) {
        indentStack.pop();
        yield 'block-end';
    }
}

function peek<T>(arr: T[]): T {
    return arr[arr.length - 1];
}