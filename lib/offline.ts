'use client';

import { PLACE_BY_ID } from '@/data/tunisiaData';
import type { Itinerary, Photo, Place } from '@/data/types';
import { isRetina, tileUrl, tilesForRoute } from '@/lib/tiles';

/** Cache names shared with public/sw.js. Keep them in sync. */
export const CACHES = {
  pages: 'tg-pages-v1',
  static: 'tg-static-v1',
  savedTiles: 'tg-tiles-saved-v1',
  photos: 'tg-photos-v1',
} as const;

const STORAGE_KEY = 'tg-offline-trips';

export interface SavedTrip {
  savedAt: string;
  /** Every URL stored for this trip, so it can be removed cleanly. */
  urls: string[];
  failed: number;
}

export function offlineSupported(): boolean {
  return typeof window !== 'undefined' && 'caches' in window && 'serviceWorker' in navigator;
}

export function readSavedTrips(): Record<string, SavedTrip> {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, SavedTrip>;
  } catch {
    return {};
  }
}

function writeSavedTrips(trips: Record<string, SavedTrip>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch {
    // Storage full or blocked: the files stay cached, only the list is lost.
  }
  window.dispatchEvent(new Event('tg-offline-trips'));
}

function stopsOf(itinerary: Itinerary): Place[] {
  return itinerary.stops.map((id) => PLACE_BY_ID[id]).filter((p): p is Place => !!p);
}

/** Rough download size, shown before saving. */
export function estimateTripMb(itinerary: Itinerary): number {
  const tiles = tilesForRoute(stopsOf(itinerary).map((p) => p.coords)).length;
  const perTileKb = isRetina() ? 32 : 14;
  return Math.max(1, Math.round((tiles * perTileKb + itinerary.stops.length * 4 * 180) / 1024));
}

/** Files the page already loaded (scripts, styles, fonts): needed to start the app offline. */
function loadedAssets(): string[] {
  return performance
    .getEntriesByType('resource')
    .map((e) => e.name)
    .filter((u) => u.includes('/_next/static/') || u.startsWith('https://fonts.g'));
}

async function store(cacheName: string, url: string): Promise<boolean> {
  try {
    const cache = await caches.open(cacheName);
    if (await cache.match(url)) return true;
    const sameOrigin = url.startsWith('/') || url.startsWith(window.location.origin);
    // Tiles, photos and fonts are served with CORS headers. CORS responses matter here:
    // browsers count each opaque (no-cors) response as several MB of storage.
    // A stalled request on a weak network must not freeze the whole download.
    const init: RequestInit = {
      mode: 'cors',
      credentials: sameOrigin ? 'same-origin' : 'omit',
      signal: AbortSignal.timeout(20000),
    };
    const res = await fetch(url, init).catch(() =>
      sameOrigin ? Promise.reject(new Error('offline')) : fetch(url, { ...init, mode: 'no-cors' }),
    );
    if (!res.ok && res.type !== 'opaque') return false;
    await cache.put(url, res);
    return true;
  } catch {
    return false;
  }
}

async function runPool<T>(items: T[], size: number, task: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) await task(items[next++]);
    }),
  );
}

/**
 * Downloads everything a road trip needs without network: the app itself,
 * map tiles along the route and the photos of every stop.
 */
export async function saveTripOffline(
  itinerary: Itinerary,
  photos: Record<string, Photo[]>,
  onProgress: (done: number, total: number) => void,
): Promise<SavedTrip> {
  const stops = stopsOf(itinerary);
  const retina = isRetina();
  const jobs: [cache: string, url: string][] = [
    [CACHES.pages, window.location.pathname],
    [CACHES.pages, '/pratique'],
    ...loadedAssets().map((u): [string, string] => [CACHES.static, u]),
    ...stops.flatMap((p) => (photos[p.id] ?? []).map((ph): [string, string] => [CACHES.photos, ph.src])),
    ...tilesForRoute(stops.map((p) => p.coords)).map(([z, x, y]): [string, string] => [
      CACHES.savedTiles,
      tileUrl(z, x, y, retina),
    ]),
  ];

  // Ask the browser not to evict the files under storage pressure.
  navigator.storage?.persist?.().catch(() => undefined);

  let done = 0;
  let failed = 0;
  onProgress(0, jobs.length);
  await runPool(jobs, 6, async ([cache, url]) => {
    if (!(await store(cache, url))) failed++;
    onProgress(++done, jobs.length);
  });

  const trip: SavedTrip = { savedAt: new Date().toISOString(), urls: jobs.map(([, u]) => u), failed };
  // A trip with many missing tiles would look saved but show a blank map in the desert.
  if (failed > jobs.length * 0.1) throw new Error(`${failed} of ${jobs.length} files could not be saved`);
  writeSavedTrips({ ...readSavedTrips(), [itinerary.id]: trip });
  return trip;
}

/** Removes a trip's tiles and photos, keeping files another saved trip still uses. */
export async function removeTripOffline(itineraryId: string) {
  const trips = readSavedTrips();
  const trip = trips[itineraryId];
  delete trips[itineraryId];
  writeSavedTrips(trips);
  if (!trip) return;
  const kept = new Set(Object.values(trips).flatMap((t) => t.urls));
  for (const name of [CACHES.savedTiles, CACHES.photos]) {
    const cache = await caches.open(name);
    await Promise.all(trip.urls.filter((u) => !kept.has(u)).map((u) => cache.delete(u)));
  }
}
