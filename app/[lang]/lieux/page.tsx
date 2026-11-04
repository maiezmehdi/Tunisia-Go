import type { Metadata } from 'next';

import BrandLogo from '@/components/BrandLogo';
import JsonLd from '@/components/JsonLd';
import LanguageSwitch from '@/components/LanguageSwitch';
import MadeBy from '@/components/MadeBy';
import SoundToggle from '@/components/SoundToggle';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getCatalog } from '@/lib/i18n/catalog';
import { applyOverrides, loadPlaceOverrides } from '@/lib/placeOverrides';
import { placePath } from '@/lib/placePages';
import { hasRegionPage, regionPath } from '@/lib/regionPages';
import { pageMetadata, SITE_URL, localePath } from '@/lib/seo';
import { sectionBreadcrumb } from '@/lib/structuredData';

type Params = { params: Promise<{ lang: string }> };

const COPY = {
  fr: {
    brandTag: 'Lieux',
    metaTitle: 'Tous les lieux à voir en Tunisie · Tunisia Go',
    metaDescription:
      'Carthage, Djerba, Tozeur, Kairouan… tous les lieux qui valent le détour en Tunisie, avec la meilleure saison, la durée de visite et des conseils locaux.',
    eyebrow: 'Les lieux',
    title: (n: number) => `${n} lieux qui valent le détour`,
    lead: 'Chaque lieu a sa page : histoire, usages, cuisine, meilleure période et itinéraire. Pour les voir sur la carte, ouvrez l’explorateur.',
    openMap: 'Ouvrir la carte',
    best: 'Idéal',
    seeRegion: 'Que voir ici',
  },
  en: {
    brandTag: 'Places',
    metaTitle: 'All the places to see in Tunisia · Tunisia Go',
    metaDescription:
      'Carthage, Djerba, Tozeur, Kairouan… every place worth the drive in Tunisia, with the best season, how long to stay and local tips.',
    eyebrow: 'Places',
    title: (n: number) => `${n} places worth the drive`,
    lead: 'Every place has its own page: history, customs, food, best time and directions. To see them on the map, open the explorer.',
    openMap: 'Open the map',
    best: 'Best',
    seeRegion: 'What to see',
  },
} as const;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const c = COPY[locale];
  return pageMetadata({ lang: locale, path: '/lieux', title: c.metaTitle, description: c.metaDescription });
}

export default async function PlacesIndex({ params }: Params) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const c = COPY[locale];
  const base = getCatalog(locale);
  const catalog = { ...base, places: applyOverrides(base.places, await loadPlaceOverrides(), locale) };

  const byRegion = new Map<string, typeof catalog.places>();
  for (const p of catalog.places) byRegion.set(p.region, [...(byRegion.get(p.region) ?? []), p]);

  const list = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: c.title(catalog.places.length),
    numberOfItems: catalog.places.length,
    itemListElement: catalog.places.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${SITE_URL}${localePath(placePath(p.id), locale)}`,
    })),
  };

  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <JsonLd data={sectionBreadcrumb(locale === 'en' ? 'Places' : 'Lieux', '/lieux', locale)} />
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
          {c.title(catalog.places.length)}
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-charcoal-500">{c.lead}</p>

        <div className="mt-12 space-y-12">
          {[...byRegion.entries()].map(([region, places]) => (
            <section key={region}>
              <h2 className="flex items-baseline justify-between gap-4 border-b border-sand-200 pb-2 font-serif text-2xl">
                {region}
                {hasRegionPage(region) && (
                  <a
                    href={regionPath(region)}
                    className="font-sans text-sm text-charcoal-500 underline-offset-4 hover:text-charcoal hover:underline"
                  >
                    {c.seeRegion}
                  </a>
                )}
              </h2>
              <ul className="mt-2 divide-y divide-sand-200">
                {places.map((p) => (
                  <li key={p.id}>
                    <a href={placePath(p.id)} className="group grid gap-1 py-3.5 sm:grid-cols-[260px_1fr] sm:gap-6">
                      <span className="font-medium text-charcoal group-hover:text-terracotta-700">{p.name}</span>
                      <span className="text-sm text-charcoal-500">{p.tagline}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <div className="border-t border-sand-200">
        <MadeBy className="mx-auto max-w-5xl px-4 py-6 sm:px-6" />
      </div>
    </main>
  );
}
