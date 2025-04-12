// Herramienta de selección
function initSelectTool() {
    const selectBtn = document.querySelector('[data-tool="select"]');
    
    selectBtn.addEventListener('click', function() {
        appState.currentTool = 'select';
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        updateToolSelection();
    });
}