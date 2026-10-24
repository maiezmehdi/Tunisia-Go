import type { Metadata } from 'next';

import BrandLogo from '@/components/BrandLogo';
import JsonLd from '@/components/JsonLd';
import LanguageSwitch from '@/components/LanguageSwitch';
import MadeBy from '@/components/MadeBy';
import SoundToggle from '@/components/SoundToggle';
import { type EventAction, type EventKind, type TunisiaEvent } from '@/data/events';
import { PLACES } from '@/data/tunisiaData';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getCatalog } from '@/lib/i18n/catalog';
import { loadEvents } from '@/lib/events';
import { bookingUrl } from '@/lib/links';
import { loadPhotos } from '@/lib/photos';
import { placePath } from '@/lib/placePages';
import { pageMetadata, SITE_URL, localePath } from '@/lib/seo';

export const revalidate = 86400;

type Params = { params: Promise<{ lang: string }> };

const COPY = {
  fr: {
    brandTag: 'Événements',
    metaTitle: 'Événements et festivals en Tunisie · Tunisia Go',
    metaDescription:
      'Festivals de musique, rassemblements et rendez-vous culturels en Tunisie : dates, lieux et billetterie quand elle existe.',
    eyebrow: 'Événements',
    title: 'Festivals, musique et rendez-vous culturels',
    lead: 'Des rendez-vous à vivre sur place, avec leur lieu, leur date et la bonne façon d’y aller. Une date marquée « à confirmer » n’a pas encore été annoncée : nous ne publions que ce qui est vérifié.',
    openMap: 'Ouvrir la carte',
    groups: { music: 'Musique et festivals', gathering: 'Rassemblements et traditions', culture: 'Culture' } as Record<
      EventKind,
      string
    >,
    toConfirm: 'À confirmer',
    upcoming: 'Annoncé',
    seeOnMap: 'Voir sur la carte',
    soon: 'Bientôt',
    note: 'Circuits de plein air et musique en pleine nature : nous ajoutons ces rendez-vous dès qu’ils sont confirmés par leurs organisateurs.',
  },
  en: {
    brandTag: 'Events',
    metaTitle: 'Events and festivals in Tunisia · Tunisia Go',
    metaDescription:
      'Music festivals, gatherings and cultural events in Tunisia: dates, places and ticketing when it exists.',
    eyebrow: 'Events',
    title: 'Festivals, music and cultural events',
    lead: 'Things to experience on the ground, with their place, their date and the right way to go. A date marked “to be confirmed” has not been announced yet: we only publish what is verified.',
    openMap: 'Open the map',
    groups: { music: 'Music and festivals', gathering: 'Gatherings and traditions', culture: 'Culture' } as Record<
      EventKind,
      string
    >,
    toConfirm: 'To be confirmed',
    upcoming: 'Announced',
    seeOnMap: 'See on the map',
    soon: 'Soon',
    note: 'Outdoor circuits and music in the wild: we add these as soon as their organisers confirm them.',
  },
} as const;

const ORDER: EventKind[] = ['music', 'gathering', 'culture'];

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const c = COPY[locale];
  return pageMetadata({ lang: locale, path: '/evenements', title: c.metaTitle, description: c.metaDescription });
}

