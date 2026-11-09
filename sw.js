/* Math-books offline engine. The version is defined only in app-version.js. */
importScripts('./app-version.js');
const {version, cachePrefix} = self.MATH_BOOKS_RELEASE;
const CACHE_NAME = cachePrefix + version;
const CORE = [
  './', './index.html', './manifest.webmanifest', './app-version.js',
  './classroom-v2.css', './classroom-v2.js', './practice.css', './practice.js',
  './ch3.html', './ch4.html', './ch5.html', './ch6.html',
  './g9c1.html', './g9c5.html', './g12c3.html',
  './v2/engine.css', './v2/engine.js', './v2/g12c3.html', './v2/g12c3.js',
  './v2/lib/fonts/plex-ar-400.woff2',
  './v2/lib/fonts/plex-ar-500.woff2',
  './v2/lib/fonts/plex-ar-700.woff2',
  './v2/lib/fonts/plex-lat-400.woff2',
  './v2/lib/fonts/plex-lat-500.woff2',
  './v2/lib/fonts/plex-lat-700.woff2',
  './v2/lib/katex/fonts/KaTeX_AMS-Regular.woff2',
  './v2/lib/katex/fonts/KaTeX_Caligraphic-Bold.woff2',
  './v2/lib/katex/fonts/KaTeX_Caligraphic-Regular.woff2',
  './v2/lib/katex/fonts/KaTeX_Fraktur-Bold.woff2',
  './v2/lib/katex/fonts/KaTeX_Fraktur-Regular.woff2',
  './v2/lib/katex/fonts/KaTeX_Main-Bold.woff2',
  './v2/lib/katex/fonts/KaTeX_Main-BoldItalic.woff2',
  './v2/lib/katex/fonts/KaTeX_Main-Italic.woff2',
  './v2/lib/katex/fonts/KaTeX_Main-Regular.woff2',
  './v2/lib/katex/fonts/KaTeX_Math-BoldItalic.woff2',
  './v2/lib/katex/fonts/KaTeX_Math-Italic.woff2',
  './v2/lib/katex/fonts/KaTeX_SansSerif-Bold.woff2',
  './v2/lib/katex/fonts/KaTeX_SansSerif-Italic.woff2',
  './v2/lib/katex/fonts/KaTeX_SansSerif-Regular.woff2',
  './v2/lib/katex/fonts/KaTeX_Script-Regular.woff2',
  './v2/lib/katex/fonts/KaTeX_Size1-Regular.woff2',
  './v2/lib/katex/fonts/KaTeX_Size2-Regular.woff2',
  './v2/lib/katex/fonts/KaTeX_Size3-Regular.woff2',
  './v2/lib/katex/fonts/KaTeX_Size4-Regular.woff2',
  './v2/lib/katex/fonts/KaTeX_Typewriter-Regular.woff2',
  './v2/lib/katex/katex.min.css',
  './v2/lib/katex/katex.min.js',
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
