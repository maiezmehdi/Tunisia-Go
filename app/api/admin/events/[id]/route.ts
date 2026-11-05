import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { parseEventInput } from '@/lib/eventInput';
import { refreshSite } from '@/lib/refresh';
import { sameOrigin } from '@/lib/requestGuard';
import { deleteRow, supabaseConfig, updateRow } from '@/lib/supabase';

export const runtime = 'nodejs';

const UUID = /^[0-9a-f-]{36}$/i;

async function guard(request: Request, params: Promise<{ id: string }>) {
  if (!sameOrigin(request)) return { res: NextResponse.json({ error: 'forbidden' }, { status: 403 }) } as const;
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value))
    return { res: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) } as const;
  const cfg = supabaseConfig();
  if (!cfg) return { res: NextResponse.json({ error: 'not_configured' }, { status: 503 }) } as const;
  const { id } = await params;
  if (!UUID.test(id)) return { res: NextResponse.json({ error: 'invalid' }, { status: 400 }) } as const;
  return { cfg, id } as const;
}

async function refresh() {
  await refreshSite(['events'], ['/[lang]/evenements']);
}

/** Saves the whole form, or just shows/hides the event when the body is `{ published }`. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(request, params);
  if ('res' in g) return g.res;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  let patch: Record<string, unknown>;
  if (body && Object.keys(body).length === 1 && typeof body.published === 'boolean') {
    patch = { published: body.published };
  } else {
    const parsed = parseEventInput(body);
    if ('error' in parsed) return NextResponse.json({ error: 'invalid', field: parsed.error }, { status: 400 });
    patch = parsed.row;
  }
  if (patch.published === true) patch.proposed = false;
  try {
    await updateRow(g.cfg, 'events', g.id, patch);
  } catch (error) {
    console.error('admin: event update', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  await refresh();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(request, params);
  if ('res' in g) return g.res;
  try {
    await deleteRow(g.cfg, 'events', g.id);
  } catch (error) {
    console.error('admin: event delete', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  await refresh();
  return NextResponse.json({ ok: true });
}
