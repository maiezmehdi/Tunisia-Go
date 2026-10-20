import type { Itinerary, Photo, Place } from '@/data/types';
import type { Locale } from '@/lib/i18n/config';
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
    },
  ];
}

function attraction(place: Place, photos: Photo[], lang: Locale) {
  return {
    '@type': 'TouristAttraction',
    '@id': abs(`${localePath('/explore', lang)}?place=${place.id}#place`),
    name: place.name,
    ...(place.nameAr && { alternateName: place.nameAr }),
    description: place.tagline ? `${place.tagline}. ${place.description}` : place.description,
    url: abs(`${localePath('/explore', lang)}?place=${place.id}`),
    geo: { '@type': 'GeoCoordinates', latitude: place.coords[0], longitude: place.coords[1] },
    address: { '@type': 'PostalAddress', addressRegion: place.region, addressCountry: 'TN' },
    ...(photos[0] && { image: photos[0].src }),
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
      url: abs(`${localePath('/explore', lang)}?trip=${it.id}`),
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
              '@id': abs(`${localePath('/explore', lang)}?place=${p.id}#place`),
            },
          })),
      },
    })),
  ];
}
