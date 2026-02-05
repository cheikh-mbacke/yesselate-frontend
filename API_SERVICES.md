# 🔧 Services API - Couche d'abstraction

## Vue d'ensemble

**Couche de services** pour interagir avec l'API REST depuis n'importe où (Client Components, Server Components, Server Actions).

```typescript
import * as demandsAPI from '@/lib/api/demands';
```

---

## 🎯 Services vs Hooks

### Hooks React (Client uniquement) ✅

```tsx
// ✅ Client Components uniquement
'use client';

import { useDemandsDB } from '@/hooks';

const { fetchDemands, loading } = useDemandsDB();
```

**Usage** :
- ✅ React Components
- ✅ Gestion `loading` / `error` automatique
- ✅ State management intégré

### Services API (Client + Server) ✅

```typescript
// ✅ Client Components + Server Components + Server Actions
import { listDemands } from '@/lib/api/demands';

const demands = await listDemands('pending', 'REQ-2024');
```

**Usage** :
- ✅ React Server Components
- ✅ Server Actions
- ✅ API Routes
- ✅ Client Components (mais sans state management)

---

## 📋 Services disponibles

### 1. `listDemands(queue, q)`

Liste les demandes avec filtres.

**Signature** :
```typescript
function listDemands(
  queue: 'pending' | 'urgent' | 'overdue' | 'validated' | 'rejected' | 'all',
  q?: string
): Promise<Demand[]>
```

**Exemples** :
```typescript
// Toutes les demandes
const all = await listDemands('all');

// Demandes en attente
const pending = await listDemands('pending');

// Demandes urgentes
const urgent = await listDemands('urgent');

// Recherche
const results = await listDemands('all', 'REQ-2024');

// Recherche dans une file
const found = await listDemands('pending', 'ADM');
```

---

### 2. `getDemand(id)`

Récupère une demande spécifique avec son historique.

**Signature** :
```typescript
function getDemand(id: string): Promise<Demand>
```

**Exemples** :
```typescript
const demand = await getDemand('REQ-2024-001');

console.log(demand.subject);
console.log(demand.events); // Historique
```

---

### 3. `transitionDemand(id, payload)`

Effectue une action métier sur une demande.

**Signature** :
```typescript
function transitionDemand(
  id: string,
  payload: {
    action: 'validate' | 'reject' | 'assign' | 'request_complement';
    actorId?: string;
    actorName?: string;
    details?: string;
    message?: string;
    employeeId?: string;
    employeeName?: string;
  }
): Promise<Demand>
```

**Exemples** :

#### Valider
```typescript
const updated = await transitionDemand('REQ-2024-001', {
  action: 'validate',
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  details: 'Demande approuvée'
});
```

#### Rejeter
```typescript
const updated = await transitionDemand('REQ-2024-001', {
  action: 'reject',
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  details: 'Budget insuffisant'
});
```

#### Assigner
```typescript
const updated = await transitionDemand('REQ-2024-001', {
  action: 'assign',
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  employeeId: 'EMP-042',
  employeeName: 'Jean MARTIN'
});
```

#### Demander complément
```typescript
const updated = await transitionDemand('REQ-2024-001', {
  action: 'request_complement',
  actorId: 'USR-001',
  actorName: 'A. DIALLO',
  message: 'Merci de fournir les pièces justificatives'
});
```

---

### 4. `getStats()`

Récupère les statistiques en temps réel.

**Signature** :
```typescript
function getStats(): Promise<{
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  urgent: number;
  high: number;
  overdue: number;
  avgDelay: number;
  ts: string;
}>
```

**Exemples** :
```typescript
const stats = await getStats();

console.log(stats.total);       // 8
console.log(stats.pending);     // 5
console.log(stats.urgent);      // 2
console.log(stats.overdue);     // 3
console.log(stats.avgDelay);    // 8

// Calcul SLA
const sla = Math.round(((stats.total - stats.overdue) / stats.total) * 100);
console.log(`SLA: ${sla}%`); // 62%
```

---

### 5. `exportDemands(queue, format)`

Exporte les demandes en CSV ou JSON.

**Signature** :
```typescript
function exportDemands(
  queue: 'pending' | 'urgent' | 'overdue' | 'validated' | 'rejected' | 'all',
  format: 'csv' | 'json'
): Promise<Blob>
```

**Exemples** :
```typescript
// Export CSV
const csvBlob = await exportDemands('pending', 'csv');

// Télécharger
const url = URL.createObjectURL(csvBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'demandes.csv';
link.click();

// Export JSON
const jsonBlob = await exportDemands('all', 'json');
```

---

## 🎯 Cas d'usage

### 1. React Server Component

```tsx
// app/page.tsx
import { listDemands } from '@/lib/api/demands';

export default async function Page() {
  const demands = await listDemands('pending');
  
  return (
    <div>
      <h1>{demands.length} demandes</h1>
      {demands.map(d => (
        <div key={d.id}>{d.subject}</div>
      ))}
    </div>
  );
}
```

