import type { Metadata } from 'next';

import Explorer from '@/components/Explorer';
import { PLACES } from '@/data/tunisiaData';
import { loadCommunityPlaces } from '@/lib/community';
import { isLocale } from '@/lib/i18n/config';
import { loadPhotos } from '@/lib/photos';
import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { getCatalog } from '@/lib/i18n/catalog';
import { exploreData } from '@/lib/structuredData';

// Photos come from Wikimedia Commons and are refreshed once a day. Approving a place on the
// moderation page rebuilds this page right away.
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return lang === 'en'
    ? pageMetadata({
        lang: 'en',
        path: '/explore',
        title: 'Interactive map of Tunisia · Tunisia Go',
        description:
          'Roman ruins, Sahara dunes, beaches, medinas and food: places worth the drive across Tunisia, with road trips, best seasons and directions.',
      })
    : pageMetadata({
        lang: 'fr',
        path: '/explore',
        title: 'Carte interactive de la Tunisie · Tunisia Go',
        description:
          'Ruines romaines, dunes du Sahara, plages, médinas et cuisine : les lieux qui valent le détour en Tunisie, avec road trips, saisons et itinéraires.',
      });
}

export default async function ExplorePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const [photos, community] = await Promise.all([
    loadPhotos(PLACES),
    loadCommunityPlaces(isLocale(lang) ? lang : 'fr'),
  ]);
  const locale = isLocale(lang) ? lang : 'fr';
  const catalog = getCatalog(locale);
  return (
    <>
      <JsonLd data={exploreData(catalog.places, catalog.itineraries, photos, locale)} />
      <Explorer photos={{ ...photos, ...community.photos }} community={community.places} />
    </>
  );
}
