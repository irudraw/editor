// Propiedades de bordes
function initBorderProperties() {
    const borderPanel = document.getElementById('border-properties');
    
    borderPanel.innerHTML = `
        <div class="property-group">
            <div class="property-group-title">Borde</div>
            <div class="row g-2 mb-2">
                <div class="col-6">
                    <label class="form-label small">Color</label>
                    <input type="color" class="form-control form-control-color" id="border-color" value="#000000">
                </div>
                <div class="col-6">
                    <label class="form-label small">Ancho</label>
                    <input type="number" class="form-control" id="border-width" min="0" max="50" value="1" step="0.1">
                </div>
            </div>
            <div class="mb-2">
                <label class="form-label small">Estilo</label>
                <select class="form-select form-select-sm" id="border-style">
                    <option value="solid">Sólido</option>
                    <option value="dashed">Discontinuo</option>
                    <option value="dotted">Punteado</option>
                </select>
                <div class="border-style-preview mt-2" id="border-preview"></div>
            </div>
        </div>
    `;
    
    // Event listeners
    document.getElementById('border-color').addEventListener('input', updateBorderColor);
    document.getElementById('border-width').addEventListener('input', updateBorderWidth);
    document.getElementById('border-style').addEventListener('change', updateBorderStyle);
    
    // Actualizar vista previa inicial
    updateBorderPreview();
}

function updateBorderColor() {
    const obj = canvas.getActiveObject();
    if (obj && obj.set) {
        obj.set('stroke', this.value);
        canvas.renderAll();
    }
}

function updateBorderWidth() {
    const obj = canvas.getActiveObject();
    if (obj && obj.set) {
        obj.set('strokeWidth', parseFloat(this.value));
        canvas.renderAll();
    }
}

function updateBorderStyle() {
    const obj = canvas.getActiveObject();
    if (obj && obj.set) {
        obj.set('strokeDashArray', getStrokeDashArray(this.value));
        canvas.renderAll();
    }
    updateBorderPreview();
}

function updateBorderPreview() {
    const style = document.getElementById('border-style').value;
    const preview = document.getElementById('border-preview');
    
    preview.className = 'border-style-preview mt-2';
    
    if (style === 'dashed') {
        preview.classList.add('dashed');
    } else if (style === 'dotted') {
        preview.classList.add('dotted');
    }
}