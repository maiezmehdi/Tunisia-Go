import type { Heritage } from './types';

const h = (x: Omit<Heritage, 'status'>): Heritage => ({ ...x, status: 'active' });

/**
 * Monuments and museums contained in a place page (LOT4-ENTITIES § 4.4). Places that already have
 * their own page (Bardo, El Jem, ribat of Monastir, Dougga…) are not repeated here.
 * The traditional heritage museum of Djerba is in Houmt Souk (S13): it is NOT the museum of the `guellala` page.
 */
export const HERITAGE: Heritage[] = [
  h({ id: 'heritage:grande-mosquee-kairouan', kind: 'mosque', name: { fr: 'Grande Mosquée de Kairouan', en: 'Great Mosque of Kairouan' }, in: ['place:kairouan'], sources: ['L-AGMK', 'S01'] }),
  h({ id: 'heritage:bassins-aghlabides', kind: 'monument', name: { fr: 'Bassins des Aghlabides', en: 'Aghlabid Basins' }, in: ['place:kairouan'], officialUrl: 'https://www.patrimoinedetunisie.com.tn/en/monuments/basins-of-the-aghlabids-kairouan/', sources: ['S09', 'S01'] }),
  h({ id: 'heritage:zitouna', kind: 'mosque', name: { fr: 'Mosquée Zitouna', en: 'Zitouna Mosque' }, in: ['place:medina-tunis'], sources: ['L-AZIT'] }),
  h({ id: 'heritage:ribat-sousse', kind: 'monument', name: { fr: 'Ribat de Sousse', en: 'Ribat of Sousse' }, in: ['place:sousse-medina'], sources: ['L-ARSOUSSE', 'S02'] }),
  h({ id: 'heritage:aqueduc-zaghouan-carthage', kind: 'monument', name: { fr: 'Aqueduc et temple des Eaux de Zaghouan-Carthage', en: 'Zaghouan-Carthage aqueduct and Water Temple' }, in: ['place:zaghouan', 'place:djebel-zaghouan'], sources: ['L-HYD', 'S08'] }),
  h({ id: 'heritage:thermes-antonin', kind: 'monument', name: { fr: 'Thermes d’Antonin', en: 'Antonine Baths' }, in: ['place:carthage'], sources: ['L-ABATHS'] }),
  h({ id: 'heritage:quartier-magon', kind: 'archaeological-site', name: { fr: 'Quartier Magon', en: 'Magon Quarter' }, in: ['place:carthage'], officialUrl: 'https://www.patrimoinedetunisie.com.tn/en/monuments/the-magon-quarter/', sources: ['S14'] }),
  h({ id: 'heritage:villas-romaines-carthage', kind: 'archaeological-site', name: { fr: 'Parc des villas romaines', en: 'Park of the Roman Villas' }, in: ['place:carthage'], officialUrl: 'https://patrimoinedetunisie.com.tn/en/monuments/the-park-of-the-roman-villas', sources: ['S15'] }),
  h({ id: 'heritage:musee-carthage', kind: 'museum', name: { fr: 'Musée de Carthage', en: 'Carthage Museum' }, in: ['place:carthage'], officialUrl: 'https://www.patrimoinedetunisie.com.tn/en/museums/the-carthage-museum/', sources: ['S10'] }),
  h({ id: 'heritage:musee-el-jem', kind: 'museum', name: { fr: 'Musée d’El Jem', en: 'El Jem Museum' }, in: ['place:el-jem'], officialUrl: 'https://patrimoinedetunisie.com.tn/en/museums/the-el-jem-museum', sources: ['S11'] }),
  h({ id: 'heritage:musee-sousse', kind: 'museum', name: { fr: 'Musée archéologique de Sousse', en: 'Sousse Archaeology Museum' }, in: ['place:sousse-medina'], officialUrl: 'https://www.patrimoinedetunisie.com.tn/en/museums/sousse-archaeology-museum/', sources: ['S12'] }),
  h({ id: 'heritage:musee-kerkouane', kind: 'museum', name: { fr: 'Musée de site de Kerkouane', en: 'Kerkouane Site Museum' }, in: ['place:kerkouane'], sources: ['L-AKERK'] }),
  h({ id: 'heritage:musee-patrimoine-djerba', kind: 'museum', name: { fr: 'Musée du patrimoine traditionnel de Djerba', en: 'Museum of the Traditional Heritage of Djerba' }, in: ['place:houmt-souk'], officialUrl: 'https://www.patrimoinedetunisie.com.tn/en/museums/the-museum-of-the-traditional-heritage-of-djerba/', sources: ['S13'] }),
];
