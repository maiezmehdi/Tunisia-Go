'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BedDouble,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  X,
} from 'lucide-react';
import { useEffect, useState, type ComponentType, type ReactNode } from 'react';

import CultureCard from '@/components/CultureCard';
import { CATEGORY_BY_ID, PLACE_BY_ID } from '@/data/tunisiaData';
import type { Itinerary, Place, PlaceImage } from '@/data/types';
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
  /** When the place is a stop of the active itinerary, enables previous/next navigation. */
  itinerary: Itinerary | null;
  onClose: () => void;
  onNavigate: (placeId: string) => void;
}

export default function ActionDrawer({ place, itinerary, onClose, onNavigate }: ActionDrawerProps) {
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
          className="absolute inset-y-0 right-0 z-[1100] flex w-full flex-col overflow-hidden bg-cream shadow-lift sm:inset-y-3 sm:right-3 sm:w-[440px] sm:rounded-4xl"
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
              <DrawerContent place={place} itinerary={itinerary} onClose={onClose} onNavigate={onNavigate} />
            </motion.div>
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function DrawerContent({
  place,
  itinerary,
  onClose,
  onNavigate,
}: {
  place: Place;
  itinerary: Itinerary | null;
  onClose: () => void;
  onNavigate: (placeId: string) => void;
}) {
  const category = CATEGORY_BY_ID[place.category];
  const stopIndex = itinerary ? itinerary.stops.indexOf(place.id) : -1;
  const prevId = stopIndex > 0 ? itinerary!.stops[stopIndex - 1] : null;
  const nextId = itinerary && stopIndex >= 0 && stopIndex < itinerary.stops.length - 1 ? itinerary.stops[stopIndex + 1] : null;
  const phone = phoneUrl(place);

  return (
    <>
      <div className="relative">
        <PhotoCarousel images={place.images} emoji={category.emoji} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-charcoal shadow-soft backdrop-blur transition hover:bg-cream"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 px-6 pb-8 pt-5">
        {/* Header */}
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold"
              style={{ background: category.tint, color: category.color }}
            >
              {category.emoji} {category.label}
            </span>
            {place.unesco && (
              <span className="rounded-pill bg-sage px-3 py-1 text-xs font-semibold text-sage-500">UNESCO</span>
            )}
            <span className="inline-flex items-center gap-1 rounded-pill bg-sand px-3 py-1 text-xs font-medium text-charcoal-500">
              <Clock className="h-3 w-3" /> {place.visitDuration}
            </span>
          </div>
          <h2 className="mt-3 font-serif text-[32px] leading-[1.05] text-charcoal">{place.name}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal-500">
            <MapPin className="h-3.5 w-3.5" /> {place.region}
            {place.nameAr && (
              <span lang="ar" dir="rtl" className="ml-auto font-serif text-base text-charcoal-300">
                {place.nameAr}
              </span>
            )}
          </p>
          <p className="mt-3 font-serif text-lg italic text-terracotta-700">{place.tagline}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-charcoal-700">{place.description}</p>
        </header>

        {/* Action hub */}
        <section aria-label="Plan your visit" className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-500">Plan your visit</h3>

          <div className="rounded-3xl bg-sand p-3">
            <div className="flex items-center gap-2 px-1 pb-2.5 text-sm font-semibold text-charcoal">
              <BedDouble className="h-4 w-4 text-terracotta" /> Trouver un logement
              <span className="font-normal text-charcoal-500">· Find a stay</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ExternalPill href={bookingUrl(place)} className="bg-[#003580] text-white hover:bg-[#00224f]">
                Booking.com
              </ExternalPill>
              <ExternalPill href={airbnbUrl(place)} className="bg-[#FF385C] text-white hover:bg-[#e0314f]">
                Airbnb
              </ExternalPill>
            </div>
          </div>

          <ActionRow
            href={transferWhatsAppUrl(place)}
            icon={Car}
            title="Réserver un transfert / transport"
            subtitle="Airport pickup, private driver or 4x4"
          />
          <ActionRow
            href={guideWhatsAppUrl(place)}
            icon={MessageCircle}
            title="Contacter le guide local sur WhatsApp"
            subtitle={place.contact.guideName ? `${place.contact.guideName}, local guide in ${place.region}` : 'Local guide'}
            accent
          />
          {phone && (
            <ActionRow href={phone} icon={Phone} title="Appeler le lieu / prestataire" subtitle={place.contact.phone} external={false} />
          )}
          <div className="grid grid-cols-2 gap-2">
            <ExternalPill href={googleMapsUrl(place)} className="bg-charcoal text-cream hover:bg-charcoal-700">
              <Navigation className="h-4 w-4" /> Google Maps
            </ExternalPill>
            <ExternalPill href={wazeUrl(place)} className="bg-[#33CCFF] text-charcoal hover:bg-[#1fb8eb]">
              <Navigation className="h-4 w-4" /> Waze
            </ExternalPill>
          </div>
        </section>

        <CultureCard place={place} />

        {/* Itinerary navigation */}
        {itinerary && stopIndex >= 0 && (
          <nav
            aria-label="Itinerary stops"
            className="flex items-center justify-between gap-2 rounded-3xl border border-sand-200 p-2"
          >
            <StopButton id={prevId} dir="prev" onNavigate={onNavigate} />
            <span className="text-center text-xs text-charcoal-500">
              {itinerary.emoji} Stop {stopIndex + 1} of {itinerary.stops.length}
            </span>
            <StopButton id={nextId} dir="next" onNavigate={onNavigate} />
          </nav>
        )}
      </div>
    </>
  );
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
  if (!target) return <span className="w-28" />;
  return (
    <button
      type="button"
      onClick={() => onNavigate(target.id)}
      className={`flex w-28 items-center gap-1 rounded-pill px-3 py-2 text-sm font-medium text-charcoal transition hover:bg-sand ${
        dir === 'next' ? 'justify-end text-right' : ''
      }`}
    >
      {dir === 'prev' && <ChevronLeft className="h-4 w-4 shrink-0" />}
      <span className="truncate">{target.name}</span>
      {dir === 'next' && <ChevronRight className="h-4 w-4 shrink-0" />}
    </button>
  );
}

function ExternalPill({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`inline-flex items-center justify-center gap-2 rounded-pill px-4 py-3 text-sm font-semibold transition ${className}`}
    >
      {children}
    </a>
  );
}

