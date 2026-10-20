import { LEXICON, type Word } from '@/data/lexicon';
import { GENERAL_GUIDE, guideAnchor, guideFor, regionGuides } from '@/data/regionGuides';
import { bestMonthsLabel, seasonFor } from '@/data/seasons';
import type { CategoryId, Place } from '@/data/types';
import { summarizeRoute } from '@/lib/geo';
import { getCatalog } from '@/lib/i18n/catalog';
import type { Locale } from '@/lib/i18n/config';

import { STOPWORDS, normalize, similar, stem, tokenize } from './text';

/**
 * The travel assistant runs entirely in the browser: no language model, no server.
 * It understands the visitor through keywords (with typos and plurals tolerated) and answers
 * only with what the site already holds: places, road trips, regional guides and words.
 */

export type ZoneId = 'nord' | 'capbon' | 'centre' | 'sud';
type Step = 'days' | 'cats' | 'zone' | 'month';

export interface Profile {
  days?: number;
  cats: CategoryId[];
  zones: ZoneId[];
  /** 0 = January; null means "no idea yet". */
  month?: number | null;
  /** The question waiting for an answer in the guided road trip. */
  step?: Step | null;
  /** Changing one answer after a proposal: recompute right after it. */
  revise?: boolean;
}

export type Action =
  | { type: 'menu' }
  | { type: 'trip' }
  | { type: 'idea' }
  | { type: 'tips'; zone?: ZoneId }
  | { type: 'words' }
  | { type: 'set'; patch: Partial<Profile> }
  | { type: 'change'; step: Step };

export interface Chip {
  label: string;
  action: Action;
}

export interface Reply {
  text: string;
  /** Places shown as cards. */
  places?: string[];
  /** An ordered road trip, with a button to add every stop. */
  trip?: string[];
  /** A ready-made road trip of the site worth opening. */
  itinerary?: string;
  notes?: { guide: string; guideTitle: string; title: string; text: string }[];
  words?: Word[];
  links?: { label: string; href: string }[];
  chips?: Chip[];
}

export const EMPTY_PROFILE: Profile = { cats: [], zones: [] };

// ── Geography ─────────────────────────────────────────────────────────────

const ZONE_PLACES: Record<ZoneId, string[]> = {
  nord: [
    'carthage',
    'sidi-bou-said',
    'medina-tunis',
    'bardo',
    'marche-central',
    'souk-el-attarine',
    'dougga',
    'bulla-regia',
    'tabarka',
    'ghar-el-melh',
  ],
  capbon: ['hammamet', 'nabeul', 'nabeul-market', 'kelibia', 'el-haouaria', 'korbous'],
  centre: [
    'kairouan',
    'kairouan-souks',
    'sbeitla',
    'el-jem',
    'sousse-medina',
    'monastir',
    'mahdia',
    'sfax-medina',
    'kerkennah',
  ],
  sud: [
    'tozeur',
    'mos-espa',
    'chebika',
    'chott-el-jerid',
    'douz',
    'matmata',
    'ksar-ouled-soltane',
    'gabes-jara',
    'djerba',
    'el-ghriba',
    'guellala',
    'houmt-souk',
    'zarzis',
  ],
};
const ZONES = Object.keys(ZONE_PLACES) as ZoneId[];
const ZONE_OF: Record<string, ZoneId> = Object.fromEntries(
  ZONES.flatMap((z) => ZONE_PLACES[z].map((id) => [id, z] as const)),
);
const NEIGHBOURS: Record<ZoneId, ZoneId[]> = {
  nord: ['capbon', 'centre'],
  capbon: ['nord', 'centre'],
  centre: ['capbon', 'sud', 'nord'],
  sud: ['centre'],
};
const ZONE_GUIDES: Record<ZoneId, string[]> = {
  nord: ['tunis'],
  capbon: ['cap-bon'],
  centre: ['sahel'],
  sud: ['djerid', 'sud', 'djerba'],
};

// ── Words the assistant listens for ──────────────────────────────────────

const CATEGORY_WORDS: Record<CategoryId, string> = {
  heritage:
    'histoire history historique historic ruine ruines ruins romain romains roman romans rome antique antiquite ancient ' +
    'archeologie archeologique archeology archaeology patrimoine heritage unesco amphitheatre colisee colosseum monument ' +
    'monuments punique punic mosquee mosque mosques ribat',
  sahara:
    'desert deserts sahara dune dunes oasis oases nature chameau chameaux dromadaire camel camels tatooine randonnee ' +
    'hiking hike montagne montagnes mountain mountains paysage paysages landscape landscapes sable sand etoiles stars',
  beach:
    'plage plages beach beaches mer sea baignade baigner swim swimming ile iles island islands cote coast crique criques ' +
    'cove coves bronzer sunbathe detente relax repos',
  culture:
    'culture culturel culturelle cultural artisanat artisan artisans craft crafts poterie pottery potier potiers art arts ' +
    'mosaique mosaiques mosaic mosaics musee musees museum museums architecture village villages ksar ksour troglodyte troglodytes',
  culinary:
    'cuisine food manger eat eating gastronomie gastronomy restaurant restaurants couscous plat plats dish dishes ' +
    'gourmand gourmet foodie saveurs epices spices harissa poisson fish street',
  souk: 'souk souks marche marches market markets shopping acheter buy souvenirs souvenir medina medinas bazar',
};

