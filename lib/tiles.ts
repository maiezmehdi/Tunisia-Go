import type { LatLng } from '@/data/types';

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY ?? '';

/** CARTO "Positron": a quiet, light basemap. The key removes the "API key required" watermark. */
export const TILE_URL = `https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png${
  CARTO_KEY ? `?key=${encodeURIComponent(CARTO_KEY)}` : ''
}`;

/** Same rule Leaflet uses to pick @2x tiles, so saved tiles match what the map asks for. */
export function isRetina(): boolean {
  return typeof window !== 'undefined' && (window.devicePixelRatio || 1) > 1;
}

export function tileUrl(z: number, x: number, y: number, retina: boolean): string {
  return TILE_URL.replace('{z}', String(z))
    .replace('{x}', String(x))
    .replace('{y}', String(y))
    .replace('{r}', retina ? '@2x' : '');
}

export function lngToTileX(lng: number, z: number): number {
  return Math.floor(((lng + 180) / 360) * 2 ** z);
}

export function latToTileY(lat: number, z: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z);
}

type Tile = [z: number, x: number, y: number];

function addBlock(set: Set<string>, z: number, cx: number, cy: number, radius: number) {
  for (let dx = -radius; dx <= radius; dx++) for (let dy = -radius; dy <= radius; dy++) set.add(`${z}/${cx + dx}/${cy + dy}`);
}

/**
 * Tiles needed to use a road trip without network:
 * - the whole area at zooms 5 to 9,
 * - a corridor along each leg at zooms 10 to 12,
 * - the surroundings of each stop at zooms 13 and 14.
 */
export function tilesForRoute(stops: LatLng[]): Tile[] {
  if (stops.length === 0) return [];
  const set = new Set<string>();
  const lats = stops.map((s) => s[0]);
  const lngs = stops.map((s) => s[1]);
  const pad = 0.6;
  const [south, north] = [Math.min(...lats) - pad, Math.max(...lats) + pad];
  const [west, east] = [Math.min(...lngs) - pad, Math.max(...lngs) + pad];

  for (let z = 5; z <= 9; z++) {
    for (let x = lngToTileX(west, z); x <= lngToTileX(east, z); x++)
      for (let y = latToTileY(north, z); y <= latToTileY(south, z); y++) set.add(`${z}/${x}/${y}`);
  }

  for (let z = 10; z <= 12; z++) {
    for (let i = 0; i < stops.length; i++) {
      const a = stops[i];
      const b = stops[i + 1] ?? a;
      const ax = lngToTileX(a[1], z);
      const ay = latToTileY(a[0], z);
      const bx = lngToTileX(b[1], z);
      const by = latToTileY(b[0], z);
      const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1) * 2;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const lat = a[0] + (b[0] - a[0]) * t;
        const lng = a[1] + (b[1] - a[1]) * t;
        addBlock(set, z, lngToTileX(lng, z), latToTileY(lat, z), 1);
      }
    }
  }

  for (const z of [13, 14]) {
    for (const [lat, lng] of stops) addBlock(set, z, lngToTileX(lng, z), latToTileY(lat, z), 2);
  }

  return [...set].map((k) => k.split('/').map(Number) as Tile);
}
