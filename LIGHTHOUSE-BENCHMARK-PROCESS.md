# Processus nLab — Lighthouse et benchmark Web

Statut : `ACTIVE — POC V2.1`  
Date : 2026-08-13

## Objectif

Intégrer Lighthouse à la validation des previews sans ajouter de requête automatique au runtime. Le benchmark sert à détecter les régressions de performance, d'accessibilité, de bonnes pratiques et de SEO avant promotion.

## Déclenchement

1. Déployer la preview et vérifier sa version visible et son commit.
2. Depuis la barre d'outils de nLab Webmaster Preview, lancer l'audit **Mobile**.
3. Relancer le même profil au moins trois fois et conserver la médiane.
4. Refaire le protocole en **Bureau**.
5. Enregistrer les résultats dans le dossier de la preview ou dans son rapport de validation.

L'URL auditée doit être l'URL publique de la preview. Une URL `github.com/<owner>/<repo>/tree/<branch>` mesure l'interface GitHub et n'est pas un benchmark du projet.

## Données minimales du rapport

- projet, preview et version visible ;
- URL publique testée ;
- commit/SHA ;
- date et heure Europe/Paris ;
- profil Mobile ou Bureau ;
- nombre d'exécutions et méthode d'agrégation ;
- scores Performance, Accessibilité, Bonnes pratiques et SEO ;
- résultat Navigation agentique, traité comme signal expérimental sans score classique ;
- FCP, LCP, Speed Index, TBT et CLS ;
- nombre de requêtes et poids transféré ;
- ressources bloquant le rendu, JavaScript/CSS inutilisé et tâches longues ;
- écarts par rapport à la baseline et décision HUMAN.

## Seuils initiaux

Pendant la phase POC, les seuils sont des alertes et non des gates automatiques :

- score de catégorie inférieur à 90 : revue demandée ;
- LCP laboratoire supérieur à 2,5 s : revue demandée ;
- CLS supérieur à 0,1 : revue demandée ;
- nouvelle ressource bloquant le rendu, nouvelle requête API automatique ou hausse inexpliquée du poids : revue demandée ;
- échec Accessibilité, Bonnes pratiques ou SEO nouvellement introduit : correction ou justification traçable.

La catégorie Navigation agentique est expérimentale. Ses résultats servent à examiner l'arbre d'accessibilité, la stabilité, la découvrabilité et WebMCP, mais ne sont pas bloquants pendant le POC.

INP est une métrique terrain. Pour les audits de laboratoire, TBT est suivi comme signal de blocage du thread principal sans être présenté comme un remplacement exact d'INP.

## Automatisation candidate

Lighthouse CI pourra ensuite :

- exécuter plusieurs audits et sélectionner une médiane ;
- publier le rapport comme artefact de CI ;
- comparer une branche avec sa référence ;
- appliquer des budgets de taille et de nombre de ressources ;
- commencer en mode `warn`, puis passer certains contrôles en `error` après stabilisation de la baseline.

L'automatisation ne doit jamais être déclenchée par l'ouverture de la preview. Elle appartient au pipeline CI et doit rester bornée aux événements de livraison retenus.

## Sources de référence

- https://developer.chrome.com/docs/lighthouse/overview
- https://developer.chrome.com/docs/lighthouse/performance/performance-scoring
- https://github.com/GoogleChrome/lighthouse-ci
- https://web.dev/articles/lighthouse-ci
- https://web.dev/articles/defining-core-web-vitals-thresholds