const ZONE_WORDS: Record<ZoneId, string> = {
  nord: 'nord north tunis capitale capital bizerte tell',
  capbon: 'capbon hammamet nabeul kelibia',
  centre: 'centre center central sahel sousse monastir kairouan mahdia sfax',
  sud: 'sud south desert sahara djerid tozeur douz djerba dahar tataouine matmata gabes',
};
const ZONE_PHRASES: Record<ZoneId, string[]> = {
  nord: ['nord ouest', 'north west'],
  capbon: ['cap bon'],
  centre: ['cote est', 'east coast'],
  sud: ['grand sud', 'deep south'],
};

const MONTH_WORDS = [
  'janvier january',
  'fevrier february',
  'mars march',
  'avril april',
  'mai may',
  'juin june',
  'juillet july',
  'aout august',
  'septembre september',
  'octobre october',
  'novembre november',
  'decembre december',
];
const SEASON_WORDS: [string, number][] = [
  ['printemps spring', 3],
  ['ete summer', 6],
  ['automne autumn fall', 9],
  ['hiver winter', 0],
];

const NUMBER_WORDS: Record<string, number> = {
  un: 1,
  une: 1,
  one: 1,
  deux: 2,
  two: 2,
  trois: 3,
  three: 3,
  quatre: 4,
  four: 4,
  cinq: 5,
  five: 5,
  six: 6,
  sept: 7,
  seven: 7,
  huit: 8,
  eight: 8,
  neuf: 9,
  nine: 9,
  dix: 10,
  ten: 10,
  quinze: 15,
  fifteen: 15,
};

const TRIP_WORDS =
  'roadtrip road itineraire itineraires itinerary itineraries circuit circuits voyage voyager trip travel sejour ' +
  'vacances holiday holidays visiter visit programme plan planifier planning organiser organise jours days semaine week';
const TIP_WORDS =
  'conseil conseils tips tip astuce astuces advice pratique pratiques negocier marchander negociation bargain ' +
  'bargaining haggle haggling pourboire pourboires tipping ramadan tenue habits vetements dress clothes chaleur heat ' +
  'chaud hot securite safety safe danger dangereux arnaque arnaques scam scams argent money cash monnaie dinar dinars ' +
  'carte card taxi taxis louage transport transports voiture conduire drive driving location rent eau water photo ' +
  'photos alcool alcohol vendredi friday priere prayer respect politesse manners femme femmes woman women seule alone ' +
  'coutume coutumes customs etiquette';
const BUDGET_WORDS =
  'budget prix price prices cher chere expensive cheap cout couts coute coutent cost costs tarif tarifs';
const WORD_WORDS =
  'dire dit dis disent say said mot mots word words arabe arabic derja darija dialecte dialect parler speak langue ' +
  'language traduire translate traduction translation expression expressions phrase phrases vocabulaire vocabulary lexique';
const GREETING_WORDS = 'bonjour salut hello hi hey coucou bonsoir aslema salam slt yo';
const HELP_WORDS = 'aide help menu sais faire capable aider';
const THANKS_WORDS = 'merci thanks thank aychek parfait super genial top cool';

function vocabulary(words: string): string[] {
  return words.split(' ').filter(Boolean);
}

/** Keywords the visitor wrote, with exact spellings taking priority over near ones (marché vs March). */
function hits(tokens: string[], keys: string[], all: Set<string>): boolean {
  return tokens.some((t) => {
    if (keys.includes(t)) return true;
    if (all.has(t)) return false;
    return keys.some((k) => similar(t, k));
  });
}

const ALL_KEYS = new Set(
  [
    ...Object.values(CATEGORY_WORDS),
    ...Object.values(ZONE_WORDS),
    ...MONTH_WORDS,
    ...SEASON_WORDS.map(([w]) => w),
    TRIP_WORDS,
    TIP_WORDS,
    BUDGET_WORDS,
    WORD_WORDS,
    GREETING_WORDS,
    HELP_WORDS,
    THANKS_WORDS,
  ].flatMap(vocabulary),
);

// ── Interface text ───────────────────────────────────────────────────────

