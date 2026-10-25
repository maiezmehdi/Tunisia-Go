'use client';

import { useCallback, useEffect, useState } from 'react';

import RewriteButton from '@/components/RewriteButton';
import { resizeImage } from '@/lib/resizeImage';

type Fields = Record<string, string>;
interface Loaded {
  original: { fr: Fields; en: Fields };
  fr: Fields;
  en: Fields;
  photos: { path: string; url: string }[];
}

const FIELDS: { key: string; label: string; long?: boolean }[] = [
  { key: 'name', label: 'Nom' },
  { key: 'tagline', label: 'Accroche' },
  { key: 'description', label: 'Description', long: true },
  { key: 'didYouKnow', label: 'Le saviez-vous', long: true },
  { key: 'visitDuration', label: 'Durée de visite' },
  { key: 'bestTime', label: 'Quand venir' },
  { key: 'history', label: 'Histoire', long: true },
  { key: 'customs', label: 'Usages', long: true },
  { key: 'food', label: 'Cuisine', long: true },
];

const input =
  'mt-1 w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-charcoal-300';
const label = 'block text-xs font-medium uppercase tracking-[0.14em] text-charcoal-500';

/** Edits the texts and photos of the places that ship with the site. */
export default function PlaceOverridesBoard({
  places,
  tableMissing,
}: {
  places: { id: string; name: string }[];
  tableMissing: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState('');
  const [data, setData] = useState<Loaded | null>(null);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [draft, setDraft] = useState<{ fr: Fields; en: Fields }>({ fr: {}, en: {} });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async (placeId: string) => {
    setData(null);
    setMessage('');
    if (!placeId) return;
    const res = await fetch(`/api/admin/place-overrides/${placeId}`).catch(() => null);
    if (!res?.ok) {
      setMessage(
        res?.status === 503
          ? 'La table n’existe pas encore dans Supabase (fichier db/place-overrides.sql).'
          : 'Impossible de charger ce lieu.',
      );
      return;
    }
    const loaded = (await res.json()) as Loaded;
    setData(loaded);
    setDraft({
      fr: { ...loaded.original.fr, ...loaded.fr },
      en: { ...loaded.original.en, ...loaded.en },
    });
  }, []);

  useEffect(() => {
    void load(id);
  }, [id, load]);

  const save = async () => {
    setBusy(true);
    setMessage('');
    const res = await fetch(`/api/admin/place-overrides/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    }).catch(() => null);
    setBusy(false);
    setMessage(res?.ok ? 'Enregistré. Le site est à jour.' : 'L’enregistrement a échoué.');
    if (res?.ok) void load(id);
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setMessage('');
    try {
      for (const file of Array.from(files)) {
        const res = await fetch(`/api/admin/place-overrides/${id}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'image/jpeg' },
          body: await resizeImage(file),
        });
        if (!res.ok) throw new Error(String(res.status));
      }
    } catch {
      setMessage('Une photo n’a pas pu être ajoutée (8 maximum par lieu).');
    }
    setBusy(false);
    void load(id);
  };

  const removePhoto = async (path: string) => {
    if (!window.confirm('Retirer cette photo ?')) return;
    setBusy(true);
    await fetch(`/api/admin/place-overrides/${id}/photos?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    }).catch(() => null);
    setBusy(false);
    void load(id);
  };

  const changed = (l: 'fr' | 'en', key: string) => !!data && (draft[l][key] ?? '') !== (data.original[l][key] ?? '');

  return (
    <section className="mt-16 border-t border-sand-200 pt-10" aria-label="Lieux du site">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Lieux du site</h2>
          <p className="mt-1 max-w-xl text-sm text-charcoal-500">
            Corrigez les textes (français et anglais) et ajoutez vos photos aux lieux déjà présents. Vos photos passent
            avant celles de Wikimedia. Vider un champ ou remettre le texte d’origine rétablit l’original.
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-pill bg-charcoal px-5 py-2 text-sm text-cream transition hover:bg-charcoal-700"
          >
            Modifier un lieu
          </button>
        )}
      </div>

      {open && tableMissing && (
        <p className="mt-6 rounded-2xl border border-sand-200 bg-sand-50 p-4 text-sm text-charcoal-700">
          Cette section demande la table <code className="rounded bg-sand-100 px-1">place_overrides</code> dans Supabase
          : exécutez le fichier <code className="rounded bg-sand-100 px-1">db/place-overrides.sql</code>.
        </p>
      )}

      {open && !tableMissing && (
        <div className="mt-6 space-y-6 rounded-3xl border border-sand-200 bg-sand-50 p-5 sm:p-6">
          <label className={label}>
            Lieu
            <select className={input} value={id} onChange={(e) => setId(e.target.value)}>
              <option value="">Choisir un lieu…</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          {data && (
            <>
              <div className="flex gap-2" role="tablist" aria-label="Langue">
                {(['fr', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    role="tab"
                    aria-selected={lang === l}
                    onClick={() => setLang(l)}
                    className={`rounded-pill border px-4 py-1.5 text-sm transition ${
                      lang === l
                        ? 'border-charcoal bg-charcoal text-cream'
                        : 'border-sand-200 text-charcoal-700 hover:border-charcoal-300'
                    }`}
                  >
                    {l === 'fr' ? 'Français' : 'English'}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <div key={f.key} className={f.long ? 'sm:col-span-2' : ''}>
                    <label className={label}>
                      {f.label}
                      {changed(lang, f.key) && (
                        <span className="ml-2 normal-case tracking-normal text-terracotta-700">modifié</span>
                      )}
                      {f.long ? (
                        <textarea
                          className={`${input} min-h-28`}
                          maxLength={2000}
                          value={draft[lang][f.key] ?? ''}
                          onChange={(e) => setDraft((d) => ({ ...d, [lang]: { ...d[lang], [f.key]: e.target.value } }))}
                        />
                      ) : (
                        <input
                          className={input}
                          maxLength={2000}
                          value={draft[lang][f.key] ?? ''}
                          onChange={(e) => setDraft((d) => ({ ...d, [lang]: { ...d[lang], [f.key]: e.target.value } }))}
                        />
                      )}
                    </label>
                    {f.long && (
                      <RewriteButton
                        value={draft[lang][f.key] ?? ''}
                        lang={lang}
                        kind="place"
                        name={places.find((p) => p.id === id)?.name}
                        onAccept={(text) => setDraft((d) => ({ ...d, [lang]: { ...d[lang], [f.key]: text } }))}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div>
                <p className={label}>Vos photos</p>
                {data.photos.length > 0 && (
                  <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {data.photos.map((p) => (
                      <li key={p.path} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt="" className="aspect-square w-full rounded-xl object-cover" />
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removePhoto(p.path)}
                          className="mt-1 text-xs text-charcoal-500 underline underline-offset-4 hover:text-charcoal"
                        >
                          Retirer
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <label className="mt-3 inline-block cursor-pointer rounded-pill border border-charcoal-300 px-4 py-1.5 text-sm text-charcoal transition hover:border-charcoal">
                  Ajouter des photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => {
                      void upload(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={busy}
                  onClick={save}
                  className="rounded-pill bg-charcoal px-5 py-2 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </>
          )}
          {message && (
            <p role="status" className="text-sm text-charcoal-700">
              {message}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
