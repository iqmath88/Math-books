/* Math-books offline engine. The version is defined only in app-version.js. */
importScripts('./app-version.js');
const {version, cachePrefix} = self.MATH_BOOKS_RELEASE;
const CACHE_NAME = cachePrefix + version;
const CORE = [
  './', './index.html', './manifest.webmanifest', './app-version.js', './update.js',
  './classroom-v2.css', './classroom-v2.js', './practice.css', './practice.js',
  './ch3.html', './ch4.html', './ch5.html', './ch6.html',
  './g9c1.html', './g9c5.html', './g12c3.html',
  './v2__engine.css', './v2__engine.js', './v2__g12c3.html', './v2__g12c3.js', './v2__related-rates-motion.js', './v2__solids3d.js', './v2__g12c4.html', './v2__g12c4.js', './v2__g12c5.html', './v2__g12c5.js', './v2__g12c1.html', './v2__g12c1.js', './v2__g12c2.html', './v2__g12c2.js', './v2__g12c6.html', './v2__g12c6.js',
  './v2__ch3.html', './v2__ch3.js', './v2__ch4.html', './v2__ch4.js', './v2__ch5.html', './v2__ch5.js', './v2__ch6.html', './v2__ch6.js',
  './v2__g9c1.html', './v2__g9c1.js', './v2__g9c5.html', './v2__g9c5.js',
  /* chalkboard reels (the music is not precached: Safari plays media through range requests) */
  './v2__reels__player.html', './v2__reels__reels.css', './v2__reels__chalk.js', './v2__reels__cone.js', './v2__reels__ladder.js', './v2__reels__box.js', './v2__reels__steps.js',
  './v2__reels__covers__cone.jpg', './v2__reels__covers__ladder.jpg', './v2__reels__covers__box.jpg', './v2__reels__covers__steps.jpg',
  './v2__reels__fonts__ruqaa-ar-700.woff2', './v2__reels__fonts__ruqaa-ar-400.woff2', './v2__reels__fonts__caveat-700.woff2',
  './v2__reels__fonts__caveat-600.woff2', './v2__reels__fonts__marhey-500.woff2',
  './v2__lib__fonts__plex-ar-400.woff2',
  './v2__lib__fonts__plex-ar-500.woff2',
  './v2__lib__fonts__plex-ar-700.woff2',
  './v2__lib__fonts__plex-lat-400.woff2',
  './v2__lib__fonts__plex-lat-500.woff2',
  './v2__lib__fonts__plex-lat-700.woff2',
  './v2__lib__katex__fonts__KaTeX_AMS-Regular.woff2',
  './v2__lib__katex__fonts__KaTeX_Caligraphic-Bold.woff2',
  './v2__lib__katex__fonts__KaTeX_Caligraphic-Regular.woff2',
  './v2__lib__katex__fonts__KaTeX_Fraktur-Bold.woff2',
  './v2__lib__katex__fonts__KaTeX_Fraktur-Regular.woff2',
  './v2__lib__katex__fonts__KaTeX_Main-Bold.woff2',
  './v2__lib__katex__fonts__KaTeX_Main-BoldItalic.woff2',
  './v2__lib__katex__fonts__KaTeX_Main-Italic.woff2',
  './v2__lib__katex__fonts__KaTeX_Main-Regular.woff2',
  './v2__lib__katex__fonts__KaTeX_Math-BoldItalic.woff2',
  './v2__lib__katex__fonts__KaTeX_Math-Italic.woff2',
  './v2__lib__katex__fonts__KaTeX_SansSerif-Bold.woff2',
  './v2__lib__katex__fonts__KaTeX_SansSerif-Italic.woff2',
  './v2__lib__katex__fonts__KaTeX_SansSerif-Regular.woff2',
  './v2__lib__katex__fonts__KaTeX_Script-Regular.woff2',
  './v2__lib__katex__fonts__KaTeX_Size1-Regular.woff2',
  './v2__lib__katex__fonts__KaTeX_Size2-Regular.woff2',
  './v2__lib__katex__fonts__KaTeX_Size3-Regular.woff2',
  './v2__lib__katex__fonts__KaTeX_Size4-Regular.woff2',
  './v2__lib__katex__fonts__KaTeX_Typewriter-Regular.woff2',
  './v2__lib__katex__katex.min.css',
  './v2__lib__katex__katex.min.js',
  './icon-192.png', './icon-512.png', './maskable-512.png',
  './apple-touch-icon.png', './favicon.png'
];
const APP_ROOT = new URL('./', self.registration.scope);
const INDEX_URL = new URL('./index.html', APP_ROOT).href;
const CORE_URLS = new Set(CORE.map(path => new URL(path, APP_ROOT).href));

self.addEventListener('install', event => {
  // cache:'reload' bypasses the browser HTTP cache, so a new release never precaches stale copies.
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE.map(u => new Request(u, {cache: 'reload'})))));
  // Do not call skipWaiting: avoid switching versions mid-lesson.
});
self.addEventListener('message', event => {
  // The page asks for the new release only after the user pressed «حدّث الآن».
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
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
    // Pages come from the same release cache as their scripts, so a page and its JS never mix versions
    // (a newer page with older cached JS). A new release arrives through the update bar («حدّث الآن»).
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const hit = await cache.match(canonical);
        if (hit) return hit;
        try {
          const response = await fetch(req);
          if (response.ok) event.waitUntil(cache.put(canonical, response.clone()));
          return response;
        } catch (_) {
          return (await cache.match(INDEX_URL)) || Response.error();
        }
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
