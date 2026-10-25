import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { PROS_TAG, newEditToken, normalizeCard, normalizeWhatsApp } from '@/lib/pros';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { insertRow, supabaseConfig } from '@/lib/supabase';

/**
 * Guides and agencies register themselves, with no account (db/pros.sql).
 * With a professional card number the entry is published at once, as "card declared" (not verified);
 * without one it waits in the admin for a manual check.
 * The answer carries a private edit link's secret, shown once: it is how the person changes or removes the entry later.
 */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
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

  const kind = body.kind === 'agency' ? 'agency' : body.kind === 'guide' ? 'guide' : null;
  const name = text(body.name, 80);
  const whatsapp = normalizeWhatsApp(text(body.whatsapp, 30));
  const cardRaw = text(body.card, 40);
  const card = cardRaw ? normalizeCard(cardRaw) : null;
  const socials = text(body.socials, 200);
  if (!kind || name.length < 2 || !whatsapp) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  if (cardRaw && !card) return NextResponse.json({ error: 'invalid_card' }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: 'consent' }, { status: 400 });
  // An agency has no personal guide card: it is asked for its networks, so it needs at least one.
  if (kind === 'agency' && socials.length < 3) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const published = !!card;
  const { token, hash } = newEditToken();
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
      edit_token_hash: hash,
    });
  } catch (error) {
    if (String(error).includes('23505') || String(error).includes('409')) {
      return NextResponse.json({ error: 'exists' }, { status: 409 });
    }
    console.error('pro-signup', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  if (published) revalidateTag(PROS_TAG);
  return NextResponse.json({ ok: true, status: published ? 'published' : 'pending', token });
}
