'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

import type { Photo } from '@/data/types';
import { useLocale } from '@/lib/i18n/LocaleProvider';

/**
 * Photo slider of a place page. A native scroll-snap track (swipe on touch screens, trackpad on desktop)
 * with arrows and dots when there is more than one photo, and the credit of the photo on screen below.
 * The first photo is a plain eager <img>, so the page reads the same without JavaScript.
 */
export default function PlaceGallery({ photos, alt }: { photos: Photo[]; alt: string }) {
  const { t } = useLocale();
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const photo = photos[index] ?? photos[0];

  const show = (i: number) => {
    const el = track.current;
    if (!el) return;
    const next = (i + count) % count;
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    setIndex(next);
  };

  const onScroll = () => {
    const el = track.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index && i >= 0 && i < count) setIndex(i);
  };

  return (
    <figure className="mt-8">
      <div className="relative overflow-hidden rounded-3xl bg-sand">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.src}
              src={p.src}
              alt={count > 1 ? `${alt} (${i + 1}/${count})` : alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : undefined}
              decoding="async"
              width={p.width}
              height={p.height}
              draggable={false}
              className="aspect-[4/3] w-full shrink-0 snap-center object-cover sm:aspect-[2/1] lg:aspect-auto lg:h-[480px]"
            />
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label={t.previousPhoto}
              onClick={() => show(index - 1)}
              className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cream/85 text-charcoal backdrop-blur transition hover:bg-cream"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label={t.nextPhoto}
              onClick={() => show(index + 1)}
              className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cream/85 text-charcoal backdrop-blur transition hover:bg-cream"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-charcoal/30 px-2.5 py-1.5 backdrop-blur">
              {photos.map((p, i) => (
                <button
                  key={p.src}
                  type="button"
                  aria-label={t.photoN(i + 1)}
                  aria-current={i === index}
                  onClick={() => show(i)}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-cream' : 'w-1.5 bg-cream/60'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <figcaption className="mt-2 text-xs text-charcoal-300">
        {photo.sourceUrl ? (
          <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-charcoal">
            {photo.title} · {photo.author} · {photo.license}
          </a>
        ) : (
          photo.author
        )}
      </figcaption>
    </figure>
  );
}
