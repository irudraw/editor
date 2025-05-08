const ProfessionalPropertyHandlers = {
    initAdvancedProperties: function(obj) {
        // Rellenos avanzados
        this.setupFillControls(obj);
        
        // Efectos de sombra
        this.setupShadowControls(obj);
        
        // Transformaciones avanzadas
        // this.setupAdvancedTransformControls(obj);
    },
    
    setupFillControls: function(obj) {
        const fillTypeSelect = document.getElementById('fill-type');
        if (!fillTypeSelect) return;
        
        fillTypeSelect.addEventListener('change', (e) => {
            const type = e.target.value;
            document.getElementById('solid-fill-container').style.display = 
                type === 'solid' ? 'block' : 'none';
            document.getElementById('gradient-fill-container').style.display = 
                type === 'gradient' ? 'block' : 'none';
            
            if (type === 'gradient') {
                this.applyGradientFill(obj);
            }
        });
    },
    
    applyGradientFill: function(obj) {
        // Implementación de degradados
        if (!obj.setGradient) return;
        
        const color1 = document.getElementById('gradient-color-1').value;
        const color2 = document.getElementById('gradient-color-2').value;
        const angle = document.getElementById('gradient-angle').value;
        
        obj.setGradient('fill', {
            type: 'linear',
            x1: 0,
            y1: 0,
            x2: Math.cos(angle * Math.PI / 180),
            y2: Math.sin(angle * Math.PI / 180),
            colorStops: {
                0: color1,
                1: color2
            }
        });
        canvas.renderAll();
    },
    
    setupShadowControls: function(obj) {
        const shadowEnabled = document.getElementById('shadow-enabled');
        if (!shadowEnabled) return;
        
        shadowEnabled.addEventListener('change', (e) => {
            if (e.target.checked) {
                const color = document.getElementById('shadow-color').value;
                const opacity = document.getElementById('shadow-opacity').value / 100;
                const blur = document.getElementById('shadow-blur').value;
                const offsetX = document.getElementById('shadow-offset-x').value;
                const offsetY = document.getElementById('shadow-offset-y').value;
                
                obj.setShadow({
                    color: color,
                    opacity: opacity,
                    blur: parseInt(blur),
                    offsetX: parseInt(offsetX),
                    offsetY: parseInt(offsetY)
                });
            } else {
                obj.setShadow(null);
            }
            canvas.renderAll();
        });
    }
};

// Property Panel - Mejorado con validación y organización
function updatePropertiesPanel(obj) {
    if (!obj || !obj.type) {
        clearPropertiesPanel();
        return;
    }
    
    try {
        updateGeneralProperties(obj);
        
        switch(obj.type) {
            case 'text':
            case 'i-text':
                updateTextProperties(obj);
                break;
            case 'rect':
            case 'ellipse':
            case 'triangle':
            case 'polygon':
            case 'line':
                updateShapeProperties(obj);
                break;
            case 'image':
                updateImageProperties(obj);
                break;
            default:
                hideAllPropertyPanels();
        }
        
        if (canHaveBorder(obj.type)) {
            updateBorderProperties(obj);
        }
        
        // Configurar eventos para actualización en tiempo real
        setupPropertyChangeListeners(obj);
        // Inicializar propiedades avanzadas
        ProfessionalPropertyHandlers.initAdvancedProperties(obj);
        
    } catch (error) {
        console.error('Error updating properties panel:', error);
    }
}

function canHaveBorder(type) {
    return ['rect', 'ellipse', 'triangle', 'polygon', 'line', 'text', 'i-text'].includes(type);
}

