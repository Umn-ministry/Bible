/**
 * Tamil Bible Reader - Core App Shared Configuration Framework Rules Utility Script File
 * Provides lightweight independent hooks for rendering layouts properties quickly across multiple file locations
 */

function initTheme() {
    const config = JSON.parse(localStorage.getItem('tb_settings')) || {
        theme: 'system',
        fontSize: '16px',
        fontFamily: 'sans'
    };
    applyThemeSettings(config.theme);
    applyFontSettings(config.fontSize, config.fontFamily);
}

function applyThemeSettings(theme) {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function applyFontSettings(size, family) {
    document.documentElement.style.setProperty('--font-size-base', size);
    const resolvedFontStackVal = family === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)';
    document.documentElement.style.setProperty('--font-current', resolvedFontStackVal);
}