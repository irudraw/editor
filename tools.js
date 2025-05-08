// En tools.js, agregar al inicio:
if (typeof window.appState === 'undefined') {
    window.appState = {}; // Inicialización temporal
  }
  
// tools.js (agregar al inicio)
function createArrowShape() {
    const arrow = new fabric.Path('M 0 0 L 20 10 L 0 20 L 5 10 z', {
      fill: appState.colors.fill,
      stroke: appState.colors.stroke,
      strokeWidth: appState.stroke.width
    });
    canvas.add(arrow);
  }
  
  function createStarShape() {
    const star = new fabric.Path('M 50 0 L 61 35 L 98 35 L 68 57 L 79 92 L 50 72 L 21 92 L 32 57 L 2 35 L 39 35 z', {
      fill: appState.colors.fill,
      stroke: appState.colors.stroke,
      strokeWidth: appState.stroke.width,
      scaleX: 0.3,
      scaleY: 0.3
    });
    canvas.add(star);
  }
  
  function createBubbleShape() {
    const bubble = new fabric.Path('M 50 15 Q 70 5 90 15 Q 85 40 100 50 Q 85 60 90 85 Q 70 95 50 85 Q 30 95 10 85 Q 15 60 0 50 Q 15 40 10 15 Q 30 5 50 15 z', {
      fill: appState.colors.fill,
      stroke: appState.colors.stroke,
      strokeWidth: appState.stroke.width
    });
    canvas.add(bubble);
  }
  
  const ProfessionalTools = {
    initAdvancedTools: function(canvas) {
        this.setupPenPressure(canvas);
        this.setupShapeLibrary(canvas);
        this.setupAdvancedTextTools(canvas);
    },
    
    setupPenPressure: function() {
        // Configuración para tabletas gráficas
        canvas.isDrawingMode = false;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = 2;
        
        document.addEventListener('pointerdown', (e) => {
            if (e.pressure && appState.currentTool === 'pen') {
                canvas.freeDrawingBrush.width = e.pressure * 10;
            }
        });
    },
    
    setupShapeLibrary: function() {
        // Biblioteca de formas predefinidas
        const shapeLibrary = {
            'arrow': createArrowShape,
            'star': createStarShape,
            'bubble': createBubbleShape
        };
        
        document.querySelectorAll('.shape-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                const shapeType = btn.dataset.shape;
                if (shapeLibrary[shapeType]) {
                    shapeLibrary[shapeType]();
                }
            });
        });
    },
    
    // En setupAdvancedTextTools
setupAdvancedTextTools: function() {
    const textPathBtn = document.getElementById('text-path-btn');
    if (!textPathBtn) return;
    
    textPathBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.type === 'text') {
            this.convertTextToPath(activeObj);
        }
    });
},
    
    convertTextToPath: function(textObj) {
        // Conversión de texto a trazado
        const textPath = new fabric.Path.fromText(textObj.text, {
            left: textObj.left,
            top: textObj.top,
            fill: textObj.fill,
            stroke: textObj.stroke,
            strokeWidth: textObj.strokeWidth
        });
        
        canvas.remove(textObj);
        canvas.add(textPath);
        canvas.setActiveObject(textPath);
        canvas.renderAll();
    }
};

// Initialize Tools with validation
function initTools() {
    try {
        const canvas = CanvasUtils.getCanvas();
        
        // Configuración inicial neutral
        canvas.selection = false;
        canvas.isDrawingMode = false;
        canvas.hoverCursor = 'default';
        
        console.log('Herramientas inicializadas correctamente');
    } catch (error) {
        console.error('Error inicializando herramientas:', error);
    }
}

// Asegurarse de que initTools esté disponible en CanvasUtils
if (typeof CanvasUtils !== 'undefined') {
    CanvasUtils.initTools = initTools;
    CanvasUtils.configureDrawingBrush = configureDrawingBrush;
    CanvasUtils.resetPolygonState = resetPolygonState;
    CanvasUtils.initProfessionalTools = function() {
        ProfessionalTools.initAdvancedTools();
    };
}

