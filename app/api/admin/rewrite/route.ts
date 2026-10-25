import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { geminiConfigured, REWRITE_MAX_CHARS, rewriteText, type RewriteKind } from '@/lib/gemini';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';

export const runtime = 'nodejs';

/** Proposes a cleaner version of a description for the admin to accept or ignore; saves nothing. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!geminiConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  // The free tier of the API has its own quota; this keeps a stuck button from burning it.
  if (
    !allow(`rewrite:m:${clientIp(request)}`, 10, 60 * 1000) ||
    !allow(`rewrite:d:${clientIp(request)}`, 300, 86400000)
  ) {
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const kind: RewriteKind = body?.kind === 'trip' ? 'trip' : body?.kind === 'bio' ? 'bio' : 'place';
  const name = typeof body?.name === 'string' ? body.name.slice(0, 120) : '';
  if (text.length < 20 || text.length > REWRITE_MAX_CHARS) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  try {
    return NextResponse.json({ text: await rewriteText({ text, kind, name }) });
  } catch (error) {
    console.error('admin: rewrite', error);
    return NextResponse.json({ error: 'failed' }, { status: 502 });
  }
}
