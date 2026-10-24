import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { inTunisia, isCategory, parseCoords } from '@/lib/community';
import { refreshSite } from '@/lib/refresh';
import { sameOrigin } from '@/lib/requestGuard';
import { SPOT_TYPES } from '@/lib/secretSpot';
import { insertRow, supabaseConfig } from '@/lib/supabase';

export const runtime = 'nodejs';

function text(value: unknown, max: number): string | null {
  return typeof value === 'string' && value.trim() && value.trim().length <= max ? value.trim() : null;
}

/** Adds a place straight to the map from the admin form: an already approved suggestion. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const b = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const bad = (field: string) => NextResponse.json({ error: 'invalid', field }, { status: 400 });
  const name = text(b?.name, 120);
  if (!name) return bad('name');
  const area = text(b?.area, 120);
  if (!area) return bad('area');
  const why = text(b?.why, 1200);
  if (!why) return bad('why');
  const type = (SPOT_TYPES as readonly unknown[]).includes(b?.type) ? (b?.type as string) : null;
  if (!type) return bad('type');
  if (!isCategory(b?.category)) return bad('category');
  const coords = parseCoords(typeof b?.coords === 'string' ? b.coords : null);
  if (!coords || !inTunisia(coords[0], coords[1])) return bad('coords');
  const bestTime = b?.bestTime ? text(b.bestTime, 120) : null;
  if (b?.bestTime && !bestTime) return bad('bestTime');

  try {
    await insertRow(cfg, 'spot_submissions', {
      status: 'approved',
      locale: 'fr',
      name,
      type,
      area,
      location: `${coords[0]}, ${coords[1]}`,
      why,
      best_time: bestTime,
      author: null,
      lat: coords[0],
      lng: coords[1],
      category: b.category,
      reviewed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('admin: add place', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  await refreshSite(['community-places'], ['/[lang]/explore']);
  return NextResponse.json({ ok: true });
}
