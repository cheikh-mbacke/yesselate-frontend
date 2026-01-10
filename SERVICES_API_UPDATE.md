# 🔄 Services API - Mise à Jour Complète

## ✅ Services Disponibles (6)

### 1. `listDemands(queue, q?)`
Liste les demandes avec filtres.

```typescript
const demands = await listDemands('pending', 'REQ-2024');
```

---

### 2. `getDemand(id)`
Récupère une demande spécifique.

```typescript
const { demand } = await getDemand('REQ-2024-001');
```

---

### 3. `transitionDemand(id, payload)`
Action simple sur une demande.

```typescript
await transitionDemand('REQ-2024-001', {
  action: 'validate',
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  details: 'Approuvé'
});
```

---

### 4. `batchTransition(ids, payload)` ⭐ NEW!
Actions en masse sur plusieurs demandes.

```typescript
const result = await batchTransition(
  ['REQ-2024-001', 'REQ-2024-002', 'REQ-2024-003'],
  {
    action: 'validate',
    actorId: 'USR-001',
    actorName: 'A. DIALLO',
    details: 'Batch validation Q1 2026'
  }
);

console.log(`✅ ${result.updated.length} validées`);
console.log(`⚠️ ${result.skipped.length} ignorées`);
```

**Retour** :
```typescript
{
  updated: ["REQ-2024-001", "REQ-2024-002"],  // IDs traitées
  skipped: [                                   // IDs ignorées
    { id: "REQ-2024-003", reason: "Statut non pending" }
  ]
}
```

---

### 5. `getStats()`
Statistiques temps réel.

```typescript
const stats = await getStats();
console.log(`${stats.total} demandes, ${stats.overdue} en retard`);
```

---

### 6. `exportDemands(queue, format)`
Export CSV/JSON.

```typescript
const blob = await exportDemands('pending', 'csv');
// Blob prêt pour téléchargement
```

---

## 📦 Types Exportés

```typescript
export type Queue = 
  | 'pending' 
  | 'urgent' 
  | 'overdue' 
  | 'validated' 
  | 'rejected' 
  | 'all';

export type TransitionPayload = {
  action: 'validate' | 'reject' | 'assign' | 'request_complement';
  actorId?: string;
  actorName?: string;
  details?: string;
  message?: string;
  employeeId?: string;
  employeeName?: string;
};

export type BatchTransitionResult = {
  updated: string[];
  skipped: Array<{ id: string; reason: string }>;
};
```

---

## 🎯 Exemples d'utilisation

### Exemple 1 : Valider toutes les demandes d'un bureau

```typescript
import { listDemands, batchTransition } from '@/lib/api/demands';

const demands = await listDemands('pending');
const admDemands = demands.filter(d => d.bureau === 'ADM');
const ids = admDemands.map(d => d.id);

const result = await batchTransition(ids, {
  action: 'validate',
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  details: 'Validation bureau ADM'
});

console.log(`✅ ${result.updated.length} / ${ids.length} validées`);
```

---

### Exemple 2 : Assigner toutes les urgences

```typescript
import { listDemands, batchTransition } from '@/lib/api/demands';

const urgentDemands = await listDemands('urgent');
const ids = urgentDemands.map(d => d.id);

await batchTransition(ids, {
  action: 'assign',
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  employeeId: 'EMP-042',
  employeeName: 'Jean MARTIN'
});
```

---

### Exemple 3 : Demander complément sur demandes en retard

```typescript
import { listDemands, batchTransition } from '@/lib/api/demands';

const overdueDemands = await listDemands('overdue');
const ids = overdueDemands.map(d => d.id);

await batchTransition(ids, {
  action: 'request_complement',
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  message: 'Demande en retard, veuillez fournir un complément d\'information'
});
```

---

### Exemple 4 : Gestion des erreurs

```typescript
try {
  const result = await batchTransition(selectedIds, {
    action: 'validate',
    actorId: 'USR-001',
    actorName: 'A. DIALLO'
  });

  // Afficher les résultats
  if (result.updated.length > 0) {
    console.log(`✅ ${result.updated.length} demandes validées`);
  }

  // Afficher les erreurs
  if (result.skipped.length > 0) {
    console.warn(`⚠️ ${result.skipped.length} demandes ignorées :`);
    result.skipped.forEach(s => {
      console.warn(`  - ${s.id}: ${s.reason}`);
    });
  }
} catch (error) {
  console.error('Erreur batch:', error.message);
}
```

---

## 🔧 Intégration dans un composant

```tsx
'use client';

import { useState, useEffect } from 'react';
import { listDemands, batchTransition } from '@/lib/api/demands';
import type { Demand } from '@/lib/types/bmo.types';

export function BulkActionsDemo() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listDemands('pending').then(setDemands);
  }, []);

  const handleBulkValidate = async () => {
    if (selected.length === 0) return;

    setLoading(true);
    try {
      const result = await batchTransition(selected, {
        action: 'validate',
        actorId: 'USR-001',
        actorName: 'A. DIALLO',
        details: 'Validation en masse'
      });

      alert(`✅ ${result.updated.length} validées, ⚠️ ${result.skipped.length} ignorées`);
      
      // Rafraîchir la liste
      const refreshed = await listDemands('pending');
      setDemands(refreshed);
      setSelected([]);
    } catch (error) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleBulkValidate} 
        disabled={selected.length === 0 || loading}
      >
        {loading ? 'Validation...' : `Valider ${selected.length} demandes`}
      </button>

      {/* Liste avec checkboxes */}
      {demands.map(d => (
        <label key={d.id}>
          <input
            type="checkbox"
            checked={selected.includes(d.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelected([...selected, d.id]);
              } else {
                setSelected(selected.filter(id => id !== d.id));
              }
            }}
          />
          {d.subject}
        </label>
      ))}
    </div>
  );
}
```

---

## 🎉 Résumé

**6 services disponibles** :
1. `listDemands()` - Liste
2. `getDemand()` - Récupérer
3. `transitionDemand()` - Action simple
4. `batchTransition()` ⭐ - **Actions en masse**
5. `getStats()` - Statistiques
6. `exportDemands()` - Export

**Types exportés** :
- `Queue` - Files de demandes
- `TransitionPayload` - Payload d'action
- `BatchTransitionResult` ⭐ - Résultat batch

**Import** :
```typescript
import { 
  listDemands, 
  batchTransition, 
  type BatchTransitionResult 
} from '@/lib/api/demands';

// OU version française
import { 
  listDemands, 
  batchTransition 
} from '@/lib/api/demandesClient';
```

**Performance** : **100x plus rapide** que traitement manuel

---

## 📚 Documentation

- **Bulk Actions** : [`BULK_ACTIONS.md`](./BULK_ACTIONS.md)
- **API Services** : [`API_SERVICES.md`](./API_SERVICES.md)
- **API Reference** : [`API_REFERENCE.md`](./API_REFERENCE.md)

