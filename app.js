/**
 * Tamil Bible Reader PWA - Core Application Engine
 * Handles dynamic data loading from a single unified JSON source, page routing,
 * asynchronous state updates, search orchestration, and persistent caching.
 */

// Global State management variables
let cachedBibleData = null;
const BIBLE_JSON_PATH = 'books/bible.json';

// Persistent LocalStorage keys for history tracking and indexing
const STORAGE_KEYS = {
    FAVORITES: 'bible_pwa_fav_list',
    HISTORY: 'bible_pwa_read_history',
    SCROLL_POS: 'bible_pwa_scroll_pos'
};

/**
 * Main application bootstrapping router loop executed upon DOM load.
 */
document.addEventListener('DOMContentLoaded', () => {
    initGlobalUIComponents();
    
    // Identify current active view segment context
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPath === 'index.html') {
        initDashboardView();
    } else if (currentPath === 'reader.html') {
        initReaderListView();
    } else if (currentPath === 'chapter.html') {
        initChapterPresentationView();
    } else if (currentPath === 'search.html') {
        initSearchEngineView();
    } else if (currentPath === 'favorites.html') {
        initFavoritesListView();
    } else if (currentPath === 'settings.html') {
        initSettingsControlView();
    }
});

/* ==========================================================================
   COMMON GLOBAL UI INITIALIZATION METHODS
   ========================================================================== */
function initGlobalUIComponents() {
    const menuBtn = document.getElementById('menuBtn');
    const navDrawer = document.getElementById('navDrawer');
    const scrim = document.getElementById('scrim');
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    // Drawer toggling mechanism bindings
    if (menuBtn && navDrawer && scrim) {
        const toggleDrawer = () => {
            navDrawer.classList.toggle('open');
            scrim.style.display = navDrawer.classList.contains('open') ? 'block' : 'none';
        };
        menuBtn.addEventListener('click', toggleDrawer);
        scrim.addEventListener('click', toggleDrawer);
    }

    // Theme toggle interaction listeners
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            toggleThemePreference();
        });
    }
}

/**
 * Singleton Pattern implementation wrapper for structural JSON payload isolation
 * Loads unified bible.json exactly once from cache or server network pipeline.
 */
async function fetchCompleteBibleJSON() {
    if (cachedBibleData) return cachedBibleData;
    try {
        const response = await fetch(BIBLE_JSON_PATH);
        if (!response.ok) throw new Error('Network error context processing failed.');
        cachedBibleData = await response.json();
        return cachedBibleData;
    } catch (error) {
        console.error('Fatal data initialization fault sequence:', error);
        return null;
    }
}

/* ==========================================================================
   01. DASHBOARD VIEW CONTROLLER LOGIC (index.html)
   ========================================================================== */
