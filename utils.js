// Get stroke dash array based on style
function getStrokeDashArray(style) {
    switch(style) {
        case 'dashed': return [5, 5];
        case 'dotted': return [1, 3];
        case 'double': return [3, 3];
        default: return null;
    }
}

// Zoom Functions with boundary checks
function zoomIn() {
    appState.view.zoom = Math.min(appState.view.zoom + 10, 400);
    updateZoom();
}

function zoomOut() {
    appState.view.zoom = Math.max(appState.view.zoom - 10, 25);
    updateZoom();
}

function zoomFit() {
    try {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const container = document.querySelector('.canvas-wrapper');
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        
        const zoomX = (containerWidth / canvasWidth) * 100;
        const zoomY = (containerHeight / canvasHeight) * 100;
        
        appState.view.zoom = Math.min(zoomX, zoomY, 100);
        updateZoom();
    } catch (error) {
        console.error('Error fitting zoom:', error);
    }
}

function zoomReset() {
    appState.view.zoom = 100;
    updateZoom();
}

function updateZoom() {
    const canvas = CanvasUtils.getCanvas();
    const wrapper = document.querySelector('.canvas-wrapper');
    const zoom = appState.view.zoom / 100;

    // Aplicar transformación CSS solo al contenedor del canvas
    wrapper.style.transform = `scale(${zoom})`;
    wrapper.style.transform = `translate(${appState.canvasOffsetX}px, ${appState.canvasOffsetY}px) scale(${zoom})`;
    wrapper.style.width = `${canvas.width}px`;
    wrapper.style.height = `${canvas.height}px`;
    
    // Ajustar el espacio ocupado
    wrapper.style.minWidth = `${canvas.width}px`;
    wrapper.style.minHeight = `${canvas.height}px`;
    
    // Actualizar el texto en la barra de estado
    document.getElementById('zoom-level').textContent = `${appState.view.zoom}%`;
    
    // Forzar redibujado
    canvas.requestRenderAll();
}

// Document Size Helpers
function getStandardPageSize(size) {
    const sizes = {
        'a4': { width: 210, height: 297 },
        'a3': { width: 297, height: 420 },
        'letter': { width: 216, height: 279 },
        'legal': { width: 216, height: 356 },
        'tabloid': { width: 279, height: 432 }
    };
    
    return sizes[size.toLowerCase()] || sizes['a4'];
}

// View Toggle Functions
function toggleGrid() {
    appState.view.showGrid = !appState.view.showGrid;
    const wrapper = document.querySelector('.canvas-wrapper');
    
    if (appState.view.showGrid) {
        wrapper.style.backgroundImage = `
            linear-gradient(45deg, #ddd 25%, transparent 25%), 
            linear-gradient(-45deg, #ddd 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #ddd 75%), 
            linear-gradient(-45deg, transparent 75%, #ddd 75%)
        `;
        wrapper.style.backgroundSize = '20px 20px';
        wrapper.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
    } else {
        wrapper.style.backgroundImage = 'none';
    }
    
    document.getElementById('toggle-grid').classList.toggle('active', appState.view.showGrid);
}

function toggleRulers() {
    appState.view.showRulers = !appState.view.showRulers;
    const horizontalRuler = document.getElementById('horizontal-ruler');
    const verticalRuler = document.getElementById('vertical-ruler');
    
    if (appState.view.showRulers) {
        horizontalRuler.style.display = 'block';
        verticalRuler.style.display = 'block';
        updateRulers();
    } else {
        horizontalRuler.style.display = 'none';
        verticalRuler.style.display = 'none';
    }
    
    document.getElementById('toggle-rulers').classList.toggle('active', appState.view.showRulers);
}

function updateRulers() {
    // Implementación de actualización de reglas según la posición del canvas
    // Esto requeriría elementos HTML adicionales para las reglas
}

function toggleGuides() {
    appState.view.showGuides = !appState.view.showGuides;
    const guidesContainer = document.getElementById('guides-container');
    
    if (appState.view.showGuides) {
        guidesContainer.style.display = 'block';
        // Aquí iría la lógica para mostrar las guías existentes
    } else {
        guidesContainer.style.display = 'none';
    }
    
    document.getElementById('toggle-guides').classList.toggle('active', appState.view.showGuides);
}

