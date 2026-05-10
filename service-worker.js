const CACHE_NAME = 'route66-adult-nightlife-v1';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './adultData.js'];

const SHOULD_NOT_CACHE = request => {
  const url = new URL(request.url);
  return request.method !== 'GET'
    || url.hostname.includes('googleapis.com')
    || url.hostname.includes('gstatic.com')
    || url.hostname.includes('google.com')
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
  event.respondWith(caches.match(event.request).then(cached => {
    const fetchPromise = fetch(event.request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
      }
      return response;
    }).catch(() => cached || caches.match('./index.html'));
    return cached || fetchPromise;
  }));
});
