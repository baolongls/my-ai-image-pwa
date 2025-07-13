const CACHE_NAME = 'ai-image-generator-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    // Removed external CDN URLs from cache list due to CORS policy.
    // These resources will still be fetched directly from their CDNs when online.
    // 'https://cdn.tailwindcss.com',
    // 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    // 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    
    // Add your icon paths here
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/icon-maskable-192x192.png',
    '/icons/icon-maskable-512x512.png',
    
    // Add Firebase SDKs so they are cached for better offline capabilities
    // Note: If these also cause CORS issues, they might need to be removed as well,
    // or loaded from a self-hosted source if full offline capability is critical.
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore-compat.js'
];

// Install Service Worker and cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                // Only cache resources that are not blocked by CORS
                return cache.addAll(urlsToCache.filter(url => !url.startsWith('http') || url.includes(self.location.origin)));
            })
            .catch(error => {
                console.error('Failed to cache all URLs:', error);
            })
    );
});

// Serve resources from cache when possible
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    response => {
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();

                        // Only cache responses that are from the same origin or explicitly allowed
                        if (event.request.url.startsWith(self.location.origin) || urlsToCache.includes(event.request.url)) {
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        
                        return response;
                    }
                );
            })
            .catch(error => {
                console.error('Fetch failed:', error);
                // You might want to return a fallback page for offline users here
                // For example: return caches.match('/offline.html');
            })
    );
});

// Clear old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
