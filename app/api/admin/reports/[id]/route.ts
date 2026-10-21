import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { sameOrigin } from '@/lib/requestGuard';
import { supabaseConfig, updateRow } from '@/lib/supabase';

export const runtime = 'nodejs';

const UUID = /^[0-9a-f-]{36}$/i;

/** Marks a report as handled (or puts it back to open). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const body = (await request.json().catch(() => null)) as { action?: unknown } | null;
  if (body?.action !== 'done' && body?.action !== 'open')
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  try {
    await updateRow(cfg, 'place_reports', id, {
      status: body.action,
      handled_at: body.action === 'done' ? new Date().toISOString() : null,
    });
  } catch (error) {
    console.error('admin: report', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
