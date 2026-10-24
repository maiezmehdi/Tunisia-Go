import type { Locale } from '@/lib/i18n/config';

/** Shared between the form and the API route. The ids are what gets sent; labels are for display. */
export const SPOT_TYPES = [
  'cafe',
  'cove',
  'viewpoint',
  'restaurant',
  'craft',
  'hike',
  'camping',
  'cycling',
  'other',
] as const;
export type SpotType = (typeof SPOT_TYPES)[number];

export const SPOT_TYPE_LABELS: Record<Locale, Record<SpotType, string>> = {
  fr: {
    cafe: 'Café',
    cove: 'Crique ou plage',
    viewpoint: 'Point de vue',
    restaurant: 'Restaurant',
    craft: 'Artisan',
    hike: 'Randonnée',
    camping: 'Camping',
    cycling: 'Circuit vélo',
    other: 'Autre',
  },
  en: {
    cafe: 'Café',
    cove: 'Cove or beach',
    viewpoint: 'Viewpoint',
    restaurant: 'Restaurant',
    craft: 'Craftsperson',
    hike: 'Walk or hike',
    camping: 'Camping',
    cycling: 'Cycling route',
    other: 'Something else',
  },
};

/** Keywords a visitor can tick. Only these ids are accepted, so they stay clean enough to reuse for search engines. */
export const SPOT_TAGS = [
  'quiet',
  'sunset',
  'sea-view',
  'family',
  'shade',
  'free',
  'car-access',
  'off-the-beaten-path',
  'photogenic',
  'local-food',
  'history',
  'nature',
] as const;
export type SpotTag = (typeof SPOT_TAGS)[number];
export const MAX_TAGS = 6;

export const SPOT_TAG_LABELS: Record<Locale, Record<SpotTag, string>> = {
  fr: {
    quiet: 'Calme',
    sunset: 'Coucher de soleil',
    'sea-view': 'Vue sur la mer',
    family: 'En famille',
    shade: 'À l’ombre',
    free: 'Gratuit',
    'car-access': 'Accessible en voiture',
    'off-the-beaten-path': 'Hors des sentiers battus',
    photogenic: 'Photogénique',
    'local-food': 'Cuisine locale',
    history: 'Histoire',
    nature: 'Nature',
  },
  en: {
    quiet: 'Quiet',
    sunset: 'Sunset',
    'sea-view': 'Sea view',
    family: 'Family-friendly',
    shade: 'Shaded',
    free: 'Free',
    'car-access': 'Easy by car',
    'off-the-beaten-path': 'Off the beaten path',
    photogenic: 'Photogenic',
    'local-food': 'Local food',
    history: 'History',
    nature: 'Nature',
  },
};

/** Keeps known tag ids only, without duplicates. Accepts a list or a comma-separated string. */
export function cleanTags(input: unknown): SpotTag[] {
  const list = Array.isArray(input) ? input : typeof input === 'string' ? input.split(',') : [];
  const known = list
    .map((t) => String(t).trim())
    .filter((t): t is SpotTag => (SPOT_TAGS as readonly string[]).includes(t));
  return [...new Set(known)].slice(0, MAX_TAGS);
}

function isSpotType(value: string): value is SpotType {
  return (SPOT_TYPES as readonly string[]).includes(value);
}

/** Accepts an id, or a label in either language (older clients sent the French label). */
function toSpotType(value: string): SpotType {
  if (isSpotType(value)) return value;
  for (const labels of Object.values(SPOT_TYPE_LABELS)) {
    const hit = SPOT_TYPES.find((id) => labels[id].toLowerCase() === value.toLowerCase());
    if (hit) return hit;
  }
  return 'other';
}

export interface SecretSpot {
  name: string;
  type: string;
  area: string;
  location: string;
  why: string;
  bestTime: string;
  author: string;
  contact: string;
  tags: SpotTag[];
}

export const EMPTY_SPOT: SecretSpot = {
  name: '',
  type: SPOT_TYPES[0],
  area: '',
  location: '',
  why: '',
  bestTime: '',
  author: '',
  contact: '',
  tags: [],
};

const LIMITS: Record<Exclude<keyof SecretSpot, 'tags'>, number> = {
  name: 120,
  type: 40,
  area: 120,
  location: 300,
  why: 2000,
  bestTime: 200,
  author: 80,
  contact: 120,
};

/** Trims every field and checks the required ones. Returns null when the spot is not usable. */
export function cleanSpot(input: Partial<Record<keyof SecretSpot, unknown>>): SecretSpot | null {
  const spot = { ...EMPTY_SPOT };
  for (const key of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
    const v = input[key];
    spot[key] = typeof v === 'string' ? v.trim().slice(0, LIMITS[key]) : '';
  }
  spot.type = toSpotType(spot.type);
  spot.tags = cleanTags(input.tags);
  if (!spot.name || !spot.area || spot.why.length < 10) return null;
  return spot;
}

/** Plain-text version, used for the webhook message and the WhatsApp fallback. Always French: it goes to the team. */
export function spotAsText(spot: SecretSpot): string {
  return [
    `Nouveau lieu proposé : ${spot.name} (${SPOT_TYPE_LABELS.fr[toSpotType(spot.type)]})`,
    `Où : ${spot.area}${spot.location ? ` · ${spot.location}` : ''}`,
    `Pourquoi : ${spot.why}`,
    spot.bestTime && `Meilleur moment : ${spot.bestTime}`,
    spot.tags.length > 0 && `Mots-clés : ${spot.tags.map((t) => SPOT_TAG_LABELS.fr[t]).join(', ')}`,
    (spot.author || spot.contact) && `Proposé par : ${[spot.author, spot.contact].filter(Boolean).join(' · ')}`,
  ]
    .filter(Boolean)
    .join('\n');
}
