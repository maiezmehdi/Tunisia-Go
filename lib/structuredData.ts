import type { Itinerary, Photo, Place } from '@/data/types';
import type { Locale } from '@/lib/i18n/config';
import { placeUpdated } from '@/data/contentDates';
import { placePath } from '@/lib/placePages';
import { hasRegionPage, regionPath, regionSlug } from '@/lib/regionPages';
import { designationsOf, heritageIn, placeGovernorate } from '@/lib/kg';
import { COUNTRY } from '@/data/kg/governorates';
import type { Heritage } from '@/data/kg/types';
import type { TunisiaEvent } from '@/data/events';
import { festivalOf } from '@/lib/kg/events';
import { LEGAL } from '@/lib/legal';
import { SITE_NAME, SITE_URL, localePath } from '@/lib/seo';

const abs = (path: string) => `${SITE_URL}${path}`;

/** Stable identifiers, so every page points to the same site and publisher. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const websiteId = (lang: Locale) => `${abs(localePath('/', lang))}#website`;

export function siteData(lang: Locale) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId(lang),
      name: SITE_NAME,
      url: abs(localePath('/', lang)),
      inLanguage: lang === 'en' ? 'en' : 'fr',
      publisher: { '@id': ORGANIZATION_ID },
      description:
        lang === 'en'
          ? 'Interactive map, road trips and local know-how for Tunisia.'
          : 'Carte interactive, road trips et conseils locaux pour la Tunisie.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: abs('/icons/icon-512.png'),
      email: LEGAL.email,
      // LinkedIn removed (Lot 4, OPEN-ISSUES § 8): the page could not be checked as belonging to Tunisia Go.
      sameAs: ['https://www.tiktok.com/@tunisiagoo', ...LEGAL.extraProfiles],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: LEGAL.email,
      },
      ...(LEGAL.addressParts && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: LEGAL.addressParts.street,
          addressLocality: LEGAL.addressParts.city,
          ...(LEGAL.addressParts.postalCode && {
            postalCode: LEGAL.addressParts.postalCode,
          }),
          ...(LEGAL.addressParts.region && {
            addressRegion: LEGAL.addressParts.region,
          }),
          addressCountry: 'TN',
        },
      }),
    },
  ];
}

/**
 * One JSON-LD identifier per place, whatever the language: the French canonical URL + `#place`
 * (LOT4-FINAL-ARCHITECTURE § 6). The English page keeps its English `url` but reuses this `@id`.
 */
export const placeId = (id: string) => abs(`${placePath(id)}#place`);
/** One identifier per road trip, on /explore and on the trip's own page. */
export const tripId = (id: string) => abs(`/road-trips/${id}#trip`);
const countryId = `${SITE_URL}/#country-tn`;
const govNodeId = (key: string) => `${SITE_URL}/#gov-${key.replace(/^gov:/, '')}`;

/** Governorate, then country, from the knowledge graph (data/kg/governorates.ts). */
function containedIn(placeKey: string, lang: Locale) {
  const g = placeGovernorate(placeKey);
  if (!g) return undefined;
  const base = g.regionNames[0];
  return {
    '@type': 'AdministrativeArea',
    '@id': govNodeId(g.id),
    name: g.name[lang],
    ...(hasRegionPage(base) && { url: abs(localePath(regionPath(base), lang)) }),
    containedInPlace: { '@type': 'Country', '@id': countryId, name: COUNTRY.name[lang] },
  };
}

const HERITAGE_TYPE: Record<Heritage['kind'], string> = {
  mosque: 'Mosque',
  museum: 'Museum',
  monument: 'LandmarksOrHistoricalBuildings',
  'archaeological-site': 'LandmarksOrHistoricalBuildings',
};

/**
 * Graph data of a place page: governorate, heritage items it contains, official statuses.
 * Only published relations (status `established`) reach this point (lib/kg `designationsOf`).
 */
function graphData(place: Place, lang: Locale) {
  const id = placeId(place.id);
  const heritage = heritageIn(place.id);
  const statuses = designationsOf(place.id);
  const area = containedIn(place.id, lang);
  return {
    ...(area && { containedInPlace: area }),
    ...(heritage.length && {
      containsPlace: heritage.map((h) => ({
        '@type': HERITAGE_TYPE[h.kind],
        '@id': `${id}-${h.id.replace(/^heritage:/, '')}`,
        name: h.name[lang],
        ...(h.officialUrl && { url: h.officialUrl }),
      })),
    }),
    ...(statuses.length && {
      subjectOf: statuses.map((d) => ({
        '@type': 'WebPage',
        name: d.name[lang],
        ...(d.officialUrl && { url: d.officialUrl }),
      })),
    }),
  };
}

function attraction(place: Place, photos: Photo[], lang: Locale) {
  return {
    '@type': 'TouristAttraction',
    '@id': placeId(place.id),
    name: place.name,
    ...(place.nameAr && { alternateName: place.nameAr }),
    description: place.tagline ? `${place.tagline}. ${place.description}` : place.description,
    url: abs(localePath(placePath(place.id), lang)),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: place.coords[0],
      longitude: place.coords[1],
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: place.region,
      addressCountry: 'TN',
    },
    ...(photos[0] && { image: photos[0].src }),
    ...(place.community?.tags?.length && {
      keywords: place.community.tags.join(', '),
    }),
  };
}

