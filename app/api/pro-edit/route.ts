import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { PROS_TAG, hashToken, normalizeCard } from '@/lib/pros';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { deleteWhere, selectRows, supabaseConfig, updateRow } from '@/lib/supabase';

/**
 * A guide or agency reads, changes or removes their own entry with the secret of their private link
 * (no account). Only a hash of the secret is stored, so a leaked database does not leak the links.
 */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;

interface Row {
  id: string;
  status: 'published' | 'pending' | 'hidden';
  kind: 'guide' | 'agency';
  name: string;
  whatsapp: string;
  card_number: string | null;
  socials: string | null;
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!allow(`proedit:${clientIp(request)}`, 40, HOUR)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429, headers: { 'Retry-After': '3600' } });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const token = typeof body?.token === 'string' ? body.token : '';
  if (!/^[\w-]{20,80}$/.test(token)) return NextResponse.json({ error: 'unknown' }, { status: 404 });

  try {
    const [row] = await selectRows<Row>(
      cfg,
      'pro_listings',
      `select=id,status,kind,name,whatsapp,card_number,socials&edit_token_hash=eq.${hashToken(token)}&limit=1`,
    );
    if (!row) return NextResponse.json({ error: 'unknown' }, { status: 404 });

    if (body?.action === 'remove') {
      await deleteWhere(cfg, 'pro_listings', `id=eq.${row.id}`);
      revalidateTag(PROS_TAG);
      return NextResponse.json({ ok: true, removed: true });
    }

    if (body?.action === 'save') {
      const name = text(body.name, 80);
      const cardRaw = text(body.card, 40);
      const card = cardRaw ? normalizeCard(cardRaw) : null;
      const socials = text(body.socials, 200);
      if (name.length < 2) return NextResponse.json({ error: 'invalid' }, { status: 400 });
      if (cardRaw && !card) return NextResponse.json({ error: 'invalid_card' }, { status: 400 });
      if (row.kind === 'agency' && socials.length < 3) return NextResponse.json({ error: 'invalid' }, { status: 400 });
      // A guide who adds a card number is published like at sign-up; one the admin hid stays hidden.
      const status = row.status === 'pending' && card && row.kind === 'guide' ? 'published' : row.status;
      await updateRow(cfg, 'pro_listings', row.id, { name, card_number: card, socials: socials || null, status });
      revalidateTag(PROS_TAG);
      return NextResponse.json({ ok: true, status });
    }

    return NextResponse.json({
      ok: true,
      kind: row.kind,
      status: row.status,
      name: row.name,
      whatsapp: row.whatsapp,
      card: row.card_number ?? '',
      socials: row.socials ?? '',
    });
  } catch (error) {
    console.error('pro-edit', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
}
