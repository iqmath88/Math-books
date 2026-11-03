/* يحفظ ملفات التطبيق في الجهاز ليعمل بدون إنترنت. غيّر رقم الإصدار عند كل تحديث للمحتوى. */
const VERSION = 'math5-v2';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './ch3.html',
  './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png', './favicon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => e.request.mode === 'navigate' ? caches.match('./index.html') : undefined))
  );
});