/** The map page: every place as a tourist attraction, and each road trip as a trip through them. */
export function exploreData(places: Place[], itineraries: Itinerary[], photos: Record<string, Photo[]>, lang: Locale) {
  const byId = new Map(places.map((p) => [p.id, p]));
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: lang === 'en' ? 'Places worth the drive in Tunisia' : 'Les lieux qui valent le détour en Tunisie',
      numberOfItems: places.length,
      itemListElement: places.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: attraction(p, photos[p.id] ?? [], lang),
      })),
    },
    ...itineraries.map((it) => ({
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      '@id': tripId(it.id),
      name: it.name,
      description: it.description,
      url: tripUrl(it.id, lang),
      touristType: 'Road trip',
      itinerary: {
        '@type': 'ItemList',
        numberOfItems: it.stops.length,
        itemListElement: it.stops
          .map((id) => byId.get(id))
          .filter((p): p is Place => !!p)
          .map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'TouristAttraction',
              name: p.name,
              '@id': placeId(p.id),
            },
          })),
      },
    })),
  ];
}

/** A place's own page: the attraction plus a breadcrumb back to the list of places. */
export function placePageData(place: Place, photos: Photo[], lang: Locale, description?: string) {
  return [
    {
      '@context': 'https://schema.org',
      ...attraction(place, photos, lang),
      ...graphData(place, lang),
      ...(description && { description }),
      inLanguage: lang,
      dateModified: placeUpdated(place.id),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE_NAME,
          item: abs(localePath('/', lang)),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: lang === 'en' ? 'Places' : 'Lieux',
          item: abs(localePath('/lieux', lang)),
        },
        // The region is resolved through its governorate, so « Kébili » (French catalogue) finds its page.
        ...(hasRegionPage(place.region)
          ? [{ name: place.region, item: abs(localePath(regionPath(place.region), lang)) }]
          : []),
        { name: place.name, item: abs(localePath(placePath(place.id), lang)) },
      ].map((entry, i) => ('@type' in entry ? entry : { '@type': 'ListItem', position: i + 1, ...entry })),
    },
  ];
}

const tripUrl = (id: string, lang: Locale) => abs(localePath(`/road-trips/${id}`, lang));

/** A road trip's own page: the trip through its stops, plus a breadcrumb back to the list of road trips. */
export function tripPageData(trip: Itinerary, stops: Place[], lang: Locale) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      '@id': tripId(trip.id),
      name: trip.name,
      description: trip.tagline ? `${trip.tagline}. ${trip.description}` : trip.description,
      url: tripUrl(trip.id, lang),
      inLanguage: lang,
      touristType: 'Road trip',
      itinerary: {
        '@type': 'ItemList',
        numberOfItems: stops.length,
        itemListElement: stops.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'TouristAttraction',
            name: p.name,
            url: abs(localePath(placePath(p.id), lang)),
            '@id': placeId(p.id),
          },
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE_NAME,
          item: abs(localePath('/', lang)),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Road trips',
          item: abs(localePath('/road-trips', lang)),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: trip.name,
          item: tripUrl(trip.id, lang),
        },
      ],
    },
  ];
}

/** Breadcrumb for a section page: home, then the page itself. */
export function sectionBreadcrumb(name: string, path: string, lang: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: abs(localePath('/', lang)),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name,
        item: abs(localePath(path, lang)),
      },
    ],
  };
}

/** « Que voir à… » page: the region's places as a list of tourist attractions, plus a breadcrumb. */
export function regionPageData(region: string, places: Place[], lang: Locale, name = region) {
  const url = abs(localePath(`/que-voir/${regionSlug(region)}`, lang));
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: lang === 'en' ? `What to see in ${name}` : `Que voir à ${name}`,
      url,
      numberOfItems: places.length,
      itemListElement: places.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'TouristAttraction',
          name: p.name,
          url: abs(localePath(placePath(p.id), lang)),
          '@id': placeId(p.id),
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE_NAME,
          item: abs(localePath('/', lang)),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: lang === 'en' ? 'Places' : 'Lieux',
          item: abs(localePath('/lieux', lang)),
        },
        { '@type': 'ListItem', position: 3, name, item: url },
      ],
    },
  ];
}

/** FAQPage markup for a list of questions and answers. */
export function faqData(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

/**
 * Event markup of /evenements. Only confirmed editions with a known place: an Event without a location
 * is not valid. The location reuses the place's `@id` (one node per place), and `superEvent` points to the
 * recurring festival when the edition is matched to it (lib/kg/events.ts).
 */
export function eventsData(events: TunisiaEvent[], places: Map<string, Place>, lang: Locale) {
  return events
    .filter((e) => e.confirmed && e.start && places.has(e.placeId))
    .map((e) => {
      const place = places.get(e.placeId)!;
      const festival = festivalOf({ id: e.id, placeId: e.placeId, titleFr: e.title.fr });
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: e.title[lang],
        description: e.description[lang],
        startDate: e.start,
        endDate: e.end,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          '@id': placeId(place.id),
          name: place.name,
          address: { '@type': 'PostalAddress', addressRegion: place.region, addressCountry: 'TN' },
          geo: { '@type': 'GeoCoordinates', latitude: place.coords[0], longitude: place.coords[1] },
        },
        ...(festival && {
          superEvent: {
            '@type': 'EventSeries',
            '@id': `${SITE_URL}/evenements#festival-${festival.id.replace(/^festival:/, '')}`,
            name: festival.name[lang],
          },
        }),
        url: `${SITE_URL}${localePath('/evenements', lang)}#${e.id}`,
      };
    });
}
