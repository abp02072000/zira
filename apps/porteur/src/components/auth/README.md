# Composants d'authentification (`/apps/porteur/src/components/auth`)

Ce dossier regroupe les formulaires et blocs UI de l'interface de connexion/inscription pour les porteurs de projets.

## Fichiers

- **`auth-header.tsx`** : En-tête visuel avec le logo et la baseline.
- **`login-form.tsx`** : Formulaire de saisie d'identifiants de connexion.
- **`register-form.tsx`** : Formulaire de création de compte projet/entreprise.
- **`social-auth.tsx`** : Bouton SSO Google et séparateur contextuel.

## Règles Clean Code

- Tous les formulaires sont modulaires et découplés de la gestion globale de l'état.
- Aucun fichier ne dépasse 100 lignes.