// Tool Selection with improved organization
function selectTool(tool) {
    try {
        const canvas = CanvasUtils.getCanvas();
        if (!canvas) {
            throw new Error("Canvas no está inicializado");
        }

        // Lista de herramientas válidas (ampliada con herramientas profesionales)
        const validTools = ['select', 'text', 'rectangle', 'ellipse', 'triangle', 
                          'polygon', 'line', 'pen', 'freehand', 'gradient', 'shape-library'];
        if (!validTools.includes(tool)) {
            console.warn(`Herramienta no válida: ${tool}`);
            return;
        }

        // Limpiar estado de dibujo anterior
        if (appState.isDrawing || appState.isDrawingPolygon) {
            cleanUpDrawingState();
            if (appState.currentShape && canvas.contains(appState.currentShape)) {
                canvas.remove(appState.currentShape);
            }
        }

        // Limpiar eventos específicos anteriores
        canvas.off('mouse:down.tool');
        canvas.off('mouse:move.tool');
        canvas.off('mouse:up.tool');
        canvas.off('mouse:dblclick.tool');
        canvas.off('object:selected.tool');

        // Actualizar estado y UI
        appState.currentTool = tool;
        updateToolUI(tool);

        // Configurar el canvas según la herramienta
        switch(tool) {
            case 'select':
                configureSelectionTool();
                break;
                
            case 'text':
                configureTextTool();
                break;
                
            case 'pen':
                configurePenTool(); // Nueva función para pluma profesional
                break;
                
            case 'freehand':
                configureDrawingTool(tool);
                break;
                
            case 'polygon':
                configurePolygonTool();
                break;
                
            case 'gradient': // Nueva herramienta de degradado
                configureGradientTool();
                break;
                
            case 'shape-library': // Nueva herramienta de biblioteca de formas
                configureShapeLibraryTool();
                break;
                
            case 'rectangle':
            case 'ellipse':
            case 'triangle':
            case 'line':
                configureShapeTool(tool);
                break;
        }

        // Actualizar cursor y configuración profesional
        updateCursorForTool(tool);
        updateProfessionalToolSettings(tool);
        
        // Mostrar guía de herramienta profesional
        showProfessionalTooltip(tool);
        
        canvas.renderAll();
        
        // Registrar el cambio de herramienta para analytics
        logToolChange(tool);

    } catch (error) {
        console.error('Error en selectTool:', error);
        showToast(`Error al cambiar herramienta: ${error.message}`, 'danger');
        
        // Restaurar herramienta select por defecto en caso de error
        selectTool('select');
    }
}

// Nuevas funciones de soporte profesional
function configurePenTool() {
    const canvas = CanvasUtils.getCanvas();
    canvas.selection = false;
    canvas.isDrawingMode = true;
    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';

    // Configuración profesional del pincel
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = appState.colors.stroke;
    canvas.freeDrawingBrush.width = appState.stroke.width;
    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
        color: 'rgba(0,0,0,0.3)',
        blur: 5,
        offsetX: 2,
        offsetY: 2
    });

    // Soporte para presión en tabletas gráficas
    canvas.on('mouse:down', (opt) => {
        if (opt.e.pressure && appState.currentTool === 'pen') {
            canvas.freeDrawingBrush.width = opt.e.pressure * appState.stroke.width * 2;
        }
    });
}

function configureGradientTool() {
    const canvas = CanvasUtils.getCanvas();
    canvas.selection = true;
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';

    canvas.on('mouse:down.tool', (options) => {
        if (options.target) {
            professionalFeatures.gradientEditor.startEditing(options.target);
        } else {
            professionalFeatures.gradientEditor.createNewGradient(
                canvas.getPointer(options.e)
            );
        }
    });
}

function configureShapeLibraryTool() {
    const canvas = CanvasUtils.getCanvas();
    canvas.selection = false;
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'pointer';

    // Mostrar el panel de biblioteca de formas
    professionalFeatures.shapeLibrary.showPanel();
}

