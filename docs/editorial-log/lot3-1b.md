# Relevé avant/après · Lot 3 · lot 1b

16 novembre 2026. Corrections factuelles de 10 fiches, en français et en anglais, dans le même commit. Toutes les sources ont été lues le 16 novembre 2026. Règles : `docs/EDITORIAL-METHOD.md`. Registre : `docs/GEO-FACTUAL-VERIFICATION.md`.

`place_overrides` (Supabase) relu en lecture seule avant la PR : 0 ligne.

`data/contentDates.ts` : 2026-11-16 pour les 10 fiches (`el-jem` y était déjà).

Dans le tableau, « Avant » ne cite que le passage modifié. Le reste du champ ne change pas.

## 1. `monastir`

**Sources** (consultées le 16 novembre 2026) :
- AMVPPC, Ribat of Monastir (institutionnelle) : https://www.patrimoinedetunisie.com.tn/en/monuments/ribat-of-monastir/
- Movie Locations, « Monty Python’s Life Of Brian » (secondaire) : https://www.movie-locations.com/movies/l/Life-Of-Brian.php

**Raison** : AMVPPC : construit par Harthimâ ibn A’yûn « in the year 179-180 A.H. / 795-796 A.D. » ; son plan « was to become the model used in all major ribats of Ifriqiya ». La page ne dit pas qu’il est le plus ancien : le superlatif est retiré. « De nombreux films » devient « décor de cinéma ». La Vie de Brian : « most of the film was shot in the Ribat » (secondaire) ; l’année 1978 n’est dans aucune source lue, elle est retirée.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| description | EN | `tunisiaData.ts` | The oldest ribat in North Africa, founded in 796, stands right by the water. Its walls and towers have been used as a set by many films. | Founded in 795–796, the ribat stands right by the water. Its plan became the model for all the major ribats of Ifriqiya, and its walls and towers have served as a film set. |
| description | FR | `places.fr.a.ts` | Le plus ancien ribat d’Afrique du Nord, fondé en 796, se dresse au ras de l’eau. Ses remparts et ses tours ont servi de décor à de nombreux films. | Fondé en 795-796, le ribat se dresse au ras de l’eau. Son plan a servi de modèle à tous les grands ribats d’Ifriqiya, et ses remparts et ses tours ont servi de décor de cinéma. |
| didYouKnow | EN | `tunisiaData.ts` | 'Scenes from Monty Python\'s "Life of Brian" were filmed at the Ribat of Monastir in 1978.' | 'According to film-location guides, much of Monty Python\'s "Life of Brian" was shot at the Ribat of Monastir.' |
| didYouKnow | FR | `places.fr.a.ts` | Des scènes de « La Vie de Brian » des Monty Python ont été tournées au Ribat de Monastir en 1978. | Selon les guides des lieux de tournage, une grande partie de « La Vie de Brian » des Monty Python a été tournée au ribat de Monastir. |

## 2. `table-de-jugurtha`

**Sources** (consultées le 16 novembre 2026) :
- UNESCO, liste indicative, « La Table de Jugurtha à Kalaat Senan » (n° 6278) (institutionnelle) : https://whc.unesco.org/fr/listesindicatives/6278/

**Raison** : « superficie de la terrasse est d’environ 82 hectares » ; « Du haut de ses 1200 m » ; « parois rugueuses hautes de plus de 50 mètres » ; accès par « un sentier étroit » (Salluste), sans escalier ; « Date de soumission : 29/09/2017 » ; « À la fin de la période médiévale, le territoire prend le toponyme de « Galaat-Senen » ». Les 600 m au-dessus de la plaine, les 136 marches et le rebelle Senan du XVIIIe siècle ne sont dans aucune source lue : retirés.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| description | EN | `tunisiaData.ts` | a flat-topped mountain rises about 600 m above the plain. A stairway cut into the rock, 136 steps, leads to a summit plateau of about 80 hectares with | a flat-topped mountain rises to about 1,200 m, with cliffs more than 50 m high. The climb leads to a summit plateau of about 82 hectares with |
| description | FR | `places.fr.b.ts` | une montagne tabulaire s’élève d’environ 600 m au-dessus de la plaine. Un escalier de 136 marches taillé dans la roche mène à un plateau sommital d’environ 80 hectares, | une montagne tabulaire culmine à environ 1 200 m, avec des parois de plus de 50 m. La montée mène à un plateau sommital d’environ 82 hectares, |
| insights.history | EN | `tunisiaData.ts` | In the 18th century, the rebel Senan held it against the Bey’s troops and gave the town its name. | At the end of the medieval period, the area took the name Galaat-Senen. The site has been on Tunisia’s World Heritage tentative list since 2017. |
| insights.history | FR | `places.fr.b.ts` | Au XVIIIe siècle, le rebelle Senan y tint tête aux troupes du bey et donna son nom à la ville. | À la fin de l’époque médiévale, le lieu prend le nom de Galaat-Senen. Le site figure depuis 2017 sur la liste indicative de la Tunisie pour le patrimoine mondial. |

