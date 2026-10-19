import { NextResponse } from 'next/server';

import { cleanSpot, spotAsText } from '@/lib/secretSpot';

/**
 * Receives "secret spot" suggestions and forwards them to SECRET_SPOT_WEBHOOK_URL
 * (a Slack, Make, Zapier or Discord webhook, for instance). Without that variable
 * the form falls back to sending the suggestion over WhatsApp.
 */
export async function POST(request: Request) {
  const webhook = process.env.SECRET_SPOT_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  // Honeypot: real people never fill the hidden "website" field.
  if (typeof body.website === 'string' && body.website) return NextResponse.json({ ok: true });

  const spot = cleanSpot(body);
  if (!spot) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const text = spotAsText(spot);
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // `text` for Slack, `content` for Discord, the fields for anything else.
      body: JSON.stringify({ text, content: text, spot, receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`webhook ${res.status}`);
  } catch {
    return NextResponse.json({ error: 'forward_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
