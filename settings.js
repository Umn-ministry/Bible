/**
 * Tamil Bible Reader PWA - Settings & Theme Configuration Module
 * Manages persistent user preferences using LocalStorage and DOM manipulations.
 */

const SETTINGS_KEYS = {
    THEME: 'bible_pwa_theme',
    FONT_SIZE: 'bible_pwa_font_size',
    READING_MODE: 'bible_pwa_reading_mode'
};

// Default Configurations
const DEFAULT_SETTINGS = {
    THEME: 'light',
    FONT_SIZE: 18, // in pixels
    READING_MODE: 'verse' // 'verse' or 'para'
};

/**
 * Initializes and applies saved settings from LocalStorage upon loading.
 */
function initSettingsEngine() {
    applyThemePreference();
    applyGlobalTypography();
}

/**
 * Automatically fetches and sets the visual theme palette across documents.
 */
function applyThemePreference() {
    const savedTheme = localStorage.getItem(SETTINGS_KEYS.THEME) || DEFAULT_SETTINGS.THEME;
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Sync UI toggle icons if they exist on the current page
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'dark' ? 'light_mode' : 'dark_mode';
    }
    
    const themeSwitch = document.getElementById('settingsThemeSwitch');
    if (themeSwitch) {
        themeSwitch.checked = (savedTheme === 'dark');
    }
}

/**
 * Modifies CSS typography properties natively based on stored settings.
 */
function applyGlobalTypography() {
    const size = getSavedFontSize();
    // Injects a dynamic rule target directly into root or readers
    const versesGrid = document.getElementById('versesRenderGrid');
    if (versesGrid) {
        versesGrid.style.fontSize = `${size}px`;
    }
    
    const mode = localStorage.getItem(SETTINGS_KEYS.READING_MODE) || DEFAULT_SETTINGS.READING_MODE;
    if (versesGrid) {
        if (mode === 'para') {
            versesGrid.classList.remove('verse-mode');
            versesGrid.classList.add('para-mode');
        } else {
            versesGrid.classList.remove('para-mode');
            versesGrid.classList.add('verse-mode');
        }
    }
}

/**
 * Safe wrapper to fetch font pixel integer value.
 * @returns {number} Pixel configuration value
 */
function getSavedFontSize() {
    const size = localStorage.getItem(SETTINGS_KEYS.FONT_SIZE);
    return size ? parseInt(size, 10) : DEFAULT_SETTINGS.FONT_SIZE;
}

/**
 * Triggers state change for Dark Mode.
 */
function toggleThemePreference() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(SETTINGS_KEYS.THEME, newTheme);
    applyThemePreference();
}

/**
 * Adjusts font configuration limits sequentially.
 * @param {boolean} increase - Increments size if true, else decrements.
 */
function adjustFontSizePreference(increase) {
    let currentSize = getSavedFontSize();
    // Restrict sizes within readable limits [14px - 32px]
    if (increase && currentSize < 32) currentSize += 2;
    if (!increase && currentSize > 14) currentSize -= 2;
    
    localStorage.setItem(SETTINGS_KEYS.FONT_SIZE, currentSize);
    
    // UI Update reflection handlers
    const displayVal = document.getElementById('fontSizeDisplay') || document.getElementById('settingsFontSizeVal');
    if (displayVal) displayVal.textContent = `${currentSize}px`;
    
    applyGlobalTypography();
}

/**
 * Set structural rendering alignment style.
 * @param {string} mode - Structural keyword identification token ('verse'|'para')
 */
function setReadingModePreference(mode) {
    localStorage.setItem(SETTINGS_KEYS.READING_MODE, mode);
    applyGlobalTypography();
}

// Fire runtime script processing initialization execution loop
document.addEventListener('DOMContentLoaded', initSettingsEngine);
