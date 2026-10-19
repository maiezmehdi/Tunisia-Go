'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
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
    <div className="pointer-events-auto w-full max-w-[400px] overflow-hidden rounded-3xl border border-sand-200 bg-cream/95 shadow-soft backdrop-blur-md">
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">Road trips</p>
        {active && (
          <div className="-mr-2 flex">
            <IconButton
              label={collapsed ? 'Expand itinerary' : 'Collapse itinerary'}
              onClick={() => setCollapsed((c) => !c)}
              expanded={!collapsed}
            >
              <ChevronDown className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} strokeWidth={1.5} />
            </IconButton>
            <IconButton label="Clear itinerary" onClick={() => onChange(null)}>
              <X className="h-4 w-4" strokeWidth={1.5} />
            </IconButton>
          </div>
        )}
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-5 pb-4 pt-3">
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

              <dl className="mt-4 grid grid-cols-3 divide-x divide-sand-200 border-y border-sand-200 py-3 text-center">
                <Stat label="Distance" value={`~${formatKm(route.totalKm)}`} />
                <Stat label="Driving" value={`~${formatDuration(route.totalMinutes)}`} />
                <Stat label="Suggested" value={`${active.days} days`} />
              </dl>

              <ol className="no-scrollbar mt-3 max-h-[30vh] overflow-y-auto">
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

              <p className="mt-2 text-[11px] text-charcoal-300">
                Estimates use straight-line distance with a road factor.
              </p>

              <a
                href={googleMapsRouteUrl(stops)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center rounded-pill bg-charcoal px-4 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
              >
                Open the route in Google Maps
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
