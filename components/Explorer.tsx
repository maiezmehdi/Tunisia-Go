'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';

import ActionDrawer from '@/components/ActionDrawer';
import EditorialFeed from '@/components/EditorialFeed';
import ItinerarySelector from '@/components/ItinerarySelector';
import OfflineBadge from '@/components/OfflineBadge';
import { MONTHS, seasonFor } from '@/data/seasons';
import { CATEGORIES, ITINERARIES, PLACES, PLACE_BY_ID } from '@/data/tunisiaData';
import type { CategoryId, Photo, Place } from '@/data/types';

// Leaflet touches `window`, so the map only renders in the browser.
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-sand-50">
      <p className="font-serif text-lg italic text-charcoal-300">Loading the map…</p>
    </div>
  ),
});

type ViewMode = 'map' | 'split';

const ALL_CATEGORIES = new Set<CategoryId>(CATEGORIES.map((c) => c.id));

export interface ExplorerProps {
  /** Photos per place id, loaded on the server */
  photos: Record<string, Photo[]>;
}

export default function Explorer({ photos }: ExplorerProps) {
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
  const selectedPlace = selectedId ? PLACE_BY_ID[selectedId] ?? null : null;

  const feedPlaces = useMemo(() => {
    if (itinerary) return itinerary.stops.map((id) => PLACE_BY_ID[id]).filter((p): p is Place => !!p);
    const inCategory = PLACES.filter((p) => activeCategories.has(p.category));
    if (month === null) return inCategory;
    // Hide places to avoid that month and put the best ones first.
    const rank = { best: 0, fine: 1, avoid: 2 } as const;
    return inCategory
      .filter((p) => seasonFor(p.id, month) !== 'avoid')
      .sort((a, b) => rank[seasonFor(a.id, month)] - rank[seasonFor(b.id, month)]);
  }, [activeCategories, itinerary, month]);

  const mapPlaces = useMemo(() => {
    if (month === null) return PLACES;
    const stops = new Set(itinerary?.stops ?? []);
    return PLACES.filter((p) => stops.has(p.id) || seasonFor(p.id, month) !== 'avoid');
  }, [month, itinerary]);

  const counts = useMemo(() => {
    const c = {} as Record<CategoryId, number>;
    for (const p of PLACES) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, []);

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

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const handleClose = useCallback(() => setSelectedId(null), []);
  const handleItinerary = (id: string | null) => {
    setItineraryId(id);
    setSelectedId(null);
  };

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-cream">
      {/* Top bar */}
      <header className="z-[1200] flex flex-col gap-3 border-b border-sand-200 bg-cream px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex items-center justify-between gap-4">
          <a href="/" className="leading-none">
            <span className="block font-serif text-2xl tracking-tight text-charcoal">Tunisia Go</span>
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.24em] text-charcoal-300">
              Explorer
            </span>
          </a>
          <div className="flex items-center gap-4 lg:hidden">
            <HeaderLinks />
            <ViewToggle mode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        <nav aria-label="Map layers" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-1 lg:px-0">
          <FilterPill active={allOn} onClick={() => setActiveCategories(new Set(ALL_CATEGORIES))}>
            All <Count>{PLACES.length}</Count>
          </FilterPill>
          {CATEGORIES.map((c) => (
            <FilterPill key={c.id} active={!allOn && activeCategories.has(c.id)} onClick={() => toggleCategory(c.id)}>
              {c.label} <Count>{counts[c.id]}</Count>
            </FilterPill>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <MonthSelect value={month} onChange={setMonth} />
          <OfflineBadge />
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <HeaderLinks />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </header>

      {/* Body */}
      <div className="relative flex min-h-0 flex-1 flex-col-reverse md:flex-row">
        {viewMode === 'split' && (
          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[45%] shrink-0 border-t border-sand-200 bg-cream md:h-auto md:w-[420px] md:border-r md:border-t-0"
          >
            <EditorialFeed
              places={feedPlaces}
              photos={photos}
              selectedId={selectedId}
              onSelect={handleSelect}
              month={itinerary ? null : month}
            />
          </motion.aside>
        )}

        <section className="relative min-h-0 flex-1">
          <InteractiveMap
            places={mapPlaces}
            activeCategories={activeCategories}
            selectedId={selectedId}
            itinerary={itinerary}
            onSelect={handleSelect}
            layoutKey={viewMode}
          />

          <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[1000] flex sm:right-auto">
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
          photos={selectedPlace ? photos[selectedPlace.id] ?? [] : []}
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
  const link = 'whitespace-nowrap text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline';
  return (
    <nav aria-label="Travel tools" className="flex items-center gap-4">
      <a href="/pratique" className={link}>
        Practical
      </a>
    </nav>
  );
}

function MonthSelect({ value, onChange }: { value: number | null; onChange: (m: number | null) => void }) {
  return (
    <label className="relative inline-flex shrink-0 items-center">
      <span className="sr-only">Travel month</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className={`appearance-none rounded-pill border py-1.5 pl-4 pr-9 text-sm transition focus:outline-none focus-visible:ring-1 focus-visible:ring-charcoal ${
          value === null
            ? 'border-sand-200 bg-transparent text-charcoal-700 hover:border-charcoal-300'
            : 'border-charcoal bg-charcoal text-cream'
        }`}
      >
        <option value="">Any month</option>
        {MONTHS.map((m, i) => (
          <option key={m} value={i}>
            In {m}
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
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
  className?: string;
}) {
  const options: { id: ViewMode; label: string }[] = [
    { id: 'map', label: 'Map' },
    { id: 'split', label: 'Split' },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="View mode"
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
            className={`rounded-pill px-4 py-1 text-sm transition ${
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
