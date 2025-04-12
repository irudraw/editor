// Estado global de la aplicación
const appState = {
    currentTool: 'select',
    fillColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 1,
    strokeStyle: 'solid',
    textColor: '#000000',
    fontSize: 24,
    fontFamily: 'Arial',
    isTextBold: false,
    isTextItalic: false,
    isTextUnderline: false,
    zoom: 100,
    documentSize: 'a4',
    documentWidth: 210,
    documentHeight: 297,
    documentUnits: 'mm',
    documentResolution: 300
};

// Canvas global
let canvas;

// Inicialización de la aplicación
// En main.js
function initApp() {
    setupCanvas(); // Configura el canvas (debe estar definido en canvas.js)
    
    // Cargar fuentes
    loadSystemFonts().then(fonts => {
        appState.availableFonts = fonts;
        updateFontSelectors();
    });
    
    // Inicializar herramientas
    initSelectTool();
    initTextTool();
    initRectTool();
    initEllipseTool();
    initLineTool();
    initPolygonTool();
    initFreehandTool();
    
    // Inicializar paneles de propiedades
    initBorderProperties();
    initTextProperties();
    initShapeProperties();
    
    // Configurar utilidades
    initFileUtilities();
    initZoomUtilities();
    keyboardShortcuts.init(canvas);
    contextMenu.init(canvas);
    history.init(canvas);
    
    // Configurar eventos globales
    setupGlobalEvents();
    updateToolSelection();
}

// Actualizar selección de herramientas en la UI
function updateToolSelection() {
    document.querySelectorAll('[data-tool]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === appState.currentTool);
    });
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);