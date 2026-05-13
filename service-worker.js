const CACHE_NAME = 'route66-after-dark-hybrid-pwa-v4-online-first-20260513';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css?v=hybrid4',
  './app-offline.js?v=hybrid4',
  './adultData.js?v=hybrid4',
  './manifest.webmanifest',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './screenshots/screenshot-wide.png',
  './screenshots/screenshot-mobile.png'
];

function shouldSkip(request) {
  const url = new URL(request.url);
  return request.method !== 'GET' || url.protocol === 'chrome-extension:';
}

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

async function putInCache(request, response) {
  if (!response || !response.ok || !isSameOrigin(request)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    putInCache(request, response).catch(() => {});
    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match('./index.html');
    throw error;
  }
}

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
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (shouldSkip(event.request)) return;

  // Externe Bilder, Webseiten und Google-Maps-Links nicht über den Offline-Cache zwingen.
  // Sobald Internet da ist, lädt der Browser sie normal online.
  if (!isSameOrigin(event.request)) return;

  // Online immer frisch laden; nur bei fehlendem Empfang auf Cache/App-Shell zurückfallen.
  event.respondWith(networkFirst(event.request));
});
