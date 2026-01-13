# API Analytics - Documentation Backend

## Vue d'ensemble

Cette documentation décrit les endpoints API nécessaires pour le module Analytics. Le frontend utilise ces endpoints via le client API (`analyticsClient.ts`) et les hooks React Query (`useAnalytics.ts`).

## Base URL

```
/api/analytics
```

## Authentication

Tous les endpoints requièrent une authentification JWT dans le header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Dashboard

#### GET `/api/analytics/dashboard`

Récupère les données du dashboard principal.

**Query Parameters:**
- `bureauId` (optional): Filter by bureau ID
- `period` (optional): `day` | `week` | `month` | `quarter` | `year`

**Response:**
```json
{
  "stats": {
    "totalKPIs": 24,
    "avgPerformance": 87.5,
    "totalAlerts": 8,
    "resolvedAlerts": 45,
    "activeReports": 12
  },
  "recentActivity": [
    {
      "id": "1",
      "type": "alert" | "report" | "kpi_update",
      "title": "string",
      "timestamp": "ISO date",
      "userId": "string"
    }
  ]
}
```

---

### 2. KPIs

#### GET `/api/analytics/kpis`

Liste tous les KPIs.

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): `success` | `warning` | `critical`
- `bureauId` (optional): Filter by bureau

**Response:**
```json
{
  "kpis": [
    {
      "id": "string",
      "name": "string",
      "category": "operational" | "financial" | "quality" | "compliance",
      "value": number,
      "unit": "string",
      "target": number,
      "current": number,
      "status": "success" | "warning" | "critical",
      "trend": "up" | "down" | "stable",
      "lastUpdate": "ISO date"
    }
  ],
  "total": number
}
```

#### GET `/api/analytics/kpis/:id`

Récupère un KPI spécifique avec son historique.

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "category": "string",
  "value": number,
  "unit": "string",
  "target": number,
  "history": [
    {
      "date": "ISO date",
      "value": number
    }
  ],
  "metadata": {
    "description": "string",
    "formula": "string",
    "threshold": {
      "warning": number,
      "critical": number
    }
  }
}
```

---

### 3. Alertes

#### GET `/api/analytics/alerts`

Liste toutes les alertes.

**Query Parameters:**
- `status` (optional): `active` | `resolved` | `snoozed`
- `severity` (optional): `low` | `medium` | `high` | `critical`
- `bureauId` (optional): Filter by bureau
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "alerts": [
    {
      "id": "string",
      "title": "string",
      "message": "string",
      "severity": "low" | "medium" | "high" | "critical",
      "status": "active" | "resolved" | "snoozed",
      "kpiId": "string",
      "bureauId": "string",
      "createdAt": "ISO date",
      "resolvedAt": "ISO date | null",
      "assignedTo": "string | null"
    }
  ],
  "total": number,
  "unreadCount": number
}
```

#### POST `/api/analytics/alerts/:id/resolve`

Marque une alerte comme résolue.

**Body:**
```json
{
  "resolution": "string",
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "alert": {
    "id": "string",
    "status": "resolved",
    "resolvedAt": "ISO date",
    "resolvedBy": "string"
  }
}
```

---

### 4. Rapports

#### GET `/api/analytics/reports`

Liste tous les rapports.

