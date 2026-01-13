# 🏷️ Badges et Storage - Version 10.0

## ✅ Composants de Badge

### Badge & BadgeGroup ✅
**Fichier**: `src/presentation/components/Badge/BadgeVariants.tsx`

Badges améliorés :
- ✅ 7 variantes (default, primary, success, warning, error, info, outline)
- ✅ 3 tailles (sm, md, lg)
- ✅ Icônes personnalisables
- ✅ Dot indicator
- ✅ Bouton de suppression
- ✅ BadgeGroup avec maxVisible

**Utilisation:**
```tsx
<Badge variant="success" size="md" icon={<Check />}>
  Actif
</Badge>

<BadgeGroup
  badges={[
    { id: '1', label: 'Tag 1', variant: 'primary' },
    { id: '2', label: 'Tag 2', variant: 'success' },
  ]}
  maxVisible={3}
/>
```

## ✅ Composants de Card

### Card Variants ✅
**Fichier**: `src/presentation/components/Card/CardVariants.tsx`

Cartes améliorées :
- ✅ Card - Conteneur principal
- ✅ CardHeader - En-tête avec action
- ✅ CardTitle - Titre
- ✅ CardDescription - Description
- ✅ CardContent - Contenu
- ✅ CardFooter - Pied de page
- ✅ États hover et interactive

**Utilisation:**
```tsx
<Card hover interactive onClick={() => {}}>
  <CardHeader action={<Button>Action</Button>}>
    <CardTitle>Titre de la carte</CardTitle>
    <CardDescription>Description optionnelle</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenu de la carte</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## ✅ Utilitaires de Storage

### storageUtils.ts ✅
**Fichier**: `src/application/utils/storageUtils.ts`

4 classes pour storage :

- ✅ `LocalStorageWithExpiry` - localStorage avec expiration
  - `setItem(key, value, expiryInMinutes)`
  - `getItem<T>(key)`
  - `removeItem(key)`
  - `hasItem(key)`

- ✅ `SessionStorageWithExpiry` - sessionStorage avec expiration
  - Mêmes méthodes que LocalStorageWithExpiry

- ✅ `CookieStorage` - Gestion des cookies
  - `setItem(key, value, options)`
  - `getItem(key)`
  - `removeItem(key)`
  - `hasItem(key)`
  - `getAll()`

- ✅ `StorageWrapper` - Wrapper générique avec préfixe
  - `setItem<T>(key, value)`
  - `getItem<T>(key)`
  - `removeItem(key)`
  - `clear()`
  - `getAllKeys()`

**Utilisation:**
```tsx
import { LocalStorageWithExpiry, CookieStorage } from '@/application/utils';

// LocalStorage avec expiration (1 heure)
LocalStorageWithExpiry.setItem('token', 'abc123', 60);
const token = LocalStorageWithExpiry.getItem<string>('token');

// Cookies
CookieStorage.setItem('theme', 'dark', { expiresInDays: 30 });
const theme = CookieStorage.getItem('theme');
```

## ✅ Utilitaires de Test

### testUtils.ts ✅
**Fichier**: `src/application/utils/testUtils.ts`

Helpers pour tests :

- ✅ `createMockFunction()` - Mock de fonction
- ✅ `waitFor()` - Attendre condition
- ✅ `generateTestData()` - Générer données de test
- ✅ `createMockObject()` - Mock d'objet
- ✅ `isElementVisible()` - Vérifier visibilité
- ✅ `simulateEvent()` - Simuler événement
- ✅ `createMockApiResponse()` - Mock réponse API
- ✅ `cleanupMocks()` - Nettoyer mocks
- ✅ `createMockStore()` - Mock store Zustand
- ✅ `generateTestId()` - Générer ID unique
- ✅ `createAsyncMock()` - Mock async avec délai

**Utilisation:**
```tsx
import { createMockFunction, waitFor, generateTestData } from '@/application/utils';

const mockFn = createMockFunction('return value');
await waitFor(() => condition === true);
const testData = generateTestData((i) => ({ id: i, name: `Item ${i}` }), 10);
```

## 🎯 Bénéfices

1. **Badges**
   - Variantes multiples
   - Groupes intelligents
   - UX améliorée

2. **Cards**
   - Structure claire
   - Composants modulaires
   - États interactifs

3. **Storage**
   - Expiration automatique
   - Gestion cookies
   - Wrapper générique

4. **Tests**
   - Helpers pratiques
   - Mocks réutilisables
   - Utilitaires complets

## 📝 Structure

```
src/presentation/components/
├── Badge/              ✅
└── Card/               ✅

src/application/utils/
├── storageUtils.ts    ✅
└── testUtils.ts       ✅
```

## ✨ Résultats

**Composants créés :**
- ✅ Badge & BadgeGroup
- ✅ Card avec 5 sous-composants

**Utilitaires créés :**
- ✅ 4 classes de storage
- ✅ 11 fonctions de test

**Le module analytics dispose maintenant d'une suite complète de badges, cards, storage et tests !** 🎉

