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
    email: 'Votre adresse e-mail',
    sendLink: 'Recevoir mon lien',
    sending: 'Envoi…',
    sent: 'Un lien de connexion vient d’être envoyé. Ouvrez votre boîte e-mail (et les courriers indésirables), puis cliquez sur le lien.',
    badEmail: 'Cette adresse e-mail ne semble pas valide.',
    tooMany: 'Trop de demandes pour le moment. Réessayez plus tard.',
    sendFailed: 'L’envoi n’a pas abouti. Réessayez dans un instant.',
    off: 'La connexion n’est pas encore disponible. Réessayez plus tard.',
    signedIn: 'Connecté',
    signOut: 'Se déconnecter',
    createTitle: 'Votre fiche',
    createLead: 'Remplissez ce court formulaire pour apparaître sur le site.',
    failed: 'Impossible de charger votre fiche. Réessayez dans un instant.',
  },
  en: {
    loading: 'Loading…',
    intro:
      'Sign in with Google to register your listing or change it. Your Google account is only used to recognise you.',
    email: 'Your e-mail address',
    sendLink: 'Get my link',
    sending: 'Sending…',
    sent: 'A sign-in link has just been sent. Check your inbox (and spam), then click the link.',
    badEmail: 'This e-mail address does not look valid.',
    tooMany: 'Too many requests for now. Please try again later.',
    sendFailed: 'Sending did not work. Please try again in a moment.',
    off: 'Sign-in is not available yet. Please try again later.',
    signedIn: 'Signed in',
    signOut: 'Sign out',
    createTitle: 'Your listing',
    createLead: 'Fill in this short form to appear on the site.',
    failed: 'Could not load your listing. Please try again in a moment.',
  },
} as const;

const KEY = 'tg-pro-token';

/** Where guides and agencies sign in with an e-mail link, then register their entry or edit the one they have. */
export default function ProAccount() {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'signedOut' | 'none' | 'ready' | 'error'>('loading');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [off, setOff] = useState(false);
  const [email, setEmail] = useState('');
  const [mail, setMail] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [mailError, setMailError] = useState('');

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

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMail('sending');
    try {
      const res = await fetch('/api/pro-auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang: locale }),
      });
      if (res.ok) return setMail('sent');
      setMail('error');
      setMailError(
        res.status === 400 ? c.badEmail : res.status === 429 ? c.tooMany : res.status === 503 ? c.off : c.sendFailed,
      );
    } catch {
      setMail('error');
      setMailError(c.sendFailed);
    }
  };

  if (state === 'loading') return <p className="text-sm text-charcoal-500">{c.loading}</p>;

  if (state === 'signedOut') {
    return (
      <div className="space-y-5">
        <p className="max-w-md text-[15px] leading-relaxed text-charcoal-500">{c.intro}</p>
        {mail === 'sent' ? (
          <p
            role="status"
            className="max-w-md rounded-2xl border border-sand-200 bg-white p-4 text-sm leading-relaxed text-charcoal"
          >
            {c.sent}
          </p>
        ) : (
          <form onSubmit={sendLink} className="max-w-md space-y-3" noValidate>
            <label className="block text-sm font-medium text-charcoal">
              {c.email}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                maxLength={254}
                required
                className="mt-1.5 w-full rounded-2xl border border-sand-200 bg-white px-4 py-2.5 text-[15px] font-normal text-charcoal outline-none transition placeholder:text-charcoal-300 focus:border-charcoal"
              />
            </label>
            <button
              type="submit"
              disabled={mail === 'sending'}
              className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
            >
              {mail === 'sending' ? c.sending : c.sendLink}
            </button>
            {mail === 'error' && (
              <p role="alert" className="text-sm text-terracotta-700">
                {mailError}
              </p>
            )}
          </form>
        )}
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
