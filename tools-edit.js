// Operaciones básicas de edición
const editTools = {
    deleteSelected: function(canvas) {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            canvas.remove(activeObj);
            canvas.renderAll();
            return true;
        }
        return false;
    },

    bringToFront: function(canvas) {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.bringToFront();
            canvas.renderAll();
            return true;
        }
        return false;
    },

    sendToBack: function(canvas) {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.sendToBack();
            canvas.renderAll();
            return true;
        }
        return false;
    },

    bringForward: function(canvas) {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.bringForward();
            canvas.renderAll();
            return true;
        }
        return false;
    },

    sendBackward: function(canvas) {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.sendBackwards();
            canvas.renderAll();
            return true;
        }
        return false;
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = editTools;
}