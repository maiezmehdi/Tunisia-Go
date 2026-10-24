'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface AdminTrip {
  id: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  name: string;
  description: string;
  days: number;
  /** Stop names in order; a stop whose place is gone shows as "(lieu retiré)". */
  stops: string[];
  author: string | null;
  contact: string | null;
  nameEn: string;
  descriptionEn: string;
}

const DATE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const input =
  'mt-1 w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-charcoal-300';
const label = 'block text-xs font-medium uppercase tracking-[0.14em] text-charcoal-500';
const TABS = [
  { id: 'pending', title: 'À valider' },
  { id: 'approved', title: 'Publiés' },
  { id: 'rejected', title: 'Refusés' },
] as const;

/** Road trips suggested by visitors: read, adjust the texts, approve (shows on the map) or refuse. */
export default function TripsBoard({ trips, tableMissing }: { trips: AdminTrip[]; tableMissing: boolean }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('pending');
  const count = (s: string) => trips.filter((t) => t.status === s).length;
  const list = trips.filter((t) => t.status === tab);

  return (
    <section className="mt-16 border-t border-sand-200 pt-10" aria-label="Trips proposés">
      <h2 className="font-serif text-2xl text-charcoal">Trips proposés</h2>
      <p className="mt-1 max-w-xl text-sm text-charcoal-500">
        Les road trips envoyés par les visiteurs. Un trip approuvé apparaît dans la liste des road trips de la carte.
      </p>

      {tableMissing ? (
        <p className="mt-4 text-sm text-charcoal-700">
          La table des trips n’existe pas encore : exécutez <code>db/trip-submissions.sql</code> dans Supabase.
        </p>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-pill border px-4 py-1.5 text-sm transition ${
                  tab === t.id
                    ? 'border-charcoal bg-charcoal text-cream'
                    : 'border-sand-200 text-charcoal-700 hover:border-charcoal-300'
                }`}
              >
                {t.title} ({count(t.id)})
              </button>
            ))}
          </div>
          {list.length === 0 ? (
            <p className="mt-6 text-sm text-charcoal-500">Rien ici pour l’instant.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {list.map((t) => (
                <TripCard key={t.id} trip={t} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function TripCard({ trip: t }: { trip: AdminTrip }) {
  const router = useRouter();
  const [name, setName] = useState(t.name);
  const [description, setDescription] = useState(t.description);
  const [days, setDays] = useState(String(t.days));
  const [nameEn, setNameEn] = useState(t.nameEn);
  const [descriptionEn, setDescriptionEn] = useState(t.descriptionEn);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const act = async (action: 'approve' | 'reject' | 'pending') => {
    setBusy(true);
    setMessage('');
    const res = await fetch(`/api/admin/trips/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, name, description, days, nameEn, descriptionEn }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) router.refresh();
    else setMessage('Impossible d’enregistrer. Réessayez.');
  };

  const remove = async () => {
    if (!window.confirm('Supprimer ce trip définitivement ?')) return;
    setBusy(true);
    await fetch(`/api/admin/trips/${t.id}`, { method: 'DELETE' }).catch(() => null);
    setBusy(false);
    router.refresh();
  };

  const btn = 'rounded-pill px-5 py-2 text-sm transition disabled:opacity-60';
  return (
    <li className="rounded-3xl border border-sand-200 p-5">
      <p className="text-xs text-charcoal-300">
        {DATE.format(new Date(t.createdAt))} · {t.author || 'Anonyme'}
        {t.contact && ` · ${t.contact}`}
      </p>
      <p className="mt-3 text-sm text-charcoal-700">
        <span className="text-charcoal-300">Étapes : </span>
        {t.stops.join(' → ')}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_120px]">
        <label>
          <span className={label}>Nom</span>
          <input className={input} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          <span className={label}>Jours</span>
          <input
            className={input}
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className={label}>Description</span>
        <textarea
          className={`${input} min-h-[100px]`}
          value={description}
          maxLength={1500}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label>
          <span className={label}>Nom en anglais (facultatif)</span>
          <input className={input} value={nameEn} maxLength={100} onChange={(e) => setNameEn(e.target.value)} />
        </label>
        <label>
          <span className={label}>Description en anglais (facultatif)</span>
          <textarea
            className={`${input} min-h-[60px]`}
            value={descriptionEn}
            maxLength={1500}
            onChange={(e) => setDescriptionEn(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {t.status !== 'approved' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act('approve')}
            className={`${btn} bg-charcoal text-cream hover:bg-charcoal-700`}
          >
            Approuver
          </button>
        )}
        {t.status === 'approved' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act('approve')}
            className={`${btn} bg-charcoal text-cream hover:bg-charcoal-700`}
          >
            Enregistrer les modifications
          </button>
        )}
        {t.status === 'pending' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act('reject')}
            className={`${btn} border border-sand-200 text-charcoal-700 hover:border-charcoal-300`}
          >
            Refuser
          </button>
        )}
        {t.status !== 'pending' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act('pending')}
            className={`${btn} border border-sand-200 text-charcoal-700 hover:border-charcoal-300`}
          >
            Remettre à valider
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={remove}
          className="text-sm text-charcoal-500 underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
        >
          Supprimer
        </button>
        {message && <span className="text-sm text-terracotta">{message}</span>}
      </div>
    </li>
  );
}
