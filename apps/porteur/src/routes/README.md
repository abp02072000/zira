# Module Routes (`/apps/porteur/src/routes`)

Ce dossier gère l'architecture de navigation et le routage déclaratif de l'application Porteur de Projet.

## Structure des fichiers

- **`index.tsx`** : Définit le composant `AppRouter` qui cartographie les routes Wouter vers les composants de pages avec suspension et fallback de chargement.
- **`protected-route.tsx`** : Composant de haut niveau encapsulant l'authentification (`AuthGuard`) et la mise en page (`PorteurLayout`).

## Bonnes pratiques respectées

- **DRY (Don't Repeat Yourself)** : Réduction du boilerplate grâce au composant `ProtectedRoute`.
- **Règles de taille** : Tous les fichiers sont maintenus sous la limite de 100 lignes de code.
- **Séparation des responsabilités** : Le routage est dissocié de la déclaration des contextes racine.