function updateGeneralProperties(obj) {
    // Actualizar posición
    document.getElementById('transform-x').value = Math.round(obj.left);
    document.getElementById('transform-y').value = Math.round(obj.top);
    
    // Actualizar tamaño considerando escala
    if (obj.width && obj.height) {
        document.getElementById('transform-width').value = Math.round(obj.width * (obj.scaleX || 1));
        document.getElementById('transform-height').value = Math.round(obj.height * (obj.scaleY || 1));
    } else if (obj.rx && obj.ry) {
        // Para elipses
        document.getElementById('transform-width').value = Math.round(obj.rx * 2);
        document.getElementById('transform-height').value = Math.round(obj.ry * 2);
    }
    
    // Actualizar rotación
    document.getElementById('transform-rotation').value = Math.round(obj.angle || 0);
    document.getElementById('rotation-value').textContent = `${Math.round(obj.angle || 0)}°`;
    
    // Actualizar opacidad
    document.getElementById('transform-opacity').value = Math.round((obj.opacity || 1) * 100);
    document.getElementById('opacity-value').textContent = `${Math.round((obj.opacity || 1) * 100)}%`;
    
    // Actualizar nombre del objeto seleccionado
    document.getElementById('selected-object').textContent = obj.type ? 
        obj.type.charAt(0).toUpperCase() + obj.type.slice(1) : 'Objeto';
}

function updateTextProperties(obj) {
    document.getElementById('text-properties').style.display = 'block';
    document.getElementById('shape-properties').style.display = 'none';
    document.getElementById('border-properties').style.display = 'block';
    document.getElementById('image-properties').style.display = 'none';
    
    // Actualizar propiedades de texto
    document.getElementById('text-font-family').value = obj.fontFamily || 'Arial';
    document.getElementById('text-font-size').value = obj.fontSize || 24;
    document.getElementById('text-fill-color').value = obj.fill || '#000000';
    document.getElementById('text-char-spacing').value = obj.charSpacing || 0;
    document.getElementById('text-line-height').value = obj.lineHeight || 1.1;
    
    // Actualizar estilos de texto
    document.getElementById('text-bold').classList.toggle('active', obj.fontWeight === 'bold');
    document.getElementById('text-italic').classList.toggle('active', obj.fontStyle === 'italic');
    document.getElementById('text-underline').classList.toggle('active', obj.underline);
    
    // Actualizar alineación
    document.getElementById('text-align-left').classList.remove('active');
    document.getElementById('text-align-center').classList.remove('active');
    document.getElementById('text-align-right').classList.remove('active');
    document.getElementById(`text-align-${obj.textAlign || 'left'}`).classList.add('active');
}

function updateShapeProperties(obj) {
    document.getElementById('text-properties').style.display = 'none';
    document.getElementById('shape-properties').style.display = 'block';
    document.getElementById('border-properties').style.display = 'block';
    document.getElementById('image-properties').style.display = 'none';
    
    // Actualizar radio de esquinas para rectángulos
    if (obj.type === 'rect') {
        document.getElementById('shape-rx').value = obj.rx || 0;
        document.getElementById('shape-rx').disabled = false;
    } else {
        document.getElementById('shape-rx').value = 0;
        document.getElementById('shape-rx').disabled = true;
    }
}

function updateImageProperties(obj) {
    document.getElementById('text-properties').style.display = 'none';
    document.getElementById('shape-properties').style.display = 'none';
    document.getElementById('border-properties').style.display = 'none';
    document.getElementById('image-properties').style.display = 'block';
    
    document.getElementById('image-filter').value = obj.filter || 'none';
    document.getElementById('image-opacity').value = Math.round((obj.opacity || 1) * 100);
}

