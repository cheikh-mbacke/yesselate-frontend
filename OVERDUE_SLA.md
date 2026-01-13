# ⏱️ File "Overdue" - Gestion SLA Automatique

## 🎯 Vue d'ensemble

**Nouvelle file "overdue"** pour identifier automatiquement les demandes en retard selon un SLA simple.

**Endpoint** : `GET /api/demands?queue=overdue`

---

## 📋 Règle SLA Simple

### Définition d'une demande en retard

Une demande est considérée "en retard" si :
- ✅ **Plus de 7 jours** depuis `requestedAt`
- ✅ **Statut ≠ validated** (pas encore validée)

```typescript
// Logique SLA dans l'API
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

if (queue === 'overdue') {
  where.requestedAt = { lt: daysAgo(7) };
  where.status = { not: 'validated' };
}
```

---

## 🔌 Utilisation

### API directe

```bash
# Récupérer toutes les demandes en retard
curl http://localhost:3000/api/demands?queue=overdue

# Limiter les résultats
curl http://localhost:3000/api/demands?queue=overdue&limit=50

# Rechercher dans les demandes en retard
curl "http://localhost:3000/api/demands?queue=overdue&q=ADM"
```

---

### Service API

```typescript
import { listDemands } from '@/lib/api/demands';

// Récupérer les demandes en retard
const overdueDemands = await listDemands('overdue');

// Compter les demandes en retard
const count = overdueDemands.length;

// Filtrer par bureau
const admOverdue = overdueDemands.filter(d => d.bureau === 'ADM');
```

---

### Hook React

```typescript
import { useDemandsDB } from '@/hooks';

function OverdueList() {
  const { fetchDemands, loading } = useDemandsDB();
  const [overdue, setOverdue] = useState([]);

  useEffect(() => {
    fetchDemands({ queue: 'overdue' }).then(setOverdue);
  }, []);

  return (
    <div>
      <h2>Demandes en retard: {overdue.length}</h2>
      {overdue.map(d => (
        <DemandCard key={d.id} demand={d} />
      ))}
    </div>
  );
}
```

---

## 📊 Statistiques

### Calcul du taux de retard

```typescript
const stats = await getStats();

const overdueRate = Math.round((stats.overdue / stats.total) * 100);
console.log(`Taux de retard: ${overdueRate}%`);
```

### Calcul de la conformité SLA

```typescript
const slaCompliance = 100 - overdueRate;
console.log(`Conformité SLA: ${slaCompliance}%`);

// Indicateur de couleur
const color = 
  slaCompliance >= 90 ? 'green' :
  slaCompliance >= 70 ? 'amber' :
  'red';
```

---

## 🎨 Intégration UI

### Bouton "En retard" avec badge

```tsx
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';

function OverdueButton() {
  const { openTab } = useWorkspaceStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    listDemands('overdue').then(data => setCount(data.length));
  }, []);

  return (
    <Button
      variant="warning"
      onClick={() => openTab({ 
        type: 'inbox', 
        id: 'inbox:overdue', 
        title: 'Retards SLA', 
        icon: '⏱️', 
        data: { queue: 'overdue' } 
      })}
    >
      ⏱️ En retard {count > 0 && <span className="ml-1">({count})</span>}
    </Button>
  );
}
```

---

### Dashboard SLA

```tsx
function SLADashboard() {
  const { stats } = useDemandsStats();

  const slaCompliance = Math.round(((stats.total - stats.overdue) / stats.total) * 100);

  const getSLAColor = (compliance: number) => {
    if (compliance >= 90) return 'text-emerald-500';
    if (compliance >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <FluentCard>
        <FluentCardContent className="p-4">
          <div className="text-xs text-[rgb(var(--muted))]">Total Demandes</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </FluentCardContent>
      </FluentCard>

      <FluentCard>
        <FluentCardContent className="p-4">
          <div className="text-xs text-[rgb(var(--muted))]">En Retard</div>
          <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
        </FluentCardContent>
      </FluentCard>

      <FluentCard>
        <FluentCardContent className="p-4">
          <div className="text-xs text-[rgb(var(--muted))]">Conformité SLA</div>
          <div className={`text-2xl font-bold ${getSLAColor(slaCompliance)}`}>
            {slaCompliance}%
          </div>
        </FluentCardContent>
      </FluentCard>
    </div>
  );
}
```

