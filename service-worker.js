const CACHE_NAME = 'route66-after-dark-online-pwa-v2-20260512';
const APP_SHELL = [
  './',
  './index.html',
  './index.html?v=online2',
  './styles.css?v=online2',
  './app.js?v=online2',
  './adultData.js?v=online2',
  './manifest.webmanifest',
  './icons/icon-72.png', './icons/icon-96.png', './icons/icon-128.png', './icons/icon-144.png',
  './icons/icon-152.png', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-384.png', './icons/icon-512.png',
  './icons/maskable-192.png', './icons/maskable-512.png',
  './screenshots/screenshot-wide.png', './screenshots/screenshot-mobile.png'
];

const SHOULD_NOT_CACHE = request => {
  const url = new URL(request.url);
  return request.method !== 'GET'
    || url.hostname.includes('googleapis.com')
    || url.hostname.includes('gstatic.com')
    || url.hostname.includes('google.com')
    || url.hostname.includes('googleusercontent.com')
    || url.hostname.includes('unsplash.com')
    || url.protocol === 'chrome-extension:';
};

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (SHOULD_NOT_CACHE(event.request)) return;
  const request = event.request;
  event.respondWith(
    fetch(request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      return cached || caches.match('./index.html') || caches.match('./');
    })
  );
});
