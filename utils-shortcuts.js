// Atajos de teclado
const keyboardShortcuts = {
    init: function(canvas) {
        document.addEventListener('keydown', (e) => {
            // Ignorar si estamos en un campo de entrada
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const ctrlKey = e.ctrlKey || e.metaKey;
            
            if (ctrlKey) {
                e.preventDefault();
                switch(e.key.toLowerCase()) {
                    case 'z': history.undo(canvas); break;
                    case 'y': history.redo(canvas); break;
                    case 'x': clipboard.cut(canvas); break;
                    case 'c': clipboard.copy(canvas); break;
                    case 'v': clipboard.paste(canvas); break;
                    case 's': document.getElementById('save-file').click(); break;
                    case 'o': document.getElementById('open-file').click(); break;
                    case 'n': document.getElementById('new-file').click(); break;
                }
            } else {
                switch(e.key) {
                    case 'Delete': editTools.deleteSelected(canvas); break;
                }
            }
        });
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = keyboardShortcuts;
}