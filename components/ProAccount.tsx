'use client';

import { useEffect, useState } from 'react';

import ProEdit, { type Entry } from '@/components/ProEdit';
import ProSignup from '@/components/ProSignup';
import { useLocale } from '@/lib/i18n/LocaleProvider';

const COPY = {
  fr: {
    loading: 'Chargement…',
    intro:
      'Connectez-vous avec Google pour inscrire votre fiche ou la modifier. Votre compte Google n’est utilisé que pour vous reconnaître.',
    google: 'Continuer avec Google',
    off: 'La connexion n’est pas encore disponible. Réessayez plus tard.',
    signedIn: 'Connecté avec Google',
    signOut: 'Se déconnecter',
    createTitle: 'Votre fiche',
    createLead: 'Remplissez ce court formulaire pour apparaître sur le site.',
    failed: 'Impossible de charger votre fiche. Réessayez dans un instant.',
  },
  en: {
    loading: 'Loading…',
    intro:
      'Sign in with Google to register your listing or change it. Your Google account is only used to recognise you.',
    google: 'Continue with Google',
    off: 'Sign-in is not available yet. Please try again later.',
    signedIn: 'Signed in with Google',
    signOut: 'Sign out',
    createTitle: 'Your listing',
    createLead: 'Fill in this short form to appear on the site.',
    failed: 'Could not load your listing. Please try again in a moment.',
  },
} as const;

const KEY = 'tg-pro-token';

/** Where guides and agencies sign in with Google, then register their entry or edit the one they have. */
export default function ProAccount() {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'signedOut' | 'none' | 'ready' | 'error'>('loading');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [off, setOff] = useState(false);

  const signOut = () => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
    setEntry(null);
    setState('signedOut');
  };

  useEffect(() => {
    setOff(new URLSearchParams(window.location.search).get('auth') === 'off');
    // Supabase sends the person back with the access token after the # of the address.
    const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('access_token');
    let t = fromHash;
    if (fromHash) {
      try {
        sessionStorage.setItem(KEY, fromHash);
      } catch {
        /* the sign-in still works for this visit */
      }
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      try {
        t = sessionStorage.getItem(KEY);
      } catch {
        t = null;
      }
    }
    if (!t) return setState('signedOut');
    setToken(t);
    fetch('/api/pro-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: t, action: 'get' }),
    })
      .then(async (res) => {
        if (res.status === 401) return signOut();
        if (res.status === 404) return setState('none');
        if (!res.ok) return setState('error');
        setEntry((await res.json()) as Entry);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  if (state === 'loading') return <p className="text-sm text-charcoal-500">{c.loading}</p>;

  if (state === 'signedOut') {
    return (
      <div className="space-y-5">
        <p className="max-w-md text-[15px] leading-relaxed text-charcoal-500">{c.intro}</p>
        <a
          href={`/api/pro-auth/start?lang=${locale}`}
          className="inline-flex items-center gap-3 rounded-pill border border-charcoal px-5 py-2.5 text-sm text-charcoal transition hover:bg-charcoal hover:text-cream"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path
              fill="currentColor"
              d="M21.35 11.1H12v3.2h5.35c-.5 2.4-2.5 3.8-5.35 3.8a6.1 6.1 0 1 1 0-12.2c1.5 0 2.8.5 3.8 1.4l2.3-2.3A9.3 9.3 0 0 0 12 2.7a9.3 9.3 0 1 0 0 18.6c5.4 0 8.9-3.8 8.9-9.1 0-.4 0-.8-.1-1.1z"
            />
          </svg>
          {c.google}
        </a>
        {off && <p className="text-sm text-terracotta-700">{c.off}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 text-xs text-charcoal-500">
        <span>{c.signedIn}</span>
        <button
          type="button"
          onClick={signOut}
          className="underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
        >
          {c.signOut}
        </button>
      </div>
      {state === 'error' && <p className="text-sm text-terracotta-700">{c.failed}</p>}
      {state === 'none' && token && (
        <div>
          <h2 className="font-serif text-2xl">{c.createTitle}</h2>
          <p className="mb-5 mt-1 text-sm text-charcoal-500">{c.createLead}</p>
          <ProSignup accessToken={token} onExpired={signOut} />
        </div>
      )}
      {state === 'ready' && token && entry && <ProEdit accessToken={token} entry={entry} onExpired={signOut} />}
    </div>
  );
}
