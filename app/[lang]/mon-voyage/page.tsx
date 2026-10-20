import type { Metadata } from 'next';

import MyTripView from '@/components/trip/MyTripView';
import { PLACES } from '@/data/tunisiaData';
import { loadCommunityPlaces } from '@/lib/community';
import { isLocale } from '@/lib/i18n/config';
import { loadPhotos } from '@/lib/photos';
import { pageMetadata } from '@/lib/seo';

// Same data as the map: photos refreshed daily, community places rebuilt on approval.
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const en = lang === 'en';
  // Each visitor's own trip: shareable, but not a page for search engines.
  return pageMetadata({
    lang: en ? 'en' : 'fr',
    path: '/mon-voyage',
    title: en ? 'My road trip · Tunisia Go' : 'Mon road trip · Tunisia Go',
    description: en
      ? 'Your own Tunisian road trip: the places you picked, the route, a link to share and a PDF for the road.'
      : 'Votre road trip en Tunisie : les lieux choisis, l’itinéraire, un lien à partager et un PDF pour la route.',
    index: false,
  });
}

export default async function MyTripPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const [photos, community] = await Promise.all([
    loadPhotos(PLACES),
    loadCommunityPlaces(isLocale(lang) ? lang : 'fr'),
  ]);
  return <MyTripView photos={{ ...photos, ...community.photos }} community={community.places} />;
}
