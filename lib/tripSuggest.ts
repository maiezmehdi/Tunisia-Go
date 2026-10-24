import type { Itinerary } from '@/data/types';
import type { Locale } from '@/lib/i18n/config';
import { selectRows, supabaseConfig } from '@/lib/supabase';

export const TRIPS_TAG = 'community-trips';
export const MIN_STOPS = 2;
export const MAX_STOPS = 12;
export const MAX_DAYS = 30;

/** A row of public.trip_submissions. */
export interface TripRow {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  locale: string | null;
  name: string;
  description: string;
  days: number;
  stops: string[];
  author: string | null;
  contact: string | null;
  name_en: string | null;
  description_en: string | null;
  reviewed_at: string | null;
}

export interface TripSuggestion {
  name: string;
  description: string;
  days: number;
  stops: string[];
  author: string;
  contact: string;
}

const COMMUNITY_ID = /^c-[0-9a-f-]{36}$/i;

/** A place id is either a built-in one (known by the caller) or `c-<uuid>`. Real existence is checked on the server. */
export function isPlaceId(id: unknown, builtIn: ReadonlySet<string>): id is string {
  return typeof id === 'string' && (builtIn.has(id) || COMMUNITY_ID.test(id));
}

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Trims the fields and checks the required ones. Returns null when the trip is not usable. */
export function cleanTrip(input: Record<string, unknown>, builtIn: ReadonlySet<string>): TripSuggestion | null {
  const stops = Array.isArray(input.stops)
    ? [...new Set(input.stops.filter((s): s is string => isPlaceId(s, builtIn)))].slice(0, MAX_STOPS)
    : [];
  const days = Math.round(Number(input.days));
  const trip = {
    name: clip(input.name, 100),
    description: clip(input.description, 1500),
    days: Number.isFinite(days) ? Math.min(MAX_DAYS, Math.max(1, days)) : 3,
    stops,
    author: clip(input.author, 80),
    contact: clip(input.contact, 120),
  };
  if (!trip.name || trip.description.length < 10 || stops.length < MIN_STOPS) return null;
  return trip;
}

/** An approved suggestion as a road trip. Stops that no longer exist are dropped; fewer than two left: no trip. */
export function toItinerary(row: TripRow, locale: Locale, placeNames: Record<string, string>): Itinerary | null {
  const stops = row.stops.filter((id) => placeNames[id]);
  if (stops.length < MIN_STOPS) return null;
  const en = locale === 'en';
  return {
    id: `t-${row.id}`,
    name: (en && row.name_en?.trim()) || row.name,
    tagline: stops
      .slice(0, 3)
      .map((id) => placeNames[id])
      .join(' → '),
    description: (en && row.description_en?.trim()) || row.description,
    days: row.days,
    stops,
    community: { author: row.author?.trim() || null },
  };
}

/** Approved visitor trips. Returns nothing when Supabase is missing or unreachable, so the map always works. */
export async function loadCommunityTrips(locale: Locale, placeNames: Record<string, string>): Promise<Itinerary[]> {
  const cfg = supabaseConfig();
  if (!cfg) return [];
  try {
    const rows = await selectRows<TripRow>(
      cfg,
      'trip_submissions',
      'select=*&status=eq.approved&order=reviewed_at.desc&limit=100',
      { revalidate: 3600, tags: [TRIPS_TAG] },
    );
    return rows.map((r) => toItinerary(r, locale, placeNames)).filter((t): t is Itinerary => !!t);
  } catch (error) {
    console.error('trips: read', error);
    return [];
  }
}
