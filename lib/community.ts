import type { CategoryId, Photo, Place } from '@/data/types';
import type { Locale } from '@/lib/i18n/config';
import { SPOT_TYPE_LABELS, SPOT_TYPES, type SpotType } from '@/lib/secretSpot';
import { publicUrl, selectRows, supabaseConfig } from '@/lib/supabase';

/** A row of public.spot_submissions. */
export interface SubmissionRow {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  locale: string | null;
  name: string;
  type: string | null;
  area: string;
  location: string | null;
  why: string;
  best_time: string | null;
  author: string | null;
  contact: string | null;
  photos: string[];
  lat: number | null;
  lng: number | null;
  category: string | null;
  reviewed_at: string | null;
  public_photos: string[];
}

export const PRIVATE_BUCKET = 'spot-photos';
export const PUBLIC_BUCKET = 'community-photos';
/** Cache tag of the approved places; the moderation page clears it on every change. */
export const COMMUNITY_TAG = 'community-places';

const CATEGORY_IDS: CategoryId[] = ['heritage', 'sahara', 'beach', 'culture', 'culinary', 'souk', 'camping', 'cycling'];

export function isCategory(value: unknown): value is CategoryId {
  return typeof value === 'string' && (CATEGORY_IDS as string[]).includes(value);
}

/** A sensible map category for each kind of suggestion; the moderator can change it. */
export function defaultCategory(type: string | null): CategoryId {
  const map: Record<SpotType, CategoryId> = {
    cafe: 'culinary',
    restaurant: 'culinary',
    cove: 'beach',
    viewpoint: 'sahara',
    hike: 'sahara',
    camping: 'camping',
    cycling: 'cycling',
    craft: 'culture',
    other: 'culture',
  };
  return map[(type ?? 'other') as SpotType] ?? 'culture';
}

/** Tunisia, with a margin. */
export function inTunisia(lat: number, lng: number): boolean {
  return lat > 29 && lat < 38.5 && lng > 7 && lng < 12.5;
}

/**
 * Finds coordinates in what the visitor typed: "36.87, 10.34", a Google Maps link
 * (…/@36.87,10.34,15z or ?q=36.87,10.34) or an OpenStreetMap link (#map=15/36.87/10.34).
 */
export function parseCoords(text: string | null): [number, number] | null {
  if (!text) return null;
  const patterns = [
    /@(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/,
    /[?&](?:q|query|ll)=(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/,
    /map=\d+\/(-?\d{1,2}\.\d+)\/(-?\d{1,3}\.\d+)/,
    /(-?\d{1,2}\.\d{2,})\s*[,; ]\s*(-?\d{1,3}\.\d{2,})/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (inTunisia(lat, lng)) return [lat, lng];
    }
  }
  return null;
}

function typeLabel(type: string | null, locale: Locale): string {
  const id = (SPOT_TYPES as readonly string[]).includes(type ?? '') ? (type as SpotType) : 'other';
  return SPOT_TYPE_LABELS[locale][id];
}

/** Turns an approved suggestion into a place the map, the list and the place sheet understand. */
export function toPlace(row: SubmissionRow, locale: Locale): Place {
  const label = typeLabel(row.type, locale);
  return {
    id: `c-${row.id}`,
    name: row.name,
    region: row.area,
    stayQuery: row.area,
    category: isCategory(row.category) ? row.category : defaultCategory(row.type),
    coords: [row.lat ?? 0, row.lng ?? 0],
    tagline: row.best_time ? `${label} · ${row.best_time}` : label,
    description: row.why,
    didYouKnow: '',
    insights: { history: '', customs: '', food: '', bestTime: row.best_time ?? '' },
    visitDuration: '',
    images: [{ caption: row.name }],
    contact: {},
    community: { author: row.author?.trim() || null },
  };
}

/**
 * Approved suggestions with coordinates, plus their public photos. Returns nothing when
 * Supabase is not configured or unreachable, so the map always works.
 */
export async function loadCommunityPlaces(
  locale: Locale,
): Promise<{ places: Place[]; photos: Record<string, Photo[]> }> {
  const cfg = supabaseConfig();
  if (!cfg) return { places: [], photos: {} };
  try {
    const rows = await selectRows<SubmissionRow>(
      cfg,
      'spot_submissions',
      'select=*&status=eq.approved&lat=not.is.null&lng=not.is.null&order=reviewed_at.desc&limit=500',
      { revalidate: 3600, tags: [COMMUNITY_TAG] },
    );
    const places = rows.map((r) => toPlace(r, locale));
    const photos: Record<string, Photo[]> = {};
    for (const r of rows) {
      if (!r.public_photos?.length) continue;
      photos[`c-${r.id}`] = r.public_photos.map((path) => ({
        src: publicUrl(cfg, PUBLIC_BUCKET, path),
        title: r.name,
        author: r.author?.trim() || 'Tunisia Go',
        license: '',
        sourceUrl: '',
      }));
    }
    return { places, photos };
  } catch (err) {
    console.error('community places', err);
    return { places: [], photos: {} };
  }
}
