import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { PLACES } from '@/data/tunisiaData';
import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { sameOrigin } from '@/lib/requestGuard';
import { supabaseConfig } from '@/lib/supabase';

/** Checks the admin session and the place id for the place-overrides routes. */
export async function placeContext(request: Request, params: Promise<{ placeId: string }>) {
  const fail = (error: string, status: number) => ({ res: NextResponse.json({ error }, { status }) }) as const;
  if (request.method !== 'GET' && !sameOrigin(request)) return fail('forbidden', 403);
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return fail('unauthorized', 401);
  const cfg = supabaseConfig();
  if (!cfg) return fail('not_configured', 503);
  const { placeId } = await params;
  if (!PLACES.some((p) => p.id === placeId)) return fail('not_found', 404);
  return { cfg, placeId } as const;
}