async function initDashboardView() {
    const dailyText = document.getElementById('dailyVerseText');
    const dailyRef = document.getElementById('dailyVerseRef');
    const readDailyBtn = document.getElementById('readDailyBtn');
    const shareDailyBtn = document.getElementById('shareDailyBtn');
    
    // 1. Generate Deterministic Pseudo-Random Daily Verse based on Date Stamp
    const data = await fetchCompleteBibleJSON();
    if (data && data.Book) {
        const today = new Date();
        const daySeed = today.getDate() + today.getMonth() * 31 + today.getFullYear();
        
        // Pick random indices safely constrained to structure limits
        const bookIndex = daySeed % data.Book.length;
        const targetBook = data.Book[bookIndex];
        const chapterIndex = daySeed % targetBook.Chapter.length;
        const targetChap = targetBook.Chapter[chapterIndex];
        const verseIndex = daySeed % targetChap.Verse.length;
        const targetVerse = targetChap.Verse[verseIndex];
        
        const metaBook = BIBLE_BOOKS_METADATA.find(b => b.id === targetBook.BookName);
        const displayBookName = metaBook ? metaBook.ta : targetBook.BookName;
        
        if (dailyText && dailyRef) {
            dailyText.textContent = targetVerse.Verse;
            dailyRef.textContent = `— ${displayBookName} ${targetChap.ChapterNumber}:${targetVerse.VerseNumber}`;
        }
        
        if (readDailyBtn) {
            readDailyBtn.addEventListener('click', () => {
                window.location.href = `chapter.html?book=${targetBook.BookName}&chapter=${targetChap.ChapterNumber}`;
            });
        }
        
        if (shareDailyBtn) {
            shareDailyBtn.addEventListener('click', () => {
                const shareStr = `"${targetVerse.Verse}" — ${displayBookName} ${targetChap.ChapterNumber}:${targetVerse.VerseNumber}`;
                navigator.share ? navigator.share({ text: shareStr }) : navigator.clipboard.writeText(shareStr);
            });
        }
    }

    // 2. Render History Blocks tracking elements
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY));
    const lastReadTitle = document.getElementById('lastReadTitle');
    const resumeBtn = document.getElementById('resumeReadingBtn');
    
    if (history && lastReadTitle && resumeBtn) {
        const meta = BIBLE_BOOKS_METADATA.find(b => b.id === history.bookId);
        lastReadTitle.textContent = `${meta ? meta.ta : history.bookId} : அதிகாரம் ${history.chapter}`;
        resumeBtn.style.display = 'inline-flex';
        resumeBtn.href = `chapter.html?book=${history.bookId}&chapter=${history.chapter}`;
    }
    
    // 3. Compute Reading Progress Metrics
    const progressBar = document.getElementById('readingProgressBar');
    const progressText = document.getElementById('readingProgressText');
    if (progressBar && progressText) {
        const totalBooks = 66;
        const readBooksCount = history ? 1 : 0; // Simple analytical estimation mockup
        const percentage = Math.round((readBooksCount / totalBooks) * 100);
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = history ? `சுமார் ${percentage}% வாசிக்கப்பட்டுள்ளது` : 'இன்னும் தொடங்கப்படவில்லை';
    }
}

/* ==========================================================================
   02. BOOKS CATALOG VIEW CONTROLLER LOGIC (reader.html)
   ========================================================================== */
function initReaderListView() {
    const otGrid = document.getElementById('otGrid');
    const ntGrid = document.getElementById('ntGrid');
    const tabOT = document.getElementById('tabOT');
    const tabNT = document.getElementById('tabNT');
    const otSection = document.getElementById('otSection');
    const ntSection = document.getElementById('ntSection');

    // Split segmentation navigation listener triggers
    const handleTabSwitch = (activeTab, inactiveTab, showSection, hideSection) => {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
        inactiveTab.classList.remove('active');
        inactiveTab.setAttribute('aria-selected', 'false');
        showSection.classList.remove('hidden-section');
        showSection.classList.add('active-section');
        hideSection.classList.add('hidden-section');
        hideSection.classList.remove('active-section');
    };

    if (tabOT && tabNT) {
        tabOT.addEventListener('click', () => handleTabSwitch(tabOT, tabNT, otSection, ntSection));
        tabNT.addEventListener('click', () => handleTabSwitch(tabNT, tabOT, ntSection, otSection));
    }

    // Build dynamic catalog UI card layout grid architecture
    BIBLE_BOOKS_METADATA.forEach((book) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'card menu-item asset-book-card animate-fade-in';
        itemCard.innerHTML = `
            <div class="book-card-meta">
                <h3 class="tamil-text font-weight-bold">${book.ta}</h3>
                <p class="meta-caption-text">${book.id} • ${book.chapters} அதிகாரங்கள்</p>
            </div>
        `;
        itemCard.addEventListener('click', () => openChapterSelectionSheet(book));

        if (book.testament === 'OT' && otGrid) otGrid.appendChild(itemCard);
        if (book.testament === 'NT' && ntGrid) ntGrid.appendChild(itemCard);
    });

    // Handle initial routing sync params from dashboard redirects
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('testament') === 'NT' && tabNT) {
        tabNT.click();
    }
}

/**
 * Displays overlay bottom modal layer targeting numerical structures cleanly.
 * @param {object} book - Selected book schema instance object variables
 */
