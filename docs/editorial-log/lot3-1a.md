# Relevé avant/après · Lot 3 · lot 1a

16 novembre 2026. Corrections factuelles de 10 fiches, en français et en anglais, dans le même commit. Sources lues le 16 novembre 2026. Règles : `docs/EDITORIAL-METHOD.md`. Registre : `docs/GEO-FACTUAL-VERIFICATION.md`.

`place_overrides` (Supabase) relu en lecture seule avant la PR : 0 ligne, donc le texte du dépôt est celui affiché.

`data/contentDates.ts` : date 2026-11-16 pour les 10 fiches (`sousse-medina` ajoutée à la liste ; `bardo` y était déjà).

## 1. `carthage`

**Source** (Institutionnelle) : AMVPPC, Les thermes d'Antonin. https://www.patrimoinedetunisie.com.tn/en/monuments/the-antoninian-baths/overview/

**Raison** : « the thermal baths are the largest in Africa » ; bâtiments de service « immediately accessible from the sea », par où arrivait le combustible des chaufferies ; pas de salles de service en sous-sol. « Esclaves » et « hors de Rome » : dans aucune source lue.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| didYouKnow | EN | `tunisiaData.ts` | The Antonine Baths were among the largest Roman baths ever built outside Rome itself. What you walk through today is mostly the basement level, where slaves stoked the furnaces. | The Antonine Baths were the largest Roman baths in Africa. What you walk through today is their lower level: the service rooms, where fuel for the boiler rooms arrived from the sea. |
| didYouKnow | FR | `places.fr.a.ts` | Les thermes d’Antonin comptaient parmi les plus vastes jamais construits hors de Rome. Ce que l’on parcourt aujourd’hui correspond surtout au niveau inférieur, où les esclaves alimentaient les fourneaux. | Les thermes d’Antonin étaient les plus grands thermes romains d’Afrique. On parcourt aujourd’hui leur niveau inférieur : les salles de service, où le combustible des chaufferies arrivait depuis la mer. |

## 2. `dougga`

**Source** (Institutionnelle) : UNESCO, Dougga / Thugga (n° 794) ; AMVPPC, site archéologique de Dougga. https://whc.unesco.org/en/list/794/ · https://www.patrimoinedetunisie.com.tn/en/sites/the-archaeological-site-of-dougga/

**Raison** : UNESCO : « considered the best preserved example of an Africo-Roman town in North Africa ». Le chiffre de 3 500 places n'est ni à l'UNESCO ni à l'AMVPPC. Titres du guide : superlatif retiré à ta demande (EN), et en FR pour la parité et la règle 5.3 de la méthode.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| tagline | EN | `tunisiaData.ts` | tagline: 'The best-preserved Roman town in North Africa' | tagline: "Considered North Africa's best-preserved Africo-Roman town" |
| tagline | FR | `places.fr.a.ts` | tagline: 'La ville romaine la mieux conservée d’Afrique du Nord' | tagline: 'Considérée comme la ville africo-romaine la mieux conservée d’Afrique du Nord' |
| description | EN | `tunisiaData.ts` | a 3,500-seat theatre, the Capitol | a theatre, the Capitol |
| description | FR | `places.fr.a.ts` | un théâtre de 3 500 places, le Capitole | un théâtre, le Capitole |
| guide.title | EN | `placeGuides.ts` | 'Visiting Dougga: the best-preserved Roman town in Tunisia' | 'Visiting Dougga: Roman town, Capitol and theatre near Teboursouk' |
| guide.title | FR | `placeGuides.ts` | 'Visiter Dougga : la cité romaine la mieux conservée' | 'Visiter Dougga : cité romaine, Capitole et théâtre près de Teboursouk' |
| guide.see[0] | EN | `placeGuides.ts` | Next door, the theatre seats about 3,500 people and opens onto the valley | Next door, the theatre opens onto the valley |
| guide.see[0] | FR | `placeGuides.ts` | Juste à côté, le théâtre peut accueillir environ 3 500 spectateurs et s’ouvre sur la vallée | Juste à côté, le théâtre s’ouvre sur la vallée |

## 3. `bardo`

**Source** (Institutionnelle) : AMVPPC, Musée national du Bardo. https://www.patrimoinedetunisie.com.tn/en/museums/the-national-bardo-museum/overview/

**Raison** : « a 19th century Bey palace », musée inauguré le 7 mai 1888.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| description | EN | `tunisiaData.ts` | Housed in a 15th-century Hafsid palace | Housed in a 19th-century beylical palace |
| description | FR | `places.fr.a.ts` | Installé dans un palais hafside du XVe siècle | Installé dans un palais beylical du XIXe siècle |

## 4. `kerkouane`

**Source** (Institutionnelle + académique) : UNESCO, Cité punique de Kerkuane (n° 332) ; Fantar et Guirguis, « Kerkouane 2022-2023: first report on the excavation campaigns of the Tunisian-Italian archaeological mission (INP-UNISS) », CaSteR, 2024. https://whc.unesco.org/en/list/332/ · https://ojs.unica.it/index.php/caster/article/view/6306

