/**
 * Archivo principal de la aplicación - main.js
 * Coordina la inicialización de todos los módulos y configura el canvas
 */

// Importar módulos (aunque en el navegador se cargan como globales)
const fabric = window.fabric;
const history = window.history;
const clipboard = window.clipboard;
const editTools = window.editTools;
const contextMenu = window.contextMenu;
const keyboardShortcuts = window.keyboardShortcuts;

// Variables globales de la aplicación
let canvas;
let appState = {
    currentTool: 'select',
    fillColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 1,
    textColor: '#000000',
    fontSize: 24,
    zoomLevel: 100
};

/**
 * Inicializa el canvas de Fabric.js con configuraciones básicas
 */
function initCanvas() {
    canvas = new fabric.Canvas('drawing-canvas', {
        backgroundColor: '#ffffff',
        selection: true,
        selectionColor: 'rgba(13, 110, 253, 0.3)',
        selectionBorderColor: '#0d6efd',
        selectionLineWidth: 1,
        preserveObjectStacking: true
    });

    // Configurar tamaño inicial del canvas
    updateCanvasSize();
    
    return canvas;
}

/**
 * Actualiza el tamaño del canvas según el contenedor
 */
function updateCanvasSize() {
    const container = document.getElementById('page-container');
    canvas.setWidth(container.clientWidth);
    canvas.setHeight(container.clientHeight);
    canvas.renderAll();
}

/**
 * Inicializa todos los módulos de la aplicación
 */
function initModules() {
    // Historial de acciones (undo/redo)
    history.init(canvas);
    
    // Menú contextual
    contextMenu.init(canvas);
    
    // Atajos de teclado
    keyboardShortcuts.init(canvas);
    
    // Eventos del canvas
    setupCanvasEvents();
    
    // Eventos de la interfaz
    setupUIEvents();
}

/**
 * Configura los eventos del canvas
 */
function setupCanvasEvents() {
    // Actualizar posición del cursor
    canvas.on('mouse:move', function(options) {
        const pointer = canvas.getPointer(options.e);
        document.getElementById('cursor-position').textContent = 
            `${Math.round(pointer.x)}, ${Math.round(pointer.y)}`;
    });
    
    // Actualizar objeto seleccionado en la barra de estado
    canvas.on('selection:created', function(options) {
        const selected = options.selected[0];
        document.getElementById('selected-object').textContent = 
            selected.type ? selected.type.charAt(0).toUpperCase() + selected.type.slice(1) : 'Objeto';
    });
    
    canvas.on('selection:cleared', function() {
        document.getElementById('selected-object').textContent = 'Ninguno';
    });
    
    // Guardar estado después de modificaciones
    canvas.on('object:modified', function() {
        history.saveState(canvas);
    });
}

/**
 * Configura los eventos de la interfaz de usuario
 */
function setupUIEvents() {
    // Selector de herramientas
    document.querySelectorAll('[data-tool]').forEach(btn => {
        btn.addEventListener('click', function() {
            selectTool(this.dataset.tool);
        });
    });
    
    // Toggle panel de propiedades
    document.getElementById('toggle-properties').addEventListener('click', function() {
        const panel = document.getElementById('property-panel');
        panel.classList.toggle('collapsed');
        this.innerHTML = panel.classList.contains('collapsed') ? 
            '<i class="fas fa-chevron-left"></i>' : '<i class="fas fa-chevron-right"></i>';
    });
    
    // Eventos de zoom
    window.addEventListener('resize', updateCanvasSize);
}

/**
 * Selecciona una herramienta de dibujo
 * @param {string} tool - Nombre de la herramienta a seleccionar
 */
function selectTool(tool) {
    appState.currentTool = tool;
    
    // Actualizar UI
    document.querySelectorAll('[data-tool]').forEach(el => {
        el.classList.toggle('active', el.dataset.tool === tool);
    });
    
    // Configurar canvas según la herramienta
    switch(tool) {
        case 'select':
            canvas.isDrawingMode = false;
            canvas.selection = true;
            canvas.defaultCursor = 'default';
            break;
            
        case 'text':
            canvas.isDrawingMode = false;
            canvas.selection = false;
            canvas.defaultCursor = 'text';
            setupTextTool();
            break;
            
        case 'freehand':
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = appState.strokeColor;
            canvas.freeDrawingBrush.width = appState.strokeWidth;
            canvas.defaultCursor = 'crosshair';
            break;
            
        default:
            canvas.isDrawingMode = false;
            canvas.selection = true;
            canvas.defaultCursor = 'default';
    }
}

/**
 * Configura el comportamiento de la herramienta de texto
 */
function setupTextTool() {
    canvas.on('mouse:down', function(options) {
        if (appState.currentTool === 'text') {
            const pointer = canvas.getPointer(options.e);
            showTextEditor(pointer.x, pointer.y);
        }
    });
}

/**
 * Muestra el editor de texto modal
 * @param {number} x - Posición horizontal
 * @param {number} y - Posición vertical
 */
function showTextEditor(x, y) {
    const modal = new bootstrap.Modal(document.getElementById('text-editor-modal'));
    const textEditor = document.getElementById('text-editor-content');
    
    // Resetear editor
    textEditor.value = '';
    textEditor.style.fontFamily = 'Arial';
    textEditor.style.fontSize = `${appState.fontSize}px`;
    textEditor.style.color = appState.textColor;
    
    // Configurar botón de aplicar
    document.getElementById('apply-text-editor').onclick = function() {
        const text = textEditor.value.trim();
        if (text) {
            const textObj = new fabric.Text(text, {
                left: x,
                top: y,
                fontFamily: 'Arial',
                fontSize: appState.fontSize,
                fill: appState.textColor,
                selectable: true
            });
            
            canvas.add(textObj);
            canvas.setActiveObject(textObj);
            history.saveState(canvas);
            canvas.renderAll();
        }
        modal.hide();
    };
    
    modal.show();
}

/**
 * Inicialización principal cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar canvas
    canvas = initCanvas();
    
    // Inicializar módulos
    initModules();
    
    // Seleccionar herramienta por defecto
    selectTool('select');
    
    // Guardar estado inicial
    history.saveState(canvas);
});

// Hacer funciones disponibles globalmente si es necesario
window.app = {
    canvas: canvas,
    state: appState,
    selectTool: selectTool
};