# 🗂️ Workspace Store - Gestion des Onglets

## 🎯 Vue d'ensemble

**Store Zustand** pour gérer un système d'onglets (tabs) dans l'application, similaire à VS Code ou un navigateur.

**Fichier** : `src/lib/stores/workspaceStore.ts`

---

## 📋 Types

### WorkspaceTab (Union Type)

Deux types d'onglets disponibles :

#### 1. Onglet "Inbox" (File de demandes)

```typescript
{
  id: string;              // ex: "inbox:pending", "inbox:urgent"
  type: 'inbox';
  title: string;           // ex: "File À Traiter"
  icon?: string;           // ex: "📥"
  data: { 
    queue: 'pending' | 'urgent' | 'overdue' | 'validated' | 'rejected' | 'all' 
  };
}
```

#### 2. Onglet "Demand" (Demande spécifique)

```typescript
{
  id: string;              // ex: "demand:REQ-2024-001"
  type: 'demand';
  title: string;           // ex: "REQ-2024-001"
  icon?: string;           // ex: "📄"
  data: { 
    id: string             // ID de la demande
  };
}
```

---

## 🔧 API du Store

### État

```typescript
{
  tabs: WorkspaceTab[];        // Liste des onglets ouverts
  activeTabId: string | null;  // ID de l'onglet actif
}
```

### Actions

#### `openTab(tab: WorkspaceTab)`

Ouvre un nouvel onglet ou active un onglet existant.

```typescript
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';

const { openTab } = useWorkspaceStore();

// Ouvrir une file
openTab({
  id: 'inbox:pending',
  type: 'inbox',
  title: 'File À Traiter',
  icon: '📥',
  data: { queue: 'pending' }
});

// Ouvrir une demande spécifique
openTab({
  id: 'demand:REQ-2024-001',
  type: 'demand',
  title: 'REQ-2024-001',
  icon: '📄',
  data: { id: 'REQ-2024-001' }
});
```

**Comportement** :
- Si l'onglet existe déjà (même `id`), il devient simplement actif
- Sinon, il est ajouté à la fin et devient actif

---

#### `closeTab(id: string)`

Ferme un onglet.

```typescript
const { closeTab } = useWorkspaceStore();

closeTab('inbox:pending');
```

**Comportement** :
- Si l'onglet fermé était actif, le dernier onglet restant devient actif
- Si aucun onglet ne reste, `activeTabId` devient `null`

---

#### `setActive(id: string)`

Change l'onglet actif.

```typescript
const { setActive } = useWorkspaceStore();

setActive('inbox:urgent');
```

---

#### `updateTabTitle(id: string, title: string)`

Met à jour le titre d'un onglet.

```typescript
const { updateTabTitle } = useWorkspaceStore();

updateTabTitle('demand:REQ-2024-001', 'REQ-2024-001 - Validée ✅');
```

---

## 💻 Exemples d'utilisation

### Exemple 1 : Barre d'onglets

```tsx
'use client';

import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { X } from 'lucide-react';

export function WorkspaceTabs() {
  const { tabs, activeTabId, setActive, closeTab } = useWorkspaceStore();

  return (
    <div className="flex gap-1 border-b">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={cn(
            'flex items-center gap-2 px-3 py-2 cursor-pointer',
            activeTabId === tab.id && 'bg-blue-500/10 border-b-2 border-blue-500'
          )}
          onClick={() => setActive(tab.id)}
        >
          {tab.icon && <span>{tab.icon}</span>}
          <span>{tab.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            className="ml-2"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### Exemple 2 : Contenu des onglets

```tsx
'use client';

import { useWorkspaceStore } from '@/lib/stores/workspaceStore';

export function WorkspaceContent() {
  const { tabs, activeTabId } = useWorkspaceStore();

  const activeTab = tabs.find(t => t.id === activeTabId);

  if (!activeTab) {
    return <div>Aucun onglet ouvert</div>;
  }

  // Rendu selon le type d'onglet
  if (activeTab.type === 'inbox') {
    return <InboxTab queue={activeTab.data.queue} />;
  }

  if (activeTab.type === 'demand') {
    return <DemandTab demandId={activeTab.data.id} />;
  }

  return null;
}
```

---

### Exemple 3 : Boutons d'action

```tsx
'use client';

import { useWorkspaceStore } from '@/lib/stores/workspaceStore';

