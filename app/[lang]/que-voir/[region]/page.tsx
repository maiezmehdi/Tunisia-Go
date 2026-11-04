import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BrandLogo from '@/components/BrandLogo';
import JsonLd from '@/components/JsonLd';
import LanguageSwitch from '@/components/LanguageSwitch';
import MadeBy from '@/components/MadeBy';
import SoundToggle from '@/components/SoundToggle';
import { bestMonthsLabel } from '@/data/seasons';
import { guideAnchor, guideFor, regionGuides } from '@/data/regionGuides';
import type { Place } from '@/data/types';
import { LOCALES, isLocale, type Locale } from '@/lib/i18n/config';
import { getCatalog } from '@/lib/i18n/catalog';
import { placePath } from '@/lib/placePages';
import { PAGE_REGIONS, regionPath } from '@/lib/regionPages';
import { pageMetadata, trimDescription } from '@/lib/seo';
import { regionPageData } from '@/lib/structuredData';

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => PAGE_REGIONS.map((r) => ({ lang, region: r.slug })));
}

type Params = { params: Promise<{ lang: string; region: string }> };

const COPY = {
  fr: {
    brandTag: 'Que voir',
    allPlaces: 'Tous les lieux',
    title: (r: string) => `Que voir à ${r} ?`,
    metaTitle: (r: string) => `Que voir à ${r} : lieux, durée de visite, quand y aller · Tunisia Go`,
    metaDescription: (r: string, names: string) =>
      `Que voir à ${r} : ${names} et plus. Durée de visite, meilleure période, road trips et conseils locaux pour chaque lieu.`,
    lead: (r: string, n: number) =>
      `${n} lieux qui valent le détour à ${r}, avec le temps à prévoir et la meilleure période pour chacun. Chaque lieu a sa fiche complète : histoire, usages, cuisine et itinéraire.`,
    duration: 'Durée',
    best: 'Idéal',
    trips: (r: string) => `Road trips qui passent par ${r}`,
    days: (n: number) => `${n} jours`,
    practical: 'Avant de partir',
    practicalText: 'Usages, négociation, chaleur et bonnes manières : lisez le cahier pratique de la région.',
    practicalLink: 'Ouvrir le cahier pratique',
    openMap: 'Voir sur la carte',
  },
  en: {
    brandTag: 'What to see',
    allPlaces: 'All places',
    title: (r: string) => `What to see in ${r}`,
    metaTitle: (r: string) => `What to see in ${r}: places, how long to stay, when to go · Tunisia Go`,
    metaDescription: (r: string, names: string) =>
      `What to see in ${r}: ${names} and more. Time to allow, best period, road trips and local tips for every place.`,
    lead: (r: string, n: number) =>
      `${n} places worth the drive in ${r}, with the time to allow and the best period for each. Every place has its own page: history, customs, food and directions.`,
    duration: 'Time',
    best: 'Best',
    trips: (r: string) => `Road trips through ${r}`,
    days: (n: number) => `${n} days`,
    practical: 'Before you go',
    practicalText: 'Customs, bargaining, heat and good manners: read the regional notes.',
    practicalLink: 'Open the regional notes',
    openMap: 'See on the map',
  },
} as const;

function find(lang: string, slug: string) {
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const entry = PAGE_REGIONS.find((r) => r.slug === slug);
  const catalog = getCatalog(locale);
  const places = (entry?.placeIds ?? []).map((id) => catalog.placeById[id]).filter((p): p is Place => !!p);
  const trips = catalog.itineraries.filter((it) => it.stops.some((id) => entry?.placeIds.includes(id)));
  return { locale, entry, places, trips };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, region: slug } = await params;
  const { locale, entry, places } = find(lang, slug);
  if (!entry) return {};
  const c = COPY[locale];
  return pageMetadata({
    lang: locale,
    path: regionPath(entry.region),
    title: c.metaTitle(entry.region),
    description: c.metaDescription(
      entry.region,
      places
        .slice(0, 3)
        .map((p) => p.name)
        .join(', '),
    ),
    image: places[0] ? { url: `/api/og/${places[0].id}?lang=${locale}`, alt: entry.region } : undefined,
  });
}

export default async function RegionPage({ params }: Params) {
  const { lang, region: slug } = await params;
  const { locale, entry, places, trips } = find(lang, slug);
  if (!entry) notFound();
  const c = COPY[locale];
  const guide = regionGuides(locale).find((g) => g.id === guideFor(places[0].id));

  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <JsonLd data={regionPageData(entry.region, places, locale)} />
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo tag={c.brandTag} size={40} compact />
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:inline-flex">
              <SoundToggle />
            </span>
            <LanguageSwitch />
            <a
              href="/lieux"
              className="text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline"
            >
              {c.allPlaces}
            </a>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6">
        <h1 className="max-w-3xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          {c.title(entry.region)}
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-charcoal-500">
          {c.lead(entry.region, places.length)}
        </p>

        <ol className="mt-12 divide-y divide-sand-200 border-y border-sand-200">
          {places.map((p, i) => (
            <li key={p.id} className="py-6">
              <h2 className="font-serif text-2xl">
                <a href={placePath(p.id)} className="hover:text-terracotta-700">
                  <span className="mr-2 text-charcoal-300">{i + 1}.</span>
                  {p.name}
                </a>
              </h2>
              <p className="mt-1 font-serif text-lg italic text-charcoal-700">{p.tagline}</p>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-charcoal-500">
                {trimDescription(p.description, 260)}
              </p>
              <p className="mt-3 text-xs text-charcoal-300">
                {c.duration} : {p.visitDuration} · {c.best} : {bestMonthsLabel(p.id, locale)}
              </p>
            </li>
          ))}
        </ol>

        {trips.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">
              {c.trips(entry.region)}
            </h2>
            <ul className="mt-3 space-y-2">
              {trips.map((it) => (
                <li key={it.id}>
                  <a
                    href={`/road-trips/${it.id}`}
                    className="text-sm text-charcoal underline decoration-sand-300 underline-offset-4 hover:decoration-charcoal"
                  >
                    {it.name}
                  </a>
                  <span className="text-sm text-charcoal-300"> · {c.days(it.days)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {guide && (
          <section className="mt-12 rounded-3xl border border-sand-200 bg-white/60 p-6">
            <h2 className="font-serif text-xl">{c.practical}</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal-500">{c.practicalText}</p>
            <a
              href={`/pratique#${guideAnchor(guide.id)}`}
              className="mt-3 inline-block text-sm text-charcoal underline decoration-sand-300 underline-offset-4 hover:decoration-charcoal"
            >
              {c.practicalLink}
            </a>
          </section>
        )}
      </article>
      <div className="border-t border-sand-200">
        <MadeBy className="mx-auto max-w-5xl px-4 py-6 sm:px-6" />
      </div>
    </main>
  );
}
