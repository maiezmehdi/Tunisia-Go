# GEO-FACTUAL-VERIFICATION — Tunisia Go, Lot 2A

> **Copie dans le dépôt, 16 novembre 2026.** Ce registre a été rédigé pour le Lot 2A, avant la PR 132. La colonne « Statut » de la synthèse donne l'état actuel de chaque point. Les constats ajoutés par le Lot 3 sont à la fin, sections 7 et 8. Les règles sont dans `docs/EDITORIAL-METHOD.md`, le détail des modifications dans `docs/editorial-log/`.


Registre de vérification factuelle, rédigé le 16 novembre 2026. Ce fichier est destiné à `docs/GEO-FACTUAL-VERIFICATION.md` dans le dépôt. Il sera placé à cet endroit à l'étape suivante : ce lot n'ouvre aucune PR.

**Périmètre.** Les affirmations de la section 2.4 de l'audit GEO éditorial (rapport du Lot 2, hors dépôt), ainsi que les autres contradictions relevées dans le dépôt. Textes analysés : branche de la PR #131 (`data/tunisiaData.ts` pour l'anglais, `data/i18n/places.fr.a.ts` et `places.fr.b.ts` pour le français, `data/i18n/catalog.fr.ts`).

**Ce qui n'a pas été fait.** Aucun texte du site ni aucune ligne de code n'a été modifié.

## Méthode et limites

- Chaque ligne « vérifié » renvoie à une page **ouverte et lue** le 16/11/2026. Je cite le passage tel qu'il apparaît sur la page.
- Les sites du Centre du patrimoine mondial (whc.unesco.org) ont répondu de façon irrégulière. La fiche d'El Jem et la fiche de la liste indicative de la Table de Jugurtha ont pu être lues. En revanche, la fiche de Sidi Bou Saïd (n° 1769), la décision 48 COM 8B.15 et l'évaluation de l'ICOMOS ont renvoyé une erreur : je ne cite que leur titre, tel qu'il apparaît dans les résultats de recherche, et je le signale à chaque fois.
- Les sites de l'INP et de la SNCFT n'ont pas été lus : aucun n'est apparu dans les recherches. Le site patrimoinedetunisie.com.tn de l'AMVPPC, lui, a pu être lu.
- Quand la seule source est Wikipédia, un site de fans ou un média, je l'indique, et la confiance ne dépasse jamais « moyenne ».
- Niveaux de confiance : **élevée** (une source institutionnelle ou spécialisée lue, qui soutient directement la phrase), **moyenne** (une source secondaire lue, ou des sources qui divergent), **non résolue** (aucune source lue ne tranche).

## Classement utilisé

- **A** : erreur confirmée, à corriger
- **B** : affirmation non sourcée, à sourcer ou à retirer
- **C** : incohérence, à harmoniser
- **D** : information datée, qui demande une vérification humaine
- **E** : déjà exact, rien à changer

---

## 1. Synthèse

| # | Fiche (`id`) | Sujet | Classe | Confiance | Statut |
|---|---|---|---|---|---|
| 1 | `bardo` | Virgile « peu après sa vie » | **A** | élevée | Corrigé (PR 132) |
| 2 | `el-jem` | Arène dans *Gladiator* | **A** (probable) | moyenne | Retiré (PR 132) |
| 3 | `el-jem` | 35 000 spectateurs, « troisième plus grand » | **C** | élevée (les sources divergent) | Nuancé (PR 132) |
| 4 | `ksar-ouled-soltane` | « Quartiers des esclaves » de *La Menace fantôme* | **A** (probable) | moyenne | Nuancé (PR 132) |
| 5 | `ksar-hadada` | « Quartiers des esclaves » | **C** | moyenne | Nuancé (lot 3 · 1a) |
| 6 | `sebkhet-kelbia` | Position, rang, différences FR/EN | **A** (FR) + **C** | élevée | Corrigé (PR 132) |
| 7 | `sidi-bou-said` | « L'un des tout premiers sites protégés au monde » | **B** | moyenne | Retiré (PR 132) |
| 8 | `sidi-bou-said` | Inscription UNESCO de 2026 absente du site | **A** (omission) | moyenne à élevée | Corrigé (PR 132), décision UNESCO à relire |
| 9 | `bardo` | Palais hafside ou palais beylical | **C** | moyenne | Corrigé (lot 3 · 1a) |
| 10 | `thuburbo-majus` | Colonie sous Auguste, ou municipe puis colonie | **C** | non résolue | Corrigé (lot 3 · 1a) |
| 11 | `chenini` | Lune de Star Wars | **E** (à reformuler) | moyenne | Ouvert |
| 12 | `ain-draham` | 1 500 mm, record national | **B** | non résolue | Retiré (lot 3 · 1b) ; normale INM à obtenir |
| 13 | `table-de-jugurtha` | 80 ha, 136 marches, 600 m | **E** (80 ha) / **B** (le reste) | élevée / non résolue | Corrigé (lot 3 · 1b) : 82 ha ; marches et 600 m retirés |
| 14 | `zaghouan`, `djebel-zaghouan` | Longueur de l'aqueduc | **C** | moyenne | Corrigé (lot 3 · 1a) |
| 15 | `douz` | « Chaque hiver depuis 1910 » | **C** | moyenne | Nuancé (lot 3 · 1b) |
| 16 | `monastir` | « Le plus ancien ribat d'Afrique du Nord », 796 | **B** / **E** | moyenne / élevée | Corrigé (lot 3 · 1b) |
| 17 | `lezard-rouge` | Circulation en 2026, voitures de 1910 | **D** | non résolue | Nuancé (lot 3 · 1a) ; circulation 2026 à vérifier sur place (phase 4) |
| 18 | `djerba-velo` | Plan vélo GIZ | **E** (à préciser) + **D** | élevée | Ouvert |
| 19 | `zaghouan` / `djebel-zaghouan` | Eau de rose ou fleur d'oranger | **C** | non résolue | Ouvert (phase 4) |
| 20 | `chebika`, `tamerza`, `mides` | Crues de 1969 racontées trois fois | **C** | non résolue | Ouvert |
| 21 | `chott-el-jerid` / `matmata` | « Maison de Luke » attribuée aux deux | **C** | non résolue | Ouvert |
| 22 | `gafsa-savanna` (road trip) | Accroche = note interne | **A** (éditorial) | élevée | Corrigé (PR 132) |
| 23 | `grand-tour` (road trip) | « Une boucle » qui finit à Djerba | **A** (éditorial) | élevée | Corrigé (PR 132) |
| 24 | `mos-espa` | Décor « réutilisé pour *L'Attaque des clones* » | **B** | non résolue | Confirmé par une source secondaire (lot 3 · 1b), texte non modifié |

En résumé : 6 erreurs à corriger (dont 2 probables), 5 affirmations à sourcer ou retirer, 9 incohérences, 2 informations à vérifier par un humain, et 3 points exacts qu'il suffit de reformuler.

