# 🚀 CALENDRIER - GUIDE DE DÉMARRAGE RAPIDE

## ⚡ Installation en 5 Minutes

### Étape 1: Migrer la base de données

```bash
# Dans le terminal, à la racine du projet
npx prisma migrate dev --name add_calendar_system
npx prisma generate
```

### Étape 2: Créer quelques événements de test

```bash
# Lancer le serveur de développement (si pas déjà lancé)
npm run dev
```

Ouvrir votre navigateur sur `http://localhost:3000/maitre-ouvrage/calendrier`

---

## 🧪 Tests API Rapides

### 1. Créer un événement

```bash
curl -X POST http://localhost:3000/api/calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Réunion test",
    "kind": "meeting",
    "bureau": "DAKAR",
    "start": "2025-01-15T09:00:00Z",
    "end": "2025-01-15T10:00:00Z",
    "priority": "normal",
    "assignees": [
      {"id": "user1", "name": "Marie Diop"}
    ]
  }'
```

### 2. Obtenir les événements

```bash
# Tous les événements
curl http://localhost:3000/api/calendar/events

# Événements de cette semaine
curl http://localhost:3000/api/calendar/events?queue=week

# Événements d'un bureau
curl http://localhost:3000/api/calendar/events?bureau=DAKAR
```

### 3. Obtenir les statistiques

```bash
curl http://localhost:3000/api/calendar/stats?bureau=DAKAR
```

### 4. Détecter les conflits

```bash
curl http://localhost:3000/api/calendar/conflicts?bureau=DAKAR
```

### 5. Exporter

```bash
# iCal
curl http://localhost:3000/api/calendar/export?format=ical > calendrier.ics

# CSV
curl http://localhost:3000/api/calendar/export?format=csv > calendrier.csv

# JSON
curl http://localhost:3000/api/calendar/export?format=json > calendrier.json
```

---

## 💡 Exemples d'Utilisation

### Créer un événement récurrent (hebdomadaire)

```typescript
const event = await fetch('/api/calendar/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Réunion d\'équipe hebdomadaire',
    kind: 'meeting',
    bureau: 'DAKAR',
    start: '2025-01-13T09:00:00Z',
    end: '2025-01-13T10:00:00Z',
    priority: 'normal',
    location: 'Salle A',
    assignees: [
      { id: 'user1', name: 'Marie' },
      { id: 'user2', name: 'Amadou' }
    ],
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: ['MON'],
      endDate: '2025-06-30T00:00:00Z'
    }
  })
});

const result = await event.json();
console.log(`✅ ${result.data.recurringCount} événements créés`);
```

### Utiliser le service SLA

```typescript
import CalendarSLAService from '@/lib/services/calendarSLA';

// Calculer SLA pour un événement
const sla = CalendarSLAService.getInstance().calculate(event);

if (sla.status === 'overdue') {
  console.log(`🔴 SLA dépassé de ${sla.daysOverdue} jours`);
  console.log(`Action: ${sla.recommendation}`);
} else if (sla.status === 'warning') {
  console.log(`⚠️ ${sla.remainingHours}h restantes`);
} else {
  console.log(`✅ Dans les délais (${sla.remainingDays} jours)`);
}

// Obtenir tous les événements en retard
const overdueEvents = await CalendarSLAService.getInstance()
  .getOverdueEvents('DAKAR');

console.log(`${overdueEvents.length} événement(s) en retard`);
```

### Détecter et résoudre des conflits

```typescript
import CalendarConflictService from '@/lib/services/calendarConflicts';

// Vérifier avant de créer
const check = await CalendarConflictService.getInstance()
  .checkNewEvent(eventData);

if (check.hasConflicts) {
  console.log(`⚠️ ${check.conflicts.length} conflit(s) détecté(s)`);
  
  check.conflicts.forEach(conflict => {
    console.log(`\n${conflict.type.toUpperCase()}: ${conflict.description}`);
    console.log(`Sévérité: ${conflict.severity}`);
    console.log(`Impact: ${conflict.impact}`);
    console.log(`\nRésolutions suggérées:`);
    conflict.suggestedResolutions.forEach((res, i) => {
      console.log(`  ${i+1}. ${res.description} (${res.estimatedEffort})`);
    });
  });
  
  if (!check.canProceed) {
    throw new Error('Conflits critiques empêchent la création');
  }
}
```

### Envoyer des notifications

