import type { Metadata } from 'next';

import Landing from '@/components/landing/Landing';
import { LANDING_PLACE_IDS } from '@/components/landing/content';
import { PLACE_BY_ID } from '@/data/tunisiaData';
import type { Place } from '@/data/types';
import { loadPhotos } from '@/lib/photos';

// Photos come from Wikimedia Commons and are refreshed once a day.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Tunisia Go · La Tunisie, l'autre voyage",
  description:
    'Spots hors des sentiers battus, grands road trips et carte interactive pour découvrir la Tunisie autrement.',
};

export default async function HomePage() {
  const places = LANDING_PLACE_IDS.map((id) => PLACE_BY_ID[id]).filter((p): p is Place => !!p);
  const photos = await loadPhotos(places);
  return <Landing photos={photos} />;
}
