window.appState = window.appState || {};

const professionalFeatures = {
    layerManager: null,
    textTools: null,
    exportManager: null,
    effects: null,
    gradientEditor: null
};

// App State - Estructura mejorada y organizada

window.appState = {
    // Herramientas y estado de dibujo
    currentTool: 'select',
    isDrawing: false,
    isDrawingPolygon: false,
    currentShape: null,
    startX: 0,
    startY: 0,
    polygonPoints: [],
    clipboard: null,
    keysPressed: {
        shift: false,
        ctrl: false,
    },
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    canvasOffsetX: 0,
    canvasOffsetY: 0,
    
    // Colores y estilos
    colors: {
        fill: '#ffffff',
        stroke: '#000000',
        text: '#000000',
        textStroke: '#000000',
        shadow: '#000000'
    },
    stroke: {
        width: 1,
        style: 'solid',
        dashArray: null,
        textWidth: 0
    },

    // Texto
    text: {
        fontSize: 24,
        fontFamily: 'Arial',
        bold: false,
        italic: false,
        underline: false,
        align: 'left',
        charSpacing: 0,
        lineHeight: 1.1,
        shadow: {
            blur: 0,
            offset: 0
        }
    },

    // Documento
    document: {
        size: 'a4',
        width: 210,
        height: 297,
        units: 'mm',
        resolution: 300,
        orientation: 'portrait',
        background: '#ffffff'
    },

    // Vista y zoom
    view: {
        zoom: 100,
        showGrid: false,
        showRulers: false,
        showGuides: false,
        zoomLevels: [25, 50, 75, 100, 150, 200, 400],
        currentZoomIndex: 3
    },

    // Historial
    history: [],
    historyIndex: -1
};

let canvas;

// Después de la definición de appState:
fabric.Object.prototype.set({
    textBaseline: 'alphabetic'
});

// Configuración de controles UI
function setupUIControls() {
    // Tool selection
    document.querySelectorAll('[data-tool]').forEach(btn => {
        btn.addEventListener('click', function() {
            selectTool(this.dataset.tool);
        });
    });

    // Color pickers
    document.getElementById('fill-color').addEventListener('input', function() {
        appState.colors.fill = this.value;
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.set('fill', this.value);
            canvas.renderAll();
        }
    });
    
    document.getElementById('stroke-color').addEventListener('input', function() {
        appState.colors.stroke = this.value;
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.set('stroke', this.value);
            canvas.renderAll();
        }
    });

    // Stroke width
    document.getElementById('stroke-width').addEventListener('input', function() {
        appState.stroke.width = parseFloat(this.value);
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.set('strokeWidth', parseFloat(this.value));
            canvas.renderAll();
        }
    });

    // Document settings
    document.getElementById('document-settings').addEventListener('click', showDocumentSettings);

    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', zoomIn);
    document.getElementById('zoom-out').addEventListener('click', zoomOut);
    document.getElementById('zoom-fit').addEventListener('click', zoomFit);
    document.getElementById('zoom-100').addEventListener('click', zoomReset);

    // Toggle property panel
    document.getElementById('toggle-properties').addEventListener('click', function() {
        const panel = document.getElementById('property-panel');
        panel.classList.toggle('collapsed');
        
        // Actualizar el ícono del botón
        this.innerHTML = panel.classList.contains('collapsed') ? 
            '<i class="fas fa-sliders-h"></i>' : 
            '<i class="fas fa-sliders-h"></i>';
        
        // Forzar redibujado del canvas
        if (canvas) {
            canvas.renderAll();
        }
    });

    // Text properties validation
    document.getElementById('text-font-family').addEventListener('change', function() {
        appState.text.fontFamily = this.value;
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'text' || activeObj.type === 'i-text')) {
            activeObj.set('fontFamily', this.value);
            canvas.renderAll();
        }
    });

    // Controles de estilo (negrita, cursiva, subrayado)
    document.getElementById('text-bold').addEventListener('click', function() {
        appState.text.bold = !appState.text.bold;
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'text' || activeObj.type === 'i-text')) {
            activeObj.set('fontWeight', appState.text.bold ? 'bold' : 'normal');
            canvas.renderAll();
        }
    });

    // Text align buttons
    document.getElementById('text-align-left').addEventListener('click', function() {
        updateTextAlign('left');
    });
    document.getElementById('text-align-center').addEventListener('click', function() {
        updateTextAlign('center');
    });
    document.getElementById('text-align-right').addEventListener('click', function() {
        updateTextAlign('right');
    });

    // Ensure valid text properties for new text objects
    canvas.on('text:created', function(options) {
        options.target.set({
            textBaseline: 'alphabetic',
            fontFamily: appState.text.fontFamily,
            fontSize: appState.text.fontSize,
            fontWeight: appState.text.bold ? 'bold' : 'normal',
            fontStyle: appState.text.italic ? 'italic' : 'normal',
            underline: appState.text.underline,
            textAlign: appState.text.align,
            charSpacing: appState.text.charSpacing,
            lineHeight: appState.text.lineHeight
        });
    });

    // Agrega esto en initApp() o setupUIControls()
    function setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') appState.keysPressed.shift = true;
        if (e.key === 'Control') appState.keysPressed.ctrl = true;
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') appState.keysPressed.shift = false;
        if (e.key === 'Control') appState.keysPressed.ctrl = false;
    });
    }

    
}

