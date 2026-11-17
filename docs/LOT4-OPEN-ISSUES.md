# Lot 4 · Points réellement non résolus

Version 1, 17 novembre 2026. Ce document ne contient que ce qui n'est pas tranché. Chaque point indique l'étape du plan qu'il bloque et ce qui se passe s'il reste ouvert. **Aucun ne bloque le début du développement** : sans réponse, l'option par défaut s'applique.

| # | Question | Bloque | Option par défaut, sans réponse |
|---|---|---|---|
| 1 | **Quelle source officielle pour la liste des 24 gouvernorats et leur nom en arabe ?** La liste actuelle vient du texte des fiches (22 valeurs). Le total de 24 et les noms arabes n'ont pas été vérifiés (audit C7). Candidats : Institut national de la statistique, portail national. | Le nom arabe des gouvernorats (étapes 1 et 4) | Les 24 clés et les noms FR et EN sont créés. L'arabe reste vide. |
| 2 | **Pour les événements, faut-il que la table `events` fasse foi, et le fichier `data/events.ts` ne serve que de secours ?** Question ouverte depuis l'audit (décision 4). | Étape 6 | La table fait foi, comme le fait déjà la page `/evenements`. `kg:check` signale les écarts. |
| 3 | **Sous-lieux : quelles paires deviennent `partOf` ?** Les candidats sont `souk-el-attarine` dans `medina-tunis`, `kairouan-souks` dans `kairouan`, `houmt-souk` dans `djerba`, `nabeul-market` dans `nabeul` et `dar-jellouli` dans `sfax-medina`. Le Lot 3 a gardé ces fiches séparées. La proximité ne suffit pas. | `containedInPlace` entre fiches (étape 4) | Pas de relation `partOf`. Les fiches restent indépendantes. |
| 4 | **Données UNESCO non accessibles depuis le bac à sable.** La liste des 7 composantes de Djerba (page refusée aux robots), l'année d'inscription de l'Ichkeul, l'année 2023 de Djerba (absente de la page lue), et l'année de la réserve de biosphère de l'Ichkeul (répertoire MAB inaccessible). Mehdi peut les relever dans un navigateur, comme il l'a fait pour la fiche 1769. | Les qualificatifs d'année ; `componentOf` pour Djerba | Les relations sont publiées sans année, et sans composante. |
| 5 | **La mention UNESCO sur `souk-el-attarine` et `kairouan-souks`.** Aucune source lue ne dit que ces fiches sont dans le périmètre du bien (rel-12, non confirmée). La fiche UNESCO de Kairouan cite seulement un décret de 1921 qui protège les souks. Faut-il garder la mention, la retirer, ou la reformuler (« dans la médina classée ») ? | Étape 5 (et c'est un changement de contenu) | La mention reste telle quelle, déclarée comme exception. Elle n'apparaît pas en JSON-LD. |
| 6 | **Saisons de `ksar-ghilane` et `djerba-velo`.** Ces deux lieux n'ont pas de saison et passent pour « correct » toute l'année, y compris en été au Sahara (audit I3). Il faut un choix éditorial des mois. | Avertissement de `kg:check` | L'avertissement reste. Rien n'est inventé. |
| 7 | **Afficher les sources aux visiteurs ?** Ce serait une courte ligne « Sources » sur les fiches, alimentée par le graphe. C'est un nouvel élément d'interface, donc hors du périmètre sans décision. | Rien dans le plan | Les sources ne servent qu'aux données structurées, à `llms.txt` et au registre. |
| 8 | **La page LinkedIn citée en `sameAs` de l'organisation existe-t-elle, et appartient-elle à Tunisia Go ?** (audit S10) | Rien dans le plan | Inchangé. À retirer si la page n'existe pas. |

## Limites connues, acceptées et non bloquantes

Elles ne seront pas transformées en chantiers.
- 20 relations candidates n'ont aucune source, et 6 n'ont qu'une source secondaire (LOT4-RELATIONS § 5). Elles restent au registre, non publiées.
- Les noms français officiels des 3 éléments du patrimoine immatériel n'ont pas été relevés : seules les pages anglaises ont été lues. Le `name.fr` est une traduction éditoriale tant que la page française n'est pas lue.
- Les années 1988 de Kairouan et de Sousse viennent de l'AMVPPC, pas des pages UNESCO, qui ne les affichent pas. C'est une source institutionnelle suffisante.
- Le support du ministère de l'Environnement qui cite les décrets des parcs (`S18`) n'affiche ni date ni auteur. Les dates de Bouhedma et de Jbil sont recoupées par d'autres sources (`S07`, `S19`). Les décrets eux-mêmes (JORT) n'ont pas été lus.
