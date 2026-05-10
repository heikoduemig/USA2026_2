const CACHE_NAME = 'route66-after-dark-pro-v3-20260510';
const APP_SHELL = [
  './',
  './index.html?v=pro3',
  './styles.css?v=pro3',
  './app.js?v=pro3',
  './adultData.js?v=pro3',
  './manifest.webmanifest'
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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (SHOULD_NOT_CACHE(event.request)) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html?v=pro3')))
  );
});
