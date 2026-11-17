import type { KgEntity, Polity } from './types';

const active = { status: 'active' as const };

/**
 * Historical entities of phase 1 (LOT4-ENTITIES § 4.5): only those used by a sourced relation.
 * Amazighs, Andalusians and Moriscos are planned types but are created only when a sourced relation uses them.
 */
export const POLITIES: Polity[] = [
  { id: 'polity:abbassides', kind: 'dynasty', name: { fr: 'Abbassides', en: 'Abbasids' }, sources: ['L-ARMON'], ...active },
  { id: 'polity:aghlabides', kind: 'dynasty', name: { fr: 'Aghlabides', en: 'Aghlabids' }, sources: ['L-AGMK', 'L-ARSOUSSE', 'S09'], ...active },
  { id: 'polity:almohades', kind: 'dynasty', name: { fr: 'Almohades', en: 'Almohads' }, sources: ['L-U36'], ...active },
  { id: 'polity:hafsides', kind: 'dynasty', name: { fr: 'Hafsides', en: 'Hafsids' }, sources: ['L-U36'], ...active },
  { id: 'polity:numides', kind: 'people', name: { fr: 'Numides', en: 'Numidians' }, sources: ['L-ADOUGGA'], ...active },
  { id: 'polity:carthage-punique', kind: 'state', name: { fr: 'Carthage punique', en: 'Punic Carthage' }, sources: ['L-U37', 'L-U332'], ...active },
  { id: 'polity:rome', kind: 'state', name: { fr: 'Rome', en: 'Rome' }, sources: ['L-U37'], ...active },
];

export const PERSONS: KgEntity[] = [
  { id: 'person:harthama-ibn-ayan', kind: 'person', name: { fr: 'Harthama ibn A’yan', en: 'Harthama ibn A’yan' }, sources: ['L-ARMON'], ...active },
  { id: 'person:ziyadat-allah-1', kind: 'person', name: { fr: 'Ziyadat Allah Ier', en: 'Ziyadat Allah I' }, sources: ['L-ARSOUSSE', 'L-VST'], ...active },
  { id: 'person:abu-ibrahim-ahmad', kind: 'person', name: { fr: 'Abû Ibrâhîm Ahmad', en: 'Abu Ibrahim Ahmad' }, sources: ['S09'], ...active },
];

export const HISTORICAL_EVENTS: KgEntity[] = [
  { id: 'hevent:guerres-puniques', kind: 'historical-event', name: { fr: 'Guerres puniques', en: 'Punic Wars' }, sources: ['L-U332', 'L-AKERK'], ...active },
  { id: 'hevent:destruction-carthage-146', kind: 'historical-event', name: { fr: 'Destruction de Carthage (146 av. J.-C.)', en: 'Destruction of Carthage (146 BC)' }, sources: ['L-U37'], ...active },
];
