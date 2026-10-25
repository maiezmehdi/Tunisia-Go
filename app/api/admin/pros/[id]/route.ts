import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { refreshSite } from '@/lib/refresh';
import { sameOrigin } from '@/lib/requestGuard';
import { deleteRow, selectRows, supabaseConfig, updateRow } from '@/lib/supabase';

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

interface Change {
  remove?: boolean;
  kind?: 'guide' | 'agency';
  name?: string;
  card?: string | null;
  socials?: string | null;
}

/** Publishes an entry, takes it down, or applies / drops a change the guide asked for. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(request, params);
  if ('error' in g) return g.error;
  const body = (await request.json().catch(() => null)) as { action?: unknown } | null;
  const action = body?.action;
  if (action !== 'publish' && action !== 'hide' && action !== 'apply_change' && action !== 'dismiss_change') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  try {
    if (action === 'publish' || action === 'hide') {
      await updateRow(g.cfg, 'pro_listings', g.id, { status: action === 'publish' ? 'published' : 'hidden' });
    } else if (action === 'dismiss_change') {
      await updateRow(g.cfg, 'pro_listings', g.id, { pending_change: null });
    } else {
      const [row] = await selectRows<{ pending_change: Change | null }>(
        g.cfg,
        'pro_listings',
        `select=pending_change&id=eq.${g.id}`,
      );
      const change = row?.pending_change;
      if (!change) return NextResponse.json({ error: 'invalid' }, { status: 400 });
      if (change.remove) {
        await deleteRow(g.cfg, 'pro_listings', g.id);
      } else {
        await updateRow(g.cfg, 'pro_listings', g.id, {
          ...(change.kind && { kind: change.kind }),
          ...(change.name && { name: change.name }),
          card_number: change.card ?? null,
          socials: change.socials ?? null,
          pending_change: null,
        });
      }
    }
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
