const CACHE_NAME = 'retailgen-cache-v1';
const STATIC_ASSETS = [
    '/fonts/inter-var.woff2',
    '/logo.png',
    '/favicon.ico',
    '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, then cache for API; cache first for static
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // API requests: Network first, fall back to cache
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone response to cache it
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Static assets: Cache first, fall back to network
    if (
        STATIC_ASSETS.includes(url.pathname) ||
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2)$/)
    ) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((response) => {
                    // Don't cache partial responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                });
            })
        );
        return;
    }

    // Default: Network only
    event.respondWith(fetch(event.request));
});
