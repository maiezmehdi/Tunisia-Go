/**
 * Best periods to visit each place, one letter per month from January to December:
 *   B = best, o = fine, x = better avoided (heat, cold sea, closures).
 *
 * Desert spots are best from autumn to spring and harsh in summer (the Chott el Jerid
 * passes 45 °C in July). Inland Roman sites and the mountain oases shine in spring.
 * The coast is for June to September.
 */
export type SeasonRating = 'best' | 'fine' | 'avoid';

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

//                          JFMAMJJASOND
const COAST_SWIM = /*    */ 'xxooBBBBBoxx';
const COAST_TOWN = /*    */ 'ooBBBoooBBoo';
const INLAND_RUINS = /*  */ 'ooBBBoxxoBBo';
const DESERT = /*        */ 'BBBBoxxxoBBB';
const CITY = /*          */ 'ooBBBooooBBo';
const ALL_YEAR = /*      */ 'oooooooooooo';

const RAW: Record<string, string> = {
  carthage: CITY,
  'sidi-bou-said': 'ooBBBBoooBBo',
  'medina-tunis': CITY,
  bardo: ALL_YEAR,
  'marche-central': ALL_YEAR,
  dougga: 'ooBBBoxxoBoo',
  'bulla-regia': INLAND_RUINS,
  tabarka: 'xxooBBBBBBoo',
  kairouan: 'BBBBoxxxoBBB',
  sbeitla: INLAND_RUINS,
  'el-jem': 'ooBBBoBBoBBo',
  'sousse-medina': COAST_TOWN,
  monastir: COAST_TOWN,
  mahdia: COAST_SWIM,
  'sfax-medina': 'ooBBooxxoBBo',
  hammamet: COAST_SWIM,
  nabeul: 'ooBBoooooBBo',
  kelibia: COAST_SWIM,
  'el-haouaria': 'xoBBBBoooBox',
  tozeur: DESERT,
  'mos-espa': DESERT,
  chebika: 'oBBBBxxxoBBo',
  'chott-el-jerid': 'BBBBoxxxxBBB',
  douz: 'BBBooxxxxoBB',
  matmata: DESERT,
  'ksar-ouled-soltane': 'oBBBoxxxoBoo',
  djerba: 'xoooBBBBBBox',
  'el-ghriba': ALL_YEAR,
  guellala: ALL_YEAR,
  kerkennah: COAST_SWIM,
  'ghar-el-melh': 'xxooBBBBBoxx',
  korbous: 'ooBBBooooBBo',
  zarzis: 'xoooBBBBBBox',
  'souk-el-attarine': CITY,
  'houmt-souk': 'ooBBBoooBBBo',
  'nabeul-market': 'ooBBoooooBBo',
  'kairouan-souks': 'BBBBoxxxoBBB',
  'gabes-jara': 'BBBBoxxxoBBB',
  utique: 'ooBBBoxxoBBo',
  bizerte: 'xxooBBBBBBoo',
  ichkeul: 'BBBBooooooBB',
  sejnane: 'ooBBBooooBBo',
  'ain-draham': 'xxoBBBBBBBoo',
  oudna: 'ooBBBoxxoBBo',
  zaghouan: 'ooBBBoxxoBBo',
  'thuburbo-majus': 'ooBBBoxxoBBo',
  testour: 'ooBBBoooBBoo',
  makthar: 'ooBBBBooBBBo',
  'el-kef': 'ooBBBBooBBBo',
  chemtou: 'ooBBBoxxoBBo',
  tamerza: 'BBBBoxxxoBBB',
  nefta: 'BBBBoxxxoBBB',
  chenini: 'BBBBoxxxoBBB',
  gammarth: 'xxooBBBBBoxx',
  kerkouane: 'ooBBBBoooBBo',
  takrouna: 'ooBBBoooBBBo',
  'cap-serrat': 'xxooBBBBBoxx',
  'cap-angela': 'ooBBBBBBBBoo',
  rafraf: 'xxooBBBBBoxx',
  'sidi-ali-el-mekki': 'xxooBBBBBoxx',
  'table-de-jugurtha': 'ooBBBBoxoBBo',
  kesra: 'ooBBBBBoBBoo',
  haidra: 'ooBBBoxxoBBo',
  hergla: 'ooBBBBBBBBoo',
  kuriat: 'xxxxoBBBBoxx',
  salakta: 'ooBBBBBBBBoo',
  thyna: 'ooBBBoooBBBo',
  'lezard-rouge': 'BBBBoxxxoBBB',
  'gafsa-piscines': 'BBBBoxxxoBBB',
  'bou-hedma': 'BBBBoxxxoBBB',
  mides: 'BBBBoxxxoBBB',
  jebil: 'BBBoxxxxxoBB',
  'chenini-gabes': 'BBBBBoooBBBB',
  tamezret: 'BBBBoxxxoBBB',
  toujane: 'BBBBoxxxoBBB',
  'ksar-hadada': 'oBBBoxxxoBoo',
  'ksar-ouled-debbab': 'oBBBoxxxoBoo',
  douiret: 'BBBBoxxxoBBB',
  djerbahood: 'ooBBBBoooBBo',
  'camping-douz': 'BBBoxxxxoBBB',
  'camping-tozeur': 'BBBBoxxxoBBB',
  'camping-gafsa': 'BBBBoxxxoBBB',
  'camping-el-kahena': 'xoBBBBBBBBox',
};