function updateProfessionalToolSettings(tool) {
    // Configuración específica para herramientas profesionales
    switch(tool) {
        case 'pen':
            document.getElementById('brush-settings-panel').style.display = 'block';
            break;
        case 'gradient':
            document.getElementById('gradient-editor-panel').style.display = 'block';
            break;
        default:
            document.getElementById('brush-settings-panel').style.display = 'none';
            document.getElementById('gradient-editor-panel').style.display = 'none';
    }
}

function showProfessionalTooltip(tool) {
    const tooltips = {
        'pen': 'Modo pluma profesional: Use Shift para líneas rectas, Alt para borrador temporal',
        'gradient': 'Haga clic en un objeto para aplicar degradado o en el lienzo para crear uno nuevo',
        'shape-library': 'Seleccione una forma de la biblioteca para insertar'
    };
    
    if (tooltips[tool]) {
        showToast(tooltips[tool], 'info', 3000);
    }
}

function logToolChange(tool) {
    if (typeof professionalFeatures.analytics === 'object') {
        professionalFeatures.analytics.logEvent('tool-change', {
            tool: tool,
            timestamp: new Date().toISOString()
        });
    }
}

// Funciones auxiliares para configuración de herramientas
function configureSelectionTool() {
    const canvas = CanvasUtils.getCanvas();
    canvas.selection = true;
    canvas.isDrawingMode = false;
    canvas.hoverCursor = 'move';
    canvas.defaultCursor = 'default';
}

function configureTextTool() {
    const canvas = CanvasUtils.getCanvas();
    canvas.selection = false;
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'text';
    canvas.hoverCursor = 'text';

    canvas.on('mouse:down.tool', function(options) {
        if (appState.currentTool !== 'text') return;
        
        // Si se hace clic en texto existente, editarlo
        if (options.target && (options.target.type === 'text' || options.target.type === 'i-text')) {
            options.target.enterEditing();
            options.target.selectAll();
            return;
        }
        
        // Crear nuevo texto
        const pointer = canvas.getPointer(options.e);
        createTextAtPosition(pointer.x, pointer.y);
    });
}

function configureDrawingTool(tool) {
    const canvas = CanvasUtils.getCanvas();
    canvas.selection = false;
    canvas.isDrawingMode = true;
    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';

    // Configurar pincel
    const brush = tool === 'pen' ? new fabric.PencilBrush(canvas) : new fabric.BaseBrush(canvas);
    brush.color = appState.colors.stroke;
    brush.width = appState.stroke.width;
    canvas.freeDrawingBrush = brush;
}

function configurePolygonTool() {
    const canvas = CanvasUtils.getCanvas();
    canvas.selection = false;
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';

    // Reiniciar estado del polígono
    appState.polygonPoints = [];
    appState.isDrawingPolygon = false;

    canvas.on('mouse:down.tool', function(options) {
        if (appState.currentTool !== 'polygon' || options.target) return;
        
        const pointer = canvas.getPointer(options.e);
        
        if (!appState.isDrawingPolygon) {
            // Iniciar nuevo polígono
            appState.isDrawingPolygon = true;
            appState.polygonPoints = [{ x: pointer.x, y: pointer.y }];
            createShape(pointer.x, pointer.y);
        } else {
            // Añadir punto al polígono
            appState.polygonPoints.push({ x: pointer.x, y: pointer.y });
            updatePolygonDrawing(pointer.x, pointer.y);
        }
    });

    canvas.on('mouse:dblclick.tool', function() {
        if (appState.currentTool === 'polygon' && appState.isDrawingPolygon) {
            if (appState.polygonPoints.length >= 3) {
                finishPolygonDrawing();
            } else {
                cleanUpDrawingState();
            }
        }
    });
}