function changeZoom(direction) {
    if (direction === 'in') {
        if (appState.view.currentZoomIndex < appState.view.zoomLevels.length - 1) {
            appState.view.currentZoomIndex++;
        }
    } else if (direction === 'out') {
        if (appState.view.currentZoomIndex > 0) {
            appState.view.currentZoomIndex--;
        }
    }
    
    const zoom = appState.view.zoomLevels[appState.view.currentZoomIndex];
    appState.view.zoom = zoom;
    updateZoom();
}

function zoomToLevel(level) {
    if (level === 'fit') {
        zoomFit();
    } else if (level === '100') {
        const index = appState.view.zoomLevels.indexOf(100);
        if (index !== -1) {
            appState.view.currentZoomIndex = index;
            appState.view.zoom = 100;
            updateZoom();
        }
    }
}

// Unit Conversion Helpers
function mmToPixels(mm) {
    const ppi = appState.document.resolution;
    const inches = mm / 25.4;
    return Math.round(inches * ppi);
}

function pixelsToMM(px) {
    const ppi = appState.document.resolution;
    const inches = px / ppi;
    return Math.round(inches * 25.4);
}

// History Management
function saveToHistory() {
    try {
        const canvas = CanvasUtils.getCanvas();
        // Limitar historial a 100 estados
        const MAX_HISTORY = 100;
        
        // Si estamos en medio del historial, eliminar estados futuros
        if (appState.historyIndex < appState.history.length - 1) {
            appState.history = appState.history.slice(0, appState.historyIndex + 1);
        }
        
        // Serializar el estado actual del canvas
        const state = JSON.stringify({
            canvas: canvas.toJSON(),
            view: {
                zoom: appState.view.zoom,
                showGrid: appState.view.showGrid,
                showRulers: appState.view.showRulers,
                showGuides: appState.view.showGuides
            },
            timestamp: new Date().toISOString()
        });
        
        // Agregar al historial
        appState.history.push(state);
        appState.historyIndex = appState.history.length - 1;
        
        // Limitar tamaño del historial
        if (appState.history.length > MAX_HISTORY) {
            appState.history.shift();
            appState.historyIndex = MAX_HISTORY - 1;
        }
        
        // Notificar que el historial cambió
        canvas.fire('history:changed');
        
    } catch (error) {
        console.error('Error guardando en el historial:', error);
        showToast('Error al guardar en el historial', 'danger');
    }
}

// Coordinate Helpers
function getPointerPosition(e) {
    return canvas.getPointer(e);
}

// Validation Helpers
function validateNumber(value, min, max, defaultValue) {
    const num = Number(value);
    if (isNaN(num)) return defaultValue;
    return Math.min(Math.max(num, min), max);
}

function cleanUpDrawingState() {
    appState.isDrawing = false;
    appState.isDrawingPolygon = false;
    appState.currentShape = null;
    appState.polygonPoints = [];
}

function loadStateFromHistory() {
    try {
        const canvas = CanvasUtils.getCanvas();
        if (appState.historyIndex < 0 || appState.historyIndex >= appState.history.length) {
            return;
        }
        
        const state = JSON.parse(appState.history[appState.historyIndex]);
        
        // Restaurar el canvas
        canvas.loadFromJSON(state.canvas, function() {
            // Restaurar propiedades de vista
            if (state.view) {
                appState.view.zoom = state.view.zoom || 100;
                appState.view.showGrid = state.view.showGrid || false;
                appState.view.showRulers = state.view.showRulers || false;
                appState.view.showGuides = state.view.showGuides || false;
                
                updateZoom();
                if (appState.view.showGrid) toggleGrid();
                if (appState.view.showRulers) toggleRulers();
                if (appState.view.showGuides) toggleGuides();
            }
            
            canvas.renderAll();
            canvas.fire('history:changed');
        });
        
    } catch (error) {
        console.error('Error cargando del historial:', error);
        showToast('Error al cargar del historial', 'danger');
    }
}