## 3. `ain-draham`

**Sources** (consultées le 16 novembre 2026) :
- M.R. Kallel et R.C. Gouyet, Étude hydrologique préliminaire des oueds Zeroud et Merguellil, chap. II « La pluviométrie », service hydrologique et ORSTOM, juin 1975 (académique) : https://core.ac.uk/download/39882289.pdf

**Raison** : « zone très pluvieuse recevant plus de 600 mm/an », « limitée à la Kroumirie et aux régions côtières Nord Ouest ». Aucune source lue ne donne 1 500 mm ni un record national pour Aïn Draham (la presse ne cite que des cumuls d’une journée, par exemple webdo.tn, 22/01/2026, d’après l’INM). Le superlatif et le record sont retirés. La normale de l’INM reste à obtenir.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| tagline | EN | `tunisiaData.ts` | tagline: 'Cork-oak forest in the rainiest town in Tunisia' | tagline: 'Cork-oak forest in the Kroumirie' |
| tagline | FR | `places.fr.b.ts` | tagline: 'La forêt de chênes-lièges de la ville la plus pluvieuse de Tunisie' | tagline: 'La forêt de chênes-lièges de la Kroumirie' |
| description | EN | `tunisiaData.ts` | in Jendouba governorate, with the highest rainfall in Tunisia, around 1,500 mm a year. | in Jendouba governorate, in one of the rainiest areas of Tunisia. |
| description | FR | `places.fr.b.ts` | dans le gouvernorat de Jendouba, où il pleut plus que partout ailleurs en Tunisie : environ 1 500 mm par an. | dans le gouvernorat de Jendouba, dans l’une des zones les plus pluvieuses de Tunisie. |
| didYouKnow | EN | `tunisiaData.ts` | Its rainfall is a national record, several times that of Tunis. | A 1975 hydrological study by Tunisia’s hydrological service and ORSTOM places the Kroumirie in the country’s “very rainy” zone, with more than 600 mm a year. |
| didYouKnow | FR | `places.fr.b.ts` | Ses précipitations sont un record national, plusieurs fois celles de Tunis. | Une étude hydrologique de 1975, menée par le service hydrologique tunisien et l’ORSTOM, range la Kroumirie dans la « zone très pluvieuse » du pays, avec plus de 600 mm par an. |

## 4. `douz`

**Sources** (consultées le 16 novembre 2026) :
- L’Economiste Maghrébin, « La 46ème session du Festival international du Sahara de Douz », 20/12/2013 (secondaire) : https://www.leconomistemaghrebin.com/2013/12/20/la-46eme-session-du-festival-international-du-sahara-de-douz/

**Raison** : En 1910, une « Fête du dromadaire », « un marathon de Méharis sous l’égide du Résident Général français » ; « s’est mué en une manifestation hautement culturelle et divertissante à partir de 1967 ». « Chaque hiver depuis 1910 » suggérait une continuité que la source n’affirme pas.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| didYouKnow | EN | `tunisiaData.ts` | The International Festival of the Sahara in Douz, held each winter since 1910, features camel races, poetry and traditional Mrazig weddings. | According to the Tunisian press, the International Festival of the Sahara in Douz goes back to a camel race held in 1910, and became a cultural festival in 1967. It features camel races, poetry and traditional Mrazig weddings. |
| didYouKnow | FR | `places.fr.b.ts` | Le Festival international du Sahara de Douz, organisé chaque hiver depuis 1910, réunit courses de dromadaires, poésie et mariages traditionnels mrazig. | Selon la presse tunisienne, le Festival international du Sahara de Douz remonte à une course de méharis organisée en 1910, et il est devenu un festival culturel en 1967. Il réunit courses de dromadaires, poésie et mariages traditionnels mrazig. |

## 5. `medina-tunis`

**Sources** (consultées le 16 novembre 2026) :
- AMVPPC, Az-Zaytuna Mosque (institutionnelle) : https://www.patrimoinedetunisie.com.tn/en/monuments/az-zaytuna-mosque/overview/
- UNESCO, Medina of Tunis (n° 36) (institutionnelle) : https://whc.unesco.org/en/list/36/

