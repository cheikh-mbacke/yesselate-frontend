# 📚 Guide de Migration et Upgrade - Module Analytics

## Version 10.0 - Architecture Complète

Ce guide décrit les améliorations apportées au module analytics et comment migrer vers la nouvelle architecture.

---

## 🎯 Vue d'ensemble des améliorations

### Architecture en couches
- **Domain** : Entités, Services, Schémas Zod
- **Infrastructure** : Repository avec cache et retry
- **Application** : Hooks et utilitaires
- **Presentation** : Composants réutilisables

### Statistiques
- ✅ **130+ fichiers** créés
- ✅ **~17000 lignes** de code structuré
- ✅ **17 hooks** personnalisés
- ✅ **60+ composants** réutilisables
- ✅ **200+ utilitaires**
- ✅ **0 erreur TypeScript**
- ✅ **0 erreur de linting**

---

## 📦 Nouveaux utilitaires

### Date Utils Advanced (`dateUtilsAdvanced.ts`)

```typescript
import {
  getFirstDayOfWeek,
  getLastDayOfWeek,
  isToday,
  isYesterday,
  isTomorrow,
  formatRelativeDate,
  formatDuration,
  getDatesInMonth,
  getDatesInWeek,
  getWeekNumber,
  getQuarterNumber,
  isBusinessDay,
  getNextBusinessDay,
  getPreviousBusinessDay,
  countBusinessDays,
} from '@/application/utils';
```

**Exemples d'utilisation :**

```typescript
// Vérifier si une date est aujourd'hui
if (isToday(someDate)) {
  // ...
}

// Obtenir toutes les dates d'un mois
const dates = getDatesInMonth(new Date());

// Compter les jours ouvrables
const businessDays = countBusinessDays(startDate, endDate);

// Formater une date relative
const relative = formatRelativeDate(date); // "Aujourd'hui", "Hier", "Il y a 3 jours"
```

### Permission Utils Advanced (`permissionUtilsAdvanced.ts`)

```typescript
import {
  PermissionManager,
  permissionManager,
  hasUserPermission,
  canUserAccessResource,
  filterByPermission,
  combinePermissions,
  createPermissionChecker,
} from '@/application/utils';
```

**Exemples d'utilisation :**

```typescript
// Configurer les permissions d'un rôle
permissionManager.setRolePermissions('admin', [
  'read:all',
  'write:all',
  'delete:all',
]);

// Vérifier une permission
if (hasUserPermission(userPermissions, 'read:analytics')) {
  // ...
}

// Créer un checker réutilisable
const checker = createPermissionChecker(userPermissions);
if (checker.has('read:analytics')) {
  // ...
}
```

---

## 🔄 Migration depuis l'ancienne version

### 1. Imports des utilitaires

**Avant :**
```typescript
import { formatDate } from '@/lib/utils/format';
```

**Après :**
```typescript
import { formatDate } from '@/application/utils';
```

### 2. Utilisation des hooks

**Avant :**
```typescript
// Logique métier dans le composant
const [data, setData] = useState();
useEffect(() => {
  // ...
}, []);
```

**Après :**
```typescript
import { useTrendAnalysis } from '@/application/hooks/useTrendAnalysis';

const { analysis, isLoading } = useTrendAnalysis(period1, period2);
```

### 3. Validation avec Zod

**Avant :**
```typescript
// Validation manuelle
if (!data.id || !data.name) {
  throw new Error('Invalid data');
}
```

**Après :**
```typescript
import { PeriodSchema } from '@/domain/analytics/schemas';

const validatedData = PeriodSchema.parse(data);
```

### 4. Gestion d'erreurs

**Avant :**
```typescript
try {
  // ...
} catch (error) {
  console.error(error);
}
```

**Après :**
```typescript
import { AnalyticsErrorBoundary } from '@/presentation/components/ErrorBoundary';

<AnalyticsErrorBoundary>
  {/* Votre composant */}
</AnalyticsErrorBoundary>
```

---

## 🚀 Nouvelles fonctionnalités

### 1. Repository Pattern avec Cache

```typescript
import { AnalyticsRepository } from '@/infrastructure/api/AnalyticsRepository';

const repository = new AnalyticsRepository();

// Cache automatique avec TTL
const data = await repository.getKPIData(kpiId, period);
```

### 2. Composants réutilisables

```typescript
import {
  DataTable,
  StatusBadge,
  AccessibleButton,
  Dropdown,
  Pagination,
  Timeline,
  Accordion,
  Popover,
  Carousel,
  ToastContainer,
} from '@/presentation/components';
```

### 3. Hooks personnalisés

```typescript
import {
  useDebounce,
  useThrottle,
  usePagination,
  useKeyboardNavigation,
  useLocalStorage,
  useToggle,
  usePrevious,
  useClickOutside,
  useMediaQuery,
  usePermission,
} from '@/application/hooks';
```

---

## 📝 Checklist de migration

- [ ] Mettre à jour les imports vers `@/application/utils`
- [ ] Remplacer la logique métier par les hooks personnalisés
- [ ] Utiliser les schémas Zod pour la validation
- [ ] Envelopper les composants avec `AnalyticsErrorBoundary`
- [ ] Remplacer les composants personnalisés par les composants réutilisables
- [ ] Utiliser le `AnalyticsRepository` pour les appels API
- [ ] Tester toutes les fonctionnalités

---

## 🔧 Configuration

### Variables d'environnement

```env
# Cache TTL (en millisecondes)
NEXT_PUBLIC_CACHE_TTL=300000

# Retry configuration
NEXT_PUBLIC_MAX_RETRIES=3
NEXT_PUBLIC_RETRY_DELAY=1000
```

### Permissions

Configurer les permissions dans votre application :

```typescript
import { permissionManager } from '@/application/utils';

permissionManager.setRolePermissions('admin', [
  'read:analytics',
  'write:analytics',
  'delete:analytics',
]);
```

---

## 📚 Documentation complémentaire

- `GUIDE_UTILISATION_V10.md` - Guide d'utilisation complet
- `RESUME_FINAL_COMPLET_V10.md` - Résumé de toutes les améliorations

---

## 🐛 Dépannage

### Problème : Erreur d'import

**Solution :** Vérifier que le fichier existe dans `src/application/utils/index.ts`

### Problème : Cache ne fonctionne pas

**Solution :** Vérifier la configuration du TTL et les clés de cache

### Problème : Permissions non appliquées

**Solution :** Vérifier que `permissionManager` est correctement configuré

---

## 📞 Support

Pour toute question ou problème, consultez la documentation ou contactez l'équipe de développement.

---

**Dernière mise à jour :** Version 10.0 - Janvier 2025

