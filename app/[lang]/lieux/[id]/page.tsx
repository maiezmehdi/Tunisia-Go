import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BrandLogo from '@/components/BrandLogo';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import LanguageSwitch from '@/components/LanguageSwitch';
import MadeBy from '@/components/MadeBy';
import NearbyAgencies from '@/components/NearbyAgencies';
import NearbyStays from '@/components/NearbyStays';
import PlaceClose from '@/components/PlaceClose';
import PlaceRating from '@/components/PlaceRating';
import PlaceReport from '@/components/PlaceReport';
import SeasonStrip from '@/components/SeasonStrip';
import SoundToggle from '@/components/SoundToggle';
import TripButton from '@/components/TripButton';
import { bestMonthsLabel } from '@/data/seasons';
import type { Place } from '@/data/types';
import { PLACES } from '@/data/tunisiaData';
import { guideAnchor, guideFor, regionGuides } from '@/data/regionGuides';
import { LOCALES, isLocale, type Locale } from '@/lib/i18n/config';
import { getCatalog } from '@/lib/i18n/catalog';
import { haversineKm } from '@/lib/geo';
import { loadPhotos } from '@/lib/photos';
import { applyOverrides, loadPlaceOverrides, withOverridePhotos } from '@/lib/placeOverrides';
import { placeUpdated } from '@/data/contentDates';
import { formatUpdated, placePath } from '@/lib/placePages';
import { hasRegionPage, regionPath } from '@/lib/regionPages';
import { loadRatingStats } from '@/lib/ratings';
import { pageMetadata, localePath } from '@/lib/seo';
import { placePageData } from '@/lib/structuredData';

// Photos come from Wikimedia Commons and are refreshed once a day.
export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => PLACES.map((p) => ({ lang, id: p.id })));
}

type Params = { params: Promise<{ lang: string; id: string }> };

const COPY = {
  fr: {
    brandTag: 'Lieux',
    allPlaces: 'Tous les lieux',
    openMap: 'Voir sur la carte',
    directions: 'Itinéraire',
    insights: { history: 'Histoire', customs: 'Usages', food: 'Cuisine', bestTime: 'Quand venir' },
    duration: 'Durée de visite',
    bestPeriod: 'Meilleure période',
    region: 'Région',
    updated: (d: string) => `Fiche mise à jour en ${d}.`,
    sources: 'Pour aller plus loin',
    wiki: 'Wikipédia',
    photosFrom: 'Photos : Wikimedia Commons',
    inTrips: 'Dans ces road trips',
    nearby: 'À voir aussi',
    visit: (n: string) => `Visiter ${n}`,
    home: 'Accueil',
    places: 'Lieux',
    regionGuide: 'Cahier pratique',
    regionGuideHint: 'Usages, négociation et bonne saison, en quelques lignes.',
    unesco: 'Patrimoine mondial de l’UNESCO',
    metaTitle: (n: string) => `${n} : visite, quand y aller, conseils · Tunisia Go`,
    days: (n: number) => `${n} jours`,
  },
  en: {
    brandTag: 'Places',
    allPlaces: 'All places',
    openMap: 'See on the map',
    directions: 'Directions',
    insights: { history: 'History', customs: 'Customs', food: 'Food', bestTime: 'Best time' },
    duration: 'Time to allow',
    bestPeriod: 'Best period',
    region: 'Region',
    updated: (d: string) => `Page updated ${d}.`,
    sources: 'Read more',
    wiki: 'Wikipedia',
    photosFrom: 'Photos: Wikimedia Commons',
    inTrips: 'Part of these road trips',
    nearby: 'See also',
    visit: (n: string) => `Visit ${n}`,
    home: 'Home',
    places: 'Places',
    regionGuide: 'Regional notes',
    regionGuideHint: 'Customs, bargaining and the right season, in a few lines.',
    unesco: 'UNESCO World Heritage',
    metaTitle: (n: string) => `${n}: visiting, when to go, tips · Tunisia Go`,
    days: (n: number) => `${n} days`,
  },
} as const;

