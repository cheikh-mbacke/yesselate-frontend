# 📋 API Tasks & Risks Documentation

Documentation complète des routes API pour la gestion des **tâches** et des **risques/opportunités** d'une demande.

---

## 📋 API Tasks (Tâches)

### 1. GET `/api/demands/[id]/tasks`

**Description** : Liste toutes les tâches d'une demande.

**Réponse** :
```json
{
  "rows": [
    {
      "id": "clx...",
      "demandId": "REQ-2024-001",
      "title": "Valider le budget avec la DAF",
      "description": "Préparer le dossier budgétaire et obtenir la signature",
      "status": "OPEN",
      "dueAt": "2024-01-15T00:00:00.000Z",
      "assignedToId": "USR-001",
      "assignedToName": "Alice DUPONT",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "completedAt": null
    }
  ]
}
```

**Tri** : `status` ASC → `dueAt` ASC → `createdAt` ASC

**Status possibles** :
- `OPEN` : Ouverte
- `IN_PROGRESS` : En cours
- `DONE` : Terminée
- `BLOCKED` : Bloquée

---

### 2. POST `/api/demands/[id]/tasks`

**Description** : Crée une nouvelle tâche.

**Payload** :
```json
{
  "title": "Rédiger le cahier des charges",
  "description": "Document de spécifications techniques (optionnel)",
  "status": "OPEN",
  "dueAt": "2024-01-20T00:00:00.000Z",
  "assignedToId": "USR-002",
  "assignedToName": "Bob MARTIN"
}
```

**Champs requis** :
- `title` (String, non vide)

**Champs optionnels** :
- `description` (String | null)
- `status` (String, défaut: `"OPEN"`)
- `dueAt` (ISO Date | null)
- `assignedToId` (String | null)
- `assignedToName` (String | null)

**Réponse** :
```json
{
  "row": {
    "id": "clx...",
    "demandId": "REQ-2024-001",
    "title": "Rédiger le cahier des charges",
    "status": "OPEN",
    "createdAt": "2024-01-10T14:30:00.000Z",
    ...
  }
}
```

**Audit** : Crée un événement `task_add` dans `DemandEvent`.

---

### 3. PATCH `/api/demands/[id]/tasks/[tid]`

**Description** : Met à jour une tâche existante.

**Payload** (tous les champs sont optionnels) :
```json
{
  "title": "Nouveau titre",
  "description": "Nouvelle description",
  "status": "IN_PROGRESS",
  "dueAt": "2024-01-25T00:00:00.000Z",
  "assignedToId": "USR-003",
  "assignedToName": "Claire BERNARD",
  "completedAt": null
}
```

**Auto-completion** :
- Si `status` devient `"DONE"` et `completedAt` n'est pas fourni → `completedAt` est automatiquement défini à `new Date()`

**Réponse** :
```json
{
  "row": {
    "id": "clx...",
    "demandId": "REQ-2024-001",
    "title": "Nouveau titre",
    "status": "IN_PROGRESS",
    ...
  }
}
```

**Audit** : Crée un événement `task_update` dans `DemandEvent`.

---

### 4. DELETE `/api/demands/[id]/tasks/[tid]`

**Description** : Supprime une tâche.

**Réponse** :
```json
{
  "ok": true
}
```

**Audit** : Crée un événement `task_remove` dans `DemandEvent`.

---

## ⚠️ API Risks (Risques & Opportunités)

### 1. GET `/api/demands/[id]/risks`

**Description** : Liste tous les risques et opportunités d'une demande.

**Réponse** :
```json
{
  "rows": [
    {
      "id": "clx...",
      "demandId": "REQ-2024-001",
      "category": "Budget",
      "opportunity": 0,
      "probability": 4,
      "impact": 5,
      "mitigation": "Prévoir une marge de 10%",
      "ownerName": "Alice DUPONT",
      "createdAt": "2024-01-10T10:00:00.000Z"
    },
    {
      "id": "clx...",
      "demandId": "REQ-2024-001",
      "category": "Réputation",
      "opportunity": 1,
      "probability": 4,
      "impact": 4,
      "mitigation": "Communication proactive",
      "ownerName": "Émilie THOMAS",
      "createdAt": "2024-01-10T11:00:00.000Z"
    }
  ]
}
```

