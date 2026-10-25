'use client';

import { ChevronDown, ChevronUp, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

import BrandLogo from '@/components/BrandLogo';
import { Thumb } from '@/components/EditorialFeed';
import LanguageSwitch from '@/components/LanguageSwitch';
import MadeBy from '@/components/MadeBy';
import SoundToggle from '@/components/SoundToggle';
import { CATEGORIES } from '@/data/tunisiaData';
import type { CategoryId, Itinerary, Photo, Place } from '@/data/types';
import { track } from '@/lib/analytics';
import { formatDuration, formatKm, haversineKm, summarizeRoute } from '@/lib/geo';
import TripPrintSheet from '@/components/trip/TripPrintSheet';
import { GENERAL_GUIDE, guideAnchor, guideFor, regionGuides } from '@/data/regionGuides';
import { bestMonthsLabel } from '@/data/seasons';
import { applyOverrides, type PlaceOverride } from '@/lib/placeOverrides';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { googleMapsRouteUrl } from '@/lib/links';
import { SHARE_PARAM, parseShared, shareUrl, useMyTrip } from '@/lib/myTrip';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-sand-50" />,
});

const ALL_CATEGORIES = new Set<CategoryId>(CATEGORIES.map((c) => c.id));
const NO_PLACES: Place[] = [];
const NO_OVERRIDES: Record<string, PlaceOverride> = {};

export interface MyTripViewProps {
  photos: Record<string, Photo[]>;
  community?: Place[];
  overrides?: Record<string, PlaceOverride>;
}

