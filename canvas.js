// Variable para el canvas
let canvasInstance = null;

// Función para obtener el canvas
function getCanvas() {
    if (!canvasInstance) {
        throw new Error("Canvas no inicializado. Llama a initCanvas() primero.");
    }
    return canvasInstance;
}

// Inicializar el canvas con manejo de errores
function initCanvas() {
    try {
        // Verificar si el canvas ya está inicializado
        if (canvasInstance) {
            console.warn("Canvas ya fue inicializado - retornando instancia existente");
            return canvasInstance;
        }
        
        // Configuración completa del canvas con opciones profesionales
        canvasInstance = new fabric.Canvas('drawing-canvas', {
            // Configuración básica mejorada
            backgroundColor: appState.document.background,
            selection: true,
            selectionColor: 'rgba(13, 110, 253, 0.3)',
            selectionBorderColor: '#0d6efd',
            selectionLineWidth: 2,
            selectionDashArray: [5, 5],
            
            // Configuración de interacción profesional
            isDrawingMode: false,
            fireRightClick: true,
            stopContextMenu: true,
            hoverCursor: 'move',
            moveCursor: 'grabbing',
            allowTouchScrolling: false,
            
            // Configuración de rendimiento optimizado
            imageSmoothingEnabled: true,
            willReadFrequently: true,
            renderOnAddRemove: false,
            targetFindTolerance: 15,
            perPixelTargetFind: true,
            stateful: true,
            enableRetinaScaling: true,
            
            // Configuración profesional del pincel
            freeDrawingBrush: {
                color: appState.colors.stroke,
                width: appState.stroke.width,
                shadow: new fabric.Shadow({
                    color: 'rgba(0,0,0,0.2)',
                    blur: 5,
                    offsetX: 2,
                    offsetY: 2
                })
            }
        });

        // ================= CONFIGURACIONES PROFESIONALES =================
        
        // 1. Configuración avanzada de renderizado
        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerColor = '#3498db';
        fabric.Object.prototype.cornerSize = 12;
        fabric.Object.prototype.cornerStyle = 'circle';
        fabric.Object.prototype.borderColor = '#3498db';
        fabric.Object.prototype.borderScaleFactor = 2;
        fabric.Object.prototype.strokeUniform = true;
        fabric.Object.prototype.noScaleCache = false;
        
        // 2. Soporte para alta resolución y exportación
        fabric.Object.prototype.objectCaching = true;
        canvasInstance.renderOnRequestAnimationFrame = true;
        canvasInstance.controlsAboveOverlay = true;
        
        // 3. Configuración de eventos profesionales
        canvasInstance.on('mouse:wheel', function(opt) {
            const delta = opt.e.deltaY;
            const zoom = canvasInstance.getZoom();
            const newZoom = delta > 0 ? zoom * 0.9 : zoom * 1.1;
            canvasInstance.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        // 4. Configuración de presión para tabletas gráficas
        if (window.PointerEvent) {
            canvasInstance.on('mouse:down', function(opt) {
                if (opt.e.pressure && appState.currentTool === 'pen') {
                    canvasInstance.freeDrawingBrush.width = opt.e.pressure * appState.stroke.width * 2;
                }
            });
        }

        // 5. Inicialización de plugins profesionales
        if (typeof fabric.PatternBrush !== 'undefined') {
            canvasInstance.freeDrawingBrush = new fabric.PatternBrush(canvasInstance);
        }
        
        // 6. Configuración de snap to grid profesional
        canvasInstance.snapToGrid = appState.view.snapToGrid || false;
        canvasInstance.snapThreshold = appState.view.snapThreshold || 5;
        
        // ================= FIN CONFIGURACIONES PROFESIONALES =================

        // Inicializar componentes
        updateCanvasSize();
        setupCanvasEvents();
        
        // Configuración inicial del pincel de dibujo libre
        if (canvasInstance.freeDrawingBrush) {
            canvasInstance.freeDrawingBrush.color = appState.colors.stroke;
            canvasInstance.freeDrawingBrush.width = appState.stroke.width;
            
            // Configuración profesional del pincel
            if (appState.currentTool === 'pen') {
                canvasInstance.freeDrawingBrush.shadow = new fabric.Shadow({
                    color: 'rgba(0,0,0,0.3)',
                    blur: 10,
                    offsetX: 3,
                    offsetY: 3
                });
            }
        }

        console.log('Canvas profesional inicializado exitosamente');
        return canvasInstance;
        
    } catch (error) {
        console.error('Error crítico al inicializar el canvas profesional:', error);
        
        // Mostrar error profesional al usuario
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger position-fixed top-0 end-0 m-3';
        errorDiv.style.zIndex = '10000';
        errorDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-exclamation-circle me-2 fs-4"></i>
                <div>
                    <h5 class="mb-1">Error en inicialización</h5>
                    <p class="mb-0 small">${error.message}</p>
                </div>
                <button onclick="this.parentElement.remove()" 
                        class="btn-close ms-auto"></button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        // Intentar recuperación básica
        try {
            canvasInstance = new fabric.Canvas('drawing-canvas', {
                backgroundColor: '#ffffff',
                selection: true
            });
            return canvasInstance;
        } catch (recoveryError) {
            throw new Error(`Fallo en initCanvas: ${error.message}. Recuperación fallida: ${recoveryError.message}`);
        }
    }
}


// Actualizar tamaño del canvas con conversión de unidades
function updateCanvasSize() {
    const canvas = getCanvas();
    try {
        const ppi = appState.document.resolution;
        const mmToInch = 1 / 25.4;
        const widthInch = appState.document.width * mmToInch;
        const heightInch = appState.document.height * mmToInch;
        
        const widthPx = Math.round(widthInch * ppi);
        const heightPx = Math.round(heightInch * ppi);
        
        canvas.setDimensions({ width: widthPx, height: heightPx });
        
        // Verificar si existe el elemento antes de modificar
        const pageContainer = document.querySelector('.page-container');
        if (pageContainer) {
            pageContainer.style.width = `${widthPx}px`;
            pageContainer.style.height = `${heightPx}px`;
        }
        
        document.getElementById('document-size').textContent = 
            `${appState.document.width} × ${appState.document.height} ${appState.document.units}`;
    } catch (error) {
        console.error('Error actualizando tamaño del canvas:', error);
        throw error;
    }
}

// Configurar eventos del canvas con throttling
function setupCanvasEvents() {
    const canvas = getCanvas();
    if (!canvas) return;
    try {
        // Limpiar solo los eventos globales que podrían interferir
        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');
        canvas.off('mouse:dblclick');

        // 1. Evento de movimiento global (para todas las herramientas)
        canvas.on('mouse:move', throttle(function(options) {
            const pointer = canvas.getPointer(options.e);
            updateCursorPosition(pointer.x, pointer.y);
            
            // Solo actualizar formas si estamos en modo de dibujo
            if (appState.currentTool !== 'text' && appState.currentTool !== 'select') {
                if (appState.isDrawing && appState.currentShape) {
                    updateShapeDrawing(pointer.x, pointer.y);
                }
                if (appState.isDrawingPolygon && appState.currentShape) {
                    updatePolygonDrawing(pointer.x, pointer.y);
                }
            }
        }, 16));

        // 2. Evento de clic global (para todas las herramientas)
        canvas.on('mouse:down', function(options) {
            // Manejar según la herramienta activa
            switch(appState.currentTool) {
                case 'text':
                    handleTextToolClick(options);
                    break;
                    
                case 'select':
                    // Permitir que Fabric.js maneje la selección normalmente
                    break;
                    
                case 'pen':
                case 'freehand':
                    // El dibujo libre se maneja automáticamente con isDrawingMode
                    break;
                    
                default:
                    // Para formas (rectángulo, elipse, triángulo, línea, polígono)
                    if (!options.target) {
                        handleShapeToolClick(options);
                    }
            }
        });

        // 3. Evento de liberación del ratón (para formas)
        canvas.on('mouse:up', function() {
            if (appState.isDrawing && appState.currentShape && 
                ['rectangle', 'ellipse', 'triangle', 'line'].includes(appState.currentTool)) {
                finishShapeDrawing();
            }
        });

        // 4. Evento de doble clic (para polígonos y texto)
        canvas.on('mouse:dblclick', function(options) {
            // Finalizar polígono
            if (appState.currentTool === 'polygon' && appState.isDrawingPolygon) {
                if (appState.polygonPoints.length >= 3) {
                    finishPolygonDrawing();
                } else {
                    cleanUpDrawingState();
                }
                return;
            }
            
            // Editar texto existente
            const target = options.target;
            if (target && (target.type === 'text' || target.type === 'i-text')) {
                target.enterEditing();
                target.selectAll();
            }
        });

        // 5. Eventos de selección
        canvas.on('selection:created', function(options) {
            if (options.selected && options.selected.length > 0) {
                handleSelectionCreated(options);
            }
        });
        
        canvas.on('selection:updated', function(options) {
            if (options.selected && options.selected.length > 0) {
                handleSelectionUpdated(options);
            }
        });
        
        canvas.on('selection:cleared', function() {
            handleSelectionCleared();
        });
        
        // 6. Eventos de modificación de objetos
        canvas.on('object:modified', function(options) {
            handleObjectModified(options);
        });
        
        canvas.on('object:added', function(options) {
            handleObjectAdded(options);
        });
        
        // 7. Evento para prevenir menú contextual con botón derecho
        canvas.on('mouse:down:before', function(options) {
            if (options.e.button === 3) {
                options.e.preventDefault();
            }
        });

    } catch (error) {
        console.error('Error configurando eventos:', error);
    }
}

// Funciones auxiliares necesarias
function handleTextToolClick(options) {
    const pointer = canvas.getPointer(options.e);
    
    // Si hay un objeto de texto, editarlo
    if (options.target && (options.target.type === 'text' || options.target.type === 'i-text')) {
        options.target.enterEditing();
        options.target.selectAll();
        return;
    }
    
    // Crear nuevo texto
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
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
}

function handleShapeToolClick(options) {
    const pointer = canvas.getPointer(options.e);
    appState.startX = pointer.x;
    appState.startY = pointer.y;
    
    switch(appState.currentTool) {
        case 'rectangle':
        case 'ellipse':
        case 'triangle':
        case 'line':
            appState.isDrawing = true;
            createShape(pointer.x, pointer.y);
            break;
            
        case 'polygon':
            if (!appState.isDrawingPolygon) {
                appState.isDrawingPolygon = true;
                appState.polygonPoints = [{ x: pointer.x, y: pointer.y }];
                createShape(pointer.x, pointer.y);
            } else {
                appState.polygonPoints.push({ x: pointer.x, y: pointer.y });
                updatePolygonDrawing(pointer.x, pointer.y);
            }
            break;
    }
}

// Función throttle para mejorar rendimiento
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// Manejadores de eventos
function handleMouseDown(options) {
    const canvas = getCanvas();
    if (options.target) return; // Si hay un objeto, permitir selección
    
    const pointer = canvas.getPointer(options.e);
    appState.startX = pointer.x;
    appState.startY = pointer.y;
    
    switch(appState.currentTool) {
        case 'rectangle':
        case 'ellipse':
        case 'triangle':
        case 'line':
            appState.isDrawing = true;
            createShape(pointer.x, pointer.y);
            break;
            
        case 'polygon':
            if (!appState.isDrawingPolygon) {
                appState.isDrawingPolygon = true;
                appState.polygonPoints = [{ x: pointer.x, y: pointer.y }];
                createShape(pointer.x, pointer.y);
            } else {
                appState.polygonPoints.push({ x: pointer.x, y: pointer.y });
                updatePolygonDrawing(pointer.x, pointer.y);
            }
            break;
    }
}

function createShape(x, y) {
    const canvas = getCanvas();
    if (appState.currentShape) {
        canvas.remove(appState.currentShape);
    }

    const commonProps = {
        fill: appState.colors.fill,
        stroke: appState.colors.stroke,
        strokeWidth: appState.stroke.width,
        selectable: false,
        strokeDashArray: appState.stroke.style === 'dashed' ? [5, 5] : 
                       appState.stroke.style === 'dotted' ? [1, 3] : null
    };

    let newShape;
    switch(appState.currentTool) {
        case 'rectangle':
            newShape = new fabric.Rect({
                left: x,
                top: y,
                width: 0,
                height: 0,
                ...commonProps
            });
            break;
            
        case 'ellipse':
            newShape = new fabric.Ellipse({
                left: x,
                top: y,
                rx: 0,
                ry: 0,
                ...commonProps
            });
            break;
            
        case 'triangle':
            newShape = new fabric.Triangle({
                left: x,
                top: y,
                width: 0,
                height: 0,
                ...commonProps
            });
            break;
            
        case 'line':
            newShape = new fabric.Line([x, y, x, y], {
                stroke: appState.colors.stroke,
                strokeWidth: appState.stroke.width,
                selectable: false
            });
            break;
            
        case 'polygon':
            newShape = new fabric.Polygon([...appState.polygonPoints, { x, y }], {
                fill: appState.colors.fill,
                stroke: appState.colors.stroke,
                strokeWidth: appState.stroke.width,
                strokeDashArray: appState.stroke.style === 'dashed' ? [5, 5] : 
                               appState.stroke.style === 'dotted' ? [1, 3] : null,
                selectable: false,
                hasControls: false,
                hasBorders: false,
                evented: true,
                objectCaching: false,
                perPixelTargetFind: true,
                targetFindTolerance: 15,
                transparentCorners: false,
                cornerColor: 'rgba(25, 118, 210, 0.8)',
                cornerSize: 12
            });
            break;
    }

    if (newShape) {
        appState.currentShape = newShape;
        canvas.add(newShape);
        canvas.renderAll();
    }
}

function createPolygonShape(x, y) {
    if (appState.currentShape) {
        canvas.remove(appState.currentShape);
    }

    const points = [...appState.polygonPoints, { x, y }];
    
    const polygon = new fabric.Polygon(points, {
        fill: appState.colors.fill,
        stroke: appState.colors.stroke,
        strokeWidth: appState.stroke.width,
        strokeDashArray: getStrokeDashArray(appState.stroke.style),
        selectable: false, // Temporalmente no seleccionable
        hasControls: false,
        hasBorders: false,
        objectCaching: false,
        perPixelTargetFind: true,
        transparentCorners: false
    });

    appState.currentShape = polygon;
    canvas.add(polygon);
    canvas.renderAll();

    // Si Ctrl está presionado, hacer polígono regular
    if (appState.keysPressed.ctrl && appState.polygonPoints.length >= 2) {
        const center = {
            x: appState.polygonPoints[0].x,
            y: appState.polygonPoints[0].y
        };
        const radius = Math.sqrt(
            Math.pow(x - center.x, 2) + 
            Math.pow(y - center.y, 2)
        );
        
        const sides = appState.polygonPoints.length + 1;
        const angleStep = (Math.PI * 2) / sides;
        
        const regularPoints = [];
        for (let i = 0; i < sides; i++) {
            regularPoints.push({
                x: center.x + Math.cos(angleStep * i) * radius,
                y: center.y + Math.sin(angleStep * i) * radius
            });
        }
        
        appState.currentShape.set({ points: regularPoints });
    }
}


function handleDoubleClick(options) {
    const canvas = getCanvas();
    // Si estamos dibujando un polígono, terminarlo
    if (appState.currentTool === 'polygon' && appState.isDrawingPolygon) {
        finishPolygonDrawing();
        return;
    }
    
    // Si no estamos dibujando, verificar si hay texto para editar
    if (!appState.isDrawing) {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            editTextObject(activeObject);
            return;
        }
    }
    
    // Para otras herramientas (triángulo, rectángulo, etc.), terminar el dibujo
    if (appState.isDrawing && appState.currentShape) {
        finishShapeDrawing();
    }
}

function finishPolygonDrawing() {
    if (!appState.currentShape || appState.polygonPoints.length < 3) return;

    // Crear polígono final con propiedades completas
    const finalPolygon = new fabric.Polygon(appState.polygonPoints, {
        fill: appState.colors.fill,
        stroke: appState.colors.stroke,
        strokeWidth: appState.stroke.width,
        strokeDashArray: getStrokeDashArray(appState.stroke.style),
        selectable: true, // Ahora es seleccionable
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        objectCaching: true,
        perPixelTargetFind: true
    });

    // Reemplazar la forma temporal
    canvas.remove(appState.currentShape);
    canvas.add(finalPolygon);
    canvas.setActiveObject(finalPolygon);
    
    // Limpiar estado
    cleanUpDrawingState();
    canvas.renderAll();
    saveToHistory();
}

function handleMouseMove(options) {
    if (!appState.isDrawing && !appState.isDrawingPolygon) return;
    
    const canvas = getCanvas();
    const pointer = canvas.getPointer(options.e);
    updateCursorPosition(pointer.x, pointer.y);
    
    if (appState.isDrawing && appState.currentShape) {
        updateShapeDrawing(pointer.x, pointer.y);
    }
}

function handleMouseUp(options) {
    if (appState.currentTool === 'polygon') return; // Polígono se maneja con doble clic
    
    if (appState.isDrawing && appState.currentShape) {
        finishShapeDrawing();
    }
}

function finishShapeDrawing() {
    const canvas = getCanvas();
    if (!appState.currentShape || !canvas.contains(appState.currentShape)) return;

    try {
        // Habilitar controles para todas las formas
        appState.currentShape.set({
            selectable: true,
            hasControls: true,
            hasBorders: true,
            lockMovementX: false,
            lockMovementY: false,
            evented: true
        });
        
        canvas.setActiveObject(appState.currentShape);
        updatePropertiesPanel(appState.currentShape);
        canvas.renderAll();
    } catch (error) {
        console.error('Error finalizando forma:', error);
    } finally {
        appState.isDrawing = false;
        appState.currentShape = null;
    }
}

function handleSelectionCreated(options) {
    updatePropertiesPanel(options.selected[0]);
}

function handleSelectionUpdated(options) {
    updatePropertiesPanel(options.selected[0]);
}

function handleSelectionCleared() {
    clearPropertiesPanel();
}

function handleObjectModified() {
    const canvas = getCanvas();
    saveToHistory();
    updatePropertiesPanel(canvas.getActiveObject());
}

function handleObjectAdded() {
    saveToHistory();
}

// Actualizaciones de dibujo de formas
function updateShapeDrawing(x, y) {
    if (!appState.currentShape) return;
    
    const minSize = 5; // Tamaño mínimo para la forma
    
    switch(appState.currentTool) {
        case 'rectangle':
            appState.currentShape.set({
                width: Math.max(minSize, Math.abs(x - appState.startX)),
                height: Math.max(minSize, Math.abs(y - appState.startY)),
                left: x < appState.startX ? x : appState.startX,
                top: y < appState.startY ? y : appState.startY
            });
            break;
            
        case 'ellipse':
            appState.currentShape.set({
                rx: Math.max(minSize/2, Math.abs(x - appState.startX)/2),
                ry: Math.max(minSize/2, Math.abs(y - appState.startY)/2),
                left: appState.startX,
                top: appState.startY
            });
            break;
            
        case 'triangle':
            appState.currentShape.set({
                width: Math.max(minSize, Math.abs(x - appState.startX)),
                height: Math.max(minSize, Math.abs(y - appState.startY)),
                left: x < appState.startX ? x : appState.startX,
                top: y < appState.startY ? y : appState.startY
            });
            break;
            
        case 'line':
            appState.currentShape.set({
                x2: x,
                y2: y
            });
            break;
            
        case 'polygon':
            if (appState.polygonPoints.length > 0) {
                const points = [...appState.polygonPoints, { x, y }];
                appState.currentShape.set({ points });
            }
            break;
    }
    
    getCanvas().renderAll();
}

function updateRectangleDrawing(x, y) {
    let width = x - appState.startX;
    let height = y - appState.startY;

    // Si Shift está presionado, hacer cuadrado perfecto
    if (appState.keysPressed.shift) {
        const maxSize = Math.max(Math.abs(width), Math.abs(height));
        width = width < 0 ? -maxSize : maxSize;
        height = height < 0 ? -maxSize : maxSize;
    }

    appState.currentShape.set({
        width: Math.abs(width),
        height: Math.abs(height),
        left: width > 0 ? appState.startX : x,
        top: height > 0 ? appState.startY : y
    });
}

function updateEllipseDrawing(x, y) {
    let rx = Math.abs(x - appState.startX) / 2;
    let ry = Math.abs(y - appState.startY) / 2;

    // Si Shift está presionado, hacer círculo perfecto
    if (appState.keysPressed.shift) {
        const maxSize = Math.max(rx, ry);
        rx = maxSize;
        ry = maxSize;
    }

    appState.currentShape.set({
        rx: rx,
        ry: ry,
        left: appState.startX,
        top: appState.startY
    });
}

function updateLineDrawing(x, y) {
    let x2 = x;
    let y2 = y;

    // Si Shift está presionado, restringir a 45°
    if (appState.keysPressed.shift) {
        const dx = x - appState.startX;
        const dy = y - appState.startY;
        const angle = Math.atan2(dy, dx);
        const snappedAngle = Math.round(angle / (Math.PI/4)) * (Math.PI/4);
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        x2 = appState.startX + Math.cos(snappedAngle) * distance;
        y2 = appState.startY + Math.sin(snappedAngle) * distance;
    }

    appState.currentShape.set({
        x2: x2,
        y2: y2
    });
}

function updateTriangleDrawing(x, y) {
    const triWidth = x - appState.startX;
    const triHeight = y - appState.startY;
    
    appState.currentShape.set({
        width: Math.abs(triWidth),
        height: Math.abs(triHeight),
        left: triWidth > 0 ? appState.startX : x,
        top: triHeight > 0 ? appState.startY : y
    });
}

function updatePolygonDrawing(x, y) {
    if (!appState.currentShape || appState.polygonPoints.length === 0) return;
    
    const points = [...appState.polygonPoints, { x, y }];
    appState.currentShape.set({ points });
    getCanvas().renderAll();
}

function updateCursorPosition(x, y) {
    document.getElementById('cursor-position').textContent = 
        `${Math.round(x)}, ${Math.round(y)}`;
}

function editTextObject(textObj) {
    // Mostrar el modal de edición de texto
    const modal = new bootstrap.Modal(document.getElementById('text-editor-modal'));
    
    // Configurar el editor con el texto actual
    document.getElementById('text-editor-content').value = textObj.text;
    document.getElementById('text-editor-font').value = textObj.fontFamily;
    document.getElementById('text-editor-size').value = textObj.fontSize;
    document.getElementById('text-editor-color').value = textObj.fill;
    
    // Configurar estilos
    document.getElementById('text-editor-bold').classList.toggle('active', textObj.fontWeight === 'bold');
    document.getElementById('text-editor-italic').classList.toggle('active', textObj.fontStyle === 'italic');
    document.getElementById('text-editor-underline').classList.toggle('active', textObj.underline);
    
    // Configurar alineación
    setTextAlignButtons(textObj.textAlign || 'left');
    
    // Manejar la aplicación de cambios
    document.getElementById('apply-text-editor').onclick = function() {
        applyTextChangesToObject(textObj);
        modal.hide();
    };
    
    modal.show();
}

function applyTextChangesToObject(textObj) {
    const text = document.getElementById('text-editor-content').value.trim();
    if (!text) return;
    
    textObj.set({
        text: text,
        fontFamily: document.getElementById('text-editor-font').value,
        fontSize: parseInt(document.getElementById('text-editor-size').value),
        fill: document.getElementById('text-editor-color').value,
        fontWeight: document.getElementById('text-editor-bold').classList.contains('active') ? 'bold' : 'normal',
        fontStyle: document.getElementById('text-editor-italic').classList.contains('active') ? 'italic' : 'normal',
        underline: document.getElementById('text-editor-underline').classList.contains('active'),
        textAlign: getTextAlignFromButtons(),
        dirty: true
    });
    
    getCanvas().renderAll();
}

function cleanUpDrawingState() {
    const canvas = getCanvas();
    // No limpiar si estamos en medio de un dibujo
    if (appState.isDrawing || appState.isDrawingPolygon) {
        return;
    }
    
    // Limpiar solo si hay una forma temporal que no fue finalizada
    if (appState.currentShape && 
        canvas.contains(appState.currentShape) && 
        !appState.currentShape.selectable) {
        canvas.remove(appState.currentShape);
    }
    
    // Resetear el estado de dibujo
    appState.isDrawing = false;
    appState.isDrawingPolygon = false;
    appState.currentShape = null;
    appState.polygonPoints = [];
}

function debugSelection() {
    const canvas = getCanvas();
    canvas.on('selection:created', function() {
        console.log('Objeto seleccionado:', canvas.getActiveObject());
    });
    canvas.on('selection:cleared', function() {
        console.log('Selección limpiada');
    });
    canvas.on('mouse:down', function(options) {
        if (options.target) {
            console.log('Objeto seleccionado:', options.target);
            console.log('Tipo:', options.target.type);
            console.log('Puntos:', options.target.points);
            console.log('Coordenadas:', options.target.getCoords());
        }
    });
}

function fixStuckObjects() {
    const canvas = getCanvas();
    canvas.forEachObject(function(obj) {
        if ((obj.lockMovementX && obj.lockMovementY) || !obj.selectable) {
            obj.set({
                lockMovementX: false,
                lockMovementY: false,
                selectable: true,
                hasControls: true,
                hasBorders: true,
                evented: true
            });
        }
    });
    canvas.renderAll();
}

// Llamar al inicio para debug
//debugSelection();

// Llamar esta función periódicamente para reparar objetos
//setInterval(fixStuckObjects, 5000);

// Exportar solo lo necesario al ámbito global
const CanvasUtils = {
    getCanvas,
    initCanvas,
    updateCanvasSize,
    setupCanvasEvents,
    cleanUpDrawingState,
    updateCursorPosition,
    debugSelection,
    fixStuckObjects
};

// Hacerlo disponible globalmente
window.CanvasUtils = CanvasUtils;

// Agrega estas funciones al final de canvas.js, dentro del objeto CanvasUtils

function setupPanEvents() {
    const canvas = getCanvas();
    const wrapper = document.querySelector('.canvas-wrapper');
    
    // Evento para iniciar el paneo
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !appState.isPanning) {
            appState.isPanning = true;
            document.body.style.cursor = 'grab';
        }
    });
    
    // Evento para detener el paneo
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space' && appState.isPanning) {
            appState.isPanning = false;
            document.body.style.cursor = '';
        }
    });
    
    // Evento de mouse para mover el canvas
    wrapper.addEventListener('mousedown', (e) => {
        if (appState.isPanning && e.button === 0) { // Solo botón izquierdo
            appState.panStartX = e.clientX - appState.canvasOffsetX;
            appState.panStartY = e.clientY - appState.canvasOffsetY;
            document.body.style.cursor = 'grabbing';
            
            const moveHandler = (moveEvent) => {
                if (appState.isPanning) {
                    const dx = moveEvent.clientX - appState.panStartX;
                    const dy = moveEvent.clientY - appState.panStartY;
                    
                    appState.canvasOffsetX = dx;
                    appState.canvasOffsetY = dy;
                    
                    wrapper.style.transform = `translate(${dx}px, ${dy}px) scale(${appState.view.zoom / 100})`;
                }
            };
            
            const upHandler = () => {
                document.body.style.cursor = 'grab';
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('mouseup', upHandler);
            };
            
            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', upHandler);
        }
    });
    
    // Resetear el paneo cuando se cambia de herramienta
    canvas.on('before:selection:cleared', () => {
        if (appState.isPanning) {
            appState.isPanning = false;
            document.body.style.cursor = '';
        }
    });
}

