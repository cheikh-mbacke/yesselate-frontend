# 📡 API BACKEND - DOSSIERS BLOQUÉS

## Vue d'ensemble

Ce document spécifie toutes les APIs backend nécessaires pour le module "Dossiers Bloqués" du BMO.

**Base URL:** `/api/bmo/blocked`

**Authentification:** Bearer Token (JWT)

**Headers requis:**
```http
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 📋 Endpoints CRUD

### 1. Liste des dossiers bloqués

```http
GET /api/bmo/blocked
```

**Query Parameters:**
| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `page` | integer | Numéro de page (défaut: 1) | `?page=2` |
| `limit` | integer | Éléments par page (défaut: 20) | `?limit=50` |
| `impact` | string | Filtrer par impact | `?impact=critical` |
| `bureau` | string | Filtrer par bureau | `?bureau=DT` |
| `type` | string | Filtrer par type | `?type=BC` |
| `status` | string | Filtrer par statut | `?status=pending` |
| `minDelay` | integer | Délai minimum (jours) | `?minDelay=14` |
| `maxDelay` | integer | Délai maximum (jours) | `?maxDelay=30` |
| `search` | string | Recherche textuelle | `?search=projet` |
| `sortBy` | string | Tri | `?sortBy=priority` |
| `sortDir` | string | Direction (asc/desc) | `?sortDir=desc` |

**Response 200:**
```json
{
  "data": [
    {
      "id": "BLK-001",
      "subject": "Validation budget travaux Phase 2",
      "reason": "Manque signatures DAF + DT",
      "impact": "critical",
      "type": "BC",
      "bureau": "DT",
      "responsible": "M. SECK",
      "project": "PRJ-2024-001",
      "amount": "45 000 000 FCFA",
      "delay": 18,
      "priority": 8540,
      "blockedAt": "2026-01-01T10:00:00Z",
      "status": "pending",
      "createdAt": "2026-01-01T10:00:00Z",
      "updatedAt": "2026-01-10T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

### 2. Détail d'un dossier

```http
GET /api/bmo/blocked/:id
```

**Response 200:**
```json
{
  "id": "BLK-001",
  "subject": "Validation budget travaux Phase 2",
  "reason": "Manque signatures DAF + DT",
  "impact": "critical",
  "type": "BC",
  "bureau": "DT",
  "responsible": "M. SECK",
  "project": "PRJ-2024-001",
  "amount": "45 000 000 FCFA",
  "delay": 18,
  "priority": 8540,
  "blockedAt": "2026-01-01T10:00:00Z",
  "status": "pending",
  "history": [
    {
      "at": "2026-01-10T14:30:00Z",
      "action": "escalated",
      "by": "A. DIALLO",
      "details": "Escalade au CODIR - Dépassement SLA critique"
    }
  ],
  "documents": [
    {
      "id": "DOC-123",
      "name": "BC_Phase2.pdf",
      "uploadedAt": "2026-01-01T10:15:00Z",
      "uploadedBy": "M. SECK",
      "size": 2048576
    }
  ],
  "comments": [
    {
      "id": "COM-456",
      "content": "En attente retour DAF",
      "by": "M. SECK",
      "at": "2026-01-05T09:00:00Z",
      "visibility": "internal"
    }
  ],
  "createdAt": "2026-01-01T10:00:00Z",
  "updatedAt": "2026-01-10T14:30:00Z"
}
```

---

### 3. Statistiques

```http
GET /api/bmo/blocked/stats
```

**Response 200:**
```json
{
  "total": 156,
  "critical": 23,
  "high": 45,
  "medium": 67,
  "low": 21,
  "avgDelay": 12,
  "avgPriority": 3240,
  "totalAmount": 1250000000,
  "overdueSLA": 34,
  "resolvedToday": 8,
  "escalatedToday": 3,
  "byBureau": [
    { "bureau": "DT", "count": 45, "critical": 12 },
    { "bureau": "DF", "count": 32, "critical": 6 }
  ],
  "byType": [
    { "type": "BC", "count": 67 },
    { "type": "Contrat", "count": 45 }
  ],
  "ts": "2026-01-10T15:30:00Z"
}
```

---

## 🔧 Endpoints Actions

### 4. Résoudre un blocage

```http
POST /api/bmo/blocked/:id/resolve
```

**Body:**
```json
{
  "resolution": "Signatures obtenues. Validation effectuée.",
  "notes": "Notes internes optionnelles",
  "templateId": "TPL-001",
  "documentIds": ["DOC-789"]
}
```

**Response 200:**
```json
{
  "success": true,
  "dossierId": "BLK-001",
  "resolvedAt": "2026-01-10T15:45:00Z",
  "resolvedBy": "A. DIALLO",
  "auditId": "AUD-RES-123456"
}
```

---

### 5. Escalader au CODIR

```http
POST /api/bmo/blocked/:id/escalate
```

**Body:**
```json
{
  "reason": "Dépassement SLA critique - 18 jours",
  "urgency": "critical",
  "targetRole": "CODIR",
  "targetUser": "USR-CODIR-001",
  "deadline": "2026-01-12T18:00:00Z"
}
```

**Response 200:**
```json
{
  "success": true,
  "dossierId": "BLK-001",
  "escalatedAt": "2026-01-10T15:45:00Z",
  "escalatedBy": "A. DIALLO",
  "notificationSent": true,
  "auditId": "AUD-ESC-123456"
}
```

---

### 6. Substitution BMO

```http
POST /api/bmo/blocked/:id/substitute
```

**Body:**
```json
{
  "action": "validation_forced",
  "justification": "Pouvoir de substitution BMO exercé suite à absence prolongée du bureau DT (21 jours)",
  "sha256Hash": "abc123def456...",
  "overriddenBureau": "DT",
  "notifyOriginalBureau": true
}
```

**Response 200:**
```json
{
  "success": true,
  "dossierId": "BLK-001",
  "substitutedAt": "2026-01-10T15:45:00Z",
  "substitutedBy": "A. DIALLO",
  "hash": "SHA-256:abc123def456...",
  "auditId": "AUD-SUB-123456",
  "traceabilityVerified": true
}
```

---

### 7. Réassigner

```http
POST /api/bmo/blocked/:id/reassign
```

**Body:**
```json
{
  "targetBureau": "DAF",
  "targetUser": "USR-DAF-001",
  "notes": "Réassignation car compétence DAF requise",
  "deadline": "2026-01-15T18:00:00Z"
}
```

---

### 8. Ajouter un commentaire

```http
POST /api/bmo/blocked/:id/comment
```

**Body:**
```json
{
  "content": "En attente de la réponse du fournisseur",
  "visibility": "shared",
  "mentionedUsers": ["USR-002", "USR-003"]
}
```

**Response 200:**
```json
{
  "success": true,
  "commentId": "COM-789",
  "createdAt": "2026-01-10T15:45:00Z"
}
```

---

### 9. Upload documents

```http
POST /api/bmo/blocked/:id/documents
```

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file`: File (multiple autorisés)
- `description`: string (optionnel)
- `category`: string (optionnel)

**Response 200:**
```json
{
  "success": true,
  "documents": [
    {
      "id": "DOC-890",
      "filename": "justificatif.pdf",
      "size": 1048576,
      "uploadedAt": "2026-01-10T15:45:00Z"
    }
  ]
}
```

---

## 📦 Actions en lot

### 10. Escalade massive

```http
POST /api/bmo/blocked/bulk/escalate
```

**Body:**
```json
{
  "dossierIds": ["BLK-001", "BLK-002", "BLK-003"],
  "reason": "Dépassement SLA - Escalade groupée",
  "urgency": "high",
  "targetRole": "CODIR"
}
```

**Response 200:**
```json
{
  "success": true,
  "batchId": "BATCH-ESC-123456",
  "count": 3,
  "escalatedIds": ["BLK-001", "BLK-002", "BLK-003"],
  "failed": []
}
```

---

### 11. Résolution massive

```http
POST /api/bmo/blocked/bulk/resolve
```

**Body:**
```json
{
  "dossierIds": ["BLK-004", "BLK-005"],
  "resolution": "Résolution groupée suite à décision CODIR",
  "templateId": "TPL-001"
}
```

---

### 12. Réassignation massive

```http
POST /api/bmo/blocked/bulk/reassign
```

**Body:**
```json
{
  "dossierIds": ["BLK-006", "BLK-007"],
  "targetBureau": "DF",
  "notes": "Réassignation suite à réorganisation"
}
```

---

## 📊 Exports & Rapports

### 13. Export données

```http
GET /api/bmo/blocked/export
```

**Query Parameters:**
| Paramètre | Description |
|-----------|-------------|
| `format` | json / csv / xlsx / pdf |
| `impact` | Filtre impact |
| `bureau` | Filtre bureau |
| `dateFrom` | Date début |
| `dateTo` | Date fin |

**Response 200:**
- Content-Type selon le format
- Content-Disposition: `attachment; filename="blocked-export-{date}.{ext}"`

---

### 14. Rapports programmés

```http
GET /api/bmo/blocked/reports/scheduled
```

**Response 200:**
```json
{
  "reports": [
    {
      "id": "RPT-001",
      "name": "Rapport quotidien - Critiques",
      "frequency": "daily",
      "time": "08:00",
      "recipients": ["dg@company.sn"],
      "format": "pdf",
      "enabled": true,
      "nextRun": "2026-01-11T08:00:00Z"
    }
  ]
}
```

```http
POST /api/bmo/blocked/reports/scheduled
```

**Body:**
```json
{
  "name": "Rapport hebdomadaire",
  "frequency": "weekly",
  "dayOfWeek": 1,
  "time": "09:00",
  "recipients": ["dg@company.sn", "daf@company.sn"],
  "format": "excel",
  "filters": { "impact": "critical" },
  "includeGraphs": true,
  "includeDetails": true
}
```

```http
POST /api/bmo/blocked/reports/generate-now
```

**Body:**
```json
{
  "reportId": "RPT-001"
}
```

---

## 🔍 Audit & Historique

### 15. Journal d'audit

```http
GET /api/bmo/blocked/audit
```

**Query Parameters:**
- `dossierId`: Filtrer par dossier
- `action`: Type d'action
- `userId`: Filtrer par utilisateur
- `dateFrom` / `dateTo`: Plage de dates
- `limit`: Nombre d'entrées

**Response 200:**
```json
{
  "entries": [
    {
      "id": "AUD-001",
      "at": "2026-01-10T15:45:00Z",
      "action": "escalation",
      "dossierId": "BLK-001",
      "dossierSubject": "Validation budget",
      "userId": "USR-001",
      "userName": "A. DIALLO",
      "userRole": "Directeur Général",
      "details": "Escalade au CODIR",
      "hash": "SHA-256:abc123...",
      "metadata": {}
    }
  ],
  "total": 523
}
```

---

### 16. Historique d'un dossier

```http
GET /api/bmo/blocked/:id/history
```

**Response 200:**
```json
{
  "history": [
    {
      "at": "2026-01-10T15:45:00Z",
      "action": "escalated",
      "by": "A. DIALLO",
      "details": "Escalade au CODIR",
      "changes": {
        "status": { "before": "pending", "after": "escalated" },
        "assignedTo": { "before": "DT", "after": "CODIR" }
      }
    }
  ]
}
```

---

## 🔔 WebSocket

### Connexion

```
ws://api.company.sn/ws/bmo/blocked
```

**Authentification:**
Envoyer après connexion:
```json
{
  "type": "auth",
  "token": "Bearer {jwt}",
  "userId": "USR-001"
}
```

**Events reçus:**

1. **Nouveau blocage**
```json
{
  "type": "new_blocking",
  "data": {
    "dossier": { /* BlockedDossier */ },
    "createdBy": "M. SECK",
    "timestamp": "2026-01-10T16:00:00Z"
  }
}
```

2. **Alerte SLA**
```json
{
  "type": "sla_breach",
  "data": {
    "dossierId": "BLK-001",
    "dossierSubject": "...",
    "impact": "critical",
    "daysOverdue": 18,
    "severity": "critical",
    "timestamp": "2026-01-10T16:00:00Z"
  }
}
```

3. **Résolution**
```json
{
  "type": "resolution",
  "data": {
    "dossierId": "BLK-001",
    "dossierSubject": "...",
    "resolvedBy": "A. DIALLO",
    "method": "substitution",
    "timestamp": "2026-01-10T16:00:00Z"
  }
}
```

4. **Escalade**
```json
{
  "type": "escalation",
  "data": {
    "dossierId": "BLK-001",
    "dossierSubject": "...",
    "escalatedBy": "A. DIALLO",
    "escalatedTo": "CODIR",
    "reason": "...",
    "timestamp": "2026-01-10T16:00:00Z"
  }
}
```

**Heartbeat:**
```json
{ "type": "ping" }  // Client → Server
{ "type": "pong" }  // Server → Client
```

---

## 🔐 Sécurité

### Permissions requises

| Endpoint | Permission |
|----------|------------|
| GET liste/détail | `blocked:read` |
| POST resolve | `blocked:resolve` |
| POST escalate | `blocked:escalate` |
| POST substitute | `bmo:substitute` (BMO uniquement) |
| POST bulk actions | `blocked:bulk_action` |
| POST reports | `blocked:reports` |

### Rate Limiting

- Endpoints lecture: 100 req/min
- Endpoints écriture: 30 req/min
- WebSocket messages: 50 msg/min

---

## 📝 Notes d'implémentation

1. **Traçabilité SHA-256:** Toutes les actions critiques (substitution, escalade, résolution) doivent générer un hash SHA-256 pour audit immuable.

2. **Notifications:** Les événements WebSocket doivent déclencher des notifications par email pour les utilisateurs configurés.

3. **Cache:** Implémenter un cache Redis pour les stats (TTL: 5 min).

4. **Queue:** Utiliser une queue (RabbitMQ/Bull) pour les actions en lot et envoi de rapports.

5. **Logs:** Toutes les actions doivent être loggées dans un système centralisé (ELK/Datadog).

---

**Version:** 1.0  
**Dernière mise à jour:** 10 janvier 2026

