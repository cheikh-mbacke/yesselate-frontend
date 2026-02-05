# ⚡ Actions en Masse (Bulk Actions) - Guide Complet

## 🎯 Vue d'ensemble

**Actions en masse** pour traiter plusieurs demandes simultanément avec **atomicité garantie** (transaction Prisma).

**Endpoint** : `POST /api/demands/bulk`

**Cas d'usage** :
- ✅ Valider 50 demandes d'un coup
- ✅ Rejeter toutes les demandes d'un bureau
- ✅ Assigner toutes les demandes urgentes à un employé
- ✅ Demander des compléments sur plusieurs demandes

---

## 🔌 API

### Endpoint

```
POST /api/demands/bulk
```

### Request Body

```json
{
  "ids": ["REQ-2024-001", "REQ-2024-002", "REQ-2024-003"],
  "action": "validate",
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "details": "Batch validation Q1 2026"
}
```

### Paramètres

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `ids` | `string[]` | ✅ | Liste des IDs de demandes |
| `action` | `'validate' \| 'reject' \| 'assign' \| 'request_complement'` | ✅ | Action à effectuer |
| `actorId` | `string` | ❌ | ID de l'acteur (défaut: 'USR-001') |
| `actorName` | `string` | ❌ | Nom de l'acteur (défaut: 'A. DIALLO') |
| `details` | `string` | ❌ | Commentaire pour validate/reject |
| `employeeId` | `string` | ✅* | ID employé (requis pour assign) |
| `employeeName` | `string` | ✅* | Nom employé (requis pour assign) |
| `message` | `string` | ✅* | Message (requis pour request_complement) |

---

### Response

```json
{
  "updated": ["REQ-2024-001", "REQ-2024-002"],
  "skipped": [
    {
      "id": "REQ-2024-003",
      "reason": "Statut non pending"
    }
  ]
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `updated` | `string[]` | IDs des demandes traitées avec succès |
| `skipped` | `Array<{id, reason}>` | IDs ignorés avec raison |

---

## 📝 Actions Disponibles

### 1. Valider en masse (`validate`)

```bash
curl -X POST http://localhost:3000/api/demands/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["REQ-2024-001", "REQ-2024-002"],
    "action": "validate",
    "actorId": "USR-001",
    "actorName": "A. DIALLO",
    "details": "Batch validation OK"
  }'
```

**Règle métier** : Seules les demandes `pending` peuvent être validées

---

### 2. Rejeter en masse (`reject`)

```bash
curl -X POST http://localhost:3000/api/demands/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["REQ-2024-005", "REQ-2024-006"],
    "action": "reject",
    "actorId": "USR-001",
    "actorName": "A. DIALLO",
    "details": "Budget insuffisant pour ces projets"
  }'
```

**Règle métier** : Seules les demandes `pending` peuvent être rejetées

---

### 3. Assigner en masse (`assign`)

```bash
curl -X POST http://localhost:3000/api/demands/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["REQ-2024-010", "REQ-2024-011"],
    "action": "assign",
    "actorId": "USR-001",
    "actorName": "A. DIALLO",
    "employeeId": "EMP-042",
    "employeeName": "Jean MARTIN"
  }'
```

**Règle métier** : `employeeId` et `employeeName` sont requis

---

### 4. Demander complément en masse (`request_complement`)

```bash
curl -X POST http://localhost:3000/api/demands/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["REQ-2024-020", "REQ-2024-021"],
    "action": "request_complement",
    "actorId": "USR-001",
    "actorName": "A. DIALLO",
    "message": "Veuillez fournir les pièces justificatives"
  }'
```

**Règle métier** : `message` est requis

---

## 💻 Utilisation depuis le Frontend

### Service API

Ajoutons une fonction bulk au service :

```typescript
// src/lib/api/demands.ts

export async function bulkAction(
  ids: string[],
  action: 'validate' | 'reject' | 'assign' | 'request_complement',
  payload: {
    actorId?: string;
    actorName?: string;
    details?: string;
    employeeId?: string;
    employeeName?: string;
    message?: string;
  }
) {
  const res = await fetch('/api/demands/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, action, ...payload }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error ?? 'Bulk action failed');
  }

  return res.json();
}
```

---

### Hook React

```typescript
// src/hooks/use-bulk-actions.ts

import { useState, useCallback } from 'react';
import { bulkAction } from '@/lib/api/demands';

