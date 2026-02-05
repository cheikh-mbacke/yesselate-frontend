/**
 * Export central des composants Command Center pour Projets
 * Architecture cohérente avec Blocked Command Center et Analytics
 */

export { ProjetsCommandSidebar, projetsCategories } from './ProjetsCommandSidebar';
export type { ProjetsCategory } from './ProjetsCommandSidebar';

export {
  ProjetsSubNavigation,
  projetsSubCategoriesMap,
  projetsFiltersMap,
} from './ProjetsSubNavigation';
export type { ProjetsSubCategory } from './ProjetsSubNavigation';

export { ProjetsKPIBar } from './ProjetsKPIBar';
export type { ProjetsKPIData } from './ProjetsKPIBar';

export { ProjetsContentRouter } from './ProjetsContentRouter';
export { ProjetsModals } from './ProjetsModals';

// Export analytics charts
export * from './analytics/ProjetsAnalyticsCharts';

// Export hooks
export { useProjetsData, useProjetsStats, useProjetsDashboard } from './hooks/useProjetsData';

// Export shared UI components
export * from './shared/UIComponents';

// Export advanced modals
export * from './modals';

// Re-export store types for convenience
export type {
  ProjetsMainCategory,
  ProjetsSubCategoryMap,
  ProjetsModalType,
  ProjetsNavigationState,
  ProjetsModalState,
  ProjetsKPIConfig,
  ProjetsActiveFilters,
  ProjetsStats,
  ProjetsHistoryEntry,
  ProjetsCommandCenterState,
} from '@/lib/stores/projetsCommandCenterStore';

export { useProjetsCommandCenterStore } from '@/lib/stores/projetsCommandCenterStore';

