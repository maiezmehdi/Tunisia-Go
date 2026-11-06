import type { Itinerary, Photo, Place } from '@/data/types';
import type { Locale } from '@/lib/i18n/config';
import { CONTENT_UPDATED, placePath } from '@/lib/placePages';
import { regionSlug } from '@/lib/regionPages';
import { LEGAL } from '@/lib/legal';
import { SITE_NAME, SITE_URL, localePath } from '@/lib/seo';

const abs = (path: string) => `${SITE_URL}${path}`;

export function siteData(lang: Locale) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: abs(localePath('/', lang)),
      inLanguage: lang === 'en' ? 'en' : 'fr',
      description:
        lang === 'en'
          ? 'Interactive map, road trips and local know-how for Tunisia.'
          : 'Carte interactive, road trips et conseils locaux pour la Tunisie.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: abs('/icons/icon-512.png'),
      email: LEGAL.email,
      sameAs: [
        'https://www.tiktok.com/@tunisiagoo',
        'https://www.linkedin.com/company/tunisiagoo',
        ...LEGAL.extraProfiles,
      ],
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

function attraction(place: Place, photos: Photo[], lang: Locale) {
  return {
    '@type': 'TouristAttraction',
    '@id': abs(`${localePath(placePath(place.id), lang)}#place`),
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
              '@id': abs(`${localePath(placePath(p.id), lang)}#place`),
            },
          })),
      },
    })),
  ];
}

/** A place's own page: the attraction plus a breadcrumb back to the list of places. */
export function placePageData(place: Place, photos: Photo[], lang: Locale) {
  return [
    {
      '@context': 'https://schema.org',
      ...attraction(place, photos, lang),
      inLanguage: lang,
      dateModified: CONTENT_UPDATED,
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
        {
          '@type': 'ListItem',
          position: 3,
          name: place.name,
          item: abs(localePath(placePath(place.id), lang)),
        },
      ],
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
            '@id': abs(`${localePath(placePath(p.id), lang)}#place`),
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
export function regionPageData(region: string, places: Place[], lang: Locale) {
  const url = abs(localePath(`/que-voir/${regionSlug(region)}`, lang));
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: lang === 'en' ? `What to see in ${region}` : `Que voir à ${region}`,
      url,
      numberOfItems: places.length,
      itemListElement: places.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'TouristAttraction',
          name: p.name,
          url: abs(localePath(placePath(p.id), lang)),
          '@id': abs(`${localePath(placePath(p.id), lang)}#place`),
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
        { '@type': 'ListItem', position: 3, name: region, item: url },
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
