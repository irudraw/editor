// Manejo de fuentes del sistema
function loadSystemFonts() {
    return new Promise((resolve) => {
        if (window.queryLocalFonts) {
            // Método moderno (Chrome 103+)
            window.queryLocalFonts()
                .then(fonts => {
                    const uniqueFonts = [...new Set(fonts.map(f => f.family))];
                    resolve(uniqueFonts.length ? uniqueFonts : getStandardFonts());
                })
                .catch(() => resolve(getStandardFonts()));
        } else {
            // Fallback para navegadores que no soportan queryLocalFonts
            resolve(getStandardFonts());
        }
    });
}

function getStandardFonts() {
    return [
        'Arial', 'Verdana', 'Times New Roman', 'Courier New',
        'Georgia', 'Palatino Linotype', 'Comic Sans MS', 'Impact'
    ];
}

function updateFontSelectors() {
    const selectors = document.querySelectorAll('.font-selector');
    selectors.forEach(select => {
        const current = select.value;
        select.innerHTML = '';
        
        appState.availableFonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            option.style.fontFamily = font;
            select.appendChild(option);
        });
        
        if (appState.availableFonts.includes(current)) {
            select.value = current;
        }
    });
}