// Agrega esta línea al final del objeto CanvasUtils
CanvasUtils.setupPanEvents = setupPanEvents;

CanvasUtils.initProfessionalTools = function(canvas) {
    ProfessionalTools.initAdvancedTools(canvas);
};

// Añade al final del archivo, antes de las exportaciones
const ProfessionalCanvasExtensions = {
    enableAdvancedRendering: function() {
        // Mejoras en el renderizado
        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerColor = '#3498db';
        fabric.Object.prototype.cornerSize = 12;
        fabric.Object.prototype.cornerStyle = 'circle';
        fabric.Object.prototype.borderColor = '#3498db';
        fabric.Object.prototype.borderScaleFactor = 2;
        
        // Soporte para alta resolución
        fabric.Object.prototype.strokeUniform = true;
        fabric.Object.prototype.noScaleCache = false;
    },
    
    setupAdvancedEvents: function() {
        // Eventos para zoom con rueda del ratón
        canvas.on('mouse:wheel', function(opt) {
            const delta = opt.e.deltaY;
            const zoom = canvas.getZoom();
            const newZoom = delta > 0 ? zoom * 0.9 : zoom * 1.1;
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });
        
        // Eventos para paneo con espacio
        let isSpaceDown = false;
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') isSpaceDown = true;
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') isSpaceDown = false;
        });
        
        let lastX, lastY;
        canvas.on('mouse:down', (opt) => {
            if (isSpaceDown) {
                lastX = opt.e.clientX;
                lastY = opt.e.clientY;
                canvas.defaultCursor = 'grabbing';
                canvas.renderAll();
            }
        });
        
        canvas.on('mouse:move', (opt) => {
            if (isSpaceDown && lastX && lastY) {
                const deltaX = opt.e.clientX - lastX;
                const deltaY = opt.e.clientY - lastY;
                canvas.relativePan({ x: deltaX, y: deltaY });
                lastX = opt.e.clientX;
                lastY = opt.e.clientY;
            }
        });
    }
};

// Integra las extensiones en CanvasUtils
Object.assign(CanvasUtils, ProfessionalCanvasExtensions);