// Initialize the app with error handling
async function initApp() {
    if (window.appInitialized) return; 
    window.appInitialized = true;
    try {
        // 1. Mostrar estado de carga
        showLoadingState(true);
        
        // 2. Inicializar canvas primero con configuraciones profesionales
        canvas = await CanvasUtils.initCanvas();
        if (!canvas) {
            throw new Error("No se pudo inicializar el canvas");
        }

        // Inicializar canvas solo si no existe
        if (!canvas) {
            canvas = await CanvasUtils.initCanvas();
            if (!canvas) throw new Error("Canvas initialization failed");
        }

        // 2.1 Configuraciones avanzadas del canvas
        CanvasUtils.enableAdvancedRendering();
        CanvasUtils.setupAdvancedEvents();
        
        // 3. Configurar herramientas estándar y profesionales
        try {
            // Herramientas básicas
            if (typeof initTools === 'function') {
                initTools();
            } else if (typeof CanvasUtils.initTools === 'function') {
                CanvasUtils.initTools();
            } else {
                console.warn('initTools no disponible - características limitadas');
            }
            
            // Herramientas profesionales
            if (typeof CanvasUtils.initProfessionalTools === 'function') {
                CanvasUtils.initProfessionalTools(canvas);
            }
            
            // Inicializar el sistema de capas
            professionalFeatures.layerManager = new ProfessionalFeatures.LayerManager(canvas);
            professionalFeatures.textTools = new ProfessionalFeatures.AdvancedTextTools(canvas);
            professionalFeatures.exportManager = new ProfessionalFeatures.ExportManager(canvas);
            professionalFeatures.effects = new ProfessionalFeatures.VisualEffects(canvas);

        } catch (toolsError) {
            console.error('Error inicializando herramientas:', toolsError);
        }

        // 4. Configurar debug y reparación mejorada
        if (typeof CanvasUtils.debugSelection === 'function') {
            CanvasUtils.debugSelection();
        }
        
        if (typeof CanvasUtils.fixStuckObjects === 'function') {
            setInterval(() => {
                CanvasUtils.fixStuckObjects();
                professionalFeatures.layerManager?.updateUI(); // Actualizar UI de capas
            }, 5000);
        }

        // 5. Configurar eventos del canvas con handlers profesionales
        canvas.on('text:created', function(options) {
            try {
                const textObj = options.target;
                textObj.set({
                    textBaseline: 'alphabetic',
                    fontFamily: appState.text.fontFamily || 'Arial',
                    fontSize: appState.text.fontSize || 24,
                    layerId: professionalFeatures.layerManager?.currentLayerId
                });
                
                // Aplicar configuración profesional de texto
                professionalFeatures.textTools?.applyProfessionalTextSettings(textObj);
                
            } catch (textError) {
                console.error('Error configurando texto:', textError);
            }
        });

        // Eventos profesionales adicionales
        canvas.on('object:modified', function(e) {
            if (professionalFeatures.layerManager) {
                professionalFeatures.layerManager.handleObjectModified(e);
            }
            saveToHistory();
        });

        canvas.on('selection:created', function(e) {
            if (e.selected && e.selected.length > 0) {
                const obj = e.selected[0];
                updatePropertiesPanel(obj);
                professionalFeatures.layerManager?.highlightLayerForObject(obj);
            }
        });

        // Configuración de eventos de UI avanzada
        CanvasUtils.setupPanEvents();
        setupZoomControls();
        setupAdvancedKeyboardShortcuts();

        // 6. Inicializar controles UI mejorados
        setupUIControls();
        
        // Cargar recursos adicionales (fuentes, patrones, etc.)
        await loadProfessionalResources();
        
        // 7. Configurar herramienta inicial con modo profesional
        selectTool('select');
        
        // 8. Inicializar modales estándar y profesionales
        if (typeof initModals === 'function') {
            initModals();
        }
        
        // Inicializar modales profesionales
        initProfessionalModals();

        // 9. Actualizar estado y UI profesional
        console.log('Aplicación profesional inicializada correctamente');
        document.dispatchEvent(new Event('app-loaded'));
        
        // Mostrar mensaje de bienvenida profesional
        showToast('Editor profesional listo', 'success');
        
    } catch (error) {
        console.error('Error crítico al inicializar la app profesional:', error);
        showError(`Error al iniciar la aplicación: ${error.message}`);
        
    } finally {
        showLoadingState(false);
    }
}

