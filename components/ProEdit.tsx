'use client';

import { useEffect, useState } from 'react';

import { useLocale } from '@/lib/i18n/LocaleProvider';

const COPY = {
  fr: {
    loading: 'Chargement…',
    unknown: 'Ce lien n’est pas valide. Vérifiez que vous l’avez copié en entier.',
    kind: { guide: 'Guide indépendant', agency: 'Agence' },
    name: 'Nom',
    card: 'Numéro de carte professionnelle de guide',
    socials: 'Réseaux sociaux ou site',
    whatsapp: 'Numéro WhatsApp',
    whatsappHint: 'Le numéro ne peut pas être changé ici : il identifie votre fiche.',
    save: 'Enregistrer',
    saving: 'Enregistrement…',
    saved: 'Modifications enregistrées.',
    pending: 'Votre fiche est en attente de vérification.',
    published: 'Votre fiche est publiée.',
    hidden: 'Votre fiche est masquée.',
    remove: 'Retirer ma fiche',
    confirmRemove: 'Confirmer le retrait',
    cancel: 'Annuler',
    removed: 'Votre fiche est retirée du site.',
    invalid: 'Vérifiez le nom et les réseaux.',
    invalidCard: 'Ce numéro de carte ne semble pas valide.',
    failed: 'L’enregistrement n’a pas abouti. Réessayez.',
    back: 'Voir les guides et agences',
  },
  en: {
    loading: 'Loading…',
    unknown: 'This link is not valid. Check that you copied all of it.',
    kind: { guide: 'Independent guide', agency: 'Agency' },
    name: 'Name',
    card: 'Professional guide card number',
    socials: 'Social networks or website',
    whatsapp: 'WhatsApp number',
    whatsappHint: 'The number cannot be changed here: it identifies your listing.',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Changes saved.',
    pending: 'Your listing is waiting to be checked.',
    published: 'Your listing is published.',
    hidden: 'Your listing is hidden.',
    remove: 'Remove my listing',
    confirmRemove: 'Confirm removal',
    cancel: 'Cancel',
    removed: 'Your listing has been removed from the site.',
    invalid: 'Check the name and the networks.',
    invalidCard: 'This card number does not look valid.',
    failed: 'Saving did not work. Please try again.',
    back: 'See guides and agencies',
  },
} as const;

const field =
  'mt-1.5 w-full rounded-2xl border border-sand-200 bg-white px-4 py-2.5 text-[15px] text-charcoal outline-none transition placeholder:text-charcoal-300 focus:border-charcoal';

interface Entry {
  kind: 'guide' | 'agency';
  status: 'published' | 'pending' | 'hidden';
  name: string;
  whatsapp: string;
  card: string;
  socials: string;
}

/** The private page behind a guide's link: the secret is in the address after #, so it never reaches the server logs. */
export default function ProEdit() {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [token, setToken] = useState('');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [state, setState] = useState<'loading' | 'unknown' | 'ready' | 'saving' | 'saved' | 'removed'>('loading');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);

  const call = (body: Record<string, unknown>) =>
    fetch('/api/pro-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  useEffect(() => {
    const t = window.location.hash.replace(/^#/, '');
    setToken(t);
    call({ token: t, action: 'get' })
      .then(async (res) => {
        if (!res.ok) return setState('unknown');
        setEntry((await res.json()) as Entry);
        setState('ready');
      })
      .catch(() => setState('unknown'));
  }, []);

  const set = (patch: Partial<Entry>) => setEntry((e) => (e ? { ...e, ...patch } : e));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;
    setState('saving');
    setError('');
    try {
      const res = await call({ token, action: 'save', name: entry.name, card: entry.card, socials: entry.socials });
      const data = (await res.json().catch(() => ({}))) as { error?: string; status?: Entry['status'] };
      if (res.ok) {
        if (data.status) set({ status: data.status });
        return setState('saved');
      }
      setState('ready');
      setError(data.error === 'invalid_card' ? c.invalidCard : data.error === 'invalid' ? c.invalid : c.failed);
    } catch {
      setState('ready');
      setError(c.failed);
    }
  };

  const remove = async () => {
    const res = await call({ token, action: 'remove' }).catch(() => null);
    if (res?.ok) setState('removed');
    else setError(c.failed);
  };

  if (state === 'loading') return <p className="text-sm text-charcoal-500">{c.loading}</p>;
  if (state === 'unknown') return <p className="text-sm text-terracotta-700">{c.unknown}</p>;
  if (state === 'removed') {
    return (
      <p role="status" className="text-sm text-charcoal-700">
        {c.removed}
      </p>
    );
  }
  if (!entry) return null;

  return (
    <form onSubmit={save} className="space-y-5 rounded-3xl border border-sand-200 bg-white p-6" noValidate>
      <p className="text-[11px] uppercase tracking-[0.16em] text-charcoal-300">
        {c.kind[entry.kind]} · {c[entry.status]}
      </p>
      <label className="block text-sm font-medium text-charcoal">
        {c.name}
        <input
          className={`${field} font-normal`}
          value={entry.name}
          maxLength={80}
          onChange={(e) => set({ name: e.target.value })}
        />
      </label>
      <div className="text-sm font-medium text-charcoal">
        {c.whatsapp}
        <p className="mt-1.5 rounded-2xl border border-sand-200 bg-sand-50 px-4 py-2.5 text-[15px] font-normal text-charcoal-700">
          +{entry.whatsapp}
        </p>
        <span className="mt-1 block text-xs font-normal text-charcoal-500">{c.whatsappHint}</span>
      </div>
      {entry.kind === 'guide' ? (
        <label className="block text-sm font-medium text-charcoal">
          {c.card}
          <input
            className={`${field} font-normal`}
            value={entry.card}
            maxLength={40}
            autoComplete="off"
            onChange={(e) => set({ card: e.target.value })}
          />
        </label>
      ) : null}
      <label className="block text-sm font-medium text-charcoal">
        {c.socials}
        <input
          className={`${field} font-normal`}
          value={entry.socials}
          maxLength={200}
          autoComplete="off"
          onChange={(e) => set({ socials: e.target.value })}
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === 'saving'}
          className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
        >
          {state === 'saving' ? c.saving : c.save}
        </button>
        {state === 'saved' && (
          <p role="status" className="text-sm text-charcoal-700">
            {c.saved}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-terracotta-700">
            {error}
          </p>
        )}
      </div>

      <div className="border-t border-sand-200 pt-4 text-sm">
        {confirm ? (
          <span className="inline-flex gap-4">
            <button type="button" onClick={remove} className="text-terracotta-700 underline underline-offset-4">
              {c.confirmRemove}
            </button>
            <button type="button" onClick={() => setConfirm(false)} className="text-charcoal-500">
              {c.cancel}
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="text-charcoal-500 underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
          >
            {c.remove}
          </button>
        )}
      </div>
    </form>
  );
}
