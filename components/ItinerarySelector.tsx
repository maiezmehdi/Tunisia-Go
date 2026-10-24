'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Route, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import OfflineTripButton from '@/components/OfflineTripButton';
import { seasonFor } from '@/data/seasons';
import type { Itinerary, Photo, Place } from '@/data/types';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { lockPageScroll } from '@/lib/scrollLock';
import { formatDuration, formatKm, summarizeRoute } from '@/lib/geo';
import { googleMapsRouteUrl } from '@/lib/links';
import { useMyTrip } from '@/lib/myTrip';

export interface ItinerarySelectorProps {
  itineraries: Itinerary[];
  activeId: string | null;
  selectedPlaceId: string | null;
  onChange: (itineraryId: string | null) => void;
  onSelectStop: (placeId: string) => void;
  /** Photos per place, saved with the trip for offline use. */
  photos: Record<string, Photo[]>;
  /** Travel month picked in the header (0 = January), to flag stops to avoid. */
  month?: number | null;
}

export default function ItinerarySelector({
  itineraries,
  activeId,
  selectedPlaceId,
  onChange,
  onSelectStop,
  photos,
  month = null,
}: ItinerarySelectorProps) {
  const { t, catalog } = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  // Phones only: the panel starts folded into a small chip so the map stays visible.
  const [sheetOpen, setSheetOpen] = useState(false);
  const active = itineraries.find((i) => i.id === activeId) ?? null;
  const isPhone = useIsPhone();
  // On phones the open panel takes the whole screen and the page behind it stays still.
  const fullScreen = sheetOpen && isPhone;

  useEffect(() => {
    if (!fullScreen) return;
    const unlock = lockPageScroll();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheetOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      unlock();
      window.removeEventListener('keydown', onKey);
    };
  }, [fullScreen]);

  // Fold the stop list away while a place is open, so it does not hide the map.
  useEffect(() => {
    if (selectedPlaceId) {
      setCollapsed(true);
      setSheetOpen(false);
    }
  }, [selectedPlaceId]);

  const stops = useMemo<Place[]>(
    () => (active ? active.stops.map((id) => catalog.placeById[id]).filter((p): p is Place => !!p) : []),
    [active, catalog],
  );
  const route = useMemo(() => summarizeRoute(stops), [stops]);
  const offSeason = month === null ? [] : stops.filter((s) => seasonFor(s.id, month) === 'avoid');

  const panel = (
    <div
      role={fullScreen ? 'dialog' : undefined}
      aria-modal={fullScreen || undefined}
      aria-label={fullScreen ? t.roadTrips : undefined}
      className={`no-scrollbar pointer-events-auto w-full overflow-x-hidden ${
        fullScreen
          ? 'h-full overflow-y-auto bg-cream pb-[env(safe-area-inset-bottom)]'
          : `max-h-full max-w-[400px] overflow-y-auto rounded-3xl bg-cream/95 border border-sand-200 shadow-soft backdrop-blur-md sm:block ${sheetOpen ? 'block' : 'hidden'}`
      }`}
    >
      <div
        className={`flex items-center justify-between px-5 pt-4 ${
          fullScreen ? 'sticky top-0 z-10 bg-cream pb-3 pt-[max(1rem,env(safe-area-inset-top))]' : ''
        }`}
      >
        <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">
          <Route aria-hidden className="h-3.5 w-3.5 shrink-0 text-charcoal-500" strokeWidth={1.75} />
          {t.roadTrips}
        </p>
        <div className="-mr-2 flex">
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="flex items-center gap-1.5 rounded-pill border border-sand-200 py-1.5 pl-3.5 pr-3 text-sm text-charcoal transition hover:border-charcoal-300 sm:hidden"
          >
            {t.close}
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          {active && (
            <div className="hidden sm:flex">
              <IconButton
                label={collapsed ? t.expandItinerary : t.collapseItinerary}
                onClick={() => setCollapsed((c) => !c)}
                expanded={!collapsed}
              >
                <ChevronDown className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} strokeWidth={1.5} />
              </IconButton>
              <IconButton label={t.clearItinerary} onClick={() => onChange(null)}>
                <X className="h-4 w-4" strokeWidth={1.5} />
              </IconButton>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 px-5 pb-4 pt-3">
        {itineraries.map((it) => {
          const isActive = it.id === activeId;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                setCollapsed(false);
                onChange(isActive ? null : it.id);
              }}
              aria-pressed={isActive}
              className={`shrink-0 rounded-pill border px-3.5 py-1.5 text-sm transition ${
                isActive
                  ? 'border-charcoal bg-charcoal text-cream'
                  : 'border-sand-200 text-charcoal-700 hover:border-charcoal-300 hover:text-charcoal'
              }`}
            >
              {it.name}
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {active && !collapsed && (
          <motion.div
            key={active.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-sand-200 px-5 pb-5 pt-4">
              <h3 className="font-serif text-2xl leading-tight text-charcoal">{active.name}</h3>
              <p className="mt-0.5 font-serif text-sm italic text-charcoal-500">{active.tagline}</p>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-charcoal-500">{active.description}</p>
              {!!active.photos?.length && (
                <ul className="mt-3 grid grid-cols-4 gap-1.5">
                  {active.photos.map((src, i) => (
                    <li key={src} className="aspect-[4/3] overflow-hidden rounded-xl bg-sand">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`${active.name} ${i + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </li>
                  ))}
                </ul>
              )}
              {active.community && (
                <p className="mt-2 text-xs text-charcoal-300">
                  {active.community.author ? t.suggestedBy(active.community.author) : t.suggestedByVisitor}
                </p>
              )}

              <dl className="mt-4 grid grid-cols-3 divide-x divide-sand-200 border-y border-sand-200 py-3 text-center">
                <Stat label={t.distance} value={`~${formatKm(route.totalKm)}`} />
                <Stat label={t.driving} value={`~${formatDuration(route.totalMinutes)}`} />
                <Stat label={t.suggested} value={t.days(active.days)} />
              </dl>

              {month !== null && offSeason.length > 0 && (
                <p className="mt-3 border-l-2 border-terracotta pl-3 text-xs leading-relaxed text-charcoal-700">
                  {t.offSeasonWarning(
                    offSeason.length === stops.length ? null : offSeason.map((s) => s.name),
                    t.months[month],
                  )}
                </p>
              )}

              <ol className={`no-scrollbar mt-3 ${fullScreen ? '' : 'max-h-[30vh] overflow-y-auto'}`}>
                {stops.map((stop, i) => {
                  const leg = route.legs[i];
                  const selected = stop.id === selectedPlaceId;
                  return (
                    <li key={stop.id}>
                      <button
                        type="button"
                        onClick={() => onSelectStop(stop.id)}
                        className="group flex w-full items-baseline gap-3 py-1.5 text-left"
                      >
                        <span className="w-5 shrink-0 font-serif text-sm tabular-nums text-charcoal-300">{i + 1}</span>
                        <span
                          className={`truncate text-sm transition ${
                            selected ? 'text-terracotta-700' : 'text-charcoal group-hover:text-terracotta-700'
                          }`}
                        >
                          {stop.name}
                        </span>
                        {month !== null && seasonFor(stop.id, month) === 'avoid' && (
                          <span className="shrink-0 text-[11px] text-charcoal-300">{t.offSeason}</span>
                        )}
                      </button>
                      {leg && (
                        <p className="ml-8 border-l border-dashed border-sand-300 py-1 pl-3 text-[11px] text-charcoal-300">
                          {formatKm(leg.km)} · {formatDuration(leg.minutes)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>

              <p className="mt-2 text-[11px] text-charcoal-300">{t.estimatesNote}</p>

              <a
                href={googleMapsRouteUrl(stops)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center rounded-pill bg-charcoal px-4 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
              >
                {t.openRouteInGoogleMaps}
              </a>
              <AddStopsButton stopIds={stops.map((s) => s.id)} />
              <OfflineTripButton itinerary={active} photos={photos} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <div
        className={`pointer-events-auto items-center rounded-pill border border-sand-200 bg-cream/95 shadow-soft backdrop-blur-md sm:hidden ${sheetOpen ? 'hidden' : 'flex'}`}
      >
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-expanded={false}
          className="flex max-w-[60vw] items-center gap-2 py-2 pl-4 pr-3 text-sm text-charcoal"
        >
          <Route aria-hidden className="h-3.5 w-3.5 shrink-0 text-charcoal-500" strokeWidth={1.75} />
          <span className="truncate">{active ? active.name : t.roadTripsCount(itineraries.length)}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 rotate-180 text-charcoal-500" strokeWidth={1.5} />
        </button>
        {active && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={t.clearItinerary}
            data-tip={t.clearItinerary}
            className="grid h-9 w-9 place-items-center border-l border-sand-200 text-charcoal-500"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {fullScreen ? createPortal(<div className="fixed inset-0 z-[1400] bg-cream">{panel}</div>, document.body) : panel}
    </>
  );
}

/** Copies every stop of a suggested road trip into the visitor's own trip. */
function AddStopsButton({ stopIds }: { stopIds: string[] }) {
  const { t } = useLocale();
  const trip = useMyTrip();
  const missing = stopIds.filter((id) => !trip.has(id));
  if (missing.length === 0) {
    return (
      <p className="mt-2 flex items-center justify-center gap-2 py-2 text-sm text-charcoal-500">
        {t.allStopsInTrip} ·{' '}
        <a href="/mon-voyage" className="underline underline-offset-4 hover:text-charcoal">
          {t.viewMyTrip}
        </a>
      </p>
    );
  }
  return (
    <button
      type="button"
      onClick={() => trip.add(missing)}
      className="mt-2 flex w-full items-center justify-center rounded-pill border border-charcoal-300 px-4 py-2.5 text-sm text-charcoal transition hover:border-charcoal"
    >
      {t.addAllStops(stopIds.length)}
    </button>
  );
}

/** True below Tailwind's `sm` breakpoint (640px). */
function useIsPhone() {
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)');
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return isPhone;
}

function IconButton({
  label,
  onClick,
  expanded,
  children,
}: {
  label: string;
  onClick: () => void;
  expanded?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      className="grid h-8 w-8 place-items-center rounded-full text-charcoal-500 transition hover:bg-sand hover:text-charcoal"
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
