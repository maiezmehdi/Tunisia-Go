import { NextResponse } from 'next/server';

import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { insertRow, supabaseConfig } from '@/lib/supabase';

/** A visitor flags a guide or agency entry; the admin sees the count next to the entry (db/pros.sql). */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;
const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = clientIp(request);
  if (!allow(`proreport:h:${ip}`, 5, HOUR) || !allow(`proreport:d:${ip}`, 15, 24 * HOUR)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429, headers: { 'Retry-After': '3600' } });
  }
  const body = (await request.json().catch(() => null)) as { listingId?: unknown } | null;
  const id = typeof body?.listingId === 'string' ? body.listingId : '';
  if (!UUID.test(id)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  try {
    await insertRow(cfg, 'pro_reports', { listing_id: id });
  } catch (error) {
    console.error('report-pro', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