const FR_MONTH_NAMES = [
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
const EN_MONTH_NAMES = [
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
];

const TEXT = {
  fr: {
    welcome:
      'Bonjour. Je peux vous proposer un road trip, une idée de lieu, des conseils pratiques ou quelques mots de derja. Choisissez ci-dessous ou écrivez votre question.',
    menu: {
      trip: 'Préparer un road trip',
      idea: 'Une idée de lieu',
      tips: 'Conseils pratiques',
      words: 'Quelques mots de derja',
    },
    askDays: 'Combien de jours avez-vous sur place ?',
    days: [
      ['2 ou 3 jours', 3],
      ['4 ou 5 jours', 5],
      ['Une semaine', 7],
      ['Dix jours ou plus', 10],
    ] as [string, number][],
    askCats: 'Qu’est-ce qui vous fait envie ?',
    allCats: 'Un peu de tout',
    askZone: 'Une région en tête ?',
    zones: { nord: 'Tunis et le Nord', capbon: 'Cap Bon', centre: 'Centre et Sahel', sud: 'Sud, désert et Djerba' },
    anyZone: 'Peu importe',
    askMonth: 'Quand partez-vous ?',
    seasons: [
      ['Au printemps', 3],
      ['En été', 6],
      ['En automne', 9],
      ['En hiver', 0],
    ] as [string, number][],
    noMonth: 'Je ne sais pas encore',
    thisMonth: (m: string) => `Ce mois-ci (${m})`,
    tripIntro: (days: number, n: number, where: string, when: string) =>
      `Voici une idée pour ${days} jour${days > 1 ? 's' : ''}${where}${when} : ${n} étapes.`,
    km: (km: string) => ` Comptez environ ${km} de route entre la première et la dernière.`,
    inZone: (z: string) => ` (${z})`,
    inMonth: (m: string) => `, en ${m}`,
    avoided: (m: string) => ` J’ai écarté les lieux à éviter en ${m}.`,
    fewMatches: ' Peu de lieux correspondent exactement à vos envies ici : j’ai complété avec d’autres étapes.',
    readyMade: 'Il existe aussi un road trip tout prêt sur le site :',
    changeDays: 'Changer la durée',
    changeCats: 'Changer les envies',
    changeZone: 'Changer la région',
    changeMonth: 'Changer la saison',
    restart: 'Recommencer',
    tipsHere: 'Conseils pour cette région',
    ideaIntro: 'Quelques lieux que j’aime beaucoup, à découvrir :',
    ideaMonth: (m: string) => `Quelques lieux à leur meilleur en ${m} :`,
    another: 'Une autre idée',
    placeIntro: (n: number): string =>
      n > 1 ? 'Voici ce que je sais de ces lieux :' : 'Voici ce que je sais de ce lieu :',
    best: 'Meilleure période',
    tripAround: 'Un road trip dans cette région',
    tipsIntro: 'Dans les cahiers pratiques du site :',
    tipsGeneral: 'Quelques conseils valables partout :',
    allGuides: 'Tous les cahiers pratiques',
    budget:
      'Je ne connais pas les prix : le site n’en donne pas encore. Pour les hébergements, les liens Booking et Airbnb de chaque fiche montrent les tarifs du moment.',
    wordsIntro: 'Quelques mots pour commencer :',
    wordsFound: 'Voici comment on le dit :',
    allWords: 'Tous les mots du cru',
    myTrip: (n: number): string =>
      n === 0
        ? 'Votre voyage est encore vide. Ajoutez des lieux depuis mes propositions ou depuis la carte.'
        : `Votre voyage compte ${n} étape${n > 1 ? 's' : ''}.`,
    openMyTrip: 'Ouvrir mon voyage',
    thanks: 'Avec plaisir. Bon voyage !',
    notUnderstood:
      'Je n’ai pas bien compris. Je connais les lieux du site, les road trips, les conseils pratiques et quelques mots de derja. Essayez par exemple « 5 jours dans le désert en mars ».',
    maybe: 'Je n’ai pas tout compris, mais ces lieux pourraient vous intéresser :',
  },
  en: {
    welcome:
      'Hello. I can suggest a road trip, a place to discover, practical tips or a few words of Tunisian Arabic. Pick one below or type your question.',
    menu: { trip: 'Plan a road trip', idea: 'A place to discover', tips: 'Practical tips', words: 'A few local words' },
    askDays: 'How many days will you have?',
    days: [
      ['2 or 3 days', 3],
      ['4 or 5 days', 5],
      ['A week', 7],
      ['Ten days or more', 10],
    ] as [string, number][],
    askCats: 'What are you in the mood for?',
    allCats: 'A bit of everything',
    askZone: 'Any region in mind?',
    zones: {
      nord: 'Tunis and the north',
      capbon: 'Cap Bon',
      centre: 'Centre and Sahel',
      sud: 'South, desert and Djerba',
    },
    anyZone: 'Anywhere',
    askMonth: 'When are you going?',
    seasons: [
      ['In spring', 3],
      ['In summer', 6],
      ['In autumn', 9],
      ['In winter', 0],
    ] as [string, number][],
    noMonth: 'Not sure yet',
    thisMonth: (m: string) => `This month (${m})`,
    tripIntro: (days: number, n: number, where: string, when: string) =>
      `Here is an idea for ${days} day${days > 1 ? 's' : ''}${where}${when}: ${n} stops.`,
    km: (km: string) => ` Expect about ${km} of driving from the first to the last.`,
    inZone: (z: string) => ` (${z})`,
    inMonth: (m: string) => ` in ${m}`,
    avoided: (m: string) => ` I left out the places best avoided in ${m}.`,
    fewMatches: ' Few places here match exactly, so I added other stops.',
    readyMade: 'The site also has a ready-made road trip:',
    changeDays: 'Change the length',
    changeCats: 'Change the mood',
    changeZone: 'Change the region',
    changeMonth: 'Change the season',
    restart: 'Start again',
    tipsHere: 'Tips for this region',
    ideaIntro: 'A few places I love:',
    ideaMonth: (m: string) => `A few places at their best in ${m}:`,
    another: 'Another idea',
    placeIntro: (n: number): string =>
      n > 1 ? 'Here is what I know about these places:' : 'Here is what I know about it:',
    best: 'Best time',
    tripAround: 'A road trip in this region',
    tipsIntro: 'From the site’s practical guides:',
    tipsGeneral: 'A few tips that apply everywhere:',
    allGuides: 'All practical guides',
    budget:
      'I do not know prices: the site does not list them yet. For places to stay, the Booking and Airbnb links on each place show current rates.',
    wordsIntro: 'A few words to start with:',
    wordsFound: 'Here is how to say it:',
    allWords: 'All local words',
    myTrip: (n: number): string =>
      n === 0
        ? 'Your trip is still empty. Add places from my suggestions or from the map.'
        : `Your trip has ${n} stop${n > 1 ? 's' : ''}.`,
    openMyTrip: 'Open my trip',
    thanks: 'My pleasure. Have a great trip!',
    notUnderstood:
      'I did not quite get that. I know the places on the site, the road trips, the practical guides and a few local words. Try for example “5 days in the desert in March”.',
    maybe: 'I did not get all of it, but these places may interest you:',
  },
};

type Text = (typeof TEXT)['fr'];

function monthName(m: number, locale: Locale): string {
  return locale === 'fr' ? FR_MONTH_NAMES[m] : EN_MONTH_NAMES[m];
}

// ── Reading the visitor's message ───────────────────────────────────────

interface Cues {
  tokens: string[];
  text: string;
  days?: number;
  cats: CategoryId[];
  zones: ZoneId[];
  month?: number;
  places: string[];
  trip: boolean;
  tips: boolean;
  budget: boolean;
  words: boolean;
  greeting: boolean;
  help: boolean;
  thanks: boolean;
  myTrip: boolean;
}

function readDays(text: string, tokens: string[]): number | undefined {
  const num = text.match(/\b(\d{1,2})\s*(j|jr|jrs|jour|jours|day|days|nuit|nuits|night|nights)\b/);
  if (num) return Number(num[1]);
  for (let i = 0; i < tokens.length - 1; i++) {
    const n = NUMBER_WORDS[tokens[i]];
    const unit = tokens[i + 1];
    if (n && /^(jours?|days?|nuits?|nights?)$/.test(unit)) return n;
    if (n && /^(semaines?|weeks?)$/.test(unit)) return n * 7;
  }
  if (/\b(week end|weekend|we)\b/.test(text)) return 2;
  if (/\b(semaine|week)\b/.test(text)) return 7;
  return undefined;
}

function readMonth(tokens: string[]): number | undefined {
  for (const t of tokens) {
    const exact = MONTH_WORDS.findIndex((w) => vocabulary(w).includes(t));
    if (exact >= 0) return exact;
  }
  for (const t of tokens) {
    if (t.length < 5 || ALL_KEYS.has(t)) continue;
    const near = MONTH_WORDS.findIndex((w) => vocabulary(w).some((k) => k.length >= 5 && similar(t, k)));
    if (near >= 0) return near;
  }
  for (const [words, m] of SEASON_WORDS) if (hits(tokens, vocabulary(words), ALL_KEYS)) return m;
  return undefined;
}

/** Place names the visitor mentioned ("djerba", "el jem", "sidi bou said"). */
function readPlaces(text: string, tokens: string[], places: Place[]): string[] {
  const found: string[] = [];
  for (const p of places) {
    const names = new Set([normalize(p.name), normalize(p.id.replace(/-/g, ' '))]);
    for (const name of names) {
      const parts = name.split(' ').filter((w) => !STOPWORDS.has(w) && !['of', 'de', 'el', 'la', 'des'].includes(w));
      if (!parts.length) continue;
      const whole = name.length >= 4 && ` ${text} `.includes(` ${name} `);
      // Every meaningful word of the name, each possibly misspelt ("kairouane", "dougha").
      const fuzzy = parts.every((part) => part.length >= 4 && tokens.some((t) => !ALL_KEYS.has(t) && similar(t, part)));
      if (whole || fuzzy) {
        found.push(p.id);
        break;
      }
    }
  }
  // "Djerba" alone means the island, not every Djerba place.
  return found.length > 3 ? found.slice(0, 3) : found;
}

function read(input: string, places: Place[]): Cues {
  const text = normalize(input);
  const tokens = tokenize(input);
  const has = (words: string) => hits(tokens, vocabulary(words), ALL_KEYS);
  const cats = (Object.keys(CATEGORY_WORDS) as CategoryId[]).filter((c) => has(CATEGORY_WORDS[c]));
  if (/\bstar wars\b/.test(text) && !cats.includes('sahara')) cats.push('sahara');
  const zones = ZONES.filter(
    (z) => has(ZONE_WORDS[z]) || ZONE_PHRASES[z].some((phrase) => ` ${text} `.includes(` ${phrase} `)),
  );
  const content = tokens.filter((t) => !STOPWORDS.has(t));
  const only = (words: string) => content.length > 0 && content.every((t) => vocabulary(words).includes(t));
  return {
    tokens,
    text,
    days: readDays(text, tokens),
    cats,
    zones,
    month: readMonth(tokens),
    places: readPlaces(text, tokens, places),
    trip: has(TRIP_WORDS) || /\broad trip\b/.test(text),
    tips: has(TIP_WORDS),
    budget: has(BUDGET_WORDS),
    words: has(WORD_WORDS) || /\bcomment (on )?(dit|dire)\b|\bhow (do you|to) say\b/.test(text),
    greeting: only(`${GREETING_WORDS} ${HELP_WORDS}`) && has(GREETING_WORDS),
    help: only(`${GREETING_WORDS} ${HELP_WORDS}`) && has(HELP_WORDS),
    thanks: only(`${THANKS_WORDS} beaucoup much lot bye`),
    myTrip: /\b(mon voyage|mon road trip|mon carnet|my trip|my road trip)\b/.test(text),
  };
}

// ── Building answers ─────────────────────────────────────────────────────

function menuChips(t: Text): Chip[] {
  return [
    { label: t.menu.trip, action: { type: 'trip' } },
    { label: t.menu.idea, action: { type: 'idea' } },
    { label: t.menu.tips, action: { type: 'tips' } },
    { label: t.menu.words, action: { type: 'words' } },
  ];
}

export function welcome(locale: Locale): Reply {
  const t = TEXT[locale];
  return { text: t.welcome, chips: menuChips(t) };
}

function ask(step: Step, locale: Locale): Reply {
  const t = TEXT[locale];
  const catalog = getCatalog(locale);
  switch (step) {
    case 'days':
      return {
        text: t.askDays,
        chips: t.days.map(([label, days]) => ({ label, action: { type: 'set', patch: { days } } })),
      };
    case 'cats':
      return {
        text: t.askCats,
        chips: [
          ...catalog.categories.map(
            (c) => ({ label: c.short, action: { type: 'set', patch: { cats: [c.id] } } }) as Chip,
          ),
          { label: t.allCats, action: { type: 'set', patch: { cats: [] } } },
        ],
      };
    case 'zone':
      return {
        text: t.askZone,
        chips: [
          ...ZONES.map((z) => ({ label: t.zones[z], action: { type: 'set', patch: { zones: [z] } } }) as Chip),
          { label: t.anyZone, action: { type: 'set', patch: { zones: [] } } },
        ],
      };
    case 'month': {
      const now = new Date().getMonth();
      return {
        text: t.askMonth,
        chips: [
          { label: t.thisMonth(monthName(now, locale)), action: { type: 'set', patch: { month: now } } },
          ...t.seasons.map(([label, month]) => ({ label, action: { type: 'set', patch: { month } } }) as Chip),
          { label: t.noMonth, action: { type: 'set', patch: { month: null } } },
        ],
      };
    }
  }
}

const STEPS: Step[] = ['days', 'cats', 'zone', 'month'];

/** Has the guided road trip had an answer for this question? */
function answered(profile: Profile, step: Step): boolean {
  switch (step) {
    case 'days':
      return profile.days !== undefined;
    case 'cats':
    case 'zone':
      // An empty list is a valid answer ("a bit of everything"), so the flow tracks it through `step`.
      return false;
    case 'month':
      return profile.month !== undefined;
  }
}

function nextStep(profile: Profile, after: Step | null | undefined): Step | null {
  const from = after ? STEPS.indexOf(after) + 1 : 0;
  for (const step of STEPS.slice(from)) if (!answered(profile, step)) return step;
  return null;
}

function scorePlace(p: Place, profile: Profile): number {
  let score = profile.cats.length ? (profile.cats.includes(p.category) ? 3 : 0) : 1;
  if (profile.month != null && seasonFor(p.id, profile.month) === 'best') score += 1;
  if (p.unesco) score += 0.3;
  return score;
}

/** Visit the chosen places in a sensible order: the shortest "always the nearest next" tour. */
function orderStops(places: Place[]): Place[] {
  const dist = (a: Place, b: Place) => (a.coords[0] - b.coords[0]) ** 2 + (a.coords[1] - b.coords[1]) ** 2;
  let best: Place[] = places;
  let bestLength = Infinity;
  for (const first of places) {
    const rest = places.filter((p) => p !== first);
    const route = [first];
    let length = 0;
    while (rest.length) {
      const last = route[route.length - 1];
      let k = 0;
      rest.forEach((p, i) => {
        if (dist(p, last) < dist(rest[k], last)) k = i;
      });
      length += Math.sqrt(dist(rest[k], last));
      route.push(rest.splice(k, 1)[0]);
    }
    if (length < bestLength - 1e-9) {
      bestLength = length;
      best = route;
    }
  }
  // Read north to south when the tour can go either way.
  return best.length > 1 && best[0].coords[0] < best[best.length - 1].coords[0] ? [...best].reverse() : best;
}

const READY_MADE: Record<string, CategoryId[]> = {
  'roman-heritage': ['heritage'],
  'star-wars': ['sahara'],
  'cap-bon': ['beach'],
  'sacred-medinas': ['heritage', 'souk'],
};

function proposeTrip(profile: Profile, locale: Locale): Reply {
  const t = TEXT[locale];
  const { places, itineraries } = getCatalog(locale);
  const days = Math.min(Math.max(profile.days ?? 4, 1), 21);
  const count = Math.min(Math.max(Math.round(days * 1.25), 2), 9);
  const month = profile.month ?? null;
  const fits = (p: Place) => ZONE_OF[p.id] && (month == null || seasonFor(p.id, month) !== 'avoid');
  const pool = places.filter(fits);
  const avoidedSome = month != null && places.some((p) => ZONE_OF[p.id] && seasonFor(p.id, month) === 'avoid');

  // Pick the region: the visitor's, or the one that best matches for short trips.
  let zones = profile.zones;
  if (!zones.length && days < 7) {
    const value = (z: ZoneId) =>
      pool
        .filter((p) => ZONE_OF[p.id] === z)
        .map((p) => scorePlace(p, profile))
        .sort((a, b) => b - a)
        .slice(0, count)
        .reduce((s, x) => s + x, 0);
    zones = [ZONES.reduce((best, z) => (value(z) > value(best) ? z : best), ZONES[0])];
  }
  const inZone = (p: Place) => !zones.length || zones.includes(ZONE_OF[p.id]);
  const near = (p: Place) => zones.some((z) => NEIGHBOURS[z].includes(ZONE_OF[p.id]));
  const ranked = (list: Place[], malus = 0) =>
    list.map((p) => ({ p, s: scorePlace(p, profile) - malus })).sort((a, b) => b.s - a.s);

  let chosen = ranked(pool.filter(inZone)).filter((x) => x.s > 0);
  let filled = false;
  if (chosen.length < Math.min(count, 3) && zones.length) {
    chosen = [...chosen, ...ranked(pool.filter(near), 0.5).filter((x) => x.s > 0)];
    filled = true;
  }
  if (chosen.length < 2) chosen = [...chosen, ...ranked(pool.filter(inZone)).filter((x) => x.s <= 0)];
  const stops = orderStops(chosen.slice(0, count).map((x) => x.p));
  if (!stops.length) return { text: t.notUnderstood, chips: menuChips(t) };

  const zoneLabel =
    profile.zones.length === 1
      ? t.inZone(t.zones[profile.zones[0]])
      : zones.length === 1
        ? t.inZone(t.zones[zones[0]])
        : '';
  const when = month != null ? t.inMonth(monthName(month, locale)) : '';
  let text = t.tripIntro(days, stops.length, zoneLabel, when);
  const { totalKm } = summarizeRoute(stops);
  if (stops.length > 1 && totalKm > 0) text += t.km(`${Math.round(totalKm / 10) * 10} km`);
  if (avoidedSome) text += t.avoided(monthName(month!, locale));
  if (
    profile.cats.length &&
    (filled || stops.filter((p) => profile.cats.includes(p.category)).length * 2 < stops.length)
  )
    text += t.fewMatches;

  const ids = stops.map((s) => s.id);
  const readyMade = itineraries.find(
    (it) =>
      it.stops.filter((id) => ids.includes(id)).length >= 2 ||
      (profile.cats.length === 1 &&
        READY_MADE[it.id]?.includes(profile.cats[0]) &&
        it.stops.some((id) => ids.includes(id))),
  );
  const zone = zones.length === 1 ? zones[0] : undefined;
  return {
    text,
    trip: ids,
    itinerary: readyMade?.id,
    chips: [
      { label: t.changeDays, action: { type: 'change', step: 'days' } },
      { label: t.changeCats, action: { type: 'change', step: 'cats' } },
      { label: t.changeZone, action: { type: 'change', step: 'zone' } },
      { label: t.changeMonth, action: { type: 'change', step: 'month' } },
      ...(zone ? [{ label: t.tipsHere, action: { type: 'tips', zone } } as Chip] : []),
      { label: t.restart, action: { type: 'trip' } },
    ],
  };
}

/** Advance the guided road trip, or propose it once every question is answered. */
function continueTrip(profile: Profile, locale: Locale): { reply: Reply; profile: Profile } {
  if (profile.revise) {
    const done = { ...profile, step: null, revise: false };
    return { reply: proposeTrip(done, locale), profile: done };
  }
  const step = nextStep(profile, profile.step);
  if (step) return { reply: ask(step, locale), profile: { ...profile, step } };
  const done = { ...profile, step: null };
  return { reply: proposeTrip(done, locale), profile: done };
}

let ideaTurn = 0;

function idea(locale: Locale, month: number | null | undefined): Reply {
  const t = TEXT[locale];
  const { places } = getCatalog(locale);
  const now = month ?? new Date().getMonth();
  const best = places.filter((p) => ZONE_OF[p.id] && seasonFor(p.id, now) === 'best');
  const list = best.length >= 3 ? best : places.filter((p) => ZONE_OF[p.id]);
  // Walk through the list a few places at a time, mixing regions.
  const start = (ideaTurn++ * 3) % list.length;
  const picks = [0, 1, 2].map((i) => list[(start + i * Math.ceil(list.length / 3)) % list.length].id);
  return {
    text: best.length >= 3 ? t.ideaMonth(monthName(now, locale)) : t.ideaIntro,
    places: [...new Set(picks)],
    chips: [
      { label: t.another, action: { type: 'idea' } },
      { label: t.menu.trip, action: { type: 'trip' } },
    ],
  };
}

function placesReply(ids: string[], locale: Locale): Reply {
  const t = TEXT[locale];
  const { placeById } = getCatalog(locale);
  const zone = ZONE_OF[ids[0]];
  const p = placeById[ids[0]];
  const where = p && normalize(p.region) !== normalize(p.name) ? `, ${p.region}` : '';
  const text =
    ids.length === 1 && p
      ? `${p.name}${where}. ${p.tagline}. ${t.best}${locale === 'fr' ? ' : ' : ': '}${bestMonthsLabel(p.id, locale).replace(/\.$/, '')}.`
      : t.placeIntro(ids.length);
  return {
    text,
    places: ids,
    links: [
      {
        label: regionGuides(locale).find((g) => g.id === guideFor(ids[0]))?.title ?? t.allGuides,
        href: `/pratique#${guideAnchor(guideFor(ids[0]))}`,
      },
    ],
    chips: zone
      ? [
          { label: t.tripAround, action: { type: 'set', patch: { zones: [zone] } } },
          { label: t.menu.idea, action: { type: 'idea' } },
        ]
      : [{ label: t.menu.trip, action: { type: 'trip' } }],
  };
}

const GENERIC_TIP_WORDS = new Set(
  vocabulary('conseil conseils tips tip astuce astuces advice pratique pratiques info infos'),
);

function tips(cues: Cues | null, locale: Locale, zone?: ZoneId): Reply {
  const t = TEXT[locale];
  const guides = regionGuides(locale);
  let allowed = zone ? ZONE_GUIDES[zone] : null;
  if (!allowed && cues?.places.length) allowed = [guideFor(cues.places[0])];
  if (!allowed && cues?.zones.length) allowed = cues.zones.flatMap((z) => ZONE_GUIDES[z]);
  const words = (cues?.tokens ?? [])
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !GENERIC_TIP_WORDS.has(w))
    .map(stem);
  const notes = guides
    .filter((g) => !allowed || allowed.includes(g.id) || g.id === GENERAL_GUIDE)
    .flatMap((g) =>
      g.notes.map((n) => {
        const title = new Set(tokenize(n.title).map(stem));
        const body = new Set(tokenize(n.text).map(stem));
        const score = words.reduce((s, w) => s + (title.has(w) ? 3 : body.has(w) ? 1 : 0), 0);
        const local = allowed?.includes(g.id) ? 0.5 : 0;
        return { guide: g.id, guideTitle: g.title, title: n.title, text: n.text, score: score + local };
      }),
    )
    .sort((a, b) => b.score - a.score);
  const matched = notes.filter((n) => n.score >= 1);
  const general = !matched.length && !allowed;
  const picked = matched.length
    ? matched.slice(0, 2)
    : allowed
      ? notes.filter((n) => allowed!.includes(n.guide)).slice(0, 2)
      : notes.filter((n) => n.guide === GENERAL_GUIDE).slice(0, 3);
  const prefix = cues?.budget ? `${t.budget} ` : '';
  const first = picked[0];
  return {
    text: prefix + (general ? t.tipsGeneral : t.tipsIntro),
    notes: picked.map(({ guide, guideTitle, title, text }) => ({ guide, guideTitle, title, text })),
    links: [
      first && first.guide !== GENERAL_GUIDE
        ? { label: first.guideTitle, href: `/pratique#${guideAnchor(first.guide)}` }
        : { label: t.allGuides, href: '/pratique#cahiers' },
    ],
    chips: [
      { label: t.menu.trip, action: { type: 'trip' } },
      { label: t.menu.words, action: { type: 'words' } },
    ],
  };
}