---

## 2. Registre de preuves

Date d'accès de toutes les sources : **16/11/2026**.

### 1. `bardo` — portrait de Virgile

- **FR actuel :** « La mosaïque de Virgile, découverte à Sousse, est l'un des rares portraits connus du poète réalisés peu de temps après sa vie. »
- **EN actuel :** « The Virgil mosaic, found in Sousse, is one of the only known portraits of the poet made close to his lifetime. »
- **Résultat :** **A, erreur confirmée.** La mosaïque date du IIIe siècle apr. J.-C. Virgile est mort en 19 av. J.-C., soit plus de deux siècles plus tôt. Sa découverte à Hadrumète (Sousse) et sa conservation au Bardo sont confirmées.
- **Source :** « Mosaic depicting the poet Virgil (third century A.D.) », Museo della Civiltà Romana (Rome), https://museociviltaromana.it/en/opera/mosaico-con-ritratto-del-poeta-virgilio-iii-secolo-dc?tema=1
- **Passage lu :** « third century A.D. » ; « Hadrumetum (Sousse), Tunisia » ; « Musée National du Bardo, Tunis, Tunisia ». Le musée romain en expose une copie.
- **Confiance :** élevée.
- **Correction proposée :**
  - FR : « Découverte à Sousse, l'antique Hadrumète, et datée du IIIe siècle, cette mosaïque montre Virgile entre deux Muses, Clio et Melpomène. C'est l'un des portraits les plus célèbres du poète. »
  - EN : « Found in Sousse, ancient Hadrumetum, and dated to the 3rd century AD, the mosaic shows Virgil between two Muses, Clio and Melpomene. It is one of the best-known portraits of the poet. »
  - Note : « l'un des plus célèbres » reste un jugement. On peut aussi s'en tenir aux faits, sans ce membre de phrase.

### 2. `el-jem` — *Gladiator*

- **FR actuel :** « Son arène est apparue dans le film « Gladiator » »
- **EN actuel :** « Its arena appeared in the film "Gladiator" »
- **Résultat :** **A, erreur probable.** Le site spécialisé dans les lieux de tournage place l'arène de province à Aït Ben Haddou (Maroc) et les décors de Rome au Fort Ricasoli (Malte). Il ne mentionne ni El Jem ni la Tunisie. La fiche UNESCO d'El Jem ne parle d'aucun film. Je n'ai trouvé aucune source qui soutienne le tournage à El Jem.
- **Source :** « Gladiator », movie-locations.com, https://movie-locations.com/movies/g/Gladiator.php
- **Passage lu :** « Maximus fights in the 'African' arena, Aït Ben Haddou, Morocco » ; « The vast 'Roman' sets … were constructed on the massive remains of Fort Ricasoli on Malta. »
- **Confiance :** moyenne. C'est un site spécialisé, mais pas une source officielle de la production. Un générique ou un dossier de presse trancherait.
- **Action :** retirer la mention de *Gladiator*.
- **Correction proposée :**
  - FR : « El Jem est l'un des plus grands amphithéâtres du monde romain, et il accueille chaque été un festival de musique symphonique. »
  - EN : « El Jem is one of the largest amphitheatres of the Roman world, and it hosts a symphonic music festival every summer. »

### 3. `el-jem` — capacité et rang

- **FR / EN actuels :** « pour 35 000 spectateurs » ; « le troisième plus grand amphithéâtre romain jamais construit »
- **Résultat :** **C, les sources officielles divergent.** La fiche UNESCO donne 35 000 spectateurs. La fiche de l'AMVPPC donne 27 000 à 30 000. Sur le rang, l'AMVPPC dit « le troisième ou quatrième rang » et l'UNESCO « parmi les plus grands ». Aucune des deux ne dit « troisième » sans nuance.
- **Sources :**
  1. « Amphitheatre of El Jem », Centre du patrimoine mondial de l'UNESCO, https://whc.unesco.org/en/list/38& . Passage lu : « could hold up to 35,000 spectators » ; « built around 238 AD » ; « without a doubt among the largest amphitheatres in the world ».
  2. « The amphitheatre of Thysdrus (El Jem) », AMVPPC (ministère des Affaires culturelles), https://www.patrimoinedetunisie.com.tn/en/monuments/the-amphitheatre-of-thysdrus-el-jem/ . Passage lu : « could hold between twenty-seven and thirty thousand spectators » ; « Constructed in the period from 238 to 250 AD » ; « place it in the third or fourth rank in the world » ; « 147.90 x 122.20 m ».
- **Confiance :** élevée sur le fait que les deux sources divergent.
- **Correction proposée :**
  - FR : « Construit à partir de 238 environ, l'amphithéâtre de Thysdrus pouvait accueillir, selon les estimations, de 27 000 à 35 000 spectateurs. Il se classe parmi les trois ou quatre plus grands du monde romain. »
  - EN : « Built from around AD 238, the amphitheatre of Thysdrus could hold an estimated 27,000 to 35,000 spectators. It ranks among the three or four largest of the Roman world. »

### 4. `ksar-ouled-soltane` — Star Wars

- **FR actuel :** « Les cours du ksar ont servi de quartier des esclaves de Mos Espa dans « Star Wars : La Menace fantôme ». »
- **EN actuel :** « The ksar's courtyards were used as the slave quarters of Mos Espa in "Star Wars: The Phantom Menace". »
- **Résultat :** **A, erreur probable.** Un travail de recherche spécialisé conclut que Ksar Ouled Soltane a sans doute été repéré, mais n'a pas servi de lieu de tournage. Il attribue les scènes du quartier des esclaves à Ksar Ommarsia, et une scène coupée à Ksar Hadada. L'idée inverse est très répandue sur le web.
- **Source :** « Ksar Ouled Soltane: Debunking the Myth », galaxytours.com, https://galaxytours.com/research/ksar-ouled-soltane-debunking-the-myth/
- **Passage lu :** « Ksar Ouled Soltane is unquestionably a must-see destination and *most likely* a Star Wars recce site, but a Star Wars film site it is not. »
- **Confiance :** moyenne. C'est un site de passionnés, mais il est détaillé et s'appuie sur les numéros de scène. Il n'y a pas de source officielle Lucasfilm.
- **Action :** retirer l'affirmation de tournage. Mettre en avant l'architecture du ksar.
- **Correction proposée :**
  - FR : « Souvent présenté comme un décor de Star Wars, le ksar a sans doute été repéré par l'équipe, mais n'a pas servi au tournage d'après les recherches des passionnés. Le quartier des esclaves de Mos Espa a été filmé ailleurs dans la région. »
  - EN : « Often described as a Star Wars set, the ksar was probably scouted by the crew, but according to fan research it was not used for filming. The Mos Espa slave quarters were shot elsewhere in the area. »

### 5. `ksar-hadada` — Star Wars

