# 🔐 Variables d'Environnement

Ce document liste toutes les variables d'environnement utilisées dans le projet.

---

## 📋 Configuration

### API Backend

```env
# URL de base de l'API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# URL WebSocket (notifications temps réel)
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

---

## 🎛️ Feature Flags

Toutes les fonctionnalités sont **activées par défaut** (`true`). Définissez à `false` pour désactiver.

```env
# Notifications
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Workflows
NEXT_PUBLIC_ENABLE_WORKFLOWS=true

# Analytics & Graphiques
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Alertes intelligentes
NEXT_PUBLIC_ENABLE_ALERTS=true

# Commentaires
NEXT_PUBLIC_ENABLE_COMMENTS=true

# Export (Excel/PDF/CSV)
NEXT_PUBLIC_ENABLE_EXPORT=true

# Gestion documents
NEXT_PUBLIC_ENABLE_DOCUMENTS=true

# Audit trail
NEXT_PUBLIC_ENABLE_AUDIT=true

# Recherche globale
NEXT_PUBLIC_ENABLE_SEARCH=true
```

---

## 📤 Upload de Fichiers

```env
# Taille maximale des fichiers (bytes)
# 10485760 = 10 MB
NEXT_PUBLIC_UPLOAD_MAX_SIZE=10485760

# Nombre maximum de fichiers simultanés
NEXT_PUBLIC_UPLOAD_MAX_FILES=5
```

---

## 🔑 Authentification (NextAuth.js)

```env
# URL de l'application
NEXTAUTH_URL=http://localhost:3000

# Secret pour les tokens (générer avec: openssl rand -base64 32)
NEXTAUTH_SECRET=votre-secret-tres-securise-ici

# Domaine d'authentification (optionnel)
NEXT_PUBLIC_AUTH_DOMAIN=auth.yesselate.com
```

---

## 🗄️ Base de Données (Prisma)

### Production (PostgreSQL)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/yesselate?schema=public"
```

### Développement (SQLite)

```env
DATABASE_URL="file:./dev.db"
```

---

## 📧 Services Externes (Optionnel)

### Email

```env
# Provider: Resend, SendGrid, etc.
EMAIL_FROM=noreply@yesselate.com
RESEND_API_KEY=re_xxxxx
```

### Stockage (S3, Cloudinary, etc.)

```env
# AWS S3
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
AWS_BUCKET_NAME=yesselate-documents
```

---

## 📊 Monitoring & Analytics (Optionnel)

### Sentry (Error Tracking)

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Google Analytics

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 🌍 Environnement

```env
# development | production | test
NODE_ENV=development

# Activer les logs
NEXT_PUBLIC_ENABLE_LOGS=true

# Activer les données mock
NEXT_PUBLIC_ENABLE_MOCKS=true
```

---

## 🔒 Sécurité

### CORS

```env
# Origins autorisés (séparés par des virgules)
CORS_ORIGINS=https://app.yesselate.com,https://admin.yesselate.com
```

### Rate Limiting

```env
# Nombre de requêtes par fenêtre
RATE_LIMIT_REQUESTS=100

# Durée de la fenêtre (ms)
RATE_LIMIT_WINDOW=60000
```

---

## ⚡ Performance

```env
# Timeout des requêtes API (ms)
NEXT_PUBLIC_REQUEST_TIMEOUT=30000

# Nombre de tentatives en cas d'échec
NEXT_PUBLIC_RETRY_ATTEMPTS=3

# Délai entre les tentatives (ms)
NEXT_PUBLIC_RETRY_DELAY=1000
```

---

## 💾 Cache (Optionnel)

```env
# Redis
REDIS_URL=redis://localhost:6379

# Durée de vie du cache (secondes)
CACHE_TTL=300
```

---

## 🔗 Webhooks (Optionnel)

```env
# Secret pour vérifier les webhooks
WEBHOOK_SECRET=votre-secret-webhook
```

---

## 📝 Comment Utiliser

### 1. Développement

```bash
# Copier le template
cp .env.example .env.local

# Éditer avec vos valeurs
nano .env.local
```

### 2. Production

```bash
# Configurer dans votre plateforme (Vercel, Netlify, etc.)
# Ou créer .env.production
nano .env.production
```

### 3. Exemple Complet (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Features (toutes activées)
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_WORKFLOWS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ALERTS=true
NEXT_PUBLIC_ENABLE_COMMENTS=true

# Database
DATABASE_URL="file:./dev.db"

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-key-here

# Env
NODE_ENV=development
NEXT_PUBLIC_ENABLE_LOGS=true
NEXT_PUBLIC_ENABLE_MOCKS=true
```

---

## ⚠️ Sécurité

### ❌ À NE JAMAIS FAIRE

- Committer des fichiers `.env` avec des secrets réels
- Partager les secrets via email/chat
- Utiliser les mêmes secrets en dev et prod
- Exposer les clés API publiquement

### ✅ Bonnes Pratiques

- Utiliser des secrets forts (32+ caractères)
- Régénérer les secrets régulièrement
- Utiliser un gestionnaire de secrets (Vault, AWS Secrets Manager)
- Activer HTTPS en production
- Configurer les CORS appropriés
- Monitorer les accès

---

## 🔧 Génération de Secrets

### OpenSSL

```bash
openssl rand -base64 32
```

### Node.js

```javascript
require('crypto').randomBytes(32).toString('base64')
```

### En ligne

- [RandomKeygen](https://randomkeygen.com/)
- [Password Generator](https://passwordsgenerator.net/)

---

## 📚 Documentation

- **Next.js Env Vars**: https://nextjs.org/docs/basic-features/environment-variables
- **NextAuth Config**: https://next-auth.js.org/configuration/options
- **Prisma Database**: https://www.prisma.io/docs/reference/database-reference/connection-urls

---

**Version 2.0.0 - 10 Janvier 2026**

