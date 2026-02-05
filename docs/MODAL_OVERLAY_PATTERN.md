# Pattern Modal Overlay - Guide d'Implémentation

## 🎯 Objectif
Appliquer le pattern "tickets-clients" (modal overlay) à toutes les pages de l'application pour une UX cohérente.

## 📋 Template Étape par Étape

### 1. Mettre à jour le Store Zustand

```typescript
// lib/stores/[module]Store.ts

interface [Module]WorkspaceState {
  // ... états existants
  
  // Ajouter états modaux
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  detailModalOpen: boolean;
  setDetailModalOpen: (open: boolean) => void;
}

// Dans le store
selectedItemId: null,
setSelectedItemId: (id: string | null) => set({ selectedItemId: id }),
detailModalOpen: false,
setDetailModalOpen: (open: boolean) => set({ detailModalOpen: open }),
```

### 2. Créer le Modal de Détail

```typescript
// src/components/features/bmo/[module]/modals/[Item]DetailModal.tsx

import { GenericDetailModal } from '@/components/ui/GenericDetailModal';
import { use[Item] } from '@/lib/hooks/use[Module]Data';

interface [Item]DetailModalProps {
  itemId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: [ItemType]) => void;
  onDelete?: (id: string) => void;
}

export function [Item]DetailModal({
  itemId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: [Item]DetailModalProps) {
  const { data: item, isLoading, error } = use[Item](itemId);

  if (!item) return null;

  const sections = [
    {
      title: 'Informations principales',
      fields: [
        { label: 'Nom', value: item.name },
        { label: 'Statut', value: <Badge>{item.status}</Badge> },
        // ... autres champs
      ],
    },
  ];

  return (
    <GenericDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={item.name}
      subtitle={item.id}
      sections={sections}
      isLoading={isLoading}
      error={error?.message}
      actions={{
        onEdit: onEdit ? () => onEdit(item) : undefined,
        onDelete: onDelete ? () => onDelete(item.id) : undefined,
      }}
    />
  );
}
```

### 3. Créer le DataTable

```typescript
// src/components/features/bmo/[module]/components/[Items]DataTable.tsx

interface [Items]DataTableProps {
  items: [ItemType][];
  isLoading?: boolean;
  onView?: (item: [ItemType]) => void;
  onEdit?: (item: [ItemType]) => void;
  onDelete?: (id: string) => void;
}

export function [Items]DataTable({
  items,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: [Items]DataTableProps) {
  // ... logique de tri/pagination/sélection
  
  return (
    <table>
      <tbody>
        {items.map((item) => (
          <tr
            key={item.id}
            onClick={() => onView?.(item)}  // ← Clic ouvre modal
            className="cursor-pointer hover:bg-slate-800/30"
          >
            {/* ... colonnes */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 4. Intégrer dans la Page

```typescript
// app/(portals)/maitre-ouvrage/[module]/page.tsx

export default function [Module]Page() {
  const {
    selectedItemId,
    setSelectedItemId,
    // ... autres états du store
  } = use[Module]WorkspaceStore();

  // Handlers
  const handleViewItem = useCallback((item: [ItemType]) => {
    setSelectedItemId(item.id);  // ← Ouvre modal
  }, [setSelectedItemId]);

  const handleEditItem = useCallback((item: [ItemType]) => {
    // Logique d'édition
  }, []);

  const handleDeleteItem = useCallback(async (id: string) => {
    if (confirm('Êtes-vous sûr ?')) {
      await deleteItem(id);
      setSelectedItemId(null);
    }
  }, []);

  return (
    <div>
      {/* ... layout */}
      
      <[Items]DataTable
        items={items}
        onView={handleViewItem}     // ← Passe callback
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />

      {/* Modal de détail */}
      <[Item]DetailModal
        itemId={selectedItemId}
        isOpen={!!selectedItemId}   // ← Ouvre si ID présent
        onClose={() => setSelectedItemId(null)}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}
```

## 🎨 Exemples d'Application

### Projets
```typescript
// Page: app/(portals)/maitre-ouvrage/projets-en-cours/page.tsx
// Modal: src/components/features/bmo/projets/modals/ProjectDetailModal.tsx
// DataTable: src/components/features/bmo/projets/components/ProjectsDataTable.tsx

const { selectedProjectId, setSelectedProjectId } = useProjectsStore();

<ProjectDetailModal
  projectId={selectedProjectId}
  isOpen={!!selectedProjectId}
  onClose={() => setSelectedProjectId(null)}
/>
```

### Clients
```typescript
// Page: app/(portals)/maitre-ouvrage/clients/page.tsx
// Modal: src/components/features/bmo/clients/modals/ClientDetailModal.tsx

const { selectedClientId, setSelectedClientId } = useClientsStore();

<ClientDetailModal
  clientId={selectedClientId}
  isOpen={!!selectedClientId}
  onClose={() => setSelectedClientId(null)}
/>
```

### Employés
```typescript
// Page: app/(portals)/maitre-ouvrage/employes/page.tsx
// Modal: src/components/features/bmo/employes/modals/EmployeeDetailModal.tsx

const { selectedEmployeeId, setSelectedEmployeeId } = useEmployeesStore();

<EmployeeDetailModal
  employeeId={selectedEmployeeId}
  isOpen={!!selectedEmployeeId}
  onClose={() => setSelectedEmployeeId(null)}
/>
```

## ✅ Checklist par Module

- [ ] Store mis à jour avec `selectedItemId`
- [ ] Hook API `use[Item](id)` créé
- [ ] Modal de détail créé avec `GenericDetailModal`
- [ ] DataTable créé avec callback `onView`
- [ ] Page intégrée avec handlers
- [ ] Tests de navigation (clic → modal → fermer)

## 🚀 Avantages

1. **Code réutilisable** - `GenericDetailModal` pour tout
2. **UX cohérente** - Même pattern partout
3. **Performance** - Pas de rechargement de page
4. **Navigation rapide** - Ouvrir/fermer en 1 clic
5. **Contexte préservé** - Liste visible en arrière-plan

## 📝 Notes

- Le pattern est déjà fonctionnel sur **Finances** et **Tickets-Clients**
- Utilisez `GenericDetailModal` pour accélérer le développement
- Adaptez les sections selon les besoins de chaque module
- Les animations sont automatiques (fade-in, zoom-in)

