$(function() {
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/python");
    const output = $("#output");
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
            await interpreter.runPythonAsync(editor.getValue());
            output.text(interpreter.runPython("sys.stdout.getvalue()"));
            interpreter.runPython("sys.stdout.close();sys.stdout = io.StringIO()");
        } catch (err) {
            output.text(err);
        }
    });
});