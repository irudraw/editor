// Menú contextual personalizado
const contextMenu = {
    init: function(canvas) {
        const menu = document.createElement('div');
        menu.id = 'context-menu';
        menu.className = 'context-menu';
        menu.style.display = 'none';
        document.body.appendChild(menu);

        // Añadir opciones al menú
        const options = [
            { icon: 'cut', text: 'Cortar', action: 'cut' },
            { icon: 'copy', text: 'Copiar', action: 'copy' },
            { icon: 'paste', text: 'Pegar', action: 'paste' },
            { icon: 'trash-alt', text: 'Eliminar', action: 'delete' },
            { icon: 'arrow-up', text: 'Traer al frente', action: 'bringToFront' },
            { icon: 'arrow-down', text: 'Enviar atrás', action: 'sendToBack' }
        ];

        options.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            item.innerHTML = `<i class="fas fa-${opt.icon}"></i>${opt.text}`;
            item.addEventListener('click', () => this.handleAction(opt.action, canvas));
            menu.appendChild(item);
        });

        // Mostrar/ocultar menú
        canvas.upperCanvasEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const activeObj = canvas.getActiveObject();
            if (activeObj) {
                menu.style.display = 'block';
                menu.style.left = `${e.clientX}px`;
                menu.style.top = `${e.clientY}px`;
            }
        });

        document.addEventListener('click', () => {
            menu.style.display = 'none';
        });
    },

    handleAction: function(action, canvas) {
        document.getElementById('context-menu').style.display = 'none';
        
        switch(action) {
            case 'cut':
                clipboard.cut(canvas);
                break;
            case 'copy':
                clipboard.copy(canvas);
                break;
            case 'paste':
                clipboard.paste(canvas);
                break;
            case 'delete':
                editTools.deleteSelected(canvas);
                break;
            case 'bringToFront':
                editTools.bringToFront(canvas);
                break;
            case 'sendToBack':
                editTools.sendToBack(canvas);
                break;
        }
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = contextMenu;
}