# Lot 4 · Registre des entités du Knowledge Graph

Version 1, 17 novembre 2026. Base : `main` au commit `de63e15`.

Ce document fixe **les types d'entités** du graphe de Tunisia Go, leurs identifiants, leur source de vérité et ce qui en est publié. Les relations sont dans [`LOT4-RELATIONS.md`](LOT4-RELATIONS.md), le stockage et la publication dans [`LOT4-FINAL-ARCHITECTURE.md`](LOT4-FINAL-ARCHITECTURE.md).

Travaux réutilisés, sans les refaire (dossier projet `seo/lot4/`) :
- l'audit technique (Prompt 1) ;
- l'inventaire des 21 types candidats (Prompt 2) ;
- le registre des 155 entités candidates (Prompt 2B, `lot4-2b-registre-entites.csv`) ;
- la vérification institutionnelle (Prompt 2C).

## 1. Règles communes

1. **Une entité a une utilité ou n'existe pas.** Elle doit servir au moins à l'un de ces usages : une page, une donnée Schema.org, une réponse de l'assistant, un filtre, ou une relation documentée. Un mot présent dans un texte ne suffit pas à créer une entité (registre 2B, partie 4).
2. **Pas de doublon d'une fiche.** Quand une fiche lieu décrit déjà l'objet (le Bardo, l'amphithéâtre d'El Jem, le ribat de Monastir, la ville de Tozeur), c'est la fiche qui joue ce rôle, avec un `kind` (musée, monument, ville…). On ne crée une entité à part que pour un objet **contenu** dans une fiche (la Grande Mosquée dans `kairouan`, la Zitouna dans `medina-tunis`).
3. **Identifiant stable, indépendant de la langue** : `<préfixe>:<clé>`.
   - La clé est en ASCII minuscule, avec des tirets.
   - Elle n'est jamais dérivée d'un nom traduit, ce qui évite de reproduire le défaut Kébili de l'audit (§ 4.3).
   - Une clé publiée n'est jamais renommée. Si une entité disparaît, elle est marquée `retired`, jamais supprimée.
4. **Les slugs actuels restent les clés.** Les 95 lieux deviennent `place:<slug>` et les 20 road trips `trip:<slug>`. Aucune URL ne change.
5. **Les noms sont toujours en français et en anglais.** L'arabe n'est ajouté que s'il vient d'une source officielle ou du champ `nameAr` déjà présent, qui est alors noté « non vérifié ». On n'invente jamais de variante (principe validé au 2B).
6. **Vocabulaire validé par Mehdi le 17/11/2026 :**
   - « Amazigh » est le terme éditorial quand les sources le justifient ; « Berbère » est gardé comme variante ;
   - « Andalou » et « Morisque » sont deux notions distinctes ;
   - on préfère les dates, dynasties et événements précis aux grandes périodes ;
   - les catégories UNESCO sont distinctes.
7. **Données personnelles.** Aucune donnée de visiteur (`traveler_data`, notes, signalements, suggestions non publiées) n'entre dans le graphe. Un professionnel n'y entre que s'il est publié avec son consentement (`consent`).

## 2. Les 17 types retenus

Légende de la colonne « Publié » :
- **public** : page, JSON-LD et assistant ;
- **assistant** : seulement l'assistant et la navigation interne ;
- **interne** : registre éditorial seulement.