export function ActionButtons() {
  const { openTab } = useWorkspaceStore();

  return (
    <div className="flex gap-2">
      <button onClick={() => openTab({
        id: 'inbox:pending',
        type: 'inbox',
        title: 'À traiter',
        icon: '📥',
        data: { queue: 'pending' }
      })}>
        📥 À traiter
      </button>

      <button onClick={() => openTab({
        id: 'inbox:urgent',
        type: 'inbox',
        title: 'Urgentes',
        icon: '🔥',
        data: { queue: 'urgent' }
      })}>
        🔥 Urgentes
      </button>

      <button onClick={() => openTab({
        id: 'inbox:overdue',
        type: 'inbox',
        title: 'En retard',
        icon: '⏱️',
        data: { queue: 'overdue' }
      })}>
        ⏱️ En retard
      </button>
    </div>
  );
}
```

---

### Exemple 4 : Ouvrir une demande depuis une liste

```tsx
'use client';

import { useWorkspaceStore } from '@/lib/stores/workspaceStore';

export function DemandCard({ demand }: { demand: Demand }) {
  const { openTab } = useWorkspaceStore();

  const handleClick = () => {
    openTab({
      id: `demand:${demand.id}`,
      type: 'demand',
      title: demand.id,
      icon: '📄',
      data: { id: demand.id }
    });
  };

  return (
    <div onClick={handleClick} className="cursor-pointer p-3 border rounded">
      <div className="font-medium">{demand.subject}</div>
      <div className="text-sm text-muted">{demand.id}</div>
    </div>
  );
}
```

---

### Exemple 5 : Raccourcis clavier

```tsx
'use client';

import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { useEffect } from 'react';

export function KeyboardShortcuts() {
  const { tabs, activeTabId, setActive, closeTab } = useWorkspaceStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+W : Fermer l'onglet actif
      if (e.ctrlKey && e.key === 'w' && activeTabId) {
        e.preventDefault();
        closeTab(activeTabId);
      }

      // Ctrl+Tab : Onglet suivant
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        if (tabs[nextIndex]) {
          setActive(tabs[nextIndex].id);
        }
      }

      // Ctrl+1 à Ctrl+9 : Accès direct
      if (e.ctrlKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (tabs[index]) {
          setActive(tabs[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, setActive, closeTab]);

  return null;
}
```

---

## 🎯 Patterns Avancés

### Pattern 1 : Persistence (localStorage)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkspaceStore = create<State>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      // ... actions
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId
      })
    }
  )
);
```

---

### Pattern 2 : Limite d'onglets

```typescript
openTab: (tab) => {
  const MAX_TABS = 10;
  const exists = get().tabs.find((t) => t.id === tab.id);
  
  if (exists) {
    set({ activeTabId: tab.id });
    return;
  }

  set((s) => {
    let nextTabs = [...s.tabs, tab];
    
    // Fermer le plus ancien si limite atteinte
    if (nextTabs.length > MAX_TABS) {
      nextTabs = nextTabs.slice(1);
    }

    return {
      tabs: nextTabs,
      activeTabId: tab.id,
    };
  });
},
```

---

### Pattern 3 : Confirmation avant fermeture

```typescript
export function WorkspaceTabWithConfirm({ tab }: { tab: WorkspaceTab }) {
  const { closeTab } = useWorkspaceStore();
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleClose = () => {
    if (unsavedChanges) {
      if (confirm('Des modifications non sauvegardées seront perdues. Continuer ?')) {
        closeTab(tab.id);
      }
    } else {
      closeTab(tab.id);
    }
  };

  return (
    <div>
      {/* Tab content */}
      <button onClick={handleClose}>×</button>
    </div>
  );
}
```

---

## 🎨 Intégration avec l'application

### Structure recommandée

```
app/(portals)/maitre-ouvrage/demandes/
├── page.tsx                    # Page principale avec boutons
├── workspace/
│   ├── WorkspaceTabs.tsx      # Barre d'onglets
│   ├── WorkspaceContent.tsx   # Contenu selon type
│   ├── InboxTab.tsx           # Contenu pour type "inbox"
│   └── DemandTab.tsx          # Contenu pour type "demand"
```

---

## 🎉 Résumé

**Workspace Store** : Gestion d'onglets type VS Code

**Types d'onglets** :
- `inbox` - Files de demandes (pending, urgent, overdue...)
- `demand` - Demande spécifique

**Actions** :
- `openTab()` - Ouvrir/Activer
- `closeTab()` - Fermer
- `setActive()` - Changer actif
- `updateTabTitle()` - Mettre à jour titre

**Avantages** :
- ✅ Type-safe (TypeScript)
- ✅ Réactif (Zustand)
- ✅ Flexible (Union types)
- ✅ Extensible (facile d'ajouter de nouveaux types)

**UX** :
- Navigation fluide entre demandes
- Pas de perte de contexte
- Multi-tasking efficace

---

## 📚 Liens utiles

- **Store** : `src/lib/stores/workspaceStore.ts`
- **Architecture** : [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Composants** : `src/components/features/bmo/workspace/`

