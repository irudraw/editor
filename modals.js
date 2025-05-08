// modals.js
const modals = {
    documentSettings: {
        init: function() {
            this.modal = new bootstrap.Modal('#document-settings-modal');
            this.setupEvents();
        },
        setupEvents: function() {
            document.getElementById('apply-document-settings').onclick = 
                this.applySettings.bind(this);
            document.getElementById('page-size').onchange = 
                this.handlePageSizeChange.bind(this);
        },
        show: function() {
            this.loadCurrentSettings();
            this.modal.show();
        },
        loadCurrentSettings: function() {
            document.getElementById('page-size').value = appState.document.size;
            document.getElementById('page-width').value = appState.document.width;
            document.getElementById('page-height').value = appState.document.height;
            document.getElementById('page-background').value = canvas.backgroundColor;
            document.getElementById('document-units').value = appState.document.units;
            document.getElementById('document-resolution').value = appState.document.resolution;
            document.querySelector(`input[name="page-orientation"][value="${appState.document.orientation}"]`).checked = true;
            
            document.getElementById('custom-size-container').style.display = 
                appState.document.size === 'custom' ? 'flex' : 'none';
        },
        applySettings: function() {
            appState.document.size = document.getElementById('page-size').value;
            appState.document.width = parseFloat(document.getElementById('page-width').value);
            appState.document.height = parseFloat(document.getElementById('page-height').value);
            appState.document.orientation = document.querySelector('input[name="page-orientation"]:checked').value;
            appState.document.units = document.getElementById('document-units').value;
            appState.document.resolution = parseInt(document.getElementById('document-resolution').value);
            
            // Handle orientation
            if (appState.document.orientation === 'landscape' && appState.document.width < appState.document.height) {
                const temp = appState.document.width;
                appState.document.width = appState.document.height;
                appState.document.height = temp;
            } else if (appState.document.orientation === 'portrait' && appState.document.width > appState.document.height) {
                const temp = appState.document.width;
                appState.document.width = appState.document.height;
                appState.document.height = temp;
            }
            
            canvas.backgroundColor = document.getElementById('page-background').value;
            updateCanvasSize();
            this.modal.hide();
        },
        handlePageSizeChange: function() {
            const size = this.value;
            if (size !== 'custom') {
                const dimensions = getStandardPageSize(size);
                document.getElementById('page-width').value = dimensions.width;
                document.getElementById('page-height').value = dimensions.height;
                document.getElementById('custom-size-container').style.display = 'none';
            } else {
                document.getElementById('custom-size-container').style.display = 'flex';
            }
        }
    }
};

// Initialize all modals
function initModals() {
    Object.values(modals).forEach(modal => {
        if (modal.init) modal.init();
    });
}

// Show document settings modal
function showDocumentSettings() {
    modals.documentSettings.show();
}