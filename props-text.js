// Propiedades de texto
function initTextProperties() {
    const textPanel = document.getElementById('text-properties');
    
    textPanel.innerHTML = `
        <div class="property-group">
            <div class="property-group-title">Texto</div>
            <div class="mb-2">
                <label class="form-label small">Fuente</label>
                <select class="form-select form-select-sm font-selector" id="text-font-family">
                    <option value="Arial">Arial</option>
                </select>
            </div>
            <div class="mb-2">
                <label class="form-label small">Tamaño</label>
                <input type="number" class="form-control form-control-sm" id="text-font-size" min="6" max="144" value="24">
            </div>
            <div class="mb-2">
                <label class="form-label small">Color</label>
                <input type="color" class="form-control form-control-color" id="text-fill-color" value="#000000">
            </div>
            <div class="mb-2">
                <label class="form-label small">Estilo</label>
                <div class="d-flex">
                    <button class="btn btn-sm btn-outline-secondary me-1" id="text-bold"><i class="fas fa-bold"></i></button>
                    <button class="btn btn-sm btn-outline-secondary me-1" id="text-italic"><i class="fas fa-italic"></i></button>
                    <button class="btn btn-sm btn-outline-secondary" id="text-underline"><i class="fas fa-underline"></i></button>
                </div>
            </div>
        </div>
    `;
    
    // Event listeners
    document.getElementById('text-font-family').addEventListener('change', updateTextFont);
    document.getElementById('text-font-size').addEventListener('input', updateTextSize);
    document.getElementById('text-fill-color').addEventListener('input', updateTextColor);
    document.getElementById('text-bold').addEventListener('click', toggleTextBold);
    document.getElementById('text-italic').addEventListener('click', toggleTextItalic);
    document.getElementById('text-underline').addEventListener('click', toggleTextUnderline);
}

function updateTextFont() {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'text') {
        obj.set('fontFamily', this.value);
        canvas.renderAll();
    }
}

function updateTextSize() {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'text') {
        obj.set('fontSize', parseInt(this.value));
        canvas.renderAll();
    }
}

function updateTextColor() {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'text') {
        obj.set('fill', this.value);
        canvas.renderAll();
    }
}

function toggleTextBold() {
    this.classList.toggle('active');
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'text') {
        obj.set('fontWeight', this.classList.contains('active') ? 'bold' : 'normal');
        canvas.renderAll();
    }
}

function toggleTextItalic() {
    this.classList.toggle('active');
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'text') {
        obj.set('fontStyle', this.classList.contains('active') ? 'italic' : 'normal');
        canvas.renderAll();
    }
}

function toggleTextUnderline() {
    this.classList.toggle('active');
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'text') {
        obj.set('underline', this.classList.contains('active'));
        canvas.renderAll();
    }
}