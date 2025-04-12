/**
 * Archivo events.js - Manejo de eventos de la interfaz de usuario
 */

// Variables globales (compartidas con main.js)
let canvas = window.app.canvas;
let appState = window.app.state;

/**
 * Configura todos los eventos de la interfaz de usuario
 */
function setupUIEvents() {
    // Eventos del menú Archivo
    setupFileEvents();
    
    // Eventos de herramientas
    setupToolsEvents();
    
    // Eventos de propiedades
    setupPropertiesEvents();
    
    // Eventos de zoom
    setupZoomEvents();
    
    // Eventos del modal de texto
    setupTextModalEvents();
}

/**
 * Configura eventos del menú Archivo
 */
function setupFileEvents() {
    // Nuevo documento
    document.getElementById('new-file').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('¿Crear nuevo documento? Se perderán los cambios no guardados.')) {
            canvas.clear();
            canvas.backgroundColor = '#ffffff';
            canvas.renderAll();
            window.history.saveState(canvas);
            document.getElementById('selected-object').textContent = 'Ninguno';
        }
    });
    
    // Abrir archivo
    document.getElementById('open-file').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('file-input').click();
    });
    
    // Guardar archivo
    document.getElementById('save-file').addEventListener('click', function(e) {
        e.preventDefault();
        saveToJSON();
    });
    
    // Manejar selección de archivo
    document.getElementById('file-input').addEventListener('change', handleFileOpen);
}

/**
 * Configura eventos de las herramientas
 */
function setupToolsEvents() {
    // Selector de herramientas
    document.querySelectorAll('[data-tool]').forEach(btn => {
        btn.addEventListener('click', function() {
            window.app.selectTool(this.dataset.tool);
        });
    });
    
    // Color de relleno
    document.getElementById('fill-color').addEventListener('input', function() {
        appState.fillColor = this.value;
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.set) {
            activeObj.set('fill', this.value);
            canvas.renderAll();
        }
    });
    
    // Color de borde
    document.getElementById('stroke-color').addEventListener('input', function() {
        appState.strokeColor = this.value;
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.set) {
            activeObj.set('stroke', this.value);
            canvas.renderAll();
        }
    });
    
    // Ancho de borde
    document.getElementById('stroke-width').addEventListener('input', function() {
        appState.strokeWidth = parseFloat(this.value);
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.set) {
            activeObj.set('strokeWidth', parseFloat(this.value));
            canvas.renderAll();
        }
    });
}

/**
 * Configura eventos del panel de propiedades
 */
function setupPropertiesEvents() {
    // Toggle panel de propiedades
    document.getElementById('toggle-properties').addEventListener('click', function() {
        const panel = document.getElementById('property-panel');
        panel.classList.toggle('collapsed');
        this.innerHTML = panel.classList.contains('collapsed') ? 
            '<i class="fas fa-chevron-left"></i>' : '<i class="fas fa-chevron-right"></i>';
    });
    
    // Posición X
    document.getElementById('transform-x').addEventListener('change', function() {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.set('left', parseInt(this.value));
            canvas.renderAll();
        }
    });
    
    // Posición Y
    document.getElementById('transform-y').addEventListener('change', function() {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.set('top', parseInt(this.value));
            canvas.renderAll();
        }
    });
    
    // Rotación
    document.getElementById('transform-rotation').addEventListener('input', function() {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.set('angle', parseInt(this.value));
            document.getElementById('rotation-value').textContent = `${this.value}°`;
            canvas.renderAll();
        }
    });
}

/**
 * Configura eventos de zoom
 */
function setupZoomEvents() {
    // Actualizar tamaño al redimensionar ventana
    window.addEventListener('resize', function() {
        updateZoomDisplay();
    });
}

/**
 * Configura eventos del modal de texto
 */
function setupTextModalEvents() {
    const textModal = document.getElementById('text-editor-modal');
    
    // Cuando se muestra el modal
    textModal.addEventListener('shown.bs.modal', function() {
        document.getElementById('text-editor-content').focus();
    });
}

/**
 * Maneja la apertura de archivos
 */
function handleFileOpen(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            
            if (file.name.endsWith('.svg')) {
                fabric.loadSVGFromString(content, function(objects, options) {
                    canvas.clear();
                    const obj = fabric.util.groupSVGElements(objects, options);
                    canvas.add(obj);
                    canvas.renderAll();
                    window.history.saveState(canvas);
                });
            } else {
                canvas.loadFromJSON(content, function() {
                    canvas.renderAll();
                    window.history.saveState(canvas);
                });
            }
        } catch (error) {
            alert('Error al cargar el archivo: ' + error.message);
        }
    };
    
    if (file.name.endsWith('.svg')) {
        reader.readAsText(file);
    } else {
        reader.readAsText(file);
    }
    
    event.target.value = '';
}

/**
 * Guarda el canvas como JSON
 */
function saveToJSON() {
    const data = JSON.stringify(canvas.toJSON());
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = 'diseño-vectorial.json';
    link.href = url;
    link.click();
}

/**
 * Actualiza la visualización del zoom
 */
function updateZoomDisplay() {
    document.getElementById('zoom-level').textContent = `${appState.zoomLevel}%`;
}

// Inicializar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que main.js haya inicializado el canvas
    setTimeout(() => {
        if (window.app && window.app.canvas) {
            canvas = window.app.canvas;
            setupUIEvents();
        }
    }, 100);
});

// Exportar funciones principales si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupUIEvents,
        handleFileOpen,
        saveToJSON
    };
}