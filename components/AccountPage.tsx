'use client';

import { useEffect, useState } from 'react';

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
    passwordHint: '8 caractères au moins. Notez-le : il ne peut pas être récupéré pour le moment.',
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
    passwordHint: 'At least 8 characters. Write it down: it cannot be recovered for now.',
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
  },
} as const;

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

  if (tokens === undefined || (tokens && account === undefined)) {
    return <p className="text-sm text-charcoal-500">{c.loading}</p>;
  }

  if (tokens && account) {
    return (
      <div className="space-y-6">
        <dl className="space-y-3 rounded-3xl border border-sand-200 bg-white p-5 text-[15px]">
          <div>
            <dt className="text-xs text-charcoal-500">{c.emailLabel}</dt>
            <dd className="mt-0.5 break-all text-charcoal">{account.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-charcoal-500">{c.typeLabel}</dt>
            <dd className="mt-0.5 text-charcoal">
              {isPro ? c.proLabel : account.kind === 'partner' ? c.partnerLabel : c.travelerLabel}
            </dd>
          </div>
        </dl>
        {account.kind === 'traveler' && <AccountSaved />}
        {account.kind === 'partner' && accessToken && (
          <section aria-label={c.partnerTitle} className="space-y-4">
            <h2 className="font-serif text-2xl">{c.partnerTitle}</h2>
            <PartnerForm accessToken={accessToken} onExpired={signOut} />
          </section>
        )}
        {isPro && accessToken && (
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
        )}
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
        {error && (
          <p role="alert" className="text-sm text-terracotta-700">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
