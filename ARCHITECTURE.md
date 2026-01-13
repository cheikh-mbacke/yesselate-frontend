# 🏗️ Architecture de l'Application - Guide Complet

## 📊 Vue d'ensemble en 3 couches

```
┌─────────────────────────────────────────┐
│  🎨 PRESENTATION LAYER                  │
│  - React Components (Client/Server)    │
│  - Pages, Modals, Tabs                  │
└─────────────┬───────────────────────────┘
              │
     ┌────────┴────────┐
     │                 │
  Hooks         Services API
  (Client)      (Server + Client)
     │                 │
     ▼                 ▼
┌─────────────────────────────────────────┐
│  🔌 DATA ACCESS LAYER                   │
│  ├─ Hooks React (4)                     │
│  │  ├─ useDemandsDB                     │
│  │  ├─ useDemandActions                 │
│  │  ├─ useDemandsStats                  │
│  │  └─ useDemandsExport                 │
│  │                                       │
│  └─ Services API (5) ⭐                  │
│     ├─ listDemands()                    │
│     ├─ getDemand()                      │
│     ├─ transitionDemand()               │
│     ├─ getStats()                       │
│     └─ exportDemands()                  │
└─────────────┬───────────────────────────┘
              │
              │ HTTP/REST
              ▼
┌─────────────────────────────────────────┐
│  🚀 API LAYER (Next.js Routes)          │
│  - 9 REST Endpoints                     │
└─────────────┬───────────────────────────┘
              │
              │ Prisma ORM
              ▼
┌─────────────────────────────────────────┐
│  🗄️ DATABASE LAYER                      │
│  - SQLite (dev) / PostgreSQL (prod)     │
│  - 2 Tables: Demand + DemandEvent       │
└─────────────────────────────────────────┘
```

---

## 🎯 Quand utiliser quoi ?

### 1. 🪝 **Hooks React** (Client Components)

**Quand** :
- ✅ Vous êtes dans un **Client Component** (`'use client'`)
- ✅ Vous voulez la **gestion automatique** de `loading` / `error`
- ✅ Vous voulez un **state management** intégré
- ✅ Vous voulez la **simplicité** d'utilisation

**Exemple** :
```tsx
'use client';

import { useDemandsDB } from '@/hooks';

export default function DemandsPage() {
  const { fetchDemands, loading, error } = useDemandsDB();
  const [demands, setDemands] = useState([]);
  
  useEffect(() => {
    fetchDemands({ queue: 'pending' }).then(setDemands);
  }, []);
  
  if (loading) return <Skeleton />;
  if (error) return <Error message={error.message} />;
  
  return <DemandsList demands={demands} />;
}
```

**Avantages** :
- ⚡ **Plug & play** : Prêt à l'emploi
- 🎯 **State management** : `loading`, `error` automatiques
- 🔄 **React patterns** : Hooks standards

**Inconvénients** :
- ❌ Client-side uniquement
- ❌ Pas utilisable dans Server Components
- ❌ Pas utilisable dans Server Actions

---

### 2. 🔧 **Services API** (Server + Client)

**Quand** :
- ✅ Vous êtes dans un **Server Component**
- ✅ Vous écrivez une **Server Action**
- ✅ Vous créez une **nouvelle API Route**
- ✅ Vous voulez un **contrôle total**
- ✅ Vous avez besoin de **SSR** (Server-Side Rendering)

**Exemple** :
```tsx
// Server Component
import { listDemands } from '@/lib/api/demands';

export default async function DemandsPage() {
  const demands = await listDemands('pending');
  
  return <DemandsList demands={demands} />;
}
```

**Avantages** :
- ⚡ **Universel** : Client + Server
- 🚀 **SSR** : Rendu côté serveur
- 🎯 **Type-safe** : TypeScript complet
- 🔧 **Flexible** : Utilisable partout

**Inconvénients** :
- ❌ Pas de state management automatique
- ❌ Gestion manuelle de `loading`/`error` côté client

---

## 🎨 Patterns d'utilisation

### Pattern 1 : Server Component + Client Component

```tsx
// app/demandes/page.tsx (Server Component)
import { listDemands } from '@/lib/api/demands';
import { DemandsList } from './DemandsList';

export default async function DemandesPage() {
  // ✅ Récupération côté serveur (SSR)
  const initialDemands = await listDemands('pending');
  
  return <DemandsList initialDemands={initialDemands} />;
}
```