**Query Parameters:**
- `type` (optional): `weekly` | `monthly` | `quarterly` | `custom`
- `status` (optional): `draft` | `published` | `archived`
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "reports": [
    {
      "id": "string",
      "title": "string",
      "type": "weekly" | "monthly" | "quarterly" | "custom",
      "status": "draft" | "published" | "archived",
      "createdAt": "ISO date",
      "createdBy": "string",
      "bureauId": "string | null",
      "fileUrl": "string | null"
    }
  ],
  "total": number
}
```

#### POST `/api/analytics/reports`

Crée un nouveau rapport.

**Body:**
```json
{
  "title": "string",
  "type": "weekly" | "monthly" | "quarterly" | "custom",
  "bureauId": "string (optional)",
  "dateRange": {
    "from": "ISO date",
    "to": "ISO date"
  },
  "includeKPIs": ["kpiId1", "kpiId2"],
  "includeCharts": boolean,
  "format": "pdf" | "excel" | "csv"
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "string",
  "status": "processing",
  "estimatedTime": "string"
}
```

---

### 5. Tendances

#### GET `/api/analytics/trends`

Récupère les tendances des KPIs.

**Query Parameters:**
- `period` (optional): `7d` | `30d` | `90d` | `1y`
- `kpiIds` (optional): Comma-separated list of KPI IDs
- `bureauId` (optional): Filter by bureau

**Response:**
```json
{
  "trends": [
    {
      "id": "string",
      "kpiId": "string",
      "metric": "string",
      "current": number,
      "previous": number,
      "trend": "up" | "down" | "stable",
      "changePercent": number,
      "unit": "string",
      "period": "string"
    }
  ]
}
```

---

### 6. Performance des Bureaux

#### GET `/api/analytics/bureaux/performance`

Récupère les statistiques de performance par bureau.

**Query Parameters:**
- `period` (optional): Time period
- `metric` (optional): Specific metric to retrieve

**Response:**
```json
{
  "bureaux": [
    {
      "id": "string",
      "name": "string",
      "code": "string",
      "performance": {
        "overall": number,
        "kpiCount": number,
        "alertCount": number,
        "complianceRate": number
      },
      "topKPIs": [
        {
          "id": "string",
          "name": "string",
          "value": number,
          "status": "string"
        }
      ]
    }
  ]
}
```

---

### 7. Comparaisons

#### GET `/api/analytics/comparison`

Compare les performances entre bureaux ou périodes.

**Query Parameters:**
- `type`: `bureaux` | `periods`
- `bureauIds`: Comma-separated list (for bureaux comparison)
- `periods`: Comma-separated list (for period comparison)
- `metrics`: Comma-separated list of metrics to compare

**Response:**
```json
{
  "comparisonType": "bureaux" | "periods",
  "data": [
    {
      "label": "string",
      "metrics": {
        "metricName": number
      }
    }
  ],
  "summary": {
    "best": "string",
    "worst": "string",
    "average": number
  }
}
```

---

### 8. Export

#### POST `/api/analytics/export`

Exporte des données analytics.

**Body:**
```json
{
  "format": "excel" | "csv" | "pdf" | "json",
  "scope": "kpis" | "alerts" | "reports" | "dashboard" | "all",
  "filters": {
    "bureauId": "string (optional)",
    "dateRange": {
      "from": "ISO date",
      "to": "ISO date"
    },
    "categories": ["string"]
  },
  "options": {
    "includeCharts": boolean,
    "includeRawData": boolean,
    "compression": boolean
  }
}
```

**Response:**
```json
{
  "success": true,
  "exportId": "string",
  "status": "processing",
  "downloadUrl": "string (when ready)",
  "expiresAt": "ISO date"
}
```

#### GET `/api/analytics/export/:exportId`

Vérifie le statut d'un export.

**Response:**
```json
{
  "id": "string",
  "status": "processing" | "completed" | "failed",
  "downloadUrl": "string | null",
  "error": "string | null",
  "createdAt": "ISO date",
  "expiresAt": "ISO date"
}
```

---

### 9. Statistiques

#### GET `/api/analytics/stats`

Récupère les statistiques globales.

**Query Parameters:**
- `period` (optional): Time period
- `bureauId` (optional): Filter by bureau

**Response:**
```json
{
  "period": "string",
  "bureauId": "string | null",
  "stats": {
    "totalKPIs": number,
    "activeAlerts": number,
    "resolvedAlerts": number,
    "avgPerformance": number,
    "complianceRate": number,
    "trendsPositive": number,
    "trendsNegative": number,
    "reportsGenerated": number
  },
  "charts": {
    "performanceOverTime": [
      {
        "date": "ISO date",
        "value": number
      }
    ],
    "alertsByType": [
      {
        "type": "string",
        "count": number
      }
    ]
  }
}
```

---

### 10. Temps Réel (Server-Sent Events)

#### GET `/api/analytics/realtime`

Connexion SSE pour les notifications en temps réel.

**Headers:**
```
Accept: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Event Types:**
- `kpi_update`: Un KPI a été mis à jour
- `alert_new`: Nouvelle alerte créée
- `alert_resolved`: Alerte résolue
- `report_completed`: Rapport généré
- `export_ready`: Export prêt au téléchargement
- `data_refresh`: Données rafraîchies
- `system_notification`: Notification système

**Event Format:**
```
event: kpi_update
data: {"id": "kpi123", "name": "Performance", "value": 92, "timestamp": "ISO date"}

event: alert_new
data: {"id": "alert456", "severity": "high", "title": "Budget exceeded", "timestamp": "ISO date"}
```

---

## Error Responses

Tous les endpoints peuvent retourner les erreurs suivantes:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid parameters",
  "details": {}
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- Standard endpoints: 100 requests/minute per user
- Export endpoints: 10 requests/minute per user
- Realtime SSE: 1 connection per user

---

## Webhooks (Optional)

Le système peut envoyer des webhooks pour certains événements:

### POST `{webhook_url}`

**Events:**
- `alert.created`
- `alert.resolved`
- `kpi.threshold_exceeded`
- `report.completed`
- `export.ready`

**Payload:**
```json
{
  "event": "string",
  "timestamp": "ISO date",
  "data": {}
}
```

---

## Notes d'implémentation

### Pagination

Tous les endpoints listant des ressources supportent la pagination:
- `limit`: Nombre max de résultats (default: 50, max: 100)
- `offset`: Offset pour la pagination (default: 0)

### Filtres

Les filtres peuvent être combinés avec `&`:
```
GET /api/analytics/kpis?category=operational&status=warning&bureauId=b123
```

### Date Format

Toutes les dates utilisent le format ISO 8601:
```
2026-01-10T14:30:00.000Z
```

### Caching

- Dashboard: Cache de 5 minutes
- KPIs: Cache de 2 minutes
- Reports: Cache de 1 heure
- Stats: Cache de 10 minutes

Headers de cache:
```
Cache-Control: public, max-age=300
ETag: "hash"
```

---

## Tests

### Exemple cURL

```bash
# Get KPIs
curl -X GET "http://localhost:3000/api/analytics/kpis" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Create Report
curl -X POST "http://localhost:3000/api/analytics/reports" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Monthly Report",
    "type": "monthly",
    "dateRange": {
      "from": "2026-01-01T00:00:00.000Z",
      "to": "2026-01-31T23:59:59.999Z"
    },
    "format": "pdf"
  }'
```

---

## Changelog

### Version 1.0 (2026-01-10)
- Initial API specification
- Support for KPIs, Alerts, Reports, Trends
- Real-time notifications via SSE
- Export functionality
- Bureau performance metrics

