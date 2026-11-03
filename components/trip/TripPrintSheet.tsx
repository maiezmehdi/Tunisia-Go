'use client';

import dynamic from 'next/dynamic';
import QRCode from 'qrcode';
import { useEffect, useMemo, useState } from 'react';

import { BrandMark } from '@/components/BrandLogo';
import { LEXICON } from '@/data/lexicon';
import { GENERAL_GUIDE, guideAnchor, guideFor, regionGuides } from '@/data/regionGuides';
import { bestMonthsLabel, tripBestMonthsLabel } from '@/data/seasons';
import { CATEGORIES } from '@/data/tunisiaData';
import type { CategoryId, Itinerary, Photo, Place } from '@/data/types';
import { formatDuration, formatKm, type RouteSummary } from '@/lib/geo';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { shareUrl } from '@/lib/myTrip';
import { SITE_URL } from '@/lib/seo';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { ssr: false });

const ALL_CATEGORIES = new Set<CategoryId>(CATEGORIES.map((c) => c.id));

/** Words worth carrying on paper. */
const PRINT_WORDS = ['aslema', 'aychek', 'labes', 'bkadech', 'ghali', 'behi', 'mouch-har', 'saha', 'yezzi', 'mrigel'];

const COPY = {
  fr: {
    tag: 'Road trips & atlas',
    title: 'Mon road trip',
    from: (a: string, b: string) => `De ${a} à ${b}`,
    prepared: (d: string) => `Préparé le ${d}`,
    stops: 'Étapes',
    distance: 'Distance',
    driving: 'Conduite',
    bestTime: 'Meilleure période',
    flexible: 'À choisir selon les étapes',
    route: 'L’itinéraire',
    estimates:
      'Distances et temps estimés à vol d’oiseau, corrigés d’un facteur routier. Vérifiez la route avant de partir.',
    stopN: (n: number) => `Étape ${n}`,
    visit: 'Sur place',
    season: 'Idéal',
    customs: 'Usages',
    food: 'À goûter',
    didYouKnow: 'Le saviez-vous ?',
    guide: 'Cahier pratique',
    fullGuide: 'Le cahier complet',
    next: (km: string, time: string, name: string) => `${km} · environ ${time} de route jusqu’à ${name}`,
    photo: (author: string, license: string) => `Photo : ${author}, ${license}`,
    toolkit: 'Pour la route',
    words: 'Les mots du cru',
    everywhere: 'Partout, toute l’année',
    emergency: 'Numéros utiles',
    emergencyText: 'Police 197 · SAMU 190 · Pompiers 198 · Garde nationale 193',
    online: 'Ce road trip en ligne',
    onlineText:
      'Scannez pour l’ouvrir sur votre téléphone, avec la carte, les photos et les itinéraires Google Maps ou Waze.',
    footer: 'Tunisia Go · Mon road trip',
  },
  en: {
    tag: 'Road trips & atlas',
    title: 'My road trip',
    from: (a: string, b: string) => `From ${a} to ${b}`,
    prepared: (d: string) => `Prepared on ${d}`,
    stops: 'Stops',
    distance: 'Distance',
    driving: 'Driving',
    bestTime: 'Best time',
    flexible: 'Depends on the stops',
    route: 'The route',
    estimates: 'Distances and times are straight-line estimates with a road factor. Check the road before you leave.',
    stopN: (n: number) => `Stop ${n}`,
    visit: 'Time there',
    season: 'Best',
    customs: 'Customs',
    food: 'To taste',
    didYouKnow: 'Did you know?',
    guide: 'Regional notes',
    fullGuide: 'All the notes',
    next: (km: string, time: string, name: string) => `${km} · about ${time} on the road to ${name}`,
    photo: (author: string, license: string) => `Photo: ${author}, ${license}`,
    toolkit: 'For the road',
    words: 'Local words',
    everywhere: 'Everywhere, all year',
    emergency: 'Useful numbers',
    emergencyText: 'Police 197 · Ambulance (SAMU) 190 · Fire brigade 198 · National Guard 193',
    online: 'This road trip online',
    onlineText: 'Scan to open it on your phone, with the map, photos and Google Maps or Waze directions.',
    footer: 'Tunisia Go · My road trip',
  },
};

export interface TripPrintSheetProps {
  stops: Place[];
  route: RouteSummary;
  photos: Record<string, Photo[]>;
  itinerary: Itinerary;
}

/**
 * The printed road trip ("Exporter en PDF"). Kept off screen but laid out at A4 width,
 * so its map is framed at the size it prints.
 */
