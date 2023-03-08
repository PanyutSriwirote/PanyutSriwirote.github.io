$(function() {
    const code = $("#code");
    const output = $("#output");
    async function load_interpreter() {
        const interpreter = await loadPyodide();
        interpreter.runPython("import sys;import io;sys.stdout = io.StringIO()");
        output.text("ไพธอนพร้อมใช้งาน!");
        return interpreter;
    }
    const interpreter_promise = load_interpreter();
    $("#run").click(async function() {
        const interpreter = await interpreter_promise;
        try {
            interpreter.runPython(code.val());
            output.text(interpreter.runPython("sys.stdout.getvalue()"));
            interpreter.runPython("sys.stdout.close();sys.stdout = io.StringIO()");
        } catch (err) {
            output.text(err);
        }
    });
    code.keydown(function(e) {
        if (e.key == 'Tab') { // tab was pressed
            // get caret position/selection
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            // set textarea value to: text before caret + tab + text after caret
            const value = code.val();
            code.val(value.substring(0, start) + "    " + value.substring(end));
            
            // put caret at right position again (add one for the tab)
            this.selectionStart = this.selectionEnd = start + 4;

            // prevent the focus lose
            e.preventDefault();
        }
    });
});