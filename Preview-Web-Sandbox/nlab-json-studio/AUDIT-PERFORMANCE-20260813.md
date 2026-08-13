# Audit performance — nLab JSON Studio + Webmaster Preview

Date: 2026-08-13
Version auditée: v0.7-performance-audit

## Priorité

La performance et la stabilité du navigateur sont bloquantes pour la validation fonctionnelle. Elles deviennent un critère de qualité de premier rang, au même niveau que la correction fonctionnelle.

## Causes identifiées dans JSON Studio

1. Les vues générées restaient montées dans le DOM après navigation.
2. RAW générait une surcouche de coloration complète et plusieurs gouttières de numéros, même pour les zones masquées.
3. Le Diff était recalculé à chaque frappe.
4. La coloration RAW et l'autosize pouvaient être recalculés à chaque frappe.
5. La hiérarchie construisait les descendants d'un nœud même lorsque la branche était repliée.
6. Les tables n'avaient pas de plafond de rendu pour des datasets très volumineux.
7. Le Gantt recalculait plusieurs fois la même liste de tâches pendant un rendu.
8. Il manquait des métriques runtime intégrées pour objectiver les régressions.

## Corrections appliquées dans JSON Studio

- rendu de l'onglet actif uniquement;
- rendu planifié par requestAnimationFrame et coalescé;
- démontage des contenus lourds quand une vue est quittée;
- hiérarchie réellement lazy: les enfants ne sont créés que pour les branches ouvertes;
- Diff live debouncé (180 ms) et plafonné;
- coloration RAW debouncée;
- mode RAW plain automatique au-delà d'un seuil de taille;
- une seule gouttière RAW créée dans le mode simple, deux seulement en mode Diff;
- numéros de lignes non enveloppés individuellement sauf lignes surlignées;
- table plafonnée à 1000 lignes rendues simultanément;
- réutilisation de la liste de tâches dans le Gantt;
- instrumentation `window.__NLAB_PERF.snapshot()`.

## Mesures sandbox Chromium/CDP

### Avant durcissement complet

- DOM initial: ~5318 éléments
- après navigation sur plusieurs vues: ~6392 éléments
- hiérarchie tout dépliée: ~11322 éléments
- RAW initial: ~22.9 ms
- Agents: ~10 ms

### Après durcissement

- DOM initial: 224 éléments
- Hiérarchie repliée: 276 éléments
- Table: 253 éléments
- Synthèse: 300 éléments
- Roadmap: 352 éléments
- Gantt: 437 éléments
- Tâches: 486 éléments
- Agents: 545 éléments
- retour RAW: 231 éléments

Temps de rendu observés sur le jeu de démo:
- RAW: ~0.7 à 2.4 ms
- Hiérarchie: ~1.6 ms
- Table: ~1.7 ms
- Synthèse: ~0.9 ms
- Roadmap: ~0.7 ms
- Gantt: ~1.3 ms
- Tâches: ~0.8 ms
- Agents: ~6.8 ms

Le mode « Tout déplier » de la hiérarchie reste volontairement coûteux: il peut monter à plusieurs milliers d'éléments DOM. Il doit rester une action explicite, jamais un état par défaut.

## Audit réseau du Webmaster Preview

Le JSON Studio autonome ne contient aucun appel `fetch()` ni `XMLHttpRequest`: ses charges sont principalement CPU / DOM / mémoire.

Le Webmaster Preview avait en revanche deux comportements coûteux:

1. son helper GitHub utilisait `cache: 'no-store'`;
2. `load()` rescannait systématiquement tout `Preview-Web-Sandbox` à chaque chargement, même lorsqu'un inventaire local était déjà disponible.

Un scan complet effectue une lecture de la racine puis, pour chaque projet, une lecture récursive de l'arbre et une lecture de `project.json`. Le coût API augmente donc avec le nombre de projets.

## Garde réseau appliqué au Webmaster Preview

Le code historique du viewer est conservé dans `assets/preview-browser-core.js`. `assets/preview-browser.js` est maintenant un garde réseau placé devant ce core.

Règles appliquées:

- cache local des réponses GitHub REST pendant 5 minutes;
- réponse locale immédiate pendant la durée du TTL;
- après expiration: requêtes conditionnelles avec `If-None-Match` / ETag et `If-Modified-Since` lorsque disponibles;
- maximum 2 requêtes GitHub simultanées;
- suppression effective du `no-store` forcé par le core via le garde;
- détection et journalisation des réponses 403/429 et des en-têtes de rate limit;
- le bouton `Actualiser` force temporairement la revalidation réseau;
- aucun appel GitHub API n'est nécessaire pour un simple changement de vue du viewer.

## Budgets proposés

Pour le POC et les prochaines previews:

- DOM normal après interaction: cible < 800 éléments; alerte > 800; blocage de validation > 1400 hors vue explicitement développée.
- rendu d'une interaction courante: cible < 50 ms; alerte > 100 ms; blocage > 200 ms.
- aucune reconstruction de vues invisibles.
- aucune opération O(n²) sur frappe/clavier.
- Diff, recherche et coloration: debounce/throttle obligatoire si le coût dépend de la taille du document.
- listes/tableaux: plafonnement, pagination ou virtualisation dès que le nombre de lignes peut dépasser quelques centaines.
- aucune requête réseau déclenchée par un simple changement d'onglet local.
- pas de polling sans besoin explicite; préférer cache et invalidation.
- API GitHub: TTL/cache + ETag pour les ressources relues, concurrence bornée, respect des rate limits.
- mesure mémoire répétée après 20 changements de vues pour détecter les fuites.

## Validation requise avant promotion

1. Smoke test automatisé sans exception runtime.
2. Navigation rapide sur tous les onglets.
3. Changement répété de JSON.
4. Mesure DOM avant/après navigation.
5. Mesure temps de rendu par vue.
6. Test RAW: frappe rapide + Diff.
7. Test Hiérarchie: repliée puis tout déplier.
8. Test gros tableau/dataset.
9. Vérification absence de croissance mémoire monotone.
10. Contrôle du nombre de requêtes GitHub au premier chargement, au second chargement dans le TTL et après clic sur Actualiser.
11. Revue humaine dans Webmaster Preview.
