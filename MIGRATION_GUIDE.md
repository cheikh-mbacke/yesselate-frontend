# 🔄 Guide de Migration - Nouvelle API Actions

## Vue d'ensemble

Passage de **routes multiples** → **endpoint unique** `/api/demands/[id]/actions`

### ❌ Ancienne architecture
```
POST /api/demands/[id]/validate
POST /api/demands/[id]/reject
POST /api/demands/[id]/assign
POST /api/demands/[id]/request-complement
```

### ✅ Nouvelle architecture
```
POST /api/demands/[id]/actions
```

**Avantage** : Toutes les actions passent par un seul endpoint avec un payload `action`.

---

## 🔄 Migration du code

### Exemple 1 : Validation

#### ❌ Avant (anciennes routes)

```typescript
// Ancien hook useDemandsAPI
const { validateDemand } = useDemandsAPI();

await validateDemand(
  'REQ-2024-001',
  'Demande approuvée'
);
```

```typescript
// Ou directement avec fetch
await fetch('/api/demands/REQ-2024-001/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    actorId: 'USR-001',
    actorName: 'A. DIALLO',
    comment: 'Approuvé'
  })
});
```

#### ✅ Après (nouveau hook)

```typescript
// Nouveau hook useDemandActions
import { useDemandActions } from '@/hooks';

const { validate } = useDemandActions();

const updated = await validate(
  'REQ-2024-001',
  'USR-001',
  'A. DIALLO',
  'Demande approuvée'
);

if (updated) {
  console.log('Validée !', updated);
}
```

```typescript
// Ou directement avec fetch
await fetch('/api/demands/REQ-2024-001/actions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'validate',
    actorId: 'USR-001',
    actorName: 'A. DIALLO',
    details: 'Approuvé'
  })
});
```

---

### Exemple 2 : Rejet

#### ❌ Avant

```typescript
const { rejectDemand } = useDemandsAPI();

await rejectDemand(
  'REQ-2024-001',
  'Budget insuffisant'
);
```

#### ✅ Après

```typescript
const { reject } = useDemandActions();

const updated = await reject(
  'REQ-2024-001',
  'USR-001',
  'A. DIALLO',
  'Budget insuffisant'
);
```

---

### Exemple 3 : Assignation (nouvelle fonctionnalité !)

#### ✅ Nouveau

```typescript
const { assign } = useDemandActions();

const updated = await assign(
  'REQ-2024-001',
  'USR-001',           // Acteur qui assigne
  'A. DIALLO',
  'EMP-042',           // Employé assigné
  'Jean MARTIN'
);
```

---

### Exemple 4 : Demande de complément (nouvelle fonctionnalité !)

#### ✅ Nouveau

```typescript
const { requestComplement } = useDemandActions();

const updated = await requestComplement(
  'REQ-2024-001',
  'USR-001',
  'A. DIALLO',
  'Merci de fournir les pièces justificatives manquantes'
);
```

---

## 🎯 Migration d'un composant complet

### ❌ Avant : DemandTab.tsx

```typescript
import { useDemandsAPI } from '@/hooks';

export function DemandTab({ tab }: { tab: WorkspaceTab }) {
  const { validateDemand, rejectDemand, loading } = useDemandsAPI();
  
  const handleValidate = async () => {
    const success = await validateDemand(d.id, comment);
    if (success) {
      addToast('Validée !', 'success');
    }
  };
  
  const handleReject = async () => {
    const success = await rejectDemand(d.id, reason);
    if (success) {
      addToast('Rejetée !', 'warning');
    }
  };
  
  // ...
}
```

### ✅ Après : DemandTab.tsx

```typescript
import { useDemandActions } from '@/hooks';

export function DemandTab({ tab }: { tab: WorkspaceTab }) {
  const { validate, reject, assign, requestComplement, loading } = useDemandActions();
  
  const handleValidate = async () => {
    const updated = await validate(d.id, 'USR-001', 'A. DIALLO', comment);
    if (updated) {
      addToast('Validée !', 'success');
      // Rafraîchir la liste si besoin
    }
  };
  
  const handleReject = async () => {
    const updated = await reject(d.id, 'USR-001', 'A. DIALLO', reason);
    if (updated) {
      addToast('Rejetée !', 'warning');
    }
  };
  
  const handleAssign = async (employeeId: string, employeeName: string) => {
    const updated = await assign(d.id, 'USR-001', 'A. DIALLO', employeeId, employeeName);
    if (updated) {
      addToast(`Assignée à ${employeeName}`, 'info');
    }
  };
  
  const handleRequestComplement = async (message: string) => {
    const updated = await requestComplement(d.id, 'USR-001', 'A. DIALLO', message);
    if (updated) {
      addToast('Complément demandé', 'info');
    }
  };
  
  // ...
}
```

