// Herramienta de línea
function initLineTool() {
    const lineBtn = document.querySelector('[data-tool="line"]');
    let isDrawing = false;
    let line = null;
    let startX = 0;
    let startY = 0;
    
    lineBtn.addEventListener('click', function() {
        appState.currentTool = 'line';
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        updateToolSelection();
    });
    
    // Eventos del canvas
    canvas.on('mouse:down', function(options) {
        if (appState.currentTool !== 'line') return;
        
        isDrawing = true;
        const pointer = canvas.getPointer(options.e);
        startX = pointer.x;
        startY = pointer.y;
        
        line = new fabric.Line([startX, startY, startX, startY], {
            stroke: appState.strokeColor,
            strokeWidth: appState.strokeWidth,
            strokeDashArray: getStrokeDashArray(appState.strokeStyle),
            selectable: false
        });
        
        canvas.add(line);
    });
    
    canvas.on('mouse:move', function(options) {
        if (!isDrawing || !line) return;
        
        const pointer = canvas.getPointer(options.e);
        line.set({ x2: pointer.x, y2: pointer.y });
        canvas.renderAll();
    });
    
    canvas.on('mouse:up', function() {
        if (!isDrawing || !line) return;
        
        isDrawing = false;
        line.set({ selectable: true });
        canvas.setActiveObject(line);
        line = null;
    });
}