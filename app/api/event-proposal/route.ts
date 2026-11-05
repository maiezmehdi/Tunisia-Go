import { NextResponse } from 'next/server';

import { parseEventProposal } from '@/lib/eventInput';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { insertRow, supabaseConfig } from '@/lib/supabase';

/**
 * A visitor proposes an event (no account). It is saved hidden, flagged "proposed", with a contact, in the same
 * "events" table (db/events.sql): /admin reviews it and publishes it. Nothing appears on the site before that.
 */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = clientIp(request);
  if (!allow(`event:h:${ip}`, 3, HOUR) || !allow(`event:d:${ip}`, 8, 24 * HOUR)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429, headers: { 'Retry-After': '3600' } });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  // Hidden field a person never fills: a bot that does is told "ok" and ignored.
  if (typeof body?.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true });

  const parsed = parseEventProposal(body);
  if ('error' in parsed) return NextResponse.json({ error: 'invalid', field: parsed.error }, { status: 400 });
  try {
    await insertRow(cfg, 'events', parsed.row);
  } catch (error) {
    console.error('event-proposal', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
