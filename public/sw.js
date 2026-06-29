const CACHE = 'taller-gutierrez-v2';
const ASSETS = [
  '/',
  '/style.css',
  '/manifest.json',
  '/js/utils.js',
  '/js/api.js',
  '/js/router.js',
  '/js/ui.js',
  '/js/theme.js',
  '/js/animations.js',
  '/js/home.js',
  '/js/services.js',
  '/js/gallery.js',
  '/js/blog.js',
  '/js/faq.js',
  '/js/contact.js',
  '/js/booking.js',
  '/js/reviews.js',
  '/js/search.js',
  '/js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('chrome-extension') || event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
