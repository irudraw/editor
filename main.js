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
function initApp() {
    // Configurar canvas
    setupCanvas();
    
    // Cargar fuentes del sistema
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
    
    // Inicializar propiedades
    initBorderProperties();
    initTextProperties();
    initShapeProperties();
    
    // Configurar utilidades
    initFileUtilities();
    initZoomUtilities();
    
    // Configurar eventos globales
    setupGlobalEvents();
    
    // Actualizar selección de herramientas
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