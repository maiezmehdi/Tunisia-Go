'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface AdminWord {
  id: string;
  groupId: string;
  latin: string;
  ar: string;
  meaningFr: string;
}

const input =
  'mt-1 w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-charcoal-300';
const label = 'block text-xs font-medium uppercase tracking-[0.14em] text-charcoal-500';
const EMPTY = { groupId: '', latin: '', ar: '', meaningFr: '', meaningEn: '', tipFr: '', tipEn: '' };

/** Words added to « Les mots du cru » (page Pratique); the built-in ones stay in the code. */
export default function LexiconBoard({
  groups,
  words,
  tableMissing,
}: {
  groups: { id: string; title: string }[];
  words: AdminWord[];
  tableMissing: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY, groupId: groups[0]?.id ?? '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const add = async () => {
    setBusy(true);
    setMessage('');
    const res = await fetch('/api/admin/lexicon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      setForm({ ...EMPTY, groupId: form.groupId });
      router.refresh();
    } else setMessage('Vérifiez que le mot, l’arabe et les deux traductions sont remplis.');
  };

  const remove = async (id: string) => {
    if (!window.confirm('Retirer ce mot ?')) return;
    setBusy(true);
    await fetch(`/api/admin/lexicon/${id}`, { method: 'DELETE' }).catch(() => null);
    setBusy(false);
    router.refresh();
  };

  return (
    <section className="mt-16 border-t border-sand-200 pt-10" aria-label="Mots du cru">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Les mots du cru</h2>
          <p className="mt-1 max-w-xl text-sm text-charcoal-500">
            Ajoutez des mots à la page Pratique. {words.length} mot{words.length > 1 ? 's' : ''} ajouté
            {words.length > 1 ? 's' : ''} par vous ; ceux d’origine restent dans le site.
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-pill bg-charcoal px-5 py-2 text-sm text-cream transition hover:bg-charcoal-700"
          >
            Ajouter un mot
          </button>
        )}
      </div>

      {open && tableMissing && (
        <p className="mt-6 rounded-2xl border border-sand-200 bg-sand-50 p-4 text-sm text-charcoal-700">
          Il manque la table <code className="rounded bg-sand-100 px-1">lexicon_words</code> dans Supabase : exécutez le
          fichier <code className="rounded bg-sand-100 px-1">db/lexicon-words.sql</code>.
        </p>
      )}

      {open && !tableMissing && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 rounded-3xl border border-sand-200 bg-sand-50 p-5 sm:grid-cols-2 sm:p-6">
            <label className={label}>
              Rubrique
              <select className={input} value={form.groupId} onChange={(e) => set('groupId', e.target.value)}>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </label>
            <span />
            <label className={label}>
              Mot (lettres latines)
              <input className={input} value={form.latin} onChange={(e) => set('latin', e.target.value)} />
            </label>
            <label className={label}>
              En arabe
              <input dir="rtl" className={input} value={form.ar} onChange={(e) => set('ar', e.target.value)} />
            </label>
            <label className={label}>
              Sens en français
              <input className={input} value={form.meaningFr} onChange={(e) => set('meaningFr', e.target.value)} />
            </label>
            <label className={label}>
              Sens en anglais
              <input className={input} value={form.meaningEn} onChange={(e) => set('meaningEn', e.target.value)} />
            </label>
            <label className={label}>
              Astuce en français (facultatif)
              <input className={input} value={form.tipFr} onChange={(e) => set('tipFr', e.target.value)} />
            </label>
            <label className={label}>
              Astuce en anglais (facultatif)
              <input className={input} value={form.tipEn} onChange={(e) => set('tipEn', e.target.value)} />
            </label>
            <div className="flex items-center gap-4 sm:col-span-2">
              <button
                type="button"
                disabled={busy}
                onClick={add}
                className="rounded-pill bg-charcoal px-5 py-2 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-50"
              >
                Ajouter
              </button>
              {message && (
                <p role="status" className="text-sm text-charcoal-700">
                  {message}
                </p>
              )}
            </div>
          </div>

          {words.length > 0 && (
            <ul className="divide-y divide-sand-200 border-y border-sand-200">
              {words.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>
                    <span className="font-medium text-charcoal">{w.latin}</span>{' '}
                    <span lang="ar" className="text-charcoal-300">
                      {w.ar}
                    </span>{' '}
                    <span className="text-charcoal-500">· {w.meaningFr}</span>
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove(w.id)}
                    className="shrink-0 text-xs text-charcoal-500 underline underline-offset-4 hover:text-charcoal"
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
