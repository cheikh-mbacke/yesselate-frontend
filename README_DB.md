# 🎯 Yesselate Frontend - Système de Base de Données

> **Architecture moderne avec Prisma, Next.js API Routes et React Hooks**

---

## 🚀 Démarrage Rapide (5 minutes)

```bash
# 1. Installer Prisma
npm install @prisma/client
npm install -D prisma tsx

# 2. Initialiser la base de données
npx prisma generate
npx prisma db push

# 3. Peupler avec des données de test
npx tsx scripts/seed.ts

# 4. Démarrer le serveur
npm run dev
```

✅ **C'est tout !** Votre base de données est prête avec 8 demandes de test.

📖 **Guide détaillé** : [`INSTALLATION.md`](./INSTALLATION.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| 📝 **[INSTALLATION.md](./INSTALLATION.md)** | Guide d'installation rapide (5 min) |
| 🗄️ **[SETUP_DB.md](./SETUP_DB.md)** | Configuration DB complète + troubleshooting |
| 🔌 **[API_REFERENCE.md](./API_REFERENCE.md)** | Référence API REST complète |
| ⭐ **[API_ACTIONS.md](./API_ACTIONS.md)** | Endpoint actions unifié (validate, reject, assign...) |
| 🔄 **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** | Migrer vers la nouvelle API |
| 📋 **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** | Vue d'ensemble de l'architecture |
| 📁 **[FILES_CREATED.md](./FILES_CREATED.md)** | Liste complète des fichiers créés |

---

## 🎨 Fonctionnalités

### ✅ Base de données
- **Prisma ORM** avec SQLite (dev) / PostgreSQL (prod)
- **Schéma complet** : Demand + DemandEvent
- **Traçabilité** : Chaque action est enregistrée
- **Index optimisés** pour les performances
- **Type-safe** : Types TypeScript auto-générés

### ✅ API REST moderne
- **6 endpoints** CRUD complets
- ⭐ **Endpoint unifié `/actions`** pour toutes les actions métier
- **Filtres avancés** : queue, recherche, limite
- **Validation** : Règles métier centralisées
- **Documentation** : Référence complète

### ✅ Interface React
- **2 hooks** : `useDemandsDB` (CRUD) + `useDemandActions` (actions métier)
- **Mode sombre** par défaut avec toggle
- **Boutons métier** fonctionnels (pas décoratifs !)
- **Modals interactifs** : Stats, Export, Details
- **Design Fluent** Windows 11-like

---

## 🔌 API Endpoints

### CRUD de base

```http
GET    /api/demands              # Liste (filtres: queue, q, limit)
POST   /api/demands              # Créer
GET    /api/demands/[id]         # Récupérer + historique
PATCH  /api/demands/[id]         # Mettre à jour
DELETE /api/demands/[id]         # Supprimer
```

### ⭐ Actions métier unifiées

```http
POST /api/demands/[id]/actions
```

**Actions disponibles** :
- ✅ `validate` - Valider une demande
- ❌ `reject` - Rejeter une demande
- 👤 `assign` - Assigner à un employé
- 💬 `request_complement` - Demander un complément

📖 **Documentation complète** : [`API_ACTIONS.md`](./API_ACTIONS.md)

---

## 🪝 Hooks React

### `useDemandsDB` - CRUD

```tsx
import { useDemandsDB } from '@/hooks';

const { fetchDemands, createDemand, updateDemand, deleteDemand } = useDemandsDB();

// Récupérer les demandes urgentes
const demands = await fetchDemands({ queue: 'urgent', limit: 20 });
```

### `useDemandActions` - Actions métier

```tsx
import { useDemandActions } from '@/hooks';

const { validate, reject, assign, requestComplement } = useDemandActions();

// Valider une demande
await validate('REQ-2024-001', 'USR-001', 'A. DIALLO', 'Approuvé');

// Assigner à un employé
await assign('REQ-2024-001', 'USR-001', 'A. DIALLO', 'EMP-042', 'Jean MARTIN');
```

---

## 📊 Schéma de la base de données

```prisma
model Demand {
  id          String       // "REQ-2024-001"
  subject     String       // Objet de la demande
  bureau      String       // Code bureau
  type        String       // Type de demande
  amount      String?      // Montant
  priority    Priority     // urgent, high, normal, low
  status      DemandStatus // pending, validated, rejected
  
  requestedAt DateTime
  createdAt   DateTime
  updatedAt   DateTime
  
  events      DemandEvent[]
}

model DemandEvent {
  id        String   // Auto-généré
  demandId  String   // FK
  at        DateTime
  actorId   String   // Qui a fait l'action
  actorName String
  action    String   // validate, reject, assign...
  details   String?  // Commentaire/raison
}
```

---

## 🎯 Architecture

```
┌─────────────────────────────────────┐
│  REACT COMPONENTS                   │
│  - InboxTab, DemandTab, etc.       │
└──────────────┬──────────────────────┘
               │
               │ Hooks
               ▼
┌─────────────────────────────────────┐
│  REACT HOOKS                        │
│  - useDemandsDB (CRUD)             │
│  - useDemandActions (Actions)      │
└──────────────┬──────────────────────┘
               │
               │ fetch()
               ▼
┌─────────────────────────────────────┐
│  NEXT.JS API ROUTES                 │
│  - GET /api/demands                │
│  - POST /api/demands/[id]/actions  │
└──────────────┬──────────────────────┘
               │
               │ prisma.*
               ▼
┌─────────────────────────────────────┐
│  PRISMA CLIENT                      │
│  - Type-safe queries               │
│  - Automatic relations             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  SQLITE DATABASE                    │
│  - prisma/bmo.db                   │
│  - Demand + DemandEvent tables     │
└─────────────────────────────────────┘
```

---

## 🎨 Interface Utilisateur

### Mode sombre par défaut

- **Fond très sombre** (`#0F0F11`) pour réduire la fatigue oculaire
- **Textes très lisibles** (`#FAFAFA`) pour un contraste optimal
- **Bouton toggle 🌙/☀️** avec persistance

### Boutons métier fonctionnels

| Bouton | Action |
|--------|--------|
| 📥 À traiter | Ouvre la file pending |
| 🔥 Urgentes | Ouvre la file urgent |
| ⏱️ En retard | Ouvre la file overdue |
| 📊 Stats Live | Modal KPIs temps réel |
| ✅ Validées | Ouvre la file validated |
| 📤 Export | Modal export PDF |

**Tous les boutons ont un impact métier réel !**

---

## 🚦 Statut du projet

| Composant | Statut | Prochaine étape |
|-----------|--------|-----------------|
| 🗄️ Base de données | ✅ Prête | Ajouter PostgreSQL (prod) |
| 🔌 API Routes | ✅ Complète | Ajouter authentification |
| 🪝 Hooks React | ✅ Fonctionnels | Ajouter React Query (cache) |
| 🎨 Interface | ✅ Moderne | Migrer composants existants |
| 📚 Documentation | ✅ Exhaustive | Ajouter vidéos tutoriels |

---

## 📦 Fichiers créés

**24 fichiers** au total :

- 🗄️ **3 fichiers** base de données
- 🔌 **5 fichiers** API routes
- 🪝 **3 fichiers** hooks React
- 🎨 **6 fichiers** UI components
- 📚 **7 fichiers** documentation

📁 **Liste complète** : [`FILES_CREATED.md`](./FILES_CREATED.md)

---

## 🔄 Migration

Si vous avez du code existant utilisant les anciennes routes :

```tsx
// ❌ Ancien
const { validateDemand } = useDemandsAPI();

// ✅ Nouveau
const { validate } = useDemandActions();
```

📖 **Guide complet** : [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md)

---

## 🎓 Exemples d'utilisation

### Récupérer les demandes urgentes

```tsx
const { fetchDemands } = useDemandsDB();
const demands = await fetchDemands({ queue: 'urgent', limit: 10 });
```

### Valider une demande

```tsx
const { validate } = useDemandActions();
await validate('REQ-2024-001', 'USR-001', 'A. DIALLO', 'Approuvé');
```

### Assigner une demande

```tsx
const { assign } = useDemandActions();
await assign('REQ-2024-001', 'USR-001', 'A. DIALLO', 'EMP-042', 'Jean MARTIN');
```

---

## 🛠️ Développement

### Commandes utiles

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les changements à la DB
npm run db:push

# Ouvrir Prisma Studio (GUI)
npm run db:studio

# Repeupler la DB
npx tsx scripts/seed.ts

# Linter
npm run lint
```

### Réinitialiser la DB

```bash
rm prisma/bmo.db
npm run db:push
npx tsx scripts/seed.ts
```

---

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"

```bash
npm install @prisma/client
npm run db:generate
```

### "Database file not found"

```bash
npm run db:push
```

### "No migrations found"

Normal avec SQLite + `db:push`. Utilisez `db:migrate` seulement pour production.

📖 **Troubleshooting complet** : [`SETUP_DB.md`](./SETUP_DB.md)

---

## 🎯 Prochaines étapes

### Court terme (cette semaine)

- [ ] Installer et tester la DB
- [ ] Migrer `InboxTab` vers `useDemandsDB`
- [ ] Migrer `DemandTab` vers `useDemandActions`
- [ ] Tester les workflows complets

### Moyen terme (ce mois)

- [ ] Ajouter NextAuth.js (authentification)
- [ ] Créer formulaire de création de demande
- [ ] Dashboard avec charts (Recharts)
- [ ] Notifications temps réel (WebSockets)

### Long terme (trimestre)

- [ ] Migrer vers PostgreSQL (production)
- [ ] Upload de pièces jointes (S3)
- [ ] Notifications email (Resend)
- [ ] Version mobile (PWA)

---

## 🤝 Support

- 📖 **Documentation** : Consultez les fichiers `.md` dans ce dossier
- 💬 **Questions** : Ouvrez une issue sur GitHub
- 🐛 **Bugs** : Signalez dans `SETUP_DB.md` → Troubleshooting

---

## 📄 Licence

Propriétaire - Yesselate Platform

---

**Prêt à démarrer ? Suivez [`INSTALLATION.md`](./INSTALLATION.md) ! 🚀**

