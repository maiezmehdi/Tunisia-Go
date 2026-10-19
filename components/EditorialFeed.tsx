'use client';

import { motion } from 'framer-motion';

import { MONTHS, bestMonthsLabel, seasonFor } from '@/data/seasons';
import { CATEGORY_BY_ID } from '@/data/tunisiaData';
import type { Photo, Place } from '@/data/types';

export interface EditorialFeedProps {
  places: Place[];
  photos: Record<string, Photo[]>;
  selectedId: string | null;
  onSelect: (placeId: string) => void;
  /** Travel month picked in the header (0 = January), if any. */
  month?: number | null;
}

/** Magazine-style list shown next to the map in split mode. */
export default function EditorialFeed({ places, photos, selectedId, onSelect, month = null }: EditorialFeedProps) {
  return (
    <div className="no-scrollbar h-full overflow-y-auto px-5 pb-10 pt-5 sm:px-6">
      <div className="mb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">The journal</p>
        <h2 className="mt-1.5 font-serif text-3xl leading-tight text-charcoal">
          {month === null
            ? `${places.length} places worth the drive`
            : `${places.length} places to visit in ${MONTHS[month]}`}
        </h2>
        {month !== null && (
          <p className="mt-2 text-sm text-charcoal-500">
            Places that are too hot, too cold or closed that month are hidden.
          </p>
        )}
      </div>

      {places.length === 0 && (
        <p className="border-t border-sand-200 pt-6 text-sm text-charcoal-500">
          No places match these filters. Turn a category back on or pick another month.
        </p>
      )}

      <ul className="divide-y divide-sand-200 border-t border-sand-200">
        {places.map((place, i) => {
          const category = CATEGORY_BY_ID[place.category];
          const selected = place.id === selectedId;
          const cover = photos[place.id]?.[0];
          return (
            <motion.li
              key={place.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.2) }}
            >
              <button
                type="button"
                onClick={() => onSelect(place.id)}
                aria-current={selected || undefined}
                className="group flex w-full gap-4 py-4 text-left"
              >
                <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-sand">
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.src}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover grayscale-[15%] transition duration-500 group-hover:scale-105"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1 py-0.5">
                  <span className="block text-[11px] uppercase tracking-[0.16em] text-charcoal-300">
                    {category.label} · {place.region}
                  </span>
                  <span
                    className={`mt-1 block font-serif text-xl leading-tight transition ${
                      selected ? 'text-terracotta-700' : 'text-charcoal group-hover:text-terracotta-700'
                    }`}
                  >
                    {place.name}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm text-charcoal-500">{place.tagline}</span>
                  <span className="mt-1.5 block text-xs text-charcoal-300">
                    {place.visitDuration} ·{' '}
                    {month !== null && seasonFor(place.id, month) === 'best' ? (
                      <span className="text-charcoal-700">Best in {MONTHS[month]}</span>
                    ) : (
                      <>Best {bestMonthsLabel(place.id).replace(/^All year$/, 'all year')}</>
                    )}
                  </span>
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>

      <div className="mt-8 border-t border-sand-200 pt-6">
        <p className="font-serif text-xl leading-snug text-charcoal">Know a place that is not on the map?</p>
        <p className="mt-1 text-sm text-charcoal-500">A café, a hidden cove, a viewpoint only locals know.</p>
        <a
          href="/spot-secret"
          className="mt-3 inline-block text-sm text-charcoal underline decoration-sand-300 underline-offset-4 transition hover:decoration-charcoal"
        >
          Share a secret spot
        </a>
      </div>
    </div>
  );
}
