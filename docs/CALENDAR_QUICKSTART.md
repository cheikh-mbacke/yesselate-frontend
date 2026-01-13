# Guide d'intégration Calendrier - Quick Start

## 🚀 Mise en route (5 minutes)

### 1. Installation des dépendances

```bash
# Déjà installées dans le projet
npm install zustand
npm install react-hotkeys-hook
npm install lucide-react
npm install date-fns  # optionnel pour manipulation dates
```

### 2. Accéder au module

```
URL: http://localhost:3000/maitre-ouvrage/calendrier
```

### 3. Structure des données

```typescript
// Événement minimal
{
  title: string;        // Requis
  start: Date | string; // Requis
  end: Date | string;   // Requis
  category?: 'meeting' | 'site_visit' | 'deadline' | ...;
  priority?: 'critical' | 'urgent' | 'high' | 'normal' | 'low';
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  location?: string;
  bureau?: string;
  attendees?: Array<{ name: string; email?: string; role?: string }>;
}
```

## 📝 Exemples d'utilisation

### Créer un événement (API)

```typescript
// POST /api/calendar/events
const response = await fetch('/api/calendar/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Réunion de suivi',
    description: 'Point hebdomadaire équipe',
    start: '2026-01-15T10:00:00Z',
    end: '2026-01-15T11:00:00Z',
    category: 'meeting',
    priority: 'normal',
    location: 'Salle de conférence A',
    bureau: 'BMO',
    attendees: [
      { name: 'A. DIALLO', role: 'organizer' },
      { name: 'M. KANE', role: 'participant' }
    ]
  })
});

const result = await response.json();
console.log('Événement créé:', result.data);
```

### Utiliser le Hook React

```typescript
import { useCalendar } from '@/hooks/useCalendar';

function MonComposant() {
  const { events, stats, loading, createEvent } = useCalendar();

  const handleCreate = async () => {
    const newEvent = await createEvent({
      title: 'Nouvelle réunion',
      start: new Date(),
      end: new Date(Date.now() + 3600000), // +1h
      category: 'meeting',
      attendees: [{ name: 'John Doe' }]
    });
    
    if (newEvent) {
      console.log('Créé:', newEvent.id);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <p>{stats?.today} événements aujourd'hui</p>
      <button onClick={handleCreate}>Créer événement</button>
    </div>
  );
}
```

### Ouvrir un onglet dans le workspace

```typescript
import { useCalendarWorkspaceStore } from '@/lib/stores/calendarWorkspaceStore';

function MonComposant() {
  const { openTab } = useCalendarWorkspaceStore();

  // Ouvrir la vue "Aujourd'hui"
  const openToday = () => {
    openTab({
      id: 'inbox:today',
      type: 'inbox',
      title: "Aujourd'hui",
      icon: '📅',
      data: { queue: 'today' }
    });
  };

  // Ouvrir un événement spécifique
  const openEvent = (eventId: string) => {
    openTab({
      id: `event:${eventId}`,
      type: 'viewer',
      title: 'Détail événement',
      icon: '📅',
      data: { eventId }
    });
  };

  // Ouvrir le wizard de création
  const openWizard = () => {
    openTab({
      id: `wizard:create:${Date.now()}`,
      type: 'wizard',
      title: 'Nouvel événement',
      icon: '➕',
      data: { action: 'create' }
    });
  };

  return (
    <div>
      <button onClick={openToday}>Aujourd'hui</button>
      <button onClick={() => openEvent('EVT-001')}>Voir EVT-001</button>
      <button onClick={openWizard}>Nouveau</button>
    </div>
  );
}
```

## 🔧 Configuration

### Remplacer les données mock par Prisma

```typescript
// src/lib/data/calendar.ts (actuel = mock)
// À remplacer par:

import { prisma } from '@/lib/prisma';

export async function getCalendarEvents() {
  return await prisma.calendarEvent.findMany({
    include: {
      assignees: true,
      links: true,
    },
    orderBy: { start: 'asc' }
  });
}

export async function calculateStats(events: any[]) {
  // Garder la logique actuelle
  // ...
}
```

### Ajouter un nouveau type d'événement

```typescript
// 1. Ajouter dans CATEGORIES (CalendarMonthView.tsx, CalendarWizardView.tsx)
const CATEGORIES = [
  // ... existants
  { id: 'inspection', label: 'Inspection', icon: '🔍', color: 'bg-teal-500' },
];

// 2. Ajouter dans le mapping API (CalendarMonthView.tsx)
const categoryMap: Record<string, string> = {
  // ... existants
  'inspection': 'inspection',
};

// 3. Mettre à jour validation (calendarValidationService.ts)
const VALID_CATEGORIES = [
  // ... existants
  'inspection'
];
```