const LETTER: Record<string, SeasonRating> = { B: 'best', o: 'fine', x: 'avoid' };

export const SEASONS: Record<string, SeasonRating[]> = Object.fromEntries(
  Object.entries(RAW).map(([id, months]) => [id, months.split('').map((m) => LETTER[m] ?? 'fine')]),
);

/** Rating for a place in a month (0 = January). Places without data count as fine. */
export function seasonFor(placeId: string, month: number): SeasonRating {
  return SEASONS[placeId]?.[month] ?? 'fine';
}

const FR_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const FR_MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/**
 * Summary of the best months: "Mar to May, Oct to Nov" in English,
 * "mars à mai, oct. à nov." in French, "All year" / "toute l’année" when flat.
 */
export function bestMonthsLabel(placeId: string, locale: 'en' | 'fr' = 'en'): string {
  const allYear = locale === 'fr' ? 'toute l’année' : 'All year';
  const months = SEASONS[placeId];
  if (!months) return allYear;
  if (months.every((m) => m === months[0])) return allYear;
  return formatMonthRanges(
    months.map((m) => m === 'best'),
    locale,
  );
}

/** "mars à mai, oct. à nov." for the months flagged true (0 = January). */
export function formatMonthRanges(flags: boolean[], locale: 'en' | 'fr' = 'en'): string {
  if (flags.every(Boolean)) return locale === 'fr' ? 'toute l’année' : 'All year';
  const ranges: [number, number][] = [];
  flags.forEach((on, i) => {
    if (!on) return;
    const last = ranges[ranges.length - 1];
    if (last && last[1] === i - 1) last[1] = i;
    else ranges.push([i, i]);
  });
  // Join a range that wraps around December into January.
  if (ranges.length > 1 && ranges[0][0] === 0 && ranges[ranges.length - 1][1] === 11) {
    const first = ranges.shift()!;
    ranges[ranges.length - 1][1] = first[1];
  }
  if (locale === 'fr') {
    const full = (i: number) => FR_MONTHS[i];
    const short = (i: number) => FR_SHORT[i];
    return ranges.map(([a, b]) => (a === b ? full(a) : `${short(a)} à ${short(b)}`)).join(', ');
  }
  const short = (i: number) => MONTHS[i].slice(0, 3);
  return ranges.map(([a, b]) => (a === b ? MONTHS[a] : `${short(a)} to ${short(b)}`)).join(', ');
}

/**
 * Best months for a whole trip: no stop to avoid, and at least half the stops at their best.
 * Null when no month fits.
 */
export function tripBestMonthsLabel(placeIds: string[], locale: 'en' | 'fr' = 'en'): string | null {
  if (placeIds.length === 0) return null;
  const flags = MONTHS.map((_, m) => {
    const ratings = placeIds.map((id) => seasonFor(id, m));
    if (ratings.includes('avoid')) return false;
    return ratings.filter((r) => r === 'best').length * 2 >= ratings.length;
  });
  return flags.some(Boolean) ? formatMonthRanges(flags, locale) : null;
}
