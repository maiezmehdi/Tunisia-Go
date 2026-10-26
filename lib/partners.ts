/** Partners: hotels, guesthouses, car rentals and restaurants. Their listing is moderated, then shown in a "Partenaires" section. */
export const PARTNER_TYPES = [
  { id: 'hotel', fr: 'Hôtel', en: 'Hotel' },
  { id: 'guesthouse', fr: 'Maison d’hôtes', en: 'Guesthouse' },
  { id: 'car_rental', fr: 'Location de voiture', en: 'Car rental' },
  { id: 'restaurant', fr: 'Restaurant', en: 'Restaurant' },
] as const;

export type PartnerTypeId = (typeof PARTNER_TYPES)[number]['id'];

export const PARTNER_DESCRIPTION_MAX = 600;

export function cleanPartnerType(value: unknown): PartnerTypeId | null {
  return PARTNER_TYPES.find((t) => t.id === value)?.id ?? null;
}

/** An address starting with http(s)://, or a bare domain, kept as https. Anything else is dropped. */
export function normalizeWebsite(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  const url = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.hostname.includes('.')
      ? parsed.toString().slice(0, 200)
      : null;
  } catch {
    return null;
  }
}