### Personnaliser le cache

```typescript
import { calendarCache } from '@/lib/services/calendarCacheService';

// Changer le TTL par défaut (60s actuellement)
calendarCache.set('ma-clé', mesData, 120000); // 2 minutes

// Désactiver le cache pour un composant
const { events } = useCalendar({ cacheEnabled: false });
```

## 🎯 Cas d'usage courants

### 1. Afficher les événements d'aujourd'hui

```typescript
const { loadEvents } = useCalendar();

useEffect(() => {
  loadEvents({ queue: 'today' });
}, [loadEvents]);
```

### 2. Détecter les conflits

```typescript
const { detectConflicts } = useCalendar();

const conflicts = await detectConflicts({
  bureau: 'BMO',
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});

console.log(`${conflicts.total} conflits détectés`);
```

### 3. Exporter au format iCal

```typescript
// Méthode 1: Via API directe
window.open('/api/calendar/export?format=ical&queue=week', '_blank');

// Méthode 2: Via composant
<FluentButton onClick={() => {
  const url = `/api/calendar/export?format=ical&month=1&year=2026`;
  const link = document.createElement('a');
  link.href = url;
  link.download = 'calendrier.ics';
  link.click();
}}>
  Exporter iCal
</FluentButton>
```

### 4. Valider avant création

```typescript
import { calendarValidation } from '@/lib/services/calendarValidationService';

const data = {
  title: 'Ma réunion',
  start: new Date(),
  end: new Date(Date.now() + 3600000),
  category: 'meeting'
};

const validation = calendarValidation.validateEvent(data);

if (!validation.valid) {
  validation.errors.forEach(err => {
    console.error(`${err.field}: ${err.message}`);
  });
  return;
}

if (validation.warnings.length > 0) {
  const proceed = confirm(
    `Avertissements:\n${validation.warnings.map(w => w.message).join('\n')}\n\nContinuer?`
  );
  if (!proceed) return;
}

// Créer l'événement
await createEvent(data);
```

### 5. Écouter les événements du workspace

```typescript
import { useCalendarWorkspaceStore } from '@/lib/stores/calendarWorkspaceStore';

function MonComposant() {
  const { tabs, activeTabId } = useCalendarWorkspaceStore();

  useEffect(() => {
    console.log(`${tabs.length} onglets ouverts`);
    console.log('Onglet actif:', activeTabId);
  }, [tabs, activeTabId]);

  return <div>...</div>;
}
```

## 🐛 Debugging

### Vérifier le cache

```typescript
import { calendarCache } from '@/lib/services/calendarCacheService';

// En console navigateur
console.log(calendarCache.getStats());
// { size: 5, keys: ['stats:BMO', 'events:today', ...] }

// Vider le cache
calendarCache.clear();
```

### Logs API

```typescript
// Dans app/api/calendar/events/route.ts
export async function GET(request: NextRequest) {
  console.log('GET /api/calendar/events', request.nextUrl.searchParams);
  
  try {
    // ...
  } catch (error) {
    console.error('Error in GET /api/calendar/events:', error);
    // ...
  }
}
```

### Tester la validation

```typescript
import { calendarValidation } from '@/lib/services/calendarValidationService';

// Test validation complète
const result = calendarValidation.validateEvent({
  title: '',  // ❌ Erreur: vide
  start: new Date(),
  end: new Date(Date.now() - 1000),  // ❌ Erreur: avant début
  category: 'meeting',
  attendees: [
    { name: 'John' },
    { name: 'John' }  // ⚠️ Warning: doublon
  ]
});

console.log('Valid:', result.valid);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
```

## 📚 Ressources

- **Documentation complète** : `docs/CALENDAR_MODULE.md`
- **Code source** : `src/components/features/calendar/`
- **API** : `app/api/calendar/`
- **Tests** : `src/__tests__/calendar/` *(à créer)*

## 🆘 Support

Problèmes courants :

**Événement ne s'affiche pas**
- Vérifier que `start` est bien dans la période affichée
- Vérifier les filtres actifs (catégorie, bureau, etc.)
- Vider le cache : `calendarCache.clear()`

**Conflit non détecté**
- Vérifier que les participants ont le même `name` (sensible à la casse)
- Vérifier le chevauchement temporel exact
- Re-calculer : `detectConflicts()`

**Performance lente**
- Activer le cache : `cacheEnabled: true`
- Limiter la pagination : `limit: 20`
- Filtrer par période : `startDate` / `endDate`

---

**Bonne intégration ! 🚀**