- **FR actuel :** « Une partie a servi de quartier des esclaves de Mos Espa dans « La Menace fantôme ». »
- **EN actuel :** « Part of it was used as the slave quarters of Mos Espa in "The Phantom Menace". »
- **Résultat :** **C, les sources divergent.** Une source dit que les balcons du quartier des esclaves ont été tournés à Ksar Hadada. L'autre dit que le lieu principal était Ksar Ommarsia, et qu'à Ksar Hadada a été tournée une scène de porche qui a été coupée au montage.
- **Sources :**
  1. « Ksar Hadada », starwarslocations.com, https://www.starwarslocations.com/swarchive/RealTales/ksour/hadada.html . Passage lu : « the balconies of Mos Espa's slave quarter were set » ; « It was here that Lucas and McCallum had filmed the scenes of The Phantom Menace. »
  2. galaxytours.com (même article que pour le point 4). Selon cet article, Ksar Ommarsia correspond aux scènes 104 et 107, et Ksar Hadada à une scène 85 coupée.
- **Confiance :** moyenne. Les deux sont des sites de fans, et rien d'officiel.
- **Correction proposée :**
  - FR : « Des scènes du quartier des esclaves de Mos Espa (*La Menace fantôme*, 1999) ont été tournées dans les cours de Ksar Hadada. »
  - EN : « Scenes of the Mos Espa slave quarters (*The Phantom Menace*, 1999) were filmed in the courtyards of Ksar Hadada. »
  - Si on veut une prudence maximale, ajouter : « une partie a été coupée au montage » / « some were cut from the film ».

### 6. `sebkhet-kelbia` — position et différences FR/EN

- **FR actuel :** « un grand lac salé peu profond, au sud de Hammamet, classé site Ramsar depuis 2007. Après Ichkeul, c'est la deuxième zone humide du pays » ; accroche : « La deuxième zone humide du pays » ; histoire : « protégé comme zone humide d'importance internationale depuis 2007 » ; Le saviez-vous : « le niveau du lac change beaucoup d'une année à l'autre ».
- **EN actuel :** « After Lake Ichkeul, Sebkhet Kelbia is Tunisia's second wetland and has been a Ramsar site since 2007. This vast salt lake in the Sahel plain… » ; Did you know : « A Ramsar site is a wetland recognised as important at international level under a treaty signed in 1971. » ; histoire : « an important stop for migrating birds between Europe and Africa ».
- **Résultat :**
  - **A pour le FR.** « Au sud de Hammamet » est trompeur : la fiche Ramsar situe le site dans le gouvernorat de Sousse, à 25 km au nord-ouest de Sousse, et à 25 km de Kairouan.
  - **E pour la date** : l'inscription Ramsar du 7 novembre 2007 est confirmée.
  - **C pour le rang** : Ramsar parle de « l'une des deux grandes zones humides continentales » avec Ichkeul, pas de la « deuxième zone humide du pays ».
  - **C pour la parité** : le « Le saviez-vous » et l'histoire sont différents en FR et en EN.
- **Sources :**
  1. Fiche du site Ramsar 1710, Ramsar Sites Information Service, https://rsis.ramsar.org/ris/1710 . Passage lu : « Designation date 07-11-2007 » ; « Sousse Governorate » ; « 8,732 ha » ; « one of the two great continental wetland zones of the country » (avec Ichkeul).
  2. Fiche descriptive Ramsar (PDF, en français), https://rsisd10.unepgrid.ch/RISapp/files/RISrep/TN1710RIS.pdf . Passage lu : « Gouvernorat de Sousse » ; « situé à 25 kms au nord-ouest de la ville de Sousse » ; « considérée, avec Ichkeul, comme une des deux grandes zones humides continentales de la Tunisie » ; à propos de Kairouan, « également située en plaine à 25 kilomètres en amont ». Le même document dit ailleurs « à 20 kilomètres à l'ouest » de Sousse : il y a une petite incohérence interne, et « 20 à 25 km » couvre les deux.
- **Confiance :** élevée.
- **Correction proposée (identique dans les deux langues) :**
  - Accroche FR : « Un grand lac salé entre Sousse et Kairouan » / EN : « A great salt lake between Sousse and Kairouan »
  - FR : « Dans le gouvernorat de Sousse, à une vingtaine de kilomètres au nord-ouest de Sousse, Sebkhet Kelbia est un vaste lac salé peu profond de plus de 8 700 hectares, inscrit sur la liste Ramsar des zones humides d'importance internationale depuis le 7 novembre 2007. Avec Ichkeul, c'est l'une des deux grandes zones humides intérieures du pays. »
  - EN : « In Sousse governorate, about 20 to 25 km north-west of Sousse, Sebkhet Kelbia is a vast, shallow salt lake of more than 8,700 hectares, listed as a Ramsar wetland of international importance since 7 November 2007. With Ichkeul, it is one of the country's two great inland wetlands. »
  - Le saviez-vous : choisir un seul fait et le traduire dans les deux langues. Le fait que le niveau varie selon les années n'est pas sourcé : à vérifier dans la fiche Ramsar avant de le garder.

### 7. `sidi-bou-said` — « premier site protégé »

- **FR actuel :** « Le baron Rodolphe d'Erlanger milita pour cette règle en 1915, et le village devint l'un des tout premiers sites protégés au monde. »
- **EN actuel :** « Baron Rodolphe d'Erlanger pushed for the rule in 1915, and the village became one of the first protected sites in the world. »
- **Résultat :** **B.**
  - Le décret d'août 1915 et le rôle de d'Erlanger sont soutenus par un média.
  - « L'un des premiers au monde » n'est soutenu par aucune source lue. Le même média parle seulement d'une protection plus ancienne que celles de Positano ou d'Oia, ce qui est une comparaison, pas un classement mondial.
- **Source :** « Sidi Bou Saïd à l'UNESCO : le village bleu et blanc sort de l'ombre de Carthage », afrik.com, https://www.afrik.com/sidi-bou-said-patrimoine-mondial-unesco-2026
- **Passage lu :** un décret d'août 1915, publié au *Journal officiel tunisien* le 28 du mois, « encadre les constructions et l'aspect des façades sur le promontoire » ; d'Erlanger a milité auprès des autorités du protectorat.
- **Confiance :** moyenne. C'est un média, pas le texte du décret ni le dossier UNESCO.
- **Correction proposée :**
  - FR : « Dès août 1915, un décret, obtenu à l'initiative du baron Rodolphe d'Erlanger, encadre les constructions et l'aspect des façades du village. »
  - EN : « As early as August 1915, a decree obtained at the urging of Baron Rodolphe d'Erlanger regulated building and the look of the façades in the village. »

### 8. `sidi-bou-said` — inscription au patrimoine mondial (absente du site)

