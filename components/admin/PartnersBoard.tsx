'use client';

import { notify, useGone, useRefresh } from '@/components/admin/feedback';
import { useState } from 'react';

export interface AdminPartner {
  id: string;
  createdAt: string;
  status: 'published' | 'pending' | 'hidden';
  typeLabel: string;
  name: string;
  placeName: string | null;
  description: string | null;
  whatsapp: string | null;
  website: string | null;
  photoUrl: string | null;
}

const DATE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const TABS = [
  ['pending', 'À vérifier'],
  ['published', 'Validées'],
  ['hidden', 'Masquées'],
] as const;

/** Partners (hotels, guesthouses, car rentals, restaurants): check a listing, then validate, hide or delete it. */
export default function PartnersBoard({ partners, tableMissing }: { partners: AdminPartner[]; tableMissing: boolean }) {
  const [pending, refresh] = useRefresh();
  const [gone, hide] = useGone(partners);
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminPartner['status']>('pending');
  const [confirm, setConfirm] = useState<string | null>(null);
  const list = partners.filter((p) => !gone.has(p.id)).filter((p) => p.status === tab);

  const act = async (id: string, action: 'publish' | 'hide' | 'delete') => {
    setBusy(id);
    const res = await fetch(`/api/admin/partners/${id}`, {
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
    <section className="mt-16 border-t border-sand-200 pt-10" aria-label="Partenaires">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Partenaires</h2>
          <p className="mt-1 text-sm text-charcoal-500">
            Hôtels, maisons d’hôtes, locations de voiture et restaurants. Une fiche modifiée revient ici à vérifier.
            Elles ne sont pas encore affichées sur le site.
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
              {label} {partners.filter((p) => p.status === value).length}
            </button>
          ))}
        </div>
      </div>

      {tableMissing ? (
        <p className="mt-6 text-sm text-charcoal-500">
          La table n’existe pas encore : exécutez <code>db/partners.sql</code> dans Supabase.
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
                      {p.typeLabel} · {DATE.format(new Date(p.createdAt))}
                    </span>
                  </p>
                  {p.placeName && <p>Lieu : {p.placeName}</p>}
                  {p.whatsapp && (
                    <p>
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
                  )}
                  {p.website && (
                    <p className="break-all">
                      Site :{' '}
                      <a
                        className="underline underline-offset-4"
                        href={p.website}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        {p.website}
                      </a>
                    </p>
                  )}
                  {p.description && <p className="mt-1 whitespace-pre-line text-charcoal-500">{p.description}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {p.status !== 'published' && (
                    <button
                      type="button"
                      disabled={busy === p.id || pending}
                      onClick={() => act(p.id, 'publish')}
                      className={btn}
                    >
                      Valider
                    </button>
                  )}
                  {p.status !== 'hidden' && (
                    <button
                      type="button"
                      disabled={busy === p.id || pending}
                      onClick={() => act(p.id, 'hide')}
                      className={btn}
                    >
                      {p.status === 'published' ? 'Retirer' : 'Masquer'}
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
