/**
 * Exports pour la navigation du module Calendrier
 */

// Sidebar (nouvelle version à 3 niveaux)
export { CalendrierSidebar3Levels as CalendrierSidebar } from './CalendrierSidebar3Levels';

// SubNavigation
export { CalendrierSubNavigation } from './CalendrierSubNavigation';

// Config et types
export {
  calendrierNavigationConfig3Levels,
  findNavNodeById,
  getSubCategories,
  getSubSubCategories,
  type NavNode,
} from './calendrierNavigationConfig3Levels';
export type {
  CalendrierMainCategory,
  CalendrierSubCategory,
  CalendrierSubSubCategory,
  CalendrierNavItem,
} from '../types/calendrierNavigationTypes';

// Ancienne config (conservée pour compatibilité)
export { calendrierNavigation, type CalendrierNavItem as OldCalendrierNavItem } from './calendrierNavigationConfig';

