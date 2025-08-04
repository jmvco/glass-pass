/**
 * GlassPass - Generador de Contraseñas Seguras
 * Aplicación web con diseño glassmorphism para generar contraseñas seguras
 */

// ==============================================
// CONFIGURACIÓN Y CONSTANTES
// ==============================================

const CHAR_SETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// ==============================================
// REFERENCIAS DOM
// ==============================================

const elements = {
    passwordOutput: document.getElementById('passwordOutput'),
    lengthSlider: document.getElementById('lengthSlider'),
    lengthValue: document.getElementById('lengthValue'),
    copyButton: document.getElementById('copyButton'),
    copyFeedback: document.getElementById('copyFeedback'),
    generateButton: document.getElementById('generateButton'),
    checkboxes: {
        uppercase: document.getElementById('includeUppercase'),
        lowercase: document.getElementById('includeLowercase'),
        numbers: document.getElementById('includeNumbers'),
        symbols: document.getElementById('includeSymbols')
    }
};

// ==============================================
// ESTADO DE LA APLICACIÓN
// ==============================================

let passwordSettings = {
    length: parseInt(elements.lengthSlider.value),
    includeUppercase: elements.checkboxes.uppercase.checked,
    includeLowercase: elements.checkboxes.lowercase.checked,
    includeNumbers: elements.checkboxes.numbers.checked,
    includeSymbols: elements.checkboxes.symbols.checked
};

// ==============================================
// FUNCIONES PRINCIPALES
// ==============================================

/**
 * Genera una contraseña segura basada en la configuración actual
 * @returns {string} Contraseña generada
 */
function generateSecurePassword() {
    const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = passwordSettings;
    
    // Construir el conjunto de caracteres disponibles
    let availableChars = '';
    let guaranteedChars = [];
    
    if (includeLowercase) {
        availableChars += CHAR_SETS.lowercase;
        guaranteedChars.push(getRandomChar(CHAR_SETS.lowercase));
    }
    
    if (includeUppercase) {
        availableChars += CHAR_SETS.uppercase;
        guaranteedChars.push(getRandomChar(CHAR_SETS.uppercase));
    }
    
    if (includeNumbers) {
        availableChars += CHAR_SETS.numbers;
        guaranteedChars.push(getRandomChar(CHAR_SETS.numbers));
    }
    
    if (includeSymbols) {
        availableChars += CHAR_SETS.symbols;
        guaranteedChars.push(getRandomChar(CHAR_SETS.symbols));
    }
    
    // Verificar que haya al menos un conjunto de caracteres seleccionado
    if (availableChars.length === 0) {
        throw new Error('Debe seleccionar al menos un tipo de carácter');
    }
    
    // Generar el resto de la contraseña
    const remainingLength = length - guaranteedChars.length;
    const password = guaranteedChars.concat(
        Array.from({ length: remainingLength }, () => getRandomChar(availableChars))
    );
    
    // Mezclar la contraseña para que los caracteres garantizados no estén al principio
    return shuffleArray(password).join('');
}

/**
 * Obtiene un carácter aleatorio de una cadena
 * @param {string} chars - Cadena de caracteres
 * @returns {string} Carácter aleatorio
 */
function getRandomChar(chars) {
    return chars.charAt(Math.floor(Math.random() * chars.length));
}

/**
 * Mezcla aleatoriamente un array usando el algoritmo Fisher-Yates
 * @param {Array} array - Array a mezclar
 * @returns {Array} Array mezclado
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Actualiza la configuración de la contraseña
 */
function updatePasswordSettings() {
    passwordSettings = {
        length: parseInt(elements.lengthSlider.value),
        includeUppercase: elements.checkboxes.uppercase.checked,
        includeLowercase: elements.checkboxes.lowercase.checked,
        includeNumbers: elements.checkboxes.numbers.checked,
        includeSymbols: elements.checkboxes.symbols.checked
    };
}

/**
 * Valida que al menos una opción esté seleccionada
 * @returns {boolean} True si la configuración es válida
 */
function validateSettings() {
    const { includeUppercase, includeLowercase, includeNumbers, includeSymbols } = passwordSettings;
    return includeUppercase || includeLowercase || includeNumbers || includeSymbols;
}

/**
 * Maneja la generación de una nueva contraseña
 */