function configureShapeTool(tool) {
    const canvas = CanvasUtils.getCanvas();
    canvas.selection = false;
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';

    canvas.on('mouse:down.tool', function(options) {
        if (appState.currentTool !== tool || options.target) return;
        
        const pointer = canvas.getPointer(options.e);
        appState.startX = pointer.x;
        appState.startY = pointer.y;
        appState.isDrawing = true;
        
        createShape(pointer.x, pointer.y);
    });

    canvas.on('mouse:move.tool', function(options) {
        if (!appState.isDrawing || !appState.currentShape) return;
        
        const pointer = canvas.getPointer(options.e);
        updateShapeDrawing(pointer.x, pointer.y);
    });

    canvas.on('mouse:up.tool', function() {
        if (appState.isDrawing && appState.currentShape) {
            finishShapeDrawing();
        }
    });
}

function updateToolUI(tool) {
    document.querySelectorAll('[data-tool]').forEach(el => {
        el.classList.toggle('active', el.dataset.tool === tool);
    });
}

function updateCursorForTool(tool) {
    const canvas = CanvasUtils.getCanvas();
    const cursors = {
        'select': 'move',
        'text': 'text',
        'rectangle': 'crosshair',
        'ellipse': 'crosshair',
        'polygon': 'crosshair',
        'triangle': 'crosshair',
        'line': 'crosshair',
        'pen': 'crosshair',
        'freehand': 'crosshair'
    };
    
    canvas.defaultCursor = cursors[tool] || 'default';
    canvas.hoverCursor = cursors[tool] || 'default';
}

function configureCanvasForTool(tool) {
    const config = {
        isDrawingMode: false,
        selection: false,
        defaultCursor: 'default',
        hoverCursor: 'default'
    };

    switch(tool) {
        case 'select':
            config.selection = true;
            config.hoverCursor = 'move';
            config.defaultCursor = 'move';
            canvas.selectionColor = 'rgba(13, 110, 253, 0.3)';
            canvas.selectionBorderColor = '#0d6efd';
            break;

        case 'text':
            config.selection = false;
            config.defaultCursor = 'text';
            config.hoverCursor = 'text';
            setupTextTool();
            break;

        case 'pen':
        case 'freehand':
            config.isDrawingMode = true;
            config.defaultCursor = 'crosshair';
            config.hoverCursor = 'crosshair';
            configureDrawingBrush(tool);
            break;

        case 'polygon':
            config.defaultCursor = 'crosshair';
            config.hoverCursor = 'crosshair';
            setupPolygonTool();
            resetPolygonState();
            break;

        case 'rectangle':
        case 'ellipse':
        case 'triangle':
        case 'line':
            config.defaultCursor = 'crosshair';
            config.hoverCursor = 'crosshair';
            setupShapeTool(tool);
            break;

        default:
            console.warn('Herramienta no reconocida:', tool);
            return;
    }

    // Aplicar configuración al canvas
    Object.assign(canvas, config);
    
    // Actualización adicional para herramientas de forma
    if (['rectangle', 'ellipse', 'triangle', 'line'].includes(tool)) {
        canvas.selection = false;
        canvas.hoverCursor = 'crosshair';
    }

    // Forzar actualización del cursor
    updateCursorForTool(tool);
    canvas.renderAll();
}

function setupTextTool() {
    // Limpiar eventos anteriores para evitar duplicados
    canvas.off('mouse:down');
    
    // Configurar evento para crear texto al hacer clic
    canvas.on('mouse:down', function(options) {
        if (appState.currentTool !== 'text') return;
        
        // Si hay un objeto donde hicimos clic, no crear nuevo texto
        if (options.target) {
            // Si es texto, permitir edición
            if (options.target.type === 'text' || options.target.type === 'i-text') {
                options.target.enterEditing();
                options.target.selectAll();
            }
            return;
        }
        
        const pointer = canvas.getPointer(options.e);
        createTextAtPosition(pointer.x, pointer.y);
    });
}



function configureDrawingBrush(tool) {
    const canvas = CanvasUtils.getCanvas();
    const brush = tool === 'pen' ? 
        new fabric.PencilBrush(canvas) : 
        new fabric.BaseBrush(canvas);
    
    brush.color = appState.colors.stroke;
    brush.width = appState.stroke.width;
    canvas.freeDrawingBrush = brush;
}

