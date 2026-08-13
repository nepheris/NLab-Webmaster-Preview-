# nLab Configuration Lab — architecture du POC

## Ce qui fonctionne sans serveur

- brouillon automatique dans `localStorage` ;
- modèles nommés enregistrés dans le navigateur ;
- export et import du JSON complet ;
- ordre, pliage et verrouillage des sections et sous-sections ;
- portée d'action locale ou « tous les éléments identiques » ;
- état, position et dimensions de la fenêtre flottante ;
- aucune requête réseau automatique lors d'un changement d'interface.

Les écritures locales sont temporisées pour le redimensionnement. Elles ne déclenchent ni reconstruction de l'inventaire, ni appel GitHub.

## Test dans le dépôt public

La cible est `User-Config-Sandbox/theme-layout-config-poc/`, hors de `Preview-Web-Sandbox/`. Elle n'est donc pas affichée dans la galerie du Webmaster Preview, mais reste publiquement accessible dans le dépôt.

Le navigateur prépare un lot JSON. L'écriture est ensuite exécutée par un agent ou un service authentifié. C'est volontaire : placer un Personal Access Token dans la page, l'URL ou `localStorage` exposerait le secret.

## Étape privée

L'enregistrement dans un dépôt privé exige une GitHub App ou un flux OAuth :

1. authentification de l'utilisateur ;
2. permission minimale `Contents: write` sur le dépôt de configuration ;
3. validation du schéma côté serveur ;
4. commit atomique dans un chemin borné ;
5. retour d'un reçu contenant le commit et la date ;
6. aucune clé longue durée envoyée au navigateur.

Le schéma `nlab.webmaster-layout-config/0.1` est identique dans les trois modes afin de permettre la migration sans convertir les thèmes.
