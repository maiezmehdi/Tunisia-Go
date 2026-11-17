import type { Designation } from './types';

const d = (x: Omit<Designation, 'status'>): Designation => ({ ...x, status: 'active' });

/**
 * Official statuses (LOT4-ENTITIES § 4.2). Dates only when an official source states them.
 * No component of a serial property is listed: none has been read (LOT4-OPEN-ISSUES § 4).
 */
export const DESIGNATIONS: Designation[] = [
  d({ id: 'designation:whc-37', kind: 'whc', name: { fr: 'Site archéologique de Carthage', en: 'Archaeological Site of Carthage' }, officialId: '37', officialUrl: 'https://whc.unesco.org/en/list/37/', date: '1979', dateSource: 'L-AWH', sources: ['L-U37', 'L-AWH'] }),
  d({ id: 'designation:whc-36', kind: 'whc', name: { fr: 'Médina de Tunis', en: 'Medina of Tunis' }, officialId: '36', officialUrl: 'https://whc.unesco.org/en/list/36/', date: '1979', dateSource: 'L-AWH', sources: ['L-U36', 'L-AWH'] }),
  d({ id: 'designation:whc-38', kind: 'whc', name: { fr: 'Amphithéâtre d’El Jem', en: 'Amphitheatre of El Jem' }, officialId: '38', officialUrl: 'https://whc.unesco.org/en/list/38/', date: '1979', dateSource: 'L-AWH', sources: ['L-U38', 'L-AWH'] }),
  d({ id: 'designation:whc-8', kind: 'whc', name: { fr: 'Parc national de l’Ichkeul', en: 'Ichkeul National Park' }, officialId: '8', officialUrl: 'https://whc.unesco.org/en/list/8/', sources: ['S17', 'S16'] }),
  d({ id: 'designation:whc-332', kind: 'whc', name: { fr: 'Cité punique de Kerkouane et sa nécropole', en: 'Punic Town of Kerkuane and its Necropolis' }, officialId: '332', officialUrl: 'https://whc.unesco.org/en/list/332/', date: '1985', dateSource: 'L-U332', sources: ['L-U332'] }),
  d({ id: 'designation:whc-499', kind: 'whc', name: { fr: 'Kairouan', en: 'Kairouan' }, officialId: '499', officialUrl: 'https://whc.unesco.org/en/list/499/', date: '1988', dateSource: 'L-AWH', sources: ['S01', 'L-AWH'] }),
  d({ id: 'designation:whc-498', kind: 'whc', name: { fr: 'Médina de Sousse', en: 'Medina of Sousse' }, officialId: '498', officialUrl: 'https://whc.unesco.org/en/list/498/', date: '1988', dateSource: 'L-AWH', sources: ['S02', 'L-AWH'] }),
  d({ id: 'designation:whc-794', kind: 'whc', name: { fr: 'Dougga / Thugga', en: 'Dougga / Thugga' }, officialId: '794', officialUrl: 'https://whc.unesco.org/en/list/794/', date: '1997', dateSource: 'L-AWH', sources: ['L-U794', 'L-AWH'] }),
  d({ id: 'designation:whc-1640', kind: 'whc', name: { fr: 'Djerba : témoignage d’un mode d’occupation d’un territoire insulaire', en: 'Djerba: Testimony to a settlement pattern in an island territory' }, officialId: '1640', officialUrl: 'https://whc.unesco.org/en/list/1640/', sources: ['S03'] }),
  d({ id: 'designation:whc-1769', kind: 'whc', name: { fr: 'Village de Sidi Bou Saïd', en: 'Village of Sidi Bou Saïd' }, officialId: '1769', officialUrl: 'https://whc.unesco.org/en/list/1769/', date: '2026', dateSource: 'L-U1769', sources: ['L-U1769'] }),
  d({ id: 'designation:tl-6278', kind: 'whc-tentative', name: { fr: 'La Table de Jugurtha à Kalaat Senan', en: 'The Table of Jugurtha at Kalaat Senan' }, officialId: '6278', officialUrl: 'https://whc.unesco.org/fr/listesindicatives/6278/', date: '2017-09-29', dateSource: 'L-T6278', sources: ['L-T6278'] }),
  d({ id: 'designation:tl-5385', kind: 'whc-tentative', name: { fr: 'Chott el Jérid', en: 'Chott el Jerid' }, officialId: '5385', officialUrl: 'https://whc.unesco.org/en/tentativelists/5385/', sources: ['L-T5385'] }),
  d({ id: 'designation:tl-5384', kind: 'whc-tentative', name: { fr: 'Parc National de Bouhedma', en: 'Parc National de Bouhedma' }, officialId: '5384', officialUrl: 'https://whc.unesco.org/en/tentativelists/5384/', date: '2008-05-28', dateSource: 'S07', sources: ['S07'] }),
  d({ id: 'designation:tl-5685', kind: 'whc-tentative', name: { fr: 'Le complexe hydraulique romain de Zaghouan-Carthage', en: 'The Roman hydraulic complex of Zaghouan-Carthage' }, officialId: '5685', officialUrl: 'https://whc.unesco.org/fr/listesindicatives/5685/', date: '2012-02-17', dateSource: 'S08', sources: ['S08'] }),
  d({ id: 'designation:ramsar-1710', kind: 'ramsar', name: { fr: 'Sebkhet Kelbia (site Ramsar)', en: 'Sebkhet Kelbia (Ramsar Site)' }, officialId: '1710', officialUrl: 'https://rsis.ramsar.org/ris/1710', date: '2007-11-07', dateSource: 'L-RAM', sources: ['L-RAM'] }),
  d({ id: 'designation:ramsar-213', kind: 'ramsar', name: { fr: 'Ichkeul (site Ramsar)', en: 'Ichkeul (Ramsar Site)' }, officialId: '213', officialUrl: 'https://rsis.ramsar.org/ris/213', date: '1980-11-24', dateSource: 'S16', sources: ['S16'] }),
  d({ id: 'designation:mab-bouhedma', kind: 'biosphere', name: { fr: 'Réserve de biosphère de Bouhedma', en: 'Bouhedma Biosphere Reserve' }, date: '1977', dateSource: 'S07', sources: ['S07', 'S18'] }),
  d({ id: 'designation:mab-ichkeul', kind: 'biosphere', name: { fr: 'Réserve de biosphère de l’Ichkeul', en: 'Ichkeul Biosphere Reserve' }, sources: ['S16'] }),
  d({ id: 'designation:np-bouhedma', kind: 'national-park', name: { fr: 'Parc national de Bouhedma', en: 'Bouhedma National Park' }, officialId: 'décret n° 80-1606', date: '1980-12-18', dateSource: 'S18', sources: ['S07', 'S18'] }),
  d({ id: 'designation:np-jbil', kind: 'national-park', name: { fr: 'Parc national de Jbil', en: 'Jbil National Park' }, officialId: 'décret n° 94-2210', date: '1994-10-24', dateSource: 'S18', sources: ['S19', 'S18'] }),
];
