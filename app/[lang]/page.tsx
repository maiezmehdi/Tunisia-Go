import type { Metadata } from 'next';

import Landing from '@/components/landing/Landing';
import { LANDING_PLACE_IDS } from '@/components/landing/content';
import { PLACE_BY_ID } from '@/data/tunisiaData';
import type { Place } from '@/data/types';
import { loadPhotos } from '@/lib/photos';
import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { siteData } from '@/lib/structuredData';

// Photos come from Wikimedia Commons and are refreshed once a day.
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return lang === 'en'
    ? pageMetadata({
        lang: 'en',
        path: '/',
        title: 'Tunisia Go · Tunisia, the other journey',
        description: 'Off-the-beaten-track places, great road trips and an interactive map to see Tunisia differently.',
      })
    : pageMetadata({
        lang: 'fr',
        path: '/',
        title: 'Tunisia Go · La Tunisie, l’autre voyage',
        description:
          'Lieux hors des sentiers battus, grands road trips et carte interactive pour découvrir la Tunisie autrement.',
      });
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const places = LANDING_PLACE_IDS.map((id) => PLACE_BY_ID[id]).filter((p): p is Place => !!p);
  const photos = await loadPhotos(places);
  return (
    <>
      <JsonLd data={siteData(lang === 'en' ? 'en' : 'fr')} />
      <Landing photos={photos} />
    </>
  );
}
