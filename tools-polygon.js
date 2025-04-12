// Herramienta de polígono
function initPolygonTool() {
    const polygonBtn = document.querySelector('[data-tool="polygon"]');
    let isDrawing = false;
    let polygon = null;
    let points = [];
    
    polygonBtn.addEventListener('click', function() {
        appState.currentTool = 'polygon';
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        updateToolSelection();
    });
    
    // Eventos del canvas
    canvas.on('mouse:down', function(options) {
        if (appState.currentTool !== 'polygon') return;
        
        const pointer = canvas.getPointer(options.e);
        
        if (!isDrawing) {
            // Primer clic - comenzar nuevo polígono
            isDrawing = true;
            points = [{ x: pointer.x, y: pointer.y }];
            
            polygon = new fabric.Polygon([], {
                fill: appState.fillColor,
                stroke: appState.strokeColor,
                strokeWidth: appState.strokeWidth,
                strokeDashArray: getStrokeDashArray(appState.strokeStyle),
                selectable: false
            });
            
            canvas.add(polygon);
        } else {
            // Clics adicionales - agregar puntos
            points.push({ x: pointer.x, y: pointer.y });
        }
    });
    
    canvas.on('mouse:move', function(options) {
        if (!isDrawing || !polygon || points.length === 0) return;
        
        const pointer = canvas.getPointer(options.e);
        const currentPoints = [...points, { x: pointer.x, y: pointer.y }];
        polygon.set({ points: currentPoints });
        canvas.renderAll();
    });
    
    // Doble clic para terminar el polígono
    canvas.on('mouse:dblclick', function() {
        if (appState.currentTool === 'polygon' && isDrawing) {
            isDrawing = false;
            polygon.set({ selectable: true });
            canvas.setActiveObject(polygon);
            polygon = null;
            points = [];
        }
    });
}