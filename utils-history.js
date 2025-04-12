// Historial para deshacer/rehacer
const history = {
    states: [],
    currentState: -1,
    maxStates: 20,

    saveState: function(canvas) {
        if (this.currentState < this.states.length - 1) {
            this.states = this.states.slice(0, this.currentState + 1);
        }
        
        const json = canvas.toJSON();
        this.states.push(JSON.stringify(json));
        this.currentState = this.states.length - 1;
        
        if (this.states.length > this.maxStates) {
            this.states.shift();
            this.currentState--;
        }
    },

    undo: function(canvas) {
        if (this.currentState > 0) {
            this.currentState--;
            canvas.loadFromJSON(this.states[this.currentState], function() {
                canvas.renderAll();
            });
        }
    },

    redo: function(canvas) {
        if (this.currentState < this.states.length - 1) {
            this.currentState++;
            canvas.loadFromJSON(this.states[this.currentState], function() {
                canvas.renderAll();
            });
        }
    },

    init: function(canvas) {
        // Guardar estado inicial
        this.saveState(canvas);
        
        // Configurar eventos para guardar estados
        canvas.on('object:added', () => this.saveState(canvas));
        canvas.on('object:modified', () => this.saveState(canvas));
        canvas.on('object:removed', () => this.saveState(canvas));
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = history;
}