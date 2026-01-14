# Alerts Store Usage

## Overview

The `alertsStore` manages UI state for the alerts page, including:
- **Mode**: Display mode (tout, synthese, points-cles, a-traiter)
- **Search**: Search query string
- **Filters**: Filters panel open/closed state
- **Sidebar**: Sidebar navigation state (N2 and N3 levels)

## Store Location

`src/lib/stores/alertsStore.ts`

## Usage

### Basic Usage

```typescript
import { useAlertsStore } from '@/lib/stores/alertsStore';

function AlertsComponent() {
  const { 
    mode, 
    search, 
    filtersOpen, 
    sidebar,
    setMode, 
    setSearch, 
    toggleFilters, 
    setSidebar 
  } = useAlertsStore();

  return (
    <div>
      <button onClick={() => setMode('synthese')}>
        Mode: {mode}
      </button>
      
      <input 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher..."
      />
      
      <button onClick={toggleFilters}>
        {filtersOpen ? 'Masquer' : 'Afficher'} filtres
      </button>
      
      <button onClick={() => setSidebar({ openN2: 'finance' })}>
        Ouvrir Finance
      </button>
    </div>
  );
}
```

### Mode Selection

```typescript
const { mode, setMode } = useAlertsStore();

// Available modes:
// - 'tout': Show all alerts
// - 'synthese': Summary view
// - 'points-cles': Key points
// - 'a-traiter': To be processed

setMode('synthese');
```

### Sidebar Navigation

```typescript
const { sidebar, setSidebar } = useAlertsStore();

// Open N2 level (domain)
setSidebar({ openN2: 'finance' });

// Open N3 level (sub-domain)
setSidebar({ openN2: 'finance', openN3: 'payments_docs' });

// Close N3, keep N2
setSidebar({ openN3: null });

// Close both
setSidebar({ openN2: null, openN3: null });
```

### Search

```typescript
const { search, setSearch } = useAlertsStore();

// Set search query
setSearch('paiement');

// Clear search
setSearch('');
```

### Filters Panel

```typescript
const { filtersOpen, toggleFilters } = useAlertsStore();

// Toggle filters panel
toggleFilters();

// Or access directly
const { filtersOpen } = useAlertsStore();
```

## Persistence

The store automatically persists:
- **Mode**: Saved to `localStorage` as `alerts:mode`
- **Sidebar state**: Saved to `localStorage` as `alerts:sidebar`

Search and filters state are not persisted (reset on page reload).

## Integration with Existing Stores

This store complements `alertWorkspaceStore`:
- **`alertsStore`**: UI state (mode, search, filters, sidebar)
- **`alertWorkspaceStore`**: Workspace tabs and alert data

You can use both together:

```typescript
import { useAlertsStore } from '@/lib/stores/alertsStore';
import { useAlertWorkspaceStore } from '@/lib/stores/alertWorkspaceStore';

function AlertsPage() {
  const { mode, search, filtersOpen, sidebar } = useAlertsStore();
  const { tabs, openTab } = useAlertWorkspaceStore();
  
  // Use both stores together
  // ...
}
```

## TypeScript Types

```typescript
import type { AlertsMode, SidebarState, AlertsStore } from '@/lib/stores/alertsStore';

// AlertsMode: 'tout' | 'synthese' | 'points-cles' | 'a-traiter'
// SidebarState: { openN2: string | null; openN3: string | null; }
```

## Example: Complete Alerts Page Component

```typescript
'use client';

import { useAlertsStore } from '@/lib/stores/alertsStore';
import { useAlertsNavigation } from '@/hooks/useAlertsNavigation';

export default function AlertsPage() {
  const { 
    mode, 
    search, 
    filtersOpen, 
    sidebar,
    setMode, 
    setSearch, 
    toggleFilters, 
    setSidebar 
  } = useAlertsStore();
  
  const { shortcuts, navigateToCategory } = useAlertsNavigation();

  return (
    <div>
      {/* Mode selector */}
      <select value={mode} onChange={(e) => setMode(e.target.value as AlertsMode)}>
        <option value="tout">Tout</option>
        <option value="synthese">Synthèse</option>
        <option value="points-cles">Points clés</option>
        <option value="a-traiter">À traiter</option>
      </select>

      {/* Search */}
      <input 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher..."
      />

      {/* Filters toggle */}
      <button onClick={toggleFilters}>
        Filtres {filtersOpen ? '▼' : '▶'}
      </button>

      {/* Sidebar navigation */}
      <nav>
        {shortcuts.map(shortcut => (
          <button
            key={shortcut.key}
            onClick={() => {
              navigateToCategory(shortcut.key);
              setSidebar({ openN2: shortcut.key });
            }}
          >
            {shortcut.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
```

