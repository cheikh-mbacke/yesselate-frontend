# Guide d'Utilisation des APIs - Délégations

## 📡 APIs Notifications

### GET /api/delegations/notifications
Récupère toutes les notifications de l'utilisateur connecté.

**Réponse** :
```json
{
  "notifications": [
    {
      "id": "notif-1",
      "type": "expiring" | "expired" | "control_required" | "control_approved" | "control_rejected" | "high_usage" | "revoked" | "suspended",
      "delegationId": "DEL-2024-001",
      "delegationCode": "DEL-2024-001",
      "title": "Délégation expire dans 3 jours",
      "message": "La délégation BMO expire le 15/01/2026",
      "priority": "high" | "medium" | "low",
      "createdAt": "2026-01-10T12:00:00Z",
      "read": false
    }
  ],
  "summary": {
    "total": 4,
    "unread": 2,
    "high": 1
  },
  "ts": "2026-01-10T15:30:00Z"
}
```

### POST /api/delegations/notifications/[id]/read
Marque une notification comme lue.

**Body** : Aucun

**Réponse** :
```json
{
  "success": true,
  "id": "notif-1",
  "readAt": "2026-01-10T15:30:00Z"
}
```

### DELETE /api/delegations/notifications/[id]
Supprime/ignore une notification.

**Body** : Aucun

**Réponse** :
```json
{
  "success": true,
  "id": "notif-1",
  "deletedAt": "2026-01-10T15:30:00Z"
}
```

### POST /api/delegations/notifications/read-all
Marque toutes les notifications comme lues.

**Body** : Aucun

**Réponse** :
```json
{
  "success": true,
  "count": 5,
  "readAt": "2026-01-10T15:30:00Z"
}
```

---

## 📜 APIs Timeline / Audit

### GET /api/delegations/timeline
Récupère l'historique global de toutes les délégations.

**Query Parameters** :
- `delegationId` (optionnel) : Filtrer par ID de délégation
- `limit` (optionnel, défaut: 100) : Nombre d'événements
- `offset` (optionnel, défaut: 0) : Pagination

**Exemple** :
```
GET /api/delegations/timeline?limit=50&offset=0
GET /api/delegations/timeline?delegationId=DEL-2024-001
```

**Réponse** :
```json
{
  "events": [
    {
      "id": "evt-1",
      "delegationId": "DEL-2024-001",
      "delegationCode": "DEL-2024-001",
      "eventType": "created" | "updated" | "extended" | "suspended" | "reactivated" | "revoked" | "used" | "denied" | "control_requested" | "control_approved" | "control_rejected",
      "actorId": "user-1",
      "actorName": "Jean Dupont",
      "actorRole": "Directeur BMO",
      "summary": "Délégation créée",
      "details": "Nouvelle délégation de signature...",
      "metadata": {
        "bureau": "BMO",
        "maxAmount": 10000000
      },
      "createdAt": "2024-01-10T10:00:00Z",
      "previousHash": null,
      "hash": "abc123..."
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  },
  "ts": "2026-01-10T15:30:00Z"
}
```

### GET /api/delegations/[id]/timeline
Récupère l'historique d'une délégation spécifique.

**Exemple** :
```
GET /api/delegations/DEL-2024-001/timeline
```

**Réponse** :
```json
{
  "events": [...],
  "delegationId": "DEL-2024-001",
  "ts": "2026-01-10T15:30:00Z"
}
```

---

## ⚡ APIs Actions sur Délégations

### POST /api/delegations/[id]/extend
Prolonge une délégation.

**Body** :
```json
{
  "actorId": "user-1",
  "actorName": "Jean Dupont",
  "actorRole": "Directeur",
  "newEndDate": "2026-06-15T23:59:59Z",
  "reason": "Prolongation nécessaire pour finaliser le projet",
  "decisionRef": "DEC-2024-005"
}
```

**Validation** :
- `actorId`, `actorName`, `newEndDate` sont **requis**
- La date doit être postérieure à la date actuelle
- Vérifie le nombre maximum de prolongations
- Vérifie que la délégation est `extendable`
- Vérifie la limite de jours de prolongation

**Réponse** :
```json
{
  "success": true,
  "delegation": {...},
  "extensionInfo": {
    "previousEndDate": "2026-01-15T23:59:59Z",
    "newEndDate": "2026-06-15T23:59:59Z",
    "daysExtended": 151,
    "extensionNumber": 1,
    "remainingExtensions": 2
  },
  "event": {
    "id": "evt-123",
    "type": "EXTENDED",
    "hash": "xyz789...",
    "createdAt": "2026-01-10T15:30:00Z"
  }
}
```

### POST /api/delegations/[id]/revoke
Révoque définitivement une délégation (**irréversible**).

**Body** :
```json
{
  "actorId": "user-1",
  "actorName": "Jean Dupont",
  "actorRole": "Directeur",
  "reason": "Fin de mission anticipée"
}
```

**Validation** :
- `actorId`, `actorName`, `reason` sont **requis**
- Vérifie que l'acteur a le droit de révoquer (`canRevoke` ou est le `grantorId`)
- La délégation ne doit pas être déjà révoquée