---

## 🔧 Compatibilité

### Les anciennes routes restent fonctionnelles !

✅ **`/api/demands/[id]/validate`** → Toujours disponible  
✅ **`/api/demands/[id]/reject`** → Toujours disponible  

**Migration progressive** :
1. Les nouvelles features utilisent `/actions`
2. L'ancien code continue de fonctionner
3. Migration au rythme souhaité

---

## 🆕 Nouvelles fonctionnalités

### 1. Assignation de demandes

```typescript
const { assign } = useDemandActions();

await assign(
  demandId,
  actorId,
  actorName,
  employeeId,
  employeeName
);
```

### 2. Demande de complément

```typescript
const { requestComplement } = useDemandActions();

await requestComplement(
  demandId,
  actorId,
  actorName,
  'Message du complément demandé'
);
```

### 3. Action personnalisée

```typescript
const { executeAction } = useDemandActions();

await executeAction(demandId, {
  action: 'custom_action',
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  customField: 'value'
});
```

---

## 📊 Tableau de correspondance

| Ancienne méthode | Nouvelle méthode | Endpoint |
|------------------|------------------|----------|
| `validateDemand(id, comment)` | `validate(id, actorId, actorName, details)` | `POST /actions` |
| `rejectDemand(id, reason)` | `reject(id, actorId, actorName, details)` | `POST /actions` |
| ❌ Non disponible | `assign(id, actorId, actorName, empId, empName)` | `POST /actions` |
| ❌ Non disponible | `requestComplement(id, actorId, actorName, msg)` | `POST /actions` |

---

## ⚡ Checklist de migration

### Pour chaque composant utilisant les actions :

- [ ] Remplacer `useDemandsAPI` par `useDemandActions`
- [ ] Mettre à jour les appels `validateDemand` → `validate`
- [ ] Mettre à jour les appels `rejectDemand` → `reject`
- [ ] Ajouter `actorId` et `actorName` aux appels
- [ ] Profiter des nouvelles fonctionnalités (`assign`, `requestComplement`)
- [ ] Tester les règles métier (validation des statuts)
- [ ] Vérifier les événements créés dans la DB

### Fichiers à migrer :

- [ ] `src/components/features/bmo/workspace/tabs/DemandTab.tsx`
- [ ] `src/components/features/bmo/workspace/tabs/InboxTab.tsx`
- [ ] `src/components/features/bmo/modals/DemandDetailsModal.tsx`
- [ ] Tout autre composant utilisant `validateDemand` / `rejectDemand`

---

## 🎯 Avantages de la migration

✅ **Architecture plus propre** : Un seul endpoint pour toutes les actions  
✅ **Règles métier centralisées** : Validation dans un seul fichier  
✅ **Nouvelles fonctionnalités** : Assignation, demande de complément  
✅ **Extensibilité** : Facile d'ajouter de nouvelles actions  
✅ **Type-safe** : Types TypeScript stricts  
✅ **Traçabilité** : Chaque action crée un événement  

---

## 🚀 Prochaines étapes

1. ✅ **Tester la nouvelle API** : Utilisez Postman ou le navigateur
2. ✅ **Migrer un composant** : Commencez par `DemandTab`
3. ✅ **Vérifier les événements** : Consultez la DB avec Prisma Studio
4. ✅ **Profiter des nouvelles features** : Assignation, compléments
5. ✅ **Documenter** : Ajoutez des commentaires dans le code

---

## 📚 Documentation complète

- **`API_ACTIONS.md`** : Documentation complète de l'endpoint `/actions`
- **`API_REFERENCE.md`** : Référence de toute l'API
- **`INSTALLATION.md`** : Installation de la DB

---

## ❓ FAQ

### Les anciennes routes `/validate` et `/reject` fonctionnent-elles encore ?

✅ **Oui !** Elles restent fonctionnelles pour la compatibilité.

### Dois-je tout migrer d'un coup ?

❌ **Non.** Migration progressive possible.

### Comment tester la nouvelle API ?

```bash
curl -X POST http://localhost:3000/api/demands/REQ-2024-001/actions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "validate",
    "actorId": "USR-001",
    "actorName": "A. DIALLO",
    "details": "Test"
  }'
```

### Comment voir les événements créés ?

```bash
npm run db:studio
# → Ouvre Prisma Studio
# → Table DemandEvent
```

---

**Bonne migration ! 🎉**