function handleGeneratePassword() {
    try {
        updatePasswordSettings();
        
        if (!validateSettings()) {
            showError('Debe seleccionar al menos un tipo de carácter');
            return;
        }
        
        // Animación del botón y efecto ripple
        elements.generateButton.classList.add('generating');
        addRippleEffect(elements.generateButton);
        
        setTimeout(() => {
            elements.generateButton.classList.remove('generating');
        }, 500);
        
        // Generar nueva contraseña
        const newPassword = generateSecurePassword();
        elements.passwordOutput.value = newPassword;
        
        // Feedback visual acuático
        elements.passwordOutput.style.background = 'rgba(52, 199, 89, 0.1)';
        elements.passwordOutput.style.borderColor = '#34C759';
        setTimeout(() => {
            elements.passwordOutput.style.background = '';
            elements.passwordOutput.style.borderColor = '';
        }, 1000);
        
    } catch (error) {
        console.error('Error generando contraseña:', error);
        showError('Error al generar la contraseña');
    }
}

/**
 * Copia la contraseña al portapapeles
 */
async function handleCopyPassword() {
    const password = elements.passwordOutput.value;
    
    if (!password) {
        showError('No hay contraseña para copiar');
        return;
    }
    
    try {
        // Verificar si el API Clipboard está disponible
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(password);
        } else {
            // Fallback para navegadores más antiguos
            fallbackCopyToClipboard(password);
        }
        
        showCopySuccess();
        
    } catch (error) {
        console.error('Error copiando al portapapeles:', error);
        
        // Intentar método fallback
        try {
            fallbackCopyToClipboard(password);
            showCopySuccess();
        } catch (fallbackError) {
            showError('No se pudo copiar al portapapeles');
        }
    }
}

/**
 * Método fallback para copiar al portapapeles en navegadores más antiguos
 * @param {string} text - Texto a copiar
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    if (!document.execCommand('copy')) {
        throw new Error('Comando copy no disponible');
    }
    
    document.body.removeChild(textArea);
}

/**
 * Muestra el feedback de copia exitosa
 */
function showCopySuccess() {
    // Cambiar texto del botón temporalmente
    const originalText = elements.copyButton.querySelector('.copy-text').textContent;
    elements.copyButton.querySelector('.copy-text').textContent = '¡Copiado!';
    elements.copyButton.style.background = '#2E7D32';
    
    // Mostrar feedback flotante
    elements.copyFeedback.classList.add('show');
    
    // Restaurar después de 2 segundos
    setTimeout(() => {
        elements.copyButton.querySelector('.copy-text').textContent = originalText;
        elements.copyButton.style.background = '#C850C0';
        elements.copyFeedback.classList.remove('show');
    }, 2000);
}

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje de error
 */
function showError(message) {
    console.warn('Error de validación:', message);
    
    // Crear elemento de error temporal
    const errorElement = document.createElement('div');
    errorElement.textContent = message;
    errorElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(211, 47, 47, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(errorElement);
    
    // Animar entrada
    setTimeout(() => {
        errorElement.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        errorElement.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (errorElement.parentNode) {
                document.body.removeChild(errorElement);
            }
        }, 300);
    }, 3000);
}

/**
 * Maneja los cambios en el slider de longitud
 */
function handleLengthChange() {
    const newLength = parseInt(elements.lengthSlider.value);
    elements.lengthValue.textContent = newLength;
    passwordSettings.length = newLength;
    
    // Regenerar automáticamente si hay una contraseña actual
    if (elements.passwordOutput.value) {
        handleGeneratePassword();
    }
}

/**
 * Maneja los cambios en los checkboxes
 * @param {Event} event - Evento de cambio
 */
function handleCheckboxChange(event) {
    updatePasswordSettings();
    
    // Asegurar que al menos una opción esté seleccionada
    const anyChecked = Object.values(elements.checkboxes).some(checkbox => checkbox.checked);
    
    if (!anyChecked) {
        // Prevenir deseleccionar todas las opciones
        event.target.checked = true;
        showError('Debe mantener al menos una opción seleccionada');
        return;
    }
    
    // Regenerar automáticamente si hay una contraseña actual
    if (elements.passwordOutput.value) {
        handleGeneratePassword();
    }
}

/**
 * Maneja el enfoque del campo de contraseña para facilitar la selección
 */
function handlePasswordFocus() {
    elements.passwordOutput.select();
}

