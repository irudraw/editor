// Herramienta de dibujo libre
function initFreehandTool() {
    const freehandBtn = document.querySelector('[data-tool="freehand"]');
    
    freehandBtn.addEventListener('click', function() {
        appState.currentTool = 'freehand';
        canvas.isDrawingMode = true;
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = appState.strokeColor;
        canvas.freeDrawingBrush.width = appState.strokeWidth;
        
        updateToolSelection();
    });
}