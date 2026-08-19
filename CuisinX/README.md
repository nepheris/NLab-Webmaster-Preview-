# 🍽️ nLab CuisinX

Prototype personnel de base culinaire technique, recettes reproductibles et outils de calcul.

## Accès rapide

- 🌐 Site / preview : https://nepheris.github.io/nLab-Webmaster-Preview/CuisinX/
- 📦 Repo de publication : https://github.com/nepheris/nLab-Webmaster-Preview/tree/main/CuisinX
- 🧪 Projet de référence Recettes du Cœur (P002) : https://github.com/nepheris/nLab/tree/main/Work/PRJ_Project/P002-recettes-du-coeur
- 💬 Discussion de travail CuisinX : **à renseigner avec l’URL de cette conversation**
- 🔗 Référence « projet d’ISTAF » : **à préciser / renseigner**

## Statut

**Phase : cadrage des recettes, du modèle de données et des moteurs de calcul.**

Le template final n’est volontairement pas figé avant validation d’un échantillon représentatif de recettes et de fiches techniques.

## Architecture cible

```text
CuisinX/
├── README.md
├── index.html                  # point d’entrée publié
├── production/                 # build statique publié
├── src/                        # moteur / renderer / logique applicative
├── content/                    # contenus Markdown
│   ├── recipes/                # recettes
│   ├── techniques/             # tours de main / fiches techniques
│   ├── ingredients/            # fiches éditoriales ingrédients
│   └── equipment/              # inventaire matériel
├── data/                       # sources et référentiels structurés
│   ├── recipes/
│   ├── ingredients/
│   │   ├── ciqual/             # références / index vers Ciqual
│   │   └── products/           # produits commerciaux / marché hors Ciqual
│   ├── nutrition/
│   ├── densities/
│   ├── techniques/
│   ├── equipment/
│   └── schemas/
├── assets/
│   ├── products/               # photos emballages / étiquettes
│   ├── recipes/                # galerie des réalisations
│   └── placeholders/
├── engines/                    # moteurs de calcul réutilisables
│   ├── nutrition/
│   ├── density-conversion/
│   ├── recipe-scaling/
│   ├── sorbet/
│   └── search/
└── docs/                       # méthodologie / conventions / sources
```

## Principes de données

- Unité canonique de formulation et de calcul : **gramme (g)**.
- Les liquides peuvent être affichés en mL, mais leur masse en g est calculée et conservée avec la **densité utilisée** et sa température de référence.
- Les ingrédients génériques sont reliés au référentiel **Ciqual** par identifiant.
- Les produits non Ciqual disposent d’une fiche locale : marque, nom, fournisseur si connu, EAN/référence, liste d’ingrédients, valeurs nutritionnelles, photos source.
- Les valeurs nutritionnelles des recettes sont calculées dynamiquement à partir des masses réellement utilisées.
- Les recettes sont rédigées en Markdown structuré et complétées par des données JSON.
- Les recettes peuvent avoir plusieurs versions, une version canonique et un historique d’itérations reliées par ID.
- Les variantes sœurs (ex. crème 30 % / crème 35 %) sont liées sans écraser la recette source.
- Chaque réalisation peut posséder une galerie de photos et des notes d’essai.

## Modules fonctionnels cibles

1. Recherche globale du site.
2. Recherche recettes par mots-clés, ingrédients et filtres.
3. Vues recettes : cartes, liste, tableau.
4. Fiches techniques / astuces : œufs, gélatine, agar-agar, chocolat, cristallisation, températures critiques, etc.
5. Inventaire du matériel disponible.
6. Moteurs de calcul : nutrition, conversion volume↔masse, redimensionnement, sorbets / sucre / miel, etc.
7. Historique de versions et itérations de recettes.

## Références de travail

Le projet réutilisera autant que possible les briques, référentiels et conventions déjà validés dans **Les Recettes du Cœur / P002**, sans dupliquer inutilement les données ou moteurs.

## Prochaine étape

Valider plusieurs recettes et procédés représentatifs avant de figer :

- le schéma JSON canonique ;
- le front matter Markdown ;
- le renderer ;
- les composants d’affichage ;
- les moteurs de calcul.