export default function TripPrintSheet({ stops, route, photos, itinerary }: TripPrintSheetProps) {
  const { locale, catalog } = useLocale();
  const c = COPY[locale];
  const guides = useMemo(() => Object.fromEntries(regionGuides(locale).map((g) => [g.id, g])), [locale]);
  const ids = stops.map((s) => s.id);
  const best = tripBestMonthsLabel(ids, locale);
  const words = LEXICON.flatMap((g) => g.words).filter((w) => PRINT_WORDS.includes(w.id));
  const [link, setLink] = useState('');
  const [qr, setQr] = useState('');

  useEffect(() => {
    const url = shareUrl(ids);
    setLink(url);
    QRCode.toString(url, {
      type: 'svg',
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#1A1A1A', light: '#0000' },
    })
      .then(setQr)
      .catch(() => setQr(''));
    // ids is derived from stops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')]);

  const today = new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const host = SITE_URL.replace(/^https?:\/\//, '');

  return (
    <div
      aria-hidden
      inert
      className="tg-print-sheet pointer-events-none fixed left-[-12000px] top-0 w-[794px] bg-white text-charcoal print:pointer-events-auto print:static print:w-auto"
    >
      {/* No browser header or footer: the page has no margin, the table head and foot repeat on every sheet. */}
      <style>{'@media print { @page { size: A4; margin: 0; } }'}</style>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <td>
              <div className="h-[12mm]" />
            </td>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <td>
              <div className="flex h-[14mm] items-start justify-between px-[16mm] pt-[4mm] text-[8.5px] uppercase tracking-[0.2em] text-charcoal-300">
                <span>{c.footer}</span>
                <span>{host}</span>
              </div>
            </td>
          </tr>
        </tfoot>
        <tbody>
          <tr>
            <td className="px-[16mm] align-top">
              {/* Masthead */}
              <header className="flex items-center justify-between border-b border-charcoal pb-4">
                <div className="flex items-center gap-3">
                  <BrandMark size={44} animated={false} />
                  <div className="leading-none">
                    <p className="font-serif text-[22px] uppercase tracking-[-0.01em]">Tunisia Go</p>
                    <p className="mt-1.5 font-serif text-[9.5px] uppercase tracking-[0.22em] text-charcoal-500">
                      {c.tag}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal-500">{c.prepared(today)}</p>
              </header>

              <h1 className="mt-7 font-serif text-[40px] leading-[1.02] tracking-tight">{c.title}</h1>
              {stops.length > 1 && (
                <p className="mt-1.5 font-serif text-lg italic text-charcoal-500">
                  {c.from(stops[0].name, stops[stops.length - 1].name)}
                </p>
              )}

              <dl className="mt-6 grid grid-cols-4 divide-x divide-sand-200 border-y border-sand-200 py-3 text-center">
                <Fact label={c.stops} value={String(stops.length)} />
                <Fact label={c.distance} value={stops.length > 1 ? `~${formatKm(route.totalKm)}` : '–'} />
                <Fact label={c.driving} value={stops.length > 1 ? `~${formatDuration(route.totalMinutes)}` : '–'} />
                <Fact label={c.bestTime} value={best ?? c.flexible} />
              </dl>

              <div className="mt-6 h-[360px] overflow-hidden rounded-2xl border border-sand-200">
                <InteractiveMap
                  places={stops}
                  activeCategories={ALL_CATEGORIES}
                  selectedId={null}
                  itinerary={itinerary}
                  onSelect={() => undefined}
                  still
                />
              </div>

              {/* Route at a glance */}
              <section className="mt-6 break-inside-avoid">
                <SmallTitle>{c.route}</SmallTitle>
                <ol className="mt-2 columns-2 gap-8 text-[12px]">
                  {stops.map((s, i) => (
                    <li key={s.id} className="flex break-inside-avoid items-baseline gap-2 py-0.5">
                      <span className="w-4 shrink-0 text-right font-serif tabular-nums text-charcoal-300">{i + 1}</span>
                      <span className="text-charcoal">{s.name}</span>
                      <span className="text-charcoal-300">· {s.region}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-[10px] text-charcoal-300">{c.estimates}</p>
              </section>

              {/* Share */}
              <section className="mt-6 flex break-inside-avoid items-center gap-6 rounded-2xl border border-sand-200 p-5">
                {qr && (
                  <div
                    className="h-[30mm] w-[30mm] shrink-0 [&>svg]:h-full [&>svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: qr }}
                  />
                )}
                <div className="min-w-0">
                  <SmallTitle>{c.online}</SmallTitle>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-charcoal-700">{c.onlineText}</p>
                  <p className="mt-1.5 break-all text-[10px] text-charcoal-500">{link}</p>
                </div>
              </section>
              {/* One card per stop */}
              <div className="mt-8">
                {stops.map((stop, i) => {
                  const photo = photos[stop.id]?.[0];
                  const category = catalog.categoryById[stop.category];
                  const gid = guideFor(stop.id);
                  const guide = guides[gid] ?? guides[GENERAL_GUIDE];
                  const leg = route.legs[i];
                  const next = stops[i + 1];
                  return (
                    <div key={stop.id}>
                      <article className="break-inside-avoid border-t border-charcoal pt-4">
                        <div className="flex gap-6">
                          <div className="w-[50mm] shrink-0">
                            {photo ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={photo.src}
                                  alt=""
                                  className="aspect-[4/3] w-full rounded-xl object-cover"
                                  loading="eager"
                                />
                                <p className="mt-1 text-[8px] leading-snug text-charcoal-300">
                                  {c.photo(photo.author, photo.license)}
                                </p>
                              </>
                            ) : (
                              <div className="grid aspect-[4/3] w-full place-items-center rounded-xl border border-sand-200 bg-sand-50">
                                <span className="font-serif text-5xl italic text-charcoal-300">
                                  {stop.name.replace(/^(le|la|les|l’|the)\s+/i, '').charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[9.5px] uppercase tracking-[0.2em] text-charcoal-300">
                              {c.stopN(i + 1)} · {category?.label}
                              {stop.unesco && ' · UNESCO'}
                            </p>
                            <div className="mt-1 flex items-baseline justify-between gap-3">
                              <h2 className="font-serif text-[24px] leading-tight">{stop.name}</h2>
                              {stop.nameAr && (
                                <span lang="ar" dir="rtl" className="shrink-0 font-serif text-base text-charcoal-300">
                                  {stop.nameAr}
                                </span>
                              )}
                            </div>
                            <p className="text-[12px] text-charcoal-500">{stop.region}</p>
                            <p className="mt-2 font-serif text-[15px] italic text-charcoal-700">{stop.tagline}</p>
                            <p className="mt-1.5 text-[10.5px] leading-[1.55] text-charcoal-700">{stop.description}</p>
                          </div>
                        </div>

                        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[10.5px] leading-[1.5]">
                          {stop.visitDuration && <Info label={c.visit}>{stop.visitDuration}</Info>}
                          <Info label={c.season}>{bestMonthsLabel(stop.id, locale)}</Info>
                          {stop.insights.customs && <Info label={c.customs}>{stop.insights.customs}</Info>}
                          {stop.insights.food && <Info label={c.food}>{stop.insights.food}</Info>}
                          {stop.didYouKnow && (
                            <Info label={c.didYouKnow} wide>
                              <span className="font-serif text-[12px] italic text-charcoal">{stop.didYouKnow}</span>
                            </Info>
                          )}
                          {guide && (
                            <Info label={`${c.guide} · ${guide.title}`} wide>
                              {guide.notes.slice(0, 1).map((n) => (
                                <span key={n.title} className="block">
                                  <span className="font-medium text-charcoal">{n.title}.</span> {n.text}
                                </span>
                              ))}
                              <span className="mt-1 block text-charcoal-300">
                                {c.fullGuide} : {host}/pratique#{guideAnchor(guide.id)}
                              </span>
                            </Info>
                          )}
                        </dl>
                      </article>

                      {leg && next && (
                        <p className="my-3 ml-[25mm] border-l border-dashed border-sand-300 py-1.5 pl-4 text-[10.5px] text-charcoal-500">
                          {c.next(formatKm(leg.km), formatDuration(leg.minutes), next.name)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Toolkit */}
              <section className="mt-10 break-inside-avoid border-t border-charcoal pt-5">
                <h2 className="font-serif text-[26px] leading-tight">{c.toolkit}</h2>
                <div className="mt-4 grid grid-cols-2 gap-8">
                  <div>
                    <SmallTitle>{c.words}</SmallTitle>
                    <dl className="mt-2 divide-y divide-sand-200 border-y border-sand-200 text-[11px]">
                      {words.map((w) => (
                        <div key={w.id} className="flex items-baseline gap-3 py-1.5">
                          <dt className="w-[26mm] shrink-0 font-serif text-[14px] text-charcoal">{w.latin}</dt>
                          <dd className="flex-1 text-charcoal-500">{w.meaning[locale]}</dd>
                          <span lang="ar" dir="rtl" className="shrink-0 font-serif text-[12px] text-charcoal-300">
                            {w.ar}
                          </span>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div>
                    <SmallTitle>{c.everywhere}</SmallTitle>
                    <dl className="mt-2 space-y-2 text-[11px] leading-relaxed">
                      {guides[GENERAL_GUIDE]?.notes.map((n) => (
                        <div key={n.title}>
                          <dt className="font-medium text-charcoal">{n.title}</dt>
                          <dd className="text-charcoal-500">{n.text}</dd>
                        </div>
                      ))}
                    </dl>
                    <SmallTitle className="mt-4">{c.emergency}</SmallTitle>
                    <p className="mt-1 text-[11px] tabular-nums text-charcoal-700">{c.emergencyText}</p>
                  </div>
                </div>
              </section>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2">
      <dt className="text-[9px] uppercase tracking-[0.18em] text-charcoal-300">{label}</dt>
      <dd className="mt-0.5 text-[13px] text-charcoal">{value}</dd>
    </div>
  );
}

function SmallTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-[9.5px] font-medium uppercase tracking-[0.22em] text-charcoal-500 ${className}`}>
      {children}
    </h3>
  );
}

function Info({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <dt className="text-[9px] uppercase tracking-[0.18em] text-charcoal-300">{label}</dt>
      <dd className="mt-0.5 text-charcoal-700">{children}</dd>
    </div>
  );
}