async function find(lang: string, id: string) {
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const catalog = getCatalog(locale);
  const overrides = await loadPlaceOverrides();
  const base = catalog.placeById[id];
  const place = base ? applyOverrides([base], overrides, locale)[0] : undefined;
  return { locale, catalog, place, overrides };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, id } = await params;
  const { locale, place } = await find(lang, id);
  if (!place) return {};
  return pageMetadata({
    lang: locale,
    path: placePath(id),
    title: COPY[locale].metaTitle(place.name),
    description: `${place.tagline}. ${place.description}`,
    image: { url: `/api/og/${id}?lang=${locale}`, alt: `${place.name}, ${place.region}` },
  });
}

export default async function PlacePage({ params }: Params) {
  const { lang, id } = await params;
  const { locale, catalog, place, overrides } = await find(lang, id);
  const lp = (path: string) => localePath(path, locale);
  if (!place) notFound();
  const c = COPY[locale];
  const rating = (await loadRatingStats())[place.id];

  const photos = withOverridePhotos(await loadPhotos([place]), overrides, { [place.id]: place.name })[place.id] ?? [];
  const photo = photos[0];
  const itineraries = catalog.itineraries.filter((it) => it.stops.includes(place.id));
  // « À voir aussi »: the region's other places, then the closest places of the same kind, 3 to 6 links.
  const others = catalog.places.filter((p) => p.id !== place.id);
  const byDistance = (a: Place, b: Place) => haversineKm(place.coords, a.coords) - haversineKm(place.coords, b.coords);
  const sameRegion = others.filter((p) => p.region === place.region).sort(byDistance);
  const sameKind = others.filter((p) => p.region !== place.region && p.category === place.category).sort(byDistance);
  const closest = others.filter((p) => p.region !== place.region).sort(byDistance);
  const nearby = [...new Map([...sameRegion, ...sameKind.slice(0, 3), ...closest].map((p) => [p.id, p])).values()].slice(0, 6);
  const guide = regionGuides(locale).find((g) => g.id === guideFor(place.id));
  const category = catalog.categoryById[place.category];
  const best = bestMonthsLabel(place.id, locale);
  const wikiUrl = place.wiki
    ? `https://en.wikipedia.org/wiki/${encodeURIComponent(place.wiki.replace(/ /g, '_'))}`
    : null;
  const wikiFrUrl = place.wikiFr
    ? `https://fr.wikipedia.org/wiki/${encodeURIComponent(place.wikiFr.replace(/ /g, '_'))}`
    : null;
  const wikiLink = locale === 'fr' ? (wikiFrUrl ?? wikiUrl) : (wikiUrl ?? wikiFrUrl);
  const wikiInEnglish = locale === 'fr' && !wikiFrUrl && !!wikiUrl;
  const [lat, lng] = place.coords;

  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <JsonLd data={placePageData(place, photos, locale)} />
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo tag={c.brandTag} size={40} compact />
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:inline-flex">
              <SoundToggle />
            </span>
            <LanguageSwitch />
            <a
              href={lp('/lieux')}
              className="hidden text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline sm:inline"
            >
              {c.allPlaces}
            </a>
            <PlaceClose placeId={place.id} />
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <Breadcrumbs
          items={[
            { name: c.home, href: lp('/') },
            { name: c.places, href: lp('/lieux') },
            ...(hasRegionPage(place.region) ? [{ name: place.region, href: lp(regionPath(place.region)) }] : []),
            { name: place.name },
          ]}
        />
        <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-charcoal-300">
          {category.label}
          {place.unesco && ` · ${c.unesco}`}
        </p>
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <h1 className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">{place.name}</h1>
          {place.nameAr && (
            <span lang="ar" dir="rtl" className="shrink-0 font-serif text-xl text-charcoal-300">
              {place.nameAr}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-charcoal-500">
          {hasRegionPage(place.region) ? (
            <a
              href={lp(regionPath(place.region))}
              className="underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
            >
              {place.region}
            </a>
          ) : (
            place.region
          )}
        </p>
        <p className="mt-5 max-w-2xl font-serif text-xl italic text-charcoal-700">{place.tagline}</p>
        <PlaceRating placeId={place.id} average={rating?.average ?? null} votes={rating?.votes ?? 0} />

        {photo && (
          <figure className="mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={`${place.name}, ${place.region} · ${category.label}`}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={photo.width}
              height={photo.height}
              className="max-h-[480px] w-full rounded-3xl object-cover"
            />
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
        )}

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div>
            <p className="whitespace-pre-line text-[17px] leading-relaxed text-charcoal-700">{place.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
              <a
                href={lp(`/explore?place=${place.id}`)}
                className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
              >
                {c.openMap}
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-pill border border-charcoal-300 px-5 py-2.5 text-sm text-charcoal transition hover:border-charcoal"
              >
                {c.directions}
              </a>
            </div>
            <TripButton placeId={place.id} />

            <dl className="mt-10 divide-y divide-sand-200 border-y border-sand-200">
              {(['history', 'customs', 'food', 'bestTime'] as const).map((key) => (
                <div key={key} className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                  <dt className="text-sm font-medium text-charcoal">{c.insights[key]}</dt>
                  <dd className="text-[15px] leading-relaxed text-charcoal-700">{place.insights[key]}</dd>
                </div>
              ))}
            </dl>

            {place.didYouKnow && (
              <blockquote className="mt-10 border-l-2 border-terracotta pl-5 font-serif text-xl leading-snug text-charcoal">
                {place.didYouKnow}
              </blockquote>
            )}

            <NearbyStays placeId={place.id} locale={locale} className="mt-12" />

            <NearbyAgencies governorate={place.region} locale={locale} className="mt-12" />
          </div>

          <aside className="space-y-8">
            <div className="rounded-3xl border border-sand-200 p-6">
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-charcoal-300">{c.region}</dt>
                  <dd className="mt-1 text-charcoal-700">{place.region}</dd>
                </div>
                {place.visitDuration && (
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.18em] text-charcoal-300">{c.duration}</dt>
                    <dd className="mt-1 text-charcoal-700">{place.visitDuration}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-charcoal-300">{c.bestPeriod}</dt>
                  <dd className="mt-1 text-charcoal-700">{best.charAt(0).toUpperCase() + best.slice(1)}</dd>
                </div>
              </dl>
              <div className="mt-6 border-t border-sand-200 pt-5">
                <SeasonStrip placeId={place.id} />
              </div>
            </div>

            {guide && (
              <a
                href={lp(`/pratique#${guideAnchor(guide.id)}`)}
                className="group block border-l-2 border-sand-300 py-1 pl-5 transition hover:border-charcoal"
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">
                  {c.regionGuide}
                </span>
                <span className="mt-1 block font-serif text-lg leading-snug text-charcoal group-hover:text-terracotta-700">
                  {guide.title}
                </span>
                <span className="mt-0.5 block text-sm text-charcoal-500">{c.regionGuideHint}</span>
              </a>
            )}

            {itineraries.length > 0 && (
              <div>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{c.inTrips}</h2>
                <ul className="mt-3 space-y-2">
                  {itineraries.map((it) => (
                    <li key={it.id}>
                      <a
                        href={lp(`/road-trips/${it.id}`)}
                        className="text-sm text-charcoal underline decoration-sand-300 underline-offset-4 transition hover:decoration-charcoal"
                      >
                        {it.name}
                      </a>
                      <span className="text-sm text-charcoal-300"> · {c.days(it.days)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {nearby.length > 0 && (
          <nav aria-label={c.nearby} className="mt-16 border-t border-sand-200 pt-8">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">
              {c.nearby}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {nearby.map((p) => (
                <li key={p.id}>
                  <a
                    href={lp(placePath(p.id))}
                    className="inline-block rounded-pill border border-sand-200 px-4 py-1.5 text-sm text-charcoal-700 transition hover:border-charcoal-300 hover:text-charcoal"
                  >
                    {c.visit(p.name)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <footer className="mt-16 space-y-4 border-t border-sand-200 pt-6 text-sm text-charcoal-500">
          <p>
            {c.updated(formatUpdated(locale, placeUpdated(place.id)))}
            {wikiLink && (
              <>
                {' '}
                {c.sources} :{' '}
                <a
                  href={wikiLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-sand-300 underline-offset-4 hover:text-charcoal hover:decoration-charcoal"
                >
                  {c.wiki}
                  {wikiInEnglish && ' (en anglais)'}
                </a>
                . {c.photosFrom}.
              </>
            )}
          </p>
          <PlaceReport placeId={place.id} />
        </footer>
      </article>

      <div className="border-t border-sand-200">
        <MadeBy className="mx-auto max-w-5xl px-4 py-6 sm:px-6" />
      </div>
    </main>
  );
}
