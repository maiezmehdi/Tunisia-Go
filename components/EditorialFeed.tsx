'use client';

import { motion } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';

import { CATEGORY_BY_ID } from '@/data/tunisiaData';
import type { Place } from '@/data/types';

export interface EditorialFeedProps {
  places: Place[];
  selectedId: string | null;
  onSelect: (placeId: string) => void;
}

/** Magazine-style list shown next to the map in split mode. */
export default function EditorialFeed({ places, selectedId, onSelect }: EditorialFeedProps) {
  return (
    <div className="no-scrollbar h-full overflow-y-auto px-5 pb-10 pt-4 sm:px-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">The Tunisia Go journal</p>
        <h2 className="mt-1 font-serif text-3xl leading-tight text-charcoal">
          {places.length} places worth the drive
        </h2>
      </div>

      {places.length === 0 && (
        <p className="rounded-3xl bg-sand p-6 text-sm text-charcoal-500">
          No places match these filters. Turn a category back on to see more.
        </p>
      )}

      <ul className="space-y-4">
        {places.map((place, i) => {
          const category = CATEGORY_BY_ID[place.category];
          const selected = place.id === selectedId;
          const cover = place.images[0];
          return (
            <motion.li
              key={place.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <button
                type="button"
                onClick={() => onSelect(place.id)}
                className={`group flex w-full gap-4 rounded-3xl p-3 text-left transition ${
                  selected ? 'bg-sand ring-2 ring-terracotta' : 'bg-cream-50 hover:bg-sand'
                }`}
              >
                <span
                  className="relative grid h-28 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl text-4xl"
                  style={{ background: `linear-gradient(135deg, ${cover.palette[0]}, ${cover.palette[1]})` }}
                  aria-hidden
                >
                  <span className="transition group-hover:scale-110">{category.emoji}</span>
                </span>
                <span className="min-w-0 flex-1 py-1">
                  <span className="flex items-center gap-2">
                    <span
                      className="rounded-pill px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ background: category.tint, color: category.color }}
                    >
                      {category.label}
                    </span>
                    <span className="truncate text-xs text-charcoal-500">{place.region}</span>
                  </span>
                  <span className="mt-1.5 block font-serif text-xl leading-tight text-charcoal">{place.name}</span>
                  <span className="mt-1 line-clamp-2 block text-sm text-charcoal-500">{place.tagline}</span>
                  <span className="mt-2 flex items-center gap-3 text-xs text-charcoal-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {place.visitDuration}
                    </span>
                    <span className="inline-flex items-center gap-1 text-terracotta-700">
                      <Sparkles className="h-3 w-3" /> Story inside
                    </span>
                  </span>
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
