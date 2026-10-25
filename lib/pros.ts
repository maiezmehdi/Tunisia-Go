import { selectRows, supabaseConfig, type SupabaseConfig } from '@/lib/supabase';

export const PROS_TAG = 'pros';

export type ProKind = 'guide' | 'agency';

export interface PublicPro {
  id: string;
  kind: ProKind;
  name: string;
  /** Digits with country code, ready for a wa.me link. */
  whatsapp: string;
  socials: string | null;
  /** True when a professional card number was given. The number itself is never published. */
  cardDeclared: boolean;
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
}

/** Published guides and agencies (db/pros.sql). Empty when the table is missing or not configured. */
export async function loadPublishedPros(): Promise<PublicPro[]> {
  const cfg = supabaseConfig();
  if (!cfg) return [];
  try {
    const rows = await selectRows<ProRow>(
      cfg,
      'pro_listings',
      'select=id,kind,name,whatsapp,socials,card_number&status=eq.published&order=created_at.asc&limit=500',
      { revalidate: 3600, tags: [PROS_TAG] },
    );
    return rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      name: r.name,
      whatsapp: r.whatsapp,
      socials: r.socials,
      cardDeclared: !!r.card_number,
    }));
  } catch {
    return [];
  }
}

/**
 * Who is signed in: asks Supabase Auth about the access token the browser got after the e-mail sign-in link.
 * Returns the user's id (never stored together with the e-mail here), or null when the token is not valid.
 */
export async function authUserId(cfg: SupabaseConfig, accessToken: unknown): Promise<string | null> {
  if (typeof accessToken !== 'string' || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(accessToken)) return null;
  try {
    const res = await fetch(`${cfg.url}/auth/v1/user`, {
      headers: { apikey: cfg.key, Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: unknown };
    return typeof user.id === 'string' && /^[0-9a-f-]{36}$/i.test(user.id) ? user.id : null;
  } catch {
    return null;
  }
}