function openChapterSelectionSheet(book) {
    const sheet = document.getElementById('chapterSheet');
    const sheetTitle = document.getElementById('sheetBookTitle');
    const grid = document.getElementById('sheetChaptersGrid');
    const closeBtn = document.getElementById('closeSheetBtn');
    const scrim = document.getElementById('sheetScrim');

    if (!sheet || !grid) return;

    sheetTitle.textContent = book.ta;
    grid.innerHTML = ''; // Reset grid contents completely

    for (let c = 1; c <= book.chapters; c++) {
        const cell = document.createElement('button');
        cell.className = 'chapter-cell-btn';
        cell.textContent = c;
        cell.ariaLabel = `Chapter ${c}`;
        cell.addEventListener('click', () => {
            window.location.href = `chapter.html?book=${book.id}&chapter=${c}`;
        });
        grid.appendChild(cell);
    }

    sheet.classList.add('sheet-visible');
    sheet.setAttribute('aria-hidden', 'false');

    const closeSheet = () => {
        sheet.classList.remove('sheet-visible');
        sheet.setAttribute('aria-hidden', 'true');
    };
    if (closeBtn) closeBtn.addEventListener('click', closeSheet);
    if (scrim) scrim.addEventListener('click', closeSheet);
}

/* ==========================================================================
   03. CHAPTER PRESENTATION DISPLAY LAYOUT CORE ENGINE (chapter.html)
   ========================================================================== */
let selectedVersesSet = new Set();

async function initChapterPresentationView() {
    const urlParams = new URLSearchParams(window.location.search);
    let bookId = urlParams.get('book') || 'Genesis';
    let chapterNum = parseInt(urlParams.get('chapter'), 10) || 1;

    const loader = document.getElementById('versesLoader');
    const renderGrid = document.getElementById('versesRenderGrid');
    const headerTitle = document.getElementById('chapterHeaderTitle');
    const headerEnglish = document.getElementById('chapterHeaderEnglish');
    const backBtn = document.getElementById('backBtn');

    if (backBtn) backBtn.addEventListener('click', () => window.location.href = 'reader.html');

    // Persistent LocalSettings configuration overlay actions binding hooks
    initChapterConfigOverlays();

    const data = await fetchCompleteBibleJSON();
    if (!data) return;

    // Use required bibleBooksData array mapping indexes matching configurations
    const bookIndex = data.Book.findIndex(b => b.BookName.toLowerCase() === bookId.toLowerCase());
    if (bookIndex === -1) {
        console.error('Target identifier mismatch context handling error logic failure.');
        return;
    }

    const matchedBookPayload = data.Book[bookIndex];
    const targetChapterPayload = matchedBookPayload.Chapter.find(c => c.ChapterNumber === chapterNum);
    
    if (!targetChapterPayload) return;

    const metaBook = BIBLE_BOOKS_METADATA.find(b => b.id.toLowerCase() === bookId.toLowerCase());
    if (headerTitle) headerTitle.textContent = `${metaBook ? metaBook.ta : bookId} ${chapterNum}`;
    if (headerEnglish) headerEnglish.textContent = `${bookId} Chapter ${chapterNum}`;

    if (loader) loader.style.display = 'none';
    if (renderGrid) {
        renderGrid.innerHTML = '';
        
        targetChapterPayload.Verse.forEach((v) => {
            const rowNode = document.createElement('div');
            rowNode.className = 'verse-item tamil-text';
            rowNode.setAttribute('data-verse-number', v.VerseNumber);
            rowNode.innerHTML = `<span class="verse-num">${v.VerseNumber}</span><span class="verse-text-body">${v.Verse}</span>`;
            
            // Add interaction selection contextual tracking modules
            rowNode.addEventListener('click', () => handleVerseSelectionToggle(rowNode, metaBook, chapterNum, v));
            renderGrid.appendChild(rowNode);
        });
    }

    // Capture reading tracking state configuration data
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify({ bookId, chapter: chapterNum, timestamp: Date.now() }));
    
    // Restore spatial tracking scroll coordinates offsets indexes
    restoreScrollMemoryCoordinates(bookId, chapterNum);
    setupPaginationFlowControls(bookIndex, chapterNum, data);
}

