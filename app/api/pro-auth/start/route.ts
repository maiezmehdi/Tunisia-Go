import { NextResponse } from 'next/server';

import { supabaseConfig } from '@/lib/supabase';

/**
 * Starts "Continue with Google" for guides and agencies (Supabase Auth). Google sends the person back to
 * the page where they manage their entry. Google must be switched on in Supabase (Authentication, Providers).
 */
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'fr';
  const back = `${url.origin}${lang === 'en' ? '/en' : ''}/guides/modifier`;
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.redirect(`${back}?auth=off`);
  const target = new URL(`${cfg.url}/auth/v1/authorize`);
  target.searchParams.set('provider', 'google');
  target.searchParams.set('redirect_to', back);
  return NextResponse.redirect(target.toString());
}
