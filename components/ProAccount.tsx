'use client';

import { useEffect, useState } from 'react';

import ProEdit, { type Entry } from '@/components/ProEdit';
import ProSignup from '@/components/ProSignup';
import { useLocale } from '@/lib/i18n/LocaleProvider';

const COPY = {
  fr: {
    loading: 'Chargement…',
    intro: 'Créez votre compte avec votre e-mail et un mot de passe, puis gérez votre fiche quand vous voulez.',
    modeSignup: 'Créer mon compte',
    modeLogin: 'J’ai déjà un compte',
    email: 'Votre adresse e-mail',
    password: 'Mot de passe',
    passwordHint: '8 caractères au moins. Notez-le : il ne peut pas être récupéré pour le moment.',
    submitSignup: 'Créer mon compte',
    submitLogin: 'Me connecter',
    sending: 'Un instant…',
    badEmail: 'Cette adresse e-mail ne semble pas valide.',
    weak: 'Le mot de passe doit avoir au moins 8 caractères.',
    exists: 'Un compte existe déjà avec cet e-mail. Utilisez « J’ai déjà un compte ».',
    wrong: 'E-mail ou mot de passe incorrect.',
    tooMany: 'Trop d’essais. Réessayez dans une heure.',
    failed: 'Cela n’a pas abouti. Réessayez dans un instant.',
    off: 'La connexion n’est pas encore disponible. Réessayez plus tard.',
    signedIn: 'Connecté',
    signOut: 'Se déconnecter',
    createTitle: 'Votre fiche',
    createLead: 'Remplissez ce court formulaire pour apparaître sur le site.',
    loadFailed: 'Impossible de charger votre fiche. Réessayez dans un instant.',
  },
  en: {
    loading: 'Loading…',
    intro: 'Create your account with your e-mail and a password, then manage your listing whenever you like.',
    modeSignup: 'Create my account',
    modeLogin: 'I already have an account',
    email: 'Your e-mail address',
    password: 'Password',
    passwordHint: 'At least 8 characters. Write it down: it cannot be recovered for now.',
    submitSignup: 'Create my account',
    submitLogin: 'Sign in',
    sending: 'One moment…',
    badEmail: 'This e-mail address does not look valid.',
    weak: 'The password must be at least 8 characters.',
    exists: 'An account already exists with this e-mail. Use “I already have an account”.',
    wrong: 'Wrong e-mail or password.',
    tooMany: 'Too many attempts. Please try again in an hour.',
    failed: 'That did not work. Please try again in a moment.',
    off: 'Sign-in is not available yet. Please try again later.',
    signedIn: 'Signed in',
    signOut: 'Sign out',
    createTitle: 'Your listing',
    createLead: 'Fill in this short form to appear on the site.',
    loadFailed: 'Could not load your listing. Please try again in a moment.',
  },
} as const;

const KEY = 'tg-pro-session';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

function readTokens(): Tokens | null {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as Partial<Tokens>) : null;
    return v?.accessToken && v.refreshToken ? { accessToken: v.accessToken, refreshToken: v.refreshToken } : null;
  } catch {
    return null;
  }
}

function saveTokens(tokens: Tokens | null) {
  try {
    if (tokens) localStorage.setItem(KEY, JSON.stringify(tokens));
    else localStorage.removeItem(KEY);
  } catch {
    /* the sign-in still works for this visit */
  }
}

async function refresh(refreshToken: string): Promise<Tokens | null> {
  try {
    const res = await fetch('/api/pro-auth/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'refresh', refreshToken }),
    });
    return res.ok ? ((await res.json()) as Tokens) : null;
  } catch {
    return null;
  }
}

/** Where guides and agencies create their account (e-mail and password), then register or edit their entry. */
export default function ProAccount() {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [state, setState] = useState<'loading' | 'signedOut' | 'none' | 'ready' | 'error'>('loading');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const signOut = () => {
    saveTokens(null);
    setTokens(null);
    setEntry(null);
    setState('signedOut');
  };

  const load = async (t: Tokens) => {
    saveTokens(t);
    setTokens(t);
    try {
      const res = await fetch('/api/pro-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: t.accessToken, action: 'get' }),
      });
      if (res.status === 401) return signOut();
      if (res.status === 404) return setState('none');
      if (!res.ok) return setState('error');
      setEntry((await res.json()) as Entry);
      setState('ready');
    } catch {
      setState('error');
    }
  };

  useEffect(() => {
    const saved = readTokens();
    if (!saved) return setState('signedOut');
    // The access token only lives about an hour: renew it on arrival, then keep renewing while the page is open.
    void refresh(saved.refreshToken).then((t) => (t ? void load(t) : signOut()));
    const timer = window.setInterval(
      () => {
        const current = readTokens();
        if (!current) return;
        void refresh(current.refreshToken).then((t) => {
          if (!t) return;
          saveTokens(t);
          setTokens(t);
        });
      },
      40 * 60 * 1000,
    );
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const res = await fetch('/api/pro-auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, email, password }),
      });
      if (res.ok) {
        setPassword('');
        setState('loading');
        return void (await load((await res.json()) as Tokens));
      }
      const code = ((await res.json().catch(() => ({}))) as { error?: string }).error;
      setFormError(
        code === 'invalid'
          ? c.badEmail
          : code === 'weak'
            ? c.weak
            : code === 'exists'
              ? c.exists
              : code === 'wrong'
                ? c.wrong
                : res.status === 429
                  ? c.tooMany
                  : res.status === 503
                    ? c.off
                    : c.failed,
      );
    } catch {
      setFormError(c.failed);
    } finally {
      setBusy(false);
    }
  };

  if (state === 'loading') return <p className="text-sm text-charcoal-500">{c.loading}</p>;

  if (state === 'signedOut') {
    const input =
      'mt-1.5 w-full rounded-2xl border border-sand-200 bg-white px-4 py-2.5 text-[15px] font-normal text-charcoal outline-none transition placeholder:text-charcoal-300 focus:border-charcoal';
    return (
      <div className="space-y-5">
        <p className="max-w-md text-[15px] leading-relaxed text-charcoal-500">{c.intro}</p>
        <div className="flex max-w-md gap-2">
          {(['signup', 'login'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setFormError('');
              }}
              className={`rounded-pill border px-4 py-1.5 text-sm transition ${
                mode === m
                  ? 'border-charcoal bg-charcoal text-cream'
                  : 'border-sand-200 bg-white text-charcoal-700 hover:border-charcoal-300'
              }`}
            >
              {m === 'signup' ? c.modeSignup : c.modeLogin}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="max-w-md space-y-3" noValidate>
          <label className="block text-sm font-medium text-charcoal">
            {c.email}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              maxLength={254}
              required
              className={input}
            />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            {c.password}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={8}
              maxLength={72}
              required
              className={input}
            />
            {mode === 'signup' && (
              <span className="mt-1 block text-xs font-normal text-charcoal-500">{c.passwordHint}</span>
            )}
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
          >
            {busy ? c.sending : mode === 'signup' ? c.submitSignup : c.submitLogin}
          </button>
          {formError && (
            <p role="alert" className="text-sm text-terracotta-700">
              {formError}
            </p>
          )}
        </form>
      </div>
    );
  }

  const token = tokens?.accessToken;
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
      {state === 'error' && <p className="text-sm text-terracotta-700">{c.loadFailed}</p>}
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
