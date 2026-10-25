import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { PLACES } from '@/data/tunisiaData';
import { RATINGS_TAG, voterHash } from '@/lib/ratings';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { selectRows, supabaseConfig, upsertRow } from '@/lib/supabase';

/**
 * Receives a star rating (1 to 5) for a place. No account: the visitor is a salted hash of the IP address
 * (lib/ratings.ts), so one address counts once per place and can change its note. Table: db/place-ratings.sql.
 */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;
const PLACE_IDS = new Set(PLACES.map((p) => p.id));

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = clientIp(request);
  if (!allow(`rate:h:${ip}`, 20, HOUR) || !allow(`rate:d:${ip}`, 60, 24 * HOUR)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429, headers: { 'Retry-After': '3600' } });
  }

  const body = (await request.json().catch(() => null)) as { placeId?: unknown; stars?: unknown } | null;
  const placeId = typeof body?.placeId === 'string' ? body.placeId : '';
  const stars = body?.stars;
  if (!PLACE_IDS.has(placeId) || typeof stars !== 'number' || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const hash = voterHash(ip);
  if (!hash) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  try {
    await upsertRow(cfg, 'place_ratings', {
      place_id: placeId,
      voter_hash: hash,
      stars,
      updated_at: new Date().toISOString(),
    });
    const [stat] = await selectRows<{ average: number; votes: number }>(
      cfg,
      'place_rating_stats',
      `select=average,votes&place_id=eq.${encodeURIComponent(placeId)}`,
    );
    revalidateTag(RATINGS_TAG);
    return NextResponse.json({ ok: true, average: stat?.average ?? stars, votes: stat?.votes ?? 1 });
  } catch (error) {
    console.error('rate-place', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
}