function updateBorderProperties(obj) {
    document.getElementById('border-properties').style.display = 'block';
    
    // Configurar tipo de borde basado en el objeto
    if (obj.type === 'text' || obj.type === 'i-text') {
        document.getElementById('border-type').value = obj.borderType || 'outline';
        document.getElementById('corner-radius-container').style.display = obj.borderType === 'box' ? 'block' : 'none';
    } else {
        document.getElementById('border-type').value = 'box';
        document.getElementById('corner-radius-container').style.display = 'block';
    }
    
    // Actualizar controles de borde
    document.getElementById('border-color').value = obj.stroke || '#000000';
    document.getElementById('border-width').value = obj.strokeWidth || 1;
    
    // Estilo de borde
    if (obj.strokeDashArray) {
        if (obj.strokeDashArray[0] === 5 && obj.strokeDashArray[1] === 5) {
            document.getElementById('border-style').value = 'dashed';
        } else if (obj.strokeDashArray[0] === 1 && obj.strokeDashArray[1] === 3) {
            document.getElementById('border-style').value = 'dotted';
        } else {
            document.getElementById('border-style').value = 'custom';
        }
    } else {
        document.getElementById('border-style').value = 'solid';
    }
    
    updateBorderPreview();
    
    // Radio de esquinas
    if (obj.rx || obj.borderRadius) {
        document.getElementById('corner-radius').value = obj.rx || obj.borderRadius || 0;
    } else {
        document.getElementById('corner-radius').value = 0;
    }
    
    // Posición del borde
    document.getElementById('border-position').value = obj.strokePosition || 'center';
    
    // Opacidad del borde
    const borderOpacity = obj.strokeOpacity !== undefined ? obj.strokeOpacity * 100 : 100;
    document.getElementById('border-opacity').value = borderOpacity;
    document.getElementById('border-opacity-value').textContent = `${borderOpacity}%`;
    
    // Efectos de sombra
    if (obj.shadow) {
        document.getElementById('border-shadow').checked = true;
        document.getElementById('shadow-settings').style.display = 'flex';
        document.getElementById('shadow-color').value = obj.shadow.color || '#000000';
        document.getElementById('shadow-offset').value = obj.shadow.offsetX || 2;
        document.getElementById('shadow-blur').value = obj.shadow.blur || 3;
    } else {
        document.getElementById('border-shadow').checked = false;
        document.getElementById('shadow-settings').style.display = 'none';
    }
    
    // Opciones avanzadas
    document.getElementById('border-behind-fill').checked = obj.strokeBehindFill || false;
    document.getElementById('scale-with-object').checked = obj.strokeScaleWithObject !== false;
}

function updateBorderPreview() {
    const style = document.getElementById('border-style').value;
    const preview = document.getElementById('border-preview');
    
    preview.className = 'border-style-preview mt-2';
    
    switch(style) {
        case 'solid':
            preview.style.borderBottom = '2px solid #000';
            break;
        case 'dashed':
            preview.style.borderBottom = '2px dashed #000';
            break;
        case 'dotted':
            preview.style.borderBottom = '2px dotted #000';
            break;
        case 'double':
            preview.style.borderBottom = '4px double #000';
            break;
        case 'groove':
            preview.style.borderBottom = '4px groove #000';
            break;
        case 'ridge':
            preview.style.borderBottom = '4px ridge #000';
            break;
        case 'inset':
            preview.style.borderBottom = '4px inset #000';
            break;
        case 'outset':
            preview.style.borderBottom = '4px outset #000';
            break;
    }
}

function hideAllPropertyPanels() {
    document.getElementById('text-properties').style.display = 'none';
    document.getElementById('shape-properties').style.display = 'none';
    document.getElementById('border-properties').style.display = 'none';
    document.getElementById('image-properties').style.display = 'none';
}

function clearPropertiesPanel() {
    document.getElementById('transform-x').value = '';
    document.getElementById('transform-y').value = '';
    document.getElementById('transform-width').value = '';
    document.getElementById('transform-height').value = '';
    document.getElementById('transform-rotation').value = '0';
    document.getElementById('rotation-value').textContent = '0°';
    document.getElementById('transform-opacity').value = '100';
    document.getElementById('opacity-value').textContent = '100%';
    document.getElementById('selected-object').textContent = 'Ninguno';
    
    hideAllPropertyPanels();
}

function updateTextAlign(align) {
    const activeObj = canvas.getActiveObject();
    if (activeObj && (activeObj.type === 'text' || activeObj.type === 'i-text')) {
        activeObj.set('textAlign', align);
        canvas.renderAll();
        
        // Actualizar botones
        document.getElementById('text-align-left').classList.remove('active');
        document.getElementById('text-align-center').classList.remove('active');
        document.getElementById('text-align-right').classList.remove('active');
        document.getElementById(`text-align-${align}`).classList.add('active');
    }
}

function setTextAlignButtons(align) {
    document.getElementById('text-editor-align-left').classList.remove('active');
    document.getElementById('text-editor-align-center').classList.remove('active');
    document.getElementById('text-editor-align-right').classList.remove('active');
    
    document.getElementById(`text-editor-align-${align}`).classList.add('active');
}

