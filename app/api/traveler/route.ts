import { NextResponse } from 'next/server';

import { authUser } from '@/lib/pros';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { selectRows, supabaseConfig, upsertRow } from '@/lib/supabase';

/** Favourite places and "Mon voyage" of a signed-in account: 'get' reads them, 'save' replaces them. */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;
const ID = /^[\w-]{1,80}$/;

function cleanIds(value: unknown, max: number): string[] | null {
  if (!Array.isArray(value)) return null;
  const ids = value.filter((x): x is string => typeof x === 'string' && ID.test(x));
  return [...new Set(ids)].slice(0, max);
}

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!allow(`traveler:${clientIp(request)}`, 300, HOUR))
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const user = await authUser(cfg, body?.accessToken);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    if (body?.action === 'save') {
      const favorites = cleanIds(body.favorites, 200);
      const trip = cleanIds(body.trip, 40);
      if (!favorites || !trip) return NextResponse.json({ error: 'invalid' }, { status: 400 });
      await upsertRow(cfg, 'traveler_data', {
        owner_id: user.id,
        favorites,
        trip,
        updated_at: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true });
    }
    const [row] = await selectRows<{ favorites: string[]; trip: string[] }>(
      cfg,
      'traveler_data',
      `select=favorites,trip&owner_id=eq.${user.id}&limit=1`,
    );
    return NextResponse.json({ favorites: row?.favorites ?? [], trip: row?.trip ?? [] });
  } catch (error) {
    console.error('traveler', error);
    return NextResponse.json({ error: 'failed' }, { status: 502 });
  }
}
