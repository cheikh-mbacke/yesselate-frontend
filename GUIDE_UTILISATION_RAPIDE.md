# 🚀 Guide d'Utilisation Rapide - Composants Critiques

**Date**: 10 Janvier 2026  
**Pour**: Développeurs Frontend  
**Durée de lecture**: 10 minutes

---

## 📋 Table des Matières

1. [Toast Notifications](#toast-notifications)
2. [Loading States](#loading-states)
3. [Empty States](#empty-states)
4. [Error Boundary](#error-boundary)
5. [Auth Context](#auth-context)
6. [Modal Overlay System](#modal-overlay-system)
7. [Mock Data](#mock-data)

---

## 1. Toast Notifications

### Import

```tsx
import { useToast } from '@/components/features/bmo/ToastProvider';
```

### Utilisation de base

```tsx
function MyComponent() {
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Données sauvegardées avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return <button onClick={handleSave}>Sauvegarder</button>;
}
```

### Types de toasts

```tsx
const { success, error, warning, info, loading } = useToast();

// Success
success('Opération réussie !');

// Error
error('Une erreur est survenue');

// Warning
warning('Attention : Action irréversible');

// Info
info('Nouvelle mise à jour disponible');

// Loading (ne disparaît pas automatiquement)
const loadingId = loading('Chargement en cours...');
// Plus tard : toast.remove(loadingId);
```

### Avec titre et action

```tsx
toast.success('Fichier téléchargé', {
  title: 'Téléchargement terminé',
  action: {
    label: 'Ouvrir',
    onClick: () => openFile(),
  },
  duration: 5000, // 5 secondes
});
```

---

## 2. Loading States

### Import

```tsx
import {
  Spinner,
  Skeleton,
  SkeletonTable,
  SkeletonCard,
  SkeletonList,
  LoadingOverlay,
  LoadingButton,
  PulseDots,
} from '@/components/features/bmo/LoadingStates';
```

### Spinner

```tsx
// Tailles: sm, md, lg, xl
// Couleurs: primary, white, slate
<Spinner size="lg" color="primary" />
<Spinner size="sm" color="white" />
```

### Skeleton

```tsx
// Variants: text, circular, rectangular
<Skeleton variant="text" className="h-4 w-full" />
<Skeleton variant="circular" className="w-12 h-12" />
<Skeleton className="h-10 w-full rounded-lg" />
```

### Skeleton Table

```tsx
<SkeletonTable rows={5} columns={4} />
```

### Skeleton Card

```tsx
<SkeletonCard showAvatar lines={3} />
```

### Skeleton List

```tsx
<SkeletonList items={5} />
```

### Loading Overlay

```tsx
<div className="relative">
  {loading && <LoadingOverlay message="Chargement des données..." />}
  <YourContent />
</div>

// Full screen
{loading && <LoadingOverlay fullScreen message="Initialisation..." />}
```

### Loading Button

```tsx
<LoadingButton
  loading={isSaving}
  onClick={handleSave}
  className="bg-blue-500 text-white"
>
  Sauvegarder
</LoadingButton>
```

### Pulse Dots

```tsx
<PulseDots />
```

---

## 3. Empty States

### Import

```tsx
import {
  EmptyState,
  EmptySearch,
  EmptyList,
  EmptyError,
  EmptyFilters,
} from '@/components/features/bmo/EmptyStates';
```

### Empty State de base

```tsx
<EmptyState
  type="no-items"
  title="Aucun élément"
  message="Il n'y a pas encore d'éléments dans cette liste"
  action={{
    label: 'Créer un élément',
    onClick: handleCreate,
    icon: <Plus className="w-4 h-4" />,
  }}
/>
```

### Types disponibles

```tsx
// Types prédéfinis
<EmptyState type="default" />
<EmptyState type="search" />
<EmptyState type="error" />
<EmptyState type="no-data" />
<EmptyState type="no-results" />
<EmptyState type="no-items" />
<EmptyState type="no-files" />
<EmptyState type="no-users" />
<EmptyState type="no-events" />
<EmptyState type="no-stats" />
```

### Composants spécialisés

```tsx
// Recherche vide
<EmptySearch
  query={searchQuery}
  onClear={() => setSearchQuery('')}
  onNewSearch={() => setShowSearch(true)}
/>

// Liste vide
<EmptyList
  itemName="client"
  onCreate={handleCreateClient}
/>

// Erreur
<EmptyError
  error="Impossible de charger les données"
  onRetry={refetch}
/>

// Filtres
<EmptyFilters
  onClearFilters={() => resetFilters()}
/>
```

### Avec image personnalisée

```tsx
<EmptyState
  type="no-items"
  image="/illustrations/empty-state.svg"
  title="Aucun résultat"
/>
```

---

## 4. Error Boundary

### Utilisation de base

```tsx
import { ErrorBoundary } from '@/components/features/bmo/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Avec callback personnalisé

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Envoyer à un service de monitoring (Sentry, etc.)
    console.error('Erreur capturée:', error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### Avec fallback personnalisé

```tsx
<ErrorBoundary
  fallback={<div>Erreur personnalisée</div>}
>
  <YourComponent />
</ErrorBoundary>
```

### HOC (Higher Order Component)

```tsx
import { withErrorBoundary } from '@/components/features/bmo/ErrorBoundary';

const SafeComponent = withErrorBoundary(YourComponent);
```

---

## 5. Auth Context

### Import

```tsx
import { useAuth, useRole, ProtectedRoute } from '@/lib/contexts/AuthContext';
```

### Utilisation de base

```tsx
function MyComponent() {
  const { user, isAuthenticated, login, logout, updateUser } = useAuth();

  if (!isAuthenticated) {
    return <div>Non connecté</div>;
  }

  return (
    <div>
      <p>Bonjour {user?.prenom} {user?.nom}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

### Vérification de rôle

```tsx
import { useRole } from '@/lib/contexts/AuthContext';

function AdminPanel() {
  const isAdmin = useRole('admin');
  const isManager = useRole(['admin', 'manager']);

  if (!isAdmin) {
    return <div>Accès refusé</div>;
  }

  return <div>Panneau admin</div>;
}
```

### Route protégée

```tsx
import { ProtectedRoute } from '@/lib/contexts/AuthContext';

function App() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminPanel />
    </ProtectedRoute>
  );
}
```

### Login

```tsx
function LoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      // Redirection automatique
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}
```

---

## 6. Modal Overlay System

### Hook useListNavigation

```tsx
import { useListNavigation } from '@/lib/hooks/useListNavigation';

function MyList() {
  const items = [...]; // Vos items
  const {
    selectedItem,
    selectedId,
    isOpen,
    canNavigatePrev,
    canNavigateNext,
    handleOpen,
    handleClose,
    handleNext,
    handlePrevious,
  } = useListNavigation(items, (item) => item.id);

  return (
    <>
      {items.map((item) => (
        <div key={item.id} onClick={() => handleOpen(item)}>
          {item.name}
        </div>
      ))}

      {selectedItem && (
        <DetailModal
          isOpen={isOpen}
          onClose={handleClose}
          canNavigatePrev={canNavigatePrev}
          canNavigateNext={canNavigateNext}
          onNavigatePrev={handlePrevious}
          onNavigateNext={handleNext}
        >
          <DetailContent item={selectedItem} />
        </DetailModal>
      )}
    </>
  );
}
```

### Store Modal

```tsx
import { useModalStore, useModal } from '@/lib/stores/modalStore';

// Méthode 1: Store global
function MyComponent() {
  const { openModal, closeModal, isModalOpen } = useModalStore();

  const handleOpen = () => {
    openModal('my-modal', 'detail', { itemId: '123' });
  };

  const handleClose = () => {
    closeModal('my-modal');
  };

  return (
    <>
      <button onClick={handleOpen}>Ouvrir modal</button>
      {isModalOpen('my-modal') && <MyModalContent />}
    </>
  );
}

// Méthode 2: Hook useModal
function MyComponent() {
  const modal = useModal('my-modal');

  return (
    <>
      <button onClick={() => modal.open('detail', { itemId: '123' })}>
        Ouvrir
      </button>
      {modal.isOpen && <MyModalContent data={modal.data} />}
      <button onClick={modal.close}>Fermer</button>
    </>
  );
}
```

### ModalManager

Le `ModalManager` est déjà intégré dans le layout. Aucune action nécessaire.

### ModalWrapper

```tsx
import { ModalWrapper } from '@/components/shared/ModalManager';

function MyModal() {
  const { isModalOpen, closeModal } = useModalStore();

  return (
    <ModalWrapper
      id="my-modal"
      type="detail"
      size="xl"
      position="center"
      showCloseButton
      closeOnBackdrop
    >
      <div className="p-6">
        <h2>Contenu de la modal</h2>
      </div>
    </ModalWrapper>
  );
}
```

---

## 7. Mock Data

### Import

```tsx
import {
  mockProjets,
  mockClients,
  mockEmployes,
  mockBlockedDossiers,
  mockSubstitutions,
  mockComments,
  mockTimelineEvents,
  mockProjetsStats,
  mockClientsStats,
  mockBlockedStats,
  mockSubstitutionStats,
} from '@/lib/mocks';
```

### Utilisation dans les composants

```tsx
function MyComponent() {
  // Utiliser directement
  const projets = mockProjets;
  const clients = mockClients;

  // Ou avec filtrage
  const activeProjets = mockProjets.filter(p => p.status === 'en_cours');

  // Avec stats
  const stats = mockBlockedStats;
  console.log(stats.total); // 6
  console.log(stats.parStatus); // { nouveau: 1, en_cours: 2, ... }
}
```

### Utilisation dans les services API

```tsx
// Dans vos services API (mode mock)
import { mockBlockedDossiers } from '@/lib/mocks';

async function getAllBlocked() {
  if (useMocks) {
    await delay(500); // Simuler délai réseau
    return mockBlockedDossiers;
  }
  // Appel API réel
  const response = await fetch('/api/bmo/blocked');
  return response.json();
}
```

### Utilitaires mock

```tsx
import {
  mockDelay,
  mockPaginate,
  mockSearch,
  mockSort,
  mockGenerateId,
} from '@/lib/mocks';

// Délai réseau simulé
await mockDelay(500);

// Pagination
const { data, pagination } = mockPaginate(items, 1, 20);

// Recherche
const results = mockSearch(items, 'query', ['nom', 'prenom']);

// Tri
const sorted = mockSort(items, 'nom', 'asc');

// Générer ID
const newId = mockGenerateId('ITEM');
```

---

## 🎯 Exemple Complet : Liste avec Modal

```tsx
'use client';

import { useState } from 'react';
import { useListNavigation } from '@/lib/hooks/useListNavigation';
import { useToast } from '@/components/features/bmo/ToastProvider';
import { Spinner, SkeletonList } from '@/components/features/bmo/LoadingStates';
import { EmptyList } from '@/components/features/bmo/EmptyStates';
import { DetailModal } from '@/components/ui/detail-modal';
import { mockBlockedDossiers } from '@/lib/mocks';

export function BlockedList() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const {
    selectedItem,
    isOpen,
    canNavigatePrev,
    canNavigateNext,
    handleOpen,
    handleClose,
    handleNext,
    handlePrevious,
  } = useListNavigation(mockBlockedDossiers, (item) => item.id);

  // Simuler chargement
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <SkeletonList items={5} />;
  }

  if (mockBlockedDossiers.length === 0) {
    return (
      <EmptyList
        itemName="dossier bloqué"
        onCreate={() => toast.info('Fonctionnalité à venir')}
      />
    );
  }

  return (
    <>
      <div className="space-y-2">
        {mockBlockedDossiers.map((dossier) => (
          <div
            key={dossier.id}
            onClick={() => handleOpen(dossier)}
            className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
          >
            <h3>{dossier.titre}</h3>
            <p className="text-sm text-slate-400">{dossier.description}</p>
          </div>
        ))}
      </div>

      {selectedItem && (
        <DetailModal
          isOpen={isOpen}
          onClose={handleClose}
          title={selectedItem.titre}
          canNavigatePrev={canNavigatePrev}
          canNavigateNext={canNavigateNext}
          onNavigatePrev={handlePrevious}
          onNavigateNext={handleNext}
        >
          <div className="p-6">
            <p>{selectedItem.description}</p>
            <p className="mt-4 text-sm text-slate-400">
              Statut: {selectedItem.status}
            </p>
          </div>
        </DetailModal>
      )}
    </>
  );
}
```

---

## 📚 Ressources

- **Audit Complet**: `AUDIT_COMPLET_FONCTIONNALITES_MANQUANTES.md`
- **Résumé Implémentation**: `RESUME_COMPLET_FINAL.md`
- **Documentation Mock Data**: `lib/mocks/README.md`

---

**Document créé le**: 10 Janvier 2026  
**Version**: 1.0