function getTextAlignFromButtons() {
    if (document.getElementById('text-editor-align-left').classList.contains('active')) return 'left';
    if (document.getElementById('text-editor-align-center').classList.contains('active')) return 'center';
    if (document.getElementById('text-editor-align-right').classList.contains('active')) return 'right';
    return 'left';
}

function setupPropertyChangeListeners(obj) {
    const canvas = CanvasUtils.getCanvas();
    
    // Transformación
    document.getElementById('transform-x').addEventListener('change', (e) => {
        obj.set('left', parseInt(e.target.value));
        canvas.renderAll();
    });
    
    document.getElementById('transform-y').addEventListener('change', (e) => {
        obj.set('top', parseInt(e.target.value));
        canvas.renderAll();
    });
    
    document.getElementById('transform-width').addEventListener('change', (e) => {
        const newWidth = parseInt(e.target.value);
        if (obj.type === 'ellipse') {
            obj.set('rx', newWidth / 2);
        } else {
            obj.set('scaleX', newWidth / obj.width);
        }
        canvas.renderAll();
    });
    
    document.getElementById('transform-height').addEventListener('change', (e) => {
        const newHeight = parseInt(e.target.value);
        if (obj.type === 'ellipse') {
            obj.set('ry', newHeight / 2);
        } else {
            obj.set('scaleY', newHeight / obj.height);
        }
        canvas.renderAll();
    });
    
    document.getElementById('transform-rotation').addEventListener('input', (e) => {
        obj.set('angle', parseInt(e.target.value));
        document.getElementById('rotation-value').textContent = `${e.target.value}°`;
        canvas.renderAll();
    });
    
    document.getElementById('transform-opacity').addEventListener('input', (e) => {
        obj.set('opacity', parseInt(e.target.value) / 100);
        document.getElementById('opacity-value').textContent = `${e.target.value}%`;
        canvas.renderAll();
    });
    
    // Propiedades de texto
    if (obj.type === 'text' || obj.type === 'i-text') {
        document.getElementById('text-font-family').addEventListener('change', (e) => {
            obj.set('fontFamily', e.target.value);
            canvas.renderAll();
        });
        
        document.getElementById('text-font-size').addEventListener('change', (e) => {
            obj.set('fontSize', parseInt(e.target.value));
            canvas.renderAll();
        });
        
        document.getElementById('text-fill-color').addEventListener('change', (e) => {
            obj.set('fill', e.target.value);
            canvas.renderAll();
        });
        
        document.getElementById('text-char-spacing').addEventListener('change', (e) => {
            obj.set('charSpacing', parseInt(e.target.value));
            canvas.renderAll();
        });
        
        document.getElementById('text-line-height').addEventListener('change', (e) => {
            obj.set('lineHeight', parseFloat(e.target.value));
            canvas.renderAll();
        });
        
        // Botones de estilo de texto
        document.getElementById('text-bold').addEventListener('click', () => {
            const isActive = document.getElementById('text-bold').classList.toggle('active');
            obj.set('fontWeight', isActive ? 'bold' : 'normal');
            canvas.renderAll();
        });
        
        document.getElementById('text-italic').addEventListener('click', () => {
            const isActive = document.getElementById('text-italic').classList.toggle('active');
            obj.set('fontStyle', isActive ? 'italic' : 'normal');
            canvas.renderAll();
        });
        
        document.getElementById('text-underline').addEventListener('click', () => {
            const isActive = document.getElementById('text-underline').classList.toggle('active');
            obj.set('underline', isActive);
            canvas.renderAll();
        });
        
        // Botones de alineación de texto
        document.getElementById('text-align-left').addEventListener('click', () => {
            updateTextAlign('left');
        });
        
        document.getElementById('text-align-center').addEventListener('click', () => {
            updateTextAlign('center');
        });
        
        document.getElementById('text-align-right').addEventListener('click', () => {
            updateTextAlign('right');
        });
    }
    
    // Propiedades de forma
    if (obj.type === 'rect') {
        document.getElementById('shape-rx').addEventListener('change', (e) => {
            obj.set('rx', parseInt(e.target.value));
            obj.set('ry', parseInt(e.target.value));
            canvas.renderAll();
        });
    }
    
    // Propiedades de borde
    if (canHaveBorder(obj.type)) {
        document.getElementById('border-color').addEventListener('change', (e) => {
            obj.set('stroke', e.target.value);
            canvas.renderAll();
        });
        
        document.getElementById('border-width').addEventListener('change', (e) => {
            obj.set('strokeWidth', parseInt(e.target.value));
            canvas.renderAll();
        });
        
        document.getElementById('border-style').addEventListener('change', (e) => {
            const style = e.target.value;
            if (style === 'solid') {
                obj.set('strokeDashArray', null);
            } else {
                obj.set('strokeDashArray', getStrokeDashArray(style));
            }
            updateBorderPreview();
            canvas.renderAll();
        });
        
        document.getElementById('corner-radius').addEventListener('change', (e) => {
            obj.set('rx', parseInt(e.target.value));
            obj.set('ry', parseInt(e.target.value));
            canvas.renderAll();
        });
        
        document.getElementById('border-position').addEventListener('change', (e) => {
            obj.set('strokePosition', e.target.value);
            canvas.renderAll();
        });
        
        document.getElementById('border-opacity').addEventListener('input', (e) => {
            const opacity = parseInt(e.target.value) / 100;
            obj.set('strokeOpacity', opacity);
            document.getElementById('border-opacity-value').textContent = `${e.target.value}%`;
            canvas.renderAll();
        });
        
        document.getElementById('border-shadow').addEventListener('change', (e) => {
            if (e.target.checked) {
                const color = document.getElementById('shadow-color').value;
                const offset = parseInt(document.getElementById('shadow-offset').value);
                const blur = parseInt(document.getElementById('shadow-blur').value);
                
                obj.set('shadow', new fabric.Shadow({
                    color: color,
                    offsetX: offset,
                    offsetY: offset,
                    blur: blur
                }));
            } else {
                obj.set('shadow', null);
            }
            canvas.renderAll();
        });
        
        // Configurar eventos para controles de sombra
        document.getElementById('shadow-color').addEventListener('change', (e) => {
            if (obj.shadow) {
                obj.shadow.color = e.target.value;
                canvas.renderAll();
            }
        });
        
        document.getElementById('shadow-offset').addEventListener('change', (e) => {
            if (obj.shadow) {
                obj.shadow.offsetX = parseInt(e.target.value);
                obj.shadow.offsetY = parseInt(e.target.value);
                canvas.renderAll();
            }
        });
        
        document.getElementById('shadow-blur').addEventListener('change', (e) => {
            if (obj.shadow) {
                obj.shadow.blur = parseInt(e.target.value);
                canvas.renderAll();
            }
        });
        
        // Opciones avanzadas
        document.getElementById('border-behind-fill').addEventListener('change', (e) => {
            obj.set('strokeBehindFill', e.target.checked);
            canvas.renderAll();
        });
        
        document.getElementById('scale-with-object').addEventListener('change', (e) => {
            obj.set('strokeScaleWithObject', e.target.checked);
            canvas.renderAll();
        });
    }
    
    // Propiedades de imagen
    if (obj.type === 'image') {
        document.getElementById('image-filter').addEventListener('change', (e) => {
            obj.set('filter', e.target.value === 'none' ? null : e.target.value);
            obj.applyFilters();
            canvas.renderAll();
        });
        
        document.getElementById('image-opacity').addEventListener('change', (e) => {
            obj.set('opacity', parseInt(e.target.value) / 100);
            canvas.renderAll();
        });
    }
    
    // Orden de objetos
    document.getElementById('bring-to-front').addEventListener('click', () => {
        obj.bringToFront();
        canvas.renderAll();
    });
    
    document.getElementById('bring-forward').addEventListener('click', () => {
        obj.bringForward();
        canvas.renderAll();
    });
    
    document.getElementById('send-backward').addEventListener('click', () => {
        obj.sendBackwards();
        canvas.renderAll();
    });
    
    document.getElementById('send-to-back').addEventListener('click', () => {
        obj.sendToBack();
        canvas.renderAll();
    });
}