import { NextResponse } from 'next/server';

import { answer } from '@/lib/assistant/ai';
import { geminiConfigured } from '@/lib/gemini';
import { LOCALES, type Locale } from '@/lib/i18n/config';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';

export const runtime = 'nodejs';

const MAX_QUESTION = 300;

/**
 * Natural-language answers for the travel assistant, written by Gemini from the pages of the site only.
 * Limited per person and for the whole site to stay inside the free quota; the browser falls back to the
 * built-in assistant on any error.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!geminiConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const ip = clientIp(request);
  if (!allow(`assistant:m:${ip}`, 8, 60 * 1000) || !allow(`assistant:d:${ip}`, 120, 86400000)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  }
  if (!allow('assistant:all', 1200, 86400000)) return NextResponse.json({ error: 'too_many' }, { status: 429 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  const locale: Locale = (LOCALES as readonly string[]).includes(String(body?.locale))
    ? (body?.locale as Locale)
    : 'fr';
  if (!question || question.length > MAX_QUESTION) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const history = (Array.isArray(body?.history) ? body.history : [])
    .filter(
      (t): t is { role: 'user' | 'model'; text: string } =>
        !!t && (t.role === 'user' || t.role === 'model') && typeof t.text === 'string',
    )
    .slice(-6)
    .map((t) => ({ role: t.role, text: t.text.slice(0, 600) }));
  // The conversation must start with the visitor.
  while (history.length && history[0].role !== 'user') history.shift();

  try {
    return NextResponse.json(await answer({ question, history, locale }));
  } catch (error) {
    console.error('assistant: gemini', error);
    return NextResponse.json({ error: 'failed' }, { status: 502 });
  }
}