- **FR / EN actuels :** aucune mention. La fiche n'a pas `unesco: true`.
- **Résultat :** **A, omission.** Le village a été inscrit sur la Liste du patrimoine mondial le 25 juillet 2026, comme bien distinct de Carthage, au titre du critère (iii).
- **Sources :**
  1. afrik.com (même article que pour le point 7). Passage lu : inscription le 25 juillet 2026 à Busan, critère (iii) ; « L'inscription lui confère une existence propre sur la Liste ».
  2. Centre du patrimoine mondial de l'UNESCO : la fiche « Village of Sidi Bou Saïd » (https://whc.unesco.org/en/list/1769/) et la décision « 48 COM 8B.15 » (https://whc.unesco.org/en/decisions/9169/) apparaissent dans les résultats de recherche, mais **leur contenu n'a pas pu être lu** (erreur du site). Il existe aussi une évaluation de l'ICOMOS (https://whc.unesco.org/document/227373), qui n'a pas pu être ouverte non plus.
- **Confiance :** moyenne à élevée. Une fiche n° 1769 sur la Liste du patrimoine mondial n'existe que pour un bien inscrit, mais le texte de la décision reste à lire.
- **Action :** relire la page UNESCO 1769, puis mettre à jour la fiche, le drapeau `unesco` et la liste des biens UNESCO dans l'audit (10 biens tunisiens, et non plus 9).
- **Correction proposée (après lecture de la page UNESCO) :**
  - FR : « Inscrit au patrimoine mondial de l'UNESCO en juillet 2026, le village… »
  - EN : « Listed as a UNESCO World Heritage site in July 2026, the village… »

### 9. `bardo` — quel palais

- **FR / EN actuels :** description : « palais hafside du XVe siècle » / « 15th-century Hafsid palace » ; histoire : « ouvert en 1888 dans l'ancien palais beylical » / « opened in 1888 inside the former beylical palace ».
- **Résultat :** **C.** Les deux formules ne s'excluent pas : le palais du Bardo est d'origine hafside, et le musée occupe un palais beylical depuis 1888. Mais le site présente le bâtiment actuel comme « hafside du XVe siècle », ce qui n'est soutenu que par une phrase sans référence sur Wikipédia. L'ouverture en 1888, sous le nom de Musée Alaoui, est confirmée par la même page.
- **Source :** « Bardo National Museum (Tunis) », Wikipédia (en), https://en.wikipedia.org/wiki/Bardo_National_Museum_(Tunis)
- **Passage lu :** « originally a 15th-century Hafsid palace » (sans référence) ; « housed in an old beylical palace since 1888 » ; « Established: 7 May 1888 » ; « Originally called the Alaoui Museum ».
- **Confiance :** moyenne. Wikipédia n'est pas une source à citer. Il faudrait la page du musée, de l'INP ou de l'AMVPPC, ou l'ouvrage de Jacques Revault, *Palais et résidences d'été de la région de Tunis* (CNRS, 1974), cité par Wikipédia.
- **Correction proposée :**
  - FR : « Installé depuis 1888 dans un palais beylical du Bardo, un domaine princier dont l'origine remonte aux Hafsides, le musée abrite… »
  - EN : « Housed since 1888 in a beylical palace at Le Bardo, a princely estate dating back to the Hafsids, the museum holds… »

### 10. `thuburbo-majus` — chronologie

- **FR / EN actuels :** description : « colonie romaine sous Auguste, en 27 av. J.-C. » ; histoire : « Hadrien en fit un municipe et Commode une colonie ».
- **Résultat :** **C, non résolue.** La seule source lue (Wikipédia) donne les deux informations sans les relier, et sans référence directe : « veteran colony by Augustus in 27 BC », puis « Under Hadrian it was made a municipium », puis « Commodus made it a colony ». Une lecture courante, que je n'ai pas vérifiée dans une source savante, distingue une installation de vétérans sous Auguste à côté de la cité indigène, puis des statuts municipaux obtenus plus tard. Le Capitole de 168 est soutenu par *The Cambridge Ancient History*, vol. XI, cité par Wikipédia.
- **Source :** « Thuburbo Majus », Wikipédia (en), https://en.wikipedia.org/wiki/Thuburbo_Majus
- **Confiance :** non résolue. Il faut une publication de l'INP ou une publication académique (par exemple une épigraphie du site).
- **Action :** retirer « colonie romaine sous Auguste, en 27 av. J.-C. » de la description tant qu'une source savante n'a pas été lue, et garder seulement la suite municipe (Hadrien) puis colonie (Commode).
- **Correction proposée provisoire :**
  - FR : « … une ville d'origine punique, devenue municipe sous Hadrien, puis colonie sous Commode. »
  - EN : « … a town of Punic origin that became a municipium under Hadrian and a colony under Commodus. »

### 11. `chenini` — lune de Star Wars

- **FR actuel :** « Une lune de l'univers Star Wars, près de la planète natale de Luke Skywalker, porte le nom de Chenini. »
- **EN actuel :** « A moon in the Star Wars universe, near Luke Skywalker's home planet, is named Chenini. »
- **Résultat :** **E, exact dans l'univers de la franchise.** Il faut toutefois être plus précis.
- **Source :** « Chenini », Wookieepedia (encyclopédie collaborative de fans), https://starwars.fandom.com/wiki/Chenini
- **Passage lu :** « one of the three moons of the planet Tatooine », avec Guermessa et Ghomrassen ; « The moon is also the name of a real village near Tataouine in Tunisia ».
- **Confiance :** moyenne (source de fans).
- **Correction proposée :**
  - FR : « Dans l'univers Star Wars, Chenini est l'une des trois lunes de Tatooine, avec Guermessa et Ghomrassen : trois noms de villages du Sud tunisien. »
  - EN : « In the Star Wars universe, Chenini is one of the three moons of Tatooine, with Guermessa and Ghomrassen: all three are names of villages in southern Tunisia. »

### 12. `ain-draham` — pluviométrie

