'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Phone, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import BrandIcon, { type Brand } from '@/components/BrandIcon';
import CultureCard from '@/components/CultureCard';
import { CATEGORY_BY_ID, PLACE_BY_ID } from '@/data/tunisiaData';
import type { Itinerary, Photo, Place } from '@/data/types';
import {
  airbnbUrl,
  bookingUrl,
  googleMapsUrl,
  guideWhatsAppUrl,
  phoneUrl,
  transferWhatsAppUrl,
  wazeUrl,
} from '@/lib/links';

export interface ActionDrawerProps {
  place: Place | null;
  photos: Photo[];
  /** When the place is a stop of the active itinerary, enables previous/next navigation. */
  itinerary: Itinerary | null;
  onClose: () => void;
  onNavigate: (placeId: string) => void;
}

export default function ActionDrawer({ place, photos, itinerary, onClose, onNavigate }: ActionDrawerProps) {
  useEffect(() => {
    if (!place) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [place, onClose]);

  return (
    <AnimatePresence>
      {place && (
        <motion.aside
          key="drawer"
          role="dialog"
          aria-modal="false"
          aria-label={place.name}
          initial={{ x: '105%' }}
          animate={{ x: 0 }}
          exit={{ x: '105%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          className="absolute inset-y-0 right-0 z-[1100] flex w-full flex-col overflow-hidden border-sand-200 bg-cream shadow-lift sm:inset-y-3 sm:right-3 sm:w-[440px] sm:rounded-4xl sm:border"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={place.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="no-scrollbar flex-1 overflow-y-auto"
            >
              <DrawerContent
                place={place}
                photos={photos}
                itinerary={itinerary}
                onClose={onClose}
                onNavigate={onNavigate}
              />
            </motion.div>
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function DrawerContent({
  place,
  photos,
  itinerary,
  onClose,
  onNavigate,
}: {
  place: Place;
  photos: Photo[];
  itinerary: Itinerary | null;
  onClose: () => void;
  onNavigate: (placeId: string) => void;
}) {
  const category = CATEGORY_BY_ID[place.category];
  const stopIndex = itinerary ? itinerary.stops.indexOf(place.id) : -1;
  const prevId = itinerary && stopIndex > 0 ? itinerary.stops[stopIndex - 1] : null;
  const nextId =
    itinerary && stopIndex >= 0 && stopIndex < itinerary.stops.length - 1 ? itinerary.stops[stopIndex + 1] : null;
  const phone = phoneUrl(place);

  return (
    <>
      <div className="relative">
        <PhotoCarousel photos={photos} fallbackCaptions={place.images.map((i) => i.caption)} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-cream/90 text-charcoal backdrop-blur transition hover:bg-cream"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="space-y-8 px-6 pb-10 pt-6">
        {/* Header */}
        <header>
          <p className="text-[11px] uppercase tracking-[0.18em] text-charcoal-300">
            {category.label}
            {place.unesco && ' · UNESCO'} · {place.visitDuration}
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-[32px] leading-[1.05] tracking-tight text-charcoal">{place.name}</h2>
            {place.nameAr && (
              <span lang="ar" dir="rtl" className="shrink-0 font-serif text-lg text-charcoal-300">
                {place.nameAr}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-charcoal-500">{place.region}</p>
          <p className="mt-4 font-serif text-lg italic text-charcoal-700">{place.tagline}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-charcoal-700">{place.description}</p>
        </header>

        {/* Action hub */}
        <section aria-label="Plan your visit">
          <SectionTitle>Plan your visit</SectionTitle>

          <div className="mt-3">
            <p className="text-sm font-medium text-charcoal">Trouver un logement</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Pill href={bookingUrl(place)} brand="booking">
                Booking.com
              </Pill>
              <Pill href={airbnbUrl(place)} brand="airbnb">
                Airbnb
              </Pill>
            </div>
          </div>

          <ul className="mt-5 divide-y divide-sand-200 border-y border-sand-200">
            <ActionRow
              href={guideWhatsAppUrl(place)}
              brand="whatsapp"
              title="Contacter le guide local sur WhatsApp"
              subtitle={place.contact.guideName ? `${place.contact.guideName}, guide à ${place.region}` : 'Guide local'}
            />
            <ActionRow
              href={transferWhatsAppUrl(place)}
              brand="whatsapp"
              title="Réserver un transfert / transport"
              subtitle="Aéroport, chauffeur privé ou 4x4"
            />
            {phone && (
              <ActionRow
                href={phone}
                leading={<Phone className="h-4 w-4 shrink-0 text-charcoal-500" strokeWidth={1.5} />}
                title="Appeler le lieu / prestataire"
                subtitle={place.contact.phone}
                external={false}
              />
            )}
          </ul>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Pill href={googleMapsUrl(place)} brand="googlemaps" primary>
              Google Maps
            </Pill>
            <Pill href={wazeUrl(place)} brand="waze">
              Waze
            </Pill>
          </div>
        </section>

        <CultureCard place={place} />

        {/* Itinerary navigation */}
        {itinerary && stopIndex >= 0 && (
          <nav aria-label="Itinerary stops" className="flex items-center justify-between gap-2 border-t border-sand-200 pt-4">
            <StopButton id={prevId} dir="prev" onNavigate={onNavigate} />
            <span className="text-center text-xs text-charcoal-300">
              Stop {stopIndex + 1} of {itinerary.stops.length}
            </span>
            <StopButton id={nextId} dir="next" onNavigate={onNavigate} />
          </nav>
        )}
      </div>
    </>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{children}</h3>;
}

function StopButton({
  id,
  dir,
  onNavigate,
}: {
  id: string | null;
  dir: 'prev' | 'next';
  onNavigate: (placeId: string) => void;
}) {
  const target = id ? PLACE_BY_ID[id] : null;
  if (!target) return <span className="w-32" />;
  return (
    <button
      type="button"
      onClick={() => onNavigate(target.id)}
      className={`flex w-32 items-center gap-1 text-sm text-charcoal-700 transition hover:text-charcoal ${
        dir === 'next' ? 'justify-end text-right' : ''
      }`}
    >
      {dir === 'prev' && <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={1.5} />}
      <span className="truncate">{target.name}</span>
      {dir === 'next' && <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={1.5} />}
    </button>
  );
}

function Pill({
  href,
  primary,
  brand,
  children,
}: {
  href: string;
  primary?: boolean;
  brand?: Brand;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`inline-flex items-center justify-center gap-2 rounded-pill px-4 py-2.5 text-sm transition ${
        primary
          ? 'bg-charcoal text-cream hover:bg-charcoal-700'
          : 'border border-sand-300 text-charcoal hover:border-charcoal'
      }`}
    >
      {brand && <BrandIcon brand={brand} className="h-3.5 w-3.5 shrink-0" />}
      {children}
    </a>
  );
}

function ActionRow({
  href,
  brand,
  leading,
  title,
  subtitle,
  external = true,
}: {
  href: string;
  brand?: Brand;
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  external?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group flex items-center justify-between gap-4 py-3.5"
      >
        <span className="flex min-w-0 items-center gap-3">
          {brand ? <BrandIcon brand={brand} className="h-4 w-4 shrink-0 text-charcoal-500" /> : leading}
          <span className="min-w-0">
            <span className="block text-sm font-medium text-charcoal group-hover:text-terracotta-700">{title}</span>
            {subtitle && <span className="block truncate text-xs text-charcoal-500">{subtitle}</span>}
          </span>
        </span>
        <span aria-hidden className="text-charcoal-300 transition group-hover:translate-x-0.5 group-hover:text-charcoal">
          →
        </span>
      </a>
    </li>
  );
}

/** Swipeable photo carousel with credits. Falls back to a plain panel when no photo is available. */
function PhotoCarousel({ photos, fallbackCaptions }: { photos: Photo[]; fallbackCaptions: string[] }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const usable = photos.filter((_, i) => !failed[i]);
  const hasPhotos = usable.length > 0;
  const count = hasPhotos ? photos.length : 1;
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);
  const photo = hasPhotos ? photos[index] : null;
  const showPhoto = photo && !failed[index];

  return (
    <div className="relative h-64 overflow-hidden bg-sand sm:h-72">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          drag={count > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) go(1);
            else if (info.offset.x > 50) go(-1);
          }}
        >
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.src}
              alt={photo.title}
              className="h-full w-full object-cover"
              draggable={false}
              onError={() => setFailed((f) => ({ ...f, [index]: true }))}
            />
          ) : (
            <div className="grid h-full w-full place-items-center px-10 text-center">
              <p className="font-serif text-lg italic text-charcoal-300">{fallbackCaptions[0]}</p>
            </div>
          )}
          {showPhoto && (
            <>
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-charcoal/55 to-transparent" />
              <a
                href={photo.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 left-5 right-20 truncate text-[10px] text-cream/80 hover:text-cream"
                title={`${photo.author} · ${photo.license}`}
              >
                {photo.author} · {photo.license} · Wikimedia Commons
              </a>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <div className="absolute bottom-4 right-5 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Photo ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1 rounded-full transition-all ${i === index ? 'w-4 bg-cream' : 'w-1 bg-cream/50'}`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-cream/80 text-charcoal backdrop-blur transition hover:bg-cream"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-cream/80 text-charcoal backdrop-blur transition hover:bg-cream"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </>
      )}
    </div>
  );
}
