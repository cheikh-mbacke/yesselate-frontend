# Alerts Navigation Configuration

## Overview

Centralized configuration for alerts navigation, shortcuts, and domain tree structure has been created in `src/lib/config/alertsNavigation.ts`.

## Files Created

1. ✅ **`src/lib/config/alertsNavigation.ts`** - Main configuration file
2. ✅ **`src/hooks/useAlertsNavigation.ts`** - React hook for navigation utilities
3. ✅ Updated **`app/alertes/page.tsx`** - Uses navigation config
4. ✅ Updated **`app/alertes/[category]/page.tsx`** - Uses navigation config and query mapping

## Configuration Structure

### Shortcuts

```typescript
export const shortcuts: AlertShortcut[] = [
  { key: 'overview', label: 'Vue d\'ensemble', badge: false },
  { key: 'critical', label: 'Critiques', badge: true },
  { key: 'warning', label: 'Avertissements', badge: true },
  { key: 'sla', label: 'SLA dépassés', badge: true },
  { key: 'blocked', label: 'Bloqués', badge: true },
  { key: 'ack', label: 'Acquittées', badge: false },
  { key: 'resolved', label: 'Résolues', badge: false },
  { key: 'history', label: 'Historique', badge: false },
  { key: 'watchlist', label: 'Suivis', badge: false },
];
```

### Domain Tree

Hierarchical navigation structure with 8 main domains:
- 🏗️ Gestion de Chantiers
- 💰 Gestion Financière
- 🧾 Achats & Sous-traitants
- 👤 Ressources Humaines
- 🗓️ Planification & Ordonnancement
- 📑 Commercial & Appels d'Offres
- 🔧 Matériel & Équipements
- 🛡️ Qualité, Sécurité, Environnement

Each domain has children nodes with query parameters for filtering.

### Category to Query Mapping

```typescript
export const categoryToQuery: Record<AlertCategory, Record<string, string>> = {
  overview: {},
  critical: { severity: 'critical' },
  warning: { severity: 'warning' },
  sla: { sla: 'breached' },
  blocked: { status: 'blocked' },
  ack: { status: 'ack' },
  resolved: { status: 'resolved' },
  history: { range: 'past' },
  watchlist: { watchlist: 'true' },
};
```

## Usage

### Using the Hook

```typescript
import { useAlertsNavigation } from '@/hooks/useAlertsNavigation';

function MyComponent() {
  const {
    navigateToCategory,
    navigateToNode,
    currentCategory,
    shortcuts,
    domainTree,
    findNode,
  } = useAlertsNavigation();

  // Navigate to a category
  navigateToCategory('critical');

  // Navigate to a domain node
  const node = findNode('payments_docs');
  if (node) {
    navigateToNode(node);
  }
}
```

### Direct Import

```typescript
import { 
  shortcuts, 
  domainTree, 
  categoryToQuery, 
  getCategoryQuery 
} from '@/lib/config/alertsNavigation';

// Get query for a category
const query = getCategoryQuery('critical'); // { severity: 'critical' }

// Get shortcuts with badges
const withBadges = shortcuts.filter(s => s.badge);
```

## Integration Points

### Routes

- ✅ `/alertes` - Overview page uses `getCategoryQuery('overview')`
- ✅ `/alertes/:category` - Category pages use `getCategoryQuery()` and `getShortcut()`

### Components to Update

Potential components that could benefit from this configuration:

1. **`AlertCommandPalette`** - Could use shortcuts for navigation commands
2. **`AlertsCommandSidebar`** - Could use shortcuts instead of hardcoded categories
3. **Alert filtering components** - Could use `categoryToQuery` for filter logic

## Next Steps

1. Update `AlertsCommandSidebar` to use `shortcuts` from config
2. Update `AlertCommandPalette` to use shortcuts for navigation
3. Create domain tree navigation component
4. Add keyboard shortcuts based on shortcuts configuration
5. Integrate query parameters with alert filtering logic

## Benefits

- ✅ **Centralized Configuration** - Single source of truth for navigation
- ✅ **Type Safety** - Uses `AlertCategory` type for type safety
- ✅ **Query Mapping** - Automatic query parameter generation
- ✅ **Reusable** - Hook makes it easy to use across components
- ✅ **Maintainable** - Easy to add/remove shortcuts or domains