- **FR actuel :** accroche : « …la ville la plus pluvieuse de Tunisie » ; description : « environ 1 500 mm par an » ; Le saviez-vous : « Ses précipitations sont un record national, plusieurs fois celles de Tunis. »
- **EN actuel :** « the highest rainfall in Tunisia, around 1,500 mm a year » ; « Its rainfall is a national record, several times that of Tunis. »
- **Résultat :** **B, non résolue.** Wikipédia donne 1 534 mm et parle de « record ». Mais le tableau climatique est marqué « citation needed », et la référence citée porte sur les glissements de terrain, pas sur la pluie. Une étude hydrologique de 1975 (ministère de l'Agriculture et ORSTOM) situe seulement la Kroumirie dans une zone qui reçoit « plus de 600 mm/an », sans citer Aïn Draham.
- **Sources lues :**
  1. « Aïn Draham », Wikipédia (en), https://en.wikipedia.org/wiki/A%C3%AFn_Draham . Passage : « holds the record for the highest average rainfall at 1534 mm per year » (non sourcé).
  2. M.R. Kallel et R.C. Gouyet, *Étude hydrologique préliminaire des oueds Zeroud et Merguellil*, chap. II « La pluviométrie », juin 1975, https://core.ac.uk/download/39882289.pdf . Passage : « une zone très pluvieuse recevant plus de 600 mm/an », limitée à la Kroumirie et au littoral nord-ouest.
- **Action :** demander la normale annuelle à l'Institut national de la météorologie (INM). En attendant, retirer le superlatif de l'accroche et le « record national ».
- **Correction proposée provisoire :**
  - FR : « …au cœur de la Kroumirie, l'une des régions les plus arrosées de Tunisie. »
  - EN : « …in the Kroumirie, one of the wettest regions of Tunisia. »
  - Note : ce membre de phrase lui-même reste à confirmer par l'INM.

### 13. `table-de-jugurtha` — mesures

- **FR / EN actuels :** « s'élève d'environ 600 m au-dessus de la plaine » ; « un escalier de 136 marches » ; « un plateau sommital d'environ 80 hectares ».
- **Résultat :**
  - **E pour la superficie** : la fiche de la liste indicative de l'UNESCO donne environ 82 hectares.
  - **B pour les 136 marches et les 600 m** : la même fiche ne parle pas d'escalier (seulement d'un « sentier étroit » décrit par Salluste). Elle donne une altitude de 1 200 m et des parois de plus de 50 m, mais pas la hauteur au-dessus de la plaine.
  - **Fait nouveau, citable** : la Table de Jugurtha est sur la liste indicative de la Tunisie depuis le 29/09/2017.
- **Source :** « La Table de Jugurtha à Kalaat Senan », liste indicative, Centre du patrimoine mondial de l'UNESCO, https://whc.unesco.org/fr/listesindicatives/6278/
- **Passage lu :** « La superficie de la terrasse est d'environ 82 hectares » ; « Du haut de ses 1200 m » ; « parois rugueuses hautes de plus de 50 mètres » ; « Date de soumission : 29/09/2017 ».
- **Confiance :** élevée pour la superficie et la liste indicative ; non résolue pour les marches et la hauteur.
- **Correction proposée :**
  - FR : « …une montagne tabulaire d'environ 1 200 m d'altitude, aux parois de plus de 50 m. Un accès taillé dans la roche mène à un plateau d'environ 82 hectares. Le site figure sur la liste indicative de la Tunisie pour le patrimoine mondial depuis 2017. »
  - EN : « …a flat-topped mountain about 1,200 m high, with cliffs of more than 50 m. A path cut into the rock leads to a plateau of about 82 hectares. The site has been on Tunisia's World Heritage tentative list since 2017. »
  - Les 136 marches seront à compter sur place, ou à retirer.

### 14. `zaghouan` / `djebel-zaghouan` — aqueduc

- **Actuel :**
  - `zaghouan` FR : « plus de 100 km » ; EN : « more than 100 km long ».
  - `djebel-zaghouan` FR : « plus de 130 km » ; EN : « about 130 km, one of the longest of the Roman world ».
- **Résultat :** **C.** Les deux fiches sont incohérentes entre elles, et `djebel-zaghouan` dit « plus de » en FR mais « environ » en EN. La source lue donne 132 km et une construction au IIe siècle. « L'un des plus longs du monde romain » n'est pas sourcé.
- **Source :** « Water supply in Roman Carthage — waterworks », Hydria Virtual Museum, https://www.hydriaproject.info/en/case-studies/water-supply-in-roman-carthage/waterworks
- **Passage lu :** « Traveling 132 km through plains, hills and valleys » ; « erected in the 2nd century AD ».
- **Confiance :** moyenne. C'est un projet de musée virtuel sans auteur nommé. Le complexe hydraulique de Zaghouan-Carthage est aussi sur la liste indicative de l'UNESCO (vu dans les résultats de recherche, page non lue) : c'est la meilleure source à lire ensuite.
- **Correction proposée (les deux fiches, FR et EN) :** FR « un aqueduc d'environ 132 km » / EN « an aqueduct of about 132 km ». Retirer « l'un des plus longs du monde romain » tant qu'il n'est pas sourcé.

### 15. `douz` — festival « depuis 1910 »

- **FR actuel :** « organisé chaque hiver depuis 1910 »
- **EN actuel :** « held each winter since 1910 »
- **Résultat :** **C.** L'origine en 1910, sous le nom de « fête du chameau », est soutenue. Mais la forme actuelle date de 1967, et « chaque hiver depuis 1910 » suggère une continuité que la source n'affirme pas.
- **Source :** « International Festival of the Sahara », Wikipédia (en), https://en.wikipedia.org/wiki/International_Festival_of_the_Sahara , qui cite le site officiel du festival (festivaldouz.org.tn, archivé en 2010).
- **Passage lu :** « The festival, called the Camel festival, began in 1910 when Tunisia was under French rule » ; « In 1967 it took on its modern identity ».
- **Confiance :** moyenne. Il faudrait lire l'archive du site officiel ou une source du ministère de la Culture.
- **Correction proposée :**
  - FR : « Né en 1910 sous le nom de fête du chameau, le festival a pris sa forme actuelle en 1967. Il réunit chaque hiver courses de dromadaires, poésie et mariages traditionnels mrazig. »
  - EN : « Born in 1910 as a camel festival, it took its present form in 1967. Each winter it brings together camel races, poetry and traditional Mrazig weddings. »

### 16. `monastir` — ribat

- **FR / EN actuels :** « Le plus ancien ribat d'Afrique du Nord, fondé en 796 » ; « Édifié par le gouverneur abbasside Harthama ibn A'yan » ; « La Vie de Brian, 1978 ».
- **Résultat :**
  - **E pour la date et le fondateur** : l'AMVPPC donne 795-796 (179-180 de l'Hégire) et « Harthimâ ibn A'yûn ».
  - **B pour « le plus ancien d'Afrique du Nord »** : l'AMVPPC ne le dit pas. Elle dit que son plan servit de « modèle » aux ribats d'Ifriqiya. Wikipédia dit « le plus ancien ribat construit par les conquérants arabes au Maghreb », en citant le ministère de la Culture, mais je n'ai pas lu la page arabe citée.
  - **E pour *La Vie de Brian*** : Wikipédia le dit, sur la foi de Michael Palin, avec une confiance moyenne.
- **Sources :**
  1. « Ribat of Monastir », AMVPPC, https://www.patrimoinedetunisie.com.tn/en/monuments/ribat-of-monastir/ . Passage lu : « built by Harthimâ ibn A'yûn, an Abbasid general and governor of Ifrîqiya, in the year 179-180 A.H. / 795-796 A.D. » ; « was to become the model used in all major ribats of Ifriqiya ».
  2. « Ribat of Monastir », Wikipédia (en), https://en.wikipedia.org/wiki/Ribat_of_Monastir . Passage lu : « the oldest ribat built by the Arab conquerors during the Muslim conquest of the Maghreb ».
