/**
 * Events shown on /evenements. Every date and link here comes from a press article
 * (see `source`); anything not announced yet is marked `confirmed: false` and shows « à confirmer ».
 * Never add a date or a link that is not backed by a source.
 */

type Text = { fr: string; en: string };

export type EventKind = 'music' | 'gathering' | 'culture';

export interface EventAction {
  kind: 'tickets' | 'info' | 'stay';
  label: Text;
  /** No url: the button is shown as inactive (« à confirmer »). `stay` uses the place's accommodation search. */
  url?: string;
}

export interface TunisiaEvent {
  id: string;
  kind: EventKind;
  /** Place id: gives the photo, the location and the link to the map. */
  placeId: string;
  title: Text;
  description: Text;
  /** Display date. */
  when: Text;
  /** True only when the dates of the next edition have been announced. */
  confirmed: boolean;
  /** ISO dates, only when confirmed (used for search engines). */
  start?: string;
  end?: string;
  /** Press article the dates come from. */
  source?: string;
  actions: EventAction[];
}

const TESKERTI = 'https://teskerti.tn';

export const EVENTS: TunisiaEvent[] = [
  {
    id: 'sahara-douz',
    kind: 'gathering',
    placeId: 'douz',
    title: { fr: 'Festival international du Sahara', en: 'International Sahara Festival' },
    description: {
      fr: 'Le grand rendez-vous des traditions sahariennes, à Douz, aux portes du désert. La 58e édition est en préparation.',
      en: 'The big gathering of Saharan traditions, in Douz at the edge of the desert. The 58th edition is being prepared.',
    },
    when: { fr: '19 – 22 décembre 2026', en: '19 – 22 December 2026' },
    confirmed: true,
    start: '2026-12-19',
    end: '2026-12-22',
    source:
      'https://www.tunisienumerique.com/tunisie-douz-prepare-la-58e-edition-de-son-festival-international-du-sahara/',
    actions: [
      { kind: 'stay', label: { fr: 'Se loger à Douz', en: 'Find a stay in Douz' } },
      { kind: 'info', label: { fr: 'Lire l’annonce', en: 'Read the announcement' } },
    ],
  },
  {
    id: 'jtc',
    kind: 'culture',
    placeId: 'medina-tunis',
    title: { fr: 'Journées théâtrales de Carthage', en: 'Carthage Theatre Days' },
    description: {
      fr: 'Le grand festival de théâtre de Tunisie. Dates annoncées par le ministère de la Culture pour la 27e édition.',
      en: 'Tunisia’s big theatre festival. Dates announced by the Ministry of Culture for the 27th edition.',
    },
    when: { fr: '21 – 28 novembre 2026', en: '21 – 28 November 2026' },
    confirmed: true,
    start: '2026-11-21',
    end: '2026-11-28',
    source:
      'https://www.webdo.tn/fr/actualite/culture/le-ministere-de-la-culture-devoile-les-dates-des-grands-rendez-vous-culturels-de-carthage-en-2026/397823/',
    actions: [
      { kind: 'tickets', label: { fr: 'Billetterie à confirmer', en: 'Tickets to be confirmed' } },
      { kind: 'info', label: { fr: 'Lire l’annonce', en: 'Read the announcement' } },
    ],
  },
  {
    id: 'jcc',
    kind: 'culture',
    placeId: 'medina-tunis',
    title: { fr: 'Journées cinématographiques de Carthage', en: 'Carthage Film Festival' },
    description: {
      fr: 'Le plus ancien festival de cinéma du continent, fondé en 1966. La 37e édition aura lieu en décembre.',
      en: 'The continent’s oldest film festival, founded in 1966. The 37th edition takes place in December.',
    },
    when: { fr: '12 – 19 décembre 2026', en: '12 – 19 December 2026' },
    confirmed: true,
    start: '2026-12-12',
    end: '2026-12-19',
    source: 'https://www.lapresse.tn/2026/08/04/37e-edition-des-jcc-une-seance-de-travail-consacree-aux-preparatifs/',
    actions: [
      { kind: 'tickets', label: { fr: 'Billetterie à confirmer', en: 'Tickets to be confirmed' } },
      { kind: 'info', label: { fr: 'Lire l’annonce', en: 'Read the announcement' } },
    ],
  },
  {
    id: 'carthage',
    kind: 'music',
    placeId: 'carthage',
    title: { fr: 'Festival international de Carthage', en: 'Carthage International Festival' },
    description: {
      fr: 'Concerts sous les étoiles au Théâtre romain de Carthage. La 60e édition s’est tenue du 16 juillet au 19 août 2026, avec une billetterie en ligne.',
      en: 'Concerts under the stars at the Roman Theatre of Carthage. The 60th edition ran from 16 July to 19 August 2026, with online ticketing.',
    },
    when: { fr: 'Chaque été · prochaine édition à confirmer', en: 'Every summer · next edition to be confirmed' },
    confirmed: false,
    source:
      'https://www.lapresse.tn/2026/07/05/festival-de-carthage-2026-ouverture-de-la-billetterie-en-ligne-pour-la-60e-edition/',
    actions: [
      { kind: 'tickets', label: { fr: 'Billetterie (Teskerti)', en: 'Tickets (Teskerti)' }, url: TESKERTI },
      { kind: 'info', label: { fr: 'Lire l’annonce', en: 'Read the announcement' } },
    ],
  },
  {
    id: 'hammamet',
    kind: 'music',
    placeId: 'hammamet',
    title: { fr: 'Festival international de Hammamet', en: 'Hammamet International Festival' },
    description: {
      fr: 'Un festival d’été en bord de mer. La 60e édition s’est tenue du 11 juillet au 13 août 2026.',
      en: 'A summer festival by the sea. The 60th edition ran from 11 July to 13 August 2026.',
    },
    when: { fr: 'Chaque été · prochaine édition à confirmer', en: 'Every summer · next edition to be confirmed' },
    confirmed: false,
    source:
      'https://www.lapresse.tn/2026/06/29/la-60eme-edition-du-festival-international-de-hammamet-du-11-juillet-au-13-aout-2026-60-ans-de-scene/',
    actions: [
      { kind: 'tickets', label: { fr: 'Billetterie à confirmer', en: 'Tickets to be confirmed' } },
      { kind: 'info', label: { fr: 'Lire l’annonce', en: 'Read the announcement' } },
    ],
  },
  {
    id: 'el-jem',
    kind: 'music',
    placeId: 'el-jem',
    title: { fr: 'Festival de musique symphonique d’El Jem', en: 'El Jem Symphonic Music Festival' },
    description: {
      fr: 'De la musique symphonique dans l’amphithéâtre romain d’El Jem, l’un des plus grands du monde antique.',
      en: 'Symphonic music in the Roman amphitheatre of El Jem, one of the largest of the ancient world.',
    },
    when: { fr: 'En été · dates à confirmer', en: 'In summer · dates to be confirmed' },
    confirmed: false,
    actions: [
      { kind: 'tickets', label: { fr: 'Billetterie à confirmer', en: 'Tickets to be confirmed' } },
      { kind: 'stay', label: { fr: 'Se loger à El Jem', en: 'Find a stay in El Jem' } },
    ],
  },
  {
    id: 'tabarka-jazz',
    kind: 'music',
    placeId: 'tabarka',
    title: { fr: 'Tabarka Jazz Festival', en: 'Tabarka Jazz Festival' },
    description: {
      fr: 'Du jazz au bord de la côte de corail, au pied du fort génois. Le village se remplit vite en été.',
      en: 'Jazz on the coral coast, beneath the Genoese fort. The town fills up fast in summer.',
    },
    when: { fr: 'En été · dates à confirmer', en: 'In summer · dates to be confirmed' },
    confirmed: false,
    actions: [
      { kind: 'tickets', label: { fr: 'Billetterie à confirmer', en: 'Tickets to be confirmed' } },
      { kind: 'stay', label: { fr: 'Se loger à Tabarka', en: 'Find a stay in Tabarka' } },
    ],
  },
];
