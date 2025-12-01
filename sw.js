
const CACHE_NAME = 'mindreel-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // In a real build, this would be the bundled JS
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Stale-while-revalidate strategy for better offline experience
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