- **Correction proposée :**
  - FR : « Fondé en 795-796 par le gouverneur abbasside Harthama ibn A'yan, le ribat de Monastir a servi de modèle aux grands ribats de la côte d'Ifriqiya. »
  - EN : « Founded in 795–796 by the Abbasid governor Harthama ibn A'yan, the Ribat of Monastir became the model for the great ribats along the coast of Ifriqiya. »

### 17. `lezard-rouge` — circulation et date des voitures

- **FR / EN actuels :** « Les voitures ont été construites en 1910 » ; « Le service touristique a été suspendu à plusieurs reprises » ; « Vérifiez que le train circule ».
- **Résultat :** **D, non résolue.**
  - Je n'ai trouvé aucune source datée de 2026 sur la circulation du Lézard Rouge.
  - Un article de presse sur la SNCFT mentionne la reprise du service voyageurs entre Metlaoui et Tozeur en septembre 2025. C'est la ligne régulière, pas le train touristique.
  - Une dépêche reprise par allAfrica décrit le Lézard Rouge au présent (« propose un parcours de 40 kilomètres dans les gorges de Selja »), mais sans date ni source d'origine.
  - L'année 1910 n'est soutenue par aucune source lue.
- **Sources lues :**
  1. « SNCFT 2026 : le grand retour du train tunisien », webmanagercenter.com, 11/11/2025, https://www.webmanagercenter.com/2025/11/11/554215/sncft-2026-le-grand-retour-du-train-tunisien/ (reprise Metlaoui–Tozeur en septembre 2025 ; aucune mention du Lézard Rouge).
  2. « Tunisie : Que savez-vous du train du désert tunisien ? », allAfrica, https://fr.allafrica.com/stories/202506290021.html (sans date ni auteur lisibles).
- **Action :** appeler la gare de Metlaoui ou la SNCFT, ou une agence de Tozeur, et noter la date de l'appel. Retirer « 1910 » tant que ce n'est pas sourcé. Le conseil « vérifiez avant d'y aller » reste juste.

### 18. `djerba-velo` — plan vélo GIZ

- **FR / EN actuels :** « Un plan vélo élaboré avec la coopération allemande (GIZ) recense huit parcours, environ 120 km au total, autour de deux axes : Houmt Souk – Ajim et Midoun – El May » ; « trois mois d'ateliers avec les communes de Houmt Souk, Midoun et Ajim ».
- **Résultat :** **E, exact.** On peut préciser deux choses : le plan a été réalisé par un bureau d'études, dans un projet lancé et soutenu par la GIZ, et il date de 2019. **D** : la source ne dit pas si les parcours ont été balisés ou aménagés depuis.
- **Source :** « Djerba à vélo : huit parcours de l'île pour les cyclotouristes », webdo.tn, 14/05/2019, https://www.webdo.tn/fr/actualite/national/djerba-a-velo-huit-parcours-de-lile-pour-les-cyclotouristes/150050/
- **Passage lu :** « bureau d'études « Kandeel » » ; un projet « initié et appuyé par la GIZ » ; « Huit itinéraires ont été identifiés » ; « 120 kilomètres de parcours » ; « trois mois d'ateliers participatifs et de travail de terrain » ; « Les communes de Houmt-Souk, Midoun et Ajim ».
- **Confiance :** élevée sur le contenu du plan (article de presse). Le document original n'a pas été trouvé.
- **Correction proposée :**
  - FR : « En 2019, un plan vélo réalisé par un bureau d'études dans un projet soutenu par la coopération allemande (GIZ) a identifié huit parcours, environ 120 km au total… »
  - EN : « In 2019, a cycling plan drawn up by a consultancy in a project supported by German cooperation (GIZ) identified eight routes, about 120 km in all… »
  - Ajouter : « Renseignez-vous sur place pour savoir quels parcours sont balisés. » / « Ask locally which routes are signposted. »

### 19 à 24. Autres incohérences du dépôt (non vérifiées à la source)

| # | Fiches | Constat | Classe | Action |
|---|---|---|---|---|
| 19 | `zaghouan` / `djebel-zaghouan` | Spécialité locale : « eau de rose » d'un côté, « fleur d'oranger » de l'autre (FR et EN) | C | Vérifier localement ; les deux peuvent être justes, mais il faut les présenter ensemble |
| 20 | `chebika`, `tamerza`, `mides` | Les crues de 1969 sont racontées trois fois ; « la rivière a coulé pendant 22 jours » n'apparaît que pour Tamerza | C / B | Un seul récit, sourcé ; retirer « 22 jours » s'il n'est pas sourcé |
| 21 | `chott-el-jerid` / `matmata` | « La ferme de Luke » est au chott, « la maison d'enfance de Luke » à Matmata | C | Préciser : extérieur au chott, intérieur à l'hôtel Sidi Driss (à sourcer) |
| 22 | road trip `gafsa-savanna` | Accroche FR « Une région sans circuit aujourd'hui », EN « A region with no road trip until now » | A (éditorial) | Remplacer par une vraie accroche |
| 23 | road trip `grand-tour` | Accroche FR « en une boucle », EN « The classic north-to-south loop in one trip », alors que l'itinéraire finit à Djerba | A | FR : « Le circuit classique du nord au sud » ; EN : « The classic north-to-south route » |
| 24 | `mos-espa` | « Réutilisé pour *L'Attaque des clones* » | B | À sourcer |

Mentions de tournage restantes, non vérifiées dans ce lot : `monastir` (*La Vie de Brian*, voir point 16), `tamerza` et `mides` (*Le Patient anglais*, *Fort Saganne*), `toujane` (*La Folle de Toujane*, 1974), `kelibia` (festival de cinéma amateur depuis 1964). Elles sont toutes de classe B jusqu'à vérification.

---

## 3. Cohérence FR / EN des fiches concernées

| Fiche | Écart | Gravité |
|---|---|---|
| `sebkhet-kelbia` | Situation différente (« au sud de Hammamet » en FR, « Sahel plain » en EN) ; « Le saviez-vous » différent ; histoire différente | Forte |
| `djebel-zaghouan` | « plus de 130 km » en FR, « about 130 km » en EN ; « un des plus longs du monde romain » seulement en EN | Moyenne |
| `ain-draham` | Le superlatif est dans l'accroche FR (« la ville la plus pluvieuse ») et dans la description EN (« the highest rainfall in Tunisia ») | Moyenne |
| `grand-tour` | « en une boucle » en FR, « north-to-south loop » en EN : même erreur dans les deux langues | Faible |
| `douz`, `monastir`, `el-jem`, `bardo`, `chenini`, `ksar-hadada`, `ksar-ouled-soltane`, `thuburbo-majus`, `table-de-jugurtha`, `lezard-rouge`, `djerba-velo`, `sidi-bou-said` | Mêmes faits dans les deux langues : les erreurs sont donc identiques en FR et en EN | Les corriger ensemble |