export function useBulkActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const performBulkAction = useCallback(async (
    ids: string[],
    action: 'validate' | 'reject' | 'assign' | 'request_complement',
    payload: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await bulkAction(ids, action, payload);
      return result;
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Unknown error');
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkValidate = useCallback(
    (ids: string[], actorId: string, actorName: string, comment?: string) =>
      performBulkAction(ids, 'validate', { actorId, actorName, details: comment }),
    [performBulkAction]
  );

  const bulkReject = useCallback(
    (ids: string[], actorId: string, actorName: string, reason: string) =>
      performBulkAction(ids, 'reject', { actorId, actorName, details: reason }),
    [performBulkAction]
  );

  const bulkAssign = useCallback(
    (ids: string[], actorId: string, actorName: string, employeeId: string, employeeName: string) =>
      performBulkAction(ids, 'assign', { actorId, actorName, employeeId, employeeName }),
    [performBulkAction]
  );

  return {
    loading,
    error,
    bulkValidate,
    bulkReject,
    bulkAssign,
    performBulkAction,
  };
}
```

---

### Composant UI avec sélection multiple

```tsx
'use client';

import { useState } from 'react';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { useBulkActions } from '@/hooks/use-bulk-actions';

function DemandsListWithBulk({ demands }: { demands: Demand[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const { bulkValidate, bulkReject, loading } = useBulkActions();

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkValidate = async () => {
    if (selected.length === 0) return;
    
    const result = await bulkValidate(selected, 'USR-001', 'A. DIALLO', 'Validation en masse');
    
    if (result) {
      alert(`${result.updated.length} demandes validées, ${result.skipped.length} ignorées`);
      setSelected([]);
    }
  };

  const handleBulkReject = async () => {
    if (selected.length === 0) return;
    
    const result = await bulkReject(selected, 'USR-001', 'A. DIALLO', 'Rejet en masse');
    
    if (result) {
      alert(`${result.updated.length} demandes rejetées, ${result.skipped.length} ignorées`);
      setSelected([]);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-[rgb(var(--muted))]">
          {selected.length} sélectionnée(s)
        </span>
        
        {selected.length > 0 && (
          <>
            <Button
              size="sm"
              variant="success"
              onClick={handleBulkValidate}
              disabled={loading}
            >
              ✅ Valider ({selected.length})
            </Button>
            
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkReject}
              disabled={loading}
            >
              ❌ Rejeter ({selected.length})
            </Button>
          </>
        )}
      </div>

      {/* Liste avec checkboxes */}
      <div className="space-y-2">
        {demands.map(d => (
          <div
            key={d.id}
            className={cn(
              'p-3 rounded-lg border',
              selected.includes(d.id) && 'bg-blue-500/10 border-blue-500'
            )}
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(d.id)}
                onChange={() => toggleSelect(d.id)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="font-medium">{d.subject}</div>
                <div className="text-sm text-[rgb(var(--muted))]">{d.id}</div>
              </div>
              <div className="text-sm">{d.status}</div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Patterns Avancés

### Pattern 1 : Sélection par filtres

```tsx
function BulkActionsByFilter() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const { bulkValidate } = useBulkActions();

  // Valider toutes les demandes d'un bureau
  const validateAllFromBureau = async (bureau: string) => {
    const filtered = demands.filter(d => d.bureau === bureau && d.status === 'pending');
    const ids = filtered.map(d => d.id);
    
    if (ids.length > 0) {
      await bulkValidate(ids, 'USR-001', 'A. DIALLO', `Validation bureau ${bureau}`);
    }
  };

  // Valider toutes les demandes urgentes
  const validateAllUrgent = async () => {
    const urgent = demands.filter(d => d.priority === 'urgent' && d.status === 'pending');
    const ids = urgent.map(d => d.id);
    
    if (ids.length > 0) {
      await bulkValidate(ids, 'USR-001', 'A. DIALLO', 'Validation urgences');
    }
  };

  return (
    <div className="space-y-2">
      <Button onClick={() => validateAllFromBureau('ADM')}>
        Valider toutes ADM
      </Button>
      <Button onClick={validateAllUrgent}>
        Valider toutes urgentes
      </Button>
    </div>
  );
}
```

---

### Pattern 2 : Modal de confirmation

```tsx
function BulkValidateModal({ selectedIds, onSuccess }: { selectedIds: string[]; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const { bulkValidate, loading } = useBulkActions();

  const handleConfirm = async () => {
    const result = await bulkValidate(selectedIds, 'USR-001', 'A. DIALLO', comment);
    
    if (result) {
      onSuccess();
      setOpen(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Valider {selectedIds.length} demandes
      </Button>

      <FluentModal open={open} title="Confirmation" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <p>
            Vous allez valider <strong>{selectedIds.length} demandes</strong>.
          </p>

          <label>
            <div className="text-sm mb-1">Commentaire (optionnel)</div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 rounded border"
              rows={3}
            />
          </label>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button variant="success" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Validation...' : 'Confirmer'}
            </Button>
          </div>
        </div>
      </FluentModal>
    </>
  );
}
```

---

### Pattern 3 : Résultat détaillé

```tsx
function BulkActionResult({ result }: { result: { updated: string[]; skipped: Array<{id: string; reason: string}> } }) {
  return (
    <div className="space-y-3">
      {result.updated.length > 0 && (
        <div className="p-3 rounded bg-green-500/10 border border-green-500/20">
          <div className="font-medium text-green-600">
            ✅ {result.updated.length} demande(s) traitée(s)
          </div>
          <div className="text-sm mt-1">
            {result.updated.join(', ')}
          </div>
        </div>
      )}

      {result.skipped.length > 0 && (
        <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20">
          <div className="font-medium text-amber-600">
            ⚠️ {result.skipped.length} demande(s) ignorée(s)
          </div>
          <div className="text-sm mt-1 space-y-1">
            {result.skipped.map(s => (
              <div key={s.id}>
                <strong>{s.id}</strong>: {s.reason}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔒 Sécurité & Performance

### Transaction Atomique

✅ **Toutes les actions sont wrapped dans une transaction Prisma** :
- Si une erreur survient, **tout est rollback**
- Garantit la **cohérence des données**
- **Évite les états incohérents**

```typescript
await prisma.$transaction(async (tx) => {
  // Toutes les opérations ici
  // Rollback auto si erreur
});
```

---

### Limitations

| Limite | Valeur | Raison |
|--------|--------|--------|
| **Max IDs** | 100 | Performance transaction |
| **Timeout** | 30s | Prisma transaction timeout |

**Recommandation** : Limiter à 50 demandes par batch pour une meilleure performance.

---

### Validation côté client

```typescript
function validateBulkRequest(ids: string[]) {
  if (ids.length === 0) {
    throw new Error('Aucune demande sélectionnée');
  }

  if (ids.length > 100) {
    throw new Error('Maximum 100 demandes par batch');
  }

  return true;
}
```

---

## 📊 Exemples Pratiques

### 1. Valider toutes les demandes en attente

```typescript
const pending = await listDemands('pending');
const ids = pending.map(d => d.id);

const result = await bulkAction(ids, 'validate', {
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  details: 'Validation batch fin Q1'
});

console.log(`${result.updated.length} validées`);
```

---

### 2. Assigner toutes les urgences à un chef

```typescript
const urgent = await listDemands('urgent');
const ids = urgent.map(d => d.id);

await bulkAction(ids, 'assign', {
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  employeeId: 'EMP-042',
  employeeName: 'Jean MARTIN'
});
```

---

### 3. Demander complément sur toutes les demandes d'un bureau

```typescript
const admDemands = (await listDemands('pending')).filter(d => d.bureau === 'ADM');
const ids = admDemands.map(d => d.id);

await bulkAction(ids, 'request_complement', {
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  message: 'Merci de compléter les pièces justificatives manquantes'
});
```

---

## 🎉 Résumé

**Actions en masse** : Traiter plusieurs demandes simultanément

**Endpoint** : `POST /api/demands/bulk`

**Actions** : `validate`, `reject`, `assign`, `request_complement`

**Avantages** :
- ⚡ **Performance** : Transaction atomique
- 🔒 **Sécurité** : Rollback automatique
- 📊 **Traçabilité** : Événements pour chaque demande
- 🎯 **Productivité** : 100x plus rapide que manuel

**Utilisation** :
- ✅ Hook : `useBulkActions()`
- ✅ Service : `bulkAction()`
- ✅ UI : Sélection multiple + boutons

---

## 📚 Liens utiles

- **API Reference** : [`API_REFERENCE.md`](./API_REFERENCE.md)
- **Actions unifiées** : [`API_ACTIONS.md`](./API_ACTIONS.md)
- **Services API** : [`API_SERVICES.md`](./API_SERVICES.md)

