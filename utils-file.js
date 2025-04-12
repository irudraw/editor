// Operaciones con archivos
function initFileUtilities() {
    document.getElementById('new-file').addEventListener('click', newFile);
    document.getElementById('open-file').addEventListener('click', openFile);
    document.getElementById('save-file').addEventListener('click', saveFile);
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
}

function newFile() {
    if (confirm('¿Crear nuevo documento? Se perderán los cambios no guardados.')) {
        clearCanvas();
    }
}

function openFile() {
    document.getElementById('file-input').click();
}

function saveFile() {
    const data = exportCanvasToJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = 'dibujo.vectordesign';
    link.href = url;
    link.click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            importCanvasFromJSON(e.target.result);
        } catch (error) {
            alert('Error al cargar el archivo: ' + error.message);
        }
    };
    reader.readAsText(file);
}