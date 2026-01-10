# 📚 Référence API - Demandes BMO

## 🎯 Vue d'ensemble

API RESTful complète pour gérer les demandes avec traçabilité complète des actions.

**Base URL** : `http://localhost:3000/api/demands`

---

## 📥 Endpoints disponibles

### 1. Statistiques en temps réel ⭐

```http
GET /api/demands/stats
```

**Retourne des KPIs calculés en temps réel** :
- Total demandes
- Demandes pending, validated, rejected
- Demandes urgent, high priority (pending uniquement)
- Demandes en retard (overdue > 7 jours)
- Délai moyen de traitement

**Réponse** :
```json
{
  "total": 8,
  "pending": 5,
  "validated": 2,
  "rejected": 1,
  "urgent": 2,
  "high": 1,
  "overdue": 3,
  "avgDelay": 8,
  "ts": "2024-01-15T10:30:00.000Z"
}
```

**Avantages** :
- ✅ Optimisé : sélectionne seulement les champs nécessaires
- ✅ Rapide : calcul côté serveur
- ✅ Timestamp : savoir quand les stats ont été générées
- ✅ SLA compliance : facilement calculable depuis overdue/total

---

### 2. Liste des demandes

```http
GET /api/demands
```

**Query Parameters** :
| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `queue` | string | File de demandes : `pending`, `urgent`, `validated`, `rejected` | `?queue=pending` |
| `q` | string | Recherche full-text (id, subject, bureau, type) | `?q=REQ-2024` |
| `limit` | number | Nombre max de résultats (max 200) | `?limit=50` |

**Exemples** :
```bash
# Toutes les demandes en attente
GET /api/demands?queue=pending

# Demandes urgentes (pending + priority=urgent)
GET /api/demands?queue=urgent

# Recherche avec limite
GET /api/demands?q=ADM&limit=20

# Combinaison
GET /api/demands?queue=pending&q=REQ-2024&limit=10
```

**Réponse** :
```json
{
  "rows": [
    {
      "id": "REQ-2024-001",
      "subject": "Acquisition équipement informatique",
      "bureau": "ADM",
      "type": "Équipement",
      "amount": "4 500 000",
      "icon": "💻",
      "priority": "high",
      "status": "pending",
      "requestedAt": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### 3. Créer une demande

```http
POST /api/demands
```

**Body** :
```json
{
  "id": "REQ-2024-009",
  "subject": "Nouvelle demande",
  "bureau": "ADM",
  "type": "Équipement",
  "amount": "1 000 000",
  "icon": "📦",
  "priority": "normal",
  "actorId": "USR-001",
  "actorName": "A. DIALLO"
}
```

**Champs requis** : `id`, `subject`, `bureau`, `type`

**Réponse** :
```json
{
  "demand": {
    "id": "REQ-2024-009",
    "subject": "Nouvelle demande",
    "status": "pending",
    ...
  }
}
```

**Événement créé automatiquement** :
- Action : `create`
- Details : "Création de la demande"

---

### 4. Récupérer une demande

```http
GET /api/demands/{id}
```

**Exemple** :
```bash
GET /api/demands/REQ-2024-001
```

**Réponse** :
```json
{
  "demand": {
    "id": "REQ-2024-001",
    "subject": "...",
    "events": [
      {
        "id": "evt_abc123",
        "at": "2024-01-15T10:30:00.000Z",
        "actorId": "USR-001",
        "actorName": "A. DIALLO",
        "action": "create",
        "details": "Création de la demande"
      }
    ]
  }
}
```

---

### 5. Mettre à jour une demande

```http
PATCH /api/demands/{id}
```

**Body** :
```json
{
  "subject": "Nouveau sujet",
  "amount": "5 000 000",
  "priority": "urgent",
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "details": "Modification du montant"
}
```

**Champs modifiables** : `subject`, `amount`, `priority`, `bureau`, `type`, `icon`

**Réponse** :
```json
{
  "demand": { ... }
}
```

**Événement créé automatiquement** :
- Action : `update`
- Details : Le message fourni ou "Mise à jour"

---

### 6. Valider une demande

```http
POST /api/demands/{id}/validate
```

**Body** :
```json
{
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "comment": "Demande approuvée après vérification"
}
```

**Réponse** :
```json
{
  "demand": {
    "id": "REQ-2024-001",
    "status": "validated",
    ...
  }
}
```

**Effet** :
- ✅ Status → `validated`
- 📝 Événement créé : `action: "validation"`

---

### 7. Rejeter une demande

```http
POST /api/demands/{id}/reject
```

**Body** :
```json
{
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "reason": "Budget insuffisant pour cette période"
}
```

⚠️ **Champ requis** : `reason` (ne peut pas être vide)

**Réponse** :
```json
{
  "demand": {
    "id": "REQ-2024-001",
    "status": "rejected",
    ...
  }
}
```

**Effet** :
- ❌ Status → `rejected`
- 📝 Événement créé : `action: "rejection"`, `details: reason`

---

### 8. Supprimer une demande

```http
DELETE /api/demands/{id}
```

**Réponse** :
```json
{
  "success": true
}
```

⚠️ **Attention** : Supprime aussi tous les événements associés (cascade)

---

## 🔐 Codes de statut HTTP

| Code | Signification |
|------|---------------|
| `200` | Succès (GET, PATCH, DELETE) |
| `201` | Créé (POST) |
| `400` | Requête invalide (payload manquant/invalide) |
| `404` | Ressource introuvable |
| `500` | Erreur serveur |

---

## 📊 Modèle de données

### Demand
```typescript
{
  id: string;              // Identifiant unique (ex: "REQ-2024-001")
  subject: string;         // Objet de la demande
  bureau: string;          // Code bureau (ex: "ADM", "FIN")
  type: string;            // Type (ex: "Équipement", "Formation")
  amount?: string;         // Montant (ex: "4 500 000")
  icon?: string;           // Emoji (ex: "💻")
  priority: "urgent" | "high" | "normal" | "low";
  status: "pending" | "validated" | "rejected";
  requestedAt: Date;       // Date de la demande
  createdAt: Date;         // Date de création en DB
  updatedAt: Date;         // Date de dernière modification
  assignedToId?: string;   // ID de l'assigné (optionnel)
  assignedToName?: string; // Nom de l'assigné (optionnel)
  events: DemandEvent[];   // Historique des événements
}
```

### DemandEvent
```typescript
{
  id: string;         // ID auto-généré (cuid)
  demandId: string;   // FK vers Demand
  at: Date;           // Date/heure de l'événement
  actorId: string;    // ID de l'acteur
  actorName: string;  // Nom de l'acteur
  action: string;     // "create", "update", "validation", "rejection"
  details: string;    // Description de l'action
}
```

---

## 🎯 Exemples d'utilisation

### Avec `fetch` (JavaScript/TypeScript)

```typescript
// Liste des demandes urgentes
const response = await fetch('/api/demands?queue=urgent');
const { rows } = await response.json();