function words(cues: Cues | null, locale: Locale): Reply {
  const t = TEXT[locale];
  const all = LEXICON.flatMap((g) => g.words);
  const query = (cues?.tokens ?? []).filter(
    (w) =>
      w.length >= 3 &&
      !STOPWORDS.has(w) &&
      !vocabulary(WORD_WORDS).includes(w) &&
      !['on', 'tunisie', 'tunisia', 'tunisien', 'tunisian'].includes(w),
  );
  const found = query.length
    ? all.filter((w) => {
        const meaning = tokenize(w.meaning[locale]).filter((m) => m.length >= 3 && !STOPWORDS.has(m));
        const latin = tokenize(w.latin);
        return query.some((q) => meaning.some((m) => similar(q, m)) || latin.some((l) => similar(q, l)));
      })
    : [];
  return {
    text: found.length ? t.wordsFound : t.wordsIntro,
    words: found.length ? found.slice(0, 4) : LEXICON[0].words.slice(0, 4),
    links: [{ label: t.allWords, href: '/pratique#mots' }],
    chips: [
      { label: t.menu.tips, action: { type: 'tips' } },
      { label: t.menu.trip, action: { type: 'trip' } },
    ],
  };
}

/** Last resort: places whose name, region or tagline share words with the message. */
function search(cues: Cues, locale: Locale): string[] {
  const { places } = getCatalog(locale);
  const query = cues.tokens.filter((w) => w.length >= 4 && !STOPWORDS.has(w)).map(stem);
  if (!query.length) return [];
  return places
    .filter((p) => ZONE_OF[p.id])
    .map((p) => {
      const head = new Set(tokenize(`${p.name} ${p.region} ${p.tagline}`).map(stem));
      const body = new Set(tokenize(p.description).map(stem));
      return { id: p.id, s: query.reduce((s, w) => s + (head.has(w) ? 2 : body.has(w) ? 1 : 0), 0) };
    })
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => x.id);
}

