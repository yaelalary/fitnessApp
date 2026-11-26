# Carnet muscu

Carnet d'entraînement pour la salle : exercices, parcours, séances et progression, sur téléphone, à plusieurs profils.

**Application en ligne : https://yaelalary.github.io/fitnessApp/**

Sur téléphone, ajoute la page à l'écran d'accueil pour l'ouvrir comme une application.

## Fonctionnalités

- **Exercices** : échauffement, musculation, cardio ou étirement. Pour chacun : marque (Technogym, Hammer Strength, poids libres), machine, muscles travaillés (plusieurs possibles, du grand dorsal aux deltoïdes postérieurs) et objectif par défaut (séries, répétitions, charge, récupération, ou durée pour le cardio).
- **Photos des machines** : la machine se choisit dans une galerie de photos, avec recherche et filtres par marque et par gamme ; la marque se remplit toute seule. La photo officielle de la machine choisie s'affiche ensuite sur l'exercice. Tu peux la remplacer par ta propre photo ou par un lien.
- **Parcours** : ta séance type, avec les exercices dans l'ordre et un objectif pour chacun.
- **Séances** : démarrées depuis un parcours ou en séance libre. Les charges de la dernière fois sont déjà remplies, un minuteur gère la récupération et tu coches chaque série faite, ou toutes d'un coup avec « Tout cocher » si tu remplis la séance après coup. Le cardio et l'échauffement se découpent en paliers (durée, et au choix : vitesse, pente, cadence, niveau). Les paliers par défaut se règlent dans la fiche de l'exercice ; chaque séance reprend ensuite ceux de la précédente. Une séance pas encore enregistrée reste sur le téléphone, même sans réseau.
- **Statistiques** : séances par semaine, et par exercice : charge max, 1RM estimé, poids soulevé (répétitions × charge, additionnées) et répétitions (durée, distance et vitesse pour le cardio).
- **Outils** (clé à molette en haut de l'écran) : minuteur de **gourde** pour la water station. Touche « Gourde remplie » : l'app décompte le délai choisi (20 minutes par défaut), l'affiche en haut de chaque écran, puis te prévient quand tu peux remplir à nouveau. Le minuteur est propre à chaque téléphone.
- **Notifications** : à activer dans **Outils**. Elles arrivent tant que l'app reste ouverte en arrière-plan, écran verrouillé compris ; si le téléphone l'a fermée, l'alerte s'affiche à la réouverture. Sur iPhone, il faut d'abord ajouter l'app à l'écran d'accueil.
- **Profils** : une personne par profil, avec ses propres données. Le sélecteur en haut de l'écran passe de l'un à l'autre.

## Partager les données entre plusieurs téléphones

Les données sont enregistrées dans un **gist** : un petit dépôt de fichiers privé à ton compte GitHub. Il n'y a ni base de données ni autre service. Sans gist, les données restent dans le navigateur du téléphone.

### 1. Créer un jeton GitHub

Sur https://github.com/settings/tokens/new, crée un jeton **classic** avec **uniquement** le droit `gist`. Copie-le tout de suite : GitHub ne l'affiche qu'une fois.

### 2. Sur le premier téléphone

1. Ouvre l'app et crée ton profil.
2. Touche l'engrenage en haut à droite, puis va dans **Sauvegarde GitHub Gist**.
3. Colle le jeton, laisse **Identifiant du gist** vide et touche **Créer un gist**.
4. L'app affiche le lien du gist : la suite de lettres et de chiffres à la fin est l'**identifiant du gist**.
5. Crée les profils des autres personnes dans **Réglages → Profils**.

### 3. Sur les autres téléphones

1. Ouvre l'app, touche l'engrenage, puis va dans **Sauvegarde GitHub Gist**.
2. Colle **le même jeton** et **le même identifiant de gist**, puis touche **Connecter**.
3. Choisis ton profil en haut de l'écran.

Seul le propriétaire d'un gist peut le modifier : un jeton créé depuis un autre compte GitHub permettrait de lire les données, pas de les enregistrer. Pour pouvoir couper l'accès d'un téléphone sans toucher aux autres, crée depuis ton compte un jeton par téléphone, chacun limité au droit `gist`.

Chaque profil a son propre fichier dans le gist : deux personnes peuvent enregistrer en même temps sans écraser les données de l'autre.

### Sécurité

- **Le jeton** est stocké uniquement dans le navigateur du téléphone, jamais dans le dépôt. Limite-le au droit `gist`.
- **Le gist « secret »** n'est pas listé publiquement, mais toute personne qui connaît son identifiant peut le lire, sans pouvoir le modifier.

## Développement

Prérequis : Node.js 22.

```sh
npm install
npm run dev      # serveur local
npm test         # tests de la logique métier
npm run build    # vérification des types et build de production dans dist/
npm run catalog  # régénère le catalogue des machines depuis les sites des fabricants
```

Stack : Vue 3, TypeScript, Vite, Pinia, Vue Router, Chart.js et Vitest.

### Organisation du code

| Dossier | Contenu |
|---|---|
| `src/domain/` | Logique métier en fonctions pures, sans Vue, testée : séances, statistiques, validation, catalogue des machines, format des fichiers du gist |
| `src/services/` | Accès extérieurs : API GitHub Gist, stockage du navigateur, compression des photos |
| `src/stores/` | État partagé (Pinia), mis à jour seulement après confirmation de l'enregistrement |
| `src/composables/` | Logique réutilisable des écrans : édition de séance, minuteur, actions asynchrones |
| `src/components/` | Composants d'interface, rangés par thème (`ui/` pour les éléments génériques) |
| `src/views/` | Un écran par route |
| `src/styles/` | Design system : tokens (couleurs, espacements, typographie) en thème clair et sombre, styles globaux |

Les règles propres à chaque type d'exercice (champs, mesures statistiques, valeurs par défaut) sont décrites en données dans `src/domain/categories.ts`.

### Catalogue des machines

`npm run catalog` lit les catalogues officiels et écrit `src/domain/machineCatalog.generated.ts` :

- **Hammer Strength** : toutes les pages produit « strength training » du sitemap de lifefitness.com dont la marque déclarée est Hammer Strength ;
- **Technogym** : les machines de musculation et de cardio du sitemap de technogym.com, hors produits réservés à la maison.

Chaque machine garde son nom officiel, sa gamme et sa photo principale ; les photos injoignables sont écartées. Les noms utilisés par d'anciennes versions de l'app sont rattachés aux noms officiels dans `src/domain/machineCatalog.ts`. Un test vérifie qu'ils correspondent toujours à une machine du catalogue.

Pour itérer sans retélécharger les quelque 650 pages, définis `CATALOG_CACHE_DIR` vers un dossier de cache.

## Déploiement

Chaque push sur `master` lance `.github/workflows/deploy.yml` : tests, build puis publication sur GitHub Pages. Dans **Settings → Pages**, la source doit être **GitHub Actions**.

L'app utilise des adresses avec `#` (`…/fitnessApp/#/exercices`) : GitHub Pages ne sert que des fichiers et renverrait une erreur 404 en rechargeant une adresse sans `#`.

### Gist par défaut (facultatif)

Pour ne saisir que le jeton sur chaque téléphone, l'identifiant du gist peut être fourni au build :

- **en local** : copie `.env.example` en `.env` et renseigne `VITE_GIST_ID`. Le fichier `.env` est ignoré par git ;
- **en production** : ajoute un secret `GIST_ID` dans **Settings → Secrets and variables → Actions**.

L'identifiant n'apparaît alors pas dans le dépôt, mais il figure dans le JavaScript publié : toute personne qui ouvre l'app peut le retrouver et lire le gist.

## Format des données

Le gist contient :

- `carnet-muscu.md` : description du gist ;
- `profile-<id>.json` : un fichier par profil, avec ses exercices, parcours et séances ;
- `image-<id>.txt` : une photo prise avec le téléphone, compressée en JPEG.

## Crédits

Les photos des machines appartiennent à leurs fabricants : [Technogym](https://www.technogym.com) et [Hammer Strength / Life Fitness](https://www.lifefitness.com). L'app les affiche par lien depuis leurs sites, sans les copier dans le dépôt.
