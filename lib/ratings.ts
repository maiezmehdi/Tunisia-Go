import { createHmac } from 'node:crypto';

import { selectRows, supabaseConfig } from '@/lib/supabase';

export const RATINGS_TAG = 'place-ratings';

export interface RatingStat {
  average: number;
  votes: number;
}

/** Average and vote count per place (db/place-ratings.sql). Empty when the table is missing or not configured. */
export async function loadRatingStats(): Promise<Record<string, RatingStat>> {
  const cfg = supabaseConfig();
  if (!cfg) return {};
  try {
    const rows = await selectRows<{ place_id: string; average: number; votes: number }>(
      cfg,
      'place_rating_stats',
      'select=*&limit=1000',
      { revalidate: 3600, tags: [RATINGS_TAG] },
    );
    return Object.fromEntries(rows.map((r) => [r.place_id, { average: r.average, votes: r.votes }]));
  } catch {
    return {};
  }
}

/** Same numbers, read without cache for the admin table. */
export async function loadRatingStatsFresh(): Promise<Record<string, RatingStat>> {
  const cfg = supabaseConfig();
  if (!cfg) return {};
  const rows = await selectRows<{ place_id: string; average: number; votes: number }>(
    cfg,
    'place_rating_stats',
    'select=*&limit=1000',
  );
  return Object.fromEntries(rows.map((r) => [r.place_id, { average: r.average, votes: r.votes }]));
}

/**
 * Stands in for the visitor: a keyed hash of the IP address, so the address itself is never stored.
 * The key is RATING_SALT, or the Supabase secret key when it is not set.
 */
export function voterHash(ip: string): string | null {
  const salt = process.env.RATING_SALT?.trim() || process.env.SUPABASE_SECRET_KEY?.trim();
  if (!salt || ip === 'unknown') return null;
  return createHmac('sha256', salt).update(`rating:${ip}`).digest('hex');
}
