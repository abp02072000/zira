# ZIRA Invest — Documentation Technique & Architecture

## 1. Vue d'ensemble du Projet

**ZIRA Invest** est une plateforme d'Equity Crowdfunding et d'investissement en capital dédiée à la République Démocratique du Congo (RDC Kinshasa) et à l'Afrique subsaharienne.

Le monorepo est structuré de manière modulaire en packages partagés, applications React SPA isolées par univers métier, une application d'accueil/blog et un backend microservice en Go.

---

## 2. Architecture du Monorepo

```text
zira-monorepo/
├── apps/
│   ├── porteur/           # SPA React pour les porteurs de projets (dépôt, levée de fonds, gestion)
│   ├── investisseur/      # SPA React pour les investisseurs (exploration, souscription, portefeuille)
│   ├── moderateur/        # SPA React pour la conformité (audit KYC, validation des projets)
│   └── landing/           # Site vitrine et Blog (découverte, articles, SEO)
│
├── packages/
│   ├── shared/            # Types TypeScript, Store local, API Client, Contextes (Auth, AppData), i18n
│   └── ui/                # Composants UI réutilisables (Shadcn UI, Radix UI, Tailwind CSS, AppShell)
│
├── backend/               # Microservice Go
│   ├── cmd/server/        # Point d'entrée du serveur HTTP Fiber
│   ├── internal/
│   │   ├── application/   # Services applicatifs métier (Member, KYC, Project, User, Document)
│   │   ├── config/        # Chargement des variables d'environnement
│   │   ├── domain/        # Entités, agrégats, règles et erreurs du domaine
│   │   ├── infrastructure/# Persistance Postgres, Authentification Clerk, Stockage R2, Emails Resend
│   │   └── interfaces/    # Routes HTTP, Handlers, Middlewares et Réponses JSON
│   ├── Dockerfile         # Image de production Docker
│   └── render.yaml        # Descripteur d'infrastructure pour Render
│
├── wrangler.toml          # Configuration de déploiement Cloudflare Pages & R2
├── pnpm-workspace.yaml    # Définition des sous-projets du monorepo
└── package.json           # Scripts globaux et dépendances racines
```

---

## 3. Architecture Backend Go

Le backend est développé en **Go** en suivant les principes de **Clean Architecture** et **Domain-Driven Design (DDD)**.

### Composants Clés :
- **Framework Web :** [Fiber v2/v3](https://docs.gofiber.io/) pour des performances optimales et une faible empreinte mémoire.
- **Authentification :** [Clerk JWT](https://clerk.com/docs) avec vérification cryptographique JWKS (`clerk_verifier.go`).
- **Base de Données :** **PostgreSQL** hébergé sur **Neon** avec mode SSL obligatoire (`sslmode=require`).
- **Stockage Objets :** **Cloudflare R2** (compatible S3) pour les pièces d'identité KYC, logos, posters et médias du blog.
- **Notifications Emails :** [Resend API](https://resend.com/docs/introduction) pour l'envoi automatisé d'emails transactionnels (validation/refus KYC, confirmation d'investissement, changements de statut).

---

## 4. Configuration des Services Cloud & Déploiement

### A. Base de Données — Neon PostgreSQL
- **Projet Neon :** `zira-invest-db`
- **Region :** AWS US-East / EU-Central
- **Chaine de connexion :**
  `postgresql://neondb_owner:npg_5KCas3dyPeFr@ep-fancy-math-aw56kb0q-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require`

### B. Backend Microservice — Render
- **Fichier de configuration :** `backend/render.yaml` & `backend/Dockerfile`
- **Commande de build :** `cd backend && go build -o bin/server ./cmd/server`
- **Commande de démarrage :** `cd backend && ./bin/server`
- **Variables d'environnement requises :**
  - `PORT`: `8080`
  - `APP_ENV`: `production`
  - `DB_HOST`: `ep-fancy-math-aw56kb0q-pooler.c-12.us-east-1.aws.neon.tech`
  - `DB_USER`: `neondb_owner`
  - `DB_PASSWORD`: `npg_5KCas3dyPeFr`
  - `DB_NAME`: `neondb`
  - `DB_SSLMODE`: `require`
  - `CLOUDFLARE_R2_BUCKET_NAME`: `zira-invest-assets-rdc`
  - `CLOUDFLARE_R2_PUBLIC_DOMAIN`: `https://assets.zira-invest.cd`
  - `RESEND_FROM_EMAIL`: `notifications@zira-invest.cd`

### C. Frontend & Site Web — Cloudflare Pages / Workers
- **Fichier de configuration :** `wrangler.toml`
- **Stockage d'assets & Blog :** Cloudflare R2 bucket `zira-invest-assets-rdc`
- **Commande de build frontend :** `pnpm run build`

---

## 5. Guide de Développement Local

### Prérequis :
- **Node.js** v20+ & **pnpm** v10+
- **Go** 1.22+

### Installation :
```bash
pnpm install
```

### Lancement des Applications :
```bash
# Lancer le serveur de développement frontend
pnpm dev

# Lancer le backend Go
cd backend && go run ./cmd/server/main.go
```

### Exécution des Tests et Validation :
```bash
# Tests unitaires du backend Go
cd backend && go test ./...

# Vérification TypeScript de toutes les applications
pnpm exec tsc -p apps/porteur/tsconfig.json --noEmit
pnpm exec tsc -p apps/investisseur/tsconfig.json --noEmit
pnpm exec tsc -p apps/moderateur/tsconfig.json --noEmit
pnpm exec tsc -p apps/landing/tsconfig.json --noEmit

# Build de production
pnpm run build
```
