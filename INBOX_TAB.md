# 📥 InboxTab - Composant de File de Demandes

## 🎯 Vue d'ensemble

**InboxTab** est un composant React avancé pour afficher et gérer une file de demandes avec **sélection multiple**, **actions en masse**, **recherche**, et **navigation fluide**.

**Fichier** : `src/components/features/bmo/workspace/tabs/InboxTab.tsx`

---

## ✨ Fonctionnalités Principales

### 1. Affichage de Liste
- ✅ Liste scrollable de demandes
- ✅ Header sticky avec checkbox "tout sélectionner"
- ✅ Affichage des badges (priorité, statut, bureau, montant)
- ✅ États vide et chargement

### 2. Sélection Multiple
- ✅ Checkbox par ligne
- ✅ Checkbox "tout sélectionner" (header)
- ✅ Compteur de sélection
- ✅ Purge automatique sur refresh

### 3. Actions en Masse
- ✅ **Valider** (batch)
- ✅ **Rejeter** (batch)
- ✅ **Affecter** (batch)
- ✅ **Demander complément** (1 demande)
- ✅ **Ouvrir** (1 demande)
- ✅ Transactions atomiques (rollback en cas d'erreur)

### 4. Recherche
- ✅ Recherche optionnelle (toggle)
- ✅ Recherche dans ID, bureau, type, mot-clé
- ✅ Input avec bouton "Appliquer"
- ✅ Fermeture et reset

### 5. Refresh
- ✅ Bouton "Rafraîchir" manuel
- ✅ Refresh automatique après chaque action
- ✅ Source de vérité = DB

### 6. Navigation
- ✅ Clic sur ligne → Ouvre onglet `DemandTab`
- ✅ Intégration avec `useWorkspaceStore`
- ✅ Titre intelligent (ID + sujet)

### 7. Gestion d'erreurs
- ✅ Affichage des erreurs
- ✅ Gestion des actions ignorées (skipped)
- ✅ Messages clairs

---

## 📋 Props

```typescript
interface InboxTabProps {
  queue: 'pending' | 'urgent' | 'overdue' | 'validated' | 'rejected' | 'all';
}
```

### Queue Types

| Queue | Description | Label |
|-------|-------------|-------|
| `pending` | Demandes à traiter | "File — À traiter" |
| `urgent` | Demandes urgentes | "File — Urgences" |
| `overdue` | Demandes en retard SLA | "File — Retards SLA" |
| `validated` | Demandes validées | "Historique — Validées" |
| `rejected` | Demandes rejetées | "Historique — Rejetées" |
| `all` | Toutes les demandes | "Toutes les demandes" |

---

## 🎨 Interface Utilisateur

### Structure

```
┌─────────────────────────────────────────────┐
│ Header                                       │
│ - Titre + Compteur                          │
│ - Bouton "Rafraîchir" + "Rechercher"       │
│ - [Optionnel] Input recherche               │
├─────────────────────────────────────────────┤
│ Barre d'actions                             │
│ - Compteur sélection                        │
│ - Boutons : Ouvrir, Valider, Rejeter...    │
├─────────────────────────────────────────────┤
│ Liste (scrollable)                          │
│ ┌───┬─────────────────┬────────────┐       │
│ │☐  │ Demande         │ Statut     │       │
│ ├───┼─────────────────┼────────────┤       │
│ │☐  │ REQ-2024-001    │ À traiter  │       │
│ │   │ FIN | Élevée    │            │       │
│ │   │ Budget Alpha    │            │       │
│ └───┴─────────────────┴────────────┘       │
└─────────────────────────────────────────────┘
```

### Badges

#### Priorité

| Priorité | Badge | Couleur |
|----------|-------|---------|
| `urgent` | "Urgent" | Rouge |
| `high` | "Élevée" | Ambre |
| `normal` | "Normale" | Gris |
| `low` | "Basse" | Gris |

#### Statut

| Statut | Badge | Couleur |
|--------|-------|---------|
| `pending` | "À traiter" | Ambre |
| `validated` | "Validée" | Vert |
| `rejected` | "Rejetée" | Rouge |

#### Icônes

- **Retard SLA** (overdue) : Icône horloge ⏱️

---

## 💻 Utilisation

### Exemple de Base

```tsx
import { InboxTab } from '@/components/features/bmo/workspace/tabs/InboxTab';

export function MyPage() {
  return <InboxTab queue="pending" />;
}
```

---

### Intégration avec WorkspaceContent

```tsx
import { WorkspaceContent } from '@/components/features/bmo/workspace';

// Dans WorkspaceContent.tsx
if (active.type === 'inbox') {
  return <InboxTab queue={active.data.queue} />;
}
```

---

### Ouvrir depuis un bouton

```tsx
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';

function ActionButton() {
  const { openTab } = useWorkspaceStore();

  return (
    <button onClick={() => openTab({
      id: 'inbox:pending',
      type: 'inbox',
      title: 'À traiter',
      icon: '📥',
      data: { queue: 'pending' }
    })}>
      📥 À traiter
    </button>
  );
}
```

---

## 🚀 Services API Utilisés

### 1. `listDemands(queue, q)`

**Fichier** : `src/lib/api/demandesClient.ts`

**Rôle** : Récupérer la liste des demandes selon la file et la recherche.

```typescript
const data = await listDemands('pending', 'budget');
```

---

### 2. `batchTransition(ids, payload)`

**Fichier** : `src/lib/api/demandesClient.ts`

**Rôle** : Effectuer une action en masse sur plusieurs demandes.

```typescript
const res = await batchTransition(['REQ-2024-001', 'REQ-2024-002'], {
  action: 'validate',
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  details: 'Approuvé',
});

// Résultat
// res.updated: ['REQ-2024-001', 'REQ-2024-002']
// res.skipped: []
```

---

## 🎯 Actions Métier

### 1. Valider (Batch)

**Action** : `validate`

**Conditions** :
- ✅ Au moins 1 demande sélectionnée
- ✅ Queue ≠ `validated` ou `rejected`

**Comportement** :
- Valide toutes les demandes sélectionnées
- Refresh automatique
- Affiche les éléments ignorés

```typescript
const doBatch = async (action: 'validate' | 'reject', details?: string) => {
  if (selectedIds.length === 0) return;
  
  const res = await batchTransition(selectedIds, {
    action,
    details,
    actorId: 'USR-001',
    actorName: 'A. DIALLO',
  });

  await refresh();

  if (res.skipped.length) {
    setErr(`Certaines demandes ignorées (${res.skipped.length}) : ${res.skipped[0].reason}`);
  }
  
  setSelected({});
};
```

---

### 2. Rejeter (Batch)

**Action** : `reject`

**Conditions** : Identiques à "Valider"

---

### 3. Affecter (Batch)

**Action** : `assign`

**Modal** : `AssignModal`

**Conditions** :
- ✅ Au moins 1 demande sélectionnée

**Inputs** :
- `employeeId` (ex: "EMP-001")
- `employeeName` (ex: "C. DUPONT")

```typescript
<AssignModal
  open={assignOpen}
  onOpenChange={setAssignOpen}
  onAssign={async ({ employeeId, employeeName }) => {
    const res = await batchTransition(selectedIds, {
      action: 'assign',
      employeeId,
      employeeName,
      actorId: 'USR-001',
      actorName: 'A. DIALLO',
    });
    
    await refresh();
    setSelected({});
  }}
/>
```

---

### 4. Demander Complément (Single)

**Action** : `request_complement`

**Modal** : `RequestComplementModal`

**Conditions** :
- ✅ Exactement 1 demande sélectionnée

**Input** :
- `message` (textarea)

```typescript
<RequestComplementModal
  open={complementOpen}
  onOpenChange={setComplementOpen}
  demandId={selectedOne}
  onSend={async (message) => {
    if (!selectedOne) return;
    
    await batchTransition([selectedOne], {
      action: 'request_complement',
      message,
      actorId: 'USR-001',
      actorName: 'A. DIALLO',
    });
    
    await refresh();
  }}
/>
```

---

### 5. Ouvrir (Single)

**Comportement** :
- Ouvre un onglet `DemandTab` avec la demande sélectionnée
- Utilise `useWorkspaceStore.openTab()`

```typescript
const openDemand = (id: string, subject?: string) => {
  openTab({
    type: 'demand',
    id: `demand:${id}`,
    title: subject ? `${id} — ${subject}` : id,
    icon: '📄',
    data: { id },
  });
};
```

---

## 🧠 Logique Interne

### État Local

```typescript
const [rows, setRows] = useState<Demand[]>([]);              // Liste des demandes
const [loading, setLoading] = useState(false);               // Indicateur de chargement
const [err, setErr] = useState<string | null>(null);         // Message d'erreur
const [showSearch, setShowSearch] = useState(false);         // Toggle recherche
const [q, setQ] = useState('');                              // Query recherche
const [selected, setSelected] = useState<Record<string, boolean>>({}); // Sélection
const [assignOpen, setAssignOpen] = useState(false);         // Modal affectation
const [complementOpen, setComplementOpen] = useState(false); // Modal complément
```

---

### Computed Values

```typescript
// IDs sélectionnés
const selectedIds = useMemo(
  () => Object.keys(selected).filter((id) => selected[id]),
  [selected]
);

// 1 seul ID sélectionné (pour actions single)
const selectedOne = selectedIds.length === 1 ? selectedIds[0] : null;
```

---

### Refresh Logic

```typescript
const refresh = async () => {
  setLoading(true);
  setErr(null);
  
  try {
    const data = await listDemands(queue, q);
    setRows(data);
    
    // Purge sélection : ne garde que les IDs encore présents
    setSelected((prev) => {
      const next: Record<string, boolean> = {};
      for (const r of data) if (prev[r.id]) next[r.id] = true;
      return next;
    });
  } catch (e: unknown) {
    setErr((e as Error)?.message ?? 'Erreur');
  } finally {
    setLoading(false);
  }
};

// Refresh au montage et quand la queue change
useEffect(() => {
  refresh();
}, [queue]);
```

---

## 🎨 Design Fluent

### Couleurs

- **Surface** : `rgb(var(--surface)/0.6)` avec `backdrop-blur-md`
- **Border** : `rgb(var(--border)/0.5)`
- **Text** : `rgb(var(--text))`
- **Muted** : `rgb(var(--muted))`

### Transitions

- **Hover** : `hover:bg-[rgb(var(--surface)/0.6)]`
- **Cursor** : `cursor-pointer` sur les lignes

### Layout

- **Grid** : `grid-cols-[44px_1fr_180px]` (checkbox, contenu, statut)
- **Sticky Header** : `sticky top-0 z-10`
- **Scroll** : `max-h-[calc(100vh-320px)] overflow-auto`

---

## 🚀 Performance

### Optimisations

1. **`useMemo`** pour `selectedIds` et `selectedOne`
2. **Refresh intelligent** : purge sélection, évite re-renders inutiles
3. **Sélection locale** : pas de re-render global
4. **Actions atomiques** : transactions DB, rollback en cas d'erreur

### Scalabilité

- **Virtualisation** : Peut être ajoutée avec `@tanstack/react-virtual` si > 1000 demandes
- **Pagination** : API supporte `limit` parameter

---

## 🧪 Tests Manuels

### Test 1 : Affichage
1. Ouvrir file "À traiter"
2. Vérifier que les demandes s'affichent
3. Vérifier badges (priorité, statut, bureau)

### Test 2 : Sélection
1. Cocher 1 checkbox → Sélection = 1
2. Cocher "tout sélectionner" → Sélection = N
3. Décocher "tout sélectionner" → Sélection = 0

### Test 3 : Recherche
1. Cliquer "Rechercher"
2. Taper "budget"
3. Cliquer "Appliquer"
4. Vérifier résultats filtrés

### Test 4 : Actions Batch
1. Sélectionner 2 demandes
2. Cliquer "Valider"
3. Vérifier que les 2 demandes sont validées
4. Vérifier refresh automatique

### Test 5 : Affectation
1. Sélectionner 1+ demandes
2. Cliquer "Affecter"
3. Remplir ID + Nom
4. Cliquer "Affecter"
5. Vérifier affectation OK

### Test 6 : Ouvrir Demande
1. Cliquer sur une ligne
2. Vérifier qu'un onglet `DemandTab` s'ouvre
3. Vérifier titre = `ID — Sujet`

---

## 🎯 Dépendances

### Composants UI

| Composant | Rôle |
|-----------|------|
| `FluentCard` | Conteneur principal |
| `FluentButton` | Boutons d'action |
| `Input` | Champ recherche |
| `BureauTag` | Badge bureau |

### Modals

| Modal | Rôle |
|-------|------|
| `AssignModal` | Affectation employé |
| `RequestComplementModal` | Demande de complément |

### Services

| Service | Rôle |
|---------|------|
| `listDemands()` | Liste demandes |
| `batchTransition()` | Actions en masse |

### Stores

| Store | Rôle |
|-------|------|
| `useWorkspaceStore` | Navigation onglets |

---

## 🏆 Résumé

**InboxTab** est un composant **production-ready** pour la gestion de files de demandes :

- ✅ **Sélection multiple** : Checkbox + "tout sélectionner"
- ✅ **Actions en masse** : Valider, rejeter, affecter (batch)
- ✅ **Recherche** : Optionnelle, toggle, filtre DB
- ✅ **Navigation** : Ouverture onglets `DemandTab`
- ✅ **Design Fluent** : Moderne, responsive, accessible
- ✅ **Performance** : Optimisé, transactions atomiques
- ✅ **UX** : Refresh auto, gestion erreurs, feedback clair

---

## 📚 Liens Utiles

- **Workspace System** : [`WORKSPACE_SYSTEM.md`](./WORKSPACE_SYSTEM.md)
- **Bulk Actions** : [`BULK_ACTIONS.md`](./BULK_ACTIONS.md)
- **API Services** : [`API_SERVICES.md`](./API_SERVICES.md)
- **Workspace Store** : [`WORKSPACE_STORE.md`](./WORKSPACE_STORE.md)

---

# ✅ **InboxTab - Component Production-Ready !**

**Version** : 1.0.0  
**Status** : ✅ **Complet**  
**Performance** : ⚡ **Optimisée**  
**UX** : 🎨 **Fluent Design**

