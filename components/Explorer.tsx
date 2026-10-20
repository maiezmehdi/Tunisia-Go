'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';

import ActionDrawer from '@/components/ActionDrawer';
import AddSpotLink from '@/components/AddSpotLink';
import BrandLogo from '@/components/BrandLogo';
import EditorialFeed from '@/components/EditorialFeed';
import ItinerarySelector from '@/components/ItinerarySelector';
import LanguageSwitch from '@/components/LanguageSwitch';
import SoundToggle from '@/components/SoundToggle';
import OfflineBadge from '@/components/OfflineBadge';
import { seasonFor } from '@/data/seasons';
import { track } from '@/lib/analytics';
import { CATEGORIES } from '@/data/tunisiaData';
import type { CategoryId, Photo, Place } from '@/data/types';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { useMyTrip } from '@/lib/myTrip';
import { SOUTH_TRIPS, useSound } from '@/lib/sound';

// Leaflet touches `window`, so the map only renders in the browser.
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => <MapLoading />,
});

function MapLoading() {
  const { t } = useLocale();
  return (
    <div className="grid h-full w-full place-items-center bg-sand-50">
      <p className="font-serif text-lg italic text-charcoal-300">{t.loadingMap}</p>
    </div>
  );
}

type ViewMode = 'map' | 'split';

const ALL_CATEGORIES = new Set<CategoryId>(CATEGORIES.map((c) => c.id));

export interface ExplorerProps {
  /** Photos per place id, loaded on the server */
  photos: Record<string, Photo[]>;
  /** Places suggested by visitors and approved on the moderation page. */
  community?: Place[];
}

const NO_PLACES: Place[] = [];

