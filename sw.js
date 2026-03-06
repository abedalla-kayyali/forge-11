// FORGE Gym Tracker — Service Worker
// Bump version to force cache refresh after updates
const CACHE_NAME = 'forge-v2';

const CORE_ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon.svg'
];

// ── INSTALL: pre-cache core files ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[FORGE SW] Caching core assets');
      // Use addAll but don't fail if optional assets are missing
      return Promise.allSettled(CORE_ASSETS.map(url => cache.add(url)));
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: clean up old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[FORGE SW] Removing old cache:', k);
          return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: cache-first for same-origin, network-only for CDN ──
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Always fetch from network for external CDN resources (Chart.js, Google Fonts)
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // CDN unavailable offline — fail gracefully (charts won't show, fonts will fallback)
        return new Response('', { status: 503 });
      })
    );
    return;
  }

  // For same-origin files: cache-first strategy
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // If fetch fails and nothing in cache, return a minimal offline shell
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
