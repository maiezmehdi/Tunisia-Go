/**
 * Editorial copy for the landing page (in French). Places and road trips
 * themselves come from data/tunisiaData.ts; this file only adds the words
 * and picks which spots illustrate each section.
 */

/** Hero photo: the first of these spots that has a photo is used. */
export const HERO_CANDIDATES = ['douz', 'dougga', 'chott-el-jerid', 'ksar-ouled-soltane'];

export interface TripStory {
  /** Itinerary id in data/tunisiaData.ts */
  id: string;
  /** Spot whose photo illustrates the card */
  cover: string;
  kicker: string;
  text: string;
}

export const TRIP_STORIES: TripStory[] = [
  {
    id: 'roman-heritage',
    cover: 'dougga',
    kicker: "L'Afrique romaine",
    text: "De Carthage à El Jem, cinq cités antiques : des forums perchés du Tell jusqu'à un colisée posé au milieu des oliviers.",
  },
  {
    id: 'star-wars',
    cover: 'mos-espa',
    kicker: 'Le Grand Sud',
    text: 'Sur les traces de Tatooine : le décor de Mos Espa, le lac salé de Luke, la maison troglodyte de Matmata et les greniers de Ksar Ouled Soltane.',
  },
  {
    id: 'cap-bon',
    cover: 'kelibia',
    kicker: 'Le Cap Bon',
    text: 'Une boucle lente autour de la presqu’île : jasmin, harissa, poteries de Nabeul et criques turquoise sous le fort de Kélibia.',
  },
  {
    id: 'sacred-medinas',
    cover: 'kairouan',
    kicker: 'Médinas & villes saintes',
    text: 'Treize siècles d’architecture, des souks de Tunis à la ville sainte de Kairouan, jusqu’à la presqu’île blanche de Mahdia.',
  },
];

export interface Vignette {
  id: string;
  caption: string;
}

export const ATLAS: Vignette[] = [
  { id: 'sidi-bou-said', caption: 'Le bleu de Sidi Bou Saïd' },
  { id: 'chott-el-jerid', caption: 'Le sel du Chott el Jerid' },
  { id: 'matmata', caption: "L'immensité de Matmata" },
  { id: 'ksar-ouled-soltane', caption: 'Les greniers de Ksar Ouled Soltane' },
  { id: 'dougga', caption: 'Les pierres de Dougga' },
  { id: 'djerba', caption: 'La lumière de Djerba' },
  { id: 'el-jem', caption: "L'arène d'El Jem" },
  { id: 'chebika', caption: 'La source de Chebika' },
  { id: 'tozeur', caption: 'Les palmes de Tozeur' },
  { id: 'kelibia', caption: 'Les eaux de Kélibia' },
];

/** Every spot the landing page needs a photo for. */
export const LANDING_PLACE_IDS = Array.from(
  new Set([...HERO_CANDIDATES, ...TRIP_STORIES.map((t) => t.cover), ...ATLAS.map((v) => v.id)]),
);
