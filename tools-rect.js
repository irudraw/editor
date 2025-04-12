// Herramienta de rectángulo
function initRectTool() {
    const rectBtn = document.querySelector('[data-tool="rectangle"]');
    let isDrawing = false;
    let rect = null;
    let startX = 0;
    let startY = 0;
    
    rectBtn.addEventListener('click', function() {
        appState.currentTool = 'rectangle';
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        updateToolSelection();
    });
    
    // Eventos del canvas
    canvas.on('mouse:down', function(options) {
        if (appState.currentTool !== 'rectangle') return;
        
        isDrawing = true;
        const pointer = canvas.getPointer(options.e);
        startX = pointer.x;
        startY = pointer.y;
        
        rect = new fabric.Rect({
            left: startX,
            top: startY,
            width: 0,
            height: 0,
            fill: appState.fillColor,
            stroke: appState.strokeColor,
            strokeWidth: appState.strokeWidth,
            strokeDashArray: getStrokeDashArray(appState.strokeStyle),
            selectable: false
        });
        
        canvas.add(rect);
    });
    
    canvas.on('mouse:move', function(options) {
        if (!isDrawing || !rect) return;
        
        const pointer = canvas.getPointer(options.e);
        const width = pointer.x - startX;
        const height = pointer.y - startY;
        
        rect.set({
            width: width,
            height: height,
            left: width > 0 ? startX : pointer.x,
            top: height > 0 ? startY : pointer.y
        });
        
        canvas.renderAll();
    });
    
    canvas.on('mouse:up', function() {
        if (!isDrawing || !rect) return;
        
        isDrawing = false;
        rect.set({ selectable: true });
        canvas.setActiveObject(rect);
        rect = null;
    });
}

// Obtener patrón de trazo según el estilo
function getStrokeDashArray(style) {
    switch(style) {
        case 'dashed': return [5, 5];
        case 'dotted': return [1, 3];
        default: return null;
    }
}