// ==============================================
// EVENT LISTENERS
// ==============================================

function setupEventListeners() {
    // Botón generar
    elements.generateButton.addEventListener('click', handleGeneratePassword);
    
    // Botón copiar
    elements.copyButton.addEventListener('click', handleCopyPassword);
    
    // Slider de longitud
    elements.lengthSlider.addEventListener('input', handleLengthChange);
    
    // Checkboxes
    Object.values(elements.checkboxes).forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
    
    // Campo de contraseña
    elements.passwordOutput.addEventListener('focus', handlePasswordFocus);
    elements.passwordOutput.addEventListener('click', handlePasswordFocus);
    
    // Teclas de acceso rápido
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + Enter para generar
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            handleGeneratePassword();
        }
        
        // Ctrl/Cmd + C en el campo de contraseña para copiar
        if ((event.ctrlKey || event.metaKey) && event.key === 'c' && 
            document.activeElement === elements.passwordOutput) {
            handleCopyPassword();
        }
    });
}

// ==============================================
// INICIALIZACIÓN
// ==============================================

/**
 * Inicializa la aplicación
 */
function initializeApp() {
    console.log('💧 Inicializando GlassPass Acuático...');
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar efectos acuáticos
    setupAquaticEffects();
    
    // Crear gotas de agua de fondo
    setTimeout(createWaterDrops, 1000);
    
    // Generar contraseña inicial
    handleGeneratePassword();
    
    // Verificar compatibilidad con API Clipboard
    if (!navigator.clipboard) {
        console.warn('⚠️  API Clipboard no disponible, usando método fallback');
    }
    
    console.log('✅ GlassPass Acuático iniciado correctamente');
}

// ==============================================
// EJECUCIÓN AL CARGAR LA PÁGINA
// ==============================================

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ==============================================
// UTILIDADES ADICIONALES
// ==============================================

/**
 * Evalúa la fortaleza de una contraseña
 * @param {string} password - Contraseña a evaluar
 * @returns {Object} Información sobre la fortaleza
 */
function evaluatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Longitud
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    else feedback.push('Usar al menos 8 caracteres');
    
    // Tipos de caracteres
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    // Evaluar fortaleza
    let strength;
    if (score >= 6) strength = 'Muy fuerte';
    else if (score >= 4) strength = 'Fuerte';
    else if (score >= 2) strength = 'Media';
    else strength = 'Débil';
    
    return { strength, score, feedback };
}

/**
 * Añade efecto ripple/ondas a un elemento
 * @param {HTMLElement} element - Elemento al que añadir el efecto
 */
function addRippleEffect(element) {
    const container = document.querySelector('.glass-container');
    if (container) {
        container.classList.add('ripple');
        setTimeout(() => {
            container.classList.remove('ripple');
        }, 700);
    }
}

/**
 * Crea gotas de agua animadas en el fondo
 */
function createWaterDrops() {
    const dropCount = 5;
    
    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'water-drop';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDelay = Math.random() * 3 + 's';
        drop.style.animationDuration = (3 + Math.random() * 2) + 's';
        document.body.appendChild(drop);
        
        // Remover la gota después de la animación
        setTimeout(() => {
            if (drop.parentNode) {
                document.body.removeChild(drop);
            }
        }, 5000);
    }
    
    // Crear nuevas gotas periódicamente
    setTimeout(createWaterDrops, 2000 + Math.random() * 3000);
}

/**
 * Añade efectos de hover acuáticos a elementos interactivos
 */
function setupAquaticEffects() {
    // Efecto splash en botones
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const splash = document.createElement('div');
            splash.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 0;
                height: 0;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 100;
                animation: splash 0.6s ease-out;
            `;
            
            button.style.position = 'relative';
            button.appendChild(splash);
            
            setTimeout(() => {
                if (splash.parentNode) {
                    button.removeChild(splash);
                }
            }, 600);
        });
    });
}

// CSS para la animación splash
const splashStyle = document.createElement('style');
splashStyle.textContent = `
    @keyframes splash {
        to {
            width: 100px;
            height: 100px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(splashStyle);

// Exponer funciones globalmente para debugging (solo en desarrollo)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.GlassPass = {
        generatePassword: generateSecurePassword,
        evaluateStrength: evaluatePasswordStrength,
        settings: passwordSettings,
        addRipple: addRippleEffect,
        createDrops: createWaterDrops
    };
}