# 🔄 Guide de Migration - Mocks → APIs Production

Ce guide explique comment remplacer les mock data par de vraies API calls dans le module Clients.

---

## 📋 Vue d'ensemble

### État actuel
- ✅ Mock data complet (`lib/data/clientsMockData.ts`)
- ✅ Hook API avec structure complète (`lib/hooks/useClientsApi.ts`)
- ✅ Toutes les méthodes retournent actuellement les mocks

### État cible
- 🎯 Endpoints backend fonctionnels
- 🎯 Hook API appelant les vrais endpoints
- 🎯 Gestion des erreurs
- 🎯 Loading states
- 🎯 Optimistic updates (optionnel)

---

## 🚀 Étapes de migration

### Étape 1: Créer les endpoints backend

#### A. Structure recommandée

```
backend/
├── api/
│   ├── clients/
│   │   ├── route.ts              # GET, POST /api/clients
│   │   └── [id]/
│   │       ├── route.ts          # GET, PUT, DELETE /api/clients/:id
│   │       ├── contacts/
│   │       │   └── route.ts      # GET /api/clients/:id/contacts
│   │       ├── interactions/
│   │       │   └── route.ts      # GET /api/clients/:id/interactions
│   │       └── contracts/
│   │           └── route.ts      # GET /api/clients/:id/contracts
│   ├── prospects/
│   │   ├── route.ts              # GET, POST /api/prospects
│   │   └── [id]/
│   │       ├── route.ts          # GET, PUT, DELETE
│   │       └── convert/
│   │           └── route.ts      # POST /api/prospects/:id/convert
│   ├── litiges/
│   │   ├── route.ts              # GET, POST /api/litiges
│   │   └── [id]/
│   │       ├── route.ts          # GET, PUT, DELETE
│   │       ├── resolve/
│   │       │   └── route.ts      # POST /api/litiges/:id/resolve
│   │       ├── escalate/
│   │       │   └── route.ts      # POST /api/litiges/:id/escalate
│   │       └── actions/
│   │           └── route.ts      # POST /api/litiges/:id/actions
│   ├── interactions/
│   │   └── route.ts              # GET, POST /api/interactions
│   ├── contacts/
│   │   ├── route.ts              # POST /api/contacts
│   │   └── [id]/
│   │       └── route.ts          # PUT, DELETE
│   └── contracts/
│       ├── route.ts              # GET, POST /api/contracts
│       └── [id]/
│           └── route.ts          # PUT, DELETE
```

#### B. Exemple d'implémentation (Next.js App Router)

**File: `app/api/clients/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ou votre ORM

// GET /api/clients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({
      data: clients,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const client = await prisma.client.create({
      data: {
        name: body.name,
        type: body.type,
        sector: body.sector,
        // ... autres champs
      },
    });

    return NextResponse.json({ data: client }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
```

**File: `app/api/clients/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clients/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        contacts: true,
        interactions: { take: 10, orderBy: { date: 'desc' } },
        contracts: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: client });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const client = await prisma.client.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ data: client });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Client deleted' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
```

---

### Étape 2: Mettre à jour le hook API

**File: `lib/hooks/useClientsApi.ts`**

Remplacer les fonctions mock par de vrais appels fetch :

#### Avant (Mock):
```typescript
const getClients = useCallback(
  async (filters?: ClientsFilters, pagination?: PaginationParams): Promise<ApiResponse<Client[]>> => {
    // Mock data
    const { mockClients } = await import('@/lib/data/clientsMockData');
    return {
      data: mockClients,
      total: mockClients.length,
      page: pagination?.page || 1,
      totalPages: 1,
    };
  },
  []
);
```

#### Après (API):
```typescript
const getClients = useCallback(
  async (filters?: ClientsFilters, pagination?: PaginationParams): Promise<ApiResponse<Client[]>> => {
    const params = new URLSearchParams();
    
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (filters?.type) params.append('type', filters.type.join(','));
    if (filters?.status) params.append('status', filters.status.join(','));
    // ... autres filtres

    const response = await fetch(`/api/clients?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Ajouter token auth si nécessaire
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching clients: ${response.statusText}`);
    }

    return response.json();
  },
  []
);
```

#### Exemple complet pour une méthode POST:

```typescript
const createClient = useCallback(
  async (data: Partial<Client>): Promise<Client> => {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create client');
    }

    const result = await response.json();
    return result.data;
  },
  []
);
```

---

### Étape 3: Ajouter la gestion d'erreurs

#### A. Créer un wrapper de fetch avec gestion d'erreurs

**File: `lib/utils/apiClient.ts`**

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // Ajouter auth token depuis localStorage ou context
    // 'Authorization': `Bearer ${getToken()}`,
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Gérer les erreurs HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Retourner les données
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Erreurs réseau ou parsing
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}
```

#### B. Utiliser le wrapper dans le hook

```typescript
import { apiClient, ApiError } from '@/lib/utils/apiClient';

const getClients = useCallback(
  async (filters?: ClientsFilters, pagination?: PaginationParams): Promise<ApiResponse<Client[]>> => {
    try {
      const params = new URLSearchParams();
      // ... construire params

      return await apiClient<ApiResponse<Client[]>>(
        `/api/clients?${params.toString()}`
      );
    } catch (error) {
      if (error instanceof ApiError) {
        // Gérer erreurs spécifiques
        if (error.status === 401) {
          // Redirect to login
        } else if (error.status === 403) {
          // Show permission error
        }
      }
      throw error;
    }
  },
  []
);
```

---

### Étape 4: Intégrer React Query (recommandé)

React Query simplifie la gestion du cache, loading states, et erreurs.

#### A. Installation

```bash
npm install @tanstack/react-query
```

#### B. Setup Provider

**File: `app/providers.tsx`**

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

#### C. Créer des hooks React Query

**File: `lib/hooks/useClientsQuery.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClientsApi } from './useClientsApi';
import type { Client, ClientsFilters } from '@/lib/data/clientsMockData';

