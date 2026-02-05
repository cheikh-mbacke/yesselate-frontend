# 🚀 Quickstart API - Guide de Démarrage Rapide

Guide pratique pour utiliser les 21 routes API disponibles.

---

## ⚡ Démarrage Rapide

### 1. Lancer le serveur

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

---

### 2. Vérifier les données de test

```bash
# Lister toutes les demandes
curl http://localhost:3000/api/demands

# Voir une demande spécifique avec ses stakeholders, tâches, risques
curl http://localhost:3000/api/demands/REQ-2024-001
```

**Données pré-chargées** :
- ✅ 1 demande : `REQ-2024-001`
- ✅ 5 stakeholders (OWNER, APPROVER, REVIEWER, CONTRIBUTOR, INFORMED)
- ✅ 4 tâches (OPEN, IN_PROGRESS, DONE, BLOCKED)
- ✅ 5 risques (Budget, SLA, Juridique, Réputation, Technique)

---

## 📋 Scénarios d'utilisation

### Scénario 1 : Gérer une file de demandes

```bash
# 1. Voir les demandes en attente
curl http://localhost:3000/api/demands?queue=pending

# 2. Voir les urgences
curl http://localhost:3000/api/demands?queue=urgent

# 3. Voir les retards SLA (>7 jours)
curl http://localhost:3000/api/demands?queue=overdue

# 4. Valider une demande
curl -X POST http://localhost:3000/api/demands/REQ-2024-001/actions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "validate",
    "actorId": "USR-001",
    "actorName": "A. DIALLO",
    "details": "Validation après vérification complète"
  }'

# 5. Valider plusieurs demandes en une fois (bulk)
curl -X POST http://localhost:3000/api/demands/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "demandIds": ["REQ-2024-001", "REQ-2024-002"],
    "action": "validate",
    "actorId": "USR-001",
    "actorName": "A. DIALLO"
  }'
```

---

### Scénario 2 : Gérer les parties prenantes

```bash
# 1. Lister les stakeholders d'une demande
curl http://localhost:3000/api/demands/REQ-2024-001/stakeholders

# 2. Ajouter un stakeholder
curl -X POST http://localhost:3000/api/demands/REQ-2024-001/stakeholders \
  -H "Content-Type: application/json" \
  -d '{
    "personId": "USR-999",
    "personName": "François DUBOIS",
    "role": "CONTRIBUTOR",
    "required": false,
    "note": "Expert technique"
  }'

# 3. Supprimer un stakeholder
STAKEHOLDER_ID="clx..."
curl -X DELETE http://localhost:3000/api/demands/REQ-2024-001/stakeholders/$STAKEHOLDER_ID
```

**Rôles disponibles** :
- `OWNER` : Pilote du dossier
- `APPROVER` : Validateur
- `REVIEWER` : Contrôleur
- `CONTRIBUTOR` : Contributeur
- `INFORMED` : Informé

---

### Scénario 3 : Gérer les tâches

```bash
# 1. Lister les tâches d'une demande
curl http://localhost:3000/api/demands/REQ-2024-001/tasks

# 2. Créer une tâche
curl -X POST http://localhost:3000/api/demands/REQ-2024-001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Préparer le dossier de présentation",
    "description": "Slides + rapport financier",
    "status": "OPEN",
    "dueAt": "2024-12-31T00:00:00.000Z",
    "assignedToName": "Alice DUPONT"
  }'

# 3. Mettre à jour une tâche (passer en DONE)
TASK_ID="clx..."
curl -X PATCH http://localhost:3000/api/demands/REQ-2024-001/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE"}'

# 4. Supprimer une tâche
curl -X DELETE http://localhost:3000/api/demands/REQ-2024-001/tasks/$TASK_ID
```

**Status disponibles** :
- `OPEN` : Ouverte
- `IN_PROGRESS` : En cours
- `DONE` : Terminée (auto-complete `completedAt`)
- `BLOCKED` : Bloquée

---

### Scénario 4 : Gérer les risques

