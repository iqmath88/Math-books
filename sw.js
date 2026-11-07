/* Math-books offline engine. The version is defined only in app-version.js. */
importScripts('./app-version.js');
const {version, cachePrefix} = self.MATH_BOOKS_RELEASE;
const CACHE_NAME = cachePrefix + version;
const CORE = [
  './', './index.html', './manifest.webmanifest', './app-version.js',
  './classroom.css', './classroom.js', './classroom-enhancements.js',
  './board-v1.4.css', './board-v1.4.js',
  './guided-explanation.css', './guided-explanation.js',
  './teacher-tools-v1.6.css', './teacher-tools-v1.6.js',
  './board-v1.7.css', './board-v1.7.js',
  './board-v1.7.1.css', './board-v1.7.1.js',
  './board-v1.7.2.css', './board-v1.7.2.js',
  './board-v1.7.3.css', './board-v1.7.3.js',
  './ch3.html', './ch4.html', './ch5.html', './ch6.html',
  './g9c1.html', './g9c5.html',
  './icon-192.png', './icon-512.png', './maskable-512.png',
  './apple-touch-icon.png', './favicon.png'
];
const APP_ROOT = new URL('./', self.registration.scope);
const INDEX_URL = new URL('./index.html', APP_ROOT).href;
const CORE_URLS = new Set(CORE.map(path => new URL(path, APP_ROOT).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
  // Do not call skipWaiting: avoid switching versions mid-lesson.
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith(cachePrefix) && key !== CACHE_NAME)
          .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== APP_ROOT.origin || !url.pathname.startsWith(APP_ROOT.pathname)) return;

  // Never cache unknown paths or arbitrary query variations.
  const canonical = new URL(url.pathname, url.origin).href;
  if (!CORE_URLS.has(canonical)) return;

  if (req.mode === 'navigate') {
    // Prefer the latest page online, but preserve offline access.
    event.respondWith(
      fetch(req).then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(canonical, copy)));
        }
        return response;
      }).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(canonical)) || (await cache.match(INDEX_URL)) ||
          Response.error();
      })
    );
    return;
  }
  // Versioned static files are immutable within a release.
  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const hit = await cache.match(canonical);
      if (hit) return hit;
      try {
        const response = await fetch(req);
        if (response.ok) event.waitUntil(cache.put(canonical, response.clone()));
        return response;
      } catch (_) {
        return Response.error();
      }
    })
  );
});
