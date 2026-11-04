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
        title: 'Tunisia Go · Road trips, hidden places and map of Tunisia',
        description:
          'Plan your trip to Tunisia: off-the-beaten-track places, day-by-day road trips, an interactive map, local tips and guides.',
      })
    : pageMetadata({
        lang: 'fr',
        path: '/',
        title: 'Tunisia Go · Road trips et lieux secrets de la Tunisie',
        description:
          'Préparez votre voyage en Tunisie : lieux hors des sentiers battus, road trips jour par jour, carte interactive, conseils locaux et guides.',
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
