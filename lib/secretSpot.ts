import type { Locale } from '@/lib/i18n/config';

/** Shared between the form and the API route. The ids are what gets sent; labels are for display. */
export const SPOT_TYPES = ['cafe', 'cove', 'viewpoint', 'restaurant', 'craft', 'hike', 'other'] as const;
export type SpotType = (typeof SPOT_TYPES)[number];

export const SPOT_TYPE_LABELS: Record<Locale, Record<SpotType, string>> = {
  fr: {
    cafe: 'Café',
    cove: 'Crique ou plage',
    viewpoint: 'Point de vue',
    restaurant: 'Restaurant',
    craft: 'Artisan',
    hike: 'Randonnée',
    other: 'Autre',
  },
  en: {
    cafe: 'Café',
    cove: 'Cove or beach',
    viewpoint: 'Viewpoint',
    restaurant: 'Restaurant',
    craft: 'Craftsperson',
    hike: 'Walk or hike',
    other: 'Something else',
  },
};

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
};

const LIMITS: Record<keyof SecretSpot, number> = {
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
  for (const key of Object.keys(LIMITS) as (keyof SecretSpot)[]) {
    const v = input[key];
    spot[key] = typeof v === 'string' ? v.trim().slice(0, LIMITS[key]) : '';
  }
  spot.type = toSpotType(spot.type);
  if (!spot.name || !spot.area || spot.why.length < 10) return null;
  return spot;
}

/** Plain-text version, used for the webhook message and the WhatsApp fallback. Always French: it goes to the team. */
export function spotAsText(spot: SecretSpot): string {
  return [
    `Nouveau spot secret : ${spot.name} (${SPOT_TYPE_LABELS.fr[toSpotType(spot.type)]})`,
    `Où : ${spot.area}${spot.location ? ` · ${spot.location}` : ''}`,
    `Pourquoi : ${spot.why}`,
    spot.bestTime && `Meilleur moment : ${spot.bestTime}`,
    (spot.author || spot.contact) && `Proposé par : ${[spot.author, spot.contact].filter(Boolean).join(' · ')}`,
  ]
    .filter(Boolean)
    .join('\n');
}