Règle pour la mise en œuvre : chaque correction est faite dans les deux langues dans le même commit, et la date de `data/contentDates.ts` est mise à jour pour la fiche.

Les fiches ajoutées en série 3 (octobre et novembre 2026) ont été écrites séparément en FR et en EN. Seule `sebkhet-kelbia` a été comparée ligne à ligne dans ce lot. Il faut comparer les autres de la même façon avant la mise en œuvre.

---

## 4. L'assistant IA du site

Code lu : `lib/assistant/ai.ts`, `lib/gemini.ts` et `lib/assistant/engine.ts` (le moteur par mots-clés, utilisé en repli).

**Comment il trouve l'information.**
- Pour chaque lieu, l'assistant utilise uniquement l'accroche, la description, « Le saviez-vous » et la durée de visite (`[p.tagline, p.description, p.didYouKnow, p.visitDuration]`).
- Il ne lit ni l'histoire, ni les usages, ni la meilleure période, ni les guides longs.
- Il cherche les pages par mots-clés (8 pages au plus, 900 caractères par page) et lit une ligne de catalogue par lieu et par road trip.
- Il travaille sur le catalogue d'une seule langue (`getCatalog(locale)`).
- Modèle : Gemini Flash-Lite, température 0,6.

**Constats.**
1. **Il répète les affirmations non sourcées.** Une grande partie des erreurs se trouve dans « Le saviez-vous », justement le champ que l'assistant reçoit : *Gladiator*, Virgile, la lune Chenini, le « record national » d'Aïn Draham, Ouled Soltane. Les erreurs des descriptions (Thuburbo, Kelbia, le « plus ancien ribat », les 136 marches) lui parviennent aussi.
2. **Les écarts FR/EN changent ses réponses.** L'assistant lit le catalogue de la langue du visiteur. Un visiteur francophone qui demande où est Sebkhet Kelbia s'entendra répondre « au sud de Hammamet ».
3. **Il ne peut pas citer de sources.** La ligne `SOURCES:` de sa réponse ne contient que des identifiants internes (`p:douz`, `i:ksour-route`), qui servent à afficher des cartes de lieux. Le modèle de données n'a pas de source externe à lui transmettre.
4. **Il ne distingue pas le vérifié du non vérifié.** Aucun champ ne le signale. La consigne « every specific fact … must come from the CATALOGUE and PAGES » empêche l'invention, mais pas la répétition d'une erreur du site.
5. **Le moteur de repli** (`engine.ts`) ne lit que la description pour trouver des correspondances. Il ne répète pas de « Le saviez-vous », mais il dépend lui aussi des descriptions.

**Améliorations à faire plus tard (pas dans ce lot).**
- Corriger d'abord les fiches. C'est ce qui a le plus d'effet sur l'assistant.
- Quand le champ `sources` existera, transmettre à l'assistant, pour chaque fait, la source et la date de vérification (`verifiedAt`), et lui permettre de citer « selon l'UNESCO… » ou « selon la fiche Ramsar… ».
- Ajouter un niveau de fiabilité par fait (vérifié, à vérifier). Les faits « à vérifier » seraient exclus du contexte, ou présentés avec une réserve.
- Ajouter à la consigne : « If a fact is marked unverified, do not state it as certain. »
- Baisser la température pour les questions factuelles (dates, chiffres).

---

## 5. Questions ouvertes (pour la validation humaine)

1. **Sidi Bou Saïd :** relire la fiche UNESCO 1769 et la décision 48 COM 8B.15, qui n'ont pas pu s'ouvrir d'ici, avant d'annoncer l'inscription sur le site.
2. **Lézard Rouge :** le train touristique circule-t-il en 2026, avec quel calendrier ? Appeler la gare de Metlaoui ou la SNCFT, et noter la date.
3. **Aïn Draham :** quelle est la normale annuelle officielle des précipitations (INM) ?
4. **Table de Jugurtha :** combien de marches compte l'accès ? (À compter sur place, ou à retirer.)
5. **Thuburbo Majus :** existe-t-il une source de l'INP ou une source académique sur le statut de la ville sous Auguste ?
6. **Ksar Hadada :** une source officielle (Lucasfilm, ONTT) confirme-t-elle le tournage ?
7. **Bardo :** que dit la page officielle du musée, ou de l'INP, sur l'origine du palais ?
8. **El Jem :** quelle capacité afficher ? Je propose la fourchette 27 000 à 35 000, en citant les deux sources.
9. **Djerba à vélo :** les huit parcours sont-ils balisés aujourd'hui ?

## 6. Ordre de correction proposé (après validation)

1. Les erreurs (A) : 1, 2, 4, 6 (FR), 8 (après lecture de la page UNESCO), 22, 23.
2. Les affirmations non sourcées (B), à retirer ou reformuler : 7, 12, 13 (marches), 16 (superlatif), 24, et l'année 1910 au point 17.
3. Les incohérences (C), à harmoniser : 3, 5, 9, 10, 14, 15, 19, 20, 21.
4. Les informations datées (D), après les appels : 17, 18.
5. Pour chaque fiche modifiée : correction FR et EN dans le même commit, et mise à jour de `data/contentDates.ts`.

## Sources consultées

