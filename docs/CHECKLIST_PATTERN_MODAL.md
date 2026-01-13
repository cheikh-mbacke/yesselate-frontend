# ✅ Checklist - Pattern Modal Overlay

## Guide d'Implémentation Rapide (5 min/page)

### 📋 Étape 1 : Préparer la Page Principale

**Fichier**: `app/(portals)/maitre-ouvrage/[votre-page]/page.tsx`

- [ ] **1.1** Importer `GenericDetailModal` et icônes
```typescript
import { GenericDetailModal } from '@/components/ui/GenericDetailModal';
import { Icon1, Icon2, Icon3 } from 'lucide-react';
```

- [ ] **1.2** Ajouter les états
```typescript
const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
const [selectedItem, setSelectedItem] = useState<any>(null);
```

- [ ] **1.3** Créer les handlers
```typescript
const handleViewItem = useCallback((item: any) => {
  setSelectedItem(item);
  setSelectedItemId(item.id);
}, []);

const handleEditItem = useCallback((item: any) => {
  console.log('Edit:', item);
  setSelectedItemId(null);
}, []);

const handleDeleteItem = useCallback((id: string) => {
  if (confirm('Confirmer la suppression ?')) {
    console.log('Delete:', id);
    setSelectedItemId(null);
  }
}, []);
```

- [ ] **1.4** Passer les callbacks au ContentRouter
```typescript
<ContentRouter
  onViewItem={handleViewItem}
  onEditItem={handleEditItem}
  onDeleteItem={handleDeleteItem}
/>
```

- [ ] **1.5** Ajouter le modal avant la fermeture du composant
```typescript
{selectedItem && (
  <GenericDetailModal
    isOpen={!!selectedItemId}
    onClose={() => {
      setSelectedItemId(null);
      setSelectedItem(null);
    }}
    title={selectedItem.name}
    subtitle={selectedItem.id}
    icon={YourIcon}
    iconClassName="bg-blue-500/10 text-blue-400"
    sections={[
      {
        title: 'Section 1',
        icon: Icon1,
        fields: [
          { label: 'Champ 1', value: selectedItem.field1, icon: Icon1 },
          { label: 'Champ 2', value: selectedItem.field2, icon: Icon2 },
        ]
      },
    ]}
    actions={{
      onEdit: () => handleEditItem(selectedItem),
      onDelete: () => handleDeleteItem(selectedItem.id),
    }}
  />
)}
```

---

### 📋 Étape 2 : Mettre à Jour le ContentRouter

**Fichier**: `src/components/features/bmo/[module]/command-center/ContentRouter.tsx`

- [ ] **2.1** Ajouter/Mettre à jour l'interface Props
```typescript
interface ContentRouterProps {
  // ... props existantes
  onViewItem?: (item: any) => void;
  onEditItem?: (item: any) => void;
  onDeleteItem?: (id: string) => void;
}
```

- [ ] **2.2** Accepter les props dans la signature
```typescript
export function ContentRouter({
  // ... props existantes
  onViewItem,
  onEditItem,
  onDeleteItem,
}: ContentRouterProps) {
```

- [ ] **2.3** Propager aux vues enfants
```typescript
const viewProps = { onViewItem, onEditItem, onDeleteItem };

switch (category) {
  case 'overview':
    return <OverviewView {...viewProps} />;
  case 'list':
    return <ListView {...viewProps} />;
  // ...
}
```

---

### 📋 Étape 3 : Mettre à Jour les Vues

**Fichier**: Même fichier ContentRouter (vues internes)

- [ ] **3.1** Accepter les props dans chaque vue
```typescript
function OverviewView({ onViewItem, onEditItem, onDeleteItem }: Partial<ContentRouterProps> = {}) {
  // ...
}
```

- [ ] **3.2** Utiliser `onViewItem` dans les clics
```typescript
// AVANT
<div onClick={() => console.log('clicked')} className="...">

// APRÈS
<div onClick={() => onViewItem?.(item)} className="...">
```

- [ ] **3.3** Répéter pour toutes les vues qui affichent des listes

---

### 📋 Étape 4 : Configurer les Sections du Modal

- [ ] **4.1** Identifier les données à afficher
- [ ] **4.2** Organiser en sections logiques
- [ ] **4.3** Choisir les icônes appropriées
- [ ] **4.4** Définir les badges de statut
- [ ] **4.5** Configurer les actions personnalisées

**Exemple de configuration** :
```typescript
sections={[
  {
    title: 'Informations générales',
    icon: Info,
    fields: [
      { label: 'ID', value: item.id, icon: Hash },
      { label: 'Nom', value: item.name, icon: Type },
      { label: 'Statut', value: item.status, icon: Activity },
    ]
  },
  {
    title: 'Dates',
    icon: Calendar,
    fields: [
      { 
        label: 'Créé le', 
        value: new Date(item.createdAt).toLocaleDateString('fr-FR'),
        icon: Calendar 
      },
      { 
        label: 'Mis à jour', 
        value: new Date(item.updatedAt).toLocaleDateString('fr-FR'),
        icon: Clock 
      },
    ]
  },
  {
    title: 'Détails',
    fields: [
      { 
        label: 'Description', 
        value: item.description, 
        fullWidth: true 
      }
    ]
  }
]}
```

---

### 📋 Étape 5 : Tests et Vérifications

- [ ] **5.1** Vérifier absence d'erreurs linter
```bash
# Dans Cursor : Cmd/Ctrl + Shift + M
```

