/**
 * Tamil Bible Reader PWA - Core Application Engine (Multi-file JSON Version)
 * Optimized for 66 individual book JSON files inside the 'books/bible.json/' folder.
 */

// Global State management variables
let currentBookCacheData = null;

// Dynamic Path Builder Selector for individual files with GitHub Pages support
function getBookFilePath(bookId) {
    const matchedMeta = BIBLE_BOOKS_METADATA.find(b => b.id.toLowerCase() === bookId.toLowerCase());
    const exactFileName = matchedMeta ? matchedMeta.id : bookId;
    
    // இது தற்போதைய பிரவுசர் முகவரியை (எ.கா: https://umn-ministry.github.io/Bible/) துல்லியமாக எடுத்துக்கொள்ளும்
    const currentAbsoluteURL = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '');
    
    return `${currentAbsoluteURL}books/${exactFileName}.json`;
}

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

    if (menuBtn && navDrawer && scrim) {
        const toggleDrawer = () => {
            navDrawer.classList.toggle('open');
            scrim.style.display = navDrawer.classList.contains('open') ? 'block' : 'none';
        };
        menuBtn.addEventListener('click', toggleDrawer);
        scrim.addEventListener('click', toggleDrawer);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleThemePreference);
    }
}

/**
 * Fetch targeting a SINGLE book JSON safely on-demand
 */
async function fetchSingleBookJSON(bookId) {
    const path = getBookFilePath(bookId);
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`File not found: ${path}`);
        currentBookCacheData = await response.json();
        return currentBookCacheData;
    } catch (error) {
        console.error('Fatal data fetch sequence failure:', error);
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
    
    // Pick deterministic daily book out of 66
    const today = new Date();
    const daySeed = today.getDate() + today.getMonth() * 31 + today.getFullYear();
    
    const bookIndex = daySeed % BIBLE_BOOKS_METADATA.length;
    const selectedMetaBook = BIBLE_BOOKS_METADATA[bookIndex];
    
    const data = await fetchSingleBookJSON(selectedMetaBook.id);
    if (data) {
        // Handle both single object structure or root array element fallback gracefully
        const rootBook = data.book ? data.book[0] : (data[0] || data);
        const chapterIndex = daySeed % rootBook.chapter.length;
        const targetChap = rootBook.chapter[chapterIndex];
        const verseIndex = daySeed % targetChap.verse.length;
        const targetVerse = targetChap.verse[verseIndex];
        
        if (dailyText && dailyRef) {
            dailyText.textContent = targetVerse.verse;
            dailyRef.textContent = `— ${selectedMetaBook.ta} ${targetChap.chapter_number}:${targetVerse.verse_number}`;
        }
        
        if (readDailyBtn) {
            readDailyBtn.addEventListener('click', () => {
                window.location.href = `chapter.html?book=${selectedMetaBook.id}&chapter=${targetChap.chapter_number}`;
            });
        }
        
        if (shareDailyBtn) {
            shareDailyBtn.addEventListener('click', () => {
                const shareStr = `"${targetVerse.verse}" — ${selectedMetaBook.ta} ${targetChap.chapter_number}:${targetVerse.verse_number}`;
                navigator.share ? navigator.share({ text: shareStr }) : navigator.clipboard.writeText(shareStr);
            });
        }
    }

    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY));
    const lastReadTitle = document.getElementById('lastReadTitle');
    const resumeBtn = document.getElementById('resumeReadingBtn');
    
    if (history && lastReadTitle && resumeBtn) {
        const meta = BIBLE_BOOKS_METADATA.find(b => b.id.toLowerCase() === history.bookId.toLowerCase());
        lastReadTitle.textContent = `${meta ? meta.ta : history.bookId} : அதிகாரம் ${history.chapter}`;
        resumeBtn.style.display = 'inline-flex';
        resumeBtn.href = `chapter.html?book=${history.bookId}&chapter=${history.chapter}`;
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

    const handleTabSwitch = (activeTab, inactiveTab, showSection, hideSection) => {
        activeTab.classList.add('active');
        inactiveTab.classList.remove('active');
        showSection.classList.remove('hidden-section');
        hideSection.classList.add('hidden-section');
    };

    if (tabOT && tabNT) {
        tabOT.addEventListener('click', () => handleTabSwitch(tabOT, tabNT, otSection, ntSection));
        tabNT.addEventListener('click', () => handleTabSwitch(tabNT, tabOT, ntSection, otSection));
    }

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
}

