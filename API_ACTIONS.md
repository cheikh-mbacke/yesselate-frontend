# 🎯 API Actions - Endpoint Unifié

## Vue d'ensemble

**Endpoint unique** pour toutes les actions métier sur une demande.

```
POST /api/demands/{id}/actions
```

Au lieu d'avoir plusieurs routes (`/validate`, `/reject`, `/assign`...), toutes les actions passent par un seul endpoint avec un payload `action`.

---

## 🎨 Avantages

✅ **Architecture RESTful moderne** : Une seule route pour toutes les actions  
✅ **Validation métier centralisée** : Règles métier dans un seul fichier  
✅ **Extensible** : Facile d'ajouter de nouvelles actions  
✅ **Traçabilité** : Chaque action crée un `DemandEvent`  
✅ **Type-safe** : Types TypeScript stricts  

---

## 📋 Actions disponibles

### 1. ✅ Valider une demande

**Action** : `validate`

**Payload** :
```json
{
  "action": "validate",
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "details": "Demande approuvée après vérification"
}
```

**Règle métier** :
- ⚠️ La demande doit être au statut `pending`
- ❌ Erreur 409 si déjà validée ou rejetée

**Effet** :
- Status → `validated`
- Événement créé : `action: "validation"`

---

### 2. ❌ Rejeter une demande

**Action** : `reject`

**Payload** :
```json
{
  "action": "reject",
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "details": "Budget insuffisant"
}
```

**Règle métier** :
- ⚠️ La demande doit être au statut `pending`
- ❌ Erreur 409 si déjà validée ou rejetée

**Effet** :
- Status → `rejected`
- Événement créé : `action: "rejection"`

---

### 3. 👤 Assigner une demande

**Action** : `assign`

**Payload** :
```json
{
  "action": "assign",
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "employeeId": "EMP-042",
  "employeeName": "Jean MARTIN"
}
```

**Champs requis** : `employeeId`, `employeeName`

**Effet** :
- `assignedToId` → `employeeId`
- `assignedToName` → `employeeName`
- Événement créé : `action: "delegation"`, `details: "Assignée à Jean MARTIN"`

---

### 4. 💬 Demander un complément

**Action** : `request_complement`

**Payload** :
```json
{
  "action": "request_complement",
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "message": "Merci de fournir les pièces justificatives manquantes"
}
```

**Champ requis** : `message` (non vide)

**Effet** :
- Status reste inchangé
- Événement créé : `action: "request_complement"`, `details: message`
- 💡 Prêt pour déclencher notification/email

---

## 🚀 Utilisation

### Avec `fetch` (JavaScript)

```typescript
// Valider
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

// Assigner
await fetch('/api/demands/REQ-2024-001/actions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'assign',
    actorId: 'USR-001',
    actorName: 'A. DIALLO',
    employeeId: 'EMP-042',
    employeeName: 'Jean MARTIN'
  })
});

// Demander complément
await fetch('/api/demands/REQ-2024-001/actions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'request_complement',
    actorId: 'USR-001',
    actorName: 'A. DIALLO',
    message: 'Pièces justificatives manquantes'
  })
});
```

---

### Avec le hook `useDemandActions`

```tsx
import { useDemandActions } from '@/hooks';

function MyComponent() {
  const { 
    validate, 
    reject, 
    assign, 
    requestComplement,
    loading, 
    error 
  } = useDemandActions();

  // Valider
  const handleValidate = async () => {
    const updated = await validate(
      'REQ-2024-001',
      'USR-001',
      'A. DIALLO',
      'Approuvé'
    );
    if (updated) {
      console.log('Validée !', updated);
    }
  };

  // Assigner
  const handleAssign = async () => {
    const updated = await assign(
      'REQ-2024-001',
      'USR-001',
      'A. DIALLO',
      'EMP-042',
      'Jean MARTIN'
    );
  };

  // Demander complément
  const handleRequestComplement = async () => {
    const updated = await requestComplement(
      'REQ-2024-001',
      'USR-001',
      'A. DIALLO',
      'Merci de fournir les pièces justificatives'
    );
  };
}
```

---

## 🔒 Codes de statut HTTP

| Code | Signification |
|------|---------------|
| `200` | Succès - Action exécutée |
| `400` | Requête invalide (action manquante, champs requis manquants) |
| `404` | Demande introuvable |
| `409` | Conflit - Règle métier violée (ex: re-validation) |
| `500` | Erreur serveur |

---

## 📊 Réponse

