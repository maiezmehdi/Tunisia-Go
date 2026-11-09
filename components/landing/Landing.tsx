'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import AddSpotLink from '@/components/AddSpotLink';
import BrandLogo from '@/components/BrandLogo';
import LanguageSwitch from '@/components/LanguageSwitch';
import MobileMenu from '@/components/MobileMenu';
import ProAuthButton from '@/components/ProAuthButton';
import SoundToggle from '@/components/SoundToggle';
import MadeBy from '@/components/MadeBy';
import ProAccountSection from '@/components/ProAccountSection';
import LineArtPortrait from '@/components/landing/LineArtPortrait';
import {
  ATLAS,
  HERO_CANDIDATES,
  HERO_EXTRA,
  HERO_MAX_SLIDES,
  LANDING_COPY,
  TRIP_STORIES,
  type TripStory,
} from '@/components/landing/content';
import type { Itinerary, Photo, Place } from '@/data/types';
import { formatKm, summarizeRoute } from '@/lib/geo';
import { useLocale, useLocalePath } from '@/lib/i18n/LocaleProvider';

/** Landing copy and catalog in the visitor's language. */
function useLanding() {
  const { locale, catalog } = useLocale();
  return { locale, catalog, copy: LANDING_COPY[locale] };
}

export interface LandingProps {
  /** Photos per place id, loaded on the server */
  photos: Record<string, Photo[]>;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Film grain, drawn once as an SVG noise texture. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Landing({ photos }: LandingProps) {
  const { locale, catalog } = useLanding();
  const firstPhoto = (id: string): Photo | undefined => photos[id]?.[0];
  const heroId = HERO_CANDIDATES.find((id) => firstPhoto(id));
  // The first hero photo, then Mos Espa, then another landscape; they fade into each other.
  const slideIds = [heroId, ...HERO_EXTRA, ...HERO_CANDIDATES]
    .filter((id, i, all): id is string => !!id && all.indexOf(id) === i && !!firstPhoto(id))
    .slice(0, HERO_MAX_SLIDES);
  const slides = slideIds.map((id) => ({
    photo: firstPhoto(id)!,
    placeName: catalog.placeById[id]?.name ?? '',
  }));

  const usedPhotos = new Map<string, Photo>();
  const use = (id: string) => {
    const p = firstPhoto(id);
    if (p) usedPhotos.set(p.src, p);
    return p;
  };
  for (const slide of slides) usedPhotos.set(slide.photo.src, slide.photo);

  const trips = TRIP_STORIES[locale]
    .map((story) => {
      const itinerary = catalog.itineraries.find((i) => i.id === story.id);
      return itinerary ? { story, itinerary, photo: use(story.cover) } : null;
    })
    .filter((t): t is NonNullable<typeof t> => !!t);

  const vignettes = ATLAS[locale]
    .map((v) => ({ ...v, place: catalog.placeById[v.id], photo: use(v.id) }))
    .filter((v): v is typeof v & { place: Place } => !!v.place);

  return (
    <div lang={locale} className="bg-cream text-charcoal">
      <Hero slides={slides} />
      <Manifesto />
      <Escapes trips={trips} />
      <Atlas vignettes={vignettes} />
      <ProSection />
      <Finale />
      <Footer photos={[...usedPhotos.values()]} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Hero                                                             */
/* ------------------------------------------------------------------ */

const SLIDE_MS = 6500;

function Hero({ slides }: { slides: { photo: Photo; placeName: string }[] }) {
  const lp = useLocalePath();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const { catalog, copy } = useLanding();
  const c = copy.hero;
  // Plain fade between photos, no buttons; still on the first photo for people who prefer less motion.
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const timer = window.setInterval(() => setSlide((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [reduce, slides.length]);

  return (
    <section ref={ref} className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-charcoal text-cream">
      <motion.div style={{ y }} className="absolute inset-0 -z-20">
        {slides.length ? (
          slides.map(({ photo, placeName }, i) => (
            <motion.img
              key={photo.src}
              src={photo.src}
              alt={i === slide ? placeName : ''}
              aria-hidden={i !== slide}
              initial={{ scale: reduce ? 1 : 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.4, ease: EASE }}
              style={{
                opacity: i === slide ? 1 : 0,
                transition: 'opacity 1.8s ease-in-out',
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ))
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_70%_80%,#8A3B27_0%,#1A1A1A_60%)]" />
        )}
      </motion.div>

      {/* Dark veil and grain */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/20 to-black/75" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-5 sm:px-10">
        {/* Phones show the whole logo: the hero button below already opens the map. */}
        <BrandLogo tone="light" size={38} compact />
        <nav className="flex items-center gap-2.5 sm:gap-6">
          <SoundToggle tone="light" />
          {/* Phones: only the logo and the sound stay in view, the rest sits in the same menu as the map page. */}
          <div className="sm:hidden">
            <MobileMenu tone="light" />
          </div>
          <LanguageSwitch tone="light" className="hidden sm:flex" />
          <a
            href={lp('/evenements')}
            className="hidden whitespace-nowrap text-sm text-cream/85 underline-offset-4 transition hover:text-cream hover:underline sm:inline"
          >
            {copy.nav.events}
          </a>
          <ProAuthButton className="hidden whitespace-nowrap text-sm text-cream/85 underline-offset-4 transition hover:text-cream hover:underline sm:block" />
          <AddSpotLink from="landing-nav" variant="pill-light" className="hidden sm:inline-flex" />
          <a
            href={lp('/explore')}
            className="hidden whitespace-nowrap rounded-pill border border-cream/40 px-4 py-1.5 sm:inline-block text-sm transition hover:border-cream hover:bg-cream hover:text-charcoal"
          >
            {copy.nav.openMap}
          </a>
        </nav>
      </header>

      <motion.div
        style={{ opacity: fade }}
        className="absolute inset-x-0 bottom-0 px-5 pb-24 sm:px-10 sm:pb-28 lg:max-w-5xl"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          className="text-[11px] font-medium uppercase tracking-[0.3em] text-cream/70"
        >
          {c.eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
          className="mt-5 font-serif text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.95] tracking-tight"
        >
          {c.titleLine1}
          <br />
          <span className="italic">{c.titleLine2}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: EASE }}
          className="mt-6 max-w-xl text-base text-cream/80 sm:text-lg"
        >
          {c.subtitle(catalog.places.length, catalog.itineraries.length)}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-9 flex flex-wrap items-center gap-6"
        >
          <a
            href={lp('/explore')}
            className="group inline-flex items-center gap-3 rounded-pill bg-cream px-6 py-3 text-sm font-medium text-charcoal transition hover:bg-terracotta hover:text-cream"
          >
            {c.cta}
            <Arrow className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#manifeste"
            className="text-sm text-cream/70 underline-offset-4 transition hover:text-cream hover:underline"
          >
            {c.readManifesto}
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <a
        href="#manifeste"
        aria-label={c.scrollLabel}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-cream/60 sm:flex"
      >
        {c.scroll}
        <span className="relative block h-10 w-px overflow-hidden bg-cream/20">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[tg-scroll-cue_2.2s_ease-in-out_infinite] bg-cream" />
        </span>
      </a>

      {slides[slide] && (
        <Credit
          photo={slides[slide].photo}
          className="absolute bottom-6 right-5 hidden max-w-[40%] text-right sm:right-10 lg:block"
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Manifesto                                                        */
/* ------------------------------------------------------------------ */

function Manifesto() {
  const { catalog, copy } = useLanding();
  const c = copy.manifesto;
  const figures = [
    { value: catalog.places.length, label: c.figures.spots },
    { value: catalog.itineraries.length, label: c.figures.trips },
    { value: catalog.categories.length, label: c.figures.categories },
  ];

  return (
    <section id="manifeste" className="scroll-mt-0 px-5 py-24 sm:px-10 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <SectionLabel index="01">{c.label}</SectionLabel>
        </Reveal>

        <div className="lg:col-span-8">
          <Reveal>
            <p className="font-serif text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.12] tracking-tight">
              {c.leadBefore}
              <em className="text-terracotta-700">{c.leadEm}</em>
              {c.leadAfter}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-14 grid gap-8 text-[15px] leading-relaxed text-charcoal-700 sm:grid-cols-2 sm:gap-12">
              <p className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-charcoal">
                {c.body[0]}
              </p>
              <p>{c.body[1]}</p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <dl className="mt-16 grid grid-cols-3 border-t border-sand-200">
              {figures.map((f) => (
                <div key={f.label} className="pt-6 pr-4">
                  <dt className="sr-only">{f.label}</dt>
                  <dd className="font-serif text-4xl tabular-nums sm:text-5xl">{f.value}</dd>
                  <dd className="mt-2 text-xs leading-snug text-charcoal-500 sm:text-sm">{f.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Escapes (road trips)                                             */
/* ------------------------------------------------------------------ */

interface TripCard {
  story: TripStory;
  itinerary: Itinerary;
  photo?: Photo;
}

function Escapes({ trips }: { trips: TripCard[] }) {
  const c = useLanding().copy.escapes;
  return (
    <section className="border-t border-sand-200 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel index="02">{c.label}</SectionLabel>
            <h2 className="mt-6 max-w-xl font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-tight">
              {c.title}
            </h2>
          </div>
          <p className="max-w-xs text-sm text-charcoal-500">{c.intro}</p>
        </Reveal>
      </div>

      <div className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-4 sm:gap-5 sm:scroll-px-10 sm:px-10 xl:px-[max(2.5rem,calc((100vw-72rem)/2+2.5rem))]">
        {trips.map((t, i) => (
          <TripCardView key={t.itinerary.id} trip={t} index={i} />
        ))}
      </div>
    </section>
  );
}

function TripCardView({ trip, index }: { trip: TripCard; index: number }) {
  const lp = useLocalePath();
  const { story, itinerary, photo } = trip;
  const { catalog, copy } = useLanding();
  const c = copy.escapes;
  const stops = itinerary.stops.map((id) => catalog.placeById[id]).filter((p): p is Place => !!p);
  const km = summarizeRoute(stops).totalKm;

  return (
    <a
      href={lp(`/explore?trip=${itinerary.id}`)}
      className="group relative isolate flex aspect-[4/5] w-[78vw] max-w-[400px] shrink-0 transform-gpu snap-start flex-col justify-end overflow-hidden rounded-3xl bg-charcoal p-5 text-cream sm:aspect-[3/4] sm:w-[360px] sm:p-6 lg:w-[400px]"
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.src}
          alt={itinerary.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-[1.4s] ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_30%_20%,#B04A30_0%,#1A1A1A_70%)]" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/60 to-black/10 sm:from-black/85 sm:via-black/35" />

      <div className="absolute inset-x-5 top-5 flex items-center justify-between sm:inset-x-6 sm:top-6 text-[11px] uppercase tracking-[0.24em] text-cream/75">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span>{story.kicker}</span>
      </div>

      <h3 className="font-serif text-2xl leading-tight tracking-tight sm:text-3xl">{itinerary.name}</h3>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-cream/90 sm:mt-3 sm:text-cream/80">{story.text}</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-cream/20 pt-4 text-xs text-cream/75">
        <span className="tabular-nums">{c.meta(itinerary.days, stops.length, formatKm(km))}</span>
        <span className="inline-flex items-center gap-2 text-cream">
          {c.seeTrip}
          <Arrow className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Atlas (vignettes)                                                */
/* ------------------------------------------------------------------ */

interface VignetteCard {
  id: string;
  caption: string;
  place: Place;
  photo?: Photo;
}

function Atlas({ vignettes }: { vignettes: VignetteCard[] }) {
  const half = Math.ceil(vignettes.length / 2);
  const rows = [vignettes.slice(0, half), vignettes.slice(half)];
  const { catalog, copy } = useLanding();
  const c = copy.atlas;

  return (
    <section className="overflow-hidden border-t border-sand-200 bg-sand-50 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <Reveal className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionLabel index="03">{c.label}</SectionLabel>
            <h2 className="mt-6 font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-tight">
              {c.title(catalog.places.length)}
            </h2>
          </div>
          <p className="self-end text-sm leading-relaxed text-charcoal-500 lg:col-span-5 lg:col-start-8">{c.intro}</p>
        </Reveal>
      </div>

      <div className="atlas-marquee mt-14 flex flex-col gap-5">
        {rows.map((row, r) => (
          <div key={r} className="flex w-max">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1}
                className={`flex shrink-0 gap-5 pr-5 ${r === 0 ? 'atlas-track' : 'atlas-track atlas-track-reverse'}`}
              >
                {row.map((v) => (
                  <li key={v.id}>
                    <VignetteView vignette={v} tabbable={copy === 0} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function VignetteView({ vignette, tabbable }: { vignette: VignetteCard; tabbable: boolean }) {
  const lp = useLocalePath();
  const { place, photo, caption } = vignette;
  return (
    <a
      href={lp(`/explore?place=${place.id}`)}
      tabIndex={tabbable ? undefined : -1}
      className="group block w-[260px] sm:w-[320px]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand-200">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.src}
            alt={place.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-[1.4s] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center p-6 text-center font-serif text-2xl italic text-charcoal-300">
            {place.name}
          </div>
        )}
      </div>
      <p className="mt-4 font-serif text-lg leading-snug">{caption}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-charcoal-300">{place.region}</p>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Guides and agencies                                                 */
/* ------------------------------------------------------------------ */

const PRO_COPY = {
  fr: {
    title: 'Vous êtes guide ou agence ?',
    text: 'Faites-vous connaître des voyageurs : un compte avec votre e-mail et un mot de passe, et vous modifiez votre fiche quand vous voulez. Les voyageurs vous écrivent directement sur WhatsApp.',
    list: 'Voir les guides et agences',
  },
  en: {
    title: 'Are you a guide or an agency?',
    text: 'Get known by travellers: create an account with your e-mail and a password, and change your listing whenever you like. Travellers write to you directly on WhatsApp.',
    list: 'See guides and agencies',
  },
} as const;

function ProSection() {
  const { locale } = useLocale();
  const c = PRO_COPY[locale];
  return (
    <section id="guides" className="border-t border-sand-200 bg-sand-50 px-5 py-24 sm:px-10 sm:py-32">
      <Reveal className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="font-serif text-4xl leading-[1.08] tracking-tight text-charcoal sm:text-5xl">{c.title}</h2>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-charcoal-500">{c.text}</p>
          <a
            href={locale === 'fr' ? '/guides' : '/en/guides'}
            className="mt-6 inline-block text-sm text-charcoal underline decoration-sand-300 underline-offset-4 hover:decoration-charcoal"
          >
            {c.list}
          </a>
        </div>
        <ProAccountSection />
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Finale                                                           */
/* ------------------------------------------------------------------ */

function Finale() {
  const lp = useLocalePath();
  const c = useLanding().copy.finale;
  const { t } = useLocale();
  return (
    <section className="relative isolate overflow-hidden bg-charcoal px-5 py-28 text-cream sm:px-10 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <LineArtPortrait className="pointer-events-none absolute bottom-0 right-[max(1.5rem,calc((100vw-72rem)/2))] -z-10 hidden h-[88%] max-h-[640px] w-auto text-cream/55 lg:block" />

      <Reveal className="mx-auto max-w-6xl">
        <SectionLabel index="04" tone="dark">
          {c.label}
        </SectionLabel>
        <h2 className="mt-8 max-w-3xl font-serif text-[clamp(2.5rem,6.5vw,5.5rem)] leading-[1] tracking-tight">
          {c.titleLine1}
          <br />
          <span className="italic text-terracotta-300">{c.titleLine2}</span>
        </h2>
        <p className="mt-8 max-w-lg text-base leading-relaxed text-cream/70">{c.body}</p>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <a
            href={lp('/explore')}
            className="group inline-flex items-center gap-3 rounded-pill bg-terracotta px-7 py-3.5 text-sm font-medium text-cream transition hover:bg-cream hover:text-charcoal"
          >
            {c.cta}
            <Arrow className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href={lp('/explore?trip=star-wars')}
            className="text-sm text-cream/70 underline-offset-4 transition hover:text-cream hover:underline"
          >
            {c.secondary}
          </a>
        </div>
        <p className="mt-14 max-w-lg border-t border-cream/15 pt-6 text-sm text-cream/60">
          {t.knowAPlace}{' '}
          <AddSpotLink from="landing-finale" variant="text-light" className="text-cream underline decoration-cream/40">
            {t.shareSecretSpot}
          </AddSpotLink>
        </p>
      </Reveal>
    </section>
  );
}

function Footer({ photos }: { photos: Photo[] }) {
  const c = useLanding().copy.footer;
  return (
    <footer className="bg-charcoal px-5 pb-10 text-cream/50 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-cream/10 pt-8 text-xs sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <BrandLogo tone="light" size={32} tag={null} />
          <span>{c.tagline}</span>
        </div>
        {photos.length > 0 && (
          <details className="max-w-xl sm:text-right">
            <summary className="cursor-pointer list-none transition hover:text-cream">{c.credits}</summary>
            <ul className="mt-3 space-y-1 leading-relaxed">
              {photos.map((p) => (
                <li key={p.src}>
                  <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="hover:text-cream">
                    {p.title} · {p.author} · {p.license}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
      <MadeBy tone="light" className="mx-auto mt-6 max-w-6xl" />
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({
  index,
  children,
  tone = 'light',
}: {
  index: string;
  children: React.ReactNode;
  tone?: 'light' | 'dark';
}) {
  return (
    <p
      className={`flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.3em] ${
        tone === 'dark' ? 'text-cream/60' : 'text-charcoal-500'
      }`}
    >
      <span className="tabular-nums text-terracotta">{index}</span>
      <span className={`h-px w-10 ${tone === 'dark' ? 'bg-cream/25' : 'bg-sand-300'}`} />
      {children}
    </p>
  );
}

function Credit({ photo, className = '' }: { photo: Photo; className?: string }) {
  const { copy } = useLanding();
  return (
    <a
      href={photo.sourceUrl}
      target="_blank"
      rel="noreferrer"
      className={`truncate text-[10px] text-cream/50 transition hover:text-cream ${className}`}
    >
      {copy.photoCredit(photo.author, photo.license)}
    </a>
  );
}

function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 10" width="20" height="10" fill="none" aria-hidden className={className}>
      <path d="M0 5h18M14 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
