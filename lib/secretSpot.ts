/** Shared between the form and the API route. */
export const SPOT_TYPES = ['Café', 'Crique ou plage', 'Point de vue', 'Restaurant', 'Artisan', 'Randonnée', 'Autre'] as const;

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
  if (!spot.name || !spot.area || spot.why.length < 10) return null;
  return spot;
}

/** Plain-text version, used for the webhook message and the WhatsApp fallback. */
export function spotAsText(spot: SecretSpot): string {
  return [
    `Nouveau spot secret : ${spot.name} (${spot.type})`,
    `Où : ${spot.area}${spot.location ? ` · ${spot.location}` : ''}`,
    `Pourquoi : ${spot.why}`,
    spot.bestTime && `Meilleur moment : ${spot.bestTime}`,
    (spot.author || spot.contact) && `Proposé par : ${[spot.author, spot.contact].filter(Boolean).join(' · ')}`,
  ]
    .filter(Boolean)
    .join('\n');
}