// Funciones auxiliares profesionales
async function loadProfessionalResources() {
    try {
        // Cargar fuentes profesionales
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&family=Montserrat:wght@400;700&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
        
        // Puedes agregar más recursos aquí (patrones, imágenes, etc.)
    } catch (error) {
        console.error('Error cargando recursos profesionales:', error);
    }
}

// app.js (modificar initProfessionalModals)
function initProfessionalModals() {
    // Verificar que el modal existe antes de inicializar
    if (document.getElementById('layer-settings-modal')) {
      const layerModal = new bootstrap.Modal('#layer-settings-modal', {
        keyboard: false,
        backdrop: 'static'
      });
      
      document.getElementById('add-layer-btn')?.addEventListener('click', () => {
        professionalFeatures.layerManager?.addLayer();
        layerModal.hide();
      });
    }
  }

function setupAdvancedKeyboardShortcuts() {
    // Atajos de teclado profesionales
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'N') {
            // Ctrl+Shift+N: Nueva capa
            professionalFeatures.layerManager?.addLayer();
            e.preventDefault();
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            // Ctrl+Shift+L: Bloquear/desbloquear capa actual
            professionalFeatures.layerManager?.toggleCurrentLayerLock();
            e.preventDefault();
        }
    });
}

function configureCanvasForProfessionalUse() {
    // Configuración de rendimiento
    fabric.Object.prototype.objectCaching = true;
    fabric.Object.prototype.stateProperties = fabric.Object.prototype.stateProperties
        .filter(prop => !['dirty', 'needsUpdate'].includes(prop));
    
    // Mejoras en la selección
    canvas.selectionColor = 'rgba(13, 110, 253, 0.3)';
    canvas.selectionBorderColor = '#0d6efd';
    canvas.selectionLineWidth = 2;
    canvas.selectionDashArray = [5, 5];
    
    // Eventos adicionales
    canvas.on('object:modified', handleProfessionalObjectModified);
    canvas.on('selection:created', handleProfessionalSelection);
}

function handleProfessionalObjectModified(e) {
    if (professionalFeatures.layerManager) {
        professionalFeatures.layerManager.updateLayersPanel();
    }
    saveToHistory();
}

function handleProfessionalSelection(e) {
    if (e.selected && e.selected.length > 0) {
        const obj = e.selected[0];
        updatePropertiesPanel(obj);
        
        // Actualizar panel de capas si es necesario
        if (professionalFeatures.layerManager) {
            professionalFeatures.layerManager.highlightLayerForObject(obj);
        }
    }
}

function setupZoomControls() {
    const canvasArea = document.querySelector('.canvas-wrapper');
    
    // 1. Zoom con Ctrl + Rueda del ratón (solo en área de trabajo)
    canvasArea.addEventListener('wheel', handleWheelZoom, { passive: false });

    // 2. Zoom con Ctrl + +/- (global pero prevenido)
    document.addEventListener('keydown', handleKeyboardZoom);
}

function handleWheelZoom(e) {
    if (e.ctrlKey) {
        e.preventDefault();
        const zoomDirection = e.deltaY < 0 ? 'in' : 'out';
        applyZoom(zoomDirection);
    }
}

function handleKeyboardZoom(e) {
    // Solo actuar si es Ctrl+ (+/-/=) y no estamos editando texto
    const isZoomIn = (e.ctrlKey && (e.key === '+' || e.key === '='));
    const isZoomOut = (e.ctrlKey && e.key === '-');
    const isEditingText = document.activeElement.tagName === 'TEXTAREA';
    
    if ((isZoomIn || isZoomOut) && !isEditingText) {
        e.preventDefault();
        applyZoom(isZoomIn ? 'in' : 'out');
    }
}

