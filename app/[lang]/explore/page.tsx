import type { Metadata } from 'next';

import Explorer from '@/components/Explorer';
import { PLACES } from '@/data/tunisiaData';
import { loadPhotos } from '@/lib/photos';

// Photos come from Wikimedia Commons and are refreshed once a day.
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === 'en' ? 'Map · Tunisia Go' : 'Carte · Tunisia Go' };
}

export default async function ExplorePage() {
  const photos = await loadPhotos(PLACES);
  return <Explorer photos={photos} />;
}
