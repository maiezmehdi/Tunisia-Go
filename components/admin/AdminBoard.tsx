'use client';

import { useRouter } from 'next/navigation';
import RewriteButton from '@/components/RewriteButton';
import { useMemo, useState } from 'react';

import { CATEGORIES_FR } from '@/data/i18n/catalog.fr';
import type { CategoryId } from '@/data/types';
import { resizeImage } from '@/lib/resizeImage';
import { SPOT_TAG_LABELS, SPOT_TYPE_LABELS, SPOT_TYPES, type SpotTag, type SpotType } from '@/lib/secretSpot';

export interface AdminSubmission {
  id: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  name: string;
  type: string | null;
  area: string;
  location: string | null;
  why: string;
  bestTime: string | null;
  tags: string[];
  author: string | null;
  contact: string | null;
  category: string;
  /** "lat, lng", pre-filled when the visitor gave coordinates or a map link. */
  coords: string;
  photos: { path: string; url: string | null }[];
  reviewedAt: string | null;
  nameEn: string;
  whyEn: string;
  bestTimeEn: string;
  /** Photos shown on the map (visitor photos copied on approval, and the ones added from here). */
  publicPhotos: { path: string; url: string }[];
}

type Status = AdminSubmission['status'];

const TABS: { id: Status; label: string }[] = [
  { id: 'pending', label: 'À valider' },
  { id: 'approved', label: 'En ligne' },
  { id: 'rejected', label: 'Refusés' },
];

const ERRORS: Record<string, string> = {
  coords_required: 'Ajoutez les coordonnées du lieu (latitude, longitude) avant de le publier.',
  photos_failed: 'Les photos n’ont pas pu être publiées. Réessayez.',
  unauthorized: 'Session expirée : rechargez la page et reconnectez-vous.',
};

const DATE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function typeLabel(type: string | null) {
  return (SPOT_TYPES as readonly string[]).includes(type ?? '') ? SPOT_TYPE_LABELS.fr[type as SpotType] : 'Autre';
}