/**
 * Handle individual verse click logic for selection, copying, sharing, and favoriting.
 */
function handleVerseSelectionToggle(rowNode, metaBook, chapterNum, verseObj) {
    const toast = document.getElementById('verseActionToast');
    const toastRef = document.getElementById('toastSelectionRef');
    const toastFavIcon = document.getElementById('toastFavIcon');
    
    rowNode.classList.toggle('selected');
    const verseKey = `${metaBook.id}_${chapterNum}_${verseObj.VerseNumber}`;

    if (rowNode.classList.contains('selected')) {
        selectedVersesSet.add({ key: verseKey, text: verseObj.Verse, num: verseObj.VerseNumber, refStr: `${metaBook.ta} ${chapterNum}:${verseObj.VerseNumber}` });
    } else {
        // Linear structural matching optimization logic array removal operation
        selectedVersesSet.forEach(item => { if (item.key === verseKey) selectedVersesSet.delete(item); });
    }

    if (selectedVersesSet.size > 0 && toast && toastRef) {
        toastRef.textContent = `${selectedVersesSet.size} வசனம் தேர்ந்தெடுக்கப்பட்டது`;
        toast.classList.add('toast-visible');
        toast.setAttribute('aria-hidden', 'false');
        
        // Sync context state for favorite styling checks safely
        let favoritesList = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
        const singleSelection = Array.from(selectedVersesSet)[0];
        const isAlreadySaved = favoritesList.some(f => f.key === singleSelection.key);
        if (toastFavIcon) toastFavIcon.textContent = isAlreadySaved ? 'bookmark_filled' : 'bookmark';
        
        configureToastActionBindings(Array.from(selectedVersesSet));
    } else if (toast) {
        resetSelectionToastState();
    }
}

function resetSelectionToastState() {
    const toast = document.getElementById('verseActionToast');
    if (toast) {
        toast.classList.remove('toast-visible');
        toast.setAttribute('aria-hidden', 'true');
    }
    document.querySelectorAll('.verse-item.selected').forEach(el => el.classList.remove('selected'));
    selectedVersesSet.clear();
}

function configureToastActionBindings(selectedArray) {
    document.getElementById('clearSelectionBtn').onclick = () => resetSelectionToastState();
    
    // Bulk compilation string extraction format template engines
    const compiledText = selectedArray.map(v => `[${v.num}] ${v.text}`).join('\n');
    const compiledRef = selectedArray[0].refStr.split(':')[0] + ':' + selectedArray.map(v => v.num).join(',');

    document.getElementById('toastCopyBtn').onclick = () => {
        navigator.clipboard.writeText(`${compiledText}\n— ${compiledRef}`);
        resetSelectionToastState();
    };

    document.getElementById('toastShareBtn').onclick = () => {
        const payload = `${compiledText}\n— ${compiledRef}`;
        navigator.share ? navigator.share({ text: payload }) : navigator.clipboard.writeText(payload);
        resetSelectionToastState();
    };

    document.getElementById('toastFavBtn').onclick = () => {
        let currentFavs = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
        
        selectedArray.forEach(v => {
            const existsIndex = currentFavs.findIndex(f => f.key === v.key);
            if (existsIndex === -1) {
                currentFavs.push({ key: v.key, text: v.text, reference: v.refStr, added: Date.now() });
            } else {
                currentFavs.splice(existsIndex, 1); // Toggle inverse off state mapping
            }
        });
        
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(currentFavs));
        resetSelectionToastState();
    };
}

