import type { Metadata } from 'next';

import BrandLogo from '@/components/BrandLogo';
import JsonLd from '@/components/JsonLd';
import LanguageSwitch from '@/components/LanguageSwitch';
import MadeBy from '@/components/MadeBy';
import SoundToggle from '@/components/SoundToggle';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getCatalog } from '@/lib/i18n/catalog';
import { pageMetadata, SITE_URL, localePath } from '@/lib/seo';
import { sectionBreadcrumb } from '@/lib/structuredData';

type Params = { params: Promise<{ lang: string }> };

const COPY = {
  fr: {
    brandTag: 'Road trips',
    metaTitle: 'Road trips en Tunisie : itinéraires jour par jour · Tunisia Go',
    metaDescription:
      'Des road trips en Tunisie, du nord au désert : étapes, durée et lieux à voir sur chaque itinéraire, pensés avec des locaux.',
    eyebrow: 'Road trips',
    title: (n: number) => `${n} road trips à travers la Tunisie`,
    lead: 'Chaque itinéraire enchaîne des lieux qui valent le détour, dans l’ordre où les visiter. Ouvrez-en un pour voir toutes les étapes.',
    days: (n: number) => `${n} jours`,
    stops: (n: number) => `${n} étapes`,
    openMap: 'Ouvrir la carte',
  },
  en: {
    brandTag: 'Road trips',
    metaTitle: 'Road trips in Tunisia: day-by-day itineraries · Tunisia Go',
    metaDescription:
      'Road trips across Tunisia, from the north to the desert: stops, length and places to see on every route, shaped with locals.',
    eyebrow: 'Road trips',
    title: (n: number) => `${n} road trips across Tunisia`,
    lead: 'Each route links places worth the drive, in the order to visit them. Open one to see every stop.',
    days: (n: number) => `${n} days`,
    stops: (n: number) => `${n} stops`,
    openMap: 'Open the map',
  },
} as const;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const c = COPY[locale];
  return pageMetadata({ lang: locale, path: '/road-trips', title: c.metaTitle, description: c.metaDescription });
}

export default async function RoadTripsIndex({ params }: Params) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const c = COPY[locale];
  const { itineraries } = getCatalog(locale);

  const list = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: c.title(itineraries.length),
    numberOfItems: itineraries.length,
    itemListElement: itineraries.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: `${SITE_URL}${localePath(`/road-trips/${it.id}`, locale)}`,
    })),
  };

  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <JsonLd data={sectionBreadcrumb('Road trips', '/road-trips', locale)} />
      <JsonLd data={list} />
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo tag={c.brandTag} size={40} compact />
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:inline-flex">
              <SoundToggle />
            </span>
            <LanguageSwitch />
            <a
              href="/explore"
              className="text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline"
            >
              {c.openMap}
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{c.eyebrow}</p>
        <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          {c.title(itineraries.length)}
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-charcoal-500">{c.lead}</p>

        <ul className="mt-12 divide-y divide-sand-200 border-y border-sand-200">
          {itineraries.map((it) => (
            <li key={it.id}>
              <a href={`/road-trips/${it.id}`} className="group grid gap-1 py-5 sm:grid-cols-[320px_1fr] sm:gap-8">
                <span>
                  <span className="font-serif text-xl text-charcoal group-hover:text-terracotta-700">{it.name}</span>
                  <span className="mt-1 block text-xs text-charcoal-300">
                    {c.days(it.days)} · {c.stops(it.stops.length)}
                  </span>
                </span>
                <span className="text-sm leading-relaxed text-charcoal-500">{it.tagline}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-sand-200">
        <MadeBy className="mx-auto max-w-5xl px-4 py-6 sm:px-6" />
      </div>
    </main>
  );
}
