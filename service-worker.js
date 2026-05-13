const CACHE_NAME = 'route66-after-dark-online-first-v6-20260513';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css?v=hybrid6',
  './app-offline.js?v=hybrid6',
  './adultData.js?v=hybrid6',
  './manifest.webmanifest'
];

function isGet(request) { return request.method === 'GET'; }
function isSameOrigin(request) { return new URL(request.url).origin === self.location.origin; }
function isNavigate(request) { return request.mode === 'navigate'; }

async function cachePut(request, response) {
  if (!response || !response.ok || !isSameOrigin(request)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    cachePut(request, response).catch(() => {});
    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (isNavigate(request)) return caches.match('./index.html');
    throw error;
  }
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(APP_SHELL.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (!isGet(request)) return;

  // External images, Google Maps, websites etc. are never cached/intercepted here.
  if (!isSameOrigin(request)) return;

  // Online first: only fall back to the cache when the network actually fails.
  event.respondWith(networkFirst(request));
});