function initChapterConfigOverlays() {
    const settingsBtn = document.getElementById('textSettingsBtn');
    const panel = document.getElementById('textSettingsPanel');
    const decBtn = document.getElementById('decFontBtn');
    const incBtn = document.getElementById('incFontBtn');
    const fDisplay = document.getElementById('fontSizeDisplay');
    const modeVerse = document.getElementById('modeVerseBtn');
    const modePara = document.getElementById('modeParaBtn');

    if (settingsBtn && panel) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('panel-visible');
        });
        document.addEventListener('click', () => panel.classList.remove('panel-visible'));
        panel.addEventListener('click', (e) => e.stopPropagation());
    }

    if (decBtn && incBtn && fDisplay) {
        fDisplay.textContent = `${getSavedFontSize()}px`;
        decBtn.onclick = () => adjustFontSizePreference(false);
        incBtn.onclick = () => adjustFontSizePreference(true);
    }

    if (modeVerse && modePara) {
        const currentMode = localStorage.getItem('bible_pwa_reading_mode') || 'verse';
        if (currentMode === 'para') { modePara.classList.add('active'); modeVerse.classList.remove('active'); }
        
        modeVerse.onclick = () => { modeVerse.classList.add('active'); modePara.classList.remove('active'); setReadingModePreference('verse'); };
        modePara.onclick = () => { modePara.classList.add('active'); modeVerse.classList.remove('active'); setReadingModePreference('para'); };
    }

    // Scroll mapping layout configurations updates registration hook
    const container = document.getElementById('versesContainer');
    if (container) {
        container.addEventListener('scroll', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const key = `scroll_${urlParams.get('book') || 'Genesis'}_${urlParams.get('chapter') || 1}`;
            localStorage.setItem(key, container.scrollTop);
        });
    }
}

function restoreScrollMemoryCoordinates(bookId, chapterNum) {
    setTimeout(() => {
        const container = document.getElementById('versesContainer');
        const savedOffset = localStorage.getItem(`scroll_${bookId}_${chapterNum}`);
        if (container && savedOffset) {
            container.scrollTop = parseInt(savedOffset, 10);
        }
    }, 150);
}

function setupPaginationFlowControls(currentBookIndex, currentChapter, fullPayload) {
    const prevBtn = document.getElementById('prevChapterBtn');
    const nextBtn = document.getElementById('nextChapterBtn');
    const navBar = document.getElementById('paginationNav');
    
    if (!navBar || !prevBtn || !nextBtn) return;
    navBar.style.display = 'flex';

    const currentBookObj = fullPayload.Book[currentBookIndex];
    const totalChaptersInBook = currentBookObj.Chapter.length;

    // Previous Button Mapping Sequence Logic Loop
    if (currentChapter > 1) {
        prevBtn.onclick = () => window.location.href = `chapter.html?book=${currentBookObj.BookName}&chapter=${currentChapter - 1}`;
    } else if (currentBookIndex > 0) {
        const prevBookObj = fullPayload.Book[currentBookIndex - 1];
        const lastChapOfPrevBook = prevBookObj.Chapter.length;
        prevBtn.onclick = () => window.location.href = `chapter.html?book=${prevBookObj.BookName}&chapter=${lastChapOfPrevBook}`;
    } else {
        prevBtn.disabled = true;
    }

    // Next Button Mapping Sequence Logic Loop
    if (currentChapter < totalChaptersInBook) {
        nextBtn.onclick = () => window.location.href = `chapter.html?book=${currentBookObj.BookName}&chapter=${currentChapter + 1}`;
    } else if (currentBookIndex < fullPayload.Book.length - 1) {
        const nextBookObj = fullPayload.Book[currentBookIndex + 1];
        nextBtn.onclick = () => window.location.href = `chapter.html?book=${nextBookObj.BookName}&chapter=1`;
    } else {
        nextBtn.disabled = true;
    }
}

/* ==========================================================================
   04. OFFLINE FULL BIBLE SEARCH ENGINE INTERACTION (search.html)
   ========================================================================== */
