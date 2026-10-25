'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface AdminRating {
  placeId: string;
  name: string;
  average: number | null;
  votes: number;
}

type Sort = 'name' | 'average' | 'votes';

/** Star ratings per place: name, average, number of votes, and a reset to zero. */
export default function RatingsBoard({ ratings, tableMissing }: { ratings: AdminRating[]; tableMissing: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>('votes');
  const [onlyVoted, setOnlyVoted] = useState(true);

  const rows = ratings
    .filter((r) => !onlyVoted || r.votes > 0)
    .sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name, 'fr')
        : sort === 'average'
          ? (b.average ?? 0) - (a.average ?? 0) || b.votes - a.votes
          : b.votes - a.votes || a.name.localeCompare(b.name, 'fr'),
    );
  const total = ratings.reduce((n, r) => n + r.votes, 0);

  const reset = async (placeId: string) => {
    setBusy(placeId);
    await fetch(`/api/admin/ratings/${placeId}`, { method: 'DELETE' }).catch(() => null);
    setBusy(null);
    setConfirm(null);
    router.refresh();
  };

  const head = (key: Sort, label: string, right = false) => (
    <th scope="col" className={`py-2 pr-4 font-medium ${right ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={() => setSort(key)}
        className={`transition hover:text-charcoal ${sort === key ? 'text-charcoal underline underline-offset-4' : ''}`}
      >
        {label}
      </button>
    </th>
  );

  return (
    <section className="mt-16 border-t border-sand-200 pt-10" aria-label="Avis des visiteurs">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Avis des visiteurs</h2>
          <p className="mt-1 text-sm text-charcoal-500">
            Notes de 1 à 5 laissées sur les pages des lieux. {total} vote{total > 1 ? 's' : ''} au total.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-charcoal-700">
          <input type="checkbox" checked={onlyVoted} onChange={(e) => setOnlyVoted(e.target.checked)} />
          Seulement les lieux notés
        </label>
      </div>

      {tableMissing ? (
        <p className="mt-6 text-sm text-charcoal-500">
          La table des avis n’existe pas encore : exécutez <code>db/place-ratings.sql</code> dans Supabase.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-charcoal-500">Aucun avis pour le moment.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="border-b border-sand-200 text-xs uppercase tracking-[0.12em] text-charcoal-300">
              <tr>
                {head('name', 'Lieu')}
                {head('average', 'Note moyenne', true)}
                {head('votes', 'Votes', true)}
                <th scope="col" className="py-2 text-right font-medium">
                  Gestion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {rows.map((r) => (
                <tr key={r.placeId}>
                  <td className="py-3 pr-4 text-charcoal">{r.name}</td>
                  <td className="py-3 pr-4 text-right tabular-nums text-charcoal-700">
                    {r.average === null
                      ? '–'
                      : `${r.average.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} / 5`}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-charcoal-700">{r.votes}</td>
                  <td className="py-3 text-right">
                    {r.votes === 0 ? (
                      <span className="text-charcoal-300">–</span>
                    ) : confirm === r.placeId ? (
                      <span className="inline-flex gap-3">
                        <button
                          type="button"
                          disabled={busy === r.placeId}
                          onClick={() => reset(r.placeId)}
                          className="text-terracotta-700 underline underline-offset-4 disabled:opacity-60"
                        >
                          {busy === r.placeId ? 'Suppression…' : 'Confirmer'}
                        </button>
                        <button type="button" onClick={() => setConfirm(null)} className="text-charcoal-500">
                          Annuler
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirm(r.placeId)}
                        className="text-charcoal-500 underline decoration-sand-300 underline-offset-4 transition hover:text-charcoal"
                      >
                        Remettre à zéro
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