function resetPolygonState() {
    appState.polygonPoints = [];
    appState.isDrawingPolygon = false;
}

// Text Tool Functions
// En tools.js, modifica la función showTextEditor o donde crees objetos de texto:
// Reemplazar la función showTextEditor con esta versión mejorada
function showTextEditor(x, y) {
    const modal = new bootstrap.Modal(document.getElementById('text-editor-modal'));
    
    // Resetear el editor
    resetTextEditor();
    
    // Manejar la aplicación de cambios
    document.getElementById('apply-text-editor').onclick = function() {
        applyTextChanges(x, y);
        modal.hide();
    };
    
    modal.show();
}

function resetTextEditor() {
    document.getElementById('text-editor-content').value = '';
    document.getElementById('text-editor-font').value = appState.text.fontFamily;
    document.getElementById('text-editor-size').value = appState.text.fontSize;
    document.getElementById('text-editor-color').value = appState.colors.text;
    
    // Reset style buttons
    document.getElementById('text-editor-bold').classList.toggle('active', appState.text.bold);
    document.getElementById('text-editor-italic').classList.toggle('active', appState.text.italic);
    document.getElementById('text-editor-underline').classList.toggle('active', appState.text.underline);
    
    setTextAlignButtons(appState.text.align);
}

function setupTextEditorButtons() {
    // Text style buttons
    document.getElementById('text-editor-bold').addEventListener('click', function() {
        this.classList.toggle('active');
    });
    
    document.getElementById('text-editor-italic').addEventListener('click', function() {
        this.classList.toggle('active');
    });
    
    document.getElementById('text-editor-underline').addEventListener('click', function() {
        this.classList.toggle('active');
    });
    
    // Text align buttons
    document.getElementById('text-editor-align-left').addEventListener('click', function() {
        setTextAlignButtons('left');
    });
    
    document.getElementById('text-editor-align-center').addEventListener('click', function() {
        setTextAlignButtons('center');
    });
    
    document.getElementById('text-editor-align-right').addEventListener('click', function() {
        setTextAlignButtons('right');
    });
}

function applyTextChanges(x, y) {
    const text = document.getElementById('text-editor-content').value.trim();
    if (!text) return;
    
    const textObj = new fabric.Text(text, {
        left: x,
        top: y,
        fontFamily: document.getElementById('text-editor-font').value,
        fontSize: parseInt(document.getElementById('text-editor-size').value),
        fill: document.getElementById('text-editor-color').value,
        fontWeight: document.getElementById('text-editor-bold').classList.contains('active') ? 'bold' : 'normal',
        fontStyle: document.getElementById('text-editor-italic').classList.contains('active') ? 'italic' : 'normal',
        underline: document.getElementById('text-editor-underline').classList.contains('active'),
        textAlign: getTextAlignFromButtons(),
        stroke: appState.colors.textStroke,
        strokeWidth: appState.stroke.textWidth,
        charSpacing: appState.text.charSpacing,
        lineHeight: appState.text.lineHeight,
        shadow: new fabric.Shadow({
            color: appState.colors.shadow,
            blur: appState.text.shadow.blur,
            offsetX: appState.text.shadow.offset,
            offsetY: appState.text.shadow.offset
        })
    });
    
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    updatePropertiesPanel(textObj);
    canvas.renderAll();
}

// Edit Functions

function showToolHint(message) {
    let hint = document.getElementById('tool-hint');
    if (!hint) {
        hint = document.createElement('div');
        hint.id = 'tool-hint';
        hint.className = 'tool-hint';
        document.querySelector('.canvas-container').appendChild(hint);
    }
    hint.textContent = message;
    hint.style.display = 'block';
}

function hideToolHint() {
    const hint = document.getElementById('tool-hint');
    if (hint) hint.style.display = 'none';
}

// En las funciones de dibujo, agrega:
if (appState.keysPressed.shift) {
    showToolHint('Shift: Creando forma perfecta');
} else if (appState.keysPressed.ctrl) {
    showToolHint('Ctrl: Modo especial activado');
} else {
    hideToolHint();
}
