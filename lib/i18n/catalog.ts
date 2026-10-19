import { CATEGORIES_FR, ITINERARIES_FR } from '@/data/i18n/catalog.fr';
import { PLACES_FR_A } from '@/data/i18n/places.fr.a';
import { PLACES_FR_B } from '@/data/i18n/places.fr.b';
import { CATEGORIES, ITINERARIES, PLACES } from '@/data/tunisiaData';
import type { Category, CategoryId, Itinerary, Place } from '@/data/types';
import type { Locale } from '@/lib/i18n/config';

const PLACES_FR = { ...PLACES_FR_A, ...PLACES_FR_B };

/** Places, road trips and categories in one language. */
export interface Catalog {
  places: Place[];
  placeById: Record<string, Place>;
  itineraries: Itinerary[];
  categories: Category[];
  categoryById: Record<CategoryId, Category>;
}

function build(locale: Locale): Catalog {
  const places =
    locale === 'en'
      ? PLACES
      : PLACES.map((p): Place => {
          const fr = PLACES_FR[p.id];
          if (!fr) return p;
          return {
            ...p,
            name: fr.name ?? p.name,
            region: fr.region ?? p.region,
            tagline: fr.tagline,
            description: fr.description,
            didYouKnow: fr.didYouKnow,
            insights: fr.insights,
            visitDuration: fr.visitDuration,
            images: p.images.map((img, i) => ({ caption: fr.captions[i] ?? img.caption })),
          };
        });
  const itineraries =
    locale === 'en' ? ITINERARIES : ITINERARIES.map((it) => ({ ...it, ...(ITINERARIES_FR[it.id] ?? {}) }));
  const categories = locale === 'en' ? CATEGORIES : CATEGORIES.map((c) => ({ ...c, ...CATEGORIES_FR[c.id] }));
  return {
    places,
    placeById: Object.fromEntries(places.map((p) => [p.id, p])),
    itineraries,
    categories,
    categoryById: Object.fromEntries(categories.map((c) => [c.id, c])) as Record<CategoryId, Category>,
  };
}

const cache: Partial<Record<Locale, Catalog>> = {};

export function getCatalog(locale: Locale): Catalog {
  return (cache[locale] ??= build(locale));
}