export default function MyTripView({ photos, community = NO_PLACES, overrides = NO_OVERRIDES }: MyTripViewProps) {
  const { t, locale, catalog } = useLocale();
  const trip = useMyTrip();
  const byId = useMemo(() => {
    const map = new Map<string, Place>(applyOverrides(catalog.places, overrides, locale).map((p) => [p.id, p]));
    for (const p of community) map.set(p.id, p);
    return map;
  }, [catalog.places, community, overrides, locale]);

  // A shared link (?p=…) shows that trip until the visitor keeps it or goes back to their own.
  const [shared, setShared] = useState<string[] | null>(null);
  useEffect(() => {
    const ids = parseShared(new URLSearchParams(window.location.search).get(SHARE_PARAM), (id) => byId.has(id));
    if (ids.length) setShared(ids);
    // Read once: the link does not change while the page is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const sameAsMine = shared !== null && trip.ready && shared.join(',') === trip.ids.join(',');
  const viewingShared = shared !== null && !sameAsMine;

  const dropShared = () => {
    setShared(null);
    const url = new URL(window.location.href);
    url.searchParams.delete(SHARE_PARAM);
    window.history.replaceState(null, '', url);
  };

  const ids = viewingShared ? shared : trip.ids;
  const stops = useMemo(() => ids.map((id) => byId.get(id)).filter((p): p is Place => !!p), [ids, byId]);
  const route = useMemo(() => summarizeRoute(stops), [stops]);
  const itinerary = useMemo<Itinerary>(
    () => ({
      id: 'my-trip',
      name: t.myTripTitle,
      tagline: '',
      description: '',
      days: 0,
      stops: stops.map((s) => s.id),
    }),
    [stops, t.myTripTitle],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const today = new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-dvh bg-cream text-charcoal print:bg-white">
      <header className="border-b border-sand-200 print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandLogo tag={t.myTrip} size={40} compact />
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:inline-flex">
              <SoundToggle />
            </span>
            <LanguageSwitch />
            <a
              href="/explore"
              className="whitespace-nowrap text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline"
            >
              <span className="hidden sm:inline">{t.backToMap}</span>
              <span className="sm:hidden">{t.viewMap}</span>
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-12 print:hidden">
        {/* Only on paper: a plain title line instead of the site header. */}
        <p className="hidden text-[11px] uppercase tracking-[0.22em] text-charcoal-500 print:block">
          Tunisia Go · {t.printedFrom(today)}
        </p>

        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300 print:hidden">
          {viewingShared ? t.sharedEyebrow : t.myTripEyebrow}
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl print:text-4xl">
          {viewingShared ? t.sharedTitle : t.myTripTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-charcoal-500 print:hidden">
          {viewingShared ? t.sharedLead(stops.length) : t.myTripLead}
        </p>

        {viewingShared && (
          <div className="mt-6 flex flex-wrap items-center gap-3 border-l-2 border-terracotta pl-4 print:hidden">
            <button
              type="button"
              onClick={() => {
                trip.replace(shared);
                dropShared();
                track('trip_shared_kept', { stops: shared.length });
              }}
              className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
            >
              {t.keepShared}
            </button>
            {trip.ids.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    trip.add(shared);
                    dropShared();
                  }}
                  className="rounded-pill border border-charcoal-300 px-5 py-2.5 text-sm text-charcoal transition hover:border-charcoal"
                >
                  {t.addShared}
                </button>
                <button
                  type="button"
                  onClick={dropShared}
                  className="text-sm text-charcoal-500 underline underline-offset-4 hover:text-charcoal"
                >
                  {t.seeMine}
                </button>
              </>
            )}
            {trip.ids.length > 0 && <p className="w-full text-xs text-charcoal-300">{t.keepSharedHint}</p>}
          </div>
        )}

        {!trip.ready && !viewingShared ? (
          <div className="mt-12 h-64" />
        ) : stops.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_440px] lg:gap-14 print:mt-6 print:flex print:flex-col">
            {/* The route */}
            <section aria-label={t.itineraryStops} className="min-w-0">
              <dl className="grid grid-cols-3 divide-x divide-sand-200 border-y border-sand-200 py-4 text-center">
                <Stat label={t.stopsLabel} value={t.stopsCount(stops.length)} />
                <Stat label={t.distance} value={stops.length > 1 ? `~${formatKm(route.totalKm)}` : '–'} />
                <Stat label={t.driving} value={stops.length > 1 ? `~${formatDuration(route.totalMinutes)}` : '–'} />
              </dl>

              <ol className="mt-2">
                {stops.map((stop, i) => {
                  const leg = route.legs[i];
                  const category = catalog.categoryById[stop.category];
                  const active = stop.id === selectedId;
                  return (
                    <li key={stop.id} className="break-inside-avoid">
                      <div
                        className={`group flex items-center gap-4 rounded-2xl py-3 transition ${
                          active ? 'bg-sand-50 print:bg-transparent' : ''
                        }`}
                        onMouseEnter={() => setSelectedId(stop.id)}
                      >
                        <span className="w-6 shrink-0 text-right font-serif text-lg tabular-nums text-charcoal-300">
                          {i + 1}
                        </span>
                        <span className="print:hidden">
                          <Thumb src={photos[stop.id]?.[0]?.src} name={stop.name} small />
                        </span>
                        <div className="min-w-0 flex-1">
                          <a
                            href={`/explore?place=${encodeURIComponent(stop.id)}`}
                            className="block truncate font-serif text-xl leading-tight text-charcoal transition hover:text-terracotta-700"
                          >
                            {stop.name}
                          </a>
                          <p className="mt-0.5 truncate text-sm text-charcoal-500">
                            {stop.region} · {category?.label}
                            {stop.visitDuration && ` · ${stop.visitDuration}`}
                          </p>
                          <p className="mt-1 truncate font-serif text-[15px] italic text-charcoal-700">
                            {stop.tagline}
                          </p>
                          <p className="mt-0.5 text-xs text-charcoal-300">
                            {t.bestPeriod(bestMonthsLabel(stop.id, locale))}
                          </p>
                        </div>
                        {!viewingShared && (
                          <div className="flex shrink-0 items-center print:hidden">
                            <RowButton label={t.moveUp} disabled={i === 0} onClick={() => trip.move(stop.id, -1)}>
                              <ChevronUp className="h-4 w-4" strokeWidth={1.5} />
                            </RowButton>
                            <RowButton
                              label={t.moveDown}
                              disabled={i === stops.length - 1}
                              onClick={() => trip.move(stop.id, 1)}
                            >
                              <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
                            </RowButton>
                            <RowButton label={t.removeFromTrip} onClick={() => trip.remove(stop.id)} align="end">
                              <X className="h-4 w-4" strokeWidth={1.5} />
                            </RowButton>
                          </div>
                        )}
                      </div>
                      {leg && (
                        <p className="ml-[11px] border-l border-dashed border-sand-300 py-1.5 pl-[29px] text-xs text-charcoal-300">
                          {formatKm(leg.km)} · {formatDuration(leg.minutes)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
              <p className="mt-4 text-xs text-charcoal-300">{t.estimatesNote}</p>

              {!viewingShared && <NearbyStops stops={stops} all={byId} photos={photos} />}
              <TripGuides stops={stops} />
            </section>

            {/* Map and actions */}
            <aside className="lg:sticky lg:top-6 lg:self-start print:order-first">
              <div className="h-[340px] overflow-hidden rounded-3xl border border-sand-200 sm:h-[420px] print:mx-auto print:h-[420px] print:w-[440px] print:break-inside-avoid">
                <InteractiveMap
                  places={stops}
                  activeCategories={ALL_CATEGORIES}
                  selectedId={null}
                  itinerary={itinerary}
                  onSelect={setSelectedId}
                />
              </div>

              <div className="mt-5 grid gap-2 print:hidden">
                <ShareButton ids={ids} />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      track('trip_pdf', { stops: stops.length });
                      window.print();
                    }}
                    className="rounded-pill border border-charcoal-300 px-4 py-2.5 text-sm text-charcoal transition hover:border-charcoal"
                  >
                    {t.exportPdf}
                  </button>
                  <a
                    href={googleMapsRouteUrl(stops)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-pill border border-charcoal-300 px-4 py-2.5 text-center text-sm text-charcoal transition hover:border-charcoal"
                  >
                    Google Maps
                  </a>
                </div>
                {!viewingShared && (
                  <>
                    <p className="mt-2 text-xs leading-relaxed text-charcoal-300">{t.savedOnDevice}</p>
                    <ClearButton onClear={trip.clear} />
                  </>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>

      <footer className="border-t border-sand-200 print:hidden">
        <MadeBy className="mx-auto max-w-6xl px-4 py-6 sm:px-6" />
      </footer>

      {stops.length > 0 && <TripPrintSheet stops={stops} route={route} photos={photos} itinerary={itinerary} />}
    </main>
  );
}

/** A few places close to the end of the route, one click away. */
function NearbyStops({
  stops,
  all,
  photos,
}: {
  stops: Place[];
  all: Map<string, Place>;
  photos: Record<string, Photo[]>;
}) {
  const { t } = useLocale();
  const trip = useMyTrip();
  const last = stops[stops.length - 1];
  const picks = useMemo(() => {
    if (!last) return [];
    const taken = new Set(stops.map((s) => s.id));
    return [...all.values()]
      .filter((p) => !taken.has(p.id))
      .map((p) => ({ place: p, km: haversineKm(last.coords, p.coords) * 1.3 }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 3);
  }, [stops, all, last]);
  if (picks.length === 0) return null;
  return (
    <div className="mt-10 border-t border-sand-200 pt-6">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{t.nearbyTitle}</h2>
      <ul className="mt-3 divide-y divide-sand-200">
        {picks.map(({ place, km }) => (
          <li key={place.id} className="flex items-center gap-4 py-3">
            <Thumb src={photos[place.id]?.[0]?.src} name={place.name} small />
            <div className="min-w-0 flex-1">
              <a
                href={`/explore?place=${encodeURIComponent(place.id)}`}
                className="block truncate font-serif text-lg leading-tight text-charcoal hover:text-terracotta-700"
              >
                {place.name}
              </a>
              <p className="mt-0.5 truncate text-sm text-charcoal-500">{t.kmFrom(formatKm(km), last.name)}</p>
            </div>
            <button
              type="button"
              onClick={() => trip.add(place.id)}
              className="shrink-0 rounded-pill border border-charcoal-300 px-4 py-1.5 text-sm text-charcoal transition hover:border-charcoal"
            >
              {t.addStop}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The regional notes that apply to this trip's stops. */
function TripGuides({ stops }: { stops: Place[] }) {
  const { t, locale } = useLocale();
  const guides = useMemo(() => {
    const wanted = new Set(stops.map((s) => guideFor(s.id)));
    wanted.add(GENERAL_GUIDE);
    return regionGuides(locale).filter((g) => wanted.has(g.id));
  }, [stops, locale]);
  return (
    <div className="mt-10 border-t border-sand-200 pt-6">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{t.tripGuides}</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {guides.map((g) => (
          <li key={g.id}>
            <a
              href={`/pratique#${guideAnchor(g.id)}`}
              className="group block h-full rounded-2xl border border-sand-200 p-4 transition hover:border-charcoal-300"
            >
              <span className="block font-serif text-lg leading-snug text-charcoal group-hover:text-terracotta-700">
                {g.title}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-charcoal-500">
                {g.notes
                  .slice(0, 3)
                  .map((n) => n.title)
                  .join(' · ')}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState() {
  const { t } = useLocale();
  return (
    <div className="mt-12 max-w-xl border-t border-sand-200 pt-10">
      <h2 className="font-serif text-3xl leading-tight">{t.myTripEmptyTitle}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-charcoal-500">{t.myTripEmptyText}</p>
      <a
        href="/explore"
        className="mt-6 inline-flex rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
      >
        {t.openTheMap}
      </a>
    </div>
  );
}

function ShareButton({ ids }: { ids: string[] }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = shareUrl(ids);
    track('trip_shared', { stops: ids.length });
    // Phones open the share sheet; desktops copy the link.
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: `Tunisia Go · ${t.myTripTitle}`, url });
        return;
      } catch {
        // Cancelled: fall back to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt(t.shareLink, url);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  };
  return (
    <button
      type="button"
      onClick={share}
      aria-live="polite"
      className="rounded-pill bg-charcoal px-4 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
    >
      {copied ? t.linkCopied : t.shareLink}
    </button>
  );
}

/** Two clicks, so a stray tap does not wipe the trip. */
function ClearButton({ onClear }: { onClear: () => void }) {
  const { t } = useLocale();
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [armed]);
  return (
    <button
      type="button"
      onClick={() => (armed ? onClear() : setArmed(true))}
      className={`justify-self-start text-sm underline-offset-4 transition hover:underline ${
        armed ? 'text-terracotta-700' : 'text-charcoal-500'
      }`}
    >
      {armed ? t.confirmClear : t.clearTrip}
    </button>
  );
}

function RowButton({
  label,
  onClick,
  disabled,
  align,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  align?: 'end';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      data-tip={label}
      data-tip-align={align}
      className="grid h-8 w-8 place-items-center rounded-full text-charcoal-500 transition hover:bg-sand hover:text-charcoal disabled:pointer-events-none disabled:opacity-25"
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-charcoal-300">{label}</dt>
      <dd className="mt-0.5 text-sm text-charcoal">{value}</dd>
    </div>
  );
}
