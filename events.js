// events.js - Manejo de eventos de UI
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que el canvas esté listo
    const checkCanvas = setInterval(() => {
        if (AppState.canvas) {
            clearInterval(checkCanvas);
            setupUIEvents();
        }
    }, 100);
});

function setupUIEvents() {
    // Eventos del menú Archivo
    document.getElementById('new-file')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('¿Crear nuevo documento?')) {
            AppState.canvas.clear();
            AppState.canvas.backgroundColor = '#ffffff';
            AppState.canvas.renderAll();
            if (window.history) history.saveState(AppState.canvas);
        }
    });
    
    document.getElementById('open-file')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('file-input').click();
    });
    
    document.getElementById('save-file')?.addEventListener('click', (e) => {
        e.preventDefault();
        saveToJSON();
    });
    
    document.getElementById('file-input')?.addEventListener('change', handleFileOpen);
    
    // Eventos de herramientas
    document.querySelectorAll('[data-tool]').forEach(btn => {
        btn.addEventListener('click', function() {
            AppState.selectTool(this.dataset.tool);
        });
    });
    
    // Toggle panel de propiedades
    document.getElementById('toggle-properties')?.addEventListener('click', function() {
        const panel = document.getElementById('property-panel');
        if (panel) {
            panel.classList.toggle('collapsed');
            this.innerHTML = panel.classList.contains('collapsed') ? 
                '<i class="fas fa-chevron-left"></i>' : '<i class="fas fa-chevron-right"></i>';
        }
    });
}

function handleFileOpen(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            if (file.name.endsWith('.svg')) {
                fabric.loadSVGFromString(e.target.result, (objects, options) => {
                    AppState.canvas.clear();
                    const obj = fabric.util.groupSVGElements(objects, options);
                    AppState.canvas.add(obj);
                    AppState.canvas.renderAll();
                    if (window.history) history.saveState(AppState.canvas);
                });
            } else {
                AppState.canvas.loadFromJSON(e.target.result, () => {
                    AppState.canvas.renderAll();
                    if (window.history) history.saveState(AppState.canvas);
                });
            }
        } catch (error) {
            alert('Error al cargar archivo: ' + error.message);
        }
    };
    
    file.name.endsWith('.svg') ? reader.readAsText(file) : reader.readAsText(file);
    event.target.value = '';
}

function saveToJSON() {
    if (!AppState.canvas) return;
    const data = JSON.stringify(AppState.canvas.toJSON());
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'diseño-vectorial.json';
    link.href = url;
    link.click();
}