# Lot 4 · Architecture définitive du Knowledge Graph

Version 1, 17 novembre 2026. Base : `main` au commit `de63e15`. Ce document est le seul à décrire le stockage, les identifiants, la publication et la validation. Les autres documents du Lot 4 se partagent le reste :
- les entités sont dans [`LOT4-ENTITIES.md`](LOT4-ENTITIES.md) ;
- les relations et leurs preuves sont dans [`LOT4-RELATIONS.md`](LOT4-RELATIONS.md) ;
- l'ordre de réalisation est dans [`LOT4-IMPLEMENTATION-PLAN.md`](LOT4-IMPLEMENTATION-PLAN.md) ;
- les points non résolus sont dans [`LOT4-OPEN-ISSUES.md`](LOT4-OPEN-ISSUES.md).

## 1. Décisions

| # | Décision | Pourquoi |
|---|---|---|
| A1 | **Le graphe est une donnée typée et versionnée dans le dépôt** (`data/kg/`, TypeScript), lue à la construction du site comme les fiches. | Les 95 fiches, les 20 road trips et leurs traductions sont déjà dans le dépôt, et sont relus par PR selon `docs/EDITORIAL-METHOD.md`. Mettre le graphe ailleurs créerait une deuxième source de vérité (risque T3 de l'audit, déjà réalisé pour les événements). |
| A2 | **Pas de Neo4j, pas de nouvelle infrastructure.** | Volume visé en phase 1 : environ 200 nœuds et 600 liens, dont 109 étapes et 95 rattachements de gouvernorat. Les requêtes sont à un ou deux sauts (« ce qui est relié à Dougga »). Un index en mémoire, calculé au build, répond en microsecondes. Aucun besoin de parcours de graphe profond n'a été identifié. |
| A3 | **Supabase garde ses rôles actuels** : données dynamiques ou saisies dans /admin (éditions d'événements, professionnels, contributions). **Pas de nouvelle table en phase 1.** | Les tables relationnelles sont presque vides (audit, point 9), et les pages lieux sont statiques. Le graphe éditorial n'a besoin ni d'écriture en ligne ni de RLS. |
| A4 | **Le passage vers Postgres est prévu, sans être engagé.** Le schéma de repli est donné au § 9. Il ne s'active que sur un critère mesurable : un graphe édité depuis /admin par une personne qui ne passe pas par Git, plus de 5 000 relations, ou des relations proposées par les visiteurs. | Ne pas reconstruire, mais ne pas s'enfermer. Les identifiants `type:clé` et le format des relations sont les mêmes dans les deux cas. |
| A5 | **Les slugs et les URL ne changent pas.** Les entités nouvelles n'ont pas de page en phase 1. | Préserver le SEO, les favoris, les liens partagés et les votes (risque T1). |
| A6 | **Toute clé est indépendante de la langue** (`gov:kebili`, et jamais « Kébili »). | C'est la cause racine du défaut Kébili / Le Kef (audit § 4.3), toujours présent dans `main` (vérifié au commit `de63e15`). |
| A7 | **Une relation documentaire n'est publiée que si elle est « établie »** (LOT4-RELATIONS § 3). Le contrôle est fait par le code : le filtre `published` est le seul chemin vers le JSON-LD, `llms.txt` et les réponses factuelles de l'assistant. | Les principes validés le 17/11, et la recommandation R4 de l'audit. |

## 2. Arborescence

```
data/kg/
  types.ts            types communs (§ 3)
  sources.ts          registre des sources (codes L-… et S…, LOT4-RELATIONS § 4)
  governorates.ts     24 gouvernorats + correspondance avec Place.region (EN)
  areas.ts            zones éditoriales : correspondances gouvernorat → cahier, zone assistant, région ONTT (copie de l'existant)
  designations.ts     statuts de protection (LOT4-ENTITIES § 4.2)
  ich.ts              patrimoine immatériel (§ 4.3)
  heritage.ts         éléments patrimoniaux et musées contenus dans une fiche (§ 4.4)
  history.ts          entités politiques, personnes, événements historiques (§ 4.5)
  festivals.ts        festivals (§ 4.6)
  placeKinds.ts       kind et habitat[] par id de lieu (enrichit sans toucher tunisiaData.ts)
  relations.ts        relations documentaires (rel-01 … rel-75, puis rel-76 et suivantes)
lib/kg/
  index.ts            index en mémoire : get(id), relationsOf(id, { published }), label(id, locale)
  structural.ts       relations structurelles dérivées des données existantes (stops, region, near…)
  jsonld.ts           fragments Schema.org issus du graphe (§ 6)
  facts.ts            faits publiés par lieu, pour l'assistant et llms.txt (§ 7)
scripts/kg-check.ts   validateur (§ 8), lancé par `npm run kg:check`
```

**Ce qui ne bouge pas :**
- `data/tunisiaData.ts` et `data/i18n/*` restent la source des fiches ;
- `data/events.ts`, `data/stays.ts` et `data/agencies*.ts` restent en place ;
- aucune table, aucune colonne et aucune politique Supabase ne change en phase 1.

Les relations structurelles **ne sont pas recopiées**. `lib/kg/structural.ts` les lit dans les fichiers existants : `Itinerary.stops`, `Place.category`, `Stay.near`, `GUIDE_BY_PLACE` et `events.place_id`. Il n'y a donc aucune duplication.

## 3. Modèle de données

```ts
type EntityId = `${Prefix}:${string}`;           // 'place:carthage', 'gov:kebili', 'designation:whc-499'
type Prefix = 'country' | 'gov' | 'area' | 'place' | 'heritage' | 'designation' | 'ich'
  | 'tradition' | 'polity' | 'period' | 'person' | 'hevent' | 'festival' | 'event' | 'trip' | 'actor' | 'work';

interface Labels { fr: string; en: string }

interface KgEntity {
  id: EntityId;
  kind?: string;                       // vocabulaire contrôlé par type
  name: Labels;
  nameAr?: { text: string; source: SourceId | 'fiche-non-verifie' };
  altNames?: { fr?: string[]; en?: string[] };
  officialId?: string;                 // n° UNESCO, Ramsar, décision 17.COM…
  sameAs?: string[];                   // vérifiés un par un
  status: 'active' | 'draft' | 'retired';
  sources?: SourceId[];
}

type RelationStatus = 'established' | 'partial' | 'secondary' | 'attributed'
  | 'unverified' | 'contradicted' | 'contested' | 'refuted';

interface KgRelation {
  id: `rel-${string}`;                 // rel-01 … : jamais renommé
  type: RelationType;                  // LOT4-RELATIONS § 2.2
  from: EntityId;
  to: EntityId;
  qualifiers?: { date?: string; role?: Labels; officialId?: string };
  status: RelationStatus;
  sources: SourceId[];                 // vide seulement si status = 'unverified'
  checkedAt: string;                   // date de lecture de la source (AAAA-MM-JJ)
  note?: string;                       // réserve, en français
}

interface KgSource {
  id: SourceId;                        // 'S01', 'L-U37'…
  issuer: string; title: string; url: string;
  level: 'institutional' | 'academic' | 'secondary';
  consulted: string;                   // AAAA-MM-JJ
  lot: '2A' | '3' | '3·1a' | '3·1b' | '2C';
}
```

- **Publié** = `status === 'established'` et entités aux deux bouts `active`. Pour une relation partielle, seuls les qualificatifs portant leur propre source établie sont publiés (par exemple : le statut est publié, l'année ne l'est pas).
- **Lieux** : `place:<slug>` pointe vers l'objet `Place` existant. Le graphe ne copie aucun champ de la fiche.
- **Gouvernorat d'un lieu** : il est calculé à partir de la valeur **anglaise** de `Place.region`, lue dans `PLACES` (la donnée de base), et jamais à partir de la valeur traduite. Le résultat est `placeGovernorate(id): GovId`. Les 95 fiches ne sont pas modifiées.

## 4. Langues

- **Une seule convention pour les nouvelles données** : l'objet `{ fr, en }`, déjà utilisé par les guides, les cahiers et les événements. Les deux autres conventions (la surcouche des fiches, les colonnes `_fr`/`_en` de Supabase) restent en place pour l'existant et ne sont pas migrées.
- **Arabe** : champ `nameAr` facultatif, toujours accompagné de sa source.
  - Pour les gouvernorats, il attend la source officielle (OPEN-ISSUES § 1).
  - Pour les lieux, le `nameAr` des fiches reste ce qu'il est, publié en `alternateName` comme aujourd'hui.
- Le validateur exige que `name.fr` et `name.en` soient tous deux remplis, comme pour les fiches.

## 5. Ce que le graphe alimente sur les pages publiques

Aucune refonte, aucun nouveau composant visuel en phase 1. Le graphe remplace des calculs fragiles par des clés, aux endroits qui existent déjà :

| Endroit existant | Aujourd'hui | Avec le graphe |
|---|---|---|
| Fil d'Ariane, lien « Que voir à », bloc des agences (page lieu, carte) | comparaison sur la région **traduite** | `placeGovernorate(id)`. Le défaut des 4 pages FR de Kébili est corrigé. |
| Titre FR des pages région, liste des régions de l'accueil | nom anglais | `name.fr` du gouvernorat (« Que voir à Kébili ? »). Les URL `/que-voir/kebili` ne changent pas. |
| Mention « Patrimoine mondial de l'UNESCO » (page lieu, carte, carnet imprimable) | booléen `unesco` (12 fiches, dont 2 souks) | dérivée de `hasDesignation` vers un bien du patrimoine mondial. Le booléen reste, et le validateur vérifie la concordance. Le cas des deux souks est décrit dans OPEN-ISSUES § 5. |
| `llms.txt` | liste de pages | ajout d'une section générée, « Statuts officiels », avec les relations établies et l'URL de leur source |

Afficher les sources aux visiteurs serait un nouvel élément d'interface. Ce n'est **pas** prévu sans décision (OPEN-ISSUES § 7).

## 6. Données structurées (Schema.org)

| Sujet | Règle |
|---|---|
| **`@id` des lieux** | Un seul `@id` par lieu, quelle que soit la langue : l'URL **française** canonique + `#place` (exemple : `https://www.tunisiagoo.com/lieux/carthage#place`). La page anglaise garde son `url` anglaise, mais réutilise ce même `@id`. Les URL ne changent pas, seul l'identifiant JSON-LD est unifié (écart S1 de l'audit). |
| **Gouvernorat** | `containedInPlace: { "@type": "AdministrativeArea", "@id": SITE_URL + "/#gov-<clé>", name, containedInPlace: { "@type": "Country", "@id": SITE_URL + "/#country-tn", name: "Tunisie" / "Tunisia" } }`. Si le gouvernorat a une page « Que voir à », on ajoute `url`. |
| **Élément patrimonial contenu** | `containsPlace` sur le lieu, avec un nœud `@id = <@id du lieu>-<clé>` et un type précis (`Mosque`, `Museum`, `LandmarksOrHistoricalBuildings`). Seulement si la relation `containsHeritage` est établie. |
| **Statut officiel** | `subjectOf: { "@type": "WebPage", name: "<nom officiel>", url: "<page officielle lue>" }`, par exemple la fiche UNESCO 499 pour Kairouan. Pas de `sameAs` vers la page UNESCO : elle décrit un bien, pas toujours la fiche entière (Kairouan, Djerba). |
| **Fondateur, dynastie** | `founder: { "@type": "Person", name }` seulement pour `builtBy` établi vers une personne. Pas de JSON-LD pour les dynasties : c'est du texte. |
| **Road trips** | `@id = <URL FR du road trip>#trip`, réutilisé sur `/explore` et sur la page du road trip (écart S5). |
| **Éditions d'événements** | `location: { "@id": <@id du lieu> }` au lieu d'un `Place` anonyme (écart S6). `superEvent` pointe vers le festival quand l'édition y est reliée. |
| **`sameAs` des lieux** | Wikidata seulement, après vérification manuelle une par une (étape optionnelle du plan). Jamais en automatique (risque T6). |
| **Annuaires ONTT** | Rien en JSON-LD (recommandation R7 de l'audit). |
| **Poids** | `/explore` ne reçoit que des références par `@id`, pas les nœuds complets. La taille est mesurée avant et après (plan, étape 4). |

## 7. Assistant et moteurs IA

- `lib/kg/facts.ts` produit, pour chaque lieu, une **courte liste de faits publiés** : statuts, éléments patrimoniaux, fondateur ou dynastie établis. Chaque fait est accompagné de sa source.
  - L'assistant Gemini (`lib/assistant/ai.ts`) reçoit ces faits avec le contexte du lieu. Il reste limité au contenu du site, comme aujourd'hui.
  - Les relations secondaires, attribuées ou non vérifiées n'y entrent **jamais**.
- **Zones du moteur par mots-clés** : `ZONE_PLACES` (38 lieux sur 95) est remplacé par une table calculée lieu → gouvernorat → zone (`area:`). Les 95 lieux sont ainsi couverts (écart X6). Les 4 zones restent les mêmes.
- **`llms.txt`** : ajout de la section générée décrite au § 5. Les moteurs IA lisent déjà ce fichier et les données structurées. Il n'y a rien d'autre à exposer.

## 8. Validation automatique (`npm run kg:check`)

C'est un script en lecture seule, lancé localement et dans chaque PR, avec un code de sortie non nul en cas d'erreur.

**Erreurs (bloquantes) :**
1. Un identifiant en double, ou qui ne respecte pas la forme `préfixe:clé` en ASCII minuscule.
2. Une référence morte : une relation, une étape, un `near`, un `placeId` d'événement ou une entrée de `GUIDE_BY_PLACE` qui pointe vers une entité absente.
3. Une `Place.region` sans gouvernorat correspondant, ou un gouvernorat sans nom FR ou EN.
4. Une relation sans source alors que son statut n'est pas `unverified`, ou une source absente du registre.
5. Une relation `established` dont une source est de niveau `secondary`.
6. Une relation `componentOf` sans `officialId` de composante.
7. Une entité `place:` qui a perdu son slug par rapport à la liste de référence (protection contre le renommage, risque T1). La liste des 95 slugs et des 20 road trips est figée dans le script.
8. Un booléen `unesco` en désaccord avec les statuts `whc-*`, sauf exception déclarée.

**Avertissements :**
9. Une source consultée il y a plus de 6 mois (méthode éditoriale § 3).
10. Un `nameAr` sans source.
11. Un lieu sans saison (aujourd'hui `ksar-ghilane` et `djerba-velo`).
12. Facultatif, avec la clé anonyme en lecture seule : des `place_id` Supabase qui ne correspondent à aucun slug.

Le script n'écrit rien, ni dans le dépôt, ni dans Supabase.

## 9. Repli prévu vers Postgres (non engagé)

Si un critère de A4 est atteint, le même modèle passe dans Supabase avec trois tables :
- `kg_entities` (id text primaire, prefix, kind, name jsonb, status) ;
- `kg_relations` (id text primaire, type, from_id et to_id avec clé étrangère vers `kg_entities`, qualifiers jsonb, status, checked_at) ;
- `kg_sources`, avec une table de jointure `kg_relation_sources`.

Les lieux y seraient référencés par leur slug, comme aujourd'hui. Une requête récursive (`WITH RECURSIVE`) couvre les parcours nécessaires. La migration consisterait à recopier `data/kg/` et à remplacer `lib/kg/index.ts` par une lecture au build. Les pages ne changeraient pas.

## 10. Données personnelles et consentement

- Le graphe ne contient que des entités publiques et des acteurs publiés avec leur consentement (`consent` dans `pro_listings` et `partner_listings`).
- `traveler_data`, `place_ratings`, `place_reports`, `link_clicks` et les suggestions non approuvées n'y entrent jamais.
- Les annuaires ONTT restent des données d'annuaire. Ils ne sont pas exposés en JSON-LD, et rien n'est ajouté sur les personnes physiques.
