# 📅 SYSTÈME CALENDRIER COMPLET - DOCUMENTATION API

## 📑 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [API Routes](#api-routes)
3. [Services métier](#services-métier)
4. [Schéma de données](#schéma-de-données)
5. [Fonctionnalités avancées](#fonctionnalités-avancées)
6. [Guide d'utilisation](#guide-dutilisation)

---

## 🎯 Vue d'ensemble

Le système de calendrier est une solution complète de gestion d'événements pour le Bureau Maître d'Ouvrage (BMO), intégrant :

- ✅ **API RESTful complète** - CRUD + fonctionnalités avancées
- ✅ **Gestion des conflits** - Détection intelligente et résolutions suggérées
- ✅ **SLA automatique** - Calcul avec jours ouvrés et jours fériés
- ✅ **Notifications temps réel** - Email, push, SMS, webhooks
- ✅ **Récurrence d'événements** - Daily, weekly, monthly, yearly
- ✅ **Permissions RBAC** - 6 rôles avec permissions granulaires
- ✅ **Audit trail complet** - Traçabilité de toutes les actions
- ✅ **Export multi-format** - iCal, CSV, JSON, PDF

---

## 🔌 API Routes

### 1. Events - CRUD Complet

#### **GET /api/calendar/events**
Liste des événements avec filtres avancés.

**Query Parameters:**
```typescript
{
  queue?: 'today' | 'week' | 'month' | 'overdue' | 'conflicts' | 'completed' | 'all',
  bureau?: string,
  kind?: string,
  priority?: string,
  status?: string,
  assignee?: string,
  startDate?: string,
  endDate?: string,
  search?: string,
  page?: number,
  limit?: number
}
```

**Response:**
```typescript
{
  success: true,
  data: CalendarEvent[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

**Exemple:**
```bash
GET /api/calendar/events?queue=week&bureau=DAKAR&limit=20
```

---

#### **POST /api/calendar/events**
Création d'un événement.

**Body:**
```typescript
{
  title: string,
  description?: string,
  kind: 'meeting' | 'site-visit' | 'validation' | 'payment' | 'contract' | 'deadline' | 'absence' | 'other',
  bureau?: string,
  start: string, // ISO datetime
  end: string,
  priority: 'normal' | 'urgent' | 'critical',
  status?: 'open' | 'done' | 'snoozed' | 'ack' | 'blocked',
  project?: string,
  slaDueAt?: string,
  assignees?: Array<{
    id: string,
    name: string
  }>,
  linkedTo?: {
    type: string,
    id: string,
    label?: string
  },
  location?: string,
  equipment?: string,
  budget?: number,
  notes?: string,
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
    interval: number,
    endDate?: string,
    count?: number
  }
}
```

**Vérifications automatiques:**
- ✅ Détection de conflits (personnes, ressources, lieux)
- ✅ Calcul automatique du SLA
- ✅ Notifications aux participants
- ✅ Audit trail

**Response (201):**
```typescript
{
  success: true,
  data: CalendarEvent,
  message: "Événement créé avec succès"
}
```

**Response (409) - Conflit détecté:**
```typescript
{
  success: false,
  error: "Conflit détecté",
  conflicts: ConflictDetails[],
  suggestion: "Voulez-vous créer quand même ?"
}
```

---

#### **GET /api/calendar/events/[id]**
Détails complets d'un événement.

**Response:**
```typescript
{
  success: true,
  data: {
    ...CalendarEvent,
    slaStatus: {
      status: 'ok' | 'warning' | 'overdue' | 'none',
      remainingDays?: number,
      daysOverdue?: number,
      recommendation: string
    },
    conflicts: ConflictDetails[]
  }
}
```

---

#### **PATCH /api/calendar/events/[id]**
Mise à jour d'un événement.

**Body:** (tous les champs optionnels)
```typescript
{
  title?: string,
  description?: string,
  start?: string,
  end?: string,
  priority?: string,
  status?: string,
  // ... autres champs
  actorId?: string,
  actorName?: string,
  reason?: string // Pour l'audit
}
```

**Vérifications:**
- ✅ Détection de conflits si dates modifiées
- ✅ Notifications si reprogrammation
- ✅ Audit automatique des changements

---

#### **DELETE /api/calendar/events/[id]**
Suppression (soft ou hard) d'un événement.

**Body:**
```typescript
{
  actorId: string,
  actorName: string,
  reason: string,
  hard?: boolean // true = suppression définitive, false = soft delete
}
```

---

### 2. Stats - Statistiques Temps Réel

#### **GET /api/calendar/stats**
Statistiques complètes du calendrier.

**Query Parameters:**
```typescript
{
  bureau?: string,
  startDate?: string,
  endDate?: string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    overview: {
      total: number,
      today: number,
      thisWeek: number,
      thisMonth: number,
      overdueSLA: number,
      conflicts: number,
      completed: number,
      active: number
    },
    distribution: {
      byKind: Record<string, number>,
      byBureau: Record<string, number>,
      byPriority: Record<string, number>,
      byStatus: Record<string, number>
    },
    performance: {
      avgCompletionTime: number, // heures
      slaCompliance: number // pourcentage
    },
    trends: {
      currentWeek: number,
      previousWeek: number,
      change: number,
      direction: 'up' | 'down' | 'stable'
    },
    topParticipants: Array<{
      id: string,
      name: string,
      eventsCount: number
    }>,
    timestamp: string
  }
}
```

---

### 3. Conflicts - Gestion des Conflits

#### **GET /api/calendar/conflicts**
Détection de tous les conflits.

**Query Parameters:**
```typescript
{
  bureau?: string,
  userId?: string,
  startDate?: string,
  endDate?: string,
  severity?: 'high' | 'medium' | 'low'
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    conflicts: Array<{
      id: string,
      type: 'scheduling' | 'resource' | 'location',
      severity: 'high' | 'medium' | 'low',
      event1: CalendarEvent,
      event2: CalendarEvent,
      overlappingUsers: Array<{ id: string, name: string }>,
      overlappingTime: {
        start: Date,
        end: Date,
        durationMinutes: number
      },
      impact: string,
      suggestedResolutions: Array<{
        type: string,
        description: string,
        priority: number
      }>
    }>,
    total: number,
    grouped: {
      scheduling: { count: number, conflicts: [] },
      resource: { count: number, conflicts: [] },
      location: { count: number, conflicts: [] }
    },
    recommendations: string[]
  }
}
```

---

#### **POST /api/calendar/conflicts/resolve**
Résoudre un conflit.

**Body:**
```typescript
{
  conflictId: string,
  resolution: 'reschedule_first' | 'reschedule_second' | 'merge' | 'cancel_first' | 'cancel_second' | 'ignore',
  newTime?: {
    start: string,
    end: string
  },
  actorId: string,
  actorName: string,
  notes?: string
}
```

---

### 4. Export - Multi-format

#### **GET /api/calendar/export**
Export du calendrier.

**Query Parameters:**
```typescript
{
  format: 'ical' | 'csv' | 'json' | 'pdf',
  bureau?: string,
  startDate?: string,
  endDate?: string,
  kind?: string,
  status?: string,
  includeCompleted?: boolean
}
```

**Formats supportés:**

1. **iCal (.ics)** - Compatible Outlook, Google Calendar, Apple Calendar
2. **CSV (.csv)** - Import Excel, Google Sheets
3. **JSON (.json)** - Intégration API
4. **PDF (HTML)** - Impression, archivage

**Exemple:**
```bash
GET /api/calendar/export?format=ical&bureau=DAKAR&startDate=2025-01-01&endDate=2025-12-31
```

---

## 🛠 Services Métier

### 1. CalendarNotificationService

Service de notifications multi-canal.

**Canaux supportés:**
- 📧 Email
- 📱 Push notifications
- 💬 SMS
- 🔗 Webhooks
- 🔔 In-app notifications

**Types de notifications:**
```typescript
type NotificationType = 
  | 'event_created'
  | 'event_updated'
  | 'event_cancelled'
  | 'event_rescheduled'
  | 'event_completed'
  | 'event_reminder'
  | 'event_conflict'
  | 'sla_warning'
  | 'sla_overdue'
  | 'participant_added'
  | 'participant_removed';
```

**Utilisation:**
```typescript
import { notifyEventCreated, notifySLAOverdue } from '@/lib/services/calendarNotifications';

// Notifier création
await notifyEventCreated(event, actorId, actorName);

// Notifier SLA dépassé
await notifySLAOverdue(event);
```

---

### 2. CalendarRecurrenceService

Gestion des événements récurrents.

**Fréquences:**
- 📅 Daily (quotidien)
- 📆 Weekly (hebdomadaire) - avec jours spécifiques
- 📅 Monthly (mensuel) - avec jour du mois
- 📆 Yearly (annuel) - avec jour et mois

**Utilisation:**
```typescript
import CalendarRecurrenceService from '@/lib/services/calendarRecurrence';

// Créer événements récurrents
const eventIds = await CalendarRecurrenceService.createRecurringEvents(
  baseEventId,
  {
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: ['MON', 'WED', 'FRI'],
    endDate: new Date('2025-12-31'),
  },
  baseEventData
);

// Obtenir prochaines occurrences
const upcoming = await CalendarRecurrenceService.getUpcomingOccurrences(eventId, 10);

// Décrire récurrence
const description = CalendarRecurrenceService.describeRecurrence(config);
// "Chaque semaine le lun, mer, ven jusqu'au 31/12/2025"
```

---

### 3. CalendarPermissionService

Système RBAC complet.

**Rôles:**
```typescript
type CalendarRole = 
  | 'admin'         // Accès complet
  | 'manager'       // Gestion bureau/projet
  | 'coordinator'   // Coordination événements
  | 'contributor'   // Création limitée
  | 'viewer'        // Lecture seule
  | 'guest';        // Accès minimal
```

**Permissions:**
- `calendar.view_all` - Voir tous les événements
- `calendar.view_own` - Voir ses propres événements
- `calendar.create` - Créer des événements
- `calendar.update_all` - Modifier tous les événements
- `calendar.delete_all` - Supprimer tous les événements
- `calendar.manage_participants` - Gérer les participants
- `calendar.export` - Exporter
- `calendar.view_stats` - Voir statistiques
- ... et plus

**Utilisation:**
```typescript
import CalendarPermissionService from '@/lib/services/calendarPermissions';

const service = CalendarPermissionService.getInstance();

// Vérifier permission
if (service.canUpdateEvent(user, event)) {
  // Autoriser modification
}

// Filtrer événements selon permissions
const visibleEvents = service.filterEventsByPermissions(user, allEvents);

// Construire filtre Prisma
const filter = service.buildPermissionFilter(user);
const events = await prisma.calendarEvent.findMany({ where: filter });
```

---

### 4. CalendarAuditService

Audit trail complet.

**Actions trackées:**
```typescript
type AuditAction =
  | 'CREATED' | 'UPDATED' | 'DELETED'
  | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED'
  | 'PARTICIPANT_ADDED' | 'PARTICIPANT_REMOVED'
  | 'STATUS_CHANGED' | 'PRIORITY_CHANGED'
  | 'VIEWED' | 'EXPORTED' | 'COMMENTED'
  | 'CONFLICT_DETECTED' | 'CONFLICT_RESOLVED'
  | 'SLA_WARNING' | 'SLA_OVERDUE';
```

**Utilisation:**
```typescript
import CalendarAuditService from '@/lib/services/calendarAudit';

const service = CalendarAuditService.getInstance();

// Enregistrer création
await service.logCreated(eventId, actorId, actorName, eventData);

// Enregistrer modification
await service.logUpdated(eventId, actorId, actorName, {
  title: { old: 'Ancien titre', new: 'Nouveau titre' },
  priority: { old: 'normal', new: 'urgent' }
});

// Obtenir historique
const history = await service.getEventHistory(eventId);

// Générer rapport
const report = await service.generateReport({
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31')
});
```

---

### 5. CalendarConflictService

Détection intelligente de conflits.

**Types de conflits:**
- 🗓️ **Scheduling** - Personne à deux endroits
- 🔧 **Resource** - Équipement indisponible
- 📍 **Location** - Salle occupée
- 💰 **Budget** - Dépassement budget
- ⚙️ **Dependency** - Dépendance non respectée
- 👥 **Capacity** - Capacité salle dépassée
- 🔒 **Authorization** - Personne non autorisée

**Utilisation:**
```typescript
import CalendarConflictService from '@/lib/services/calendarConflicts';

const service = CalendarConflictService.getInstance();

// Vérifier avant création
const result = await service.checkNewEvent(eventData);

if (result.hasConflicts) {
  console.log(`${result.conflicts.length} conflit(s) détecté(s)`);
  
  result.conflicts.forEach(conflict => {
    console.log(`- ${conflict.description}`);
    console.log(`  Impact: ${conflict.impact}`);
    console.log(`  Résolutions suggérées:`);
    conflict.suggestedResolutions.forEach(res => {
      console.log(`    ${res.priority}. ${res.description}`);
    });
  });
}

if (!result.canProceed) {
  throw new Error('Conflits critiques empêchent la création');
}

// Obtenir tous les conflits actuels
const allConflicts = await service.getAllConflicts({
  bureau: 'DAKAR',
  startDate: new Date(),
  endDate: new Date('2025-12-31')
});
```

---

### 6. CalendarSLAService

Calcul avancé des SLA.

**Configuration par type et priorité:**

| Type | Priorité | Délai |
|------|----------|-------|
| Meeting | Critical | 1 jour |
| Meeting | Urgent | 2 jours |
| Meeting | Normal | 5 jours |
| Site Visit | Critical | 2 jours |
| Validation | Critical | 1 jour |
| Payment | Normal | 15 jours |
| Contract | Urgent | 7 jours |
| Deadline | Critical | 1 jour |

**Fonctionnalités:**
- ✅ Calcul en jours ouvrés (lun-ven)
- ✅ Exclusion des jours fériés (Sénégal)
- ✅ Alertes proactives (75-85% du délai)
- ✅ Escalade automatique
- ✅ Rapports de conformité

**Utilisation:**
```typescript
import CalendarSLAService from '@/lib/services/calendarSLA';

const service = CalendarSLAService.getInstance();

// Calculer SLA
const sla = service.calculate(event);
console.log(sla.status); // 'ok' | 'warning' | 'overdue'
console.log(sla.recommendation);

// Obtenir événements en retard
const overdueEvents = await service.getOverdueEvents('DAKAR');

// Obtenir événements proche échéance
const warningEvents = await service.getWarningEvents('DAKAR', 24);

// Générer rapport conformité
const report = await service.generateComplianceReport({
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-03-31'),
  bureau: 'DAKAR'
});

console.log(`Taux de conformité: ${report.complianceRate}%`);
console.log(`Temps moyen: ${report.averageCompletionTime}h`);
console.log(`Tendance: ${report.trends.direction} (${report.trends.change}%)`);
```

---

## 📊 Schéma de Données

### CalendarEvent
```prisma
model CalendarEvent {
  id          String   @id @default(cuid())
  title       String
  description String?
  kind        String   // Type d'événement
  bureau      String?
  start       DateTime
  end         DateTime
  priority    String   @default("normal")
  status      String   @default("open")
  project     String?
  slaDueAt    DateTime?
  location    String?
  equipment   String?
  budget      Int?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  assignees    CalendarEventAssignee[]
  linkedEntity CalendarEventLink?
  recurrence   CalendarRecurrence?
  auditLogs    CalendarEventAudit[]
}
```

### CalendarEventAssignee
```prisma
model CalendarEventAssignee {
  id       String @id @default(cuid())
  eventId  String
  userId   String
  userName String
  role     String @default("participant")
  attended Int    @default(0)
  
  event CalendarEvent @relation(...)
}
```

### CalendarRecurrence
```prisma
model CalendarRecurrence {
  id          String @id @default(cuid())
  eventId     String @unique
  frequency   String
  interval    Int @default(1)
  daysOfWeek  String?
  dayOfMonth  Int?
  monthOfYear Int?
  endDate     DateTime?
  count       Int?
  exceptions  String?
  
  event CalendarEvent @relation(...)
}
```

### CalendarEventAudit
```prisma
model CalendarEventAudit {
  id        String @id @default(cuid())
  eventId   String
  action    String
  actorId   String
  actorName String
  details   String?
  createdAt DateTime @default(now())
  
  event CalendarEvent @relation(...)
}
```

---

## 🚀 Guide d'Utilisation

### Scénario 1: Créer un événement récurrent

```typescript
// 1. Préparer les données
const eventData = {
  title: 'Réunion hebdomadaire d\'équipe',
  description: 'Point hebdo sur l\'avancement',
  kind: 'meeting',
  bureau: 'DAKAR',
  start: '2025-01-13T09:00:00Z',
  end: '2025-01-13T10:00:00Z',
  priority: 'normal',
  location: 'Salle de réunion A',
  assignees: [
    { id: 'user1', name: 'Marie Diop' },
    { id: 'user2', name: 'Amadou Ba' }
  ],
  recurrence: {
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: ['MON'],
    endDate: '2025-06-30T00:00:00Z'
  }
};

// 2. Créer l'événement
const response = await fetch('/api/calendar/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(eventData)
});

