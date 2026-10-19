import Explorer from '@/components/Explorer';
import { PLACES } from '@/data/tunisiaData';
import { loadPhotos } from '@/lib/photos';

// Photos come from Wikimedia Commons and are refreshed once a day.
export const revalidate = 86400;

export const metadata = { title: 'Carte · Tunisia Go' };

export default async function ExplorePage() {
  const photos = await loadPhotos(PLACES);
  return <Explorer photos={photos} />;
}
