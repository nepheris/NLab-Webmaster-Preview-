# nLab Dashboard System — V0.1 candidate

## Objet

Capitaliser les règles visuelles communes aux dashboards nLab sans uniformiser leurs fonctions métier.

## Inventaire de référence

| Projet Preview | Surface | Version comparative | Source fonctionnelle |
|---|---|---:|---|
| `cockpit-nlab` | Cockpit / Copilote | V5 UX | Cockpit nLab V4 |
| `post-it-dashboard` | Post-it & TODO | V0.6 UX | Dashboard Post-it V0.5 |
| `nlab-roadmap-dashboard` | Roadmap | V0.1 | Vue Roadmap de nLab JSON Studio |
| `nlab-gantt-dashboard` | Gantt | V0.1 | Vue Gantt de nLab JSON Studio |
| `dashboard-design-lab` | Comparaison | V0.1 | Synthèse des quatre surfaces |

## Règles communes candidates

1. Afficher en permanence le projet, la surface et la version.
2. Utiliser le thème sombre par défaut, avec bascule clair/sombre mémorisée localement.
3. Présenter les informations selon la séquence : contexte → KPI → pilotage → détail.
4. Rendre les grandes sections repliables et conserver des résumés utiles lorsqu'elles sont fermées.
5. Utiliser les mêmes états : vert = conforme, ambre = vigilance, rouge = critique, violet = gate HUMAN, neutre = information.
6. Donner à chaque carte un signal, une valeur ou un état, un contexte court et une action principale.
7. Regrouper recherche, filtres, tri et modes d'affichage dans une barre de commandes identifiable.
8. Conserver un responsive compact : cartes empilées, table ou chronologie défilante, libellés d'actions raccourcis.
9. Fournir un focus clavier visible et respecter `prefers-reduced-motion`.
10. Charger un snapshot local ; aucune lecture de données distante n'est nécessaire pendant la navigation courante.

## Spécificités à préserver

- Cockpit : priorité, signal, progression, prochaine action et coordination des agents.
- Post-it : matrice d'Eisenhower, filtres d'échéance, modes tableau/cartes/focus et configuration locale.
- Roadmap : sept phases, progression, gates HUMAN et lots prioritaires.
- Gantt : temporalité, zoom, jalons, dépendances et risques de glissement.

## Statut

`CANDIDATE` — comparaison et validation HUMAN requises avant généralisation à toutes les surfaces nLab.