### 2. Server Action

```tsx
// app/actions.ts
'use server';

import { transitionDemand } from '@/lib/api/demands';
import { revalidatePath } from 'next/cache';

export async function validateDemand(id: string) {
  await transitionDemand(id, {
    action: 'validate',
    actorId: 'USR-001',
    actorName: 'A. DIALLO'
  });
  
  revalidatePath('/demandes');
}
```

```tsx
// app/page.tsx
'use client';

import { validateDemand } from './actions';

export default function Page() {
  return (
    <button onClick={() => validateDemand('REQ-2024-001')}>
      Valider
    </button>
  );
}
```

### 3. Client Component (sans hooks)

```tsx
'use client';

import { listDemands } from '@/lib/api/demands';
import { useState, useEffect } from 'react';

export default function Page() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    listDemands('pending')
      .then(setDemands)
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div>Chargement...</div>;
  
  return <div>{demands.length} demandes</div>;
}
```

### 4. API Route (Next.js)

```typescript
// app/api/custom/route.ts
import { listDemands, getStats } from '@/lib/api/demands';
import { NextResponse } from 'next/server';

export async function GET() {
  const demands = await listDemands('urgent');
  const stats = await getStats();
  
  return NextResponse.json({
    urgentDemands: demands,
    stats
  });
}
```

---

## 🔄 Différences avec les Hooks

| Feature | Services API | Hooks React |
|---------|--------------|-------------|
| **Usage** | Server + Client | Client uniquement |
| **Loading state** | ❌ Manuel | ✅ Automatique |
| **Error handling** | ❌ try/catch | ✅ state `error` |
| **Cache** | `no-store` | Pas de cache |
| **Simplicité** | ✅ Direct | État à gérer |

### Quand utiliser quoi ?

#### Utilisez les **Services API** si :
- ✅ Vous êtes dans un Server Component
- ✅ Vous écrivez une Server Action
- ✅ Vous voulez un contrôle total
- ✅ Vous créez une nouvelle API Route

#### Utilisez les **Hooks** si :
- ✅ Vous êtes dans un Client Component
- ✅ Vous voulez une gestion automatique de `loading`/`error`
- ✅ Vous voulez un state management intégré
- ✅ Vous voulez la simplicité

---

## ⚡ Performance

### Cache

```typescript
// ❌ Pas de cache (toujours frais)
const demands = await listDemands('pending');

// ✅ Si vous voulez du cache, utilisez React Query
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['demands', 'pending'],
  queryFn: () => listDemands('pending')
});
```

### Optimisations

```typescript
// ✅ Paralléliser les requêtes
const [demands, stats] = await Promise.all([
  listDemands('pending'),
  getStats()
]);

// ✅ Limiter les requêtes avec debounce
import { debounce } from 'lodash';

const search = debounce((q: string) => {
  listDemands('all', q).then(setResults);
}, 300);
```

---

## 🛠️ Extension

### Ajouter un nouveau service

```typescript
// src/lib/api/demands.ts

export async function createDemand(data: {
  id: string;
  subject: string;
  bureau: string;
  type: string;
  amount?: string;
  priority?: string;
}): Promise<Demand> {
  const res = await fetch('/api/demands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) throw new Error('Création impossible');
  
  const json = await res.json();
  return json.demand as Demand;
}
```

### Ajouter de la gestion d'erreur

```typescript
export class DemandAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'DemandAPIError';
  }
}

export async function listDemands(queue: Queue, q = ''): Promise<Demand[]> {
  try {
    const params = new URLSearchParams();
    if (queue !== 'all') params.set('queue', queue);
    if (q.trim()) params.set('q', q.trim());

    const res = await fetch(`/api/demands?${params.toString()}`, { cache: 'no-store' });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new DemandAPIError(
        error.message || 'Impossible de charger la liste',
        res.status,
        error.code
      );
    }
    
    const json = await res.json();
    return json.rows as Demand[];
  } catch (err) {
    if (err instanceof DemandAPIError) throw err;
    throw new DemandAPIError('Erreur réseau');
  }
}
```

---

## 📚 Liens utiles

- **Services** : `src/lib/api/demands.ts`
- **Hooks** : `src/hooks/use-demands-db.ts`, `use-demand-actions.ts`, etc.
- **API Routes** : `app/api/demands/**`
- **Documentation API** : `API_REFERENCE.md`

---

## 🎉 Résumé

**Services API** : Couche d'abstraction type-safe pour l'API

**5 services disponibles** :
- `listDemands()` - Liste avec filtres
- `getDemand()` - Récupérer une demande
- `transitionDemand()` - Actions métier
- `getStats()` - Statistiques
- `exportDemands()` - Export

**Usage** :
- ✅ Server Components
- ✅ Server Actions
- ✅ Client Components
- ✅ API Routes

**Complémentaire aux hooks React** pour une architecture flexible !