const result = await response.json();

if (result.success) {
  console.log(`✅ Événement créé: ${result.data.id}`);
  console.log(`📅 ${result.data.recurringCount} occurrences créées`);
}
```

### Scénario 2: Détecter et résoudre des conflits

```typescript
// 1. Vérifier conflits avant création
const checkResponse = await fetch('/api/calendar/conflicts?userId=user1&startDate=2025-01-13&endDate=2025-01-13');
const { data } = await checkResponse.json();

if (data.conflicts.length > 0) {
  console.log(`⚠️ ${data.conflicts.length} conflit(s) détecté(s)`);
  
  // 2. Analyser et résoudre
  const conflict = data.conflicts[0];
  
  if (conflict.severity === 'low') {
    // Décalage léger
    const resolution = {
      conflictId: conflict.id,
      resolution: 'reschedule_second',
      newTime: {
        start: '2025-01-13T11:00:00Z',
        end: '2025-01-13T12:00:00Z'
      },
      actorId: 'admin1',
      actorName: 'Admin',
      notes: 'Décalage de 2h pour éviter le conflit'
    };
    
    await fetch('/api/calendar/conflicts/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolution)
    });
  }
}
```

### Scénario 3: Monitoring SLA

```typescript
// 1. Obtenir tableau de bord SLA
const stats = await fetch('/api/calendar/stats?bureau=DAKAR').then(r => r.json());