// ── Public entry points ──────────────────────────────────────────────────

export function onAction(action: Action, profile: Profile, locale: Locale): { reply: Reply; profile: Profile } {
  const t = TEXT[locale];
  switch (action.type) {
    case 'menu':
      return { reply: welcome(locale), profile };
    case 'trip': {
      const fresh: Profile = { ...EMPTY_PROFILE, step: null };
      return continueTrip(fresh, locale);
    }
    case 'idea':
      return { reply: idea(locale, profile.month), profile };
    case 'tips':
      return { reply: tips(null, locale, action.zone), profile };
    case 'words':
      return { reply: words(null, locale), profile };
    case 'change':
      return { reply: ask(action.step, locale), profile: { ...profile, step: action.step, revise: true } };
    case 'set': {
      const next = { ...profile, ...action.patch };
      // A chip outside the guided flow (e.g. "a road trip in this region") starts it.
      if (!profile.step && !profile.revise) {
        const fresh: Profile = { ...EMPTY_PROFILE, ...action.patch, step: null };
        const answeredStep = (Object.keys(action.patch) as (keyof Profile)[]).map((k) =>
          k === 'cats' ? 'cats' : k === 'zones' ? 'zone' : k,
        )[0] as Step;
        const step = nextStep(fresh, null);
        if (step && step !== answeredStep) return { reply: ask(step, locale), profile: { ...fresh, step } };
        return continueTrip({ ...fresh, step: answeredStep }, locale);
      }
      return continueTrip(next, locale);
    }
  }
  return { reply: { text: t.notUnderstood, chips: menuChips(t) }, profile };
}