```tsx
// app/demandes/DemandsList.tsx (Client Component)
'use client';

import { useDemandsDB } from '@/hooks';
import { useState } from 'react';

export function DemandsList({ initialDemands }) {
  const [demands, setDemands] = useState(initialDemands);
  const { fetchDemands, loading } = useDemandsDB();
  
  const refresh = async () => {
    const fresh = await fetchDemands({ queue: 'pending' });
    setDemands(fresh);
  };
  
  return (
    <>
      <button onClick={refresh} disabled={loading}>
        Rafraîchir
      </button>
      {demands.map(d => <DemandCard key={d.id} demand={d} />)}
    </>
  );
}
```

**Avantages** :
- ⚡ **Première charge** : SSR ultra-rapide
- 🔄 **Réactivité** : Client-side updates
- 🎯 **Meilleur des deux mondes**

---

### Pattern 2 : Server Actions

```tsx
// app/actions/demands.ts
'use server';

import { transitionDemand } from '@/lib/api/demands';
import { revalidatePath } from 'next/cache';

export async function validateDemand(id: string) {
  await transitionDemand(id, {
    action: 'validate',
    actorId: 'USR-001',
    actorName: 'A. DIALLO',
    details: 'Approuvé'
  });
  
  // Invalider le cache Next.js
  revalidatePath('/demandes');
  
  return { success: true };
}

export async function rejectDemand(id: string, reason: string) {
  await transitionDemand(id, {
    action: 'reject',
    actorId: 'USR-001',
    actorName: 'A. DIALLO',
    details: reason
  });
  
  revalidatePath('/demandes');
  
  return { success: true };
}
```

```tsx
// app/demandes/DemandCard.tsx
'use client';

import { validateDemand } from '@/app/actions/demands';
import { useTransition } from 'react';

export function DemandCard({ demand }) {
  const [isPending, startTransition] = useTransition();
  
  const handleValidate = () => {
    startTransition(async () => {
      await validateDemand(demand.id);
    });
  };
  
  return (
    <div>
      <h3>{demand.subject}</h3>
      <button onClick={handleValidate} disabled={isPending}>
        {isPending ? 'Validation...' : 'Valider'}
      </button>
    </div>
  );
}
```

**Avantages** :
- ⚡ **Performance** : Pas de roundtrip API supplémentaire
- 🔒 **Sécurité** : Code côté serveur uniquement
- 🔄 **Optimistic UI** : Avec `useTransition`
- 🎯 **Cache invalidation** : Avec `revalidatePath`

---

### Pattern 3 : React Query (Recommandé pour apps complexes)

```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listDemands, transitionDemand } from '@/lib/api/demands';

export function DemandsPage() {
  const queryClient = useQueryClient();
  
  // ✅ Requête avec cache
  const { data: demands, isLoading } = useQuery({
    queryKey: ['demands', 'pending'],
    queryFn: () => listDemands('pending'),
    staleTime: 5000 // 5 secondes
  });
  
  // ✅ Mutation avec optimistic update
  const validateMutation = useMutation({
    mutationFn: (id: string) => transitionDemand(id, {
      action: 'validate',
      actorId: 'USR-001',
      actorName: 'A. DIALLO'
    }),
    onSuccess: () => {
      // Invalider le cache
      queryClient.invalidateQueries({ queryKey: ['demands'] });
    }
  });
  
  if (isLoading) return <Skeleton />;
  
  return (
    <>
      {demands?.map(d => (
        <DemandCard 
          key={d.id} 
          demand={d}
          onValidate={() => validateMutation.mutate(d.id)}
        />
      ))}
    </>
  );
}
```

**Avantages** :
- ⚡ **Cache intelligent** : Pas de requêtes inutiles
- 🔄 **Optimistic updates** : UI instantanée
- 📡 **Polling** : Mise à jour auto
- 🎯 **DevTools** : Débogage facile

**Installation** :
```bash
npm install @tanstack/react-query
```

---

## 🗂️ Structure des fichiers