function applyZoom(direction) {
    const zoomLevels = [25, 50, 75, 100, 125, 150, 175, 200, 300, 400];
    let currentIndex = zoomLevels.findIndex(level => level >= appState.view.zoom) || 4; // 4 = 100%
    
    if (direction === 'in' && currentIndex < zoomLevels.length - 1) {
        currentIndex++;
    } else if (direction === 'out' && currentIndex > 0) {
        currentIndex--;
    }
    
    appState.view.zoom = zoomLevels[currentIndex];
    updateZoom();
}

// Función auxiliar para mostrar estado de carga
function showLoadingState(show) {
    const loader = document.getElementById('app-loader') || createLoader();
    loader.style.display = show ? 'flex' : 'none';
    
    function createLoader() {
        const loaderDiv = document.createElement('div');
        loaderDiv.id = 'app-loader';
        loaderDiv.style = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        loaderDiv.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <div class="ms-3 text-white">Inicializando aplicación...</div>
        `;
        document.body.appendChild(loaderDiv);
        return loaderDiv;
    }
}

// Helper function to show errors
function showError(message) {
    document.querySelectorAll('.app-error-alert').forEach(el => el.remove());
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'app-error-alert alert alert-danger position-fixed top-0 end-0 m-3';
    errorDiv.style.zIndex = '10000';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${message}
        <button onclick="this.parentElement.remove()" class="btn-close ms-2"></button>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 10000);
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    setTimeout(initApp, 0);
}

function setupShapeTool() {
    canvas.on('mouse:down', function(options) {
        if (appState.currentTool === 'text' || options.target) return;
        
        const pointer = canvas.getPointer(options.e);
        appState.startX = pointer.x;
        appState.startY = pointer.y;
        appState.isDrawing = true;
        
        createShape(pointer.x, pointer.y);
    });

    canvas.on('mouse:move', function(options) {
        if (!appState.isDrawing || !appState.currentShape) return;
        
        const pointer = canvas.getPointer(options.e);
        updateShapeDrawing(pointer.x, pointer.y);
    });

    canvas.on('mouse:up', function() {
        if (appState.isDrawing && appState.currentShape) {
            finishShapeDrawing();
        }
    });
}

function setupPolygonTool() {
    // Limpiar eventos anteriores
    canvas.off('mouse:down.polygon');
    canvas.off('mouse:move.polygon');
    canvas.off('mouse:dblclick.polygon');

    canvas.on('mouse:down.polygon', function(options) {
        if (appState.currentTool !== 'polygon' || options.target) return;
        
        const pointer = canvas.getPointer(options.e);
        
        if (!appState.isDrawingPolygon) {
            // Iniciar nuevo polígono
            appState.isDrawingPolygon = true;
            appState.polygonPoints = [{ x: pointer.x, y: pointer.y }];
            createPolygonShape(pointer.x, pointer.y);
        } else {
            // Añadir punto al polígono
            appState.polygonPoints.push({ x: pointer.x, y: pointer.y });
            updatePolygonDrawing(pointer.x, pointer.y);
        }
    });

    canvas.on('mouse:move.polygon', function(options) {
        if (!appState.isDrawingPolygon || !appState.currentShape) return;
        
        const pointer = canvas.getPointer(options.e);
        updatePolygonDrawing(pointer.x, pointer.y);
    });

    canvas.on('mouse:dblclick.polygon', function() {
        if (appState.currentTool === 'polygon' && appState.isDrawingPolygon) {
            if (appState.polygonPoints.length >= 3) {
                finishPolygonDrawing();
            } else {
                canvas.remove(appState.currentShape);
                cleanUpDrawingState();
            }
        }
    });
}

// Función optimizada para el texto
function setupTextTool() {
    // Limpiar solo eventos anteriores de texto
    canvas.off('mouse:down.text');
    
    canvas.on('mouse:down.text', function(options) {
        if (appState.currentTool !== 'text') return;
        
        // Editar texto existente
        if (options.target && (options.target.type === 'text' || options.target.type === 'i-text')) {
            options.target.enterEditing();
            options.target.selectAll();
            return;
        }
        
        // Crear nuevo texto
        const pointer = canvas.getPointer(options.e);
        const text = new fabric.IText('Haz clic para editar', {
            left: pointer.x,
            top: pointer.y,
            fontFamily: appState.text.fontFamily || 'Arial',
            fontSize: appState.text.fontSize || 24,
            fill: appState.colors.text,
            textAlign: appState.text.align,
            fontWeight: appState.text.bold ? 'bold' : 'normal',
            fontStyle: appState.text.italic ? 'italic' : 'normal',
            underline: appState.text.underline,
            textBackgroundColor: appState.colors.fill,
            stroke: appState.colors.textStroke,
            strokeWidth: appState.stroke.textWidth,
            padding: 10,
            editable: true,
            hasControls: true
        });
        
        canvas.add(text);
        text.enterEditing();
        text.selectAll();
        
        // Mantener la herramienta de texto activa
        selectTool('text');
    });
}

function createTextAtPosition(x, y) {
    const text = new fabric.IText('Haz clic para editar', {
        left: x,
        top: y,
        fontFamily: appState.text.fontFamily || 'Arial',
        fontSize: appState.text.fontSize || 24,
        fill: appState.colors.text,
        textAlign: appState.text.align,
        fontWeight: appState.text.bold ? 'bold' : 'normal',
        fontStyle: appState.text.italic ? 'italic' : 'normal',
        underline: appState.text.underline,
        textBackgroundColor: appState.colors.fill,
        stroke: appState.colors.textStroke,
        strokeWidth: appState.stroke.textWidth,
        padding: 10,
        editable: true,
        hasControls: true
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    
}

function updateTextAlign(align) {
    const activeObj = canvas.getActiveObject();
    if (activeObj && (activeObj.type === 'text' || activeObj.type === 'i-text')) {
        activeObj.set('textAlign', align);
        canvas.renderAll();
        
        // Update buttons
        document.getElementById('text-align-left').classList.remove('active');
        document.getElementById('text-align-center').classList.remove('active');
        document.getElementById('text-align-right').classList.remove('active');
        document.getElementById(`text-align-${align}`).classList.add('active');
    }
}

function setupDrawingTool(tool) {
    canvas.selection = false;
    canvas.isDrawingMode = true;
    canvas.hoverCursor = 'crosshair';
    
    // Configurar el pincel adecuado
    if (tool === 'pen') {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    } else {
        canvas.freeDrawingBrush = new fabric.BaseBrush(canvas);
    }
    
    canvas.freeDrawingBrush.color = appState.colors.stroke;
    canvas.freeDrawingBrush.width = appState.stroke.width;
}

function setupSelectionTool() {
    canvas.selection = true;
    canvas.isDrawingMode = false;
    canvas.hoverCursor = 'move';
}

function setupShapeTool(tool) {
    // Limpiar eventos anteriores específicos de formas
    canvas.off('mouse:down.shape');
    canvas.off('mouse:move.shape');
    canvas.off('mouse:up.shape');

    // Configurar nuevo estado para la herramienta
    appState.currentTool = tool;
    canvas.selection = false;
    canvas.isDrawingMode = false;
    canvas.hoverCursor = 'crosshair';

    // Evento para iniciar el dibujo
    canvas.on('mouse:down.shape', function(options) {
        if (appState.currentTool !== tool || options.target) return;
        
        const pointer = canvas.getPointer(options.e);
        appState.startX = pointer.x;
        appState.startY = pointer.y;
        appState.isDrawing = true;
        
        createShape(pointer.x, pointer.y, tool); // Pasar el tipo de herramienta
    });

    // Evento para actualizar el dibujo
    canvas.on('mouse:move.shape', function(options) {
        if (!appState.isDrawing || !appState.currentShape) return;
        
        const pointer = canvas.getPointer(options.e);
        updateShapeDrawing(pointer.x, pointer.y, tool); // Pasar el tipo de herramienta
    });

    // Evento para finalizar el dibujo
    // Modifica el evento mouse:up en setupShapeTool()
    canvas.on('mouse:up.shape', function() {
        if (appState.isDrawing && appState.currentShape) {
            // Si Ctrl está presionado, duplicar la forma
            if (appState.keysPressed.ctrl) {
                appState.currentShape.clone(cloned => {
                    cloned.set({
                        left: cloned.left + 10,
                        top: cloned.top + 10,
                        selectable: true
                    });
                    canvas.add(cloned);
                });
            }
            finishShapeDrawing();
        }
    });
}

// Configurar eventos del menú Archivo
function setupFileMenu() {
    // Nuevo documento
    document.getElementById('new-file').addEventListener('click', function(e) {
        e.preventDefault();
        newFile();
    });
    
    // Abrir documento
    document.getElementById('open-file').addEventListener('click', function(e) {
        e.preventDefault();
        openFile();
    });
    
    // Guardar documento
    document.getElementById('save-file').addEventListener('click', function(e) {
        e.preventDefault();
        saveFile();
    });
    
    // Importar imagen
    document.getElementById('import-image').addEventListener('click', function(e) {
        e.preventDefault();
        importImage();
    });
    
    // Exportar como PNG
    document.getElementById('export-png').addEventListener('click', function(e) {
        e.preventDefault();
        exportToPNG();
    });
    
    // Exportar como JPEG
    document.getElementById('export-jpeg').addEventListener('click', function(e) {
        e.preventDefault();
        exportToJPEG();
    });
    
    // Exportar como SVG
    document.getElementById('export-svg').addEventListener('click', function(e) {
        e.preventDefault();
        exportToSVG();
    });
    
    // Exportar como PDF
    document.getElementById('export-pdf').addEventListener('click', function(e) {
        e.preventDefault();
        exportToPDF();
    });
    
    // Configurar el input de archivo
    document.getElementById('file-input').addEventListener('change', handleFileOpen);
    
    // Configurar el input de imagen
    document.getElementById('image-import-input').addEventListener('change', handleImageImport);
}

// Llamar a setupFileMenu en la inicialización de la app
document.addEventListener('app-loaded', setupFileMenu);

// Configurar eventos del teclado
// Configurar atajos de teclado mejorados
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Solo actuar si no estamos editando texto
        const activeObject = canvas.getActiveObject();
        const isEditingText = activeObject && activeObject.isEditing;
        
        if (!isEditingText) {
            // Ctrl+Z (Deshacer)
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undoAction();
            }
            
            // Ctrl+Y o Ctrl+Shift+Z (Rehacer)
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                redoAction();
            }
            
            // Ctrl+X (Cortar)
            if (e.ctrlKey && e.key === 'x') {
                e.preventDefault();
                cutAction();
            }
            
            // Ctrl+C (Copiar)
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                copyAction();
            }
            
            // Ctrl+V (Pegar)
            if (e.ctrlKey && e.key === 'v') {
                e.preventDefault();
                pasteAction();
            }
            
            // Suprimir (Eliminar)
            if (e.key === 'Delete') {
                e.preventDefault();
                deleteAction();
            }
            
            // Ctrl+G (Agrupar)
            if (e.ctrlKey && e.key === 'g' && !e.shiftKey) {
                e.preventDefault();
                groupObjects();
            }
            
            // Ctrl+Shift+G (Desagrupar)
            if (e.ctrlKey && e.shiftKey && e.key === 'g') {
                e.preventDefault();
                ungroupObjects();
            }
            
            // Ctrl+D (Duplicar)
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                duplicateAction();
            }
        }
    });
}

// Configurar eventos del menú Editar
function setupEditMenu() {
    try {
        const canvas = CanvasUtils.getCanvas();
        
        // Lista de elementos del menú editar
        const editMenuItems = [
            'undo-action', 'redo-action', 'cut-action', 'copy-action',
            'paste-action', 'delete-action', 'group-objects',
            'ungroup-objects', 'duplicate'
        ];
        
        // Verificar que todos los elementos existen antes de agregar event listeners
        editMenuItems.forEach(itemId => {
            const element = document.getElementById(itemId);
            if (element) {
                element.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Llama a la función correspondiente
                    const actionName = itemId.replace('-action', '') + 'Action';
                    if (typeof window[actionName] === 'function') {
                        window[actionName]();
                    }
                });
            } else {
                console.warn(`Elemento no encontrado: ${itemId}`);
            }
        });
        
        // Actualizar estado inicial
        updateEditMenuState();
        
        // Configurar eventos para actualizar estado del menú
        if (canvas) {
            canvas.on('selection:created', updateEditMenuState);
            canvas.on('selection:updated', updateEditMenuState);
            canvas.on('selection:cleared', updateEditMenuState);
            canvas.on('object:modified', updateEditMenuState);
            canvas.on('history:changed', updateEditMenuState);
        }
        
    } catch (error) {
        console.error('Error setting up edit menu:', error);
    }
}

// Función para mostrar estado de disponibilidad de las acciones
function updateEditMenuState() {
    try {
        const canvas = CanvasUtils.getCanvas();
        const canUndo = appState.historyIndex > 0;
        const canRedo = appState.historyIndex < appState.history.length - 1;
        
        const activeObject = canvas.getActiveObject();
        const hasSelection = activeObject !== null;
        const isGroup = hasSelection && activeObject && activeObject.type === 'group';
        const clipboardAvailable = appState.clipboard !== null;
        
        // Update classes disabled
        const disable = (elementId, condition) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.toggle('disabled', condition);
            }
        };
        
        disable('undo-action', !canUndo);
        disable('redo-action', !canRedo);
        disable('cut-action', !hasSelection);
        disable('copy-action', !hasSelection);
        disable('paste-action', !clipboardAvailable);
        disable('delete-action', !hasSelection);
        disable('group-objects', !hasSelection || (hasSelection && canvas.getActiveObjects().length < 2));
        disable('ungroup-objects', !isGroup);
        disable('duplicate', !hasSelection);
        
        // Update tooltips with keyboard shortcuts
        const updateTooltip = (elementId, text, condition) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.title = `${text}${condition ? '' : ' - No disponible'}`;
            }
        };
        
        updateTooltip('undo-action', 'Deshacer (Ctrl+Z)', canUndo);
        updateTooltip('redo-action', 'Rehacer (Ctrl+Y)', canRedo);
        updateTooltip('cut-action', 'Cortar (Ctrl+X)', hasSelection);
        updateTooltip('copy-action', 'Copiar (Ctrl+C)', hasSelection);
        updateTooltip('paste-action', 'Pegar (Ctrl+V)', clipboardAvailable);
        updateTooltip('delete-action', 'Eliminar (Supr)', hasSelection);
        updateTooltip('group-objects', 'Agrupar (Ctrl+G)', hasSelection);
        updateTooltip('ungroup-objects', 'Desagrupar (Ctrl+Shift+G)', isGroup);
        updateTooltip('duplicate', 'Duplicar (Ctrl+D)', hasSelection);
        
    } catch (error) {
        console.error('Error updating edit menu state:', error);
    }
}

// Llamar a setupEditMenu y setupKeyboardShortcuts en la inicialización
document.addEventListener('app-loaded', function() {
    setupEditMenu();
    setupKeyboardShortcuts();
    
    // Actualizar estado del menú cuando cambia la selección
    canvas.on('selection:created', updateEditMenuState);
    canvas.on('selection:updated', updateEditMenuState);
    canvas.on('selection:cleared', updateEditMenuState);
    canvas.on('object:modified', updateEditMenuState);
});

// En app.js
function alignObjects(alignment) {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 2) return;

    const boundingRect = canvas.getActiveObject().getBoundingRect();
    
    activeObjects.forEach(obj => {
        switch(alignment) {
            case 'left':
                obj.set({ left: boundingRect.left });
                break;
            case 'right':
                obj.set({ left: boundingRect.left + boundingRect.width - obj.width });
                break;
            case 'center':
                obj.set({ left: boundingRect.left + (boundingRect.width - obj.width)/2 });
                break;
            case 'top':
                obj.set({ top: boundingRect.top });
                break;
            case 'bottom':
                obj.set({ top: boundingRect.top + boundingRect.height - obj.height });
                break;
            case 'middle':
                obj.set({ top: boundingRect.top + (boundingRect.height - obj.height)/2 });
                break;
        }
        obj.setCoords();
    });
    canvas.renderAll();
    saveToHistory();
}

function groupObjects() {
    const canvas = CanvasUtils.getCanvas();
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 2) {
        showToast('Selecciona al menos 2 objetos para agrupar', 'warning');
        return;
    }
    
    const group = new fabric.Group(activeObjects, {
        left: activeObjects[0].left,
        top: activeObjects[0].top,
        subTargetCheck: true,
        interactive: true
    });
    
    canvas.remove(...activeObjects);
    canvas.add(group);
    canvas.setActiveObject(group);
    saveToHistory();
    showToast(`Objetos agrupados (${activeObjects.length} elementos)`, 'success');
}

function ungroupObjects() {
    const canvas = CanvasUtils.getCanvas();
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') {
        showToast('Selecciona un grupo para desagrupar', 'warning');
        return;
    }
    
    const objects = activeObject.getObjects();
    const center = activeObject.getCenterPoint();
    
    canvas.remove(activeObject);
    
    objects.forEach(obj => {
        // Restaurar posición relativa al grupo
        const newLeft = center.x + (obj.left - activeObject.left);
        const newTop = center.y + (obj.top - activeObject.top);
        
        obj.set({
            left: newLeft,
            top: newTop,
            selectable: true
        });
        
        canvas.add(obj);
    });
    
    canvas.renderAll();
    saveToHistory();
    showToast(`Grupo desagrupado (${objects.length} objetos liberados)`, 'success');
}

function duplicateAction() {
    const canvas = CanvasUtils.getCanvas();
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
        showToast('Nada seleccionado para duplicar', 'warning');
        return;
    }
    
    activeObject.clone(cloned => {
        cloned.set({
            left: cloned.left + 20,
            top: cloned.top + 20,
            evented: true
        });
        
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
        saveToHistory();
        showToast('Objeto duplicado', 'success');
    });
}


// Función para duplicar
function duplicateAction() {
    const canvas = CanvasUtils.getCanvas();
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
        showToast('Nada seleccionado para duplicar', 'warning');
        return;
    }
    
    activeObject.clone(cloned => {
        cloned.set({
            left: cloned.left + 20,
            top: cloned.top + 20,
            evented: true
        });
        
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
        saveToHistory();
        showToast('Objeto duplicado', 'success');
    });
}

function updateLayersPanel() {
    const layersContainer = document.getElementById('layers-list');
    layersContainer.innerHTML = '';
    
    canvas.getObjects().forEach((obj, index) => {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.innerHTML = `
            <input type="checkbox" ${obj.visible ? 'checked' : ''}>
            <span>${obj.name || `Capa ${index+1}`}</span>
            <div class="layer-actions">
                <i class="fas fa-eye${obj.visible ? '' : '-slash'}"></i>
                <i class="fas fa-lock${obj.locked ? '' : '-open'}"></i>
            </div>
        `;
        layersContainer.appendChild(layerItem);
    });
}

function flipObject(axis) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set({
            flipX: axis === 'horizontal' ? !activeObject.flipX : activeObject.flipX,
            flipY: axis === 'vertical' ? !activeObject.flipY : activeObject.flipY
        });
        canvas.renderAll();
        saveToHistory();
    }
}

function rotateObject(degrees) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.angle += degrees;
        activeObject.setCoords();
        canvas.renderAll();
        saveToHistory();
    }
}

function undoAction() {
    if (appState.historyIndex > 0) {
        appState.historyIndex--;
        loadStateFromHistory();
        showToast(`Deshacer: Estado ${appState.historyIndex + 1}/${appState.history.length}`, 'info');
    } else {
        showToast('No hay más acciones para deshacer', 'warning');
    }
}

function redoAction() {
    if (appState.historyIndex < appState.history.length - 1) {
        appState.historyIndex++;
        loadStateFromHistory();
        showToast(`Rehacer: Estado ${appState.historyIndex + 1}/${appState.history.length}`, 'info');
    } else {
        showToast('No hay más acciones para rehacer', 'warning');
    }
}

function cutAction() {
    const canvas = CanvasUtils.getCanvas();
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
        showToast('Nada seleccionado para cortar', 'warning');
        return;
    }
    
    copyAction();
    deleteAction();
    showToast('Objeto cortado al portapapeles', 'success');
}

function copyAction() {
    const canvas = CanvasUtils.getCanvas();
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
        showToast('Nada seleccionado para copiar', 'warning');
        return;
    }
    
    activeObject.clone(cloned => {
        // Clonar con offset para pegar en posición diferente
        cloned.set({
            left: cloned.left + 10,
            top: cloned.top + 10,
            evented: true
        });
        
        appState.clipboard = cloned;
        showToast('Objeto copiado al portapapeles', 'success');
    }, ['left', 'top', 'scaleX', 'scaleY', 'angle', 'flipX', 'flipY', 'fill', 'stroke', 'strokeWidth']);
}

function pasteAction() {
    const canvas = CanvasUtils.getCanvas();
    if (!appState.clipboard) {
        showToast('Portapapeles vacío', 'warning');
        return;
    }
    
    appState.clipboard.clone(cloned => {
        // Aplicar offset adicional para cada pegado
        cloned.set({
            left: cloned.left + 10,
            top: cloned.top + 10,
            evented: true
        });
        
        canvas.discardActiveObject();
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
        saveToHistory();
        showToast('Objeto pegado', 'success');
    });
}

function deleteAction() {
    const canvas = CanvasUtils.getCanvas();
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
        showToast('Nada seleccionado para eliminar', 'warning');
        return;
    }
    
    canvas.remove(activeObject);
    saveToHistory();
    showToast('Objeto eliminado', 'success');
}

// Al final de app.js
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});