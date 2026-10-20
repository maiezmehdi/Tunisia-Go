import type { Metadata } from 'next';

import Explorer from '@/components/Explorer';
import { PLACES } from '@/data/tunisiaData';
import { loadCommunityPlaces } from '@/lib/community';
import { isLocale } from '@/lib/i18n/config';
import { loadPhotos } from '@/lib/photos';

// Photos come from Wikimedia Commons and are refreshed once a day. Approving a place on the
// moderation page rebuilds this page right away.
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === 'en' ? 'Map · Tunisia Go' : 'Carte · Tunisia Go' };
}

export default async function ExplorePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const [photos, community] = await Promise.all([loadPhotos(PLACES), loadCommunityPlaces(isLocale(lang) ? lang : 'fr')]);
  return <Explorer photos={{ ...photos, ...community.photos }} community={community.places} />;
}
