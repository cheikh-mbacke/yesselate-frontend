# 🗂️ Workspace System - Système d'Onglets Complet

## 🎯 Vue d'ensemble

**Système d'onglets complet** type VS Code / Browser pour la navigation entre différentes vues de demandes.

**Architecture** : Store Zustand + Composants React + Types TypeScript

---

## 📋 Table des Matières

1. [Architecture](#-architecture)
2. [Store Zustand](#-store-zustand)
3. [Composants UI](#-composants-ui)
4. [Types d'onglets](#-types-donglets)
5. [Intégration](#-intégration)
6. [Exemples d'utilisation](#-exemples-dutilisation)
7. [Bonnes pratiques](#-bonnes-pratiques)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│  📄 Page Principale (DemandesPage)          │
│  - Boutons d'action (À traiter, Urgentes...)│
│  - WorkspaceTabs (barre d'onglets)          │
│  - WorkspaceContent (contenu actif)         │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  🗂️ WorkspaceTabs                           │
│  - Affiche la liste des onglets ouverts    │
│  - Gère la sélection / fermeture           │
│  - Boutons "Autres" / "Tout" (optionnel)   │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  📦 useWorkspaceStore (Zustand)             │
│  - tabs: WorkspaceTab[]                     │
│  - activeTabId: string | null               │
│  - openTab(), closeTab(), setActive()      │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  📺 WorkspaceContent                        │
│  - Rend le contenu de l'onglet actif       │
│  - InboxTab (files)                         │
│  - DemandTab (demande spécifique)          │
│  - BureauTab, TimelineTab, etc.            │
└─────────────────────────────────────────────┘
```

---

## 📦 Store Zustand

### Fichier

`src/lib/stores/workspaceStore.ts`

### Types

```typescript
export type WorkspaceTab =
  | {
      id: string;              // ex: "inbox:pending"
      type: 'inbox';
      title: string;           // ex: "File À Traiter"
      icon?: string;           // ex: "📥"
      data: { queue: 'pending' | 'urgent' | 'overdue' | 'validated' | 'rejected' | 'all' };
    }
  | {
      id: string;              // ex: "demand:REQ-2024-001"
      type: 'demand';
      title: string;           // ex: "REQ-2024-001"
      icon?: string;           // ex: "📄"
      data: { id: string };
    };
```

### API

```typescript
const {
  tabs,           // WorkspaceTab[]
  activeTabId,    // string | null
  openTab,        // (tab: WorkspaceTab) => void
  closeTab,       // (id: string) => void
  setActive,      // (id: string) => void
  updateTabTitle, // (id: string, title: string) => void
} = useWorkspaceStore();
```

👉 **Documentation détaillée** : [`WORKSPACE_STORE.md`](./WORKSPACE_STORE.md)

---

## 🎨 Composants UI

### 1. WorkspaceTabs

**Fichier** : `src/components/features/bmo/workspace/WorkspaceTabs.tsx`

**Rôle** : Barre d'onglets horizontale avec boutons de gestion.

**Fonctionnalités** :
- Affiche tous les onglets ouverts
- Highlight de l'onglet actif
- Clic sur onglet → Change actif
- Clic sur `X` → Ferme l'onglet
- Boutons "Autres" / "Tout" pour fermer plusieurs onglets

**Usage** :

```tsx
import { WorkspaceTabs } from '@/components/features/bmo/workspace';

export default function DemandesPage() {
  return (
    <div>
      <WorkspaceTabs />
      {/* autres composants */}
    </div>
  );
}
```

---

### 2. WorkspaceContent

**Fichier** : `src/components/features/bmo/workspace/WorkspaceContent.tsx`

**Rôle** : Rend le contenu de l'onglet actif.

**Logique** :
1. Si aucun onglet ouvert → Message d'accueil
2. Si `type === 'inbox'` → Rend `InboxTab`
3. Si `type === 'demand'` → Rend `DemandTab`
4. Extensible pour d'autres types (bureau, timeline, analytics...)

**Usage** :

```tsx
import { WorkspaceContent } from '@/components/features/bmo/workspace';

export default function DemandesPage() {
  return (
    <div>
      <WorkspaceTabs />
      <WorkspaceContent />
    </div>
  );
}
```

---

### 3. Tabs (Contenu)

**Fichiers** : `src/components/features/bmo/workspace/tabs/`

#### InboxTab

**Rôle** : Affiche une file de demandes (pending, urgent, overdue...).

**Props** :

```typescript
interface InboxTabProps {
  queue: 'pending' | 'urgent' | 'overdue' | 'validated' | 'rejected' | 'all';
}
```

**Fonctionnalités** :
- Liste virtualisée des demandes (performance)
- Filtres, tri, recherche
- Actions rapides (valider, rejeter, assigner)
- Clic sur demande → Ouvre `DemandTab`

---

#### DemandTab

**Rôle** : Affiche une demande spécifique avec détails + historique.

**Props** :

```typescript
interface DemandTabProps {
  id: string; // ex: "REQ-2024-001"
}
```

**Fonctionnalités** :
- Détails de la demande
- Historique (événements)
- Actions (valider, rejeter, assigner, demander complément)
- Breadcrumb / Navigation

---

#### Autres Tabs (futurs)

| Tab | Rôle |
|-----|------|
| `BureauTab` | Vue par bureau (FIN, JUR, IT...) |
| `TimelineTab` | Timeline des événements |
| `SlaReportTab` | Rapport SLA / KPIs |
| `AnalyticsTab` | Graphiques / Analytics |

---

## 📑 Types d'onglets

### Type 1 : Inbox (File)

**Utilisation** : Lister des demandes selon un critère (statut, priorité, SLA).

**Exemples** :

```typescript
// File "À traiter"
{
  id: 'inbox:pending',
  type: 'inbox',
  title: 'À traiter',
  icon: '📥',
  data: { queue: 'pending' }
}

// File "Urgentes"
{
  id: 'inbox:urgent',
  type: 'inbox',
  title: 'Urgences Critiques',
  icon: '🔥',
  data: { queue: 'urgent' }
}

// File "En retard SLA"
{
  id: 'inbox:overdue',
  type: 'inbox',
  title: 'Retards SLA',
  icon: '⏱️',
  data: { queue: 'overdue' }
}
```

---

### Type 2 : Demand (Demande)

**Utilisation** : Afficher une demande spécifique.

**Exemple** :

```typescript
{
  id: 'demand:REQ-2024-001',
  type: 'demand',
  title: 'REQ-2024-001',
  icon: '📄',
  data: { id: 'REQ-2024-001' }
}
```

---

### Extensibilité (futurs types)

```typescript
export type WorkspaceTab =
  | { type: 'inbox'; ... }
  | { type: 'demand'; ... }
  | { type: 'bureau'; data: { bureau: string } }
  | { type: 'timeline'; data: { from: Date; to: Date } }
  | { type: 'sla-report'; data: { period: string } }
  | { type: 'analytics'; data: { view: string } };
```

---

## 🔌 Intégration

### Page Principale

**Fichier** : `app/(portals)/maitre-ouvrage/demandes/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { WorkspaceTabs, WorkspaceContent } from '@/components/features/bmo/workspace';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { FluentResponsiveContainer } from '@/components/ui/fluent-responsive-container';
import { ThemeToggle } from '@/components/features/bmo/ThemeToggle';
import { QuickStatsModal } from '@/components/features/bmo/QuickStatsModal';
import { ExportModal } from '@/components/features/bmo/modals/ExportModal';

export default function DemandesPage() {
  const { openTab } = useWorkspaceStore();
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <FluentResponsiveContainer variant="full" className="py-4 space-y-4 min-h-screen">
      {/* Header avec boutons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[rgb(var(--text))]">
          Console métier — Demandes
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          
          <Button
            size="sm"
            variant="warning"
            onClick={() => openTab({ 
              type: 'inbox', 
              id: 'inbox:pending', 
              title: 'File À Traiter', 
              icon: '📥', 
              data: { queue: 'pending' } 
            })}
          >
            📥 À traiter
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => openTab({ 
              type: 'inbox', 
              id: 'inbox:urgent', 
              title: 'Urgences Critiques', 
              icon: '🔥', 
              data: { queue: 'urgent' } 
            })}
          >
            🔥 Urgentes
          </Button>

          <Button
            size="sm"
            variant="warning"
            onClick={() => openTab({ 
              type: 'inbox', 
              id: 'inbox:overdue', 
              title: 'Retards SLA', 
              icon: '⏱️', 
              data: { queue: 'overdue' } 
            })}
          >
            ⏱️ En retard
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setStatsModalOpen(true)}
          >
            📊 Stats Live
          </Button>

          <Button
            size="sm"
            variant="success"
            onClick={() => openTab({ 
              type: 'inbox', 
              id: 'inbox:validated', 
              title: 'Demandes Validées', 
              icon: '✅', 
              data: { queue: 'validated' } 
            })}
          >
            ✅ Validées
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setExportModalOpen(true)}
          >
            📤 Export
          </Button>
        </div>
      </div>

      {/* Workspace */}
      <WorkspaceTabs />
      <WorkspaceContent />

      {/* Modals */}
      <QuickStatsModal open={statsModalOpen} onOpenChange={setStatsModalOpen} />
      <ExportModal open={exportModalOpen} onOpenChange={setExportModalOpen} />
    </FluentResponsiveContainer>
  );
}
```

---

## 💻 Exemples d'utilisation

### Exemple 1 : Ouvrir une file depuis un bouton

```tsx
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';

function ActionButtons() {
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

### Exemple 2 : Ouvrir une demande depuis une liste

```tsx
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';

function DemandCard({ demand }: { demand: Demand }) {
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
    <div onClick={handleClick} className="cursor-pointer">
      {demand.subject}
    </div>
  );
}
```

---

### Exemple 3 : Fermer tous les onglets

```tsx
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';

function CloseAllButton() {
  const { tabs, closeTab } = useWorkspaceStore();

  const handleCloseAll = () => {
    tabs.forEach(tab => closeTab(tab.id));
  };

  return <button onClick={handleCloseAll}>Fermer tout</button>;
}
```

---

### Exemple 4 : Mettre à jour le titre d'un onglet

```tsx
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';

function DemandTab({ id }: { id: string }) {
  const { updateTabTitle } = useWorkspaceStore();
  const [demand, setDemand] = useState<Demand | null>(null);

  useEffect(() => {
    // Fetch demand
    fetchDemand(id).then(d => {
      setDemand(d);
      // Update tab title with demand subject
      updateTabTitle(`demand:${id}`, `${id} - ${d.subject}`);
    });
  }, [id, updateTabTitle]);

  // ... render demand
}
```

---

## 🎯 Bonnes pratiques

### 1. IDs d'onglets uniques

Utilisez un préfixe clair pour éviter les collisions :

```typescript
// ✅ Bon
id: 'inbox:pending'
id: 'inbox:urgent'
id: 'demand:REQ-2024-001'

// ❌ Mauvais
id: 'pending'
id: 'urgent'
id: 'REQ-2024-001'
```

---

### 2. Éviter les doublons

Le store gère automatiquement les doublons : si un onglet avec le même `id` existe, il devient simplement actif au lieu de créer un doublon.

---

### 3. Titres descriptifs

```typescript
// ✅ Bon
title: 'File À Traiter (12)'
title: 'REQ-2024-001 - Budget Alpha'

// ❌ Mauvais
title: 'À traiter'
title: 'REQ-2024-001'
```

---

### 4. Icônes cohérentes

```typescript
const ICONS = {
  inbox: {
    pending: '📥',
    urgent: '🔥',
    overdue: '⏱️',
    validated: '✅',
    rejected: '❌',
  },
  demand: '📄',
  bureau: '🏢',
  timeline: '📅',
  analytics: '📊',
};
```

---

### 5. Confirmation avant fermeture (optionnel)

```tsx
const handleClose = (tabId: string) => {
  const tab = tabs.find(t => t.id === tabId);
  
  if (tab?.type === 'demand' && hasUnsavedChanges(tab.data.id)) {
    if (!confirm('Des modifications non sauvegardées seront perdues. Continuer ?')) {
      return;
    }
  }
  
  closeTab(tabId);
};
```

---

### 6. Limite d'onglets (optionnel)

```tsx
const MAX_TABS = 10;

const openTab = (tab: WorkspaceTab) => {
  if (tabs.length >= MAX_TABS) {
    toast.error(`Maximum ${MAX_TABS} onglets autorisés`);
    return;
  }
  
  store.openTab(tab);
};
```

---

## 🚀 Fonctionnalités Avancées

### Persistence (localStorage)

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
    }
  )
);
```

---

### Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+W` | Fermer onglet actif |
| `Ctrl+Tab` | Onglet suivant |
| `Ctrl+Shift+Tab` | Onglet précédent |
| `Ctrl+1` à `Ctrl+9` | Accès direct |

👉 Voir exemple dans [`WORKSPACE_STORE.md`](./WORKSPACE_STORE.md)

---

### Drag & Drop (réorganisation)

Utiliser `@dnd-kit/core` pour réorganiser les onglets par glisser-déposer.

---

### Split View (future)

Afficher 2 onglets côte à côte (comme VS Code).

---

## 📂 Structure des Fichiers

```
src/
├── lib/stores/
│   └── workspaceStore.ts           # Store Zustand
│
└── components/features/bmo/workspace/
    ├── WorkspaceTabs.tsx           # Barre d'onglets
    ├── WorkspaceContent.tsx        # Contenu actif
    ├── index.ts                    # Exports
    └── tabs/
        ├── InboxTab.tsx            # Tab "File"
        ├── DemandTab.tsx           # Tab "Demande"
        ├── BureauTab.tsx           # Tab "Bureau" (futur)
        ├── TimelineTab.tsx         # Tab "Timeline" (futur)
        ├── SlaReportTab.tsx        # Tab "SLA Report" (futur)
        └── AnalyticsTab.tsx        # Tab "Analytics" (futur)
```

---

## ✅ Checklist d'intégration

- [ ] Store `useWorkspaceStore` créé
- [ ] Composant `WorkspaceTabs` créé
- [ ] Composant `WorkspaceContent` créé
- [ ] Composant `InboxTab` créé
- [ ] Composant `DemandTab` créé
- [ ] Page principale intègre `WorkspaceTabs` + `WorkspaceContent`
- [ ] Boutons d'action ouvrent des onglets
- [ ] Clic sur demande ouvre un `DemandTab`
- [ ] Fermeture d'onglets fonctionne
- [ ] Onglet actif est highlight
- [ ] Message affiché si aucun onglet ouvert
- [ ] Types TypeScript sont corrects
- [ ] Documentation lue

---

## 🎉 Résultat Final

### UX Moderne

- ✅ Navigation fluide type VS Code
- ✅ Multi-tasking (plusieurs demandes ouvertes)
- ✅ Pas de perte de contexte
- ✅ Animations Fluent Design

### Architecture Propre

- ✅ Store Zustand centralisé
- ✅ Composants découplés
- ✅ Types TypeScript stricts
- ✅ Extensible facilement

### Performance

- ✅ Onglets chargés à la demande
- ✅ `useMemo` pour optimisations
- ✅ Listes virtualisées (InboxTab)

---

## 📚 Liens Utiles

- **Store** : [`WORKSPACE_STORE.md`](./WORKSPACE_STORE.md)
- **Architecture** : [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **API Services** : [`API_SERVICES.md`](./API_SERVICES.md)
- **Modals** : [`FLUENT_MODALS.md`](./FLUENT_MODALS.md)

---

# 🏆 **WORKSPACE SYSTEM COMPLET ET OPÉRATIONNEL !**

**Version** : 1.0.0  
**Status** : ✅ **Production Ready**  
**UX** : 🎨 **VS Code-like**  
**Performance** : ⚡ **Optimisée**

