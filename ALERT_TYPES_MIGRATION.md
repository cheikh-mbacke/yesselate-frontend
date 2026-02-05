# Alert Types Standardization

## Overview

Standardized alert type definitions have been created in `src/lib/types/alert.types.ts`. These types are now the canonical definitions for alerts across the application.

## New Types

### AlertSeverity
```typescript
export type AlertSeverity = 'critical' | 'warning' | 'info';
```

### AlertStatus
```typescript
export type AlertStatus = 'open' | 'in-progress' | 'blocked' | 'ack' | 'resolved';
```

### AlertCategory
```typescript
export type AlertCategory =
  | 'overview'
  | 'critical'
  | 'warning'
  | 'sla'
  | 'blocked'
  | 'ack'
  | 'resolved'
  | 'history'
  | 'watchlist';
```

### AlertItem
```typescript
export interface AlertItem {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  ageDays?: number;
  agency?: string;
  site?: string;
  owner?: string;
  domain: string;   // finance | project | procurement | ...
  entity?: string;  // milestone | lot | po | vendor | ...
  flow?: string;    // payment | recovery | ...
  flag?: string;    // missing-docs | overspend | ...
  severity: AlertSeverity;
  status: AlertStatus;
  sla?: 'ok' | 'at-risk' | 'breached';
  isWatched?: boolean;
}
```

## Usage

### Import the types:
```typescript
import type { 
  AlertItem, 
  AlertSeverity, 
  AlertStatus, 
  AlertCategory 
} from '@/lib/types/alert.types';
```

### Or use the legacy re-exports:
```typescript
import type { AlertItem, AlertSeverity } from '@/lib/types/alerts.types';
```

## Migration Notes

- The old `alerts.types.ts` file now re-exports from `alert.types.ts` for backward compatibility
- Legacy type aliases (`Severity`, `Alert`) are still available but deprecated
- Update imports gradually to use the new canonical types

## Files Updated

1. ✅ `src/lib/types/alert.types.ts` - New canonical types file
2. ✅ `src/lib/types/alerts.types.ts` - Updated to re-export new types
3. ✅ `src/components/features/bmo/calendrier/command-center/SidebarAlerts.tsx` - Imports new types

## Next Steps

1. Update API clients to use the new `AlertItem` interface
2. Update components that display alerts to use the new types
3. Update stores and hooks to use the standardized types
4. Remove legacy type definitions from other files

