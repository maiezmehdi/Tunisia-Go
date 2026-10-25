import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { PLACES } from '@/data/tunisiaData';
import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { refreshSite } from '@/lib/refresh';
import { sameOrigin } from '@/lib/requestGuard';
import { deleteWhere, supabaseConfig } from '@/lib/supabase';

export const runtime = 'nodejs';

/** Resets a place to zero: deletes every vote it has received. */
export async function DELETE(request: Request, { params }: { params: Promise<{ placeId: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const { placeId } = await params;
  if (!PLACES.some((p) => p.id === placeId)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  try {
    await deleteWhere(cfg, 'place_ratings', `place_id=eq.${encodeURIComponent(placeId)}`);
    await refreshSite(['place-ratings'], ['/[lang]/lieux/[id]']);
  } catch (error) {
    console.error('admin: ratings', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
