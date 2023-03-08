$(function() {
    const code = $("#code");
    const output = $("#output");
    code.val('print("Hello World!")');
    async function load_interpreter() {
        output.text("กำลังเตรียมระบบไพธอน...");
        const interpreter = await loadPyodide();
        interpreter.runPython("import sys;import io;sys.stdout = io.StringIO()");
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
    code.keydown(function(e) {
        const key = e.key;
        const value = code.val();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        switch (key) {
            case "Tab":
                e.preventDefault();
                code.val(value.substring(0, start) + "    " + value.substring(end));
                this.selectionStart = this.selectionEnd = start + 4;
                break;
            case '(':
            case '[':
            case '{':
                e.preventDefault();
                code.val(value.substring(0, start) + key + auto_complete[key] + value.substring(end));
                this.selectionStart = this.selectionEnd = start + 1;
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
                } else {
                    const last_line = value.substring(0, start).split('\n').pop();
                    if (/^ +$/.test(last_line)) {
                        e.preventDefault();
                        let num_delete = last_line % 4;
                        if (num_delete == 0) {num_delete = 4;}
                        code.val(value.substring(0, start - num_delete) + value.substring(end));
                        this.selectionStart = this.selectionEnd = start - num_delete;
                    }
                }
                break;
            case "Enter":
                e.preventDefault();
                const last_line = value.substring(0, start).split('\n').pop();
                let indent_level = Math.floor(last_line.match(/ */)[0].length / 4);
                if (start == end && value[start - 1] == ':') {
                    indent_level++;
                }
                code.val(value.substring(0, start) + '\n' + "    ".repeat(indent_level) + value.substring(end));
                this.selectionStart = this.selectionEnd = start + (4 * indent_level) + 1;
                break;
        }
    });
});