export function onMessage(
  input: string,
  profile: Profile,
  locale: Locale,
  tripSize: number,
): { reply: Reply; profile: Profile } {
  const t = TEXT[locale];
  const { places } = getCatalog(locale);
  const cues = read(input, places);

  if (cues.thanks) return { reply: { text: t.thanks }, profile };
  if (cues.greeting || cues.help) return { reply: welcome(locale), profile };
  if (cues.myTrip && !cues.days && !cues.cats.length) {
    return {
      reply: { text: t.myTrip(tripSize), links: [{ label: t.openMyTrip, href: '/mon-voyage' }] },
      profile,
    };
  }
  if (cues.words) return { reply: words(cues, locale), profile };
  if (cues.tips || cues.budget) return { reply: tips(cues, locale), profile };

  const tripCues = cues.days !== undefined || cues.cats.length > 0 || cues.zones.length > 0 || cues.month !== undefined;
  // A question in the middle of the guided road trip: take what it answers and carry on.
  if (profile.step && tripCues) {
    const merged: Profile = {
      ...profile,
      ...(cues.days !== undefined && { days: cues.days }),
      ...(cues.cats.length && { cats: cues.cats }),
      ...(cues.zones.length && { zones: cues.zones }),
      ...(cues.month !== undefined && { month: cues.month }),
    };
    const answeredCurrent =
      (profile.step === 'days' && cues.days !== undefined) ||
      (profile.step === 'cats' && cues.cats.length > 0) ||
      (profile.step === 'zone' && cues.zones.length > 0) ||
      (profile.step === 'month' && cues.month !== undefined);
    if (answeredCurrent) return continueTrip(merged, locale);
    return { reply: ask(profile.step, locale), profile: merged };
  }

  if (cues.places.length && cues.days === undefined && !cues.trip) {
    return { reply: placesReply(cues.places, locale), profile };
  }

  if (tripCues || cues.trip) {
    const zonesFromPlaces = cues.places.map((id) => ZONE_OF[id]).filter(Boolean) as ZoneId[];
    const next: Profile = {
      ...EMPTY_PROFILE,
      days: cues.days,
      cats: cues.cats,
      zones: cues.zones.length ? cues.zones : [...new Set(zonesFromPlaces)],
      month: cues.month,
      step: null,
    };
    // Enough to go on: propose straight away. Otherwise ask the missing questions.
    if (cues.days !== undefined || cues.cats.length || next.zones.length) {
      return { reply: proposeTrip(next, locale), profile: next };
    }
    return continueTrip(next, locale);
  }

  const found = search(cues, locale);
  if (found.length) return { reply: { ...placesReply(found, locale), text: t.maybe }, profile };
  return { reply: { text: t.notUnderstood, chips: menuChips(t) }, profile };
}
