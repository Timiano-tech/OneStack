// Basic service worker for offline asset caching
const CACHE_NAME = 'onestack-cache-v1';
const ASSETS = [
  '/',
  '/manifest.json',
  '/OneStack (1).png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
