// Herramienta de elipse
function initEllipseTool() {
    const ellipseBtn = document.querySelector('[data-tool="ellipse"]');
    let isDrawing = false;
    let ellipse = null;
    let startX = 0;
    let startY = 0;
    
    ellipseBtn.addEventListener('click', function() {
        appState.currentTool = 'ellipse';
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        updateToolSelection();
    });
    
    // Eventos del canvas
    canvas.on('mouse:down', function(options) {
        if (appState.currentTool !== 'ellipse') return;
        
        isDrawing = true;
        const pointer = canvas.getPointer(options.e);
        startX = pointer.x;
        startY = pointer.y;
        
        ellipse = new fabric.Ellipse({
            left: startX,
            top: startY,
            rx: 0,
            ry: 0,
            fill: appState.fillColor,
            stroke: appState.strokeColor,
            strokeWidth: appState.strokeWidth,
            strokeDashArray: getStrokeDashArray(appState.strokeStyle),
            selectable: false
        });
        
        canvas.add(ellipse);
    });
    
    canvas.on('mouse:move', function(options) {
        if (!isDrawing || !ellipse) return;
        
        const pointer = canvas.getPointer(options.e);
        const rx = Math.abs(pointer.x - startX) / 2;
        const ry = Math.abs(pointer.y - startY) / 2;
        
        ellipse.set({
            rx: rx,
            ry: ry,
            left: startX,
            top: startY
        });
        
        canvas.renderAll();
    });
    
    canvas.on('mouse:up', function() {
        if (!isDrawing || !ellipse) return;
        
        isDrawing = false;
        ellipse.set({ selectable: true });
        canvas.setActiveObject(ellipse);
        ellipse = null;
    });
}