**Raison** : AMVPPC : « founded around the year 79 AH / 699 AD by the Ghassanid general Hassan ibn Nu’man », puis « rebuilt by Ubayd Allah ibn al-Habhab » en « 110 AH / 728-729 AD ». « Fondée au VIIIe siècle » était donc inexact. UNESCO : sous les Almohades et les Hafsides (XIIe-XVIe s.), « Tunis was considered one of the greatest and wealthiest cities in the Islamic world ».

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| insights.history | EN | `tunisiaData.ts` | founded in the 8th century, and peaked under the Hafsid dynasty when Tunis was a capital of the Islamic world. | founded around 699 and rebuilt in 728–729. Under the Almohads and the Hafsids, from the 12th to the 16th century, Tunis was considered one of the greatest and wealthiest cities in the Islamic world. |
| insights.history | FR | `places.fr.a.ts` | fondée au VIIIe siècle, et connut son apogée sous la dynastie hafside, lorsque Tunis était l’une des capitales du monde islamique. | fondée vers 699 et reconstruite en 728-729. Sous les Almohades et les Hafsides, du XIIe au XVIe siècle, Tunis était considérée comme l’une des villes les plus grandes et les plus riches du monde islamique. |

## 6. `el-jem`

**Sources** (consultées le 16 novembre 2026) :
- UNESCO, Amphitheatre of El Jem (n° 38) (institutionnelle) : https://whc.unesco.org/en/list/38/

**Raison** : « The wall of the podium, the arena and the underground passages are practically intact. » Aucune source lue ne dit « l’un des mieux conservés au monde » : la formule de l’UNESCO la remplace dans la fiche et dans le guide.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| description | EN | `tunisiaData.ts` | Thysdrus's amphitheatre is one of the best-preserved in the world. | Thysdrus's amphitheatre has kept its podium wall, arena and underground passages practically intact. |
| description | FR | `places.fr.a.ts` | l’amphithéâtre de Thysdrus est l’un des mieux conservés au monde. | l’amphithéâtre de Thysdrus a conservé presque intacts le mur du podium, l’arène et les souterrains. |
| guide.intro[1] | EN | `placeGuides.ts` | The amphitheatre, a UNESCO World Heritage Site since 1979, is one of the best-preserved in the world. | The amphitheatre has been a UNESCO World Heritage Site since 1979, and UNESCO describes its podium wall, arena and underground passages as practically intact. |
| guide.intro[1] | FR | `placeGuides.ts` | L’amphithéâtre, inscrit au patrimoine mondial de l’UNESCO depuis 1979, est l’un des mieux conservés au monde. | L’amphithéâtre est inscrit au patrimoine mondial de l’UNESCO depuis 1979, et l’UNESCO décrit le mur du podium, l’arène et les souterrains comme pratiquement intacts. |

## 7. `chott-el-jerid`

**Sources** (consultées le 16 novembre 2026) :
- UNESCO, liste indicative, « Chott El Jerid » (n° 5385) (institutionnelle) : https://whc.unesco.org/en/tentativelists/5385/

**Raison** : « la plus vaste du chapelet de dépressions entre la steppe et le désert ». Aucune source lue ne dit « le plus grand lac salé du Sahara ».

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| description | EN | `tunisiaData.ts` | The largest salt pan in the Sahara, crossed by a straight causeway. | The largest of the salt depressions between the steppe and the desert, crossed by a straight causeway. |
| description | FR | `places.fr.b.ts` | Le plus grand lac salé du Sahara, traversé par une chaussée rectiligne. | La plus vaste des dépressions salées entre la steppe et le désert, traversée par une chaussée rectiligne. |

## 8. `bulla-regia`

**Sources** (consultées le 16 novembre 2026) :
- AMVPPC, The archaeological site of Bulla Regia (institutionnelle) : https://www.patrimoinedetunisie.com.tn/en/sites/the-archaeological-site-of-bulla-regia/

