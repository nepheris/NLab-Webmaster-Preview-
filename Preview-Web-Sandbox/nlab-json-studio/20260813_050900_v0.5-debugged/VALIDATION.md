# Validation smoke-test — nLab JSON Studio v0.5-debugged

Date: 2026-08-13

## Banc de test

Validation automatisée exécutée avec Chromium headless piloté directement via Chrome DevTools Protocol (`remote-debugging-port` + target `page`). Le HTML autonome est injecté dans la page avec `Page.setDocumentContent`, ce qui évite les limitations de connexion localhost rencontrées précédemment dans la sandbox.

## Résultats principaux

Scénario principal :

- chargement initial : OK ;
- 8 JSON de démonstration préchargés : OK ;
- RAW / mode différentiel : OK ;
- surlignage de lignes : OK ;
- hiérarchie JSON : OK ;
- tout replier / tout déplier : OK ;
- table sur `$.data.phases[*]` : 10 lignes, OK ;
- synthèse projet : 6 KPI et 10 phases, OK ;
- Gantt : rendu phases/tâches et légende, OK ;
- Gantt tout replier : niveau phases uniquement, OK ;
- tâches : rendu et options, OK ;
- agents : 4 cartes et historiques, OK ;
- bascule vers un JSON non Project Master : vues spécifiques correctement signalées indisponibles ;
- changement RAW puis Appliquer : OK ;
- thème sombre : OK ;
- paramètres couleurs : OK ;
- ajout/suppression de nœud : OK ;
- tri table : OK ;
- filtre table : OK ;
- filtres Gantt : OK ;
- zoom temporel Gantt : OK ;
- filtre ordinal Tâches : OK.

Résultat console Chromium : **0 exception runtime / 0 erreur console** sur le scénario principal.

## Corrections racines vérifiées

- restauration de `renderRaw()` ;
- restauration des helpers `parseNumericSpec`, coloration et surlignage ;
- Diff remplacé par un algorithme borné à lookahead limité pour éviter la matrice quadratique sur les gros JSON ;
- options Tâches câblées ;
- repli Gantt ramené au niveau 0 (phases uniquement) ;
- menus d'affichage et paramètres vérifiés.

## Performance POC

Sur le dataset principal, 5 appels successifs à `renderAll()` prennent environ 540 ms dans Chromium headless. C'est acceptable pour le POC, mais indique un futur chantier d'optimisation : ne rendre que l'onglet actif et invalider les vues dépendantes au lieu de recalculer toutes les vues à chaque interaction.

## Limites restantes

- pas encore de moteur de jointure ;
- Diff ligne-à-ligne, non AST-aware ;
- docking toujours volontairement léger ;
- tests d'enregistrement fichier dépendants des permissions navigateur et non entièrement automatisables en headless ;
- test visuel humain toujours utile pour les détails d'ergonomie et de mise en page.