function openChapterSelectionSheet(book) {
    const sheet = document.getElementById('chapterSheet');
    const sheetTitle = document.getElementById('sheetBookTitle');
    const grid = document.getElementById('sheetChaptersGrid');
    const closeBtn = document.getElementById('closeSheetBtn');
    const scrim = document.getElementById('sheetScrim');

    if (!sheet || !grid) return;

    sheetTitle.textContent = book.ta;
    grid.innerHTML = '';

    for (let c = 1; c <= book.chapters; c++) {
        const cell = document.createElement('button');
        cell.className = 'chapter-cell-btn';
        cell.textContent = c;
        cell.addEventListener('click', () => {
            window.location.href = `chapter.html?book=${book.id}&chapter=${c}`;
        });
        grid.appendChild(cell);
    }

    sheet.classList.add('sheet-visible');

    const closeSheet = () => sheet.classList.remove('sheet-visible');
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

    initChapterConfigOverlays();

    const data = await fetchSingleBookJSON(bookId);
    if (!data) return;

    const rootBook = data.book ? data.book[0] : (data[0] || data);
    const targetChapterPayload = rootBook.chapter.find(c => c.chapter_number === chapterNum);
    
    if (!targetChapterPayload) return;

    const metaBook = BIBLE_BOOKS_METADATA.find(b => b.id.toLowerCase() === bookId.toLowerCase());
    if (headerTitle) headerTitle.textContent = `${metaBook ? metaBook.ta : bookId} ${chapterNum}`;
    if (headerEnglish) headerEnglish.textContent = `${metaBook ? metaBook.id : bookId} Chapter ${chapterNum}`;

    if (loader) loader.style.display = 'none';
    if (renderGrid) {
        renderGrid.innerHTML = '';
        
        targetChapterPayload.verse.forEach((v) => {
            const rowNode = document.createElement('div');
            rowNode.className = 'verse-item tamil-text';
            rowNode.setAttribute('data-verse-number', v.verse_number);
            rowNode.innerHTML = `<span class="verse-num">${v.verse_number}</span><span class="verse-text-body">${v.verse}</span>`;
            
            rowNode.addEventListener('click', () => handleVerseSelectionToggle(rowNode, metaBook, chapterNum, { Verse: v.verse, VerseNumber: v.verse_number }));
            renderGrid.appendChild(rowNode);
        });
    }

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify({ bookId: metaBook.id, chapter: chapterNum, timestamp: Date.now() }));
    restoreScrollMemoryCoordinates(metaBook.id, chapterNum);
    setupPaginationFlowControls(metaBook.id, chapterNum);
}

function handleVerseSelectionToggle(rowNode, metaBook, chapterNum, verseObj) {
    const toast = document.getElementById('verseActionToast');
    const toastRef = document.getElementById('toastSelectionRef');
    const toastFavIcon = document.getElementById('toastFavIcon');
    
    rowNode.classList.toggle('selected');
    const verseKey = `${metaBook.id}_${chapterNum}_${verseObj.VerseNumber}`;

    if (rowNode.classList.contains('selected')) {
        selectedVersesSet.add({ key: verseKey, text: verseObj.Verse, num: verseObj.VerseNumber, refStr: `${metaBook.ta} ${chapterNum}:${verseObj.VerseNumber}` });
    } else {
        selectedVersesSet.forEach(item => { if (item.key === verseKey) selectedVersesSet.delete(item); });
    }

    if (selectedVersesSet.size > 0 && toast && toastRef) {
        toastRef.textContent = `${selectedVersesSet.size} வசனம் தேர்ந்தெடுக்கப்பட்டது`;
        toast.classList.add('toast-visible');
        
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
    if (toast) toast.classList.remove('toast-visible');
    document.querySelectorAll('.verse-item.selected').forEach(el => el.classList.remove('selected'));
    selectedVersesSet.clear();
}

function configureToastActionBindings(selectedArray) {
    document.getElementById('clearSelectionBtn').onclick = () => resetSelectionToastState();
    
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
                currentFavs.splice(existsIndex, 1);
            }
        });
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(currentFavs));
        resetSelectionToastState();
    };
}

function setupPaginationFlowControls(currentBookId, currentChapter) {
    const prevBtn = document.getElementById('prevChapterBtn');
    const nextBtn = document.getElementById('nextChapterBtn');
    const navBar = document.getElementById('paginationNav');
    
    if (!navBar || !prevBtn || !nextBtn) return;
    navBar.style.display = 'flex';

    const currentBookIndex = BIBLE_BOOKS_METADATA.findIndex(b => b.id.toLowerCase() === currentBookId.toLowerCase());
    const currentBookMeta = BIBLE_BOOKS_METADATA[currentBookIndex];

    // Previous Button
    if (currentChapter > 1) {
        prevBtn.onclick = () => window.location.href = `chapter.html?book=${currentBookMeta.id}&chapter=${currentChapter - 1}`;
    } else if (currentBookIndex > 0) {
        const prevBookMeta = BIBLE_BOOKS_METADATA[currentBookIndex - 1];
        prevBtn.onclick = () => window.location.href = `chapter.html?book=${prevBookMeta.id}&chapter=${prevBookMeta.chapters}`;
    } else {
        prevBtn.disabled = true;
    }

    // Next Button
    if (currentChapter < currentBookMeta.chapters) {
        nextBtn.onclick = () => window.location.href = `chapter.html?book=${currentBookMeta.id}&chapter=${currentChapter + 1}`;
    } else if (currentBookIndex < BIBLE_BOOKS_METADATA.length - 1) {
        const nextBookMeta = BIBLE_BOOKS_METADATA[currentBookIndex + 1];
        nextBtn.onclick = () => window.location.href = `chapter.html?book=${nextBookMeta.id}&chapter=1`;
    } else {
        nextBtn.disabled = true;
    }
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
        settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); panel.classList.toggle('panel-visible'); });
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
}

