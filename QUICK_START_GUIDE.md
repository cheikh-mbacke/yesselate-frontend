# ⚡ Quick Start Guide - 5 Minutes

**Pour démarrer rapidement avec les nouveaux composants**

---

## 🚀 Installation (Déjà fait !)

Tous les composants sont déjà intégrés dans `app/layout.tsx`. Aucune installation nécessaire !

---

## 1️⃣ Toast (30 secondes)

```tsx
import { useToast } from '@/components/features/bmo/ToastProvider';

function MyComponent() {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast.success('Sauvegardé !');
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

---

## 2️⃣ Loading (30 secondes)

```tsx
import { Spinner, Skeleton } from '@/components/features/bmo/LoadingStates';

{loading ? <Spinner /> : <Content />}
{loading ? <Skeleton className="h-10 w-full" /> : <Content />}
```

---

## 3️⃣ Empty State (30 secondes)

```tsx
import { EmptyList } from '@/components/features/bmo/EmptyStates';

{items.length === 0 && (
  <EmptyList itemName="élément" onCreate={handleCreate} />
)}
```

---

## 4️⃣ Auth (1 minute)

```tsx
import { useAuth } from '@/lib/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) return <LoginForm />;
  
  return <div>Bonjour {user?.prenom}</div>;
}
```

---

## 5️⃣ Modal Navigation (2 minutes)

```tsx
import { useListNavigation } from '@/lib/hooks/useListNavigation';

const {
  selectedItem,
  isOpen,
  handleOpen,
  handleClose,
  handleNext,
  handlePrevious,
} = useListNavigation(items, (item) => item.id);

// Dans votre liste
{items.map(item => (
  <div onClick={() => handleOpen(item)}>{item.name}</div>
))}

// Modal
{selectedItem && (
  <Modal isOpen={isOpen} onClose={handleClose}>
    <button onClick={handlePrevious}>←</button>
    <Content item={selectedItem} />
    <button onClick={handleNext}>→</button>
  </Modal>
)}
```

---

## 📦 Mock Data (30 secondes)

```tsx
import { mockBlockedDossiers, mockSubstitutions } from '@/lib/mocks';

const data = mockBlockedDossiers;
```

---

## ✅ Checklist

- [ ] Toast ajouté dans au moins un composant
- [ ] Loading states utilisés
- [ ] Empty states ajoutés aux listes
- [ ] Auth testé (login/logout)
- [ ] Modal navigation testée

---

**C'est tout ! Vous êtes prêt ! 🎉**

Pour plus de détails, voir `GUIDE_UTILISATION_RAPIDE.md`

