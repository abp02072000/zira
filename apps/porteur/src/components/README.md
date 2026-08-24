# Dossier Composants (`/apps/porteur/src/components`)

Ce répertoire contient l'ensemble des sous-composants modulaires dédiés aux différentes pages et fonctionnalités du portail Porteur.

## Organisation modulaire

- **`auth/`** : Formulaires de connexion, d'inscription et authentification Google.
- **`dashboard/`** : En-tête, cartes de KPI et liste des projets récents.
- **`portefeuille/`** : Solde, graphique de répartition, liste des transactions et modal de dépôt/retrait.
- **`profil/`** : Couverture, compétences, parcours professionnel/académique et boîte d'édition.
- **`projets/`** : En-tête avec bouton de création et listing filtré des projets.
- **`projet-detail/`** : En-tête détaillé, métriques, Cap table, liste des investisseurs et modal d'édition.
- **`projet-nouveau/`** : Assistant de création de projet découpé en 5 étapes distinctes.

## Principes d'architecture

- **Haute cohésion & Faible couplage** : Chaque composant résout un rôle précis.
- **Règle des 100 lignes** : Tous les fichiers sont maintenus sous le seuil des 100 lignes.
- **Typage & Réutilisabilité** : Interfaces TypeScript et composants UI partagés (`@zira/ui`).
