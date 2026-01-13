# 🚀 Guide d'Intégration des 5 Éléments Critiques

**Durée d'intégration** : 10 minutes  
**Difficulté** : ⭐ Facile

---

## 📋 Checklist Rapide

- [ ] Étape 1 : Wrapper le Root Layout (2 min)
- [ ] Étape 2 : Utiliser Toast dans vos composants (3 min)
- [ ] Étape 3 : Ajouter Loading States (2 min)
- [ ] Étape 4 : Ajouter Empty States (2 min)
- [ ] Étape 5 : Utiliser Auth Context (1 min)

---

## Étape 1 : Wrapper le Root Layout (2 min)

### Fichier : `app/layout.tsx`

```tsx
import { AuthProvider } from '@/contexts';
import { ToastProvider } from '@/components/common';
import { ErrorBoundary } from '@/components/common';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {/* 🛡️ Error Boundary : Capture les erreurs React */}
        <ErrorBoundary>
          {/* 🔐 Auth Provider : Authentification globale */}
          <AuthProvider>
            {/* 🔔 Toast Provider : Notifications */}
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**C'est tout !** Les 3 systèmes sont maintenant actifs globalement.

---

## Étape 2 : Utiliser Toast dans vos composants (3 min)

### Exemple : Formulaire avec feedback

```tsx
'use client';

import { useState } from 'react';
import { useToast } from '@/components/common';
import { LoadingButton } from '@/components/common';

export default function MonFormulaire() {
  const { success, error, warning, info } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Votre logique API
      await api.createItem({ /* ... */ });
      
      // ✅ Succès
      success('Élément créé avec succès !');
      
    } catch (err) {
      // ❌ Erreur
      error('Erreur lors de la création', 'Une erreur est survenue');
      
    } finally {
      setLoading(false);
    }
  };

  // 💡 Exemples d'autres types
  const showExamples = () => {
    warning('Attention', 'Vérifiez vos données');
    info('Information', 'Ceci est une info');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Vos champs */}
      
      <LoadingButton loading={loading} type="submit">
        Enregistrer
      </LoadingButton>
    </form>
  );
}
```

---

## Étape 3 : Ajouter Loading States (2 min)

### Exemple : Liste avec chargement

```tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Spinner, 
  SkeletonTable, 
  LoadingCard, 
  LoadingPage 
} from '@/components/common';

export default function MaListe() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.getItems();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  // 1️⃣ Option 1 : Skeleton (recommandé pour tableaux)
  if (loading) {
    return <SkeletonTable rows={5} />;
  }

  // 2️⃣ Option 2 : Spinner simple
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  // 3️⃣ Option 3 : Loading Card
  if (loading) {
    return <LoadingCard message="Chargement des données..." />;
  }

  // 4️⃣ Option 4 : Page complète (pour pages entières)
  if (loading) {
    return <LoadingPage message="Chargement en cours..." />;
  }

  return (
    <div>
      {/* Votre contenu */}
    </div>
  );
}
```

### Composants disponibles

| Composant | Usage |
|-----------|-------|
| `Spinner` | Icône de chargement simple |
| `SkeletonTable` | Tableau skeleton |
| `SkeletonList` | Liste skeleton |
| `SkeletonCard` | Carte skeleton |
| `LoadingCard` | Carte avec spinner + message |
| `LoadingPage` | Page complète de chargement |
| `LoadingButton` | Bouton avec état loading |
| `LoadingOverlay` | Overlay sur contenu existant |

---

## Étape 4 : Ajouter Empty States (2 min)

### Exemple : Liste vide avec action

```tsx
'use client';

import { useState } from 'react';
import { 
  EmptyList, 
  EmptySearch, 
  EmptyFilter,
  ErrorState,
  NoPermissions 
} from '@/components/common';

export default function MaListeAvecEmpty() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasFilters, setHasFilters] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(true);

  // 1️⃣ Pas de permission
  if (!hasPermission) {
    return <NoPermissions />;
  }

  // 2️⃣ Erreur de chargement
  if (error) {
    return (
      <ErrorState
        title="Erreur de chargement"
        description="Impossible de charger les données"
        onRetry={() => fetchItems()}
      />
    );
  }

  // 3️⃣ Liste vide
  if (items.length === 0 && !searchQuery && !hasFilters) {
    return (
      <EmptyList
        title="Aucun projet"
        description="Créez votre premier projet pour commencer"
        onCreate={() => setShowModal(true)}
        createLabel="Créer un projet"
      />
    );
  }

  // 4️⃣ Recherche sans résultats
  if (items.length === 0 && searchQuery) {
    return (
      <EmptySearch
        query={searchQuery}
        onClearSearch={() => setSearchQuery('')}
      />
    );
  }

  // 5️⃣ Filtres sans résultats
  if (items.length === 0 && hasFilters) {
    return (
      <EmptyFilter
        onClearFilters={() => setHasFilters(false)}
      />
    );
  }

  return (
    <div>
      {/* Votre liste */}
    </div>
  );
}
```

### Composants disponibles

| Composant | Usage |
|-----------|-------|
| `EmptyList` | Liste vide avec bouton créer |
| `EmptySearch` | Recherche sans résultats |
| `EmptyFilter` | Filtres sans résultats |
| `EmptyData` | Données non disponibles |
| `ErrorState` | Erreur avec retry |
| `NotFound` | Page 404 |
| `EmptyFolder` | Dossier vide |
| `NoPermissions` | Accès refusé |
| `NoUsers` | Aucun utilisateur |
| `AllDone` | Toutes tâches terminées |

---

## Étape 5 : Utiliser Auth Context (1 min)

### Exemple : Afficher utilisateur connecté

```tsx
'use client';