export default function Explorer({ photos, community = NO_PLACES }: ExplorerProps) {
  const { t, catalog } = useLocale();
  const { itineraries: ITINERARIES, categories } = catalog;
  const PLACES = useMemo(() => [...catalog.places, ...community], [catalog.places, community]);
  const PLACE_BY_ID = useMemo(() => Object.fromEntries(PLACES.map((p) => [p.id, p])), [PLACES]);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [activeCategories, setActiveCategories] = useState<Set<CategoryId>>(ALL_CATEGORIES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [itineraryId, setItineraryId] = useState<string | null>(null);
  /** 0 = January. null shows every place whatever the season. */
  const [month, setMonth] = useState<number | null>(null);

  // Deep links from the landing page: /explore?trip=<itinerary id>&place=<place id>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trip = params.get('trip');
    const place = params.get('place');
    if (trip && ITINERARIES.some((i) => i.id === trip)) setItineraryId(trip);
    if (place && PLACE_BY_ID[place]) setSelectedId(place);
    // Read once on mount: the catalog only changes with a full reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the chosen road trip in the address bar so the view can be shared.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (itineraryId) url.searchParams.set('trip', itineraryId);
    else url.searchParams.delete('trip');
    url.searchParams.delete('place');
    window.history.replaceState(null, '', url);
  }, [itineraryId]);

  const itinerary = ITINERARIES.find((i) => i.id === itineraryId) ?? null;

  // The Grand Sud road trips get a little more of the ambience (it never starts on its own).
  const { setMood } = useSound();
  useEffect(() => {
    setMood(itineraryId && SOUTH_TRIPS.has(itineraryId) ? 'south' : 'default');
    return () => setMood('default');
  }, [itineraryId, setMood]);
  const selectedPlace = selectedId ? (PLACE_BY_ID[selectedId] ?? null) : null;

  const feedPlaces = useMemo(() => {
    if (itinerary) return itinerary.stops.map((id) => PLACE_BY_ID[id]).filter((p): p is Place => !!p);
    const inCategory = PLACES.filter((p) => activeCategories.has(p.category));
    if (month === null) return inCategory;
    // Hide places to avoid that month and put the best ones first.
    const rank = { best: 0, fine: 1, avoid: 2 } as const;
    return inCategory
      .filter((p) => seasonFor(p.id, month) !== 'avoid')
      .sort((a, b) => rank[seasonFor(a.id, month)] - rank[seasonFor(b.id, month)]);
  }, [activeCategories, itinerary, month, PLACES, PLACE_BY_ID]);

  const mapPlaces = useMemo(() => {
    if (month === null) return PLACES;
    const stops = new Set(itinerary?.stops ?? []);
    return PLACES.filter((p) => stops.has(p.id) || seasonFor(p.id, month) !== 'avoid');
  }, [month, itinerary, PLACES]);

  const counts = useMemo(() => {
    const c = {} as Record<CategoryId, number>;
    for (const p of PLACES) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [PLACES]);

  const allOn = activeCategories.size === ALL_CATEGORIES.size;

  const toggleCategory = (id: CategoryId) =>
    setActiveCategories((prev) => {
      // First click while everything is on isolates that category, like a map legend.
      if (prev.size === ALL_CATEGORIES.size) return new Set([id]);
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next.size === 0 ? new Set(ALL_CATEGORIES) : next;
    });

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    track('place_opened', { place: id });
  }, []);
  const handleClose = useCallback(() => setSelectedId(null), []);
  const handleItinerary = (id: string | null) => {
    setItineraryId(id);
    setSelectedId(null);
    if (id) track('trip_selected', { trip: id });
  };

  // Month and categories live with the content (above the list, or over the map in map view),
  // not in the top bar.
  const filters = (
    <div role="group" aria-label={t.mapLayers} className="flex flex-wrap items-center gap-1.5">
      <MonthSelect value={month} onChange={setMonth} />
      <FilterPill active={allOn} onClick={() => setActiveCategories(new Set(ALL_CATEGORIES))}>
        {t.all} <Count>{PLACES.length}</Count>
      </FilterPill>
      {categories.map((c) => (
        <FilterPill
          key={c.id}
          title={c.label}
          active={!allOn && activeCategories.has(c.id)}
          onClick={() => toggleCategory(c.id)}
        >
          {c.short} <Count>{counts[c.id]}</Count>
        </FilterPill>
      ))}
    </div>
  );

  return (
    <main
      className={`flex flex-col bg-cream md:h-dvh md:overflow-hidden ${
        // Phones in list view: one page scroll (map, then the journal), no inner scroller.
        viewMode === 'split' ? 'min-h-dvh' : 'h-dvh overflow-hidden'
      }`}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-[1200] flex flex-col gap-3 border-b border-sand-200 bg-cream px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-8">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <BrandLogo tag={t.explorer} size={38} compact />
          <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
            <OfflineBadge />
            <ViewToggle mode={viewMode} onChange={setViewMode} compact />
            <SoundToggle className="px-1.5" />
            <MobileMenu />
          </div>
        </div>

        <div aria-hidden className="hidden lg:block lg:flex-1" />

        <div className="hidden items-center gap-5 lg:flex">
          <OfflineBadge />
          <AddSpotLink from="header" />
          <HeaderLinks />
          <SoundToggle label />
          <LanguageSwitch />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </header>

      {/* Body */}
      <div className="relative flex min-h-0 flex-1 flex-col-reverse md:flex-row">
        {viewMode === 'split' && (
          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="shrink-0 border-t border-sand-200 bg-cream md:w-[420px] md:border-r md:border-t-0"
          >
            <EditorialFeed
              places={feedPlaces}
              photos={photos}
              selectedId={selectedId}
              onSelect={handleSelect}
              month={itinerary ? null : month}
              filters={filters}
            />
          </motion.aside>
        )}

        <section
          className={`relative min-h-0 md:h-auto md:flex-1 ${viewMode === 'split' ? 'h-[62svh] shrink-0' : 'flex-1'}`}
        >
          <InteractiveMap
            places={mapPlaces}
            activeCategories={activeCategories}
            selectedId={selectedId}
            itinerary={itinerary}
            onSelect={handleSelect}
            layoutKey={viewMode}
          />

          {viewMode === 'map' && (
            <div className="absolute left-3 right-3 top-3 z-[1000] sm:right-auto sm:max-w-[640px]">
              <div className="rounded-3xl border border-sand-200 bg-cream/95 p-2 shadow-soft backdrop-blur">
                {filters}
              </div>
            </div>
          )}

          <div
            className={`pointer-events-none absolute right-3 z-[1000] lg:hidden ${
              // In map view the filters take the top edge: the button moves above the zoom.
              viewMode === 'map' ? 'bottom-24' : 'top-3'
            }`}
          >
            <AddSpotLink from="map" variant="floating" />
          </div>

          <div className="pointer-events-none absolute inset-4 z-[1000] flex items-end sm:right-auto">
            <ItinerarySelector
              itineraries={ITINERARIES}
              activeId={itineraryId}
              selectedPlaceId={selectedId}
              onChange={handleItinerary}
              onSelectStop={handleSelect}
              month={month}
              photos={photos}
            />
          </div>
        </section>

        <ActionDrawer
          place={selectedPlace}
          photos={selectedPlace ? (photos[selectedPlace.id] ?? []) : []}
          itinerary={itinerary}
          onClose={handleClose}
          onNavigate={handleSelect}
          month={month}
        />
      </div>
    </main>
  );
}