function ActionRow({
  href,
  icon: Icon,
  title,
  subtitle,
  accent,
  external = true,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  accent?: boolean;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`group flex items-center gap-3 rounded-3xl p-3 pr-4 transition ${
        accent ? 'bg-[#25D366]/15 hover:bg-[#25D366]/25' : 'bg-sand hover:bg-sand-200'
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
          accent ? 'bg-[#25D366] text-white' : 'bg-cream text-terracotta'
        }`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-charcoal">{title}</span>
        {subtitle && <span className="block truncate text-xs text-charcoal-500">{subtitle}</span>}
      </span>
      {external && <ExternalLink className="h-4 w-4 text-charcoal-300 transition group-hover:text-charcoal" />}
    </a>
  );
}

/** Swipeable photo carousel. Falls back to an illustrated postcard when no photo is available. */
function PhotoCarousel({ images, emoji }: { images: PlaceImage[]; emoji: string }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const count = images.length;
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);
  const image = images[index];
  const showPhoto = image.src && !failed[index];

  return (
    <div className="relative h-64 overflow-hidden sm:h-72">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) go(1);
            else if (info.offset.x > 50) go(-1);
          }}
        >
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.src}
              alt={image.caption}
              className="h-full w-full object-cover"
              draggable={false}
              onError={() => setFailed((f) => ({ ...f, [index]: true }))}
            />
          ) : (
            <div
              className="relative h-full w-full"
              style={{ background: `linear-gradient(135deg, ${image.palette[0]}, ${image.palette[1]})` }}
              role="img"
              aria-label={image.caption}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-25 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 30%, white 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, white 0 1.5px, transparent 2.5px)',
                  backgroundSize: '38px 38px, 54px 54px',
                }}
              />
              <span aria-hidden className="absolute -bottom-6 right-4 select-none text-[150px] leading-none opacity-30">
                {emoji}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-charcoal/60 to-transparent" />
          <p className="absolute bottom-4 left-6 right-24 font-serif text-lg text-cream drop-shadow">{image.caption}</p>
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <div className="absolute bottom-5 right-6 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Photo ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-cream' : 'w-1.5 bg-cream/50'}`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-cream/70 text-charcoal backdrop-blur transition hover:bg-cream"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-cream/70 text-charcoal backdrop-blur transition hover:bg-cream"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
