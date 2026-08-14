// TempMail Pro service worker — cache-first untuk shell + CDN
const CACHE = 'tempmail-v1';
const CDN = [
  'https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
  'https://fonts.gstatic.com',
];
const SHELL = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // jangan cache API pihak ketiga (guerrillamail) — selalu fresh
  if (url.hostname.includes('guerrillamail')) return;
  const isCDN = CDN.some(c => url.origin === new URL(c).origin);
  const isShell = SHELL.includes(url.pathname.replace(/\/$/, '') || './') || url.pathname.endsWith('index.html');
  if (isCDN || (isShell && e.request.method === 'GET')) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }))
    );
  }
});