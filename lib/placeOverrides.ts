import type { Photo, Place } from '@/data/types';
import type { Locale } from '@/lib/i18n/config';
import { PUBLIC_BUCKET } from '@/lib/community';
import { publicUrl, selectRows, supabaseConfig } from '@/lib/supabase';

/** Texts of a built-in place that /admin can change, per language. */
export const OVERRIDE_FIELDS = [
  'name',
  'tagline',
  'description',
  'didYouKnow',
  'visitDuration',
  'bestTime',
  'history',
  'customs',
  'food',
] as const;
export type OverrideField = (typeof OVERRIDE_FIELDS)[number];
export type OverrideFields = Partial<Record<OverrideField, string>>;

export interface PlaceOverride {
  fr: OverrideFields;
  en: OverrideFields;
  photos: string[];
}

export const OVERRIDES_TAG = 'place-overrides';

/** The current value of each editable field of a place (already in the language of the place). */
export function fieldsOf(place: Place): Record<OverrideField, string> {
  return {
    name: place.name,
    tagline: place.tagline,
    description: place.description,
    didYouKnow: place.didYouKnow,
    visitDuration: place.visitDuration,
    bestTime: place.insights.bestTime,
    history: place.insights.history,
    customs: place.insights.customs,
    food: place.insights.food,
  };
}

/** Edited built-in places by id; nothing when Supabase is missing or unreachable, so the site always works. */
export async function loadPlaceOverrides(): Promise<Record<string, PlaceOverride>> {
  const cfg = supabaseConfig();
  if (!cfg) return {};
  try {
    const rows = await selectRows<{ place_id: string; fr: OverrideFields; en: OverrideFields; photos: string[] }>(
      cfg,
      'place_overrides',
      'select=place_id,fr,en,photos&limit=200',
      { revalidate: 3600, tags: [OVERRIDES_TAG] },
    );
    return Object.fromEntries(
      rows.map((r) => [r.place_id, { fr: r.fr ?? {}, en: r.en ?? {}, photos: r.photos ?? [] }]),
    );
  } catch {
    return {};
  }
}

export function applyOverrides(places: Place[], overrides: Record<string, PlaceOverride>, locale: Locale): Place[] {
  return places.map((p) => {
    const f = overrides[p.id]?.[locale];
    if (!f || Object.keys(f).length === 0) return p;
    return {
      ...p,
      name: f.name ?? p.name,
      tagline: f.tagline ?? p.tagline,
      description: f.description ?? p.description,
      didYouKnow: f.didYouKnow ?? p.didYouKnow,
      visitDuration: f.visitDuration ?? p.visitDuration,
      insights: {
        bestTime: f.bestTime ?? p.insights.bestTime,
        history: f.history ?? p.insights.history,
        customs: f.customs ?? p.insights.customs,
        food: f.food ?? p.insights.food,
      },
    };
  });
}

/** Photos added from /admin go first, before the ones found on Wikimedia. */
export function withOverridePhotos(
  photos: Record<string, Photo[]>,
  overrides: Record<string, PlaceOverride>,
  names: Record<string, string>,
): Record<string, Photo[]> {
  const cfg = supabaseConfig();
  if (!cfg) return photos;
  const out = { ...photos };
  for (const [id, o] of Object.entries(overrides)) {
    if (!o.photos.length) continue;
    const own: Photo[] = o.photos.map((path) => ({
      src: publicUrl(cfg, PUBLIC_BUCKET, path),
      title: names[id] ?? id,
      author: 'Tunisia Go',
      license: '',
      sourceUrl: '',
    }));
    out[id] = [...own, ...(out[id] ?? [])];
  }
  return out;
}
