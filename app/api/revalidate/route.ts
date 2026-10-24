import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { REFRESH_PATHS, REFRESH_TAGS } from '@/lib/refresh';

export const runtime = 'nodejs';

function sameSecret(attempt: string, secret: string): boolean {
  const a = Buffer.from(attempt);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Called by the separate admin site after a change, so the public pages refresh right away. */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  const attempt = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!secret || secret.length < 16 || !sameSecret(attempt, secret))
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { tags?: unknown; paths?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags : [];
  const paths = Array.isArray(body?.paths) ? body.paths : [];
  for (const t of tags) if ((REFRESH_TAGS as readonly unknown[]).includes(t)) revalidateTag(t as string);
  for (const p of paths) if ((REFRESH_PATHS as readonly unknown[]).includes(p)) revalidatePath(p as string, 'page');
  return NextResponse.json({ ok: true });
}