export function useClientsQuery(filters?: ClientsFilters) {
  const api = useClientsApi();

  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => api.getClients(filters),
  });
}

export function useClientQuery(id: string) {
  const api = useClientsApi();

  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => api.getClientById(id),
    enabled: !!id,
  });
}

export function useCreateClientMutation() {
  const api = useClientsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Client>) => api.createClient(data),
    onSuccess: () => {
      // Invalider le cache pour rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClientMutation() {
  const api = useClientsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => 
      api.updateClient(id, data),
    onSuccess: (_, variables) => {
      // Invalider le cache spécifique
      queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
```

#### D. Utiliser dans les composants

```typescript
import { useClientsQuery, useCreateClientMutation } from '@/lib/hooks/useClientsQuery';

function ClientsPage() {
  // Fetch avec cache automatique
  const { data, isLoading, error } = useClientsQuery({ type: ['premium'] });

  // Mutation avec invalidation cache
  const createClient = useCreateClientMutation();

  const handleCreate = async (clientData: Partial<Client>) => {
    try {
      await createClient.mutateAsync(clientData);
      toast.success('Client créé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      {data?.data.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  );
}
```

---

### Étape 5: Ajouter Loading & Error States

#### A. Créer des composants réutilisables

**File: `components/ui/LoadingSpinner.tsx`**

```typescript
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex items-center justify-center">
      <div className={cn(
        'animate-spin rounded-full border-2 border-slate-700 border-t-cyan-500',
        size === 'sm' && 'w-4 h-4',
        size === 'md' && 'w-8 h-8',
        size === 'lg' && 'w-12 h-12',
      )} />
    </div>
  );
}
```

**File: `components/ui/ErrorMessage.tsx`**

```typescript
export function ErrorMessage({ 
  title = 'Erreur',
  message,
  onRetry 
}: { 
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-rose-400" />
        <h3 className="font-semibold text-rose-400">{title}</h3>
      </div>
      <p className="text-sm text-slate-300 mb-3">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} size="sm">
          Réessayer
        </Button>
      )}
    </div>
  );
}
```

#### B. Utiliser dans les composants

```typescript
function ClientsPage() {
  const { data, isLoading, error, refetch } = useClientsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage
          message={error.message}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return <div>{/* Content */}</div>;
}
```

---

### Étape 6: Optimistic Updates (optionnel)

Pour une UX plus fluide, mettre à jour l'UI immédiatement avant la réponse serveur.

```typescript
export function useUpdateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => 
      api.updateClient(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Annuler les refetch en cours
      await queryClient.cancelQueries({ queryKey: ['clients', id] });

      // Snapshot de la valeur précédente
      const previousClient = queryClient.getQueryData(['clients', id]);

      // Mettre à jour optimistiquement
      queryClient.setQueryData(['clients', id], (old: any) => ({
        ...old,
        ...data,
      }));

      // Retourner le snapshot pour rollback
      return { previousClient };
    },
    
    // Rollback en cas d'erreur
    onError: (err, variables, context) => {
      if (context?.previousClient) {
        queryClient.setQueryData(
          ['clients', variables.id],
          context.previousClient
        );
      }
    },
    
    // Rafraîchir après succès
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
    },
  });
}
```

---

## 🧪 Testing

### Test les endpoints

```typescript
// __tests__/api/clients.test.ts
import { GET, POST } from '@/app/api/clients/route';

describe('/api/clients', () => {
  it('should return clients list', async () => {
    const request = new Request('http://localhost:3000/api/clients');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.data).toBeInstanceOf(Array);
  });

  it('should create a client', async () => {
    const request = new Request('http://localhost:3000/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Client' }),
    });
    const response = await POST(request);
    
    expect(response.status).toBe(201);
  });
});
```

---

## ✅ Checklist de migration

### Backend
- [ ] Créer tous les endpoints (30+)
- [ ] Implémenter validations (Zod, Joi, etc.)
- [ ] Ajouter authentification/autorisation
- [ ] Tests unitaires des endpoints
- [ ] Tests d'intégration

### Frontend
- [ ] Remplacer mocks par fetch dans useClientsApi
- [ ] Ajouter gestion d'erreurs
- [ ] Créer hooks React Query
- [ ] Ajouter loading states
- [ ] Ajouter error boundaries
- [ ] Tests des hooks
- [ ] Tests E2E

### Déploiement
- [ ] Variables d'environnement
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Logging & monitoring
- [ ] Error tracking (Sentry, etc.)

---

## 📊 Monitoring & Debugging

### Ajouter des logs

```typescript
const getClients = useCallback(async (...args) => {
  console.log('[API] Fetching clients with filters:', args);
  
  try {
    const result = await apiClient(...);
    console.log('[API] Clients fetched successfully:', result.total);
    return result;
  } catch (error) {
    console.error('[API] Error fetching clients:', error);
    throw error;
  }
}, []);
```

### React Query Devtools

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 🎯 Résultat final

Après migration complète :

✅ **Backend**
- 30+ endpoints fonctionnels
- Validation des données
- Auth & permissions
- Tests & monitoring

✅ **Frontend**
- Hook API complet
- React Query pour cache
- Loading states partout
- Error handling robuste
- Optimistic updates
- Tests E2E

✅ **UX**
- Chargement instantané (cache)
- Feedback visuel
- Gestion erreurs élégante
- Pas de bugs de race condition

---

**Status**: 📝 Guide complet - Prêt pour migration  
**Difficulté**: Moyenne  
**Temps estimé**: 2-3 jours pour 1 développeur

