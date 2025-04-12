// app-core.js - Estado compartido de la aplicación
const AppState = {
    canvas: null,
    state: {
        currentTool: 'select',
        fillColor: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 1,
        textColor: '#000000',
        fontSize: 24,
        zoomLevel: 100
    },
    
    initCanvas: function() {
        this.canvas = new fabric.Canvas('drawing-canvas', {
            backgroundColor: '#ffffff',
            selection: true,
            selectionColor: 'rgba(13, 110, 253, 0.3)',
            selectionBorderColor: '#0d6efd',
            selectionLineWidth: 1,
            preserveObjectStacking: true
        });
        this.updateCanvasSize();
        return this.canvas;
    },
    
    updateCanvasSize: function() {
        const container = document.getElementById('page-container');
        if (this.canvas && container) {
            this.canvas.setWidth(container.clientWidth);
            this.canvas.setHeight(container.clientHeight);
            this.canvas.renderAll();
        }
    },
    
    selectTool: function(tool) {
        this.state.currentTool = tool;
        // Configuración de herramientas...
    }
};

window.AppState = AppState;