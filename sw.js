// TempMail Pro service worker
// - index.html: network-first (selalu fresh setelah deploy; cache = fallback offline)
// - CDN fonts/dompurify: cache-first
const CACHE = 'tempmail-v3';
const CDN = [
  'https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
  'https://fonts.gstatic.com',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './manifest.json', './icon.svg'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('guerrillamail')) return; // API selalu fresh
  const isCDN = CDN.some(c => url.origin === new URL(c).origin);
  const isHTML = e.request.mode === 'navigate' || url.pathname.endsWith('index.html');

  if (isCDN && e.request.method === 'GET') {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }))
    );
    return;
  }

  if (isHTML && e.request.method === 'GET') {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
  }
});