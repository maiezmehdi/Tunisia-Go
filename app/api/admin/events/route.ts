import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { parseEventInput } from '@/lib/eventInput';
import { refreshSite } from '@/lib/refresh';
import { sameOrigin } from '@/lib/requestGuard';
import { insertRow, supabaseConfig } from '@/lib/supabase';

export const runtime = 'nodejs';

/** Adds an event from the admin form. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const parsed = parseEventInput(await request.json().catch(() => null));
  if ('error' in parsed) return NextResponse.json({ error: 'invalid', field: parsed.error }, { status: 400 });
  try {
    await insertRow(cfg, 'events', parsed.row);
  } catch (error) {
    console.error('admin: event insert', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  await refreshSite(['events'], ['/[lang]/evenements']);
  return NextResponse.json({ ok: true });
}
