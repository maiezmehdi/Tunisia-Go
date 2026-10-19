/* Tunisia Go service worker: keeps the app and saved road trips usable without network. */
const VERSION = 'v1';
const PAGES = `tg-pages-${VERSION}`;
const STATIC = `tg-static-${VERSION}`;
const SAVED_TILES = `tg-tiles-saved-${VERSION}`;
const RUNTIME_TILES = `tg-tiles-runtime-${VERSION}`;
const SAVED_PHOTOS = `tg-photos-${VERSION}`;
const RUNTIME_PHOTOS = `tg-photos-runtime-${VERSION}`;
const KNOWN = [PAGES, STATIC, SAVED_TILES, RUNTIME_TILES, SAVED_PHOTOS, RUNTIME_PHOTOS];
const RUNTIME_TILE_LIMIT = 800;

const OFFLINE_HTML = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tunisia Go · Hors-ligne</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FAF6F0;color:#1A1A1A;font-family:Georgia,serif;text-align:center;padding:24px}p{font-family:system-ui,sans-serif;color:#555;max-width:32ch;margin:12px auto 0;line-height:1.5}a{color:#1A1A1A}</style></head>
<body><main><h1 style="font-weight:400">Vous êtes hors-ligne</h1><p>Cette page n’a pas été enregistrée. Les road trips enregistrés hors-ligne restent disponibles depuis la <a href="/explore">carte</a>.</p></main></body></html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(['/', '/explore', '/pratique']).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('tg-') && !KNOWN.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

/** Network first for pages, so content stays fresh; the last copy is used offline. */
async function page(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
    ]);
    if (response.ok) cache.put(new URL(request.url).pathname, response.clone());
    return response;
  } catch {
    const path = new URL(request.url).pathname;
    return (
      (await cache.match(path)) ||
      (await cache.match(request, { ignoreSearch: true })) ||
      new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    );
  }
}

/**
 * Cross-origin images are fetched again in CORS mode: browsers count each opaque
 * (no-cors) response as several MB of storage, which would fill the quota fast.
 */
function corsFetch(request) {
  if (new URL(request.url).origin === self.location.origin || request.mode === 'cors') return fetch(request);
  return fetch(new Request(request.url, { mode: 'cors', credentials: 'omit' })).catch(() => fetch(request));
}

/** Cache first for files that never change at a given URL (hashed scripts, tiles, photos). */
async function cacheFirst(request, cacheName, limit) {
  const hit = await caches.match(request.url);
  if (hit) return hit;
  try {
    const response = await corsFetch(request);
    // CORS requests for tiles and photos come from "Save for offline use", which stores them itself.
    const savedByPage = request.mode === 'cors' && new URL(request.url).origin !== self.location.origin && limit !== undefined;
    if (!savedByPage && (response.ok || response.type === 'opaque')) {
      const cache = await caches.open(cacheName);
      await cache.put(request.url, response.clone());
      if (limit) trim(cacheName, limit);
    }
    return response;
  } catch {
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(page(request));
  } else if (url.origin === self.location.origin && url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC));
  } else if (url.hostname === 'basemaps.cartocdn.com') {
    event.respondWith(cacheFirst(request, RUNTIME_TILES, RUNTIME_TILE_LIMIT));
  } else if (url.hostname === 'upload.wikimedia.org') {
    event.respondWith(cacheFirst(request, RUNTIME_PHOTOS, 300));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, STATIC));
  } else if (url.origin === self.location.origin && /\.(png|svg|ico|webmanifest)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC));
  }
});