import { useAuth, UserAvatar } from '@/contexts';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Non connecté</div>;
  }

  return (
    <header>
      {/* Avatar avec nom */}
      <UserAvatar user={user} size="md" showName />
      
      {/* Informations utilisateur */}
      <div>
        <p>Email: {user?.email}</p>
        <p>Rôle: {user?.role}</p>
        <p>Bureau: {user?.bureauNom}</p>
      </div>

      {/* Déconnexion */}
      <button onClick={logout}>
        Déconnexion
      </button>
    </header>
  );
}
```

### Exemple : Route protégée

```tsx
'use client';

import { ProtectedRoute } from '@/contexts';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole={['admin', 'manager']}>
      <div>
        {/* Contenu réservé aux admins/managers */}
      </div>
    </ProtectedRoute>
  );
}
```

---

## 🎯 Exemples Complets

### Exemple 1 : Page CRUD Complète

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useToast } from '@/components/common';
import { 
  SkeletonTable, 
  EmptyList, 
  EmptySearch,
  LoadingButton 
} from '@/components/common';

export default function ProjectsPage() {
  // State
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Hooks
  const { user } = useAuth();
  const { success, error } = useToast();

  // Fetch
  useEffect(() => {
    fetchProjects();
  }, [searchQuery]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects({ search: searchQuery });
      setProjects(data);
    } catch (err) {
      error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Create
  const handleCreate = async (formData) => {
    try {
      await api.createProject(formData);
      success('Projet créé avec succès !');
      fetchProjects();
    } catch (err) {
      error('Erreur lors de la création');
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce projet ?')) return;
    
    try {
      await api.deleteProject(id);
      success('Projet supprimé');
      fetchProjects();
    } catch (err) {
      error('Erreur lors de la suppression');
    }
  };

  // Loading state
  if (loading) {
    return <SkeletonTable rows={5} />;
  }

  // Empty states
  if (projects.length === 0 && !searchQuery) {
    return (
      <EmptyList
        title="Aucun projet"
        onCreate={() => setShowModal(true)}
      />
    );
  }

  if (projects.length === 0 && searchQuery) {
    return (
      <EmptySearch
        query={searchQuery}
        onClearSearch={() => setSearchQuery('')}
      />
    );
  }

  // Content
  return (
    <div>
      {/* Search */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Rechercher..."
      />

      {/* Table */}
      <table>
        {/* ... */}
      </table>

      {/* Actions */}
      <LoadingButton onClick={handleCreate}>
        Créer un projet
      </LoadingButton>
    </div>
  );
}
```

---

## 📚 Ressources

| Document | Description |
|----------|-------------|
| [`CRITICAL_ELEMENTS_COMPLETE.md`](./CRITICAL_ELEMENTS_COMPLETE.md) | Documentation complète |
| [`src/components/common/ErrorBoundary.tsx`](./src/components/common/ErrorBoundary.tsx) | Code Error Boundary |
| [`src/components/common/Toast.tsx`](./src/components/common/Toast.tsx) | Code Toast System |
| [`src/components/common/LoadingStates.tsx`](./src/components/common/LoadingStates.tsx) | Code Loading States |
| [`src/components/common/EmptyStates.tsx`](./src/components/common/EmptyStates.tsx) | Code Empty States |
| [`src/contexts/AuthContext.tsx`](./src/contexts/AuthContext.tsx) | Code Auth Context |

---

## 🎉 Félicitations !

Vous avez maintenant intégré les **5 éléments critiques** :

✅ Gestion d'erreurs (Error Boundary)  
✅ Notifications (Toast System)  
✅ États de chargement (Loading States)  
✅ États vides (Empty States)  
✅ Authentification (Auth Context)  

**Votre application a maintenant une UX professionnelle !** 🚀

---

**Version 2.0.0+**  
**Date : 10 Janvier 2026**

