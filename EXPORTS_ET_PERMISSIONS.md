# 📤 Exports et Permissions - Version 10.0

## ✅ Utilitaires d'Export

### exportUtils.ts ✅
**Fichier**: `src/application/utils/exportUtils.ts`

Utilitaires pour exporter des données :

- ✅ `exportToCSV()` - Export CSV avec formatage
- ✅ `exportToJSON()` - Export JSON (pretty ou compact)
- ✅ `exportToExcel()` - Export Excel (via CSV pour l'instant)
- ✅ `exportTableToPDF()` - Export tableau en PDF (html2canvas + jspdf)
- ✅ `exportData()` - Export générique avec format
- ✅ `exportFormatters` - Formatters prédéfinis (date, currency, number, etc.)

**Utilisation:**
```tsx
import { exportToCSV, exportFormatters } from '@/application/utils';

exportToCSV(alerts, 'alertes', {
  headers: ['Titre', 'Sévérité', 'Date'],
  formatters: {
    createdAt: exportFormatters.date,
    severity: (v) => v.toUpperCase(),
  },
});

// Export PDF
await exportTableToPDF(tableRef.current, 'rapport', {
  title: 'Rapport Analytics',
  orientation: 'landscape',
});
```

## ✅ Composant FilterPanel

### FilterPanel ✅
**Fichier**: `src/presentation/components/FilterPanel/FilterPanel.tsx`

Panneau de filtres avancé :

- ✅ Recherche de filtres
- ✅ Filtres actifs avec tags
- ✅ Types multiples (text, select, multiselect, date, number)
- ✅ Collapsible
- ✅ Reset des filtres
- ✅ Animations

**Utilisation:**
```tsx
<FilterPanel
  filters={[
    { key: 'severity', label: 'Sévérité', type: 'select', options: [...] },
    { key: 'search', label: 'Recherche', type: 'text' },
  ]}
  values={filterValues}
  onChange={setFilterValues}
  collapsible
/>
```

## ✅ Système de Permissions

### permissionUtils.ts ✅
**Fichier**: `src/application/utils/permissionUtils.ts`

Système complet de permissions :

- ✅ `hasRole()` - Vérifier un rôle
- ✅ `hasAnyRole()` - Vérifier un des rôles
- ✅ `hasAllRoles()` - Vérifier tous les rôles
- ✅ `hasPermission()` - Vérifier une permission
- ✅ `hasAnyPermission()` - Vérifier une des permissions
- ✅ `hasAllPermissions()` - Vérifier toutes les permissions
- ✅ `getRolePermissions()` - Obtenir permissions d'un rôle
- ✅ `getAllUserPermissions()` - Toutes les permissions utilisateur
- ✅ `canPerformAction()` - Vérifier si action autorisée

**Permissions prédéfinies:**
- `VIEW_ANALYTICS`, `VIEW_DASHBOARD`, `VIEW_KPIS`, etc.
- `CREATE_ALERT`, `UPDATE_ALERT`, `RESOLVE_ALERT`, etc.
- `CONFIGURE_KPIS`, `EXPORT_DATA`, etc.

**Rôles prédéfinis:**
- `VIEWER` - Lecture seule
- `ANALYST` - Lecture + création
- `ADMIN` - Toutes les actions sauf config
- `SUPER_ADMIN` - Toutes les permissions

**Utilisation:**
```tsx
import { canPerformAction, AnalyticsPermissions } from '@/application/utils';

if (canPerformAction(user, AnalyticsPermissions.CREATE_ALERT)) {
  // Afficher bouton créer alerte
}
```

### PermissionGuard ✅
**Fichier**: `src/presentation/components/PermissionGuard/PermissionGuard.tsx`

Composant pour protéger des éléments :

- ✅ Protection par permission
- ✅ Protection par rôle
- ✅ Fallback personnalisé
- ✅ Require all option

**Utilisation:**
```tsx
<PermissionGuard
  user={currentUser}
  permission={AnalyticsPermissions.CREATE_ALERT}
  fallback={<p>Accès refusé</p>}
>
  <CreateAlertButton />
</PermissionGuard>
```

### usePermission ✅
**Fichier**: `src/application/hooks/usePermission.ts`

Hook pour vérifier les permissions :

- ✅ `can()` - Vérifier permission
- ✅ `hasRole()` - Vérifier rôle
- ✅ `allPermissions` - Toutes les permissions

**Utilisation:**
```tsx
const { can, hasRole, allPermissions } = usePermission(user);

if (can(AnalyticsPermissions.CREATE_ALERT)) {
  // ...
}
```

## 🎯 Bénéfices

1. **Exports**
   - Formats multiples (CSV, JSON, PDF)
   - Formatage personnalisé
   - Facile à utiliser

2. **Filtres**
   - Interface intuitive
   - Types multiples
   - Recherche intégrée

3. **Permissions**
   - Système complet
   - Rôles et permissions
   - Protection des composants
   - Hook réutilisable

## 📝 Structure

```
src/application/utils/
├── exportUtils.ts        ✅
└── permissionUtils.ts    ✅

src/presentation/components/
├── FilterPanel/          ✅
└── PermissionGuard/      ✅

src/application/hooks/
└── usePermission.ts      ✅
```

## ✨ Résultats

**Utilitaires créés :**
- ✅ 6+ fonctions d'export
- ✅ 10+ fonctions de permissions
- ✅ Composant FilterPanel
- ✅ Composant PermissionGuard
- ✅ Hook usePermission

**Le module analytics dispose maintenant d'un système complet d'exports et de permissions !** 🎉