function HeaderLinks() {
  const { t } = useLocale();
  const link =
    'whitespace-nowrap text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline';
  return (
    <nav aria-label={t.travelTools} className="flex items-center gap-4">
      <MyTripLink className={link} />
      <a href="/pratique" className={link}>
        {t.practical}
      </a>
    </nav>
  );
}

function MyTripLink({ className }: { className: string }) {
  const { t } = useLocale();
  const { ids } = useMyTrip();
  return (
    <a href="/mon-voyage" className={className}>
      {t.myTripCount(ids.length)}
    </a>
  );
}

/** Below desktop width: a quiet "Menu" button that opens the secondary links and the language switch. */
function MobileMenu() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const link = 'block py-2.5 text-sm text-charcoal-700 transition hover:text-charcoal';
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="explorer-menu"
        aria-label={t.menu}
        data-tip={t.menu}
        data-tip-align="end"
        className="grid h-8 w-8 place-items-center rounded-full border border-sand-200 text-charcoal-700 transition hover:border-charcoal-300"
      >
        <svg aria-hidden viewBox="0 0 14 8" className="h-2 w-3.5">
          {open ? (
            <path d="M3 0.5l8 7M11 0.5l-8 7" fill="none" stroke="currentColor" strokeWidth="1.3" />
          ) : (
            <path d="M0 1h14M0 7h14" fill="none" stroke="currentColor" strokeWidth="1.3" />
          )}
        </svg>
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label={t.close}
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 cursor-default"
          />
          <div
            id="explorer-menu"
            className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-sand-200 bg-cream px-5 py-2 shadow-soft"
          >
            <AddSpotLink from="mobile-menu" variant="primary" className="mb-2 mt-2 w-full justify-center" />
            <MyTripLink className={`${link} border-t border-sand-200`} />
            <a href="/pratique" className={`${link} border-t border-sand-200`}>
              {t.practical}
            </a>

            <div className="flex items-center justify-between border-t border-sand-200 py-3">
              <span className="text-[11px] uppercase tracking-[0.18em] text-charcoal-300">{t.language}</span>
              <LanguageSwitch />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MonthSelect({ value, onChange }: { value: number | null; onChange: (m: number | null) => void }) {
  const { t } = useLocale();
  return (
    <label className="relative inline-flex shrink-0 items-center">
      <span className="sr-only">{t.travelMonth}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className={`appearance-none rounded-pill border py-1.5 pl-4 pr-9 text-sm transition focus:outline-none focus-visible:ring-1 focus-visible:ring-charcoal ${
          value === null
            ? 'border-sand-200 bg-transparent text-charcoal-700 hover:border-charcoal-300'
            : 'border-charcoal bg-charcoal text-cream'
        }`}
      >
        <option value="">{t.anyMonth}</option>
        {t.months.map((m, i) => (
          <option key={m} value={i}>
            {t.inMonth(m)}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 10 6"
        className={`pointer-events-none absolute right-3.5 h-1.5 w-2.5 ${value === null ? 'text-charcoal-500' : 'text-cream'}`}
      >
        <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    </label>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return <span className="tabular-nums opacity-50">{children}</span>;
}

function FilterPill({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  title?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-4 py-1.5 text-sm transition ${
        active
          ? 'border-charcoal bg-charcoal text-cream'
          : 'border-sand-200 text-charcoal-700 hover:border-charcoal-300 hover:text-charcoal'
      }`}
    >
      {children}
    </button>
  );
}

function ViewToggle({
  mode,
  onChange,
  className = '',
  compact = false,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
  className?: string;
  compact?: boolean;
}) {
  const { t } = useLocale();
  const options: { id: ViewMode; label: string }[] = [
    { id: 'map', label: t.viewMap },
    { id: 'split', label: t.viewSplit },
  ];
  return (
    <div
      role="radiogroup"
      aria-label={t.viewMode}
      className={`flex shrink-0 rounded-pill border border-sand-200 p-0.5 ${className}`}
    >
      {options.map(({ id, label }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={`rounded-pill py-1 text-sm transition ${compact ? 'px-3' : 'px-4'} ${
              active ? 'bg-charcoal text-cream' : 'text-charcoal-500 hover:text-charcoal'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
