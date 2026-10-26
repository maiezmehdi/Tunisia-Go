import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { PRO_PHOTO_BUCKET } from '@/lib/pros';
import { sameOrigin } from '@/lib/requestGuard';
import { deleteObjects, deleteRow, selectRows, supabaseConfig, updateRow } from '@/lib/supabase';

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

/** Approves a partner listing, or takes it down. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(request, params);
  if ('error' in g) return g.error;
  const body = (await request.json().catch(() => null)) as { action?: unknown } | null;
  if (body?.action !== 'publish' && body?.action !== 'hide')
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  try {
    await updateRow(g.cfg, 'partner_listings', g.id, { status: body.action === 'publish' ? 'published' : 'hidden' });
  } catch (error) {
    console.error('admin: partner', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

/** Deletes a partner listing for good, with its photo. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(request, params);
  if ('error' in g) return g.error;
  try {
    const [row] = await selectRows<{ photo_path: string | null }>(
      g.cfg,
      'partner_listings',
      `select=photo_path&id=eq.${g.id}`,
    );
    await deleteRow(g.cfg, 'partner_listings', g.id);
    if (row?.photo_path) await deleteObjects(g.cfg, PRO_PHOTO_BUCKET, [row.photo_path]).catch(() => undefined);
  } catch (error) {
    console.error('admin: partner delete', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
