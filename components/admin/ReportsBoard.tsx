'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface AdminReport {
  id: string;
  createdAt: string;
  status: 'open' | 'done';
  placeId: string;
  placeName: string | null;
  message: string;
  contact: string | null;
}

const DATE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Errors reported from the place pages: read them, fix the page, then mark them handled. */
export default function ReportsBoard({ reports }: { reports: AdminReport[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const open = reports.filter((r) => r.status === 'open');
  const done = reports.filter((r) => r.status === 'done');
  const list = showDone ? done : open;

  const mark = async (id: string, action: 'done' | 'open') => {
    setBusy(id);
    await fetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    }).catch(() => null);
    setBusy(null);
    router.refresh();
  };

  return (
    <section className="mt-16 border-t border-sand-200 pt-10" aria-label="Erreurs signalées">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Erreurs signalées</h2>
          <p className="mt-1 text-sm text-charcoal-500">
            Envoyées depuis « Signaler une erreur » sur la page d’un lieu.
          </p>
        </div>
        <div className="flex gap-2">
          {(
            [
              [false, `À traiter ${open.length}`],
              [true, `Traitées ${done.length}`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => setShowDone(value)}
              className={`rounded-pill border px-4 py-1.5 text-sm transition ${
                showDone === value
                  ? 'border-charcoal bg-charcoal text-cream'
                  : 'border-sand-200 bg-white text-charcoal-700 hover:border-charcoal-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-sm text-charcoal-500">
          {showDone ? 'Rien ici pour le moment.' : 'Aucune erreur signalée.'}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-sand-200 border-y border-sand-200">
          {list.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
              <div className="min-w-0 max-w-2xl">
                <p className="text-sm font-medium text-charcoal">
                  <a
                    href={`/lieux/${r.placeId}`}
                    target="_blank"
                    rel="noopener"
                    className="underline-offset-4 hover:underline"
                  >
                    {r.placeName ?? r.placeId}
                  </a>
                  <span className="ml-2 text-xs font-normal text-charcoal-300">
                    {DATE.format(new Date(r.createdAt))}
                  </span>
                </p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-charcoal-700">{r.message}</p>
                {r.contact && <p className="mt-1 text-xs text-charcoal-500">Contact : {r.contact}</p>}
              </div>
              <button
                type="button"
                disabled={busy === r.id}
                onClick={() => mark(r.id, showDone ? 'open' : 'done')}
                className="rounded-pill border border-charcoal-300 px-4 py-1.5 text-sm text-charcoal transition hover:border-charcoal disabled:opacity-50"
              >
                {showDone ? 'Rouvrir' : 'Marquer traitée'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
