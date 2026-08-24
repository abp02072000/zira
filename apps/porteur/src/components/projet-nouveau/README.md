# Tunnel de création de projet (`/apps/porteur/src/components/projet-nouveau`)

Ce dossier organise les étapes du formulaire guidé (wizard) permettant aux porteurs de formaliser et publier une levée de fonds.

## Structure des étapes

- **`types.ts`** : Interfaces TypeScript, presets de bannières/logos et constantes de conversion.
- **`step-indicator.tsx`** : Barre de progression horizontale indiquant l'étape active.
- **`step-info.tsx`** : Étape 1 - Identité, pitch, positionnement géographique et supports multimédias.
- **`step-team.tsx`** : Étape 2 - Membres fondateurs et compétences clés.
- **`step-equity.tsx`** : Étape 3 - Table de capitalisation et répartition des parts.
- **`step-funding.tsx`** : Étape 4 - Objectifs de financement, tickets d'entrée et valorisation pré/post-money.
- **`step-review.tsx`** : Étape 5 - Récapitulatif global, statut de démarrage et validation finale.

## Normes de développement

- Respect strict de la limite de 100 lignes par fichier.
- Isolation granulaire de la logique et des composants d'étape.
- Validation modulaire basée sur Zod (@zira/shared).