// Créer une demande
const newDemand = await fetch('/api/demands', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'REQ-2024-009',
    subject: 'Nouvelle demande',
    bureau: 'ADM',
    type: 'Équipement',
    amount: '1 000 000',
  }),
});

// Valider une demande
await fetch('/api/demands/REQ-2024-001/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    actorId: 'USR-001',
    actorName: 'A. DIALLO',
    comment: 'Approuvé',
  }),
});
```

### Avec le hook `useDemandsDB`

```tsx
import { useDemandsDB } from '@/hooks';

const { fetchDemands, validateDemand, loading } = useDemandsDB();

// Récupérer les demandes
const demands = await fetchDemands({ queue: 'urgent' });

// Valider
const success = await validateDemand(
  'REQ-2024-001',
  'USR-001',
  'A. DIALLO',
  'Approuvé'
);
```

---

## 🔍 Cas d'usage métier

### 1. File d'attente "À traiter"
```bash
GET /api/demands?queue=pending&limit=50
```

### 2. Demandes urgentes critiques
```bash
GET /api/demands?queue=urgent
```

### 3. Recherche par bureau
```bash
GET /api/demands?q=ADM
```

### 4. Historique d'une demande
```bash
GET /api/demands/REQ-2024-001
# → Retourne la demande + tous les événements (events)
```

### 5. Validation rapide
```bash
POST /api/demands/REQ-2024-001/validate
{
  "actorId": "USR-001",
  "actorName": "A. DIALLO",
  "comment": "Validation express"
}
```

### 6. Rejet avec motif
```bash
POST /api/demands/REQ-2024-001/reject
{
  "reason": "Budget dépassé"
}
```

---

## 🛠️ Testez l'API avec cURL

```bash
# Liste des demandes
curl http://localhost:3000/api/demands?queue=pending

# Créer une demande
curl -X POST http://localhost:3000/api/demands \
  -H "Content-Type: application/json" \
  -d '{
    "id": "REQ-2024-TEST",
    "subject": "Test API",
    "bureau": "ADM",
    "type": "Test"
  }'

# Valider
curl -X POST http://localhost:3000/api/demands/REQ-2024-TEST/validate \
  -H "Content-Type: application/json" \
  -d '{
    "actorId": "USR-001",
    "actorName": "A. DIALLO",
    "comment": "Test validation"
  }'
```

---

## 📝 Notes importantes

✅ **Traçabilité** : Chaque action (create, update, validate, reject) génère un événement dans `DemandEvent`  
✅ **Type-safe** : Prisma garantit la cohérence des types  
✅ **Cascade Delete** : Supprimer une demande supprime aussi ses événements  
✅ **Recherche insensible à la casse** : `mode: 'insensitive'` activé  
✅ **Validation** : Champs requis vérifiés côté API  

---

## 🚀 Prochaines étapes

1. **Authentification** : Remplacer les `actorId` hardcodés par NextAuth.js
2. **Permissions** : Vérifier les rôles avant validation/rejet
3. **Pagination** : Ajouter `offset` et `cursor` pour grandes listes
4. **Webhooks** : Notifier les changements de statut
5. **Upload** : Gérer les pièces jointes (fichiers)
6. **Stats** : Endpoint `/api/demands/stats` pour les KPIs

