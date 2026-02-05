# 📦 Guide d'Installation des Dépendances

## Dépendances Nécessaires

### 1. Dépendances de Production

```bash
# Validation de données
npm install zod

# Date manipulation (si pas déjà installé)
npm install date-fns

# Redis (pour cache en production - optionnel)
npm install ioredis
```

### 2. Dépendances de Développement

```bash
# Testing
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom

# Coverage
npm install --save-dev @vitest/coverage-v8
```

## Scripts Package.json

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

## Variables d'Environnement

Créer/modifier `.env` :

```env
# Database (existant)
DATABASE_URL="postgresql://user:password@localhost:5432/yesselate"

# Redis (nouveau - optionnel en dev)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Features Flags
DISABLE_RATE_LIMIT=false
ENABLE_CACHE=true
ENABLE_WEBHOOKS=true
ENABLE_MONITORING=true

# Webhook Configuration
WEBHOOK_TIMEOUT=10000
WEBHOOK_MAX_RETRIES=3

# Cache Configuration
CACHE_DEFAULT_TTL=300
CACHE_MAX_KEYS=10000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Installation Complète

```bash
# 1. Installer toutes les dépendances
npm install

# 2. Générer client Prisma
npx prisma generate

# 3. Lancer migrations (si nouvelles tables)
npx prisma migrate dev

# 4. Vérifier tests
npm run test

# 5. Build pour vérifier
npm run build
```

## Vérification de l'Installation

```bash
# Tests passent ?
npm run test

# Linter OK ?
npm run lint

# Build OK ?
npm run build

# Dev server OK ?
npm run dev
```

## Optionnel: Redis en Local (Docker)

```bash
# Démarrer Redis avec Docker
docker run -d \
  --name yesselate-redis \
  -p 6379:6379 \
  redis:7-alpine

# Vérifier connexion
docker exec -it yesselate-redis redis-cli ping
# → PONG
```

## Mise à Jour des Dépendances Existantes

```bash
# Vérifier versions
npm outdated

# Mettre à jour (si nécessaire)
npm update

# Audit sécurité
npm audit
npm audit fix
```

---

**Installation terminée ! 🎉**
