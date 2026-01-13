# 🔄 Guide de Migration - Version 10.0

## 📋 Vue d'Ensemble

Ce guide vous aidera à migrer votre code existant vers la Version 10.0 du module analytics avec ses nouvelles fonctionnalités et améliorations.

## 🚀 Démarrage Rapide

### 1. Mise à jour des Imports

#### Avant
```tsx
import { formatCurrency } from '@/utils/format';
import { isValidEmail } from '@/utils/validation';
```

#### Après
```tsx
import { formatCurrency, isValidEmail } from '@/application/utils';
```

### 2. Utilisation des Nouveaux Hooks

#### Avant
```tsx
const [debouncedValue, setDebouncedValue] = useState(value);
useEffect(() => {
  const timer = setTimeout(() => setDebouncedValue(value), 300);
  return () => clearTimeout(timer);
}, [value]);
```

#### Après
```tsx
import { useDebounce } from '@/application/hooks';

const debouncedValue = useDebounce(value, 300);
```

### 3. Utilisation des Nouveaux Composants

#### Avant
```tsx
<div className="bg-slate-800 p-4 rounded">
  <h3>Titre</h3>
  <p>Contenu</p>
</div>
```

#### Après
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/Card';

<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Contenu</p>
  </CardContent>
</Card>
```

## 📦 Migration par Catégorie

### Hooks

#### useDebounce / useThrottle
```tsx
// ✅ Nouveau
import { useDebounce, useThrottle } from '@/application/hooks';

const debounced = useDebounce(value, 300);
const throttled = useThrottle(value, 1000);
```

#### usePagination
```tsx
// ✅ Nouveau
import { usePagination } from '@/application/hooks';

const {
  currentPage,
  totalPages,
  goToPage,
  nextPage,
  previousPage,
} = usePagination({
  totalItems: 100,
  itemsPerPage: 10,
});
```

### Composants

#### Modal
```tsx
// ✅ Nouveau
import { EnhancedModal } from '@/presentation/components/Modal';

<EnhancedModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Titre"
  size="lg"
>
  <p>Contenu</p>
</EnhancedModal>
```

#### Form
```tsx
// ✅ Nouveau
import {
  FormField,
  FormInput,
  FormSelect,
} from '@/presentation/components/Form';

<FormField label="Email" error={errors.email}>
  <FormInput
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>
```

#### Layout
```tsx
// ✅ Nouveau
import { Container, Stack, Grid } from '@/presentation/components/Layout';

<Container size="lg">
  <Stack spacing={4}>
    <Grid cols={3} gap={4}>
      <Card>Item 1</Card>
      <Card>Item 2</Card>
      <Card>Item 3</Card>
    </Grid>
  </Stack>
</Container>
```

### Utilitaires

#### Format
```tsx
// ✅ Nouveau
import {
  formatCurrency,
  formatNumber,
  formatDate,
} from '@/application/utils';

const price = formatCurrency(1000000);
const number = formatNumber(1234.56, 2);
const date = formatDate(new Date(), 'dd/MM/yyyy');
```

#### Validation
```tsx
// ✅ Nouveau
import {
  isValidEmail,
  validatePasswordStrength,
} from '@/application/utils';

const emailValid = isValidEmail('user@example.com');
const pwdStrength = validatePasswordStrength('MyP@ssw0rd');
```

#### Storage
```tsx
// ✅ Nouveau
import {
  LocalStorageWithExpiry,
  CookieStorage,
} from '@/application/utils';

LocalStorageWithExpiry.setItem('token', 'abc123', 60);
const token = LocalStorageWithExpiry.getItem<string>('token');
```

## 🔧 Changements Majeurs

### 1. Architecture en Couches

L'architecture a été réorganisée en couches :
- `domain/` - Logique métier
- `infrastructure/` - Accès aux données
- `application/` - Hooks et utilitaires
- `presentation/` - Composants UI

### 2. Nouveaux Patterns

- **Repository Pattern** pour l'accès aux données
- **Service Layer** pour la logique métier
- **Validation Zod** pour la validation
- **Error Boundaries** pour la gestion d'erreurs

### 3. Performance

- Virtualisation des listes
- Lazy loading avec Suspense
- Mémoisation avancée
- Cache LRU

## 📝 Checklist de Migration

- [ ] Mettre à jour les imports
- [ ] Remplacer les hooks personnalisés par les nouveaux hooks
- [ ] Remplacer les composants personnalisés par les nouveaux composants
- [ ] Utiliser les nouveaux utilitaires
- [ ] Mettre à jour la validation avec Zod
- [ ] Ajouter les Error Boundaries
- [ ] Optimiser les performances
- [ ] Tester toutes les fonctionnalités

## 🆘 Support

Pour toute question ou problème lors de la migration :
1. Consultez la documentation complète
2. Vérifiez les exemples dans le code
3. Utilisez les types TypeScript pour l'autocomplétion

---

**Version 10.0 - Guide de Migration** 🔄

