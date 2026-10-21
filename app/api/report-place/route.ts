import { NextResponse } from 'next/server';

import { PLACES } from '@/data/tunisiaData';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { insertRow, supabaseConfig } from '@/lib/supabase';

/**
 * Receives "Signaler une erreur" reports from the place pages.
 * Saved in the "place_reports" table (db/place-reports.sql) and, when SECRET_SPOT_WEBHOOK_URL is set,
 * also sent there as a notification. With neither configured it answers 503 and the form says so.
 */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;
const PLACE_NAMES = new Map(PLACES.map((p) => [p.id, p.name]));

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  const supabase = supabaseConfig();
  const webhook = process.env.SECRET_SPOT_WEBHOOK_URL;
  if (!supabase && !webhook) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = clientIp(request);
  if (!allow(`report:h:${ip}`, 5, HOUR) || !allow(`report:d:${ip}`, 15, 24 * HOUR)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429, headers: { 'Retry-After': '3600' } });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  // Honeypot: real people never fill the hidden "website" field.
  if (typeof body.website === 'string' && body.website) return NextResponse.json({ ok: true });

  const placeId = text(body.placeId, 80);
  const message = text(body.message, 1500);
  const contact = text(body.contact, 200);
  const placeName = PLACE_NAMES.get(placeId);
  if (!placeName || message.length < 5) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const locale = body.locale === 'en' ? 'en' : 'fr';

  if (supabase) {
    try {
      await insertRow(supabase, 'place_reports', {
        place_id: placeId,
        place_name: placeName,
        locale,
        message,
        contact: contact || null,
      });
    } catch (error) {
      console.error('report-place: supabase', error);
      return NextResponse.json({ error: 'save_failed' }, { status: 502 });
    }
  }

  if (webhook) {
    const summary = `Erreur signalée sur « ${placeName} » (${placeId})\n${message}${contact ? `\nContact : ${contact}` : ''}`;
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary, content: summary, placeId, message, contact, locale }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } catch (error) {
      if (!supabase) return NextResponse.json({ error: 'forward_failed' }, { status: 502 });
      console.error('report-place: webhook', error);
    }
  }
  return NextResponse.json({ ok: true });
}
