// Skip over whitespace
// If input.eof() then return null.
// If it's a sharp sign (#), skip comment (retry after the end of line).
// If it's a quote then read a string.
// If it's a digit, then we proceed to read a number.
// If it's a “letter”, then read an identifier or a keyword token.
// If it's one of the punctuation characters, return a punctuation token.
// If it's one of the operator characters, return an operator token.
// If none of the above, error out with input.croak().

const kw = [ "if", "then", "else" ]

function InputStream(text: string) {
    let pos = 0, line = 1, col = 1;
    return {
        next: next,
        peek: peek,
        eof: eof
    }
    function next() {
        let ch = text.charAt(pos++);
        if(ch == '\n') line++, col=0; else col++;
        return ch
    }
    function peek() {
        return text.charAt(pos)
    }
    function eof() {
        return peek() == "";
    }

    function croak(msg: string) {
        throw new Error("line " + line + ":" + col + " " + msg)
    }
}

function TokenStream(input) {
    let current = null;
    return {
        next: next,
        peek: peek,
        eof: eof,
        croak: input.croak
    }

    function isKeyword(s: string) {
        return kw.indexOf(s) != -1
    }

    function isDigit(ch: string) {
        return ch >= "0" && ch <= "9"
    }

    function isIdStart(ch: string) {
        return /[a-zA-Z_~]/.test(ch)
    }

    function isId(ch: string) {
        return isIdStart(ch) || isDigit(ch);
    }

    function isOperator(ch: string) {
        return /[+\-*/%=<>]/.test(ch)
    }

    function isPunctuation(ch: string) {
        return /[(){};,.]/.test(ch)
    }

    function isWhitespace(ch: string) {
        return /\s/.test(ch)
    }

    function readWhile(predicate: (ch: string) => boolean) {
        let str = "";
        while (!input.eof() && predicate(input.peek())) {
            str += input.next();
        }
        return str;
    }

    function readNumber() {
        let hasDot = false;
        let str = input.next();
        let number = readWhile((ch) => {
            if (ch == ".") {
                if (hasDot) return false;
                hasDot = true;
                return true;
            }
            return isDigit(ch);
        });
        return {
            type: "num",
            value: parseFloat(str)
        }
    }

    function readIdentifier() {
        let str = readWhile(isId);
        return {
            type: isKeyword(str) ? "kw" : "id",
            value: str
        }
    }

    function readEscaped(end: string) {
        let escaped = false, str = "";
        input.next();
        while (!input.eof()) {
            let ch = input.next();
            if (escaped) {
                str += ch;
                escaped = false;
            } else if (ch == "\\") {
                escaped = true;
            } else if (ch == end) {
                break;
            }
            else {
                str += ch;
            }
        }
        return str;
    }

    function readString() {
        return {
            type: "str",
            value: readEscaped('"')
        }
    }

    function skipComment() {
        readWhile((ch) => ch != "\n");
        input.next();
    }

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
    function peek() {
        return current || (current = readNext());
    }

    function next() {
        let tok = current;
        current = null;
        return tok || readNext();
    }

    function eof() {
        return peek() == null;
    }
}