**Réponse** :
```json
{
  "success": true,
  "delegation": {
    "id": "DEL-2024-001",
    "status": "revoked",
    "revokedAt": "2026-01-10T15:30:00Z",
    "revokeReason": "Fin de mission anticipée",
    "headHash": "hash..."
  },
  "event": {
    "type": "REVOKED",
    "hash": "hash..."
  }
}
```

### POST /api/delegations/[id]/suspend
Suspend temporairement une délégation.

**Body** :
```json
{
  "actorId": "user-1",
  "actorName": "Jean Dupont",
  "actorRole": "Directeur",
  "reason": "Audit en cours",
  "expectedReactivation": "2026-02-01T00:00:00Z"
}
```

**Validation** :
- `actorId`, `actorName`, `reason` sont **requis**
- La délégation doit être au statut `active`

**Réponse** :
```json
{
  "success": true,
  "delegation": {
    "id": "DEL-2024-001",
    "status": "suspended",
    "headHash": "hash..."
  },
  "event": {
    "id": "evt-456",
    "type": "SUSPENDED",
    "hash": "hash...",
    "createdAt": "2026-01-10T15:30:00Z"
  }
}
```

### POST /api/delegations/[id]/reactivate
Réactive une délégation suspendue.

**Body** :
```json
{
  "actorId": "user-1",
  "actorName": "Jean Dupont",
  "actorRole": "Directeur",
  "reason": "Audit terminé avec succès"
}
```

**Validation** :
- `actorId`, `actorName` sont **requis**
- La délégation doit être au statut `suspended`
- La délégation ne doit pas être expirée (sinon il faut d'abord prolonger)

**Réponse** :
```json
{
  "success": true,
  "delegation": {
    "id": "DEL-2024-001",
    "status": "active",
    "headHash": "hash..."
  },
  "event": {
    "id": "evt-789",
    "type": "REACTIVATED",
    "hash": "hash...",
    "createdAt": "2026-01-10T15:30:00Z"
  }
}
```

---

## 🔐 Sécurité

### Authentification
Toutes les APIs requièrent une session utilisateur valide via NextAuth.

**En cas d'échec** :
```json
{
  "error": "Non authentifié"
}
```
Status: `401 Unauthorized`

### Autorisations
Certaines actions (révocation, prolongation) vérifient les autorisations spécifiques de l'utilisateur.

**En cas d'échec** :
```json
{
  "error": "Vous n'êtes pas autorisé à révoquer cette délégation."
}
```
Status: `403 Forbidden`

### Validation
Les paramètres requis sont validés côté serveur.

**Exemple d'erreur** :
```json
{
  "error": "actorId et actorName sont requis."
}
```
Status: `400 Bad Request`

---

## 📊 Codes de Statut HTTP

| Code | Signification | Utilisation |
|------|--------------|-------------|
| 200 | OK | Succès de l'opération |
| 400 | Bad Request | Paramètres manquants ou invalides |
| 401 | Unauthorized | Session non authentifiée |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource introuvable |
| 500 | Internal Server Error | Erreur serveur |

---

## 🧪 Exemples d'Utilisation

### Exemple Frontend (React)

#### Récupérer les notifications
```typescript
const fetchNotifications = async () => {
  try {
    const res = await fetch('/api/delegations/notifications', {
      cache: 'no-store'
    });
    
    if (!res.ok) throw new Error('Erreur chargement');
    
    const data = await res.json();
    setNotifications(data.notifications);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

#### Prolonger une délégation
```typescript
const extendDelegation = async (delegationId: string, days: number) => {
  const newEndDate = new Date();
  newEndDate.setDate(newEndDate.getDate() + days);
  
  try {
    const res = await fetch(`/api/delegations/${delegationId}/extend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId: session.user.id,
        actorName: session.user.name,
        actorRole: 'Directeur',
        newEndDate: newEndDate.toISOString(),
        reason: `Prolongation de ${days} jours`,
      }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error);
    }
    
    const data = await res.json();
    console.log('Prolongation réussie:', data.extensionInfo);
    return data;
  } catch (error) {
    console.error('Erreur prolongation:', error);
    throw error;
  }
};
```

#### Actions en masse (batch)
```typescript
const batchExtend = async (delegationIds: string[], days: number) => {
  const results = [];
  
  for (const id of delegationIds) {
    try {
      const result = await extendDelegation(id, days);
      results.push({ id, success: true, data: result });
    } catch (error) {
      results.push({ id, success: false, error: error.message });
    }
  }
  
  return results;
};
```

---

## 🔄 Gestion de la Chaîne d'Audit (Hash)

Chaque événement génère un hash cryptographique basé sur :
- Le hash de l'événement précédent
- Les données de l'événement actuel
- Un timestamp

Cela crée une **chaîne d'intégrité** inviolable, similaire à une blockchain.

**Vérification** :
```typescript
// Recalculer le hash et comparer
const isValid = computeEventHash(eventData, previousHash) === event.hash;
```

---

**Date** : 10 janvier 2026  
**Version** : 1.0  
**Statut** : Production Ready