```
src/
├── lib/
│   ├── api/
│   │   └── demands.ts          ← Services API ⭐
│   ├── prisma.ts               ← Client Prisma
│   └── types/
│       └── bmo.types.ts        ← Types TypeScript
│
├── hooks/
│   ├── use-demands-db.ts       ← Hook CRUD
│   ├── use-demand-actions.ts   ← Hook Actions
│   ├── use-demands-stats.ts    ← Hook Stats
│   ├── use-demands-export.ts   ← Hook Export
│   └── index.ts                ← Re-exports
│
├── components/
│   ├── features/
│   │   └── bmo/
│   │       ├── workspace/
│   │       │   ├── InboxTab.tsx
│   │       │   ├── DemandTab.tsx
│   │       │   └── ...
│   │       └── modals/
│   │           ├── QuickStatsModal.tsx
│   │           └── ExportModal.tsx
│   └── ui/
│       ├── fluent-button.tsx
│       └── ...
│
└── app/
    ├── api/
    │   └── demands/
    │       ├── route.ts                 ← GET/POST
    │       ├── [id]/
    │       │   ├── route.ts            ← GET/PATCH/DELETE
    │       │   ├── actions/route.ts    ← POST (unifié)
    │       │   ├── validate/route.ts   ← POST (rétrocompat)
    │       │   └── reject/route.ts     ← POST (rétrocompat)
    │       ├── stats/route.ts          ← GET
    │       └── export/route.ts         ← GET
    │
    └── (portals)/
        └── maitre-ouvrage/
            └── demandes/
                └── page.tsx
```

---

## 🔄 Flow de données

### Flow 1 : Client Component + Hook

```
User Action
    ↓
React Component (Client)
    ↓
Hook (useDemandsDB)
    ↓
fetch() → /api/demands
    ↓
API Route (Next.js)
    ↓
Prisma Client
    ↓
Database (SQLite)
    ↓
Response JSON
    ↓
Hook State Update
    ↓
UI Re-render
```

### Flow 2 : Server Component + Service

```
Page Request
    ↓
Server Component
    ↓
Service API (listDemands)
    ↓
fetch() → /api/demands
    ↓
API Route (Next.js)
    ↓
Prisma Client
    ↓
Database (SQLite)
    ↓
Response JSON
    ↓
HTML généré (SSR)
    ↓
Browser
```

### Flow 3 : Server Action

```
User Action
    ↓
Client Component
    ↓
Server Action (validateDemand)
    ↓
Service API (transitionDemand)
    ↓
fetch() → /api/demands/[id]/actions
    ↓
API Route (Next.js)
    ↓
Prisma Client
    ↓
Database (SQLite)
    ↓
revalidatePath()
    ↓
Cache Invalidation
    ↓
Page Re-render
```

---

## 🎯 Décision rapide

| Situation | Utilisez |
|-----------|----------|
| Client Component avec UI interactive | **Hooks React** |
| Server Component avec SSR | **Services API** |
| Server Action avec mutation | **Services API** |
| Nouvelle API Route | **Services API** |
| Application complexe avec cache | **Services API + React Query** |
| Optimistic UI nécessaire | **Server Actions + useTransition** |

---

## 📚 Exemples complets

### Exemple 1 : Dashboard avec SSR

```tsx
// app/dashboard/page.tsx
import { listDemands, getStats } from '@/lib/api/demands';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  // ✅ Chargement parallèle côté serveur
  const [demands, stats] = await Promise.all([
    listDemands('pending'),
    getStats()
  ]);
  
  return (
    <DashboardClient 
      initialDemands={demands}
      initialStats={stats}
    />
  );
}
```

### Exemple 2 : Modal avec mutation

```tsx
'use client';

import { useMutation } from '@tanstack/react-query';
import { transitionDemand } from '@/lib/api/demands';

export function ValidateModal({ demandId, onSuccess }) {
  const mutation = useMutation({
    mutationFn: (comment: string) => transitionDemand(demandId, {
      action: 'validate',
      actorId: 'USR-001',
      actorName: 'A. DIALLO',
      details: comment
    }),
    onSuccess: () => {
      onSuccess();
    }
  });
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const comment = e.currentTarget.comment.value;
      mutation.mutate(comment);
    }}>
      <textarea name="comment" />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Validation...' : 'Valider'}
      </button>
    </form>
  );
}
```

---

## 🎉 Résumé

**3 couches** :
- 🎨 **Presentation** : Components
- 🔌 **Data Access** : Hooks + Services
- 🗄️ **Database** : Prisma + SQLite/PostgreSQL

**Hooks React** : Client Components, state management automatique

**Services API** : Server Components, Server Actions, API Routes

**Utilisez les deux** selon le contexte pour une **architecture flexible et performante** !

