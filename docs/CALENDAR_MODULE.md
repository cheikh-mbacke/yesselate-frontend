# Module Calendrier - YESSELATE

> Système de gestion de calendrier sophistiqué avec détection de conflits, gestion SLA, et workspace multi-onglets.

## 📋 Vue d'ensemble

Le module Calendrier offre une gestion complète des événements avec :
- **Vues multiples** : Mensuelle, files de travail (Aujourd'hui, Semaine, Retards SLA, Conflits)
- **Détection automatique de conflits** entre événements
- **Gestion SLA** avec alertes de retard
- **Workspace multi-onglets** pour travail simultané
- **Wizard de création guidé** en 6 étapes
- **Export multi-formats** (iCal, CSV, JSON, PDF)
- **Cache intelligent** pour performances optimales
- **Validation robuste** des données

## 🏗️ Architecture

```
app/(portals)/maitre-ouvrage/calendrier/
└── page.tsx                    # Page principale avec WorkspaceShell

src/components/features/calendar/workspace/
├── CalendarWorkspaceTabs.tsx   # Gestion des onglets
├── CalendarWorkspaceContent.tsx # Router de vues
├── CalendarCommandPalette.tsx  # Palette de commandes (Ctrl+K)
├── CalendarDirectionPanel.tsx  # Centre de décision
├── CalendarAlertsBanner.tsx    # Alertes temps réel
├── CalendarTimeline.tsx        # Activité récente
└── views/
    ├── CalendarMonthView.tsx   # Vue mensuelle (grille + interactions)
    ├── CalendarInboxView.tsx   # Files de travail (liste/cartes/tableau)
    └── CalendarWizardView.tsx  # Assistant création guidé

src/lib/
├── stores/
│   └── calendarWorkspaceStore.ts  # État Zustand (tabs + UI)
├── services/
│   ├── calendarCacheService.ts    # Cache avec TTL
│   └── calendarValidationService.ts # Validation métier
└── data/
    └── calendar.ts             # Données mock (à remplacer par API)

src/hooks/
└── useCalendar.ts             # Hook React principal

app/api/calendar/
├── stats/route.ts             # GET statistiques
├── export/route.ts            # GET export multi-formats
├── events/route.ts            # GET/POST liste événements
├── events/[id]/route.ts       # GET/PATCH/DELETE événement
├── events/[id]/export/route.ts # GET export événement spécifique
└── conflicts/route.ts         # GET/POST conflits
```

## 🚀 Utilisation

### Page principale

```tsx
import CalendrierPage from '@/app/(portals)/maitre-ouvrage/calendrier/page';

// La page est automatiquement montée par Next.js
// Route: /maitre-ouvrage/calendrier
```

### Hook useCalendar

```tsx
import { useCalendar } from '@/hooks/useCalendar';

function MyComponent() {
  const {
    events,
    stats,
    loading,
    error,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    detectConflicts,
  } = useCalendar();

  // Charger événements filtrés
  useEffect(() => {
    loadEvents({ queue: 'today', priority: 'critical' });
  }, [loadEvents]);

  // Créer un événement
  const handleCreate = async () => {
    const newEvent = await createEvent({
      title: 'Réunion importante',
      start: new Date(),
      end: new Date(Date.now() + 3600000),
      category: 'meeting',
      priority: 'urgent',
      attendees: [{ name: 'A. DIALLO', role: 'participant' }],
    });
  };

  return (
    <div>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error}</p>}
      {stats && <p>{stats.today} événements aujourd'hui</p>}
    </div>
  );
}
```

### Validation

```tsx
import { calendarValidation } from '@/lib/services/calendarValidationService';

const result = calendarValidation.validateEvent({
  title: 'Réunion',
  start: new Date(),
  end: new Date(Date.now() + 3600000),
  category: 'meeting',
  attendees: [{ name: 'John Doe', email: 'john@example.com' }],
});

if (!result.valid) {
  console.error('Erreurs:', result.errors);
}

console.log('Avertissements:', result.warnings);
```

### Cache

```tsx
import { calendarCache, CacheKeys, invalidateCalendarCache } from '@/lib/services/calendarCacheService';

// Récupérer ou calculer
const stats = await calendarCache.getOrSet(
  CacheKeys.stats('BMO', 1, 2026),
  async () => {
    // Calcul coûteux
    return await fetchStatsFromAPI();
  },
  60000 // TTL 1 minute
);

// Invalider après mutation
invalidateCalendarCache.onCreate();
invalidateCalendarCache.onUpdate('EVT-001');
invalidateCalendarCache.all(); // Tout vider
```

## 🎯 Fonctionnalités

### Vue Mensuelle

- **Grille interactive** : 6 semaines, navigation mois/année
- **Quick actions** : Double-clic pour créer, clic pour sélectionner
- **Panel latéral** : Détail du jour sélectionné
- **Épinglage** : Marquer des dates importantes (localStorage)
- **Filtres** : Catégorie, priorité, bureau, recherche texte
- **Sélection multiple** : Actions groupées sur événements
- **Export** : iCal, CSV, JSON, PDF

### Files de Travail (Inbox)

- **Queues pré-définies** :
  - `today` : Événements d'aujourd'hui
  - `week` : Événements de la semaine
  - `month` : Événements du mois
  - `overdue` : Retards SLA
  - `conflicts` : Conflits détectés
  - `completed` : Événements terminés

- **3 vues** : Liste, Cartes, Tableau
- **Tri** : Date, priorité, titre, score urgence
- **Pagination** : 20 événements par page
- **Étoiles** : Marquer favoris
- **Bulk actions** : Terminer, replanifier, exporter

### Wizard de Création

**6 étapes guidées** :

1. **Informations** : Titre, description, catégorie, priorité
2. **Date & Heure** : Début, fin, récurrence, journée entière
3. **Détails** : Lieu, bureau, tags, notes
4. **Participants** : Ajouter/retirer participants avec rôles
5. **Liens** : Lier à demandes, délégations, marchés
6. **Validation** : Récapitulatif et confirmation

### Détection de Conflits

Détection automatique basée sur :
- **Participants communs** entre 2 événements
- **Chevauchement temporel** des créneaux
- **Sévérité** : critical, warning, info selon priorités

```typescript
// Exemple de conflit
{
  id: 'EVT-001|EVT-008',
  events: [
    { id: 'EVT-001', title: 'Réunion A', start: '2026-01-15T10:00' },
    { id: 'EVT-008', title: 'Réunion B', start: '2026-01-15T10:00' }
  ],
  reason: '1 participant(s) en conflit',
  severity: 'critical',
  affectedPeople: ['A. DIALLO']
}
```

### Export

**Formats supportés** :

- **iCal** (.ics) : Outlook, Google Calendar, Apple Calendar
- **CSV** : Excel, Google Sheets
- **JSON** : Données structurées
- **PDF** : Document imprimable (génération HTML → Print)

**Scopes** :
- Événement individuel : `/api/calendar/events/{id}/export?format=ical`
- Liste filtrée : `/api/calendar/export?format=csv&queue=today`
- Mois spécifique : `/api/calendar/export?format=pdf&month=1&year=2026`

## 🔌 API Endpoints

### Stats

```
GET /api/calendar/stats
Query: bureau?, month?, year?
Response: { total, today, thisWeek, overdueSLA, conflicts, completed, byKind, byBureau, ts }
```

### Événements

```
GET /api/calendar/events
Query: queue?, bureau?, category?, priority?, status?, search?, page?, limit?, sortBy?, sortDir?
Response: { events[], pagination, filters }

POST /api/calendar/events
Body: { title, start, end, category?, priority?, ... }
Response: { data: newEvent }

GET /api/calendar/events/{id}
Response: { data: event }

PATCH /api/calendar/events/{id}
Body: { partial updates }
Response: { data: updatedEvent }

DELETE /api/calendar/events/{id}
Query: reason?
Response: { data: { status: 'cancelled' } }
```

### Conflits

```
GET /api/calendar/conflicts
Query: bureau?, startDate?, endDate?
Response: { conflicts[], total, bySeverity }

POST /api/calendar/conflicts/resolve
Body: { conflictId, eventId, newStart, newEnd, reason }
Response: { data: resolution }
```

### Export

```
GET /api/calendar/export
Query: format, queue?, month?, year?, print?
Response: Binary (iCal/CSV/JSON) or HTML

GET /api/calendar/events/{id}/export
Query: format
Response: Binary or HTML
```

## 🎨 Catégories d'événements

| Catégorie | ID | Icon | Description |
|-----------|----|----|-------------|
| Réunion | `meeting` | 👥 | Réunions, comités, sessions |
| Visite de site | `site_visit` | 🏗️ | Inspections terrain |
| Échéance | `deadline` | ⏰ | Dates limites, deadlines |
| Validation | `validation` | ✅ | Validations, approbations |
| Paiement | `payment` | 💰 | Paiements, factures |
| Absence | `absence` | 🏖️ | Congés, absences |
| Formation | `training` | 📚 | Formations, workshops |
| Autre | `other` | 📌 | Événements divers |

## 🏷️ Priorités

| Priorité | Couleur | SLA | Description |
|----------|---------|-----|-------------|
| `critical` | Rose | < 24h | Impact majeur, action immédiate |
| `urgent` | Amber | < 48h | À traiter rapidement |
| `high` | Orange | < 1 semaine | Important |
| `normal` | Blue | Standard | Traitement normal |
| `low` | Slate | Flexible | Peut attendre |

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+K` | Ouvrir palette de commandes |
| `Ctrl+1` | Vue Aujourd'hui |
| `Ctrl+2` | Vue Cette semaine |
| `Ctrl+3` | Vue Retards SLA |
| `Ctrl+4` | Vue Conflits |
| `Ctrl+N` | Nouvel événement |
| `Ctrl+S` | Voir statistiques |
| `Ctrl+E` | Exporter |
| `Ctrl+D` | Centre de décision |
| `Shift+?` | Aide/Raccourcis |
| `Escape` | Fermer modales |

## 📊 Métriques & Performance

### Cache

- **TTL par défaut** : 60 secondes
- **Nettoyage automatique** : Toutes les 5 minutes
- **Invalidation intelligente** : Après chaque mutation

### Validation

- **Niveau 1 (Quick)** : Titre + date début (création rapide)
- **Niveau 2 (Full)** : Tous les champs + règles métier
- **Niveau 3 (Business)** : Conflits + SLA + cohérence

### Détection de conflits

- **Complexité** : O(n²) pour n événements
- **Optimisation** : Cache + filtrage temporel
- **Seuil d'alerte** : > 5 conflits = badge rouge

## 🔄 Workflow typique

### Création d'événement

```
1. Utilisateur : Ctrl+N ou clic "Nouveau"
2. Wizard s'ouvre (6 étapes)
3. Remplissage formulaire + validation temps réel
4. Détection conflits avant soumission
5. POST /api/calendar/events
6. Invalidation cache
7. Rafraîchissement vues actives
8. Toast confirmation
```

### Résolution de conflit

```
1. Badge "X conflits" affiché
2. Clic → Vue Conflits (Ctrl+4)
3. Liste paires en conflit
4. Clic sur conflit → Voir détails
5. Action : Replanifier / Annuler / Ignorer
6. PATCH /api/calendar/events/{id}
7. POST /api/calendar/conflicts/resolve
8. Re-détection conflits
9. Mise à jour affichage
```

## 🧪 Tests

```bash
# Tests unitaires services
npm run test src/lib/services/calendar*.test.ts

# Tests composants
npm run test src/components/features/calendar/**/*.test.tsx

# Tests API
npm run test app/api/calendar/**/*.test.ts

# Coverage
npm run test:coverage
```

## 🚧 TODO / Améliorations futures

- [ ] Intégration Prisma (remplacer données mock)
- [ ] WebSocket pour mises à jour temps réel
- [ ] Drag & drop dans vue mensuelle
- [ ] Vue Gantt pour projets
- [ ] Synchronisation Google Calendar / Outlook
- [ ] Notifications push (email + SMS)
- [ ] Récurrence avancée (RRULE)
- [ ] Gestion des salles (booking)
- [ ] Intégration visioconférence (Teams, Meet)
- [ ] Export Excel avec graphiques
- [ ] Analyse prédictive des conflits
- [ ] IA pour suggestions de créneaux

## 📝 Notes

- **Données mock** : `src/lib/data/calendar.ts` doit être remplacé par appels API Prisma
- **Timezone** : Toutes les dates en UTC, affichage local avec `Intl`
- **Permissions** : RBAC à implémenter (admin, manager, user)
- **Audit trail** : Logger toutes les mutations (création, modification, suppression)
- **SLA** : Règles métier à configurer par type d'événement
- **Conflits** : Logique extensible pour inclure salles, ressources matérielles

## 🤝 Contribution

Le module suit l'architecture Workspace établie dans les modules Demandes et Délégations :
- `WorkspaceShell` pour layout uniforme
- Zustand pour état multi-onglets
- Composants atomiques réutilisables
- Services découplés pour logique métier
- API routes avec validation + cache

---

**Maintenu par** : Équipe YESSELATE  
**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2026

