import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { refreshSite } from '@/lib/refresh';
import { sameOrigin } from '@/lib/requestGuard';
import { deleteRow, supabaseConfig, updateRow } from '@/lib/supabase';

export const runtime = 'nodejs';

const UUID = /^[0-9a-f-]{36}$/i;

async function guard(request: Request, params: Promise<{ id: string }>) {
  if (!sameOrigin(request)) return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) {
    return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  }
  const cfg = supabaseConfig();
  if (!cfg) return { error: NextResponse.json({ error: 'not_configured' }, { status: 503 }) };
  const { id } = await params;
  if (!UUID.test(id)) return { error: NextResponse.json({ error: 'invalid' }, { status: 400 }) };
  return { cfg, id };
}

/** Publishes an entry, or takes it down. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(request, params);
  if ('error' in g) return g.error;
  const body = (await request.json().catch(() => null)) as { action?: unknown } | null;
  const action = body?.action;
  if (action !== 'publish' && action !== 'hide') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  try {
    await updateRow(g.cfg, 'pro_listings', g.id, { status: action === 'publish' ? 'published' : 'hidden' });
    await refreshSite(['pros'], ['/[lang]/guides']);
  } catch (error) {
    console.error('admin: pro', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

/** Deletes an entry for good (and its reports). */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(request, params);
  if ('error' in g) return g.error;
  try {
    await deleteRow(g.cfg, 'pro_listings', g.id);
    await refreshSite(['pros'], ['/[lang]/guides']);
  } catch (error) {
    console.error('admin: pro delete', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
