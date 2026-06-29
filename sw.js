/**
 * Tamil Bible Reader - Progressive Web Application (PWA) Offline Engine Core Service Worker
 * Implements high-speed cache performance mechanics and offline execution reliability fallback layers
 */

const CACHE_NAME_VERSIONED_KEY = 'tb-reader-v1.2.0';
const APPLICATION_ASSETS_CRITICAL_MANIFEST_LIST = [
  'index.html',
  'reader.html',
  'chapter.html',
  'search.html',
  'favorites.html',
  'settings.html',
  'about.html',
  'style.css',
  'app.js',
  'books.js',
  'settings.js',
  'manifest.json'
];

// Installation Lifecycle Event Event Pipeline Stage Hook Implementation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME_VERSIONED_KEY).then((cache) => {
      // Complete initial buffering fetch of all base layouts templates elements modules frameworks static packages files
      return cache.addAll(APPLICATION_ASSETS_CRITICAL_MANIFEST_LIST);
    }).then(() => self.skipWaiting())
  );
});

// Activation Engine Storage Cleansing Clean Lifecycle Transition Stage Strategy Logic Map Execution Pipeline
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNamesArray) => {
      return Promise.all(
        cacheNamesArray.map((cacheName) => {
          if (cacheName !== CACHE_NAME_VERSIONED_KEY) {
            // Safely invalidate deprecated legacy operational caches context targets data frames
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network Interception Proxy Optimization Pipeline Processing Routing Strategy Loop Frame Target Control Rule
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponseMatch) => {
      if (cachedResponseMatch) {
        return cachedResponseMatch;
      }
      
      // Dynamic network streaming lookup processing pipeline catch fallback structure engine
      return fetch(event.request).then((networkResponseInstance) => {
        if (!networkResponseInstance || networkResponseInstance.status !== 200 || networkResponseInstance.type !== 'basic') {
          return networkResponseInstance;
        }

        // Cache dynamically matched resources on-the-fly (e.g., dynamically accessed book JSON files)
        const responseCloneBufferSpace = networkResponseInstance.clone();
        caches.open(CACHE_NAME_VERSIONED_KEY).then((cache) => {
          cache.put(event.request, responseCloneBufferSpace);
        });

        return networkResponseInstance;
      }).catch(() => {
        // Safe execution recovery fallback points boundaries error handlers
      });
    })
  );
});