| # | Type | Préfixe | Ce que c'est | Source de vérité | Volume initial | Schema.org | Publié |
|---|---|---|---|---|---|---|---|
| 1 | Pays | `country:` | La Tunisie, nœud racine | `data/kg/` | 1 (`country:tn`) | `Country` | public |
| 2 | Gouvernorat | `gov:` | Division administrative officielle | `data/kg/governorates` | 24 (22 utilisés aujourd'hui) | `AdministrativeArea` | public |
| 3 | Zone éditoriale | `area:` | Découpages propres au site : cahiers pratiques, zones de l'assistant, régions ONTT des hébergements et des agences | `data/kg/areas` | 6 + 4 + 10 + 14 | aucun | assistant |
| 4 | Lieu | `place:` | Les 95 fiches actuelles, et à terme les lieux communautaires approuvés (`c-<uuid>`). Un champ `kind` précise s'il s'agit d'une ville, d'un site, d'un monument, d'un musée, d'un site naturel, d'une plage, d'un souk, d'un camping ou d'un itinéraire vélo. | `data/tunisiaData.ts` + `data/i18n/` (inchangés) | 95 | `TouristAttraction` + `additionalType` selon `kind` | public |
| 5 | Élément patrimonial | `heritage:` | Monument, site archéologique ou ensemble **contenu dans** une fiche, qui n'a pas de fiche à lui | `data/kg/heritage` | 8 en phase 1 | `LandmarksOrHistoricalBuildings`, `Mosque`, `Museum`… | public si relation établie |
| 6 | Musée | `heritage:` (`kind: museum`) | Musée nommé par une source institutionnelle et sans fiche à lui | `data/kg/heritage` | 5 | `Museum` | public |
| 7 | Statut de protection | `designation:` | Bien du patrimoine mondial, bien sur liste indicative, composante officielle d'un bien, site Ramsar, réserve de biosphère ou parc national. Le champ `scheme` les distingue. | `data/kg/designations` | 10 + 4 + 0 + 2 + 2 + 2 | `subjectOf` / `sameAs` (voir architecture § 6) | public |
| 8 | Élément du patrimoine immatériel | `ich:` | Élément inscrit sur une liste de l'UNESCO | `data/kg/ich` | 3 | `DefinedTerm` (dans un `DefinedTermSet` UNESCO) | public |
| 9 | Tradition | `tradition:` | Savoir-faire ou pratique **non inscrit**, décrit par Tunisia Go (poterie de Guellala, fauconnerie d'El Haouaria…) | `data/kg/traditions` | 0 en phase 1 | aucun | assistant |
| 10 | Entité politique ou culturelle | `polity:` | Civilisation, peuple, dynastie, État ou empire. Le champ `kind` vaut `people`, `dynasty`, `state` ou `empire`. | `data/kg/history` | 7 en phase 1 | `Organization` n'est pas adapté : pas de JSON-LD dédié, seulement un texte | assistant |
| 11 | Période | `period:` | Seulement quand elle est sourcée et utile (principe 4) | `data/kg/history` | 0 en phase 1 | aucun | interne |
| 12 | Personnage historique | `person:` | Personne réelle citée avec une relation documentée | `data/kg/history` | 3 en phase 1 | `Person` (seulement dans `founder` ou `about` d'une entité publiée) | public si relation établie |
| 13 | Événement historique | `hevent:` | Bataille, destruction, fondation datée | `data/kg/history` | 2 en phase 1 | `Event` est réservé aux événements à venir : pas de JSON-LD | assistant |
| 14 | Festival | `festival:` | La série récurrente (le Festival international du Sahara, par exemple) | `data/kg/festivals` | 7 | `Festival` (série) | public |
| 15 | Édition | `event:` | Une édition datée, c'est-à-dire les lignes actuelles de la table `events` | Supabase `events` (voir OPEN-ISSUES § 2) | 7 | `Event` / `Festival` | public (seulement les éditions confirmées, comme aujourd'hui) |
| 16 | Road trip | `trip:` | Les 20 road trips actuels | `data/tunisiaData.ts` (inchangé) | 20 | `TouristTrip` | public |
| 17 | Acteur touristique | `actor:` | Hébergement ONTT (`stay:<id>` existant), agence ONTT (`agency:<id>`, identifiant à créer), guide ou partenaire publié | `data/stays.ts`, `data/agencies*.ts`, Supabase `pro_listings` et `partner_listings` | 130 + 916 + 0 + 0 | aucun (recommandation R7 de l'audit) | assistant (annuaires ONTT) ; public seulement pour un pro publié avec consentement |

Deux autres objets ne sont **pas** des entités : la **source documentaire** et l'**œuvre**.
- **La source documentaire (`src:`)** est un objet de provenance. Chaque source a un émetteur, un titre, une URL, une date de consultation, un niveau (institutionnelle, académique ou secondaire) et un lot d'origine. Elle n'est pas publiée comme entité, mais elle est citable. Le premier lot de sources est donné dans `LOT4-RELATIONS.md` § 4.
- **L'œuvre (`work:`, films)** n'est gardée qu'au registre interne. Aucune relation de tournage n'a de source de production à ce jour (statut « secondaire »), et les films ne servent ni aux pages, ni au JSON-LD, ni aux réponses factuelles de l'assistant.

**Types candidats non retenus comme entités**, et ce qu'ils deviennent :

| Candidat (Prompt 2) | Décision | Raison |
|---|---|---|
| Ville, localité | Une fiche `place:` avec `kind: town` (Tozeur, Kairouan…). Pas de type séparé. | Éviter de doubler 30 fiches de ville. Une localité sans fiche n'apparaît que comme texte d'adresse. |
| Région touristique | Remplacée par `gov:` (officiel) et `area:` (éditorial) | Six découpages concurrents (audit § 1, point 5). On les garde, mais tous rattachés aux gouvernorats. |
| Site historique / site archéologique | Valeur de `kind` sur `place:` ou `heritage:` | Même objet, deux noms. |
| Paysage, type de milieu (oasis, chott, erg…) | Étiquettes `habitat[]` sur `place:` (vocabulaire contrôlé, sans page) | Ce sont des mots de recherche, pas des choses identifiables. |
| Expérience, activité | Pas d'entité en phase 1. `CategoryId` et `PRO_ACTIVITIES` restent les vocabulaires. | Pas de données ni de source (Prompt 2, § 2.17-2.18). |
| Objet de collection (mosaïque, statue) | Pas d'entité. On le cite dans le texte du musée. | Une seule relation documentée (Virgile au Bardo) : trop peu pour un type. |
| Guide long, cahier pratique | Contenu (`Article`) rattaché à un lieu ou à une zone. Ce n'est pas une entité du graphe. | Ce sont des pages du site, pas des choses du monde. |
| Mot du lexique | Il reste dans `data/lexicon.ts`. On ne le relie à une zone que si une source linguistique existe. | Hors du périmètre factuel du Lot 4. |

## 3. Champs communs

Tous les objets de `data/kg/` partagent cette forme (le type exact est dans l'architecture, § 3) :

| Champ | Obligatoire | Contenu |
|---|---|---|
| `id` | oui | `<préfixe>:<clé>`, jamais renommé |
| `type` | oui | l'un des 17 types |
| `kind` | selon le type | sous-type contrôlé (par exemple `museum`, `dynasty`, `whc`) |
| `name` | oui | `{ fr, en }` |
| `nameAr` | non | texte arabe, avec `nameArSource` (identifiant de source, ou `fiche-non-verifie`) |
| `altNames` | non | variantes FR et EN (Oqba/Uqba, Zitouna/Zaytuna, Thugga/Dougga…) pour la recherche et l'assistant |
| `officialId` | non | identifiant externe officiel (n° UNESCO, n° de liste indicative, n° de fiche Ramsar, n° d'élément du patrimoine immatériel) |
| `sameAs` | non | URL externes vérifiées une par une (Wikidata, page UNESCO). Jamais déduites automatiquement (risque T6). |
| `status` | oui | `active`, `draft` (non publié) ou `retired` |
| `sources` | oui pour les types 5 à 15 | liste d'identifiants `src:` |

## 4. Instances de la phase 1

On ne publie que ce qui est établi (Prompt 2C, § 5). Toutes les autres entités du registre 2B restent des **candidates** et ne sont pas créées.

### 4.1 Géographie

- `country:tn`.
- 24 `gov:`. Clés proposées, sans accent : `tunis`, `ariana`, `ben-arous`, `manouba`, `nabeul`, `zaghouan`, `bizerte`, `beja`, `jendouba`, `kef`, `siliana`, `sousse`, `monastir`, `mahdia`, `sfax`, `kairouan`, `kasserine`, `sidi-bouzid`, `gabes`, `medenine`, `tataouine`, `gafsa`, `tozeur`, `kebili`.
  - Les noms FR et EN repartent des 22 valeurs actuelles de `Place.region`.
  - Le FR suit les fiches : « Kébili », « Le Kef ».
  - L'arabe et la liste officielle restent à sourcer (OPEN-ISSUES § 1). En attendant, l'arabe est laissé vide.
- `area:` : les découpages existants, recopiés **sans changement** sous forme de correspondances gouvernorat → zone :
  - 7 cahiers (`data/regionGuides.ts`) ;
  - 4 zones de l'assistant ;
  - 10 régions d'hébergement ONTT (`data/stays.ts`) ;
  - 14 régions d'agences ONTT (`REGION_OF_GOVERNORATE`).

### 4.2 Statuts de protection (`designation:`)

| Id | Nom | Schéma | N° officiel | Année ou date | Source | Fiche(s) |
|---|---|---|---|---|---|---|
| `designation:whc-37` | Site archéologique de Carthage | patrimoine mondial | 37 | 1979 | Lot 3 (UNESCO 37, AMVPPC) | `carthage` |
| `designation:whc-36` | Médina de Tunis | patrimoine mondial | 36 | 1979 | Lot 3 | `medina-tunis` |
| `designation:whc-38` | Amphithéâtre d'El Jem | patrimoine mondial | 38 | 1979 | Lots 2A et 3 | `el-jem` |
| `designation:whc-8` | Parc national de l'Ichkeul | patrimoine mondial | 8 | année à sourcer (OPEN-ISSUES § 4) | 2C [S17], [S16] | `ichkeul` |
| `designation:whc-332` | Cité punique de Kerkouane et sa nécropole | patrimoine mondial | 332 | 1985 (extension 1986) | Lot 3·1a | `kerkouane` |
| `designation:whc-499` | Kairouan | patrimoine mondial | 499 | 1988 (AMVPPC) | 2C [S01] + Lot 3 | `kairouan` |
| `designation:whc-498` | Médina de Sousse | patrimoine mondial | 498 | 1988 (AMVPPC) | 2C [S02] + Lot 3 | `sousse-medina` |
| `designation:whc-794` | Dougga / Thugga | patrimoine mondial | 794 | 1997 | Lot 3·1a | `dougga` |
| `designation:whc-1640` | Djerba : témoignage d'un mode d'occupation d'un territoire insulaire | patrimoine mondial | 1640 | 2023 (année non affichée sur la page lue) | 2C [S03] | `djerba` |
| `designation:whc-1769` | Village de Sidi Bou Saïd | patrimoine mondial | 1769 | 2026 | Lot 3 (vérifié par Mehdi) | `sidi-bou-said` |
| `designation:tl-6278` | La Table de Jugurtha à Kalaat Senan | liste indicative | 6278 | soumis le 29/09/2017 | Lot 3·1b | `table-de-jugurtha` |
| `designation:tl-5385` | Chott el Jérid | liste indicative | 5385 | à relever | Lot 3·1b | `chott-el-jerid` |
| `designation:tl-5384` | Parc national de Bouhedma | liste indicative | 5384 | 28/05/2008 | 2C [S07] | `bou-hedma` |
| `designation:tl-5685` | Complexe hydraulique romain de Zaghouan-Carthage | liste indicative | 5685 | 17/02/2012 | 2C [S08] | `zaghouan`, `djebel-zaghouan`, `carthage` |
| `designation:ramsar-1710` | Sebkhet Kelbia | Ramsar | 1710 | 07/11/2007 | Lot 2A | `sebkhet-kelbia` |
| `designation:ramsar-213` | Ichkeul | Ramsar | 213 | 24/11/1980 | 2C [S16] | `ichkeul` |
| `designation:mab-bouhedma` | Réserve de biosphère de Bouhedma | biosphère | — | 1977 | 2C [S07], [S18] | `bou-hedma` |
| `designation:mab-ichkeul` | Réserve de biosphère de l'Ichkeul | biosphère | — | année à sourcer | 2C [S16] (Ramsar seulement) | `ichkeul` |
| `designation:np-bouhedma` | Parc national de Bouhedma | parc national | décret 80-1606 | 18/12/1980 | 2C [S07], [S18] | `bou-hedma` |
| `designation:np-jbil` | Parc national de Jbil | parc national | décret 94-2210 | 24/10/1994 | 2C [S19], [S18] | `jebil` |

**Composantes officielles des biens** : aucune en phase 1. Celles de Djerba (1640) ne sont pas lisibles (OPEN-ISSUES § 4), et on ne les déduit pas de la proximité.

### 4.3 Patrimoine immatériel (`ich:`)

| Id | Nom officiel | Année, décision | Rattachement autorisé |
|---|---|---|---|
| `ich:01710` | Harissa, savoirs, savoir-faire et pratiques culinaires et sociales | 2022, 17.COM 7.b.30 | `country:tn` seulement : aucun lien avec Nabeul (2C) |
| `ich:01406` | Savoir-faire des potières de Sejnane | 2018, 13.COM 10.b.38 | `place:sejnane` |
| `ich:01566` | La pêche à la charfia aux îles Kerkennah | 2020, 15.COM 8.b.9 | `place:kerkennah` |

Le nom français officiel des éléments n'a pas été lu (seule la page anglaise l'a été). Le `name.fr` reste donc une traduction éditoriale tant que la page française n'est pas relevée.

### 4.4 Patrimoine contenu dans une fiche et musées (`heritage:`)

| Id | Nom | Kind | Dans | Source |
|---|---|---|---|---|
| `heritage:grande-mosquee-kairouan` | Grande Mosquée de Kairouan | mosque | `place:kairouan` | AMVPPC (Lot 3), [S01] |
| `heritage:bassins-aghlabides` | Bassins des Aghlabides | monument | `place:kairouan` | [S09], [S01] |
| `heritage:zitouna` | Mosquée Zitouna | mosque | `place:medina-tunis` | AMVPPC (Lot 3·1b) |
| `heritage:ribat-sousse` | Ribat de Sousse | monument | `place:sousse-medina` | AMVPPC (Lot 3·1a), [S02] |
| `heritage:aqueduc-zaghouan-carthage` | Aqueduc et temple des Eaux de Zaghouan-Carthage | monument | `place:zaghouan`, `place:djebel-zaghouan` | Hydria (Lot 2A), [S08] |
| `heritage:thermes-antonin` | Thermes d'Antonin | monument | `place:carthage` | AMVPPC (Lot 3·1a) |
| `heritage:quartier-magon` | Quartier Magon | archaeological-site | `place:carthage` | [S14] |
| `heritage:villas-romaines-carthage` | Parc des villas romaines (odéon, théâtre voisin) | archaeological-site | `place:carthage` | [S15] |
| `heritage:musee-carthage` | Musée de Carthage | museum | `place:carthage` | [S10] |
| `heritage:musee-el-jem` | Musée d'El Jem | museum | `place:el-jem` | [S11] |
| `heritage:musee-sousse` | Musée archéologique de Sousse | museum | `place:sousse-medina` | [S12] |
| `heritage:musee-kerkouane` | Musée de site de Kerkouane | museum | `place:kerkouane` | AMVPPC (Lot 3) |
| `heritage:musee-patrimoine-djerba` | Musée du patrimoine traditionnel de Djerba | museum | `place:houmt-souk` (Houmt Souk) | [S13]. **Ce n'est pas** le musée de la fiche `guellala`. |

Le Bardo, El Jem (l'amphithéâtre), le ribat de Monastir, Dougga, Kerkouane et Bulla Regia sont déjà des fiches. Ils prennent un `kind` et ne sont pas dupliqués.

### 4.5 Histoire (phase 1, seulement ce qui est sourcé)

| Id | Nom | Kind | Utilisé par |
|---|---|---|---|
| `polity:abbassides` | Abbassides | dynasty | rel-23 |
| `polity:aghlabides` | Aghlabides | dynasty | rel-25, rel-26, bassins |
| `polity:almohades` | Almohades | dynasty | rel-29 |
| `polity:hafsides` | Hafsides | dynasty | rel-29 |
| `polity:numides` | Numides (royaumes numides) | people | rel-33 |
| `polity:carthage-punique` | Carthage punique | state | rel-36, rel-38 |
| `polity:rome` | Rome | state | rel-38, rel-31 (seulement comme qualificatif) |
| `person:harthama-ibn-ayan` | Harthama ibn A'yan | — | rel-23 |
| `person:ziyadat-allah-1` | Ziyadat Allah Ier | — | rel-25 |
| `person:abu-ibrahim-ahmad` | Abû Ibrâhîm Ahmad (émir aghlabide) | — | bassins [S09] |
| `hevent:guerres-puniques` | Guerres puniques | — | rel-36 |
| `hevent:destruction-carthage-146` | Destruction de Carthage (146 av. J.-C.) | — | rel-38 |

`polity:amazighs`, `polity:andalous` et `polity:morisques` sont des types prévus, avec le vocabulaire validé. Ils ne sont **créés** que lorsqu'une relation sourcée les utilise. C'est déjà le cas d'aucune.

### 4.6 Festivals et éditions

Les 7 identifiants actuels de `data/events.ts` (`sahara-douz`, `jtc`, `jcc`, `carthage`, `hammamet`, `el-jem`, `tabarka-jazz`) deviennent les clés `festival:<id>`. Chaque ligne datée de la table `events` devient une édition `event:<uuid ou id>` reliée à son festival. Aucun nom n'est modifié.

## 5. Candidats du registre 2B, hors phase 1

Les 155 candidats du registre 2B gardent leur identifiant de registre (`civ-…`, `pers-…`). Ils entrent dans le graphe **seulement** quand une relation qui les utilise devient « établie » (LOT4-RELATIONS § 3). Ce n'est pas un chantier ouvert : c'est une règle d'entrée. Ceux qui relèvent de la légende, de la tradition ou d'une homonymie (registre 2B, parties 4 et 5) ne seront jamais des entités publiques.
