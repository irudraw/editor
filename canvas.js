// Configuración del canvas
function setupCanvas() {
    canvas = new fabric.Canvas('drawing-canvas', {
        backgroundColor: '#ffffff',
        selection: true,
        selectionColor: 'rgba(13, 110, 253, 0.3)',
        selectionBorderColor: '#0d6efd',
        selectionLineWidth: 1,
        preserveObjectStacking: true
    });

    // Tamaño inicial basado en A4 a 300ppi
    updateCanvasSize();
}

// Actualizar tamaño del canvas
function updateCanvasSize() {
    // Convertir mm a píxeles (300ppi)
    const mmToInch = 1 / 25.4;
    const widthInch = appState.documentWidth * mmToInch;
    const heightInch = appState.documentHeight * mmToInch;
    const widthPx = Math.round(widthInch * appState.documentResolution);
    const heightPx = Math.round(heightInch * appState.documentResolution);

    canvas.setWidth(widthPx);
    canvas.setHeight(heightPx);
    document.getElementById('page-container').style.width = `${widthPx}px`;
    document.getElementById('page-container').style.height = `${heightPx}px`;
}

// Exportar canvas a JSON
function exportCanvasToJSON() {
    return JSON.stringify(canvas.toJSON());
}

// Importar canvas desde JSON
function importCanvasFromJSON(json) {
    canvas.loadFromJSON(json, () => {
        canvas.renderAll();
    });
}

// Limpiar canvas
function clearCanvas() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
}