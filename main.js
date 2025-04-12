// main.js - Punto de entrada principal
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar estado compartido
    const canvas = AppState.initCanvas();
    
    // Inicializar módulos
    if (window.history) history.init(canvas);
    if (window.contextMenu) contextMenu.init(canvas);
    if (window.keyboardShortcuts) keyboardShortcuts.init(canvas);
    
    // Configurar eventos del canvas
    canvas.on('mouse:move', function(options) {
        const pointer = canvas.getPointer(options.e);
        document.getElementById('cursor-position').textContent = 
            `${Math.round(pointer.x)}, ${Math.round(pointer.y)}`;
    });
    
    canvas.on('selection:created', function(options) {
        const selected = options.selected[0];
        document.getElementById('selected-object').textContent = 
            selected.type ? selected.type.charAt(0).toUpperCase() + selected.type.slice(1) : 'Objeto';
    });
    
    canvas.on('selection:cleared', function() {
        document.getElementById('selected-object').textContent = 'Ninguno';
    });
    
    canvas.on('object:modified', function() {
        if (window.history) history.saveState(canvas);
    });
    
    // Configurar herramienta inicial
    AppState.selectTool('select');
    
    // Guardar estado inicial
    if (window.history) history.saveState(canvas);
});