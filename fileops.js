// File Operations
function newFile() {
    if (canvas.getObjects().length > 0) {
        if (!confirm('¿Estás seguro de que quieres crear un nuevo documento? Se perderán los cambios no guardados.')) {
            return;
        }
    }
    
    try {
        canvas.clear();
        canvas.backgroundColor = '#ffffff';
        appState.document.background = '#ffffff';
        CanvasUtils.updateCanvasSize();
        clearPropertiesPanel();
        saveToHistory();
        
        // Mostrar mensaje de éxito
        showToast('Nuevo documento creado', 'success');
    } catch (error) {
        console.error('Error al crear nuevo documento:', error);
        showToast('Error al crear nuevo documento', 'danger');
    }
}

function saveFile() {
    try {
        const data = JSON.stringify({
            canvas: canvas.toJSON(),
            document: appState.document,
            view: appState.view
        });
        
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `documento-${new Date().toISOString().slice(0,10)}.vectordesign`;
        link.href = url;
        link.click();
        
        // Liberar memoria
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        showToast('Documento guardado correctamente', 'success');
    } catch (error) {
        console.error('Error al guardar el documento:', error);
        showToast('Error al guardar el documento', 'danger');
    }
}

function openFile() {
    document.getElementById('file-input').click();
}


function handleFileOpen(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            
            if (file.name.endsWith('.svg')) {
                fabric.loadSVGFromString(content, function(objects, options) {
                    const obj = fabric.util.groupSVGElements(objects, options);
                    canvas.clear();
                    canvas.add(obj);
                    canvas.renderAll();
                    saveToHistory();
                    showToast('Archivo SVG cargado correctamente', 'success');
                });
            } else {
                const data = JSON.parse(content);
                
                // Restaurar el estado del documento
                if (data.document) {
                    Object.assign(appState.document, data.document);
                    CanvasUtils.updateCanvasSize();
                }
                
                // Restaurar el canvas
                canvas.loadFromJSON(data.canvas || data, function() {
                    canvas.renderAll();
                    saveToHistory();
                    showToast('Documento cargado correctamente', 'success');
                });
            }
        } catch (error) {
            console.error('Error al cargar el archivo:', error);
            showToast('Error al cargar el archivo', 'danger');
        }
    };
    
    if (file.name.endsWith('.svg')) {
        reader.readAsText(file);
    } else {
        reader.readAsText(file);
    }
    
    // Resetear el input para permitir cargar el mismo archivo otra vez
    event.target.value = '';
}

// Image Import
function importImage() {
    document.getElementById('image-import-input').click();
}

function handleImageImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verificar si es una imagen
    if (!file.type.match('image.*')) {
        showToast('Por favor, selecciona un archivo de imagen válido', 'warning');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            fabric.Image.fromURL(e.target.result, function(img) {
                // Ajustar la imagen si es más grande que el canvas
                const maxWidth = canvas.width * 0.8;
                const maxHeight = canvas.height * 0.8;
                
                if (img.width > maxWidth || img.height > maxHeight) {
                    const scale = Math.min(
                        maxWidth / img.width,
                        maxHeight / img.height
                    );
                    img.scale(scale);
                }
                
                // Centrar la imagen en el canvas
                img.set({
                    left: (canvas.width - img.width * img.scaleX) / 2,
                    top: (canvas.height - img.height * img.scaleY) / 2,
                    selectable: true,
                    crossOrigin: 'anonymous',
                    name: file.name
                });
                
                canvas.add(img);
                canvas.setActiveObject(img);
                updatePropertiesPanel(img);
                canvas.renderAll();
                saveToHistory();
                
                showToast('Imagen importada correctamente', 'success');
            });
        } catch (error) {
            console.error('Error al importar imagen:', error);
            showToast('Error al importar imagen', 'danger');
        }
    };
    
    reader.onerror = function() {
        showToast('Error al leer el archivo de imagen', 'danger');
    };
    
    reader.readAsDataURL(file);
    
    // Resetear el input
    event.target.value = '';
}

