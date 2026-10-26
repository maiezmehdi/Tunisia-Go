import { NextResponse } from 'next/server';

import { supabaseConfig } from '@/lib/supabase';

/**
 * Starts "Continue with Facebook": sends the browser to Supabase Auth, which talks to Facebook
 * (the Facebook app id and secret are set in Supabase, Authentication, Providers) and then brings
 * the person back to the account page with the session in the address (#access_token=…).
 */
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const cfg = supabaseConfig();
  const url = new URL(request.url);
  const back = `${url.origin}${url.searchParams.get('lang') === 'en' ? '/en' : ''}/compte`;
  if (!cfg || process.env.NEXT_PUBLIC_FACEBOOK_LOGIN !== 'on') return NextResponse.redirect(`${back}?auth=off`);
  const target = new URL(`${cfg.url}/auth/v1/authorize`);
  target.searchParams.set('provider', 'facebook');
  target.searchParams.set('scopes', 'email');
  target.searchParams.set('redirect_to', back);
  return NextResponse.redirect(target.toString());
}
