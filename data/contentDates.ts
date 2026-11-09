import { CONTENT_UPDATED } from '@/lib/placePages';

/**
 * When each page's text last changed, for the sitemap `lastmod` and the « Fiche mise à jour » line.
 * Places and road trips not listed here date from the review of 2026-10-21 (CONTENT_UPDATED).
 * Add or bump a line when a text is added or rewritten (YYYY-MM-DD).
 */
const PLACE_UPDATED: Record<string, string> = {
  'ksar-ghilane': '2026-10-23',
  'djerba-velo': '2026-10-23',
  'utique': '2026-10-25',
  'bizerte': '2026-10-25',
  'ichkeul': '2026-10-25',
  'sejnane': '2026-10-25',
  'ain-draham': '2026-10-25',
  'oudna': '2026-10-25',
  'zaghouan': '2026-10-25',
  'thuburbo-majus': '2026-10-25',
  'testour': '2026-10-25',
  'makthar': '2026-10-25',
  'el-kef': '2026-10-25',
  'chemtou': '2026-10-25',
  'tamerza': '2026-10-25',
  'nefta': '2026-10-25',
  'chenini': '2026-10-25',
  'gammarth': '2026-10-25',
  'kerkouane': '2026-11-03',
  'takrouna': '2026-11-03',
  'cap-serrat': '2026-11-03',
  'cap-angela': '2026-11-03',
  'rafraf': '2026-11-03',
  'sidi-ali-el-mekki': '2026-11-03',
  'table-de-jugurtha': '2026-11-03',
  'kesra': '2026-11-03',
  'haidra': '2026-11-03',
  'hergla': '2026-11-03',
  'kuriat': '2026-11-03',
  'salakta': '2026-11-03',
  'thyna': '2026-11-03',
  'lezard-rouge': '2026-11-03',
  'gafsa-piscines': '2026-11-03',
  'bou-hedma': '2026-11-03',
  'mides': '2026-11-03',
  'jebil': '2026-11-03',
  'chenini-gabes': '2026-11-03',
  'tamezret': '2026-11-03',
  'toujane': '2026-11-03',
  'ksar-hadada': '2026-11-03',
  'ksar-ouled-debbab': '2026-11-03',
  'douiret': '2026-11-03',
  'djerbahood': '2026-11-03',
  'camping-douz': '2026-11-03',
  'camping-tozeur': '2026-11-03',
  'camping-gafsa': '2026-11-03',
  'camping-el-kahena': '2026-11-03',
  'bou-kornine': '2026-11-03',
  'el-feidja': '2026-11-03',
  'la-goulette': '2026-11-03',
  'lamta': '2026-11-03',
  'beni-khedache': '2026-11-03',
  'mareth': '2026-11-03',
  'dar-jellouli': '2026-11-05',
  'sebkhet-kelbia': '2026-11-05',
  'djebel-zaghouan': '2026-11-05',
  'el-hamma': '2026-11-05',
};

const TRIP_UPDATED: Record<string, string> = {
  'ksour-route': '2026-11-03',
  'mountain-oases': '2026-11-03',
  'deep-south-4x4': '2026-11-03',
  'wild-north': '2026-11-03',
  'high-tell': '2026-11-03',
  'djerba-slow': '2026-11-03',
  'tunis-bay': '2026-11-05',
  'around-tunis': '2026-11-05',
  'bizerte-lagoon': '2026-11-05',
  'north-west-marble': '2026-11-05',
  'wild-cap-bon': '2026-11-05',
  'quiet-sahel': '2026-11-05',
  'sfax-kerkennah': '2026-11-05',
  'gabes-sea-mountains': '2026-11-05',
  'gafsa-savanna': '2026-11-05',
  'grand-tour': '2026-11-05',
};

const latest = (dates: string[]) => dates.reduce((a, b) => (b > a ? b : a), CONTENT_UPDATED);

export const placeUpdated = (id: string): string => latest([PLACE_UPDATED[id] ?? CONTENT_UPDATED]);
export const tripUpdated = (id: string): string => latest([TRIP_UPDATED[id] ?? CONTENT_UPDATED]);
/** A page that lists several places changes when any of them does. */
export const placesUpdated = (ids: string[]): string => latest(ids.map(placeUpdated));
export const allPlacesUpdated = (): string => latest(Object.values(PLACE_UPDATED));
export const allTripsUpdated = (): string => latest(Object.values(TRIP_UPDATED));
