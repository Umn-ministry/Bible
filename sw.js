/**
 * Tamil Bible Reader PWA - Service Worker Engine (Cache-First Strategy)
 * Synchronizes offline access for static structural documents and the main JSON payload.
 */

const CACHE_NAME = 'tamil-bible-pwa-v1';

// Comprehensive listing of application assets required for standalone offline rendering
const OFFLINE_ASSETS = [
    './',
    './index.html',
    './reader.html',
    './chapter.html',
    './search.html',
    './favorites.html',
    './settings.html',
    './css/style.css',
    './js/books.js',
    './js/settings.js',
    './js/app.js',
    './manifest.json',
    './books/bible.json',
    './icons/icon-192.png',
    './icons/icon-192-maskable.png',
    './icons/icon-512.png',
    './icons/icon-512-maskable.png'
];

/**
 * Installation Event - Pre-caches all essential user-interface shells and data payloads.
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Offline assets compilation caching initialized successfully.');
                return cache.addAll(OFFLINE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

/**
 * Activation Event - Performs clean-up operations removing stale data cache frameworks.
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Purging legacy service worker cache stream index:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

/**
 * Intercepted Fetch Engine Pipeline - Implements high-performance Cache-First strategy
 * optimized specifically for instantly serving heavy immutable localized translation assets.
 */
self.addEventListener('fetch', (event) => {
    // Restrict processing parameters exclusively to native GET data channels
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Trigger asynchronous background service revalidation network check
                    fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
                        }
                    }).catch(() => { /* Swallowing offline network capture baseline errors cleanly */ });
                    
                    return cachedResponse;
                }

                // Fallback architecture pipeline path routines
                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    
                    return networkResponse;
                });
            })
    );
});