export default async function EventsPage({ params }: Params) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const c = COPY[locale];
  const catalog = getCatalog(locale);
  const places = new Map(catalog.places.map((p) => [p.id, p]));
  const raw = new Map(PLACES.map((p) => [p.id, p]));
  const events = await loadEvents();
  const photos = await loadPhotos(
    [...new Set(events.map((e) => e.placeId))].map((id) => raw.get(id)).filter((p): p is NonNullable<typeof p> => !!p),
  );

  const jsonLd = events.filter((e) => e.confirmed && e.start).map((e) => {
    const place = places.get(e.placeId);
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: e.title[locale],
      description: e.description[locale],
      startDate: e.start,
      endDate: e.end,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: place
        ? {
            '@type': 'Place',
            name: place.name,
            address: { '@type': 'PostalAddress', addressRegion: place.region, addressCountry: 'TN' },
            geo: { '@type': 'GeoCoordinates', latitude: place.coords[0], longitude: place.coords[1] },
          }
        : undefined,
      url: `${SITE_URL}${localePath('/evenements', locale)}#${e.id}`,
    };
  });

  const actionHref = (e: TunisiaEvent, a: EventAction): string | null => {
    if (a.kind === 'stay') {
      const p = raw.get(e.placeId);
      return p ? bookingUrl(p) : null;
    }
    if (a.kind === 'info') return e.source ?? null;
    return a.url ?? null;
  };

  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <JsonLd data={jsonLd} />
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo tag={c.brandTag} size={40} compact />
          <div className="flex items-center gap-5">
            <SoundToggle />
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
        <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">{c.title}</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-charcoal-500">{c.lead}</p>

        <div className="mt-12 space-y-14">
          {ORDER.map((kind) => {
            const list = events.filter((e) => e.kind === kind).sort(
              (a, b) => Number(b.confirmed) - Number(a.confirmed),
            );
            if (list.length === 0) return null;
            return (
              <section key={kind}>
                <h2 className="border-b border-sand-200 pb-2 font-serif text-2xl">{c.groups[kind]}</h2>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                  {list.map((e) => {
                    const place = places.get(e.placeId);
                    const photo = photos[e.placeId]?.[0];
                    return (
                      <li
                        key={e.id}
                        id={e.id}
                        className="flex flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white/60"
                      >
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo.src} alt={photo.title} loading="lazy" className="h-48 w-full object-cover" />
                        ) : (
                          <div className="h-48 w-full bg-sand-200/60" aria-hidden />
                        )}
                        <div className="flex flex-1 flex-col p-5">
                          <p
                            className={`text-[11px] font-medium uppercase tracking-[0.18em] ${
                              e.confirmed ? 'text-terracotta-700' : 'text-charcoal-300'
                            }`}
                          >
                            {e.confirmed ? c.upcoming : c.toConfirm}
                          </p>
                          <h3 className="mt-1 font-serif text-xl leading-snug">{e.title[locale]}</h3>
                          <p className="mt-1 text-sm text-charcoal-700">{e.when[locale]}</p>
                          {place && (
                            <p className="mt-0.5 text-sm text-charcoal-500">
                              <a
                                href={placePath(place.id)}
                                className="underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
                              >
                                {place.name}
                              </a>
                              {' · '}
                              <a
                                href={`/explore?place=${place.id}`}
                                className="underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
                              >
                                {c.seeOnMap}
                              </a>
                            </p>
                          )}
                          <p className="mt-3 flex-1 text-[15px] leading-relaxed text-charcoal-500">
                            {e.description[locale]}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {e.actions.map((a) => {
                              const href = actionHref(e, a);
                              const base = 'inline-flex items-center rounded-full border px-4 py-2 text-sm transition';
                              return href ? (
                                <a
                                  key={a.kind}
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer sponsored"
                                  className={`${base} ${
                                    a.kind === 'tickets'
                                      ? 'border-charcoal bg-charcoal text-cream hover:bg-charcoal-700'
                                      : 'border-sand-200 text-charcoal-700 hover:border-charcoal-300'
                                  }`}
                                >
                                  {a.label[locale]}
                                </a>
                              ) : (
                                <span
                                  key={a.kind}
                                  aria-disabled="true"
                                  className={`${base} cursor-default border-sand-200 text-charcoal-300`}
                                >
                                  {a.label[locale]}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        <p className="mt-14 max-w-2xl text-sm leading-relaxed text-charcoal-500">{c.note}</p>
      </div>
      <div className="border-t border-sand-200">
        <MadeBy className="mx-auto max-w-5xl px-4 py-6 sm:px-6" />
      </div>
    </main>
  );
}
