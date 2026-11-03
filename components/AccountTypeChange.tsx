'use client';

import { useState } from 'react';

import { useLocale } from '@/lib/i18n/LocaleProvider';
import type { AccountKind } from '@/lib/pros';

const COPY = {
  fr: {
    title: 'Type de compte',
    lead: 'Votre compte est de type :',
    kinds: { traveler: 'Voyageur', pro: 'Guide ou agence', partner: 'Partenaire' },
    change: 'Changer de type',
    save: 'Enregistrer',
    sending: 'Un instant…',
    hasListing: 'Vous avez une fiche en ligne. Supprimez votre compte pour changer de type.',
    failed: 'Cela n’a pas abouti. Réessayez dans un instant.',
  },
  en: {
    title: 'Account type',
    lead: 'Your account type is:',
    kinds: { traveler: 'Traveller', pro: 'Guide or agency', partner: 'Partner' },
    change: 'Change type',
    save: 'Save',
    sending: 'One moment…',
    hasListing: 'You have a listing online. Delete your account to change its type.',
    failed: 'That did not work. Please try again in a moment.',
  },
} as const;

/** Shows the account type and lets a signed-in person switch it (not while a listing exists). */
export default function AccountTypeChange({ accessToken, current }: { accessToken: string; current: AccountKind }) {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [editing, setEditing] = useState(false);
  const [kind, setKind] = useState<AccountKind>(current);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (kind === current) return setEditing(false);
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, action: 'set-type', kind }),
      });
      if (res.ok) return window.location.reload();
      const code = ((await res.json().catch(() => ({}))) as { error?: string }).error;
      setError(code === 'has_listing' ? c.hasListing : c.failed);
    } catch {
      setError(c.failed);
    }
    setBusy(false);
  };

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-2xl">{c.title}</h2>
      <p className="text-[15px] text-charcoal-700">
        {c.lead} <strong className="font-medium text-charcoal">{c.kinds[current]}</strong>
      </p>
      {editing ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={c.title}>
            {(['traveler', 'pro', 'partner'] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={`rounded-pill border px-4 py-1.5 text-sm transition ${
                  kind === k
                    ? 'border-charcoal bg-charcoal text-cream'
                    : 'border-sand-200 bg-white text-charcoal-700 hover:border-charcoal-300'
                }`}
              >
                {c.kinds[k]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
          >
            {busy ? c.sending : c.save}
          </button>
          {error && (
            <p role="alert" className="text-sm text-terracotta-700">
              {error}
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm text-charcoal-500 underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
        >
          {c.change}
        </button>
      )}
    </section>
  );
}
