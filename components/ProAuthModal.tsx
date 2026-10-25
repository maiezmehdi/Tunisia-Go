'use client';

import { useEffect, useRef, useState } from 'react';

import ProEdit, { type Entry } from '@/components/ProEdit';
import ProSignup from '@/components/ProSignup';
import ProSteps, { PRO_STEP_LABELS } from '@/components/ProSteps';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { useProAuth, type ProTokens } from '@/lib/proAuth';

const COPY = {
  fr: {
    close: 'Fermer',
    title: { signup: 'Créer mon compte', login: 'Se connecter', edit: 'Ma fiche', create: 'Ma fiche' },
    modeSignup: 'Créer mon compte',
    modeLogin: 'J’ai déjà un compte',
    email: 'Votre adresse e-mail',
    password: 'Mot de passe',
    passwordHint: '8 caractères au moins. Notez-le : il ne peut pas être récupéré pour le moment.',
    continue: 'Continuer',
    submitLogin: 'Me connecter',
    sending: 'Un instant…',
    badEmail: 'Cette adresse e-mail ne semble pas valide.',
    weak: 'Le mot de passe doit avoir au moins 8 caractères.',
    exists: 'Un compte existe déjà avec cet e-mail. Utilisez « J’ai déjà un compte ».',
    wrong: 'E-mail ou mot de passe incorrect.',
    tooMany: 'Trop d’essais. Réessayez dans une heure.',
    failed: 'Cela n’a pas abouti. Réessayez dans un instant.',
    off: 'La connexion n’est pas encore disponible. Réessayez plus tard.',
    signOut: 'Se déconnecter',
    loading: 'Chargement…',
    loadFailed: 'Impossible de charger votre fiche. Réessayez dans un instant.',
    createLead: 'Votre compte est créé. Remplissez votre fiche pour apparaître sur le site.',
  },
  en: {
    close: 'Close',
    title: { signup: 'Create my account', login: 'Sign in', edit: 'My listing', create: 'My listing' },
    modeSignup: 'Create my account',
    modeLogin: 'I already have an account',
    email: 'Your e-mail address',
    password: 'Password',
    passwordHint: 'At least 8 characters. Write it down: it cannot be recovered for now.',
    continue: 'Continue',
    submitLogin: 'Sign in',
    sending: 'One moment…',
    badEmail: 'This e-mail address does not look valid.',
    weak: 'The password must be at least 8 characters.',
    exists: 'An account already exists with this e-mail. Use “I already have an account”.',
    wrong: 'Wrong e-mail or password.',
    tooMany: 'Too many attempts. Please try again in an hour.',
    failed: 'That did not work. Please try again in a moment.',
    off: 'Sign-in is not available yet. Please try again later.',
    signOut: 'Sign out',
    loading: 'Loading…',
    loadFailed: 'Could not load your listing. Please try again in a moment.',
    createLead: 'Your account is created. Fill in your listing to appear on the site.',
  },
} as const;

const input =
  'mt-1.5 w-full rounded-2xl border border-sand-200 bg-white px-4 py-2.5 text-[15px] font-normal text-charcoal outline-none transition placeholder:text-charcoal-300 focus:border-charcoal';

/** Window for guides and agencies: sign in, or a step-by-step sign-up, then the edit form for an existing listing. */
export default function ProAuthModal() {
  const { locale } = useLocale();
  const c = COPY[locale];
  const { tokens, mode, setMode, setTokens, signOut, close } = useProAuth();
  const [entry, setEntry] = useState<Entry | 'none' | 'error' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [close]);

  const accessToken = tokens?.accessToken;
  useEffect(() => {
    if (!accessToken) return setEntry(null);
    let cancelled = false;
    fetch('/api/pro-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, action: 'get' }),
    })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) return signOut();
        if (res.status === 404) return setEntry('none');
        if (!res.ok) return setEntry('error');
        setEntry((await res.json()) as Entry);
      })
      .catch(() => !cancelled && setEntry('error'));
    return () => {
      cancelled = true;
    };
    // Only reload the listing when the person changes, not each time the token is renewed.
  }, [accessToken ? accessToken.slice(-12) : null]); // eslint-disable-line react-hooks/exhaustive-deps

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
        setEntry(null);
        return setTokens((await res.json()) as ProTokens);
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

  const signedIn = !!tokens;
  const title = !signedIn ? c.title[mode] : entry && typeof entry === 'object' ? c.title.edit : c.title.create;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center sm:items-center" role="presentation">
      <button
        type="button"
        aria-label={c.close}
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-default bg-charcoal/40"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-soft outline-none sm:max-w-lg sm:rounded-3xl sm:p-8"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-serif text-3xl leading-tight">{title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label={c.close}
            className="-mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-charcoal-500 transition hover:bg-sand-100 hover:text-charcoal"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {!signedIn && tokens !== undefined && (
          <>
            <div className="mb-5 flex gap-2">
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
            {mode === 'signup' && <ProSteps steps={PRO_STEP_LABELS[locale]} current={1} />}
            <form onSubmit={submit} className="space-y-3" noValidate>
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
                {busy ? c.sending : mode === 'signup' ? c.continue : c.submitLogin}
              </button>
              {formError && (
                <p role="alert" className="text-sm text-terracotta-700">
                  {formError}
                </p>
              )}
            </form>
          </>
        )}

        {(tokens === undefined || (signedIn && entry === null)) && (
          <p className="text-sm text-charcoal-500">{c.loading}</p>
        )}
        {signedIn && entry === 'error' && <p className="text-sm text-terracotta-700">{c.loadFailed}</p>}

        {signedIn && entry === 'none' && accessToken && (
          <>
            <p className="mb-5 text-sm text-charcoal-500">{c.createLead}</p>
            <ProSignup accessToken={accessToken} onExpired={signOut} />
          </>
        )}
        {signedIn && entry && typeof entry === 'object' && accessToken && (
          <ProEdit accessToken={accessToken} entry={entry} onExpired={signOut} />
        )}

        {signedIn && (
          <div className="mt-6 border-t border-sand-200 pt-4 text-xs text-charcoal-500">
            <button
              type="button"
              onClick={signOut}
              className="underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
            >
              {c.signOut}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
