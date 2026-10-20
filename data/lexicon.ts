import type { Locale } from '@/lib/i18n/config';

/**
 * "Les mots du cru": a few words of Tunisian Arabic (derja) for the road.
 * `latin` is written the way Tunisians text it, simplified for visitors (no 3 / 7 / 9 digits).
 * `say` is what the Arabic voice reads when it differs from `ar` (speech engines do not know ڨ).
 */
export interface Word {
  id: string;
  latin: string;
  ar: string;
  say?: string;
  meaning: Record<Locale, string>;
  tip?: Record<Locale, string>;
}

export interface WordGroup {
  id: string;
  title: Record<Locale, string>;
  words: Word[];
}

export const LEXICON: WordGroup[] = [
  {
    id: 'saluer',
    title: { fr: 'Dire bonjour', en: 'Saying hello' },
    words: [
      {
        id: 'aslema',
        latin: 'Aslema',
        ar: 'أسلامة',
        meaning: { fr: 'Bonjour, salut', en: 'Hello, hi' },
        tip: {
          fr: 'Le salut tunisien de tous les jours, plus local que « salam ».',
          en: 'The everyday Tunisian hello, more local than “salam”.',
        },
      },
      {
        id: 'labes',
        latin: 'Labès ?',
        ar: 'لاباس؟',
        meaning: { fr: 'Ça va ?', en: 'How are you?' },
        tip: {
          fr: 'On répond « Labès, hamdoullah » : ça va, Dieu merci.',
          en: 'The answer is “Labès, hamdoullah”: fine, thank God.',
        },
      },
      {
        id: 'aychek',
        latin: 'Aychek',
        ar: 'عيشك',
        meaning: { fr: 'Merci', en: 'Thank you' },
        tip: {
          fr: 'Le merci tunisien. « Merci » en français se dit aussi partout.',
          en: 'The Tunisian thank you. The French “merci” works everywhere too.',
        },
      },
      {
        id: 'ya-hbibi',
        latin: 'Ya hbibi',
        ar: 'يا حبيبي',
        meaning: { fr: 'Mon ami, mon cher', en: 'My friend, my dear' },
        tip: {
          fr: 'Affectueux, entre amis ou avec un commerçant. À une femme : « ya hbibti ».',
          en: 'Warm, between friends or with a shopkeeper. To a woman: “ya hbibti”.',
        },
      },
      {
        id: 'bislema',
        latin: 'Bislema',
        ar: 'بالسلامة',
        meaning: { fr: 'Au revoir', en: 'Goodbye' },
      },
    ],
  },
  {
    id: 'souk',
    title: { fr: 'Au souk', en: 'At the souk' },
    words: [
      {
        id: 'bkadech',
        latin: 'Bkadech ?',
        ar: 'بقدّاش؟',
        meaning: { fr: 'C’est combien ?', en: 'How much is it?' },
      },
      {
        id: 'ghali',
        latin: 'Ghali barcha',
        ar: 'غالي برشة',
        meaning: { fr: 'C’est trop cher', en: 'That’s too expensive' },
        tip: {
          fr: 'Dit avec le sourire, c’est le début de la négociation, pas une offense.',
          en: 'Said with a smile, it opens the bargaining; nobody takes offence.',
        },
      },
      {
        id: 'barcha',
        latin: 'Barcha',
        ar: 'برشة',
        meaning: { fr: 'Beaucoup, très', en: 'A lot, very' },
      },
      {
        id: 'chwaya',
        latin: 'Chwaya',
        ar: 'شويّة',
        meaning: { fr: 'Un peu', en: 'A little' },
        tip: {
          fr: '« Chwaya chwaya » : doucement, petit à petit.',
          en: '“Chwaya chwaya”: slowly, little by little.',
        },
      },
      {
        id: 'behi',
        latin: 'Behi',
        ar: 'باهي',
        meaning: { fr: 'D’accord, c’est bon', en: 'OK, deal' },
      },
    ],
  },
  {
    id: 'table',
    title: { fr: 'Au café, à table', en: 'At the café, at the table' },
    words: [
      {
        id: 'tey',
        latin: 'Tey bel naanaa',
        ar: 'تاي بالنعناع',
        meaning: { fr: 'Un thé à la menthe', en: 'A mint tea' },
      },
      {
        id: 'kahwa',
        latin: 'Kahwa',
        ar: 'قهوة',
        meaning: { fr: 'Un café', en: 'A coffee' },
        tip: {
          fr: 'Le « capucin », petit café crème, est l’institution des cafés tunisiens.',
          en: 'The “capucin”, a small coffee with milk, is the Tunisian café classic.',
        },
      },
      {
        id: 'mouch-har',
        latin: 'Mouch har',
        ar: 'موش حار',
        meaning: { fr: 'Pas piquant', en: 'Not spicy' },
        tip: {
          fr: 'La harissa arrive souvent d’office. « Chwaya har » : juste un peu piquant.',
          en: 'Harissa often comes with everything. “Chwaya har”: only a little spicy.',
        },
      },
      {
        id: 'saha',
        latin: 'Saha !',
        ar: 'صحّة',
        meaning: { fr: 'Santé, bon appétit, bravo', en: 'Cheers, enjoy, well done' },
        tip: {
          fr: 'Se dit après un repas, un hammam, une coupe de cheveux ou un habit neuf.',
          en: 'Said after a meal, a hammam, a haircut or new clothes.',
        },
      },
      {
        id: 'yezzi',
        latin: 'Yezzi',
        ar: 'يزّي',
        meaning: { fr: 'Ça suffit, assez', en: 'Enough' },
        tip: {
          fr: 'Pour refuser la troisième assiette avec politesse : « Yezzi, aychek ».',
          en: 'To turn down a third helping politely: “Yezzi, aychek”.',
        },
      },
    ],
  },
  {
    id: 'route',
    title: { fr: 'Sur la route', en: 'On the road' },
    words: [
      {
        id: 'mrigel',
        latin: 'Mrigel',
        ar: 'مريڨل',
        say: 'مريقل',
        meaning: { fr: 'Nickel, tout est réglé', en: 'Sorted, all good' },
      },
      {
        id: 'taw',
        latin: 'Taw',
        ar: 'توّا',
        meaning: { fr: 'Maintenant, tout de suite', en: 'Now, right away' },
        tip: {
          fr: '« Taw taw » veut dire tout de suite. En pratique, souvent « bientôt ».',
          en: '“Taw taw” means right away. In practice, often “soon”.',
        },
      },
      {
        id: 'win',
        latin: 'Win ?',
        ar: 'وين؟',
        meaning: { fr: 'Où ?', en: 'Where?' },
      },
      {
        id: 'ma-fhemtech',
        latin: 'Ma fhemtech',
        ar: 'ما فهمتش',
        meaning: { fr: 'Je n’ai pas compris', en: 'I didn’t understand' },
      },
      {
        id: 'inchallah',
        latin: 'Inchallah',
        ar: 'إن شاء الله',
        meaning: { fr: 'Si Dieu le veut', en: 'God willing' },
        tip: {
          fr: 'Une promesse, un espoir ou un « on verra » : tout dépend du ton.',
          en: 'A promise, a hope or a “we’ll see”: it depends on the tone.',
        },
      },
    ],
  },
];
