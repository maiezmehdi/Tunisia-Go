'use client';

import { useRouter } from 'next/navigation';
import RewriteButton from '@/components/RewriteButton';
import { useState } from 'react';

import { CATEGORIES } from '@/data/tunisiaData';
import { CATEGORIES_FR } from '@/data/i18n/catalog.fr';
import { SPOT_TYPES, SPOT_TYPE_LABELS } from '@/lib/secretSpot';

const FIELD_LABELS: Record<string, string> = {
  name: 'le nom',
  area: 'la zone',
  why: 'la description',
  type: 'le type',
  category: 'la catégorie',
  coords: 'les coordonnées (Tunisie uniquement)',
  bestTime: 'la meilleure période',
};

const input =
  'mt-1 w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-charcoal-300';
const label = 'block text-xs font-medium uppercase tracking-[0.14em] text-charcoal-500';

const EMPTY = { name: '', type: 'other', category: 'culture', area: '', coords: '', why: '', bestTime: '' };

/** Adds a place straight to the map, without waiting for a visitor suggestion. */
export default function AddPlaceForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const set = (key: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setBusy(true);
    setMessage('');
    const res = await fetch('/api/admin/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      setForm(EMPTY);
      setOpen(false);
      router.refresh();
      return;
    }
    const data = (await res?.json().catch(() => null)) as { field?: string } | null;
    setMessage(data?.field ? `Vérifiez ${FIELD_LABELS[data.field] ?? data.field}.` : 'L’enregistrement a échoué.');
  };

  return (
    <section className="mt-16 border-t border-sand-200 pt-10" aria-label="Ajouter un lieu">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Ajouter un lieu</h2>
          <p className="mt-1 max-w-xl text-sm text-charcoal-500">
            Le lieu apparaît tout de suite sur la carte, comme une proposition acceptée : vous pourrez le retirer depuis
            la liste des propositions ci-dessus. Sans photo pour l’instant.
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-pill bg-charcoal px-5 py-2 text-sm text-cream transition hover:bg-charcoal-700"
          >
            Ajouter un lieu
          </button>
        )}
      </div>
      {open && (
        <div className="mt-6 grid gap-4 rounded-3xl border border-sand-200 bg-sand-50 p-5 sm:grid-cols-2 sm:p-6">
          <label className={label}>
            Nom
            <input className={input} value={form.name} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label className={label}>
            Zone ou ville
            <input className={input} value={form.area} onChange={(e) => set('area', e.target.value)} />
          </label>
          <label className={label}>
            Type
            <select className={input} value={form.type} onChange={(e) => set('type', e.target.value)}>
              {SPOT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SPOT_TYPE_LABELS.fr[t]}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Catégorie sur la carte
            <select className={input} value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {CATEGORIES_FR[c.id].label}
                </option>
              ))}
            </select>
          </label>
          <label className={`${label} sm:col-span-2`}>
            Coordonnées ou lien Google Maps
            <input
              className={input}
              placeholder="36.87, 10.34"
              value={form.coords}
              onChange={(e) => set('coords', e.target.value)}
            />
          </label>
          <div className="sm:col-span-2">
            <label className={label}>
              Description
              <textarea rows={4} className={input} value={form.why} onChange={(e) => set('why', e.target.value)} />
            </label>
            <RewriteButton value={form.why} kind="place" name={form.name} onAccept={(t) => set('why', t)} />
          </div>
          <label className={label}>
            Meilleure période (facultatif)
            <input className={input} value={form.bestTime} onChange={(e) => set('bestTime', e.target.value)} />
          </label>
          <div className="flex items-end gap-3 sm:justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={submit}
              className="rounded-pill bg-charcoal px-5 py-2 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-50"
            >
              Publier sur la carte
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-pill border border-sand-200 px-5 py-2 text-sm text-charcoal-700 transition hover:border-charcoal-300"
            >
              Annuler
            </button>
          </div>
          {message && (
            <p role="alert" className="text-sm text-terracotta-700 sm:col-span-2">
              {message}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