```bash
# 1. Lister les risques d'une demande
curl http://localhost:3000/api/demands/REQ-2024-001/risks

# 2. Créer un risque
curl -X POST http://localhost:3000/api/demands/REQ-2024-001/risks \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Technique",
    "opportunity": false,
    "probability": 3,
    "impact": 4,
    "mitigation": "Tests unitaires et intégration",
    "ownerName": "David LEROY"
  }'

# 3. Créer une opportunité
curl -X POST http://localhost:3000/api/demands/REQ-2024-001/risks \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Innovation",
    "opportunity": true,
    "probability": 4,
    "impact": 5,
    "mitigation": "Capitaliser sur la nouvelle technologie",
    "ownerName": "Alice DUPONT"
  }'

# 4. Mettre à jour un risque
RISK_ID="clx..."
curl -X PATCH http://localhost:3000/api/demands/REQ-2024-001/risks/$RISK_ID \
  -H "Content-Type: application/json" \
  -d '{"probability": 5, "impact": 5}'

# 5. Supprimer un risque
curl -X DELETE http://localhost:3000/api/demands/REQ-2024-001/risks/$RISK_ID
```

**Catégories communes** :
- Juridique
- Budget
- SLA
- Réputation
- Technique
- Innovation

**Score de criticité** : `probability × impact` (1..25)
- 1-3 : FAIBLE (vert)
- 4-8 : MOYEN (jaune)
- 9-15 : ÉLEVÉ (orange)
- 16-25 : CRITIQUE (rouge)

---

### Scénario 5 : Statistiques et export

```bash
# 1. Obtenir les statistiques temps réel
curl http://localhost:3000/api/demands/stats

# Résultat :
# {
#   "total": 10,
#   "pending": 5,
#   "validated": 3,
#   "rejected": 2,
#   "urgent": 2,
#   "overdue": 1
# }

# 2. Exporter en CSV
curl -X POST http://localhost:3000/api/demands/export \
  -H "Content-Type: application/json" \
  -d '{"format": "csv"}' \
  --output demands.csv

# 3. Exporter en JSON
curl -X POST http://localhost:3000/api/demands/export \
  -H "Content-Type: application/json" \
  -d '{"format": "json"}' \
  --output demands.json

# 4. Exporter avec filtres
curl -X POST http://localhost:3000/api/demands/export \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "queue": "pending",
    "bureau": "DSI"
  }' \
  --output demands-dsi-pending.csv
```

---

## 🎣 Utilisation avec React Hooks

### Hook `useDemandsDB`

```typescript
import { useDemandsDB } from '@/hooks';

function MyComponent() {
  const { demands, loading, error, fetchDemands } = useDemandsDB();

  useEffect(() => {
    fetchDemands('pending'); // ou 'urgent', 'overdue', 'all'
  }, []);

  return (
    <div>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error.message}</p>}
      <ul>
        {demands.map((d) => (
          <li key={d.id}>{d.subject}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Hook `useStakeholders`

```typescript
import { useStakeholders } from '@/hooks';

