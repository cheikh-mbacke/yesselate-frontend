# 🗄️ Configuration Base de Données

## Installation et initialisation

### 1. Installer les dépendances Prisma

```bash
npm install @prisma/client
npm install -D prisma tsx
```

### 2. Ajouter les scripts au package.json

Ajoutez ces scripts à votre `package.json` :

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

### 3. Générer le client Prisma

```bash
npm run db:generate
```

### 4. Créer la base de données

```bash
npm run db:push
```

Cette commande va :
- Créer le fichier `prisma/bmo.db` (SQLite)
- Créer les tables `Demand` et `DemandEvent`
- Créer les index

### 5. Peupler la base avec des données de test

```bash
npm run db:seed
```

Cette commande va créer 8 demandes de test avec leurs événements.

---

## 📊 Visualiser les données (optionnel)

Pour visualiser et modifier les données via une interface graphique :

```bash
npm run db:studio
```

Ouvre Prisma Studio sur http://localhost:5555

---

## 🔌 API Routes créées

### GET /api/demands
Liste toutes les demandes avec filtres optionnels :
- `?bureau=ADM` - Filtrer par bureau
- `?status=pending` - Filtrer par statut
- `?priority=urgent` - Filtrer par priorité
- `?search=REQ-2024` - Recherche texte

### POST /api/demands
Créer une nouvelle demande

Body :
```json
{
  "id": "REQ-2024-009",
  "subject": "Nouvelle demande",
  "bureau": "ADM",
  "type": "Équipement",
  "amount": "1 000 000",
  "priority": "normal"
}
```

### GET /api/demands/[id]
Récupérer une demande spécifique avec ses événements

### PATCH /api/demands/[id]
Mettre à jour une demande

Body :
```json
{
  "status": "validated",
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "comment": "Approuvé"
}
```

### POST /api/demands/[id]/validate
Valider une demande

Body :
```json
{
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "comment": "Demande approuvée"
}
```

### POST /api/demands/[id]/reject
Rejeter une demande

Body :
```json
{
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "reason": "Budget insuffisant"
}
```

### DELETE /api/demands/[id]
Supprimer une demande

---

## 🔄 Migrations

### Créer une migration

Après avoir modifié le `schema.prisma` :

```bash
npm run db:migrate
```

Cela va :
1. Créer un fichier de migration dans `prisma/migrations/`
2. Appliquer la migration à la DB
3. Régénérer le client Prisma

---

## 📁 Structure des fichiers

```
project/
├── prisma/
│   ├── schema.prisma       # Schéma de la DB
│   └── bmo.db             # Base SQLite (créée automatiquement)
├── src/lib/
│   └── prisma.ts          # Client Prisma singleton
├── app/api/demands/
│   ├── route.ts           # GET, POST
│   └── [id]/
│       ├── route.ts       # GET, PATCH, DELETE
│       ├── validate/
│       │   └── route.ts   # POST validate
│       └── reject/
│           └── route.ts   # POST reject
└── scripts/
    └── seed.ts            # Script de peuplement
```

---

## ⚡ Étapes suivantes

1. Mettre à jour `useDemandsAPI` pour utiliser les vraies API routes
2. Remplacer `import { demands } from '@/lib/data'` par des appels fetch
3. Gérer le cache et les mutations optimistes avec React Query ou SWR (optionnel)

---

## 🐛 Dépannage

### Erreur : "Can't reach database server"
→ La DB n'existe pas encore. Exécutez `npm run db:push`

### Erreur : "@prisma/client not generated"
→ Exécutez `npm run db:generate`

### Réinitialiser la DB
```bash
rm prisma/bmo.db
npm run db:push
npm run db:seed
```

---

## 🎯 Prochaines étapes d'amélioration

1. **Authentification** : Ajouter NextAuth.js pour identifier les acteurs
2. **Validation** : Ajouter Zod pour valider les payloads API
3. **Cache** : Implémenter React Query pour le cache côté client
4. **Pagination** : Ajouter la pagination pour les grandes listes
5. **Upload** : Gérer les pièces jointes (fichiers)
6. **Notifications** : Websockets pour les mises à jour temps réel
7. **Audit complet** : Logger toutes les actions dans une table dédiée

