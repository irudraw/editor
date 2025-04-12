// Funciones de zoom
function initZoomUtilities() {
    // Configurar zoom inicial
    updateZoom();
    
    // Eventos de rueda del ratón para zoom
    document.querySelector('.canvas-wrapper').addEventListener('wheel', function(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        }
    });
}

function zoomIn() {
    appState.zoom = Math.min(appState.zoom + 10, 400);
    updateZoom();
}

function zoomOut() {
    appState.zoom = Math.max(appState.zoom - 10, 25);
    updateZoom();
}

function updateZoom() {
    document.getElementById('zoom-level').textContent = `${appState.zoom}%`;
    
    const wrapper = document.querySelector('.canvas-wrapper');
    wrapper.style.transform = `scale(${appState.zoom / 100})`;
    wrapper.style.transformOrigin = 'center center';
}