function StakeholdersPanel({ demandId }: { demandId: string }) {
  const { stakeholders, loading, add, remove } = useStakeholders(demandId);

  const handleAdd = async () => {
    await add({
      personId: 'USR-999',
      personName: 'Test User',
      role: 'INFORMED',
      required: false,
    });
  };

  return (
    <div>
      <h3>Parties prenantes ({stakeholders.length})</h3>
      <ul>
        {stakeholders.map((s) => (
          <li key={s.id}>
            {s.personName} - {s.role}
            <button onClick={() => remove(s.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
      <button onClick={handleAdd}>Ajouter</button>
    </div>
  );
}
```

---

### Hook `useTasks`

```typescript
import { useTasks } from '@/hooks';

function TaskBoard({ demandId }: { demandId: string }) {
  const { tasks, loading, add, update, remove } = useTasks(demandId);

  const handleComplete = async (taskId: string) => {
    await update(taskId, { status: 'DONE' });
  };

  return (
    <div>
      <h3>Tâches ({tasks.length})</h3>
      {tasks.map((task) => (
        <div key={task.id}>
          <span>{task.title}</span>
          <span>{task.status}</span>
          {task.status !== 'DONE' && (
            <button onClick={() => handleComplete(task.id)}>
              Terminer
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### Hook `useRisks`

```typescript
import { useRisks } from '@/hooks';
import { calculateRiskScore, getRiskCriticality } from '@/lib/api/risksClient';

function RiskMatrix({ demandId }: { demandId: string }) {
  const { risks, loading, add, remove } = useRisks(demandId);

  return (
    <div>
      <h3>Risques & Opportunités ({risks.length})</h3>
      {risks.map((risk) => {
        const score = calculateRiskScore(risk.probability, risk.impact);
        const criticality = getRiskCriticality(score);
        return (
          <div key={risk.id}>
            <span>{risk.category}</span>
            <span className={criticality.textClass}>
              {criticality.label} (Score: {score})
            </span>
            <button onClick={() => remove(risk.id)}>Supprimer</button>
          </div>
        );
      })}
    </div>
  );
}
```

---

## 🔧 Services Client TypeScript

### Demands

```typescript
import { listDemands, getDemand, transitionDemand } from '@/lib/api/demandesClient';

// Liste
const demands = await listDemands('pending');

// Détails
const { demand, events } = await getDemand('REQ-2024-001');

// Action
await transitionDemand('REQ-2024-001', {
  action: 'validate',
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
});
```

---

### Stakeholders

```typescript
import { listStakeholders, addStakeholder, removeStakeholder } from '@/lib/api/stakeholdersClient';

const stakeholders = await listStakeholders('REQ-2024-001');

await addStakeholder('REQ-2024-001', {
  personId: 'USR-999',
  personName: 'Test User',
  role: 'INFORMED',
});

await removeStakeholder('REQ-2024-001', 'STAKEHOLDER_ID');
```

---

### Tasks

```typescript
import { listTasks, addTask, updateTask, removeTask } from '@/lib/api/tasksClient';

const tasks = await listTasks('REQ-2024-001');

await addTask('REQ-2024-001', {
  title: 'Nouvelle tâche',
  status: 'OPEN',
});

await updateTask('REQ-2024-001', 'TASK_ID', { status: 'DONE' });

await removeTask('REQ-2024-001', 'TASK_ID');
```

---

### Risks

```typescript
import { listRisks, addRisk, updateRisk, removeRisk, calculateRiskScore, getRiskCriticality } from '@/lib/api/risksClient';

const risks = await listRisks('REQ-2024-001');

const newRisk = await addRisk('REQ-2024-001', {
  category: 'Budget',
  probability: 4,
  impact: 5,
});

const score = calculateRiskScore(4, 5); // 20
const criticality = getRiskCriticality(score); // { label: 'CRITIQUE', color: 'red', ... }

await updateRisk('REQ-2024-001', 'RISK_ID', { probability: 2 });

await removeRisk('REQ-2024-001', 'RISK_ID');
```

---

## 📖 Documentation Complète

| Document | Contenu |
|----------|---------|
| [API_COMPLETE_SUMMARY.md](./API_COMPLETE_SUMMARY.md) | Vue d'ensemble des 21 routes |
| [API_REFERENCE.md](./API_REFERENCE.md) | Demands, Stats, Export, Bulk |
| [API_TASKS_RISKS.md](./API_TASKS_RISKS.md) | Tasks & Risks détaillés |
| [STAKEHOLDERS.md](./STAKEHOLDERS.md) | Parties prenantes |
| [TEST_STAKEHOLDERS_API.md](./TEST_STAKEHOLDERS_API.md) | Tests Stakeholders |

---

## ✅ Checklist de Démarrage

- [ ] Lancer `npm run dev`
- [ ] Tester `curl http://localhost:3000/api/demands`
- [ ] Vérifier les données de test (REQ-2024-001)
- [ ] Tester un scénario (ex: ajouter une tâche)
- [ ] Utiliser un hook React dans un composant
- [ ] Consulter la documentation complète

---

## 🎯 Prochaines Étapes

1. **Tester les scénarios** : Utiliser les commandes curl ci-dessus
2. **Créer des composants UI** : TaskBoard, RiskMatrix, etc.
3. **Intégrer dans l'application** : Afficher dans `DemandTab`

---

**🚀 API prête à l'emploi ! Bon développement !** ✨

