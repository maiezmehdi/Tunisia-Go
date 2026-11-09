import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BrandLogo from '@/components/BrandLogo';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import LanguageSwitch from '@/components/LanguageSwitch';
import MadeBy from '@/components/MadeBy';
import SoundToggle from '@/components/SoundToggle';
import { ITINERARIES } from '@/data/tunisiaData';
import type { Place } from '@/data/types';
import { LOCALES, isLocale, type Locale } from '@/lib/i18n/config';
import { getCatalog } from '@/lib/i18n/catalog';
import { placePath } from '@/lib/placePages';
import { pageMetadata, localePath } from '@/lib/seo';
import { tripPageData } from '@/lib/structuredData';

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => ITINERARIES.map((it) => ({ lang, id: it.id })));
}

type Params = { params: Promise<{ lang: string; id: string }> };

const COPY = {
  fr: {
    brandTag: 'Road trips',
    home: 'Accueil',
    allTrips: 'Tous les road trips',
    openMap: 'Voir sur la carte',
    days: (n: number) => `${n} jours`,
    stopsTitle: 'Les étapes',
    metaTitle: (n: string) => `${n} : road trip en Tunisie, étapes et conseils · Tunisia Go`,
  },
  en: {
    brandTag: 'Road trips',
    home: 'Home',
    allTrips: 'All road trips',
    openMap: 'See on the map',
    days: (n: number) => `${n} days`,
    stopsTitle: 'The stops',
    metaTitle: (n: string) => `${n}: road trip in Tunisia, stops and tips · Tunisia Go`,
  },
} as const;

function find(lang: string, id: string) {
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const catalog = getCatalog(locale);
  const trip = catalog.itineraries.find((it) => it.id === id);
  const stops = (trip?.stops ?? []).map((sid) => catalog.placeById[sid]).filter((p): p is Place => !!p);
  return { locale, trip, stops };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, id } = await params;
  const { locale, trip } = find(lang, id);
  if (!trip) return {};
  return pageMetadata({
    lang: locale,
    path: `/road-trips/${id}`,
    title: COPY[locale].metaTitle(trip.name),
    description: `${trip.tagline}. ${trip.description}`,
  });
}

export default async function RoadTripPage({ params }: Params) {
  const { lang, id } = await params;
  const { locale, trip, stops } = find(lang, id);
  const lp = (path: string) => localePath(path, locale);
  if (!trip) notFound();
  const c = COPY[locale];

  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <JsonLd data={tripPageData(trip, stops, locale)} />
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo tag={c.brandTag} size={40} compact />
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:inline-flex">
              <SoundToggle />
            </span>
            <LanguageSwitch />
            <a
              href={lp('/road-trips')}
              className="text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline"
            >
              {c.allTrips}
            </a>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6">
        <Breadcrumbs items={[{ name: c.home, href: lp('/') }, { name: 'Road trips', href: lp('/road-trips') }, { name: trip.name }]} />
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{c.days(trip.days)}</p>
        <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">{trip.name}</h1>
        <p className="mt-5 max-w-2xl font-serif text-xl italic text-charcoal-700">{trip.tagline}</p>
        <p className="mt-6 max-w-2xl whitespace-pre-line text-[17px] leading-relaxed text-charcoal-700">
          {trip.description}
        </p>
        <a
          href={lp(`/explore?trip=${trip.id}`)}
          className="mt-6 inline-block rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
        >
          {c.openMap}
        </a>

        <h2 className="mt-14 text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{c.stopsTitle}</h2>
        <ol className="mt-3 divide-y divide-sand-200 border-y border-sand-200">
          {stops.map((p, i) => (
            <li key={p.id}>
              <a
                href={lp(placePath(p.id))}
                className="group grid grid-cols-[2rem_1fr] gap-x-3 py-4 sm:grid-cols-[2rem_260px_1fr]"
              >
                <span className="font-serif text-lg text-charcoal-300">{i + 1}</span>
                <span>
                  <span className="font-medium text-charcoal group-hover:text-terracotta-700">{p.name}</span>
                  <span className="block text-xs text-charcoal-300">{p.region}</span>
                </span>
                <span className="col-start-2 mt-1 text-sm text-charcoal-500 sm:col-start-3 sm:mt-0">{p.tagline}</span>
              </a>
            </li>
          ))}
        </ol>
      </article>
      <div className="border-t border-sand-200">
        <MadeBy className="mx-auto max-w-5xl px-4 py-6 sm:px-6" />
      </div>
    </main>
  );
}