---

## 🔔 Alertes et Notifications

### Email de rappel pour demandes en retard

```typescript
// app/api/cron/sla-alerts/route.ts
import { listDemands } from '@/lib/api/demands';
import { sendEmail } from '@/lib/email';

export async function GET() {
  const overdueDemands = await listDemands('overdue');

  for (const demand of overdueDemands) {
    // Envoyer un email de rappel
    await sendEmail({
      to: demand.assignedToEmail,
      subject: `⏱️ Demande en retard: ${demand.id}`,
      body: `La demande ${demand.subject} est en retard de ${getDaysOverdue(demand)} jours.`
    });
  }

  return NextResponse.json({ sent: overdueDemands.length });
}
```

---

## 🎯 Personnalisation du SLA

### Modifier le délai SLA

Pour changer de 7 jours à un autre délai :

```typescript
// app/api/demands/route.ts

// Avant (7 jours)
where.requestedAt = { lt: daysAgo(7) };

// Après (ex: 5 jours)
where.requestedAt = { lt: daysAgo(5) };
```

---

### SLA par bureau

```typescript
const SLA_BY_BUREAU = {
  'ADM': 5,  // 5 jours
  'FIN': 3,  // 3 jours (critique)
  'RH': 7,   // 7 jours
  'IT': 10,  // 10 jours
};

function isOverdue(demand: Demand) {
  const sla = SLA_BY_BUREAU[demand.bureau] ?? 7;
  const daysSince = daysBetween(new Date(), demand.requestedAt);
  return daysSince > sla && demand.status !== 'validated';
}
```

---

### SLA par priorité

```typescript
const SLA_BY_PRIORITY = {
  'urgent': 1,  // 1 jour
  'high': 3,    // 3 jours
  'normal': 7,  // 7 jours
  'low': 14,    // 14 jours
};

function getSLADays(priority: string) {
  return SLA_BY_PRIORITY[priority] ?? 7;
}
```

---

## 📈 Métriques et KPIs

### Indicateurs clés

| Métrique | Formule | Seuil |
|----------|---------|-------|
| **Taux de retard** | `(overdue / total) * 100` | < 10% ✅ |
| **Conformité SLA** | `((total - overdue) / total) * 100` | > 90% ✅ |
| **Délai moyen** | `avgDelay` en jours | < 3j ✅ |

---

### Rapport SLA mensuel

```typescript
async function generateSLAReport(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const demands = await prisma.demand.findMany({
    where: {
      requestedAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const total = demands.length;
  const overdue = demands.filter(d => isOverdue(d)).length;
  const compliance = Math.round(((total - overdue) / total) * 100);

  return {
    period: `${month}/${year}`,
    total,
    overdue,
    compliance,
    status: compliance >= 90 ? '✅ Conforme' : '⚠️ Non conforme'
  };
}
```

---

## 🎉 Résumé

**File "overdue"** : Gestion automatique du SLA

**Règle simple** : > 7 jours et pas validée

**Utilisation** :
- ✅ `GET /api/demands?queue=overdue`
- ✅ `listDemands('overdue')`
- ✅ Stats incluses dans `/api/demands/stats`

**Personnalisable** :
- Délai SLA global
- SLA par bureau
- SLA par priorité

**Intégration UI** :
- Bouton avec badge
- Dashboard SLA
- Alertes emails

---

## 📚 Liens utiles

- **API Reference** : [`API_REFERENCE.md`](./API_REFERENCE.md)
- **Stats Endpoint** : [`STATS_ENDPOINT.md`](./STATS_ENDPOINT.md)
- **Services API** : [`API_SERVICES.md`](./API_SERVICES.md)

