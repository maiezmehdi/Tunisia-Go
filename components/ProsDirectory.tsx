'use client';

import { ActivityIcon, LanguageIcon, PriceIcon } from '@/components/ProIcons';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import ProReportButton from '@/components/ProReportButton';
import { useProAuth } from '@/lib/proAuth';
import type { ProKind } from '@/lib/pros';

export interface DirectoryPro {
  id: string;
  kind: ProKind;
  name: string;
  whatsappUrl: string | null;
  socials: string | null;
  socialsHref: string | null;
  cardDeclared: boolean;
  bio: string | null;
  experience: string | null;
  languageNames: string[];
  activityNames: string[];
  priceNote: string | null;
  placeName: string | null;
  /** Where the pin goes: the place where the person works, nudged so pins at the same place do not overlap. */
  coords: [number, number] | null;
  photoUrl: string | null;
}

export interface DirectoryLabels {
  edit: string;
  guide: string;
  agency: string;
  declared: string;
  experience: string;
  languages: string;
  activities: string;
  price: string;
  declaredHint: string;
  contact: string;
  empty: string;
  list: string;
  map: string;
  mapEmpty: string;
  loadingMap: string;
}

// Leaflet touches `window`, so the map only renders in the browser.
const ProsMap = dynamic(() => import('@/components/ProsMap'), { ssr: false });

/** The guides and agencies as a list, or as pins on a map. */
export default function ProsDirectory({ pros, labels }: { pros: DirectoryPro[]; labels: DirectoryLabels }) {
  const { tokens, open } = useProAuth();
  const [myId, setMyId] = useState<string | null>(null);
  const tokenKey = tokens ? tokens.accessToken.slice(-12) : null;
  const accessToken = tokens?.accessToken;
  useEffect(() => {
    if (!accessToken) return setMyId(null);
    let cancelled = false;
    fetch('/api/pro-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, action: 'get' }),
    })
      .then((res) => (res.ok ? (res.json() as Promise<{ id?: string }>) : null))
      .then((data) => !cancelled && setMyId(data?.id ?? null))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // Look the person's listing up once per sign-in, not each time the token is renewed.
  }, [tokenKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [view, setView] = useState<'list' | 'map'>('list');
  const placed = pros.filter((p) => p.coords).length;

  return (
    <div className="mt-10">
      <div className="flex gap-2">
        {(
          [
            ['list', labels.list],
            ['map', labels.map],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            aria-pressed={view === value}
            className={`rounded-pill border px-4 py-1.5 text-sm transition ${
              view === value
                ? 'border-charcoal bg-charcoal text-cream'
                : 'border-sand-200 bg-white text-charcoal-700 hover:border-charcoal-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {pros.length === 0 ? (
        <p className="mt-8 border-t border-sand-200 pt-6 text-sm text-charcoal-500">{labels.empty}</p>
      ) : view === 'map' ? (
        <div className="mt-6">
          <div className="h-[520px] overflow-hidden rounded-3xl border border-sand-200 bg-sand-50">
            <ProsMap pros={pros} labels={labels} />
          </div>
          {placed < pros.length && <p className="mt-3 text-xs text-charcoal-500">{labels.mapEmpty}</p>}
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          {pros.map((p) => (
            <li key={p.id} className="flex flex-col rounded-3xl border border-sand-200 bg-white p-6">
              {p.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.photoUrl}
                  alt=""
                  loading="lazy"
                  className="-mx-6 -mt-6 mb-5 h-44 w-[calc(100%+3rem)] max-w-none rounded-t-3xl object-cover"
                />
              )}
              <div className="flex items-start gap-4">
                {!p.photoUrl && (
                  <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-sand-200 bg-sand-50 font-serif text-2xl italic text-charcoal-300">
                    {p.name.trim().charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-charcoal-300">{labels[p.kind]}</p>
                  <h2 className="mt-0.5 font-serif text-2xl leading-tight">{p.name}</h2>
                  {p.placeName && <p className="mt-0.5 text-sm text-charcoal-500">{p.placeName}</p>}
                </div>
              </div>
              {p.cardDeclared && (
                <p className="mt-3 text-sm text-charcoal-700" title={labels.declaredHint}>
                  {labels.declared}
                </p>
              )}
              {p.bio && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-charcoal-700">{p.bio}</p>}
              {(p.languageNames.length > 0 || p.activityNames.length > 0 || p.priceNote) && (
                <ul className="mt-4 space-y-2 text-sm text-charcoal-700">
                  {p.languageNames.length > 0 && (
                    <li className="flex items-start gap-2.5" title={labels.languages}>
                      <LanguageIcon className="mt-0.5 shrink-0 text-charcoal-500" />
                      <span>{p.languageNames.join(', ')}</span>
                    </li>
                  )}
                  {p.activityNames.length > 0 && (
                    <li className="flex items-start gap-2.5" title={labels.activities}>
                      <ActivityIcon className="mt-0.5 shrink-0 text-charcoal-500" />
                      <span>{p.activityNames.join(', ')}</span>
                    </li>
                  )}
                  {p.priceNote && (
                    <li className="flex items-start gap-2.5" title={labels.price}>
                      <PriceIcon className="mt-0.5 shrink-0 text-charcoal-500" />
                      <span>{p.priceNote}</span>
                    </li>
                  )}
                </ul>
              )}
              {p.experience && (
                <div className="mt-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-charcoal-300">{labels.experience}</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-charcoal-700">{p.experience}</p>
                </div>
              )}
              {p.socials &&
                (p.socialsHref ? (
                  <a
                    href={p.socialsHref}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-2 break-all text-sm text-charcoal-500 underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
                  >
                    {p.socials}
                  </a>
                ) : (
                  <p className="mt-2 break-all text-sm text-charcoal-500">{p.socials}</p>
                ))}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                {p.whatsappUrl && (
                  <a
                    href={p.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-pill bg-charcoal px-4 py-2 text-sm text-cream transition hover:bg-charcoal-700"
                  >
                    {labels.contact}
                  </a>
                )}
                {p.id === myId ? (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="rounded-pill border border-charcoal px-4 py-2 text-sm text-charcoal transition hover:bg-charcoal hover:text-cream"
                  >
                    {labels.edit}
                  </button>
                ) : (
                  <ProReportButton listingId={p.id} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
