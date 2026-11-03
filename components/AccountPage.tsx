'use client';

import { useEffect, useState } from 'react';

import AccountTypeChange from '@/components/AccountTypeChange';
import AccountShell, { type AccountSection } from '@/components/AccountShell';
import AccountSaved from '@/components/AccountSaved';
import AccountSettings from '@/components/AccountSettings';
import PartnerForm from '@/components/PartnerForm';
import ProEdit, { type Entry } from '@/components/ProEdit';
import ProSignup from '@/components/ProSignup';
import ProSteps from '@/components/ProSteps';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { accountHref, useProAuth, type ProAuthMode, type ProTokens } from '@/lib/proAuth';

const COPY = {
  fr: {
    titleIn: 'Se connecter',
    titleUp: 'Créer un compte',
    titleMe: 'Mon compte',
    modeSignup: 'Créer un compte',
    modeLogin: 'J’ai déjà un compte',
    who: 'Vous êtes',
    traveler: 'Voyageur',
    travelerHint: 'Je prépare un voyage en Tunisie.',
    pro: 'Guide ou agence',
    proHint: 'Je veux présenter ma fiche aux voyageurs.',
    partner: 'Partenaire',
    partnerHint: 'Hôtel, maison d’hôtes, location de voiture ou restaurant.',
    partnerLabel: 'Partenaire',
    partnerTitle: 'Mon établissement',
    email: 'Votre adresse e-mail',
    password: 'Mot de passe',
    passwordHint: '8 caractères au moins.',
    forgot: 'Mot de passe oublié ?',
    forgotTitle: 'Réinitialiser le mot de passe',
    forgotLead: 'Indiquez votre adresse e-mail : nous vous envoyons un lien pour choisir un nouveau mot de passe.',
    forgotSend: 'Envoyer le lien',
    forgotSent:
      'Si un compte existe avec cette adresse, un e-mail vient de partir. Pensez à regarder les courriers indésirables.',
    backToLogin: 'Retour à la connexion',
    newTitle: 'Choisir un nouveau mot de passe',
    newSave: 'Enregistrer et me connecter',
    newDone: 'Votre mot de passe a bien été modifié. Vous êtes connecté.',
    newExpired: 'Ce lien n’est plus valable. Demandez-en un nouveau avec « Mot de passe oublié ? ».',
    continueUp: 'Créer mon compte',
    continueProPrefix: 'Continuer',
    submitLogin: 'Me connecter',
    sending: 'Un instant…',
    badEmail: 'Cette adresse e-mail ne semble pas valide.',
    weak: 'Le mot de passe doit avoir au moins 8 caractères.',
    exists: 'Un compte existe déjà avec cet e-mail. Utilisez « J’ai déjà un compte ».',
    wrong: 'E-mail ou mot de passe incorrect.',
    tooMany: 'Trop d’essais. Réessayez dans une heure.',
    failed: 'Cela n’a pas abouti. Réessayez dans un instant.',
    off: 'La connexion n’est pas encore disponible. Réessayez plus tard.',
    facebook: 'Continuer avec Facebook',
    facebookFailed: 'La connexion avec Facebook n’a pas abouti. Réessayez ou utilisez votre e-mail.',
    or: 'ou',
    loading: 'Chargement…',
    emailLabel: 'Adresse e-mail',
    typeLabel: 'Type de compte',
    travelerLabel: 'Voyageur',
    proLabel: 'Guide ou agence',
    listingTitle: 'Ma fiche',
    loadFailed: 'Impossible de charger votre fiche. Réessayez dans un instant.',
    createLead: 'Votre compte est créé. Remplissez votre fiche pour apparaître sur le site.',
    signOut: 'Se déconnecter',
    delete: 'Supprimer mon compte',
    deleteTraveler: 'Votre compte sera supprimé définitivement.',
    deletePro: 'Votre compte et votre fiche seront supprimés définitivement.',
    deletePartner: 'Votre compte et la fiche de votre établissement seront supprimés définitivement.',
    deleteConfirm: 'Oui, supprimer',
    cancel: 'Annuler',
    deleteFailed: 'La suppression n’a pas abouti. Réessayez dans un instant.',
    stepLabels: ['Compte', 'Vous', 'Profil', 'Envoi'],
    menuLabel: 'Menu du compte',
    closeLabel: 'Fermer le menu',
    navFavorites: 'Mes favoris',
    navTrip: 'Mon voyage',
    navSettings: 'Réglages',
  },
  en: {
    titleIn: 'Sign in',
    titleUp: 'Create an account',
    titleMe: 'My account',
    modeSignup: 'Create an account',
    modeLogin: 'I already have an account',
    who: 'You are',
    traveler: 'Traveller',
    travelerHint: 'I am planning a trip to Tunisia.',
    pro: 'Guide or agency',
    proHint: 'I want to present my listing to travellers.',
    partner: 'Partner',
    partnerHint: 'Hotel, guesthouse, car rental or restaurant.',
    partnerLabel: 'Partner',
    partnerTitle: 'My business',
    email: 'Your e-mail address',
    password: 'Password',
    passwordHint: 'At least 8 characters.',
    forgot: 'Forgot your password?',
    forgotTitle: 'Reset your password',
    forgotLead: 'Enter your e-mail address and we will send you a link to choose a new password.',
    forgotSend: 'Send the link',
    forgotSent: 'If an account exists with this address, an e-mail is on its way. Check your spam folder too.',
    backToLogin: 'Back to sign in',
    newTitle: 'Choose a new password',
    newSave: 'Save and sign me in',
    newDone: 'Your password has been changed. You are signed in.',
    newExpired: 'This link is no longer valid. Ask for a new one with “Forgot your password?”.',
    continueUp: 'Create my account',
    continueProPrefix: 'Continue',
    submitLogin: 'Sign in',
    sending: 'One moment…',
    badEmail: 'This e-mail address does not look valid.',
    weak: 'The password must be at least 8 characters.',
    exists: 'An account already exists with this e-mail. Use “I already have an account”.',
    wrong: 'Wrong e-mail or password.',
    tooMany: 'Too many attempts. Please try again in an hour.',
    failed: 'That did not work. Please try again in a moment.',
    off: 'Sign-in is not available yet. Please try again later.',
    facebook: 'Continue with Facebook',
    facebookFailed: 'Facebook sign-in did not work. Try again or use your e-mail.',
    or: 'or',
    loading: 'Loading…',
    emailLabel: 'E-mail address',
    typeLabel: 'Account type',
    travelerLabel: 'Traveller',
    proLabel: 'Guide or agency',
    listingTitle: 'My listing',
    loadFailed: 'Could not load your listing. Please try again in a moment.',
    createLead: 'Your account is created. Fill in your listing to appear on the site.',
    signOut: 'Sign out',
    delete: 'Delete my account',
    deleteTraveler: 'Your account will be permanently deleted.',
    deletePro: 'Your account and your listing will be permanently deleted.',
    deletePartner: 'Your account and your business listing will be permanently deleted.',
    deleteConfirm: 'Yes, delete',
    cancel: 'Cancel',
    deleteFailed: 'Deleting did not work. Please try again in a moment.',
    stepLabels: ['Account', 'You', 'Profile', 'Send'],
    menuLabel: 'Account menu',
    closeLabel: 'Close the menu',
    navFavorites: 'My favourites',
    navTrip: 'My trip',
    navSettings: 'Settings',
  },
} as const;

