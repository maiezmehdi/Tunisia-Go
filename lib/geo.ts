import type { LatLng } from '@/data/types';

const EARTH_RADIUS_KM = 6371;

/** Straight-line distance between two points, in km. */
export function haversineKm([lat1, lng1]: LatLng, [lat2, lng2]: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** Roads are rarely straight: scale crow-flies distance to an estimated road distance. */
const ROAD_FACTOR = 1.3;
/** Average speed mixing highways, national roads and desert tracks. */
const AVG_SPEED_KMH = 70;

export interface Leg {
  fromId: string;
  toId: string;
  km: number;
  minutes: number;
}

export interface RouteSummary {
  legs: Leg[];
  totalKm: number;
  totalMinutes: number;
}

export function summarizeRoute(stops: { id: string; coords: LatLng }[]): RouteSummary {
  const legs: Leg[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const km = haversineKm(stops[i].coords, stops[i + 1].coords) * ROAD_FACTOR;
    legs.push({
      fromId: stops[i].id,
      toId: stops[i + 1].id,
      km,
      minutes: (km / AVG_SPEED_KMH) * 60,
    });
  }
  return {
    legs,
    totalKm: legs.reduce((s, l) => s + l.km, 0),
    totalMinutes: legs.reduce((s, l) => s + l.minutes, 0),
  };
}

export function formatKm(km: number): string {
  return `${Math.round(km)} km`;
}

export function formatDuration(minutes: number): string {
  const m = Math.round(minutes / 5) * 5;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${rest} min`;
  return rest === 0 ? `${h} h` : `${h} h ${String(rest).padStart(2, '0')}`;
}
