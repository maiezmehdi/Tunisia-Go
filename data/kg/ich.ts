import type { KgEntity } from './types';

export interface IchElement extends KgEntity {
  kind: 'ich-representative';
  /** Year and decision of inscription, as shown on the UNESCO page. */
  inscribed: { year: string; decision: string };
}

/**
 * Intangible cultural heritage elements inscribed for Tunisia (LOT4-ENTITIES § 4.3).
 * Only the English UNESCO pages were read (S04 to S06): `name.fr` is an editorial translation.
 * Where each element is practised is a relation (`ichPracticedIn`, data/kg/relations.ts), never a field.
 */
export const ICH: IchElement[] = [
  {
    id: 'ich:01710',
    kind: 'ich-representative',
    name: {
      fr: 'Harissa, savoirs, savoir-faire et pratiques culinaires et sociales',
      en: 'Harissa, knowledge, skills and culinary and social practices',
    },
    officialId: '01710',
    officialUrl: 'https://ich.unesco.org/en/RL/harissa-knowledge-skills-and-culinary-and-social-practices-01710',
    inscribed: { year: '2022', decision: '17.COM 7.b.30' },
    status: 'active',
    sources: ['S04'],
  },
  {
    id: 'ich:01406',
    kind: 'ich-representative',
    name: { fr: 'Savoir-faire des potières de Sejnane', en: 'Pottery skills of the women of Sejnane' },
    officialId: '01406',
    officialUrl: 'https://ich.unesco.org/en/RL/pottery-skills-of-the-women-of-sejnane-01406',
    inscribed: { year: '2018', decision: '13.COM 10.b.38' },
    status: 'active',
    sources: ['S05'],
  },
  {
    id: 'ich:01566',
    kind: 'ich-representative',
    name: { fr: 'La pêche à la charfia aux îles Kerkennah', en: 'Charfia fishing in the Kerkennah Islands' },
    officialId: '01566',
    officialUrl: 'https://ich.unesco.org/en/RL/01566',
    inscribed: { year: '2020', decision: '15.COM 8.b.9' },
    status: 'active',
    sources: ['S06'],
  },
];