/** "Continue with Facebook" stays hidden until NEXT_PUBLIC_FACEBOOK_LOGIN=on (Meta must approve the app first). */
const FACEBOOK_LOGIN = process.env.NEXT_PUBLIC_FACEBOOK_LOGIN === 'on';

const input =
  'mt-1.5 w-full rounded-2xl border border-sand-200 bg-white px-4 py-2.5 text-[15px] font-normal text-charcoal outline-none transition placeholder:text-charcoal-300 focus:border-charcoal';
const primary =
  'rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-60';

/** Sign in, create an account (traveller or guide/agency), and the signed-in account page. */
export default function AccountPage() {
  const { locale } = useLocale();
  const c = COPY[locale];
  const { tokens, account, setTokens, signOut } = useProAuth();
  const [mode, setMode] = useState<ProAuthMode>('login');
  const [kind, setKind] = useState<'traveler' | 'pro' | 'partner'>('traveler');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [sent, setSent] = useState(false);
  const [recovery, setRecovery] = useState<ProTokens | null>(null);
  const [passwordSet, setPasswordSet] = useState(false);
  const [entry, setEntry] = useState<Entry | 'none' | 'error' | null>(null);

  const accessToken = tokens?.accessToken;
  const isPro = account?.kind === 'pro';
  useEffect(() => {
    if (!accessToken || !isPro) return setEntry(null);
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
  }, [accessToken ? accessToken.slice(-12) : null, isPro]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Back from Facebook (through Supabase): the session is in the address after #.
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');
    if (accessToken && refreshToken) {
      window.history.replaceState(null, '', window.location.pathname);
      // Back from the "forgot password" e-mail: ask for the new password before opening the session.
      if (hash.get('type') === 'recovery') setRecovery({ accessToken, refreshToken });
      else setTokens({ accessToken, refreshToken });
    } else if (hash.get('error')) {
      window.history.replaceState(null, '', window.location.pathname);
      setError(hash.get('error_code') === 'otp_expired' ? COPY[locale].newExpired : COPY[locale].facebookFailed);
    }
    if (new URLSearchParams(window.location.search).get('auth') === 'off') setError(COPY[locale].off);
    const q = new URLSearchParams(window.location.search);
    if (q.get('mode') === 'signup') setMode('signup');
    const k = q.get('kind');
    if (k === 'pro' || k === 'partner') setKind(k);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/pro-auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, email, password, kind }),
      });
      if (res.ok) {
        setPassword('');
        const session = (await res.json()) as ProTokens;
        return setTokens(session);
      }
      const code = ((await res.json().catch(() => ({}))) as { error?: string }).error;
      setError(
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
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  };

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/pro-auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang: locale }),
      });
      if (res.ok) return setSent(true);
      setError(
        res.status === 400 ? c.badEmail : res.status === 429 ? c.tooMany : res.status === 503 ? c.off : c.failed,
      );
    } catch {
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  };

  const saveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recovery) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: recovery.accessToken, action: 'recover-password', newPassword: password }),
      });
      if (res.ok) {
        setPassword('');
        setPasswordSet(true);
        setRecovery(null);
        return setTokens(recovery);
      }
      const code = ((await res.json().catch(() => ({}))) as { error?: string }).error;
      setError(code === 'weak' ? c.weak : code === 'expired' || res.status === 401 ? c.newExpired : c.failed);
    } catch {
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!tokens) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: tokens.accessToken, action: 'delete' }),
      });
      if (!res.ok) throw new Error(String(res.status));
      signOut();
      window.location.assign(locale === 'en' ? '/en' : '/');
    } catch {
      setError(c.deleteFailed);
      setBusy(false);
    }
  };

  if (recovery) {
    return (
      <form onSubmit={saveNewPassword} className="space-y-4" noValidate>
        <h2 className="font-serif text-2xl">{c.newTitle}</h2>
        <label className="block text-sm font-medium text-charcoal">
          {c.password}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
            className={input}
          />
          <span className="mt-1 block text-xs font-normal text-charcoal-500">{c.passwordHint}</span>
        </label>
        <button type="submit" disabled={busy} className={primary}>
          {busy ? c.sending : c.newSave}
        </button>
        {error && (
          <p role="alert" className="text-sm text-terracotta-700">
            {error}
          </p>
        )}
      </form>
    );
  }

  if (tokens === undefined || (tokens && account === undefined)) {
    return <p className="text-sm text-charcoal-500">{c.loading}</p>;
  }

  if (tokens && account) {
    const typeLabel = isPro ? c.proLabel : account.kind === 'partner' ? c.partnerLabel : c.travelerLabel;
    const settings = (
      <div className="space-y-6">
        {accessToken && <AccountTypeChange accessToken={accessToken} current={account.kind} />}
        {accessToken && <AccountSettings accessToken={accessToken} />}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={signOut}
            className="rounded-pill border border-sand-200 bg-white px-5 py-2.5 text-sm text-charcoal-700 transition hover:border-charcoal-300"
          >
            {c.signOut}
          </button>
        </div>
        <div className="border-t border-sand-200 pt-5 text-sm">
          {confirmDelete ? (
            <div className="space-y-3">
              <p className="text-charcoal-700">
                {isPro ? c.deletePro : account.kind === 'partner' ? c.deletePartner : c.deleteTraveler}
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={remove} disabled={busy} className={primary}>
                  {busy ? c.sending : c.deleteConfirm}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="text-charcoal-500 underline">
                  {c.cancel}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-charcoal-500 underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
            >
              {c.delete}
            </button>
          )}
          {error && (
            <p role="alert" className="mt-3 text-terracotta-700">
              {error}
            </p>
          )}
        </div>
      </div>
    );

    // The menu depends on the account type: travellers keep favourites and their trip,
    // guides and agencies their listing, partners their business.
    const sections: AccountSection[] = [];
    if (account.kind === 'traveler') {
      sections.push(
        { id: 'favoris', label: c.navFavorites, content: <AccountSaved part="favorites" /> },
        { id: 'voyage', label: c.navTrip, content: <AccountSaved part="trip" /> },
      );
    }
    if (account.kind === 'partner' && accessToken) {
      sections.push({
        id: 'etablissement',
        label: c.partnerTitle,
        content: (
          <section aria-label={c.partnerTitle} className="space-y-4">
            <h2 className="font-serif text-2xl">{c.partnerTitle}</h2>
            <PartnerForm accessToken={accessToken} onExpired={signOut} />
          </section>
        ),
      });
    }
    if (isPro && accessToken) {
      sections.push({
        id: 'fiche',
        label: c.listingTitle,
        content: (
          <section aria-label={c.listingTitle} className="space-y-4">
            <h2 className="font-serif text-2xl">{c.listingTitle}</h2>
            {entry === null && <p className="text-sm text-charcoal-500">{c.loading}</p>}
            {entry === 'error' && <p className="text-sm text-terracotta-700">{c.loadFailed}</p>}
            {entry === 'none' && (
              <>
                <p className="text-sm text-charcoal-500">{c.createLead}</p>
                <ProSignup accessToken={accessToken} onExpired={signOut} />
              </>
            )}
            {entry && typeof entry === 'object' && (
              <ProEdit accessToken={accessToken} entry={entry} onExpired={signOut} />
            )}
          </section>
        ),
      });
    }
    sections.push({ id: 'reglages', label: c.navSettings, content: settings });

    return (
      <>
        {passwordSet && (
          <p role="status" className="mb-6 rounded-2xl border border-sand-200 bg-white px-5 py-3 text-sm text-charcoal">
            {c.newDone}
          </p>
        )}
        <AccountShell
          email={account.email}
          typeLabel={typeLabel}
          sections={sections}
          menuLabel={c.menuLabel}
          closeLabel={c.closeLabel}
        />
      </>
    );
  }

  if (forgot) {
    return (
      <form onSubmit={sendLink} className="space-y-4" noValidate>
        <h2 className="font-serif text-2xl">{c.forgotTitle}</h2>
        {sent ? (
          <p role="status" className="text-sm text-charcoal-700">
            {c.forgotSent}
          </p>
        ) : (
          <>
            <p className="text-sm text-charcoal-500">{c.forgotLead}</p>
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
            <button type="submit" disabled={busy} className={primary}>
              {busy ? c.sending : c.forgotSend}
            </button>
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-terracotta-700">
            {error}
          </p>
        )}
        <p>
          <button
            type="button"
            onClick={() => {
              setForgot(false);
              setSent(false);
              setError('');
            }}
            className="text-sm text-charcoal-500 underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
          >
            {c.backToLogin}
          </button>
        </p>
      </form>
    );
  }

  const types = [
    { id: 'traveler', label: c.traveler, hint: c.travelerHint },
    { id: 'pro', label: c.pro, hint: c.proHint },
    { id: 'partner', label: c.partner, hint: c.partnerHint },
  ] as const;

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {(['signup', 'login'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError('');
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
      {FACEBOOK_LOGIN && (mode === 'login' || kind === 'traveler') && (
        <div className="mb-5">
          <a
            href={`/api/pro-auth/facebook${locale === 'en' ? '?lang=en' : ''}`}
            className="flex items-center justify-center gap-2.5 rounded-pill border border-sand-200 bg-white px-5 py-2.5 text-sm text-charcoal-700 transition hover:border-charcoal-300"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
              <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
            </svg>
            {c.facebook}
          </a>
          <p className="mt-4 text-center text-xs text-charcoal-500">{c.or}</p>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4" noValidate>
        {mode === 'signup' && (
          <fieldset>
            <legend className="text-sm font-medium text-charcoal">{c.who}</legend>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
              {types.map((t) => (
                <label
                  key={t.id}
                  className={`cursor-pointer rounded-2xl border px-4 py-3 transition ${
                    kind === t.id ? 'border-charcoal bg-white' : 'border-sand-200 bg-white/60 hover:border-charcoal-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="kind"
                    value={t.id}
                    checked={kind === t.id}
                    onChange={() => setKind(t.id)}
                    className="sr-only"
                  />
                  <span className="block text-[15px] font-medium text-charcoal">{t.label}</span>
                  <span className="mt-0.5 block text-xs text-charcoal-500">{t.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {mode === 'signup' && kind === 'pro' && <ProSteps steps={[...c.stepLabels]} current={1} />}
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
        <button type="submit" disabled={busy} className={primary}>
          {busy ? c.sending : mode === 'login' ? c.submitLogin : kind === 'pro' ? c.continueProPrefix : c.continueUp}
        </button>
        {mode === 'login' && (
          <p>
            <button
              type="button"
              onClick={() => {
                setForgot(true);
                setError('');
              }}
              className="text-sm text-charcoal-500 underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
            >
              {c.forgot}
            </button>
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-terracotta-700">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
