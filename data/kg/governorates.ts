import type { KgEntity, Labels } from './types';

/** The four zones of the assistant (lib/assistant/engine.ts). */
export type AssistantZone = 'nord' | 'capbon' | 'centre' | 'sud';

export interface Governorate extends KgEntity {
  /** Values of `Place.region` (English base data) that name this governorate. */
  regionNames: string[];
  zone: AssistantZone;
}

const gov = (
  key: string,
  name: Labels,
  ar: string,
  zone: AssistantZone,
  regionNames: string[] = [name.en],
): Governorate => ({
  id: `gov:${key}`,
  kind: 'governorate',
  name,
  nameAr: { text: ar, source: 'S21' },
  status: 'active',
  sources: ['S20', 'S21'],
  regionNames,
  zone,
});

/**
 * The 24 governorates listed by the Institut national de la statistique (S20, S21, read on 17/11/2026).
 * English and French names keep the spelling already used on the site (the French pages write « Kébili »
 * and « Le Kef »); Arabic names are copied from the INS Arabic page.
 */
export const GOVERNORATES: Governorate[] = [
  gov('tunis', { fr: 'Tunis', en: 'Tunis' }, 'تونس', 'nord'),
  gov('ariana', { fr: 'Ariana', en: 'Ariana' }, 'أريانة', 'nord'),
  gov('ben-arous', { fr: 'Ben Arous', en: 'Ben Arous' }, 'بن عروس', 'nord'),
  gov('manouba', { fr: 'Manouba', en: 'Manouba' }, 'منوبة', 'nord'),
  gov('nabeul', { fr: 'Nabeul', en: 'Nabeul' }, 'نابل', 'capbon'),
  gov('zaghouan', { fr: 'Zaghouan', en: 'Zaghouan' }, 'زغوان', 'nord'),
  gov('bizerte', { fr: 'Bizerte', en: 'Bizerte' }, 'بنزرت', 'nord'),
  gov('beja', { fr: 'Béja', en: 'Béja' }, 'باجة', 'nord'),
  gov('jendouba', { fr: 'Jendouba', en: 'Jendouba' }, 'جندوبة', 'nord'),
  gov('kef', { fr: 'Le Kef', en: 'El Kef' }, 'الكاف', 'nord'),
  gov('siliana', { fr: 'Siliana', en: 'Siliana' }, 'سليانة', 'nord'),
  gov('sousse', { fr: 'Sousse', en: 'Sousse' }, 'سوسة', 'centre'),
  gov('monastir', { fr: 'Monastir', en: 'Monastir' }, 'المنستير', 'centre'),
  gov('mahdia', { fr: 'Mahdia', en: 'Mahdia' }, 'المهدية', 'centre'),
  gov('sfax', { fr: 'Sfax', en: 'Sfax' }, 'صفاقس', 'centre'),
  gov('kairouan', { fr: 'Kairouan', en: 'Kairouan' }, 'القيروان', 'centre'),
  gov('kasserine', { fr: 'Kasserine', en: 'Kasserine' }, 'القصرين', 'centre'),
  gov('sidi-bouzid', { fr: 'Sidi Bouzid', en: 'Sidi Bouzid' }, 'سيدي بوزيد', 'centre'),
  gov('gabes', { fr: 'Gabès', en: 'Gabès' }, 'قابس', 'sud'),
  gov('medenine', { fr: 'Médenine', en: 'Médenine' }, 'مدنين', 'sud'),
  gov('tataouine', { fr: 'Tataouine', en: 'Tataouine' }, 'تطاوين', 'sud'),
  gov('gafsa', { fr: 'Gafsa', en: 'Gafsa' }, 'قفصة', 'sud'),
  gov('tozeur', { fr: 'Tozeur', en: 'Tozeur' }, 'توزر', 'sud'),
  gov('kebili', { fr: 'Kébili', en: 'Kebili' }, 'قبلي', 'sud'),
];

export const COUNTRY = {
  id: 'country:tn' as const,
  name: { fr: 'Tunisie', en: 'Tunisia' },
};