```typescript
import { 
  notifyEventCreated, 
  notifySLAOverdue,
  notifyEventRescheduled 
} from '@/lib/services/calendarNotifications';

// Notifier création
await notifyEventCreated(event, 'admin1', 'Admin');

// Notifier SLA dépassé
await notifySLAOverdue(event);

// Notifier reprogrammation
await notifyEventRescheduled(
  event,
  oldStart,
  oldEnd,
  'user1',
  'Marie Diop'
);
```

### Vérifier les permissions

```typescript
import CalendarPermissionService from '@/lib/services/calendarPermissions';

const service = CalendarPermissionService.getInstance();
const user = {
  id: 'user1',
  name: 'Marie Diop',
  role: 'manager',
  bureaux: ['DAKAR', 'THIES']
};

// Vérifier si peut créer
if (service.canCreateEvent(user, { bureau: 'DAKAR' })) {
  // Créer l'événement
}

// Vérifier si peut modifier
if (service.canUpdateEvent(user, event)) {
  // Modifier l'événement
}

// Filtrer événements visibles
const visibleEvents = service.filterEventsByPermissions(user, allEvents);
```

### Consulter l'audit trail

```typescript
import CalendarAuditService from '@/lib/services/calendarAudit';

const service = CalendarAuditService.getInstance();

// Historique d'un événement
const history = await service.getEventHistory(eventId);

history.forEach(entry => {
  console.log(`[${entry.createdAt}] ${entry.action}`);
  console.log(`  Par: ${entry.actorName}`);
  if (entry.details) {
    console.log(`  Détails:`, JSON.parse(entry.details));
  }
});

// Actions d'un utilisateur
const userActions = await service.getUserActions('user1', 20);

// Générer rapport
const report = await service.generateReport({
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31')
});

console.log(`Total actions: ${report.totalEntries}`);
console.log(`Top acteurs:`, report.topActors);
```

---

## 🎨 Intégration Frontend

### Dans un composant React

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function CalendarStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calendar/stats?bureau=DAKAR')
      .then(r => r.json())
      .then(data => {
        setStats(data.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="card">
        <h3>Aujourd'hui</h3>
        <p className="text-3xl font-bold">{stats.overview.today}</p>
      </div>
      
      <div className="card">
        <h3>Cette semaine</h3>
        <p className="text-3xl font-bold">{stats.overview.thisWeek}</p>
      </div>
      
      <div className="card">
        <h3>SLA dépassés</h3>
        <p className="text-3xl font-bold text-red-600">
          {stats.overview.overdueSLA}
        </p>
      </div>
      
      <div className="card">
        <h3>Conflits</h3>
        <p className="text-3xl font-bold text-orange-600">
          {stats.overview.conflicts}
        </p>
      </div>
    </div>
  );
}
```

---

## 📋 Checklist de Vérification

Après installation, vérifier que tout fonctionne :

- [ ] ✅ Base de données migrée (`npx prisma migrate dev`)
- [ ] ✅ Serveur lancé (`npm run dev`)
- [ ] ✅ Page calendrier accessible (`/maitre-ouvrage/calendrier`)
- [ ] ✅ API events répond (`GET /api/calendar/events`)
- [ ] ✅ API stats répond (`GET /api/calendar/stats`)
- [ ] ✅ Création événement fonctionne (`POST /api/calendar/events`)
- [ ] ✅ Export iCal fonctionne (`GET /api/calendar/export?format=ical`)
- [ ] ✅ Détection conflits fonctionne (`GET /api/calendar/conflicts`)

---

## 🐛 Dépannage

### Erreur: Cannot find module '@prisma/client'

```bash
npx prisma generate
```

### Erreur: Table does not exist

```bash
npx prisma migrate reset
npx prisma migrate dev
```

### API retourne 404

Vérifier que le serveur est bien lancé sur le bon port :
```bash
npm run dev
# Devrait afficher: Local: http://localhost:3000
```

### Pas de données dans les stats

Créer quelques événements de test d'abord :
```bash
# Utiliser l'exemple curl ci-dessus
```

---

## 📚 Documentation Complète

Pour plus de détails, consulter :

- **`CALENDRIER_API_COMPLETE.md`** - Documentation API complète
- **`CALENDRIER_AMELIORATIONS_FINALES.md`** - Récapitulatif des fonctionnalités
- **Code source** - Tous les fichiers sont commentés

---

## 🎉 Vous êtes prêt !

Le système calendrier est maintenant opérationnel. Commencez par :

1. Créer quelques événements via l'interface ou l'API
2. Consulter les stats en temps réel
3. Tester l'export iCal
4. Explorer les détections de conflits

**Bon développement ! 🚀**

---

**Questions ?** Consultez la documentation complète ou le code source.

