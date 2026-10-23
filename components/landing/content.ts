/**
 * Editorial copy for the landing page, in French and English. Places and road
 * trips themselves come from the locale catalog (lib/i18n/catalog.ts); this
 * file only adds the words and picks which spots illustrate each section.
 * Ids and cover choices are shared by both languages.
 */

import type { Locale } from '@/lib/i18n/config';

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

/** Road trips featured on the landing, in display order, with their cover spot. */
const TRIPS = [
  { id: 'roman-heritage', cover: 'dougga' },
  { id: 'star-wars', cover: 'mos-espa' },
  { id: 'cap-bon', cover: 'kelibia' },
  { id: 'sacred-medinas', cover: 'kairouan' },
] as const;

type TripId = (typeof TRIPS)[number]['id'];

const TRIP_TEXT: Record<Locale, Record<TripId, { kicker: string; text: string }>> = {
  fr: {
    'roman-heritage': {
      kicker: "L'Afrique romaine",
      text: "De Carthage à El Jem, cinq cités antiques : des forums perchés du Tell jusqu'à un colisée posé au milieu des oliviers.",
    },
    'star-wars': {
      kicker: 'Le Grand Sud',
      text: 'Sur les traces de Tatooine : le décor de Mos Espa, le lac salé de Luke, la maison troglodyte de Matmata et les greniers de Ksar Ouled Soltane.',
    },
    'cap-bon': {
      kicker: 'Le Cap Bon',
      text: 'Une boucle lente autour de la presqu’île : jasmin, harissa, poteries de Nabeul et criques turquoise sous le fort de Kélibia.',
    },
    'sacred-medinas': {
      kicker: 'Médinas & villes saintes',
      text: 'Treize siècles d’architecture, des souks de Tunis à la ville sainte de Kairouan, jusqu’à la presqu’île blanche de Mahdia.',
    },
  },
  en: {
    'roman-heritage': {
      kicker: 'Roman Africa',
      text: 'From Carthage to El Jem, five ancient cities: hilltop forums in the Tell, then a colosseum standing among the olive groves.',
    },
    'star-wars': {
      kicker: 'The Deep South',
      text: 'In the footsteps of Tatooine: the Mos Espa film set, Luke’s salt lake, the cave house of Matmata and the granaries of Ksar Ouled Soltane.',
    },
    'cap-bon': {
      kicker: 'Cap Bon',
      text: 'A slow loop around the peninsula: jasmine, harissa, the pottery of Nabeul and turquoise coves beneath the fort of Kelibia.',
    },
    'sacred-medinas': {
      kicker: 'Medinas & holy cities',
      text: 'Thirteen centuries of architecture, from the souks of Tunis to the holy city of Kairouan and on to the white peninsula of Mahdia.',
    },
  },
};

export const TRIP_STORIES: Record<Locale, TripStory[]> = {
  fr: TRIPS.map((t) => ({ ...t, ...TRIP_TEXT.fr[t.id] })),
  en: TRIPS.map((t) => ({ ...t, ...TRIP_TEXT.en[t.id] })),
};

export interface Vignette {
  id: string;
  caption: string;
}

/** Atlas spots, in display order. */
const ATLAS_IDS = [
  'sidi-bou-said',
  'chott-el-jerid',
  'matmata',
  'ksar-ouled-soltane',
  'dougga',
  'djerba',
  'el-jem',
  'chebika',
  'tozeur',
  'kelibia',
] as const;

type AtlasId = (typeof ATLAS_IDS)[number];