// Image Crop
function cropImage() {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== 'image') return;
    
    const modal = new bootstrap.Modal(document.getElementById('image-crop-modal'));
    
    // Create a temporary canvas for cropping
    const cropCanvas = new fabric.Canvas('crop-container');
    cropCanvas.setWidth(activeObj.width * activeObj.scaleX);
    cropCanvas.setHeight(activeObj.height * activeObj.scaleY);
    
    // Clone the image for cropping
    activeObj.clone(function(clone) {
        clone.set({
            left: 0,
            top: 0,
            scaleX: 1,
            scaleY: 1,
            selectable: false
        });
        cropCanvas.add(clone);
        
        // Add crop rectangle
        const cropRect = new fabric.Rect({
            left: 0,
            top: 0,
            width: clone.width,
            height: clone.height,
            fill: 'rgba(0,0,0,0.5)',
            stroke: '#ffffff',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            transparentCorners: false,
            borderColor: '#ffffff',
            cornerColor: '#ffffff',
            cornerSize: 10,
            hasControls: true,
            hasBorders: true,
            lockRotation: true,
            lockScalingFlip: true,
            originX: 'left',
            originY: 'top'
        });
        
        cropCanvas.add(cropRect);
        cropCanvas.setActiveObject(cropRect);
        
        // Update crop info
        document.getElementById('crop-width').value = Math.round(cropRect.width);
        document.getElementById('crop-height').value = Math.round(cropRect.height);
        document.getElementById('crop-x').value = Math.round(cropRect.left);
        document.getElementById('crop-y').value = Math.round(cropRect.top);
        
        // Update on object modification
        cropCanvas.on('object:modified', function() {
            document.getElementById('crop-width').value = Math.round(cropRect.width);
            document.getElementById('crop-height').value = Math.round(cropRect.height);
            document.getElementById('crop-x').value = Math.round(cropRect.left);
            document.getElementById('crop-y').value = Math.round(cropRect.top);
        });
        
        // Apply crop button
        document.getElementById('apply-crop').onclick = function() {
            const scaleX = activeObj.scaleX;
            const scaleY = activeObj.scaleY;
            
            // Calculate crop area in original image coordinates
            const cropLeft = cropRect.left / scaleX;
            const cropTop = cropRect.top / scaleY;
            const cropWidth = cropRect.width / scaleX;
            const cropHeight = cropRect.height / scaleY;
            
            // Apply crop
            activeObj.set({
                cropX: cropLeft,
                cropY: cropTop,
                width: cropWidth,
                height: cropHeight,
                scaleX: 1,
                scaleY: 1,
                dirty: true
            });
            
            canvas.renderAll();
            modal.hide();
        };
        
        modal.show();
    });
}

// Export Functions
function exportToPNG() {
    try {
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2, // Mayor resolución
            backgroundColor: appState.document.background
        });
        
        const link = document.createElement('a');
        link.download = `diseño-${new Date().toISOString().slice(0,10)}.png`;
        link.href = dataURL;
        link.click();
        
        showToast('Exportado como PNG correctamente', 'success');
    } catch (error) {
        console.error('Error al exportar PNG:', error);
        showToast('Error al exportar como PNG', 'danger');
    }
}

function exportToJPEG() {
    try {
        const dataURL = canvas.toDataURL({
            format: 'jpeg',
            quality: 0.9,
            multiplier: 2,
            backgroundColor: appState.document.background
        });
        
        const link = document.createElement('a');
        link.download = `diseño-${new Date().toISOString().slice(0,10)}.jpg`;
        link.href = dataURL;
        link.click();
        
        showToast('Exportado como JPEG correctamente', 'success');
    } catch (error) {
        console.error('Error al exportar JPEG:', error);
        showToast('Error al exportar como JPEG', 'danger');
    }
}

function exportToSVG() {
    try {
        const svg = canvas.toSVG({
            suppressPreamble: false,
            viewBox: {
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.height
            }
        });
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `diseño-${new Date().toISOString().slice(0,10)}.svg`;
        link.href = url;
        link.click();
        
        // Liberar memoria
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        showToast('Exportado como SVG correctamente', 'success');
    } catch (error) {
        console.error('Error al exportar SVG:', error);
        showToast('Error al exportar como SVG', 'danger');
    }
}


function exportToPDF() {
    try {
        if (typeof window.jspdf !== 'undefined') {
            const { jsPDF } = window.jspdf;
            
            // Configurar PDF con márgenes
            const pdf = new jsPDF({
                orientation: appState.document.orientation === 'landscape' ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [appState.document.width, appState.document.height],
                hotfixes: ["px_scaling"]
            });

            // Obtener imagen del canvas
            canvas.setBackgroundColor(appState.document.background, () => {
                const imgData = canvas.toDataURL({
                    format: 'jpeg',
                    quality: 0.95,
                    multiplier: 300 / 72,
                    backgroundColor: appState.document.background
                });

                // Calcular dimensiones
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgRatio = canvas.width / canvas.height;
                
                let imgWidth = pageWidth - 20; // Margen de 10mm
                let imgHeight = imgWidth / imgRatio;
                
                if (imgHeight > pageHeight - 20) {
                    imgHeight = pageHeight - 20;
                    imgWidth = imgHeight * imgRatio;
                }

                // Centrar imagen
                const xOffset = (pageWidth - imgWidth) / 2;
                const yOffset = (pageHeight - imgHeight) / 2;

                pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
                pdf.save(`diseño-${new Date().toISOString().slice(0,10)}.pdf`);
                showToast('PDF exportado correctamente', 'success');
            });
            
        } else {
            showToast('Error: La librería jsPDF no está cargada', 'danger');
            console.error('jsPDF no está disponible');
            // Cargar dinámicamente si falla
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => showToast('Intenta exportar nuevamente', 'info');
            document.head.appendChild(script);
        }
    } catch (error) {
        console.error('Error en exportToPDF:', error);
        showToast(`Error al exportar PDF: ${error.message}`, 'danger');
        
        // Fallback a PNG
        if (confirm('¿Exportar como PNG como alternativa?')) {
            exportToPNG();
        }
    }
}

// Función auxiliar para mostrar notificaciones
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast show align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Eliminar después de 5 segundos
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '1100';
    container.style.minWidth = '250px';
    
    document.body.appendChild(container);
    return container;
}