function parse(coords: string): [number, number] | null {
  const m = coords.match(/(-?\d+(?:\.\d+)?)\s*[,; ]\s*(-?\d+(?:\.\d+)?)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

function contactLink(contact: string): string | null {
  if (/^\S+@\S+\.\S+$/.test(contact)) return `mailto:${contact}`;
  const digits = contact.replace(/[^\d]/g, '');
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}

export default function AdminBoard({ submissions }: { submissions: AdminSubmission[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Status>('pending');
  const counts = useMemo(() => {
    const c: Record<Status, number> = { pending: 0, approved: 0, rejected: 0 };
    for (const s of submissions) c[s.status]++;
    return c;
  }, [submissions]);
  const list = submissions.filter((s) => s.status === tab);

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' }).catch(() => null);
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Lieux proposés</h1>
          <p className="mt-1 text-sm text-charcoal-500">
            Vérifiez, corrigez si besoin, puis publiez : le lieu apparaît aussitôt sur la carte.
          </p>
        </div>
        <button type="button" onClick={logout} className="text-sm text-charcoal-500 underline-offset-4 hover:underline">
          Se déconnecter
        </button>
      </div>

      <div role="tablist" className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-pill border px-4 py-1.5 text-sm transition ${
              tab === t.id
                ? 'border-charcoal bg-charcoal text-cream'
                : 'border-sand-200 bg-white text-charcoal-700 hover:border-charcoal-300'
            }`}
          >
            {t.label} <span className={tab === t.id ? 'text-cream/60' : 'text-charcoal-300'}>{counts[t.id]}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-sm text-charcoal-500">
          {tab === 'pending' ? 'Aucune proposition en attente.' : 'Rien ici pour le moment.'}
        </p>
      ) : (
        <ul className="mt-6 space-y-5">
          {list.map((s) => (
            <SubmissionCard key={s.id} submission={s} onDone={() => router.refresh()} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SubmissionCard({ submission: s, onDone }: { submission: AdminSubmission; onDone: () => void }) {
  const [name, setName] = useState(s.name);
  const [area, setArea] = useState(s.area);
  const [why, setWhy] = useState(s.why);
  const [category, setCategory] = useState(s.category);
  const [bestTime, setBestTime] = useState(s.bestTime ?? '');
  const [nameEn, setNameEn] = useState(s.nameEn);
  const [whyEn, setWhyEn] = useState(s.whyEn);
  const [bestTimeEn, setBestTimeEn] = useState(s.bestTimeEn);
  const [coords, setCoords] = useState(s.coords);
  const [keep, setKeep] = useState<Set<string>>(() => new Set(s.photos.map((p) => p.path)));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const point = parse(coords);
  const search = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${area} Tunisie`)}`;
  const contact = s.contact ? contactLink(s.contact) : null;

  const act = async (action: 'approve' | 'reject' | 'pending') => {
    setBusy(action);
    setError(null);
    const res = await fetch(`/api/admin/submissions/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        name,
        area,
        why,
        category,
        bestTime,
        nameEn,
        whyEn,
        bestTimeEn,
        lat: point?.[0],
        lng: point?.[1],
        photos: s.photos.map((p) => p.path).filter((p) => keep.has(p)),
      }),
    }).catch(() => null);
    setBusy(null);
    if (res?.ok) return onDone();
    const code = ((await res?.json().catch(() => null)) as { error?: string } | null)?.error ?? '';
    setError(ERRORS[code] ?? 'L’enregistrement a échoué. Réessayez.');
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy('photo');
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const blob = await resizeImage(file);
        const res = await fetch(`/api/admin/submissions/${s.id}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'image/jpeg' },
          body: blob,
        });
        if (!res.ok) throw new Error(String(res.status));
      }
      onDone();
    } catch {
      setError('Une photo n’a pas pu être ajoutée (8 maximum par lieu). Réessayez.');
    }
    setBusy(null);
  };

  const removePhoto = async (path: string) => {
    if (!window.confirm('Retirer cette photo du lieu ?')) return;
    setBusy('photo');
    const res = await fetch(`/api/admin/submissions/${s.id}/photos?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    }).catch(() => null);
    setBusy(null);
    if (res?.ok) onDone();
    else setError('La photo n’a pas pu être retirée. Réessayez.');
  };

  const field =
    'mt-1 w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-charcoal';

  return (
    <li className="rounded-3xl border border-sand-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-charcoal-300">
        <span className="uppercase tracking-[0.18em]">{typeLabel(s.type)}</span>
        <span>
          Reçu le {DATE.format(new Date(s.createdAt))}
          {s.reviewedAt && ` · traité le ${DATE.format(new Date(s.reviewedAt))}`}
        </span>
      </div>

      {s.photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {s.photos.map((p, i) => {
            const on = keep.has(p.path);
            return (
              <label key={p.path} className="relative block cursor-pointer overflow-hidden rounded-2xl bg-sand-100">
                {p.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.url}
                    alt={`Photo ${i + 1}`}
                    className={`aspect-[4/3] w-full object-cover ${on ? '' : 'opacity-30'}`}
                  />
                ) : (
                  <span className="grid aspect-[4/3] place-items-center text-xs text-charcoal-300">
                    Photo indisponible
                  </span>
                )}
                <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-pill bg-cream/90 px-2 py-1 text-[11px] text-charcoal">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() =>
                      setKeep((k) => {
                        const next = new Set(k);
                        if (next.has(p.path)) next.delete(p.path);
                        else next.add(p.path);
                        return next;
                      })
                    }
                  />
                  Publier
                </span>
              </label>
            );
          })}
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-charcoal-500">Nom du lieu</span>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        </label>
        <label className="block">
          <span className="text-xs text-charcoal-500">Région ou ville</span>
          <input className={field} value={area} onChange={(e) => setArea(e.target.value)} maxLength={120} />
        </label>
        <label className="block">
          <span className="text-xs text-charcoal-500">Catégorie sur la carte</span>
          <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
            {(Object.keys(CATEGORIES_FR) as CategoryId[]).map((id) => (
              <option key={id} value={id}>
                {CATEGORIES_FR[id].label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-charcoal-500">Coordonnées (latitude, longitude)</span>
          <input
            className={field}
            value={coords}
            onChange={(e) => setCoords(e.target.value)}
            placeholder="36.8703, 10.3417"
            inputMode="decimal"
          />
          <span className="mt-1 block text-[11px] leading-snug text-charcoal-300">
            {point ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${point[0]},${point[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-charcoal"
              >
                Vérifier ce point sur Google Maps
              </a>
            ) : (
              <>
                Introuvables pour l’instant.{' '}
                <a
                  href={search}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-charcoal"
                >
                  Chercher sur Google Maps
                </a>
                , clic droit sur le lieu, puis copiez les chiffres ici.
              </>
            )}
          </span>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-xs text-charcoal-500">Pourquoi y aller (affiché sur la fiche)</span>
        <textarea
          className={`${field} min-h-[96px]`}
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          maxLength={2000}
        />
      </label>
      <RewriteButton value={why} kind="place" name={name} onAccept={setWhy} />

      <label className="mt-4 block">
        <span className="text-xs text-charcoal-500">Meilleure période (facultatif)</span>
        <input className={field} value={bestTime} onChange={(e) => setBestTime(e.target.value)} maxLength={120} />
      </label>

      <details className="mt-4 rounded-2xl border border-sand-200 px-4 py-3">
        <summary className="cursor-pointer text-sm text-charcoal-700">Version anglaise (facultatif)</summary>
        <p className="mt-2 text-xs text-charcoal-300">
          Laissez vide pour afficher le texte français aux visiteurs anglophones.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-charcoal-500">Name</span>
            <input className={field} value={nameEn} onChange={(e) => setNameEn(e.target.value)} maxLength={120} />
          </label>
          <label className="block">
            <span className="text-xs text-charcoal-500">Best time</span>
            <input
              className={field}
              value={bestTimeEn}
              onChange={(e) => setBestTimeEn(e.target.value)}
              maxLength={120}
            />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="text-xs text-charcoal-500">Why go</span>
          <textarea
            className={`${field} min-h-[80px]`}
            value={whyEn}
            onChange={(e) => setWhyEn(e.target.value)}
            maxLength={2000}
          />
        </label>
        <RewriteButton value={whyEn} lang="en" kind="place" name={nameEn || name} onAccept={setWhyEn} />
      </details>

      {s.status === 'approved' && (
        <div className="mt-4">
          <p className="text-xs text-charcoal-500">Photos affichées sur la fiche</p>
          {s.publicPhotos.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {s.publicPhotos.map((p, i) => (
                <div key={p.path} className="relative overflow-hidden rounded-2xl bg-sand-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`Photo ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => removePhoto(p.path)}
                    className="absolute right-2 top-2 rounded-pill bg-cream/90 px-2.5 py-1 text-[11px] text-charcoal transition hover:bg-cream disabled:opacity-60"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="mt-3 inline-block cursor-pointer rounded-pill border border-sand-200 px-4 py-2 text-sm text-charcoal-700 transition hover:border-charcoal">
            {busy === 'photo' ? 'Envoi…' : 'Ajouter des photos'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              disabled={!!busy}
              onChange={(e) => {
                void upload(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      )}

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {s.location && (
          <div>
            <dt className="text-xs text-charcoal-300">Position donnée</dt>
            <dd className="break-words text-charcoal-700">{s.location}</dd>
          </div>
        )}
        {s.bestTime && (
          <div>
            <dt className="text-xs text-charcoal-300">Meilleur moment</dt>
            <dd className="text-charcoal-700">{s.bestTime}</dd>
          </div>
        )}
        {s.tags.length > 0 && (
          <div>
            <dt className="text-xs text-charcoal-300">Mots-clés</dt>
            <dd className="text-charcoal-700">{s.tags.map((t) => SPOT_TAG_LABELS.fr[t as SpotTag] ?? t).join(', ')}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-charcoal-300">Proposé par</dt>
          <dd className="text-charcoal-700">{s.author || 'Anonyme'}</dd>
        </div>
        {s.contact && (
          <div>
            <dt className="text-xs text-charcoal-300">Contact (jamais affiché)</dt>
            <dd className="break-words text-charcoal-700">
              {contact ? (
                <a href={contact} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  {s.contact}
                </a>
              ) : (
                s.contact
              )}
            </dd>
          </div>
        )}
      </dl>

      {error && <p className="mt-4 text-sm text-terracotta-600">{error}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-sand-200 pt-4">
        {s.status !== 'approved' && (
          <button
            type="button"
            disabled={!!busy}
            onClick={() => act('approve')}
            className="rounded-pill bg-charcoal px-5 py-2 text-sm font-medium text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
          >
            {busy === 'approve' ? 'Publication…' : 'Publier sur la carte'}
          </button>
        )}
        {s.status === 'approved' && (
          <>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => act('approve')}
              className="rounded-pill bg-charcoal px-5 py-2 text-sm font-medium text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
            >
              {busy === 'approve' ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
            <a
              href={`/explore?place=c-${s.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-pill border border-sand-200 px-4 py-2 text-sm text-charcoal-700 transition hover:border-charcoal"
            >
              Voir sur la carte
            </a>
          </>
        )}
        {s.status !== 'rejected' && (
          <button
            type="button"
            disabled={!!busy}
            onClick={() => act('reject')}
            className="rounded-pill border border-sand-200 px-4 py-2 text-sm text-charcoal-700 transition hover:border-charcoal disabled:opacity-60"
          >
            {busy === 'reject' ? '…' : s.status === 'approved' ? 'Retirer et refuser' : 'Refuser'}
          </button>
        )}
        {s.status !== 'pending' && (
          <button
            type="button"
            disabled={!!busy}
            onClick={() => act('pending')}
            className="px-2 py-2 text-sm text-charcoal-500 underline-offset-4 hover:underline disabled:opacity-60"
          >
            Remettre à valider
          </button>
        )}
      </div>
    </li>
  );
}