console.log(`📊 Vue d'ensemble:`);
console.log(`   - Événements en retard: ${stats.data.overview.overdueSLA}`);
console.log(`   - Conformité SLA: ${stats.data.performance.slaCompliance}%`);

// 2. Obtenir événements critiques
const overdueResponse = await fetch('/api/calendar/events?queue=overdue&bureau=DAKAR');
const { data: overdueEvents } = await overdueResponse.json();

overdueEvents.forEach(event => {
  console.log(`🔴 ${event.title}`);
  console.log(`   Retard: ${event.slaStatus.daysOverdue} jours`);
  console.log(`   Action: ${event.slaStatus.recommendation}`);
});

// 3. Générer rapport mensuel
const report = await CalendarSLAService.getInstance().generateComplianceReport({
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31'),
  bureau: 'DAKAR'
});

console.log(`\n📈 Rapport mensuel:`);
console.log(`   Taux de conformité: ${report.complianceRate}%`);
console.log(`   Temps moyen: ${report.averageCompletionTime}h`);
console.log(`   Tendance: ${report.trends.direction}`);
```

---

## 📝 Notes Importantes

### Performance
- ✅ Toutes les requêtes stats utilisent `Promise.all` pour parallélisation
- ✅ Index Prisma sur champs fréquemment filtrés
- ✅ Pagination par défaut (limit: 50)
- ✅ Caching recommandé pour stats (Redis)

### Sécurité
- 🔒 Validation Zod sur tous les endpoints
- 🔒 Permissions RBAC sur toutes les actions
- 🔒 Audit trail sur toutes les modifications
- 🔒 Rate limiting recommandé

### Prochaines étapes
- [ ] Intégration email réelle (SendGrid/AWS SES)
- [ ] Intégration push (Firebase Cloud Messaging)
- [ ] Webhooks configurables par bureau
- [ ] Caching Redis pour stats
- [ ] WebSocket pour notifications temps réel
- [ ] Calendrier partagé inter-bureaux
- [ ] Synchronisation avec Google Calendar/Outlook

---

## 🆘 Support

Pour toute question ou problème :
- 📧 Email: support@bmo.sn
- 📖 Documentation complète: `/docs`
- 🐛 Issues: GitHub

---

**Version**: 1.0.0  
**Date**: 9 Janvier 2025  
**Auteur**: Équipe BMO Digital