const ATLAS_CAPTIONS: Record<Locale, Record<AtlasId, string>> = {
  fr: {
    'sidi-bou-said': 'Le bleu de Sidi Bou Saïd',
    'chott-el-jerid': 'Le sel du Chott el Jerid',
    matmata: "L'immensité de Matmata",
    'ksar-ouled-soltane': 'Les greniers de Ksar Ouled Soltane',
    dougga: 'Les pierres de Dougga',
    djerba: 'La lumière de Djerba',
    'el-jem': "L'arène d'El Jem",
    chebika: 'La source de Chebika',
    tozeur: 'Les palmes de Tozeur',
    kelibia: 'Les eaux de Kélibia',
  },
  en: {
    'sidi-bou-said': 'The blue of Sidi Bou Said',
    'chott-el-jerid': 'The salt of Chott el Jerid',
    matmata: 'The vastness of Matmata',
    'ksar-ouled-soltane': 'The granaries of Ksar Ouled Soltane',
    dougga: 'The stones of Dougga',
    djerba: 'The light of Djerba',
    'el-jem': 'The arena of El Jem',
    chebika: 'The spring of Chebika',
    tozeur: 'The palms of Tozeur',
    kelibia: 'The waters of Kelibia',
  },
};

export const ATLAS: Record<Locale, Vignette[]> = {
  fr: ATLAS_IDS.map((id) => ({ id, caption: ATLAS_CAPTIONS.fr[id] })),
  en: ATLAS_IDS.map((id) => ({ id, caption: ATLAS_CAPTIONS.en[id] })),
};

/** Every spot the landing page needs a photo for (same in every language). */
export const LANDING_PLACE_IDS = Array.from(
  new Set<string>([...HERO_CANDIDATES, ...TRIPS.map((t) => t.cover), ...ATLAS_IDS]),
);

/* ------------------------------------------------------------------ */
/* Page copy                                                           */
/* ------------------------------------------------------------------ */

export interface LandingCopy {
  nav: { openMap: string; events: string };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: (spots: number, trips: number) => string;
    cta: string;
    readManifesto: string;
    scrollLabel: string;
    scroll: string;
  };
  manifesto: {
    label: string;
    /** Lead sentence, split around the emphasised words */
    leadBefore: string;
    leadEm: string;
    leadAfter: string;
    body: [string, string];
    figures: { spots: string; trips: string; categories: string };
  };
  escapes: {
    label: string;
    title: string;
    intro: string;
    meta: (days: number, stops: number, km: string) => string;
    seeTrip: string;
  };
  atlas: {
    label: string;
    title: (spots: number) => string;
    intro: string;
  };
  finale: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    body: string;
    cta: string;
    secondary: string;
  };
  footer: { tagline: string; credits: string };
  /** Short photo credit, e.g. "Photo: author · licence" */
  photoCredit: (author: string, license: string) => string;
}