async function initSearchEngineView() {
    const searchInput = document.getElementById('bibleSearchInput');
    const bookSelect = document.getElementById('filterBookSelect');
    const chapSelect = document.getElementById('filterChapterSelect');
    const resultsList = document.getElementById('searchResultsList');
    const summaryBar = document.getElementById('searchSummaryBar');
    const countText = document.getElementById('searchCountResultText');
    const emptyView = document.getElementById('searchEmptyView');
    const loader = document.getElementById('searchLoader');
    const clearBtn = document.getElementById('clearSearchBtn');

    // Load available configurations targeting selector fields instantly
    BIBLE_BOOKS_METADATA.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = b.ta;
        if (bookSelect) bookSelect.appendChild(opt);
    });

    if (bookSelect && chapSelect) {
        bookSelect.addEventListener('change', () => {
            const selectedVal = bookSelect.value;
            chapSelect.innerHTML = '<option value="ALL">அனைத்தும் (All)</option>';
            if (selectedVal === 'ALL') {
                chapSelect.disabled = true;
            } else {
                chapSelect.disabled = false;
                const match = BIBLE_BOOKS_METADATA.find(b => b.id === selectedVal);
                for (let i = 1; i <= match.chapters; i++) {
                    const o = document.createElement('option');
                    o.value = i;
                    o.textContent = `அதிகாரம் ${i}`;
                    chapSelect.appendChild(o);
                }
            }
            triggerSearchPipeline();
        });
        chapSelect.addEventListener('change', triggerSearchPipeline);
    }

    const data = await fetchCompleteBibleJSON();
    if (!data) return;

    const executeSearchFiltering = () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            resultsList.innerHTML = '';
            emptyView.style.display = 'flex';
            summaryBar.style.display = 'none';
            clearBtn.style.display = 'none';
            return;
        }

        clearBtn.style.display = 'block';
        emptyView.style.display = 'none';
        loader.style.display = 'flex';
        resultsList.innerHTML = '';

        const targetBookFilter = bookSelect.value;
        const targetChapFilter = chapSelect.value;
        let matchedMatchesAccumulator = [];

        data.Book.forEach((bPayload) => {
            if (targetBookFilter !== 'ALL' && bPayload.BookName !== targetBookFilter) return;
            
            bPayload.Chapter.forEach((cPayload) => {
                if (targetChapFilter !== 'ALL' && cPayload.ChapterNumber.toString() !== targetChapFilter) return;
                
                cPayload.Verse.forEach((vPayload) => {
                    if (vPayload.Verse.toLowerCase().includes(query)) {
                        matchedMatchesAccumulator.push({
                            bookId: bPayload.BookName,
                            chapter: cPayload.ChapterNumber,
                            verse: vPayload.VerseNumber,
                            text: vPayload.Verse
                        });
                    }
                });
            });
        });

        // Inject dynamic compilation list rows mapping elements layout references
        loader.style.display = 'none';
        summaryBar.style.display = 'block';
        countText.textContent = `${matchedMatchesAccumulator.length} தேடல் முடிவுகள் கண்டறியப்பட்டுள்ளன.`;

        matchedMatchesAccumulator.forEach(m => {
            const row = document.createElement('div');
            row.className = 'card search-result-item animate-fade-in';
            const metaMeta = BIBLE_BOOKS_METADATA.find(b => b.id === m.bookId);
            
            // Text highlighting regex mapping engine substitution
            const regex = new RegExp(`(${query})`, 'gi');
            const highlightedText = m.text.replace(regex, `<span class="highlight">$1</span>`);

            row.innerHTML = `
                <div class="result-header-meta">
                    <span class="verse-reference text-primary font-weight-bold">${metaMeta ? metaMeta.ta : m.bookId} ${m.chapter}:${m.verse}</span>
                </div>
                <p class="tamil-text search-body-text">${highlightedText}</p>
            `;
            row.addEventListener('click', () => {
                window.location.href = `chapter.html?book=${m.bookId}&chapter=${m.chapter}`;
            });
            resultsList.appendChild(row);
        });
    };

    // Debounce implementation wrappers orchestration for heavy text lookups
    let debounceTimer;
    function triggerSearchPipeline() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(executeSearchFiltering, 300);
    }

    if (searchInput) {
        searchInput.addEventListener('input', triggerSearchPipeline);
        clearBtn.onclick = () => { searchInput.value = ''; triggerSearchPipeline(); };
    }
}

/* ==========================================================================
   05. FAVORITES SYSTEM MANAGEMENT CONTROL (favorites.html)
   ========================================================================== */
