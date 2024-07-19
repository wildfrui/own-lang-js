// Skip over whitespace
// If input.eof() then return null.
// If it's a sharp sign (#), skip comment (retry after the end of line).
// If it's a quote then read a string.
// If it's a digit, then we proceed to read a number.
// If it's a “letter”, then read an identifier or a keyword token.
// If it's one of the punctuation characters, return a punctuation token.
// If it's one of the operator characters, return an operator token.
// If none of the above, error out with input.croak().

const kw = [ "if", "then", "else",  ]

function readNext() {
    readWhile(isWhitespace);

    if (input.eof()) return null;
    let ch = input.next();
    if (input.peek() == "#") {
        skipComment();
        return readNext();
    }
    if (ch == '"') return readString();
    if (isDigit(ch)) return readNumber();
    if (isIdStart(ch)) return readIdentifier();
    if (isPunctuation(ch)) return {
        type: "punc",
        value: input.next()
    }
    if (isOperator(ch)) return {
        type: "op",
        value: readWhile(isOperator)
    }
    input.croak("Unexpected character: " + ch);
}