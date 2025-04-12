// Propiedades de formas
function initShapeProperties() {
    const shapePanel = document.getElementById('shape-properties');
    
    shapePanel.innerHTML = `
        <div class="property-group">
            <div class="property-group-title">Forma</div>
            <div class="mb-2">
                <label class="form-label small">Radio de esquinas</label>
                <input type="number" class="form-control form-control-sm" id="shape-rx" min="0" max="100" value="0">
            </div>
        </div>
    `;
    
    // Event listener
    document.getElementById('shape-rx').addEventListener('input', updateCornerRadius);
}

function updateCornerRadius() {
    const obj = canvas.getActiveObject();
    if (obj && obj.set) {
        if (obj.type === 'rect') {
            obj.set({
                rx: parseInt(this.value),
                ry: parseInt(this.value)
            });
        }
        canvas.renderAll();
    }
}