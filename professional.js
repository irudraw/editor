class AdvancedTextTools {
    constructor(canvas) {
      this.canvas = canvas;
    }
    
    applyProfessionalTextSettings(textObj) {
      textObj.set({
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.3)',
          blur: 5,
          offsetX: 2,
          offsetY: 2
        }),
        textBackgroundColor: 'rgba(255,255,255,0.7)'
      });
    }
  }
  
  class ExportManager {
    constructor(canvas) {
      this.canvas = canvas;
    }
  }
  
  class VisualEffects {
    constructor(canvas) {
      this.canvas = canvas;
    }
  }
  
// professional.js
class LayerManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.layers = [];
        this.currentLayerId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.addLayer('Capa 1');
    }

    setupEventListeners() {
        // Usar arrow functions para mantener el contexto
        this.canvas.on('object:added', (e) => this.handleObjectAdded(e));
        this.canvas.on('object:removed', (e) => this.handleObjectRemoved(e));
        this.canvas.on('object:modified', (e) => this.handleObjectModified(e));
    }

    handleObjectRemoved(e) {
        const obj = e.target;
        this.layers.forEach(layer => {
            const index = layer.objects.indexOf(obj);
            if (index > -1) layer.objects.splice(index, 1);
        });
        this.updateUI();
    }

    updateUI() {
        const container = document.getElementById('layers-list');
        if (!container) return;
        
        container.innerHTML = this.layers.map(layer => `
            <div class="layer-item ${layer.id === this.currentLayerId ? 'active' : ''} 
                 ${layer.locked ? 'locked' : ''}" data-layer-id="${layer.id}">
                <div class="layer-visibility">
                    <input type="checkbox" ${layer.visible ? 'checked' : ''} 
                           class="layer-visibility-toggle">
                </div>
                <div class="layer-name">${layer.name}</div>
                <div class="layer-actions">
                    <i class="fas fa-eye${layer.visible ? '' : '-slash'} layer-visibility-btn"></i>
                    <i class="fas fa-lock${layer.locked ? '' : '-open'} layer-lock-btn"></i>
                    <i class="fas fa-trash layer-delete-btn"></i>
                </div>
            </div>
        `).join('');
        
        // Agregar event listeners
        document.querySelectorAll('.layer-visibility-toggle, .layer-visibility-btn').forEach(el => {
            el.addEventListener('click', (e) => this.toggleLayerVisibility(e));
        });
        
        document.querySelectorAll('.layer-lock-btn').forEach(el => {
            el.addEventListener('click', (e) => this.toggleLayerLock(e));
        });
        
        document.querySelectorAll('.layer-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (!e.target.closest('.layer-actions')) {
                    this.selectLayer(e.currentTarget.dataset.layerId);
                }
            });
        });
    }

    toggleLayerVisibility(e) {
        const layerId = e.currentTarget.closest('.layer-item').dataset.layerId;
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.visible = !layer.visible;
            layer.objects.forEach(obj => {
                obj.visible = layer.visible;
            });
            this.canvas.renderAll();
            this.updateUI();
        }
    }
}

// Exporta las clases profesionales
window.ProfessionalFeatures = {
    LayerManager,
    AdvancedTextTools,
    ExportManager,
    VisualEffects
};