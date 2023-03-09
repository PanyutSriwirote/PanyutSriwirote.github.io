$(function() {
    const code = $("#code");
    const output = $("#output");
    code.val('print("Hello World!")');
    async function load_interpreter() {
        output.text("กำลังเตรียมระบบไพธอน...");
        const interpreter = await loadPyodide();
        interpreter.runPython("import sys, io;sys.stdout = io.StringIO()");
        output.text("ไพธอนพร้อมใช้งาน!");
        return interpreter;
    }
    const promised_interpreter = load_interpreter();
    $("#run").click(async function() {
        output.text("กำลังรัน...");
        const interpreter = await promised_interpreter;
        try {
            await interpreter.runPythonAsync(code.val());
            output.text(interpreter.runPython("sys.stdout.getvalue()"));
            interpreter.runPython("sys.stdout.close();sys.stdout = io.StringIO()");
        } catch (err) {
            output.text(err);
        }
    });
    const auto_complete = {
        '(': ')',
        '[': ']',
        '{': '}'
    };
    const history = []
    let state;
    let last_change = new Date().getTime();
    code.keydown(function(e) {
        const key = e.key;
        const value = code.val();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        state = {"text": value, "start": start, "end": end};
        function get_last_line() {
            const first_half = value.substring(0, start);
            return first_half.substring(first_half.lastIndexOf('\n') + 1);
        }
        switch (key) {
            case "Tab":
                e.preventDefault();
                code.val(value.substring(0, start) + "    " + value.substring(end));
                this.selectionStart = this.selectionEnd = start + 4;
                code.trigger("input");
                break;
            case '(':
            case '[':
            case '{':
                e.preventDefault();
                code.val(value.substring(0, start) + key + auto_complete[key] + value.substring(end));
                this.selectionStart = this.selectionEnd = start + 1;
                code.trigger("input");
                break;
            case ')':
            case ']':
            case '}':
                if (start == end && value[end] == key) {
                    e.preventDefault();
                    this.selectionStart = this.selectionEnd = end + 1;
                }
                break;
            case "Backspace":
                if (start == end && value[start - 1] in auto_complete && auto_complete[value[start - 1]] == value[end]) {
                    e.preventDefault();
                    code.val(value.substring(0, start - 1) + value.substring(end + 1));
                    this.selectionStart = this.selectionEnd = start - 1;
                    code.trigger("input");
                } else {
                    const last_line = get_last_line();
                    if (/^ +$/.test(last_line)) {
                        e.preventDefault();
                        let num_delete = last_line % 4;
                        if (num_delete == 0) {num_delete = 4;}
                        code.val(value.substring(0, start - num_delete) + value.substring(end));
                        this.selectionStart = this.selectionEnd = start - num_delete;
                        code.trigger("input");
                    }
                }
                break;
            case "Enter":
                e.preventDefault();
                const last_line = get_last_line();
                let indent_level = Math.floor(last_line.match(/ */)[0].length / 4);
                if (start == end && value[start - 1] == ':') {
                    indent_level++;
                }
                code.val(value.substring(0, start) + '\n' + "    ".repeat(indent_level) + value.substring(end));
                this.selectionStart = this.selectionEnd = start + (4 * indent_level) + 1;
                code.trigger("input");
                break;
            case 'z':
                if (e.ctrlKey) {
                    e.preventDefault();
                    const last_state = history.pop();
                    code.val(last_state.text);
                    this.selectionStart = last_state.start;
                    this.selectionEnd = last_state.end;
                }
                break;
        }
    }).on("input", function() {
        const now = new Date().getTime();
        if (now - last_change > 1000) {
            history.push(state);
            last_change = now;
            if (history.length > 20) {
                history.shift();
            }
        }
    });
});