**Raison** : UNESCO : « discovered in 1952 ». CaSteR : collaboration INP (Tunisie) et université de Sassari, recherches « between 2022 and 2023 ». Le murex n'apparaît dans aucune source lue. La date d'abandon reste dans la rubrique Histoire sous la forme « milieu du IIIe siècle av. J.-C. » : l'UNESCO écrit « probably … (c. 250 B.C.) », donc 250 n'est pas repris.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| didYouKnow | EN | `tunisiaData.ts` | Heaps of murex shells were found on the site: the town made the purple dye that Phoenicians were famous for. | The site was only discovered in 1952. In 2022 and 2023, a Tunisian-Italian archaeological mission (Tunisia’s National Heritage Institute and the University of Sassari) carried out new excavations there. |
| didYouKnow | FR | `places.fr.b.ts` | On a retrouvé sur le site des amas de coquillages de murex : la ville fabriquait la teinture pourpre qui fit la renommée des Phéniciens. | Le site n’a été découvert qu’en 1952. En 2022 et 2023, une mission archéologique tuniso-italienne (Institut national du patrimoine et université de Sassari) y a mené de nouvelles fouilles. |

## 5. `sousse-medina`

**Source** (Institutionnelle + académique) : AMVPPC, Ribat de Sousse ; J.-P. Van Staëvel, Religions 14(8), 1051, 2023. https://www.patrimoinedetunisie.com.tn/en/monuments/ribat-of-sousse/overview/ · https://www.mdpi.com/2077-1444/14/8/1051

**Raison** : AMVPPC : tour « added by Ziyadat Allah I in 821 AD », « cylindrical watchtower », « served as a minaret for the neighboring mosque ». Aucun signal de feu dans les deux sources.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| didYouKnow | EN | `tunisiaData.ts` | Its watchtower once signalled by fire to the next ribat along the coast. | Its round tower was added in 821 by the Aghlabid emir Ziyadat Allah I: it is described as a watchtower, but it also served as the minaret of the neighbouring mosque. |
| didYouKnow | FR | `places.fr.a.ts` | Sa tour de guet communiquait autrefois par des feux avec le ribat suivant sur la côte. | Sa tour ronde a été ajoutée en 821 par l’émir aghlabide Ziyadat Allah Ier : on la décrit comme une tour de guet, mais elle servait aussi de minaret à la mosquée voisine. |

## 6. `thuburbo-majus`

**Source** (Institutionnelle) : AMVPPC, Thuburbo Maius. https://www.patrimoinedetunisie.com.tn/en/sites/thuburbo-maius/

**Raison** : « The oldest archeological evidence of the town dates back to the Punic period » ; « municipium under Hadrian and honorary colony under Commodus » ; « restoration works of the 4th century ». Aucune date pour le Capitole ; « après les troubles du IIIe » non lu, retiré.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| description | EN | `tunisiaData.ts` | Thuburbo Majus was a Punic town that became a Roman colony under Augustus in 27 BC. Most of what stands today dates from the 2nd and 3rd centuries AD: the forum, the Capitolium (dedicated in AD 168), baths, | Thuburbo Majus is a town whose oldest remains go back to the Punic period. Most of what stands today dates from the 2nd and 3rd centuries AD: the forum, the Capitolium, baths, |
| description | FR | `places.fr.b.ts` | Thuburbo Majus était une ville punique devenue colonie romaine sous Auguste, en 27 av. J.-C. L’essentiel de ce qu’on voit date des IIe et IIIe siècles : le forum, le Capitole (dédié en 168), des thermes, | Thuburbo Majus est une ville dont les plus anciens vestiges remontent à l’époque punique. L’essentiel de ce qu’on voit date des IIe et IIIe siècles : le forum, le Capitole, des thermes, |
| insights.history | EN | `tunisiaData.ts` | Hadrian made it a municipium and Commodus a colony. It was restored in the 4th century after the troubles of the 3rd. | Hadrian made it a municipium and Commodus an honorary colony. The town was restored in the 4th century. |
| insights.history | FR | `places.fr.b.ts` | Hadrien en fit un municipe et Commode une colonie. Elle fut restaurée au IVe siècle après les troubles du IIIe. | Hadrien en fit un municipe et Commode une colonie honoraire. La ville fut restaurée au IVe siècle. |

## 7. `zaghouan`

**Source** (Académique) : Projet Hydria, Water supply in Roman Carthage. https://www.hydriaproject.info/en/case-studies/water-supply-in-roman-carthage/waterworks

**Raison** : « Traveling 132 km… the Zaghouan aqueduct ».

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| description | EN | `tunisiaData.ts` | an aqueduct, more than 100 km long, once carried | an aqueduct about 132 km long once carried |
| description | FR | `places.fr.b.ts` | un aqueduc de plus de 100 km acheminait | un aqueduc d’environ 132 km acheminait |