function restoreScrollMemoryCoordinates(bookId, chapterNum) {
    setTimeout(() => {
        const container = document.getElementById('versesContainer');
        const savedOffset = localStorage.getItem(`scroll_${bookId}_${chapterNum}`);
        if (container && savedOffset) container.scrollTop = parseInt(savedOffset, 10);
    }, 150);
}

/* ==========================================================================
   04. OFFLINE MULTI-FILE SEARCH ENGINE (On-Demand File Aggregator)
   ========================================================================== */
async function initSearchEngineView() {
    const searchInput = document.getElementById('bibleSearchInput');
    const bookSelect = document.getElementById('filterBookSelect');
    const resultsList = document.getElementById('searchResultsList');
    const summaryBar = document.getElementById('searchSummaryBar');
    const countText = document.getElementById('searchCountResultText');
    const emptyView = document.getElementById('searchEmptyView');
    const loader = document.getElementById('searchLoader');
    const clearBtn = document.getElementById('clearSearchBtn');

    BIBLE_BOOKS_METADATA.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = b.ta;
        if (bookSelect) bookSelect.appendChild(opt);
    });

    const executeSearchFiltering = async () => {
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
        let booksToSearch = targetBookFilter === 'ALL' 
            ? BIBLE_BOOKS_METADATA.map(b => b.id) 
            : [targetBookFilter];

        let matchedMatchesAccumulator = [];

        // Sequentially scan through targeted discrete JSON files
        for (const bId of booksToSearch) {
            const data = await fetchSingleBookJSON(bId);
            if (!data) continue;
            
            const rootBook = data.book ? data.book[0] : (data[0] || data);
            
            rootBook.chapter.forEach((cPayload) => {
                cPayload.verse.forEach((vPayload) => {
                    if (vPayload.verse.toLowerCase().includes(query)) {
                        matchedMatchesAccumulator.push({
                            bookId: rootBook.book_name,
                            chapter: cPayload.chapter_number,
                            verse: vPayload.verse_number,
                            text: vPayload.verse
                        });
                    }
                });
            });
        }

        loader.style.display = 'none';
        summaryBar.style.display = 'block';
        countText.textContent = `${matchedMatchesAccumulator.length} தேடல் முடிவுகள் கண்டறியப்பட்டுள்ளன.`;

        matchedMatchesAccumulator.forEach(m => {
            const row = document.createElement('div');
            row.className = 'card search-result-item animate-fade-in';
            const metaMeta = BIBLE_BOOKS_METADATA.find(b => b.id.toLowerCase() === m.bookId.toLowerCase());
            
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

    let debounceTimer;
    function triggerSearchPipeline() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(executeSearchFiltering, 400);
    }

    if (searchInput) searchInput.addEventListener('input', triggerSearchPipeline);
    if (bookSelect) bookSelect.addEventListener('change', triggerSearchPipeline);
    if (clearBtn) clearBtn.onclick = () => { searchInput.value = ''; triggerSearchPipeline(); };
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
                
                card.addEventListener('click', () => {
                    const token = f.key.split('_');
                    window.location.href = `chapter.html?book=${token[0]}&chapter=${token[1]}`;
                });

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
    const resetBtn = document.getElementById('resetApplicationDataBtn');

    if (themeSwitch) themeSwitch.addEventListener('change', toggleThemePreference);

    if (decFont && incFont && fontVal) {
        fontVal.textContent = `${getSavedFontSize()}px`;
        decFont.onclick = () => { adjustFontSizePreference(false); fontVal.textContent = `${getSavedFontSize()}px`; };
        incFont.onclick = () => { adjustFontSizePreference(true); fontVal.textContent = `${getSavedFontSize()}px`; };
    }

    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm('அனைத்து உள்ளூர் சேமிப்புத் தரவுகளையும் நீக்கப் போகிறீர்களா?')) {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        };
    }
}
