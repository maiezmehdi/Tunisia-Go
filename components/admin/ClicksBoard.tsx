'use client';

import { useMemo, useState } from 'react';

import { CLICK_KINDS, CLICK_LABELS, type ClickKind } from '@/lib/clicks';

export interface AdminClick {
  day: string;
  kind: string;
  page: string;
  place: string;
  clicks: number;
}

const PERIODS = [
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
  { days: 90, label: '90 jours' },
] as const;

const PAGE_LABELS: Record<string, string> = {
  home: 'Accueil',
  explore: 'Carte',
  lieux: 'Pages des lieux',
  guides: 'Guides et agences',
  'mon-voyage': 'Mon voyage',
  'road-trips': 'Road trips',
  pratique: 'Pratique',
  evenements: 'Événements',
  compte: 'Mon compte',
  other: 'Autres pages',
};

/** Clicks on outside links (booking, WhatsApp, phone…) by type, section and place, over a chosen period. */
export default function ClicksBoard({
  clicks,
  placeNames,
  tableMissing,
}: {
  clicks: AdminClick[];
  placeNames: Record<string, string>;
  tableMissing: boolean;
}) {
  const [days, setDays] = useState<number>(30);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const view = useMemo(() => {
    const from = new Date(Date.parse(today) - (days - 1) * 86400000).toISOString().slice(0, 10);
    const rows = clicks.filter((c) => c.day >= from);
    const byKind = new Map<string, number>();
    const byPage = new Map<string, number>();
    const byPlace = new Map<string, number>();
    for (const c of rows) {
      byKind.set(c.kind, (byKind.get(c.kind) ?? 0) + c.clicks);
      byPage.set(c.page, (byPage.get(c.page) ?? 0) + c.clicks);
      if (c.place) byPlace.set(c.place, (byPlace.get(c.place) ?? 0) + c.clicks);
    }
    const total = rows.reduce((n, c) => n + c.clicks, 0);
    const top = <T,>(m: Map<string, number>, n: number) =>
      [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n) as [string, number][];
    return { total, byKind, pages: top(byPage, 10), places: top(byPlace, 10) };
  }, [clicks, days, today]);

  const n = (v: number) => v.toLocaleString('fr-FR');

  return (
    <section className="mt-16 border-t border-sand-200 pt-10" aria-label="Clics sur les liens">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Clics sur les liens</h2>
          <p className="mt-1 text-sm text-charcoal-500">
            Combien de fois les visiteurs cliquent sur Tunisie Booking, Airbnb, WhatsApp, un téléphone ou un site.
            Comptés par jour, sans cookie ni donnée personnelle. {n(view.total)} clic{view.total > 1 ? 's' : ''} sur la
            période.
          </p>
        </div>
        <div role="group" aria-label="Période" className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setDays(p.days)}
              aria-pressed={days === p.days}
              className={`rounded-pill border px-3.5 py-1.5 text-sm transition ${
                days === p.days
                  ? 'border-charcoal bg-charcoal text-cream'
                  : 'border-sand-200 text-charcoal-700 hover:border-charcoal-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {tableMissing ? (
        <p className="mt-6 text-sm text-charcoal-500">
          Le compteur n’existe pas encore : exécutez <code>db/link-clicks.sql</code> dans Supabase.
        </p>
      ) : (
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <Table
            title="Par type de lien"
            head="Type"
            rows={CLICK_KINDS.map((k: ClickKind) => [CLICK_LABELS[k], view.byKind.get(k) ?? 0])}
            format={n}
          />
          <Table
            title="Par partie du site"
            head="Page"
            rows={view.pages.map(([k, v]) => [PAGE_LABELS[k] ?? k, v])}
            format={n}
            empty="Aucun clic pour le moment."
          />
          <Table
            title="Lieux les plus cliqués"
            head="Lieu"
            rows={view.places.map(([k, v]) => [placeNames[k] ?? k, v])}
            format={n}
            empty="Aucun clic lié à un lieu pour le moment."
          />
        </div>
      )}
    </section>
  );
}

function Table({
  title,
  head,
  rows,
  format,
  empty,
}: {
  title: string;
  head: string;
  rows: [string, number][];
  format: (n: number) => string;
  empty?: string;
}) {
  return (
    <div>
      <h3 className="font-serif text-lg text-charcoal">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-charcoal-500">{empty}</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <thead className="border-b border-sand-200 text-xs uppercase tracking-[0.12em] text-charcoal-300">
            <tr>
              <th scope="col" className="py-2 text-left font-medium">
                {head}
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Clics
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td className="py-2.5 pr-4 text-charcoal">{label}</td>
                <td className="py-2.5 text-right tabular-nums text-charcoal-700">{format(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