**Raison** : « Bulla Regia (Latin for “Royal Bulla”) » ; Vandales « (439-533) », Byzance « (533-698) » ; « The gradual desertion of the town was probably only completed towards the end of the 12th century » ; maisons « with subterranean floors », nommées d’après « the main discovery in these dwellings, often the theme of the mosaic floor » : Venus House, Hunt House, New Hunt house, Fishing house. La page ne cite ni la maison d’Amphitrite, ni des mosaïques « toujours en place », ni une cité royale numide, ni une prospérité au IIe siècle, ni une rareté dans le monde romain : ces affirmations sont retirées. La légende de photo « mosaïque d’Amphitrite » n’est pas modifiée (à vérifier sur place).

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| description | EN | `tunisiaData.ts` | Their mosaics are still in place, where they were laid. | Each house is named after its main discovery, often the theme of its mosaic floor. |
| description | FR | `places.fr.a.ts` | Leurs mosaïques sont toujours en place, là où elles ont été posées. | Chaque maison porte le nom de sa principale découverte, souvent le thème de sa mosaïque. |
| didYouKnow | EN | `tunisiaData.ts` | Bulla Regia is one of the only places in the Roman world where you can see mosaics in their original underground rooms, under their original vaults. | In Latin, Bulla Regia means “Royal Bulla”. |
| didYouKnow | FR | `places.fr.a.ts` | Bulla Regia est l’un des seuls endroits du monde romain où l’on peut admirer des mosaïques dans leurs pièces souterraines d’origine, sous leurs voûtes d’origine. | En latin, Bulla Regia signifie « Bulla la Royale ». |
| insights.history | EN | `tunisiaData.ts` | A royal Numidian city, it became a Roman town and was prosperous from the 2nd century AD. | After the Roman period, the city came under the Vandals (439–533), then Byzantium (533–698). Its gradual abandonment was probably only completed towards the end of the 12th century. |
| insights.history | FR | `places.fr.a.ts` | Cité royale numide, elle devint une ville romaine prospère à partir du IIe siècle apr. J.-C. | Après l’époque romaine, la ville passe sous la domination des Vandales (439-533), puis de Byzance (533-698). Son abandon progressif ne s’achève sans doute que vers la fin du XIIe siècle. |
| insights.customs | EN | `tunisiaData.ts` | the House of the Hunt and the House of Amphitrite. | the House of the Hunt and the House of Venus. |
| insights.customs | FR | `places.fr.a.ts` | la maison de la Chasse et la maison d’Amphitrite. | la maison de la Chasse et la maison de Vénus. |

## 9. `tozeur`

**Sources** (consultées le 16 novembre 2026) :
- Hatem Bourial, « Ibn Chabbat, maître des eaux du Djérid », webdo.tn, 18/02/2016 (secondaire) : https://www.webdo.tn/fr/actualite/chroniques/ibn-chabbat-maitre-eaux-djerid/187014/

**Raison** : « Né en 1221 et mort en 1282 » ; « La postérité reconnait à Ibn Chabbat la paternité du système de distribution des eaux à Tozeur ». Les « plus de 200 sources » et « l’horloge hydraulique » ne sont dans aucune source lue : retirés. L’attribution est présentée comme une tradition. Aucune source académique lue sur le sujet.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| didYouKnow | EN | `tunisiaData.ts` | The palm grove is irrigated by more than 200 springs, shared out with a water-clock system devised in the 13th century by the mathematician Ibn Chabbat. | The palm grove is watered by springs. Tradition credits Ibn Chabbat (1221–1282) with the system that shares out their water. |
| didYouKnow | FR | `places.fr.b.ts` | La palmeraie est irriguée par plus de 200 sources, dont l’eau est répartie selon un système d’horloge hydraulique mis au point au XIIIe siècle par le mathématicien Ibn Chabbat. | La palmeraie est irriguée par des sources. La tradition attribue à Ibn Chabbat (1221-1282) le système qui en partage l’eau. |

## 10. `camping-tozeur`

**Sources** (consultées le 16 novembre 2026) :
- Hatem Bourial, webdo.tn, 18/02/2016 (même source que Tozeur) (secondaire) : https://www.webdo.tn/fr/actualite/chroniques/ibn-chabbat-maitre-eaux-djerid/187014/

**Raison** : Même affirmation que la fiche Tozeur, corrigée de la même façon pour que les deux fiches ne se contredisent pas.

| Champ | Langue | Fichier | Avant | Après |
|---|---|---|---|---|
| didYouKnow | EN | `tunisiaData.ts` | The Tozeur palm grove is watered by more than 200 springs, shared out by a system devised in the 13th century. | The Tozeur palm grove is watered by springs, shared out by a system that tradition credits to Ibn Chabbat, in the 13th century. |
| didYouKnow | FR | `places.fr.b.ts` | La palmeraie de Tozeur est irriguée par plus de 200 sources, réparties selon un système mis au point au XIIIe siècle. | La palmeraie de Tozeur est irriguée par des sources, réparties selon un système que la tradition attribue à Ibn Chabbat, au XIIIe siècle. |

## Titres et meta descriptions

Aucun titre ni meta de guide ne change. Pour les fiches sans guide long, la meta description reprend l’accroche et la description : elle suit les changements ci-dessus (Monastir, Table de Jugurtha, Aïn Draham, Chott el-Jérid, Bulla Regia). El Jem a un guide long : sa meta vient du guide et ne change pas.