- [ ] **5.2** Tester le clic sur un item
  - [ ] Le modal s'ouvre
  - [ ] L'overlay apparaît
  - [ ] Les données sont correctes
  
- [ ] **5.3** Tester la fermeture
  - [ ] Bouton ×
  - [ ] Clic sur overlay
  - [ ] Touche Escape

- [ ] **5.4** Tester les actions
  - [ ] Bouton Modifier
  - [ ] Bouton Supprimer
  - [ ] Actions personnalisées
  - [ ] Menu dropdown (si présent)

- [ ] **5.5** Vérifier le responsive
  - [ ] Desktop (≥1024px)
  - [ ] Tablet (768-1023px)
  - [ ] Mobile (<768px)

---

## 🎯 Templates Rapides

### Template Page Principale

```typescript
'use client';

import React, { useState, useCallback } from 'react';
import { GenericDetailModal } from '@/components/ui/GenericDetailModal';
import { Icon1, Icon2, Icon3 } from 'lucide-react';

export default function VotrePage() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleViewItem = useCallback((item: any) => {
    setSelectedItem(item);
    setSelectedItemId(item.id);
  }, []);

  const handleEditItem = useCallback((item: any) => {
    console.log('Edit:', item);
    setSelectedItemId(null);
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    if (confirm('Confirmer ?')) {
      console.log('Delete:', id);
      setSelectedItemId(null);
    }
  }, []);

  return (
    <div className="h-screen flex">
      {/* Votre layout existant */}
      
      <ContentRouter
        onViewItem={handleViewItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />

      {/* Modal */}
      {selectedItem && (
        <GenericDetailModal
          isOpen={!!selectedItemId}
          onClose={() => {
            setSelectedItemId(null);
            setSelectedItem(null);
          }}
          title={selectedItem.name}
          subtitle={selectedItem.id}
          icon={Icon1}
          sections={[/* voir config ci-dessus */]}
          actions={{
            onEdit: () => handleEditItem(selectedItem),
            onDelete: () => handleDeleteItem(selectedItem.id),
          }}
        />
      )}
    </div>
  );
}
```

### Template ContentRouter

```typescript
interface ContentRouterProps {
  category?: string;
  onViewItem?: (item: any) => void;
  onEditItem?: (item: any) => void;
  onDeleteItem?: (id: string) => void;
}

export function ContentRouter({
  category,
  onViewItem,
  onEditItem,
  onDeleteItem,
}: ContentRouterProps) {
  const viewProps = { onViewItem, onEditItem, onDeleteItem };
  
  switch (category) {
    case 'list':
      return <ListView {...viewProps} />;
    default:
      return <OverviewView {...viewProps} />;
  }
}

function OverviewView({ onViewItem }: Partial<ContentRouterProps> = {}) {
  return (
    <div>
      {items.map(item => (
        <div 
          key={item.id}
          onClick={() => onViewItem?.(item)}
          className="cursor-pointer hover:bg-slate-800/50"
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

---

## 🚨 Erreurs Communes à Éviter

### ❌ Oublier les props optionnelles
```typescript
// MAUVAIS
interface Props {
  onViewItem: (item: any) => void;
}

// BON
interface Props {
  onViewItem?: (item: any) => void;
}
```

### ❌ Oublier l'optional chaining
```typescript
// MAUVAIS
onClick={() => onViewItem(item)}

// BON
onClick={() => onViewItem?.(item)}
```

### ❌ Ne pas propager aux vues enfants
```typescript
// MAUVAIS
switch (category) {
  case 'list':
    return <ListView />; // Pas de props !
}

// BON
switch (category) {
  case 'list':
    return <ListView {...viewProps} />;
}
```

### ❌ Oublier de fermer les deux états
```typescript
// MAUVAIS
onClose={() => setSelectedItemId(null)}

// BON
onClose={() => {
  setSelectedItemId(null);
  setSelectedItem(null);
}}
```

---

## 📊 Temps d'Implémentation

| Étape | Temps | Difficulté |
|-------|-------|------------|
| Étape 1 : Page principale | 2-3 min | ⭐ Facile |
| Étape 2 : ContentRouter | 1-2 min | ⭐ Facile |
| Étape 3 : Vues | 1-2 min | ⭐ Facile |
| Étape 4 : Configuration sections | 3-5 min | ⭐⭐ Moyen |
| Étape 5 : Tests | 2-3 min | ⭐ Facile |
| **TOTAL** | **9-15 min** | **⭐ Facile** |

---

## ✅ Pages Déjà Implémentées (Références)

### 🏆 Finances (Référence complète)
- ✅ Modals custom avancés
- ✅ DataTable sophistiqué
- ✅ Toutes fonctionnalités
- 📍 `app/(portals)/maitre-ouvrage/finances/page.tsx`

### 🏆 Projets (Référence GenericDetailModal)
- ✅ Pattern modal générique
- ✅ Sections multiples
- ✅ Actions custom
- 📍 `app/(portals)/maitre-ouvrage/projets-en-cours/page.tsx`

### 🏆 Clients (Référence GenericDetailModal)
- ✅ Pattern modal générique
- ✅ Badges dynamiques
- ✅ Sections variées
- 📍 `app/(portals)/maitre-ouvrage/clients/page.tsx`

---

## 🎉 Félicitations !

Si vous avez coché toutes les cases, le pattern modal overlay est implémenté !

**Profitez d'une UX moderne et cohérente dans toute votre application ! 🚀**

