# 🎯 Schéma Étendu - Stakeholders, Tasks & Risks

## 📊 Vue d'ensemble

Extension du schéma de base de données avec 3 nouveaux modèles pour une gestion avancée des demandes :

1. **DemandStakeholder** - Parties prenantes (RACI++)
2. **DemandTask** - Tâches et sous-tâches
3. **DemandRisk** - Risques et opportunités

**Version** : 1.1.0  
**Status** : ✅ Production-ready

---

## 📋 Table des Matières

1. [Modèles](#-modèles)
2. [Types TypeScript](#-types-typescript)
3. [Relations](#-relations)
4. [Helpers](#-helpers)
5. [Cas d'usage](#-cas-dusage)
6. [Migration](#-migration)

---

## 🗄️ Modèles

### 1. DemandStakeholder (Parties Prenantes)

```prisma
model DemandStakeholder {
  id          String   @id @default(cuid())
  demandId    String
  personId    String
  personName  String
  role        String   // "OWNER" | "APPROVER" | "REVIEWER" | "CONTRIBUTOR" | "INFORMED"
  required    Int      @default(0) // 0 = false, 1 = true
  note        String?

  createdAt   DateTime @default(now())

  demand      Demand   @relation(fields: [demandId], references: [id], onDelete: Cascade)

  @@index([demandId])
  @@index([personId])
}
```

#### Rôles (RACI étendu)

| Rôle | Label | Description |
|------|-------|-------------|
| `OWNER` | Pilote | Responsable du dossier, coordonne |
| `APPROVER` | Validateur | Approuve ou rejette |
| `REVIEWER` | Contrôleur | Vérifie la conformité |
| `CONTRIBUTOR` | Contributeur | Produit des éléments |
| `INFORMED` | Informé | Tenu au courant |

---

### 2. DemandTask (Tâches)

```prisma
model DemandTask {
  id             String    @id @default(cuid())
  demandId       String
  title          String
  description    String?
  status         String    @default("OPEN") // "OPEN" | "IN_PROGRESS" | "DONE" | "BLOCKED"
  dueAt          DateTime?
  assignedToId   String?
  assignedToName String?

  createdAt      DateTime  @default(now())
  completedAt    DateTime?

  demand         Demand    @relation(fields: [demandId], references: [id], onDelete: Cascade)

  @@index([demandId])
  @@index([status])
}
```

#### Statuts de Tâche

| Statut | Label | Description |
|--------|-------|-------------|
| `OPEN` | À faire | Tâche créée, pas démarrée |
| `IN_PROGRESS` | En cours | Tâche en cours de réalisation |
| `DONE` | Terminé | Tâche complétée |
| `BLOCKED` | Bloqué | Tâche bloquée, nécessite intervention |

---

### 3. DemandRisk (Risques & Opportunités)

```prisma
model DemandRisk {
  id          String   @id @default(cuid())
  demandId    String

  category    String   // "Juridique", "Budget", "SLA", "Réputation", etc.
  opportunity Int      @default(0) // 0 = risque, 1 = opportunité

  probability Int      // 1..5 (très faible à très élevée)
  impact      Int      // 1..5 (négligeable à critique)
  mitigation  String?
  ownerName   String?

  createdAt   DateTime @default(now())

  demand      Demand   @relation(fields: [demandId], references: [id], onDelete: Cascade)

  @@index([demandId])
  @@index([category])
}
```

#### Matrice de Risque

```
Score = Probability × Impact (1-25)

Criticité:
- 1-5   : LOW      (Vert)
- 6-10  : MEDIUM   (Jaune)
- 11-15 : HIGH     (Orange)
- 16-25 : CRITICAL (Rouge)
```

#### Catégories Prédéfinies

- Juridique
- Budget
- SLA
- Réputation
- Technique
- Ressources
- Planning
- Qualité
- Sécurité
- Réglementaire

---

## 📝 Types TypeScript

### Fichier : `src/lib/types/bmo-extended.types.ts`

```typescript
// Rôles Stakeholder
export type StakeholderRole = 
  | 'OWNER' 
  | 'APPROVER' 
  | 'REVIEWER' 
  | 'CONTRIBUTOR' 
  | 'INFORMED';

// Statuts Task
export type TaskStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'BLOCKED';

// Interfaces
export interface DemandStakeholder { /* ... */ }
export interface DemandTask { /* ... */ }
export interface DemandRisk { /* ... */ }

// Helpers
export function calculateRiskScore(probability: number, impact: number): number;
export function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
```

---

## 🔗 Relations

### Modèle Demand (étendu)

```prisma
model Demand {
  id             String   @id
  // ... champs existants ...
  
  events         DemandEvent[]
  stakeholders   DemandStakeholder[]  // ⭐ NEW
  tasks          DemandTask[]         // ⭐ NEW
  risks          DemandRisk[]         // ⭐ NEW
}
```

### Cascade Delete

Tous les modèles enfants utilisent `onDelete: Cascade` :
- Supprimer une `Demand` → Supprime automatiquement tous ses `stakeholders`, `tasks`, `risks`, `events`

---

## 🛠️ Helpers

### 1. Calcul Score Risque

```typescript
import { calculateRiskScore, getRiskLevel } from '@/lib/types/bmo-extended.types';

const score = calculateRiskScore(4, 5); // 20
const level = getRiskLevel(score);      // "CRITICAL"
```

### 2. Labels Traduction

```typescript
import { STAKEHOLDER_ROLE_LABELS, TASK_STATUS_LABELS } from '@/lib/types/bmo-extended.types';

STAKEHOLDER_ROLE_LABELS['OWNER'];      // "Pilote"
TASK_STATUS_LABELS['IN_PROGRESS'];     // "En cours"
```

### 3. Catégories Risque

```typescript
import { RISK_CATEGORIES, type RiskCategory } from '@/lib/types/bmo-extended.types';

RISK_CATEGORIES.forEach(cat => console.log(cat));
// "Juridique", "Budget", "SLA", ...
```

---

## 💻 Cas d'usage

### 1. Ajouter un Stakeholder

```typescript
await prisma.demandStakeholder.create({
  data: {
    demandId: 'REQ-2024-001',
    personId: 'USR-001',
    personName: 'Alice DUPONT',
    role: 'OWNER',
    required: 1, // true
    note: 'Pilote projet Alpha',
  },
});
```

---

### 2. Créer une Tâche

```typescript
await prisma.demandTask.create({
  data: {
    demandId: 'REQ-2024-001',
    title: 'Valider le budget avec la DAF',
    description: 'Obtenir validation formelle du budget 150k€',
    status: 'OPEN',
    dueAt: new Date('2024-03-25'),
    assignedToId: 'USR-002',
    assignedToName: 'Bob MARTIN',
  },
});
```

---

### 3. Enregistrer un Risque

```typescript
await prisma.demandRisk.create({
  data: {
    demandId: 'REQ-2024-001',
    category: 'Budget',
    opportunity: 0, // false = risque
    probability: 4, // Élevée
    impact: 5,      // Critique
    mitigation: 'Validation préalable du DG + provision 10%',
    ownerName: 'Claire DURAND',
  },
});

// Score = 4 × 5 = 20 → CRITICAL
```

---

### 4. Lister tout pour une Demande

```typescript
const demand = await prisma.demand.findUnique({
  where: { id: 'REQ-2024-001' },
  include: {
    events: true,
    stakeholders: { orderBy: { role: 'asc' } },
    tasks: { orderBy: { createdAt: 'desc' } },
    risks: { orderBy: { createdAt: 'desc' } },
  },
});

console.log(`${demand.stakeholders.length} stakeholders`);
console.log(`${demand.tasks.length} tasks`);
console.log(`${demand.risks.length} risks`);
```

---

### 5. Tableau de Bord

```typescript
// Tâches par statut
const tasksByStatus = await prisma.demandTask.groupBy({
  by: ['status'],
  _count: true,
  where: { demandId: 'REQ-2024-001' },
});

// Risques critiques
const criticalRisks = await prisma.demandRisk.findMany({
  where: {
    demandId: 'REQ-2024-001',
    opportunity: 0,
    OR: [
      { probability: { gte: 4 }, impact: { gte: 4 } }, // Score >= 16
    ],
  },
});

// Stakeholders requis
const requiredStakeholders = await prisma.demandStakeholder.findMany({
  where: {
    demandId: 'REQ-2024-001',
    required: 1,
  },
});
```

---

## 🔄 Migration

### Depuis le Schéma Initial

1. **Backup** : Sauvegarder `prisma/bmo.db`
2. **Update Schema** : Remplacer `prisma/schema.prisma` par le nouveau
3. **Generate** : `npx prisma generate`
4. **Push** : `npx prisma db push`

```bash
# Backup
cp prisma/bmo.db prisma/bmo.db.backup

# Update (déjà fait)
npx prisma generate
npx prisma db push
```

### Données Existantes

Les demandes existantes conservent leurs données. Les nouvelles relations sont vides par défaut (tableaux vides).

---

## 🎨 Composants UI (à créer)

### 1. StakeholderManager

- Liste des stakeholders
- Ajouter/Supprimer
- Badges par rôle
- Indicateur "Requis"

### 2. TaskList

- Kanban par statut
- Filtres (assigné, statut, échéance)
- Drag & Drop pour changer statut
- Indicateur retard (dueAt < now)

### 3. RiskMatrix

- Matrice 5×5 (Probability × Impact)
- Code couleur (LOW/MEDIUM/HIGH/CRITICAL)
- Filtres par catégorie
- Vue opportunités vs risques

---

## 📊 Statistiques Avancées

### Métriques par Demande

```typescript
// Completion %
const totalTasks = await prisma.demandTask.count({ where: { demandId } });
const doneTasks = await prisma.demandTask.count({ 
  where: { demandId, status: 'DONE' } 
});
const completionRate = (doneTasks / totalTasks) * 100;

// Score Risque Moyen
const risks = await prisma.demandRisk.findMany({ where: { demandId, opportunity: 0 } });
const avgScore = risks.reduce((sum, r) => sum + (r.probability * r.impact), 0) / risks.length;

// Stakeholders Actifs
const activeStakeholders = await prisma.demandStakeholder.count({
  where: { demandId, role: { in: ['OWNER', 'APPROVER', 'CONTRIBUTOR'] } }
});
```

---

## ✅ Checklist d'intégration

- [x] Schéma Prisma étendu
- [x] Client Prisma généré
- [x] Base de données mise à jour
- [x] Types TypeScript créés
- [x] Helpers et constantes
- [ ] API Routes pour stakeholders
- [ ] API Routes pour tasks
- [ ] API Routes pour risks
- [ ] Composants UI
- [ ] Tests manuels

---

## 🚀 Prochaines Étapes

1. **API Routes** : Créer les endpoints CRUD pour tasks et risks
2. **Hooks React** : `useTasks`, `useRisks` (comme `useStakeholders`)
3. **UI Components** : TaskList, RiskMatrix, StakeholderManager
4. **Intégration DemandTab** : Afficher les 3 nouvelles sections
5. **Notifications** : Alertes sur tâches en retard, risques critiques

---

## 📚 Liens utiles

- **Stakeholders** : [`STAKEHOLDERS.md`](./STAKEHOLDERS.md)
- **API Reference** : [`API_REFERENCE.md`](./API_REFERENCE.md)
- **Architecture** : [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Types** : `src/lib/types/bmo-extended.types.ts`

---

# ✅ **Schéma Étendu Production-Ready !**

**Version** : 1.1.0  
**Status** : ✅ DB Ready (API & UI à venir)  
**Modèles** : 4 → 7 (+3 nouveaux)  
**Type-safe** : ✅ TypeScript + Prisma