```json
{
  "demand": {
    "id": "REQ-2024-001",
    "subject": "...",
    "status": "validated",
    "assignedToId": "EMP-042",
    "assignedToName": "Jean MARTIN",
    ...
  }
}
```

---

## ⚠️ Règles métier

### Validation / Rejet

```typescript
// ❌ Impossible de valider une demande déjà validée
if (action === 'validate' && demand.status !== 'pending') {
  return 409 "Demande non validable"
}

// ❌ Impossible de rejeter une demande déjà rejetée
if (action === 'reject' && demand.status !== 'pending') {
  return 409 "Demande non rejetable"
}
```

### Assignation

```typescript
// ❌ employeeId et employeeName requis
if (action === 'assign' && (!employeeId || !employeeName)) {
  return 400 "employeeId/employeeName requis"
}
```

### Demande de complément

```typescript
// ❌ Message requis et non vide
if (action === 'request_complement' && !message.trim()) {
  return 400 "Message requis"
}
```

---

## 🔄 Traçabilité (DemandEvent)

Chaque action crée automatiquement un événement :

| Action | Event.action | Event.details |
|--------|--------------|---------------|
| `validate` | `validation` | `details` fourni ou "Validée" |
| `reject` | `rejection` | `details` fourni ou "Rejetée" |
| `assign` | `delegation` | "Assignée à {employeeName}" |
| `request_complement` | `request_complement` | `message` fourni |

**Exemple d'événement créé** :
```json
{
  "id": "evt_abc123",
  "demandId": "REQ-2024-001",
  "at": "2024-01-15T10:30:00.000Z",
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "action": "validation",
  "details": "Demande approuvée après vérification"
}
```

---

## 🎯 Extensibilité

Pour ajouter une nouvelle action :

### 1. Ajouter le type

```typescript
type Action =
  | 'validate'
  | 'reject'
  | 'assign'
  | 'request_complement'
  | 'escalate'        // ← Nouvelle action
  | 'archive';        // ← Nouvelle action
```

### 2. Implémenter la logique

```typescript
if (action === 'escalate') {
  const reason = body.reason;
  if (!reason) return NextResponse.json({ error: 'Raison requise' }, { status: 400 });
  
  updated = await prisma.demand.update({
    where: { id },
    data: { priority: 'urgent' }
  });
  
  await prisma.demandEvent.create({
    data: {
      demandId: id,
      actorId,
      actorName,
      action: 'escalation',
      details: reason
    }
  });
  
  // Envoyer notification urgente
  // await sendUrgentNotification(id, reason);
}
```

### 3. Ajouter au hook

```typescript
const escalate = useCallback(async (
  demandId: string,
  actorId: string,
  actorName: string,
  reason: string
): Promise<Demand | null> => {
  return executeAction(demandId, {
    action: 'escalate',
    actorId,
    actorName,
    details: reason,
  });
}, [executeAction]);
```

✅ **C'est tout !** Nouvelle action disponible partout.

---

## 💡 Cas d'usage avancés

### Workflow complexe

```typescript
// 1. Demander complément
await requestComplement(id, actorId, actorName, 'Pièces manquantes');

// 2. Une fois reçu, assigner à un expert
await assign(id, actorId, actorName, 'EXP-001', 'Expert Comptable');

// 3. L'expert valide
await validate(id, 'EXP-001', 'Expert Comptable', 'Conforme après vérif');
```

### Action groupée

```typescript
const demandIds = ['REQ-2024-001', 'REQ-2024-002', 'REQ-2024-003'];

// Valider toutes les demandes en parallèle
await Promise.all(
  demandIds.map(id => 
    validate(id, 'USR-001', 'A. DIALLO', 'Validation groupée')
  )
);
```

---

## 🔗 Liens utiles

- **API Reference complète** : `API_REFERENCE.md`
- **Installation** : `INSTALLATION.md`
- **Setup DB** : `SETUP_DB.md`

---

## 🎉 Résumé

**Avant** ❌ :
- `/api/demands/[id]/validate` (POST)
- `/api/demands/[id]/reject` (POST)
- `/api/demands/[id]/assign` (POST)
- `/api/demands/[id]/request-complement` (POST)

**Après** ✅ :
- `/api/demands/[id]/actions` (POST avec `action`)

**Avantages** :
- ✅ Architecture plus propre
- ✅ Règles métier centralisées
- ✅ Extensibilité maximale
- ✅ Code plus maintenable
- ✅ Moins de routes à gérer

