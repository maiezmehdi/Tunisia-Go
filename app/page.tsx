'use client';

import { motion } from 'framer-motion';
import { Columns2, Map as MapIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';

import ActionDrawer from '@/components/ActionDrawer';
import EditorialFeed from '@/components/EditorialFeed';
import ItinerarySelector from '@/components/ItinerarySelector';
import { CATEGORIES, ITINERARIES, PLACES, PLACE_BY_ID } from '@/data/tunisiaData';
import type { CategoryId, Place } from '@/data/types';

// Leaflet touches `window`, so the map only renders in the browser.
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-sand">
      <p className="animate-pulse font-serif text-lg text-charcoal-500">Unfolding the map…</p>
    </div>
  ),
});

type ViewMode = 'map' | 'split';

const ALL_CATEGORIES = new Set<CategoryId>(CATEGORIES.map((c) => c.id));

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [activeCategories, setActiveCategories] = useState<Set<CategoryId>>(ALL_CATEGORIES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [itineraryId, setItineraryId] = useState<string | null>(null);

  const itinerary = ITINERARIES.find((i) => i.id === itineraryId) ?? null;
  const selectedPlace = selectedId ? PLACE_BY_ID[selectedId] ?? null : null;

  const feedPlaces = useMemo(() => {
    if (itinerary) return itinerary.stops.map((id) => PLACE_BY_ID[id]).filter((p): p is Place => !!p);
    return PLACES.filter((p) => activeCategories.has(p.category));
  }, [activeCategories, itinerary]);

  const counts = useMemo(() => {
    const c = {} as Record<CategoryId, number>;
    for (const p of PLACES) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, []);

  const toggleCategory = (id: CategoryId) =>
    setActiveCategories((prev) => {
      const allOn = prev.size === ALL_CATEGORIES.size;
      // First click while everything is on isolates that category, like a map legend.
      if (allOn) return new Set([id]);
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next.size === 0 ? new Set(ALL_CATEGORIES) : next;
    });

  const allOn = activeCategories.size === ALL_CATEGORIES.size;

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const handleClose = useCallback(() => setSelectedId(null), []);

  const handleItinerary = (id: string | null) => {
    setItineraryId(id);
    setSelectedId(null);
  };

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-cream">
      {/* Top bar */}
      <header className="z-[1200] flex flex-col gap-3 border-b border-sand-200 bg-cream/95 px-4 py-3 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-terracotta font-serif text-xl text-cream shadow-soft">
              ☀
            </span>
            <span className="leading-none">
              <span className="block font-serif text-2xl text-charcoal">Tunisia Go</span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-charcoal-500">
                Explorer engine
              </span>
            </span>
          </a>
          <ViewToggle mode={viewMode} onChange={setViewMode} className="lg:hidden" />
        </div>

        <nav aria-label="Map layers" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-1 lg:px-0">
          <FilterPill active={allOn} onClick={() => setActiveCategories(new Set(ALL_CATEGORIES))}>
            All <span className="text-charcoal-300">{PLACES.length}</span>
          </FilterPill>
          {CATEGORIES.map((c) => (
            <FilterPill
              key={c.id}
              active={!allOn && activeCategories.has(c.id)}
              color={c.color}
              onClick={() => toggleCategory(c.id)}
            >
              <span aria-hidden>{c.emoji}</span> {c.label}{' '}
              <span className="opacity-60">{counts[c.id]}</span>
            </FilterPill>
          ))}
        </nav>

        <ViewToggle mode={viewMode} onChange={setViewMode} className="hidden lg:flex" />
      </header>

      {/* Body */}
      <div className="relative flex min-h-0 flex-1 flex-col-reverse md:flex-row">
        {viewMode === 'split' && (
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-[45%] shrink-0 border-t border-sand-200 bg-cream md:h-auto md:w-[420px] md:border-r md:border-t-0"
          >
            <EditorialFeed places={feedPlaces} selectedId={selectedId} onSelect={handleSelect} />
          </motion.aside>
        )}

        <section className="relative min-h-0 flex-1">
          <InteractiveMap
            places={PLACES}
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
            />
          </div>
        </section>

        <ActionDrawer place={selectedPlace} itinerary={itinerary} onClose={handleClose} onNavigate={handleSelect} />
      </div>
    </main>
  );
}

function FilterPill({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-transparent text-cream shadow-soft'
          : 'border-sand-200 bg-cream-50 text-charcoal hover:border-sand-300 hover:bg-sand'
      }`}
      style={active ? { background: color ?? '#1A1A1A' } : undefined}
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
  const options: { id: ViewMode; label: string; icon: typeof MapIcon }[] = [
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'split', label: 'Split', icon: Columns2 },
  ];
  return (
    <div role="radiogroup" aria-label="View mode" className={`flex shrink-0 rounded-pill bg-sand p-1 ${className}`}>
      {options.map(({ id, label, icon: Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={`relative flex items-center gap-1.5 rounded-pill px-4 py-1.5 text-sm font-medium transition ${
              active ? 'text-cream' : 'text-charcoal-500 hover:text-charcoal'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`view-toggle-${className}`}
                className="absolute inset-0 rounded-pill bg-charcoal"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="relative h-4 w-4" />
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
