'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Car, ChevronDown, Clock, Navigation, Route, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { PLACE_BY_ID } from '@/data/tunisiaData';
import type { Itinerary, Place } from '@/data/types';
import { formatDuration, formatKm, summarizeRoute } from '@/lib/geo';
import { googleMapsRouteUrl } from '@/lib/links';

export interface ItinerarySelectorProps {
  itineraries: Itinerary[];
  activeId: string | null;
  selectedPlaceId: string | null;
  onChange: (itineraryId: string | null) => void;
  onSelectStop: (placeId: string) => void;
}

export default function ItinerarySelector({
  itineraries,
  activeId,
  selectedPlaceId,
  onChange,
  onSelectStop,
}: ItinerarySelectorProps) {
  const [collapsed, setCollapsed] = useState(false);
  const active = itineraries.find((i) => i.id === activeId) ?? null;

  // Fold the stop list away while a place is open, so it does not hide the map.
  useEffect(() => {
    if (selectedPlaceId) setCollapsed(true);
  }, [selectedPlaceId]);

  const stops = useMemo<Place[]>(
    () => (active ? active.stops.map((id) => PLACE_BY_ID[id]).filter((p): p is Place => !!p) : []),
    [active],
  );
  const route = useMemo(() => summarizeRoute(stops), [stops]);

  return (
    <div className="pointer-events-auto w-full max-w-[400px] overflow-hidden rounded-4xl bg-cream/95 shadow-lift ring-1 ring-sand-200 backdrop-blur-md">
      {/* Chooser */}
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-500">
          <Route className="h-3.5 w-3.5 text-terracotta" /> Circuits
        </p>
        {active && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="grid h-8 w-8 place-items-center rounded-full text-charcoal-500 transition hover:bg-sand"
              aria-label={collapsed ? 'Expand itinerary' : 'Collapse itinerary'}
              aria-expanded={!collapsed}
            >
              <ChevronDown className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Clear itinerary"
              className="grid h-8 w-8 place-items-center rounded-full text-charcoal-500 transition hover:bg-sand hover:text-charcoal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-4 pt-3">
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
              className={`shrink-0 rounded-pill px-4 py-2 text-sm font-medium transition ${
                isActive ? 'text-cream shadow-soft' : 'bg-sand text-charcoal hover:bg-sand-200'
              }`}
              style={isActive ? { background: it.color } : undefined}
            >
              {it.emoji} {it.name}
            </button>
          );
        })}
      </div>

      {/* Active circuit */}
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
              <p className="mt-0.5 text-sm italic text-terracotta-700">{active.tagline}</p>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-charcoal-500">{active.description}</p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <Stat icon={Car} label="Distance" value={`~${formatKm(route.totalKm)}`} />
                <Stat icon={Clock} label="Driving" value={`~${formatDuration(route.totalMinutes)}`} />
                <Stat icon={CalendarDays} label="Suggested" value={`${active.days} days`} />
              </div>

              <ol className="no-scrollbar mt-4 max-h-[32vh] overflow-y-auto">
                {stops.map((stop, i) => {
                  const leg = route.legs[i];
                  const selected = stop.id === selectedPlaceId;
                  return (
                    <li key={stop.id}>
                      <button
                        type="button"
                        onClick={() => onSelectStop(stop.id)}
                        className={`flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition ${
                          selected ? 'bg-sand' : 'hover:bg-sand/60'
                        }`}
                      >
                        <span
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold text-cream"
                          style={{ background: active.color }}
                        >
                          {i + 1}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-charcoal">{stop.name}</span>
                          <span className="block truncate text-xs text-charcoal-500">{stop.tagline}</span>
                        </span>
                      </button>
                      {leg && (
                        <div className="ml-[22px] flex items-center gap-2 border-l-2 border-dashed border-sand-300 py-1.5 pl-5 text-[11px] font-medium text-charcoal-500">
                          <Car className="h-3 w-3" /> {formatKm(leg.km)} · {formatDuration(leg.minutes)}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>

              <p className="mt-2 text-[11px] text-charcoal-300">
                Estimates use straight-line distance with a road factor. Check live traffic before you go.
              </p>

              <a
                href={googleMapsRouteUrl(stops)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-pill bg-charcoal px-4 py-3 text-sm font-semibold text-cream transition hover:bg-charcoal-700"
              >
                <Navigation className="h-4 w-4" /> Open full route in Google Maps
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-sand px-3 py-2.5">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-charcoal">{value}</p>
    </div>
  );
}
