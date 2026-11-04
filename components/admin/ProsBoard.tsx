'use client';

import { notify, useGone, useRefresh } from '@/components/admin/feedback';
import { useState } from 'react';

export interface AdminPro {
  id: string;
  createdAt: string;
  status: 'published' | 'pending' | 'hidden';
  kind: 'guide' | 'agency';
  name: string;
  whatsapp: string;
  card: string | null;
  socials: string | null;
  networks: string[];
  autoPublished: boolean;
  reports: number;
  bio: string | null;
  experience: string | null;
  details: string;
  placeName: string | null;
  photoUrl: string | null;
}

const DATE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const TABS = [
  ['pending', 'À vérifier'],
  ['published', 'Publiées'],
  ['hidden', 'Masquées'],
] as const;

/** Guides and agencies: check the ones without a card, take one down in a click. */
export default function ProsBoard({ pros, tableMissing }: { pros: AdminPro[]; tableMissing: boolean }) {
  const [pending, refresh] = useRefresh();
  const [gone, hide] = useGone(pros);
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminPro['status']>('pending');
  const [confirm, setConfirm] = useState<string | null>(null);

  const waiting = pros.filter((p) => p.status === 'pending').length;
  const list = pros
    .filter((p) => !gone.has(p.id))
    .filter((p) => (tab === 'pending' ? p.status === 'pending' : p.status === tab));

  const act = async (id: string, action: 'publish' | 'hide' | 'delete') => {
    setBusy(id);
    const res = await fetch(`/api/admin/pros/${id}`, {
      method: action === 'delete' ? 'DELETE' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: action === 'delete' ? undefined : JSON.stringify({ action }),
    }).catch(() => null);
    setBusy(null);
    setConfirm(null);
    if (!res?.ok) return notify('L’action a échoué. Réessayez.', 'error');
    hide(id);
    notify(action === 'delete' ? 'Supprimé' : action === 'publish' ? 'Publié' : 'Masqué');
    refresh();
  };

  const btn =
    'text-charcoal-500 underline decoration-sand-300 underline-offset-4 transition hover:text-charcoal disabled:opacity-50';

  return (
    <section className="mt-16 border-t border-sand-200 pt-10" aria-label="Guides et agences">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Guides et agences</h2>
          <p className="mt-1 text-sm text-charcoal-500">
            Inscrits depuis l’accueil. Avec une carte déclarée, la fiche est publiée tout de suite : ce n’est pas une
            vérification.
          </p>
        </div>
        <div className="flex gap-2">
          {TABS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`rounded-pill border px-4 py-1.5 text-sm transition ${
                tab === value
                  ? 'border-charcoal bg-charcoal text-cream'
                  : 'border-sand-200 bg-white text-charcoal-700 hover:border-charcoal-300'
              }`}
            >
              {label} {value === 'pending' ? waiting : pros.filter((p) => p.status === value).length}
            </button>
          ))}
        </div>
      </div>

      {tableMissing ? (
        <p className="mt-6 text-sm text-charcoal-500">
          La table n’existe pas encore : exécutez <code>db/pros.sql</code> dans Supabase.
        </p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-sm text-charcoal-500">Rien ici pour le moment.</p>
      ) : (
        <ul className="mt-6 divide-y divide-sand-200 border-y border-sand-200">
          {list.map((p) => (
            <li key={p.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                {p.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photoUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-2xl border border-sand-200 object-cover"
                  />
                )}
                <div className="min-w-0 max-w-2xl flex-1 text-sm text-charcoal-700">
                  <p className="font-medium text-charcoal">
                    {p.name}
                    <span className="ml-2 text-xs font-normal text-charcoal-300">
                      {p.kind === 'guide' ? 'Guide' : 'Agence'} · {DATE.format(new Date(p.createdAt))}
                    </span>
                  </p>
                  <p className="mt-1">
                    WhatsApp :{' '}
                    <a
                      className="underline underline-offset-4"
                      href={`https://wa.me/${p.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      +{p.whatsapp}
                    </a>
                  </p>
                  {p.placeName && <p>Lieu d’exercice : {p.placeName}</p>}
                  {p.card && <p>Carte déclarée : {p.card}</p>}
                  {p.socials && <p className="break-all">Réseaux : {p.socials}</p>}
                  {p.networks.map((href) => (
                    <p key={href} className="break-all">
                      <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="underline">
                        {href}
                      </a>
                    </p>
                  ))}
                  {p.bio && <p className="mt-1 whitespace-pre-line text-charcoal-500">{p.bio}</p>}
                  {p.experience && <p className="mt-1 whitespace-pre-line text-charcoal-500">{p.experience}</p>}
                  {p.details && <p className="mt-1 text-charcoal-500">{p.details}</p>}
                  {p.reports > 0 && (
                    <p className="mt-1 font-medium text-terracotta-700">Signalée {p.reports} fois par des visiteurs</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {p.status !== 'published' && (
                    <button
                      type="button"
                      disabled={busy === p.id || pending}
                      onClick={() => act(p.id, 'publish')}
                      className={btn}
                    >
                      Publier
                    </button>
                  )}
                  {p.status !== 'hidden' && (
                    <button
                      type="button"
                      disabled={busy === p.id || pending}
                      onClick={() => act(p.id, 'hide')}
                      className={btn}
                    >
                      {p.status === 'published' ? 'Dépublier' : 'Masquer'}
                    </button>
                  )}
                  {confirm === p.id ? (
                    <span className="inline-flex gap-3">
                      <button
                        type="button"
                        disabled={busy === p.id || pending}
                        onClick={() => act(p.id, 'delete')}
                        className="text-terracotta-700 underline underline-offset-4"
                      >
                        Confirmer
                      </button>
                      <button type="button" onClick={() => setConfirm(null)} className="text-charcoal-500">
                        Annuler
                      </button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setConfirm(p.id)} className={btn}>
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
