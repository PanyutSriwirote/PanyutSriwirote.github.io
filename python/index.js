$(() => {
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/python");
    const output = $("#output");
    const load_interpreter = async () => {
        output.text("กำลังเตรียมระบบไพธอน...");
        const interpreter = await loadPyodide({"stdout": (msg) => {output.append(msg + '\n')}});
        output.text("ไพธอนพร้อมใช้งาน!");
        return interpreter;
    }
    const promised_interpreter = load_interpreter();
    $("#run").click(async () => {
        output.text('');
        const interpreter = await promised_interpreter;
        try {
            await interpreter.runPythonAsync(editor.getValue());
        } catch (err) {
            output.append(err);
        }
    });
});