- [UNESCO — Amphitheatre of El Jem](https://whc.unesco.org/en/list/38&)
- [AMVPPC — The amphitheatre of Thysdrus (El Jem)](https://www.patrimoinedetunisie.com.tn/en/monuments/the-amphitheatre-of-thysdrus-el-jem/)
- [AMVPPC — Ribat of Monastir](https://www.patrimoinedetunisie.com.tn/en/monuments/ribat-of-monastir/)
- [UNESCO, liste indicative — La Table de Jugurtha à Kalaat Senan](https://whc.unesco.org/fr/listesindicatives/6278/)
- [Ramsar — Sebkhet Kelbia, fiche 1710](https://rsis.ramsar.org/ris/1710) et [fiche descriptive (PDF)](https://rsisd10.unepgrid.ch/RISapp/files/RISrep/TN1710RIS.pdf)
- [Museo della Civiltà Romana — Mosaic depicting the poet Virgil](https://museociviltaromana.it/en/opera/mosaico-con-ritratto-del-poeta-virgilio-iii-secolo-dc?tema=1)
- [Hydria Virtual Museum — Water supply in Roman Carthage](https://www.hydriaproject.info/en/case-studies/water-supply-in-roman-carthage/waterworks)
- [movie-locations.com — Gladiator](https://movie-locations.com/movies/g/Gladiator.php)
- [galaxytours.com — Ksar Ouled Soltane: Debunking the Myth](https://galaxytours.com/research/ksar-ouled-soltane-debunking-the-myth/)
- [starwarslocations.com — Ksar Hadada](https://www.starwarslocations.com/swarchive/RealTales/ksour/hadada.html)
- [Wookieepedia — Chenini](https://starwars.fandom.com/wiki/Chenini)
- [afrik.com — Sidi Bou Saïd à l'UNESCO](https://www.afrik.com/sidi-bou-said-patrimoine-mondial-unesco-2026)
- [webdo.tn — Djerba à vélo, 14/05/2019](https://www.webdo.tn/fr/actualite/national/djerba-a-velo-huit-parcours-de-lile-pour-les-cyclotouristes/150050/)
- [webmanagercenter.com — SNCFT 2026, 11/11/2025](https://www.webmanagercenter.com/2025/11/11/554215/sncft-2026-le-grand-retour-du-train-tunisien/)
- [allAfrica — Que savez-vous du train du désert tunisien ?](https://fr.allafrica.com/stories/202506290021.html)
- [Kallel et Gouyet, 1975, La pluviométrie (PDF)](https://core.ac.uk/download/39882289.pdf)
- Wikipédia (en), pour localiser des sources et non pour être citée : [Bardo National Museum](https://en.wikipedia.org/wiki/Bardo_National_Museum_(Tunis)), [Thuburbo Majus](https://en.wikipedia.org/wiki/Thuburbo_Majus), [Aïn Draham](https://en.wikipedia.org/wiki/A%C3%AFn_Draham), [International Festival of the Sahara](https://en.wikipedia.org/wiki/International_Festival_of_the_Sahara), [Ribat of Monastir](https://en.wikipedia.org/wiki/Ribat_of_Monastir)
- Pages trouvées mais non lisibles depuis ici : [UNESCO — Village of Sidi Bou Saïd](https://whc.unesco.org/en/list/1769/), [Décision 48 COM 8B.15](https://whc.unesco.org/en/decisions/9169/), [Évaluation ICOMOS](https://whc.unesco.org/document/227373)

## 7. Constats ajoutés par le Lot 3

| Fiche | Affirmation | Statut | Source lue |
|---|---|---|---|
| `carthage` | Thermes d'Antonin : « basement level » (EN), « esclaves alimentaient les fourneaux », « parmi les plus vastes hors de Rome » | Corrigé (lot 3 · 1a) : « les plus grands thermes romains d'Afrique », niveau inférieur = salles de service, combustible arrivant par la mer | AMVPPC, thermes d'Antonin (institutionnelle) |
| `dougga` | « La ville romaine la mieux conservée d'Afrique du Nord » (accroche, titres du guide) | Nuancé (lot 3 · 1a) : « Considérée comme… africo-romaine », formule de l'UNESCO ; superlatif retiré des titres du guide | UNESCO 794 (institutionnelle) |
| `dougga` | Théâtre de 3 500 places (fiche et guide) | Retiré (lot 3 · 1a) : absent de l'UNESCO et de l'AMVPPC | UNESCO 794, AMVPPC Dougga |
| `kerkouane` | Amas de murex, fabrication de pourpre | Retiré (lot 3 · 1a) : aucune source lue | UNESCO 332, Fantar et Guirguis 2024 (sans murex) |
| `kerkouane` | Inscription UNESCO en 1985 | Vérifié : 1985 (1986 = extension, source secondaire seulement) | Liste UNESCO par année |
| `sousse-medina` | Signaux de feu entre ribats | Retiré (lot 3 · 1a) : remplacé par la tour de 821, tour de guet et minaret | AMVPPC ribat de Sousse ; Van Staëvel 2023 (académique) |
| `thuburbo-majus` | Capitole « dédié en 168 » | Retiré (lot 3 · 1a) : aucune source institutionnelle ou académique lue | — |
| `djebel-zaghouan` | « L'un des plus longs du monde romain » (EN seulement) | Retiré (lot 3 · 1a) par prudence ; Hydria écrit « the longest of Roman antiquity », formule non reprise sans seconde source | Hydria (académique) |
| `lezard-rouge` | Voiture-restaurant | Retiré (lot 3 · 1a) : aucune des sources lues ne la mentionne | Tuniscope 2018, SiViaggia 2025 (secondaires) |
| `lezard-rouge` | Lieu de construction des voitures | À vérifier : France selon Tuniscope, Louvain (Belgique) selon SiViaggia ; non publié | Secondaires |

## 8. Constats ajoutés par le lot 1b du Lot 3

Sources lues le 16 novembre 2026. Détail dans `docs/editorial-log/lot3-1b.md`.

| Fiche | Affirmation | Statut | Source lue |
|---|---|---|---|
| `medina-tunis` | Mosquée Zitouna « fondée au VIIIe siècle » ; Tunis « l'une des capitales du monde islamique » | Corrigé (lot 3 · 1b) : fondée vers 699, reconstruite en 728-729 ; formule de l'UNESCO pour les Almohades et les Hafsides | AMVPPC, Zitouna ; UNESCO 36 (institutionnelles) |
| `el-jem` | « L'un des mieux conservés au monde » (fiche et guide) | Corrigé (lot 3 · 1b) : formule de l'UNESCO (podium, arène et souterrains « practically intact ») | UNESCO 38 |
| `chott-el-jerid` | « Le plus grand lac salé du Sahara » | Corrigé (lot 3 · 1b) : « la plus vaste des dépressions salées entre la steppe et le désert » | UNESCO, liste indicative 5385 |
| `chott-el-jerid` | Liste indicative de l'UNESCO depuis 2008, 586 187 ha | Vérifié, non publié (enrichissement, phase 3) | UNESCO, liste indicative 5385 |
| `bulla-regia` | Mosaïques « toujours en place » ; « l'un des seuls endroits du monde romain » ; cité royale numide ; prospère au IIe siècle ; maison d'Amphitrite | Retiré (lot 3 · 1b) ; remplacé par le nom latin, les périodes vandale et byzantine, les maisons citées par l'AMVPPC | AMVPPC, Bulla Regia |
| `bulla-regia` | Légende de photo « mosaïque d'Amphitrite » | À vérifier sur place (non modifiée) | — |
| `tozeur`, `camping-tozeur` | « Plus de 200 sources », « horloge hydraulique », Ibn Chabbat « mathématicien » | Nuancé (lot 3 · 1b) : attribution à Ibn Chabbat (1221-1282) présentée comme une tradition ; le reste retiré | webdo.tn 2016 (secondaire) ; aucune source académique lue |
| `table-de-jugurtha` | Le rebelle Senan au XVIIIe siècle a donné son nom à la ville | Retiré (lot 3 · 1b) : l'UNESCO date le toponyme « Galaat-Senen » de la fin de l'époque médiévale | UNESCO, liste indicative 6278 |
| `monastir` | *La Vie de Brian* tournée en 1978 | Nuancé (lot 3 · 1b) : attribué aux guides de lieux de tournage, année retirée | movie-locations.com (secondaire) |
| `mos-espa` | Décor réutilisé pour *L'Attaque des clones* | Confirmé par une source secondaire (scène du magasin de Watto tournée le 10/09/2000 au décor de Mos Espa) ; non modifié | galaxytours.com, Episode II (secondaire) |