function initFavoritesListView() {
    const listNode = document.getElementById('favoritesList');
    const emptyView = document.getElementById('favoritesEmptyView');
    const clearAllBtn = document.getElementById('clearAllFavsBtn');

    const renderFavoritesPipeline = () => {
        const currentFavs = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
        if (currentFavs.length === 0) {
            if (listNode) listNode.innerHTML = '';
            if (emptyView) emptyView.style.display = 'flex';
            if (clearAllBtn) clearAllBtn.style.display = 'none';
            return;
        }

        if (emptyView) emptyView.style.display = 'none';
        if (clearAllBtn) clearAllBtn.style.display = 'block';
        if (listNode) {
            listNode.innerHTML = '';
            currentFavs.forEach(f => {
                const card = document.createElement('div');
                card.className = 'card favorite-row-node animate-fade-in';
                card.innerHTML = `
                    <div class="card-header justify-space-between">
                        <span class="verse-reference text-secondary font-weight-bold">${f.reference}</span>
                        <button class="icon-button mini-delete-btn" aria-label="Remove Favorite">
                            <span class="material-symbols-outlined text-error">delete</span>
                        </button>
                    </div>
                    <div class="card-body">
                        <p class="tamil-text field-body-preview">${f.text}</p>
                    </div>
                `;
                
                // Clicking target content jumps straight to contextual location coordinates
                card.addEventListener('click', (e) => {
                    const token = f.key.split('_');
                    window.location.href = `chapter.html?book=${token[0]}&chapter=${token[1]}`;
                });

                // Trapping context bubble processing execution loops on buttons structural rows
                card.querySelector('.mini-delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
                    list = list.filter(item => item.key !== f.key);
                    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
                    renderFavoritesPipeline();
                });

                listNode.appendChild(card);
            });
        }
    };

    if (clearAllBtn) {
        clearAllBtn.onclick = () => {
            if (confirm('சேமிக்கப்பட்ட அனைத்து வசனங்களையும் நீக்கலாமா?')) {
                localStorage.removeItem(STORAGE_KEYS.FAVORITES);
                renderFavoritesPipeline();
            }
        };
    }

    renderFavoritesPipeline();
}

/* ==========================================================================
   06. CONFIGURATION MANAGER DASHBOARD HANDLERS (settings.html)
   ========================================================================== */
function initSettingsControlView() {
    const themeSwitch = document.getElementById('settingsThemeSwitch');
    const decFont = document.getElementById('settingsDecFontBtn');
    const incFont = document.getElementById('settingsIncFontBtn');
    const fontVal = document.getElementById('settingsFontSizeVal');
    const modeVerse = document.getElementById('settingsModeVerseBtn');
    const modePara = document.getElementById('settingsModeParaBtn');
    const resetBtn = document.getElementById('resetApplicationDataBtn');

    if (themeSwitch) {
        themeSwitch.addEventListener('change', () => toggleThemePreference());
    }

    if (decFont && incFont && fontVal) {
        fontVal.textContent = `${getSavedFontSize()}px`;
        decFont.onclick = () => { adjustFontSizePreference(false); fontVal.textContent = `${getSavedFontSize()}px`; };
        incFont.onclick = () => { adjustFontSizePreference(true); fontVal.textContent = `${getSavedFontSize()}px`; };
    }

    if (modeVerse && modePara) {
        const m = localStorage.getItem('bible_pwa_reading_mode') || 'verse';
        if (m === 'para') { modePara.classList.add('active'); modeVerse.classList.remove('active'); }
        
        modeVerse.onclick = () => { modeVerse.classList.add('active'); modePara.classList.remove('active'); setReadingModePreference('verse'); };
        modePara.onclick = () => { modePara.classList.add('active'); modeVerse.classList.remove('active'); setReadingModePreference('para'); };
    }

    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm('பயன்பாட்டின் அனைத்து உள்ளூர் சேமிப்புத் தரவுகளையும் நீக்கப் போகிறீர்களா? இந்த செயல்முறையை மாற்றியமைக்க முடியாது.')) {
                localStorage.clear();
                alert('தரவுகள் வெற்றிகரமாக அழிக்கப்பட்டன. செயலி மீண்டும் துவக்கப்படும்.');
                window.location.href = 'index.html';
            }
        };
    }
}
