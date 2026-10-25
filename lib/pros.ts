import { selectRows, supabaseConfig } from '@/lib/supabase';

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
