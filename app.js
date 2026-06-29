/**
 * Tamil Bible Reader - Core Runtime Management Module
 * Comprehensive App Execution Logic & State Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initPWA();
    
    // Check if on home page index
    if (document.getElementById('booksGrid')) {
        renderBooksGrid('old');
        loadDailyVerse();
        updateDashboardStatus();
    }
});

// Global State Handler Utility
const AppState = {
    currentTestament: 'old',
    getSettings() {
        return JSON.parse(localStorage.getItem('tb_settings')) || {
            theme: 'system',
            fontSize: '16px',
            fontFamily: 'sans'
        };
    }
};

/**
 * Initializes and forces system UI themes configurations
 */
function initTheme() {
    const settings = AppState.getSettings();
    applyThemeSettings(settings.theme);
    applyFontSettings(settings.fontSize, settings.fontFamily);
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
    const fontVal = family === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)';
    document.documentElement.style.setProperty('--font-current', fontVal);
}

/**
 * Renders home view directory components layout grid
 */
function renderBooksGrid(testament) {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const filteredBooks = bibleBooksData.filter(b => b.testament === testament);
    
    filteredBooks.forEach(book => {
        const card = document.createElement('a');
        card.href = `reader.html?book=${encodeURIComponent(book.id)}`;
        card.className = 'book-card';
        
        card.innerHTML = `
            <div class="book-name-ta">${book.ta}</div>
            <div class="book-name-en">${book.en}</div>
        `;
        grid.appendChild(card);
    });
}

function switchTestament(testament) {
    AppState.currentTestament = testament;
    document.getElementById('tabOld').classList.toggle('active', testament === 'old');
    document.getElementById('tabNew').classList.toggle('active', testament === 'new');
    renderBooksGrid(testament);
}

/**
 * Generates Daily Verse deterministically using current calendar date metric rules
 */
function loadDailyVerse() {
    const txtEl = document.getElementById('dailyVerseText');
    const refEl = document.getElementById('dailyVerseRef');
    if (!txtEl || !refEl) return;

    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    
    // Deterministic selection metrics map from preset repository pool data
    const pool = staticDailyVersesPool;
    const selection = pool[dayOfYear % pool.length];
    
    // Asynchronously download corresponding layout file source targets
    fetch(`books/${selection.book}.json`)
        .then(res => res.json())
        .then(data => {
            try {
                // Strict compliance schema structural check traversal logic rules
                const verseObj = data.Book[0].Chapter[selection.chapter - 1].Verse[selection.verse - 1];
                txtEl.innerText = verseObj.Verse;
                refEl.innerText = `${selection.bookTa} ${selection.chapter}:${selection.verse}`;
                
                // Wire action execution mechanisms
                setupDailyActions(verseObj.Verse, refEl.innerText);
            } catch (err) {
                fallbackDailyVerse();
            }
        })
        .catch(() => fallbackDailyVerse());
}

function fallbackDailyVerse() {
    const txtEl = document.getElementById('dailyVerseText');
    const refEl = document.getElementById('dailyVerseRef');
    if(txtEl && refEl) {
        txtEl.innerText = "தேவன், தம்முடைய ஒரேபேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்தியஜீவனை அடையும்படிக்கு, அவரைத் தந்தருளி, இவ்வளவாய் உலகத்தில் அன்புகூர்ந்தார்.";
        refEl.innerText = "யோவான் 3:16";
        setupDailyActions(txtEl.innerText, refEl.innerText);
    }
}

function setupDailyActions(text, ref) {
    const shareBtn = document.getElementById('shareDailyVerse');
    const copyBtn = document.getElementById('copyDailyVerse');
    
    if(shareBtn) {
        shareBtn.onclick = () => {
            if (navigator.share) {
                navigator.share({ title: 'இன்றைய வேத வசனம்', text: `"${text}" - ${ref}` });
            } else {
                alert('பகிர்வு வசதி இந்த உலாவியில் ஆதரிக்கப்படவில்லை.');
            }
        };
    }
    if(copyBtn) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(`"${text}" - ${ref}`);
            alert('வசனம் நகலெடுக்கப்பட்டது!');
        };
    }
}

/**
 * Process runtime indicators dashboards parameters update trackers
 */
function updateDashboardStatus() {
    const contCard = document.getElementById('continueReadingCard');
    const contTarget = document.getElementById('continueReadingTarget');
    const contLink = document.getElementById('continueReadingLink');
    const recentList = document.getElementById('recentList');
    
    const lastRead = JSON.parse(localStorage.getItem('tb_last_read'));
    if (lastRead && contCard && contTarget && contLink) {
        contTarget.innerText = `${lastRead.bookTa} : அதிகாரம் ${lastRead.chapter}`;
        contLink.href = `chapter.html?book=${encodeURIComponent(lastRead.bookId)}&chapter=${lastRead.chapter}`;
        contCard.style.display = 'flex';
    }
    
    const history = JSON.parse(localStorage.getItem('tb_history')) || [];
    if (recentList) {
        if (history.length === 0) {
            recentList.innerHTML = '<li class="empty-text">வரலாறு இல்லை</li>';
        } else {
            recentList.innerHTML = history.slice(0, 3).map(h => `
                <li class="recent-item">
                    <a href="chapter.html?book=${encodeURIComponent(h.bookId)}&chapter=${h.chapter}">${h.bookTa} ${h.chapter}</a>
                    <span class="empty-text">${h.time}</span>
                </li>
            `).join('');
        }
    }
}

/**
 * Handle Progressive Web App installation prompt pipelines lifecycle mechanics
 */
function initPWA() {
    let deferredPrompt;
    const installBtn = document.getElementById('installAppBtn');
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) installBtn.style.display = 'inline-flex';
    });
    
    if (installBtn) {
        installBtn.addEventListener('click', () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    installBtn.style.display = 'none';
                }
                deferredPrompt = null;
            });
        });
    }
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
}