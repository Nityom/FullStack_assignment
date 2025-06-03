const CACHE_NAME = 'task-manager-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/App.css',
  '/src/index.css',
  'http://localhost:3000/api/tasks'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream that can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }            // Clone the response because it's a stream that can only be consumed once
            const responseToCache = response.clone();

            // Only cache valid schemes (http or https) to avoid chrome-extension error
            const url = new URL(event.request.url);
            if (url.protocol === 'http:' || url.protocol === 'https:') {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                })
                .catch((err) => {
                  console.warn('Cache put error:', err);
                });
            }

            return response;
          })
          .catch(() => {
            // If fetch fails, return the offline page from cache
            return caches.match('/');
          });
      })
  );
});

// Clean up old caches when a new service worker becomes active
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});