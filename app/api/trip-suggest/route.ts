import { NextResponse } from 'next/server';

import { PLACES } from '@/data/tunisiaData';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { insertRow, selectRows, supabaseConfig } from '@/lib/supabase';
import { cleanTrip } from '@/lib/tripSuggest';

export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;
const BUILT_IN = new Set(PLACES.map((p) => p.id));

/** A road trip suggested by a visitor. Saved as pending: it shows on the map once approved from /admin. */
export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = clientIp(request);
  if (!allow(`trip:h:${ip}`, 5, HOUR) || !allow(`trip:d:${ip}`, 15, 24 * HOUR)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429, headers: { 'Retry-After': '3600' } });
  }
  if (Number(request.headers.get('content-length') ?? 0) > 20_000) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  // Sent faster than a person can fill the form: a bot.
  if (typeof body.elapsed === 'number' && body.elapsed < 3000) {
    console.warn('trip-suggest: sent too fast, suggestion ignored');
    return NextResponse.json({ ok: true });
  }
  const trip = cleanTrip(body, BUILT_IN);
  if (!trip) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  try {
    // Places suggested by visitors count only once approved.
    const community = trip.stops.filter((id) => !BUILT_IN.has(id));
    if (community.length) {
      const ids = community.map((id) => id.slice(2)).join(',');
      const found = await selectRows<{ id: string }>(
        cfg,
        'spot_submissions',
        `select=id&status=eq.approved&id=in.(${ids})`,
      );
      if (found.length !== community.length) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }
    await insertRow(cfg, 'trip_submissions', {
      locale: body.locale === 'en' ? 'en' : 'fr',
      name: trip.name,
      description: trip.description,
      days: trip.days,
      stops: trip.stops,
      author: trip.author || null,
      contact: trip.contact || null,
    });
    console.info(`trip-suggest: saved (${trip.stops.length} stops)`);
  } catch (error) {
    console.error('trip-suggest: supabase', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