export const LANDING_COPY: Record<Locale, LandingCopy> = {
  fr: {
    nav: { openMap: 'Ouvrir la carte', events: 'Événements' },
    hero: {
      eyebrow: 'Guide indépendant · Tunisie',
      titleLine1: 'La Tunisie,',
      titleLine2: 'l’autre voyage.',
      subtitle: (spots, trips) => `${spots} spots hors des sentiers battus, ${trips} grands road trips, zéro cliché.`,
      cta: 'Commencer l’exploration',
      readManifesto: 'Lire le manifeste',
      scrollLabel: 'Défiler vers le manifeste',
      scroll: 'Défiler',
    },
    manifesto: {
      label: 'Manifeste',
      leadBefore: 'Voyager en Tunisie, c’est bien plus qu’un transat face à la mer. C’est un pays de ',
      leadEm: 'trois mille ans',
      leadAfter: ', qu’on comprend à hauteur de route.',
      body: [
        'Tunisia Go est né d’une envie simple : remettre le voyage authentique au centre. Loin des circuits de masse et des buffets d’hôtel, on part sur les routes qu’empruntent les gens d’ici, vers les médinas où l’on vit encore, les oasis de montagne et les villages de potiers.',
        'Chaque adresse a été choisie par des passionnés, racontée avec son histoire, ses usages et sa table. Pas de classement, pas d’étoiles : seulement ce qui vaut le détour, et ce qu’il faut savoir pour y aller sans se presser.',
      ],
      figures: {
        spots: 'spots choisis à la main',
        trips: 'road trips détaillés',
        categories: 'univers, des ruines au désert',
      },
    },
    escapes: {
      label: 'Les échappées',
      title: 'Quatre routes, quatre façons de lire le pays.',
      intro: 'Choisissez une échappée : la carte s’ouvre directement sur l’itinéraire, étape par étape.',
      meta: (days, stops, km) => `${days} jours · ${stops} étapes · env. ${km}`,
      seeTrip: 'Voir l’itinéraire',
    },
    atlas: {
      label: 'L’atlas',
      title: (spots) => `Un pays en ${spots} fragments.`,
      intro:
        'Chaque spot a sa fiche : son histoire, ses coutumes, ce qu’on y mange, la meilleure saison et les contacts utiles pour s’y rendre.',
    },
    finale: {
      label: 'Le départ',
      titleLine1: 'La carte est prête.',
      titleLine2: 'La route aussi.',
      body: 'Explorez les spots sur la carte, filtrez par univers, suivez un road trip étape par étape et ouvrez la fiche complète de chaque lieu, côte à côte avec la carte.',
      cta: 'Lancer l’exploration',
      secondary: 'Ou commencer par le Grand Sud',
    },
    footer: {
      tagline: 'Guide indépendant de la Tunisie',
      credits: 'Crédits photo · Wikimedia Commons',
    },
    photoCredit: (author, license) => `Photo : ${author} · ${license}`,
  },
  en: {
    nav: { openMap: 'Open the map', events: 'Events' },
    hero: {
      eyebrow: 'Independent guide · Tunisia',
      titleLine1: 'Tunisia,',
      titleLine2: 'the other journey.',
      subtitle: (spots, trips) => `${spots} spots off the beaten track, ${trips} great road trips, not a single cliché.`,
      cta: 'Start exploring',
      readManifesto: 'Read the manifesto',
      scrollLabel: 'Scroll to the manifesto',
      scroll: 'Scroll',
    },
    manifesto: {
      label: 'Manifesto',
      leadBefore: 'Travelling in Tunisia is far more than a sun lounger facing the sea. It is a country ',
      leadEm: 'three thousand years',
      leadAfter: ' in the making, best understood from the road.',
      body: [
        'Tunisia Go began with a simple wish: to put authentic travel back at the centre. Far from mass-market tours and hotel buffets, we take the roads local people take, towards medinas that are still lived in, mountain oases and potters’ villages.',
        'Every address was chosen by people who love it, and comes with its history, its customs and its food. No rankings, no stars: only what is worth the detour, and what you need to know to get there without rushing.',
      ],
      figures: {
        spots: 'hand-picked spots',
        trips: 'detailed road trips',
        categories: 'worlds, from ruins to desert',
      },
    },
    escapes: {
      label: 'The escapes',
      title: 'Four roads, four ways to read the country.',
      intro: 'Pick an escape: the map opens straight onto the route, stop by stop.',
      meta: (days, stops, km) => `${days} days · ${stops} stops · approx. ${km}`,
      seeTrip: 'See the route',
    },
    atlas: {
      label: 'The atlas',
      title: (spots) => `A country in ${spots} fragments.`,
      intro:
        'Every spot has its own page: its history, its customs, what to eat there, the best season and the contacts you need to get there.',
    },
    finale: {
      label: 'Setting off',
      titleLine1: 'The map is ready.',
      titleLine2: 'So is the road.',
      body: 'Explore the spots on the map, filter by theme, follow a road trip stop by stop and open each place’s full page, side by side with the map.',
      cta: 'Start exploring',
      secondary: 'Or begin with the Deep South',
    },
    footer: {
      tagline: 'An independent guide to Tunisia',
      credits: 'Photo credits · Wikimedia Commons',
    },
    photoCredit: (author, license) => `Photo: ${author} · ${license}`,
  },
};
