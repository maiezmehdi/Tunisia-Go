import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { PROS_TAG, normalizeCard, normalizeWhatsApp } from '@/lib/pros';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { insertRow, selectRows, supabaseConfig, updateRow } from '@/lib/supabase';

/**
 * Guides and agencies register themselves, with no account (db/pros.sql).
 * With a professional card number the entry is published at once, as "card declared" (not verified);
 * without one it waits in the admin for a manual check.
 * Registering again with a number already listed (or asking to be removed) never changes the listing:
 * it stores a change request that the admin applies after checking with the person.
 */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

/** Stores a change request on the listing with this number; the listing itself stays as it is. */
async function requestChange(
  cfg: NonNullable<ReturnType<typeof supabaseConfig>>,
  whatsapp: string,
  change: Record<string, unknown>,
  strict: boolean,
) {
  try {
    const [row] = await selectRows<{ id: string }>(cfg, 'pro_listings', `select=id&whatsapp=eq.${whatsapp}&limit=1`);
    if (!row) return NextResponse.json({ error: strict ? 'unknown' : 'save_failed' }, { status: strict ? 404 : 502 });
    await updateRow(cfg, 'pro_listings', row.id, { pending_change: { ...change, at: new Date().toISOString() } });
    return NextResponse.json({ ok: true, status: 'change' });
  } catch (error) {
    console.error('pro-signup: change', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = clientIp(request);
  if (!allow(`pro:h:${ip}`, 3, HOUR) || !allow(`pro:d:${ip}`, 8, 24 * HOUR)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429, headers: { 'Retry-After': '3600' } });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  // Sent faster than a person can type: a bot. (A hidden field was tripped by browser autofill.)
  if (typeof body.elapsed === 'number' && body.elapsed < 4000)
    return NextResponse.json({ ok: true, status: 'pending' });

  const remove = body.remove === true;
  const kind = body.kind === 'agency' ? 'agency' : body.kind === 'guide' ? 'guide' : null;
  const name = text(body.name, 80);
  const whatsapp = normalizeWhatsApp(text(body.whatsapp, 30));
  const cardRaw = text(body.card, 40);
  const card = cardRaw ? normalizeCard(cardRaw) : null;
  const socials = text(body.socials, 200);
  if (remove) {
    if (!whatsapp) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    return requestChange(cfg, whatsapp, { remove: true }, true);
  }
  if (!kind || name.length < 2 || !whatsapp) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  if (cardRaw && !card) return NextResponse.json({ error: 'invalid_card' }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: 'consent' }, { status: 400 });
  // An agency has no personal guide card: it is asked for its networks, so it needs at least one.
  if (kind === 'agency' && socials.length < 3) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const published = !!card;
  try {
    await insertRow(cfg, 'pro_listings', {
      kind,
      name,
      whatsapp,
      card_number: card,
      socials: socials || null,
      consent: true,
      status: published ? 'published' : 'pending',
      auto_published: published,
    });
  } catch (error) {
    if (String(error).includes('23505') || String(error).includes('409')) {
      return requestChange(cfg, whatsapp, { kind, name, card, socials: socials || null }, false);
    }
    console.error('pro-signup', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  if (published) revalidateTag(PROS_TAG);
  return NextResponse.json({ ok: true, status: published ? 'published' : 'pending' });
}
