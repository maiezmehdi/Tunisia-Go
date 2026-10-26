import { PLACE_BY_ID } from '@/data/tunisiaData';
import { publicUrl, selectRows, supabaseConfig, type SupabaseConfig } from '@/lib/supabase';

export const PROS_TAG = 'pros';

export type ProKind = 'guide' | 'agency';

export const PRO_PHOTO_BUCKET = 'pro-photos';
export const BIO_MAX = 600;
export const EXPERIENCE_MAX = 400;
export const PRICE_MAX = 120;

/** Languages a guide or agency can tick, with their names in both site languages. */
export const PRO_LANGUAGES = [
  { id: 'fr', fr: 'Français', en: 'French' },
  { id: 'en', fr: 'Anglais', en: 'English' },
  { id: 'ar', fr: 'Arabe', en: 'Arabic' },
  { id: 'de', fr: 'Allemand', en: 'German' },
  { id: 'it', fr: 'Italien', en: 'Italian' },
  { id: 'es', fr: 'Espagnol', en: 'Spanish' },
  { id: 'ru', fr: 'Russe', en: 'Russian' },
] as const;

/** Kinds of trips a guide or agency can tick. */
export const PRO_ACTIVITIES = [
  { id: 'desert', fr: 'Désert', en: 'Desert' },
  { id: 'culture', fr: 'Culture et médinas', en: 'Culture and medinas' },
  { id: 'hiking', fr: 'Randonnée', en: 'Hiking' },
  { id: 'beach', fr: 'Plage et mer', en: 'Beach and sea' },
  { id: 'food', fr: 'Gastronomie', en: 'Food' },
  { id: 'roadtrip', fr: 'Road trip', en: 'Road trip' },
] as const;

/** Keeps only the ticked ids that exist in the list, without duplicates. */
export function cleanIds(value: unknown, list: readonly { id: string }[]): string[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(list.map((item) => item.id));
  return [...new Set(value.filter((v): v is string => typeof v === 'string' && allowed.has(v)))];
}

export interface PublicPro {
  id: string;
  kind: ProKind;
  name: string;
  /** Digits with country code, ready for a wa.me link. */
  whatsapp: string;
  socials: string | null;
  /** True when a professional card number was given. The number itself is never published. */
  cardDeclared: boolean;
  bio: string | null;
  experience: string | null;
  languages: string[];
  activities: string[];
  priceNote: string | null;
  /** One of the site's places: where the person works, and where they appear on the map. */
  placeId: string | null;
  photoUrl: string | null;
}

/** The place id is only kept when it is one of the site's places. */
export function cleanPlaceId(value: unknown): string | null {
  return typeof value === 'string' && value in PLACE_BY_ID ? value : null;
}

/** A photo path is only kept when it is inside the person's own folder: `<user id>/<uuid>.jpg`. */
export function cleanPhotoPath(value: unknown, owner: string): string | null {
  return typeof value === 'string' && new RegExp(`^${owner}/[0-9a-f-]{36}\\.jpg$`).test(value) ? value : null;
}

/**
 * Keeps only digits and gives the number a country code: a Tunisian number on 8 digits gets 216.
 * Returns null when it cannot be a phone number.
 */
export function normalizeWhatsApp(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 8) digits = `216${digits}`;
  return /^[1-9]\d{9,14}$/.test(digits) ? digits : null;
}

/**
 * Only a loose sanity check: the official format of the Tunisian guide card is not known here,
 * so this rejects what is plainly not a card number and nothing more.
 */
export function normalizeCard(raw: string): string | null {
  const card = raw.trim().replace(/\s+/g, ' ');
  return /^(?=.*\d)[\p{L}\d][\p{L}\d /.\-]{2,24}$/u.test(card) ? card : null;
}

/** A link only for a plain https address; any other text is shown as typed. */
export function socialsHref(socials: string): string | null {
  try {
    const url = new URL(socials.trim());
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

interface ProRow {
  id: string;
  kind: ProKind;
  name: string;
  whatsapp: string;
  socials: string | null;
  card_number: string | null;
  bio: string | null;
  experience: string | null;
  languages: string[] | null;
  activities: string[] | null;
  price_note: string | null;
  place_id: string | null;
  photo_path: string | null;
}

/** Published guides and agencies (db/pros.sql). Empty when the table is missing or not configured. */
export async function loadPublishedPros(): Promise<PublicPro[]> {
  const cfg = supabaseConfig();
  if (!cfg) return [];
  try {
    const rows = await selectRows<ProRow>(
      cfg,
      'pro_listings',
      'select=id,kind,name,whatsapp,socials,card_number,bio,experience,languages,activities,price_note,place_id,photo_path&status=eq.published&order=created_at.asc&limit=500',
      { revalidate: 3600, tags: [PROS_TAG] },
    );
    return rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      name: r.name,
      whatsapp: r.whatsapp,
      socials: r.socials,
      cardDeclared: !!r.card_number,
      bio: r.bio,
      experience: r.experience,
      languages: r.languages ?? [],
      activities: r.activities ?? [],
      priceNote: r.price_note,
      placeId: r.place_id,
      photoUrl: r.photo_path ? publicUrl(cfg, PRO_PHOTO_BUCKET, r.photo_path) : null,
    }));
  } catch {
    return [];
  }
}

/** 'partner' (hotel, guesthouse, car rental…) is reserved: no screen creates it yet. */
export type AccountKind = 'traveler' | 'pro' | 'partner';

export interface AuthUser {
  id: string;
  email: string;
  /** Accounts created before the two types existed have no type: they were all guides or agencies. */
  kind: AccountKind;
}

/** Who a Supabase access token belongs to, or null when it is missing, malformed or expired. */
export async function authUser(cfg: SupabaseConfig, accessToken: unknown): Promise<AuthUser | null> {
  if (typeof accessToken !== 'string' || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(accessToken)) return null;
  try {
    const res = await fetch(`${cfg.url}/auth/v1/user`, {
      headers: { apikey: cfg.key, Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: unknown; email?: unknown; user_metadata?: { account_type?: unknown } };
    if (typeof user.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(user.id)) return null;
    const type = user.user_metadata?.account_type;
    return {
      id: user.id,
      email: typeof user.email === 'string' ? user.email : '',
      kind: type === 'traveler' || type === 'partner' ? type : 'pro',
    };
  } catch {
    return null;
  }
}

/** The id behind an access token, for routes that only manage a guide's or agency's own listing. */
export async function authUserId(cfg: SupabaseConfig, accessToken: unknown): Promise<string | null> {
  const user = await authUser(cfg, accessToken);
  return user && user.kind === 'pro' ? user.id : null;
}