**Tri** : `opportunity` ASC (risques d'abord, opportunités ensuite) → `createdAt` DESC

**Champs** :
- `opportunity` : `0` = risque, `1` = opportunité
- `probability` : 1..5 (très faible → très élevée)
- `impact` : 1..5 (négligeable → catastrophique)
- `category` : "Juridique", "Budget", "SLA", "Réputation", "Technique", etc.

**Score de criticité** : `probability × impact` (1..25)

---

### 2. POST `/api/demands/[id]/risks`

**Description** : Crée un nouveau risque ou opportunité.

**Payload** :
```json
{
  "category": "Juridique",
  "opportunity": false,
  "probability": 3,
  "impact": 5,
  "mitigation": "Relecture par expert externe",
  "ownerName": "Claire BERNARD"
}
```

**Champs requis** :
- `category` (String, non vide)
- `probability` (Int, 1..5)
- `impact` (Int, 1..5)

**Champs optionnels** :
- `opportunity` (Boolean, défaut: `false`)
- `mitigation` (String | null)
- `ownerName` (String | null)

**Validation** :
- `probability` et `impact` doivent être entre **1** et **5** (inclus)

**Réponse** :
```json
{
  "row": {
    "id": "clx...",
    "demandId": "REQ-2024-001",
    "category": "Juridique",
    "opportunity": 0,
    "probability": 3,
    "impact": 5,
    "mitigation": "Relecture par expert externe",
    "ownerName": "Claire BERNARD",
    "createdAt": "2024-01-10T14:30:00.000Z"
  }
}
```

**Audit** : Crée un événement `risk_add` ou `opportunity_add` dans `DemandEvent`.

---

### 3. PATCH `/api/demands/[id]/risks/[rid]`

**Description** : Met à jour un risque ou opportunité existant.

**Payload** (tous les champs sont optionnels) :
```json
{
  "category": "Budget",
  "opportunity": true,
  "probability": 4,
  "impact": 4,
  "mitigation": "Nouvelle stratégie de mitigation",
  "ownerName": "Bob MARTIN"
}
```

**Validation** :
- Si `probability` ou `impact` sont fournis, ils doivent être entre **1** et **5**

**Réponse** :
```json
{
  "row": {
    "id": "clx...",
    "demandId": "REQ-2024-001",
    "category": "Budget",
    "opportunity": 1,
    "probability": 4,
    "impact": 4,
    ...
  }
}
```

**Audit** : Crée un événement `risk_update` ou `opportunity_update` dans `DemandEvent`.

---

### 4. DELETE `/api/demands/[id]/risks/[rid]`

**Description** : Supprime un risque ou opportunité.

**Réponse** :
```json
{
  "ok": true
}
```

**Audit** : Crée un événement `risk_remove` ou `opportunity_remove` dans `DemandEvent`.

---

## 🧪 Tests Rapides

### Tasks

```bash
# GET - Liste des tâches
curl http://localhost:3000/api/demands/REQ-2024-001/tasks

# POST - Créer une tâche
curl -X POST http://localhost:3000/api/demands/REQ-2024-001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "status": "OPEN",
    "dueAt": "2024-12-31T00:00:00.000Z"
  }'

# PATCH - Mettre à jour une tâche
curl -X PATCH http://localhost:3000/api/demands/REQ-2024-001/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE"}'

# DELETE - Supprimer une tâche
curl -X DELETE http://localhost:3000/api/demands/REQ-2024-001/tasks/TASK_ID
```

---

### Risks

```bash
# GET - Liste des risques
curl http://localhost:3000/api/demands/REQ-2024-001/risks

# POST - Créer un risque
curl -X POST http://localhost:3000/api/demands/REQ-2024-001/risks \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Technique",
    "probability": 3,
    "impact": 3,
    "mitigation": "Tests unitaires"
  }'

# PATCH - Mettre à jour un risque
curl -X PATCH http://localhost:3000/api/demands/REQ-2024-001/risks/RISK_ID \
  -H "Content-Type: application/json" \
  -d '{"probability": 5, "impact": 5}'

# DELETE - Supprimer un risque
curl -X DELETE http://localhost:3000/api/demands/REQ-2024-001/risks/RISK_ID
```

---

## 📊 Service Client TypeScript

### Tasks

```typescript
import { listTasks, addTask, updateTask, removeTask } from '@/lib/api/tasksClient';

// Liste
const tasks = await listTasks('REQ-2024-001');

// Ajouter
const newTask = await addTask('REQ-2024-001', {
  title: 'Nouvelle tâche',
  status: 'OPEN',
  dueAt: '2024-12-31T00:00:00.000Z',
});

// Mettre à jour
const updatedTask = await updateTask('REQ-2024-001', 'TASK_ID', {
  status: 'DONE',
});

// Supprimer
await removeTask('REQ-2024-001', 'TASK_ID');
```

---

### Risks

```typescript
import { 
  listRisks, 
  addRisk, 
  updateRisk, 
  removeRisk,
  calculateRiskScore,
  getRiskCriticality 
} from '@/lib/api/risksClient';

// Liste
const risks = await listRisks('REQ-2024-001');

// Ajouter
const newRisk = await addRisk('REQ-2024-001', {
  category: 'Budget',
  probability: 4,
  impact: 5,
  mitigation: 'Prévoir marge',
});

// Calcul de criticité
const score = calculateRiskScore(4, 5); // 20
const criticality = getRiskCriticality(score); // { label: 'CRITIQUE', color: 'red', ... }

// Mettre à jour
const updatedRisk = await updateRisk('REQ-2024-001', 'RISK_ID', {
  probability: 2,
});

// Supprimer
await removeRisk('REQ-2024-001', 'RISK_ID');
```

---

## 🎣 Hooks React

### useTasks

```typescript
import { useTasks } from '@/hooks';

function MyComponent({ demandId }: { demandId: string }) {
  const { tasks, loading, error, add, update, remove } = useTasks(demandId);

  const handleAddTask = async () => {
    const newTask = await add({
      title: 'Nouvelle tâche',
      status: 'OPEN',
    });
    console.log('Tâche créée:', newTask?.id);
  };

  const handleCompleteTask = async (taskId: string) => {
    await update(taskId, { status: 'DONE' });
  };

  return (
    <div>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error.message}</p>}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} - {task.status}
            <button onClick={() => handleCompleteTask(task.id)}>
              Terminer
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleAddTask}>Ajouter une tâche</button>
    </div>
  );
}
```

---

### useRisks

```typescript
import { useRisks } from '@/hooks';
import { calculateRiskScore, getRiskCriticality } from '@/lib/api/risksClient';

function MyComponent({ demandId }: { demandId: string }) {
  const { risks, loading, error, add, update, remove } = useRisks(demandId);

  const handleAddRisk = async () => {
    const newRisk = await add({
      category: 'Technique',
      probability: 3,
      impact: 4,
    });
    console.log('Risque créé:', newRisk?.id);
  };

  return (
    <div>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error.message}</p>}
      <ul>
        {risks.map((risk) => {
          const score = calculateRiskScore(risk.probability, risk.impact);
          const criticality = getRiskCriticality(score);
          return (
            <li key={risk.id}>
              {risk.category} - Score: {score} ({criticality.label})
              <button onClick={() => remove(risk.id)}>Supprimer</button>
            </li>
          );
        })}
      </ul>
      <button onClick={handleAddRisk}>Ajouter un risque</button>
    </div>
  );
}
```

---

## ✅ Checklist

### Tasks
- [x] GET `/api/demands/[id]/tasks`
- [x] POST `/api/demands/[id]/tasks`
- [x] PATCH `/api/demands/[id]/tasks/[tid]`
- [x] DELETE `/api/demands/[id]/tasks/[tid]`
- [x] Service client `tasksClient.ts`
- [x] Hook React `useTasks`
- [x] Auto-completion `completedAt` si status `DONE`
- [x] Audit trail pour toutes les opérations

### Risks
- [x] GET `/api/demands/[id]/risks`
- [x] POST `/api/demands/[id]/risks`
- [x] PATCH `/api/demands/[id]/risks/[rid]`
- [x] DELETE `/api/demands/[id]/risks/[rid]`
- [x] Service client `risksClient.ts`
- [x] Hook React `useRisks`
- [x] Validation probability/impact (1..5)
- [x] Helpers `calculateRiskScore` et `getRiskCriticality`
- [x] Distinction risques/opportunités
- [x] Audit trail pour toutes les opérations

---

## 🎯 Status

**Version** : 1.2.0  
**API Tasks** : ✅ Production-Ready  
**API Risks** : ✅ Production-Ready  
**Hooks** : ✅ Fonctionnels  
**Documentation** : ✅ Complète

---

## 📖 Prochaines Étapes

1. **Tester les API** : Suivre les commandes curl ci-dessus
2. **UI Components** :
   - `TaskBoard` - Kanban des tâches
   - `RiskMatrix` - Matrice 5×5 visuelle
   - `TaskModal` - Ajouter/Éditer tâche
   - `RiskModal` - Ajouter/Éditer risque
3. **Intégration dans `DemandTab`** : Afficher tâches et risques dans l'onglet demande

---

**API complète et documentée ! Prêt pour l'intégration UI !** 🚀✨

