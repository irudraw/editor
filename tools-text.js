// Extender fabric.Text con funcionalidades personalizadas
fabric.Text.prototype.initialize = (function(original) {
    return function(text, options) {
        options = options || {};
        original.call(this, text, options);
        
        // Propiedades personalizadas
        this.borderType = options.borderType || 'outline';
        this.borderRadius = options.borderRadius || 0;
        this.strokeOpacity = options.strokeOpacity !== undefined ? options.strokeOpacity : 1;
        
        return this;
    };
})(fabric.Text.prototype.initialize);

// Configurar herramienta de texto
function initTextTool() {
    const textBtn = document.querySelector('[data-tool="text"]');
    
    textBtn.addEventListener('click', function() {
        appState.currentTool = 'text';
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'text';
        updateToolSelection();
    });
    
    // Evento para crear texto al hacer clic
    canvas.on('mouse:down', function(options) {
        if (appState.currentTool === 'text') {
            const pointer = canvas.getPointer(options.e);
            showTextEditor(pointer.x, pointer.y);
        }
    });
}

// Mostrar editor de texto modal
function showTextEditor(x, y) {
    const modal = new bootstrap.Modal(document.getElementById('text-editor-modal'));
    const editor = document.getElementById('text-editor-content');
    
    // Configurar editor
    editor.value = '';
    editor.style.fontFamily = appState.fontFamily;
    editor.style.fontSize = `${appState.fontSize}px`;
    editor.style.color = appState.textColor;
    
    // Configurar botón de aplicar
    document.getElementById('apply-text-editor').onclick = function() {
        const text = editor.value.trim();
        if (text) {
            createTextObject(text, x, y);
        }
        modal.hide();
    };
    
    modal.show();
}

// Crear objeto de texto en el canvas
function createTextObject(text, x, y) {
    const textObj = new fabric.Text(text, {
        left: x,
        top: y,
        fontFamily: appState.fontFamily,
        fontSize: appState.fontSize,
        fill: appState.textColor,
        fontWeight: appState.isTextBold ? 'bold' : 'normal',
        fontStyle: appState.isTextItalic ? 'italic' : 'normal',
        underline: appState.isTextUnderline,
        stroke: appState.strokeColor,
        strokeWidth: appState.strokeWidth,
        borderType: 'outline',
        selectable: true
    });
    
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
}