## 8. `djebel-zaghouan`

**Source** (Académique) : Projet Hydria, Water supply in Roman Carthage. https://www.hydriaproject.info/en/case-studies/water-supply-in-roman-carthage/waterworks

**Raison** : 132 km. Hydria écrit aussi « the longest of Roman antiquity » ; non repris, par prudence, faute d'une seconde source (EN seulement avant, retiré).

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| didYouKnow | EN | `tunisiaData.ts` | through an aqueduct of about 130 km, one of the longest of the Roman world. | through an aqueduct of about 132 km. |
| didYouKnow | FR | `places.fr.b.ts` | par un aqueduc de plus de 130 km. | par un aqueduc d’environ 132 km. |

## 9. `ksar-hadada`

**Source** (Secondaire) : Star Wars Locations, Ksar Hadada. https://www.starwarslocations.com/swarchive/RealTales/ksour/hadada.html

**Raison** : Tournage présenté comme tel, avec la formule déjà employée pour Ksar Ouled Soltane (PR 132). L'accroche ne cite plus le film.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| tagline | EN | `tunisiaData.ts` | tagline: 'Granaries that became Mos Espa' | tagline: 'A ksar of ghorfas near Ghomrassen' |
| tagline | FR | `places.fr.b.ts` | tagline: 'Des greniers devenus Mos Espa' | tagline: 'Un ksar de ghorfas près de Ghomrassen' |
| description | EN | `tunisiaData.ts` | Part of it was used as the slave quarters of Mos Espa in "The Phantom Menace". | According to fans who have studied the shoot, part of it was used for the Mos Espa slave quarters in "The Phantom Menace". |
| description | FR | `places.fr.b.ts` | Une partie a servi de quartier des esclaves de Mos Espa dans « La Menace fantôme ». | Selon les passionnés qui ont étudié le tournage, une partie a servi au quartier des esclaves de Mos Espa dans « La Menace fantôme ». |

## 10. `lezard-rouge`

**Source** (Secondaire) : Tuniscope, « Train touristique : le Lézard Rouge », 6 mars 2018 ; SiViaggia, « Il ritorno del Lézard Rouge », 29 août 2025. https://www.tuniscope.com/article/126/cityguide/transport/train-tourisque-le-lezard-rouge · https://siviaggia.it/notizie/ritorno-lezard-rouge-treno-storico-tunisia/551749/

**Raison** : Les deux donnent 1910 ; « voiture beylicale » (Tuniscope), train du « bey di Tunisi e della sua corte » (SiViaggia). Aucune ne parle de voiture-restaurant (Tuniscope cite une voiture-bar). Elles divergent sur le lieu de construction (France / Louvain), non publié. Service irrégulier : « quand il circule ». Pas de source SNCFT lue.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| description | EN | `tunisiaData.ts` | From Metlaoui, an old train built for the Bey of Tunis runs into the Selja Gorges, | From Metlaoui, when it is running, an old train presented as the Bey of Tunis’s train heads into the Selja Gorges, |
| description | FR | `places.fr.b.ts` | Depuis Metlaoui, un ancien train construit pour le bey de Tunis s’enfonce dans les gorges de Selja, | Depuis Metlaoui, quand il circule, un ancien train présenté comme celui du bey de Tunis s’enfonce dans les gorges de Selja, |
| didYouKnow | EN | `tunisiaData.ts` | The carriages were built in 1910 and reserved for the Bey and his court, with a restaurant car. | According to Tunisian and Italian press reports, the carriages date from 1910 and belonged to the Bey of Tunis and his court. |
| didYouKnow | FR | `places.fr.b.ts` | Les voitures ont été construites en 1910 et réservées au bey et à sa cour, avec une voiture-restaurant. | Selon la presse tunisienne et italienne, les voitures datent de 1910 et étaient celles du bey de Tunis et de sa cour. |

## Titres et descriptions (SEO)

| Page | Langue | Avant | Après |
|---|---|---|---|
| Guide Dougga, `<title>` | EN | Visiting Dougga: the best-preserved Roman town in Tunisia | Visiting Dougga: Roman town, Capitol and theatre near Teboursouk |
| Guide Dougga, `<title>` | FR | Visiter Dougga : la cité romaine la mieux conservée | Visiter Dougga : cité romaine, Capitole et théâtre près de Teboursouk |

Meta descriptions des guides : inchangées. Pour les 8 fiches sans guide long, la meta description est construite à partir de l'accroche et de la description : elle suit donc les changements ci-dessus (Bardo, Kerkouane, Sousse, Thuburbo Majus, Zaghouan, Djebel Zaghouan, Ksar Hadada, Lézard Rouge). Carthage garde la meta de son guide.

**Note** : dans un relevé, « Avant » cite seulement le passage modifié ; le reste du champ ne change pas.
