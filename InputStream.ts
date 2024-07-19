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

