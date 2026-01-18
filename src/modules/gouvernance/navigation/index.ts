/**
 * Export de la navigation du module Gouvernance
 */

// Old exports (for backwards compatibility)
export { GouvernanceSidebar as GouvernanceSidebarOld } from './GouvernanceSidebar';
export { gouvernanceNavigation, getDomainById, getSectionById, getBadgeCount } from './gouvernanceNavigationConfig';
export type { GouvernanceNavItem, GouvernanceNavDomain } from './gouvernanceNavigationConfig';

// New 3-level navigation exports
export { GovernanceSidebar } from './GovernanceSidebar';
export { GovernanceSubNavigation } from './GovernanceSubNavigation';
export { governanceNavigationConfig, findNavNodeById, getSubCategories, getSubSubCategories } from './governanceNavigationConfig';
export type { NavNode } from './governanceNavigationConfig';
export type { GovernanceMainCategory, GovernanceSubCategory, GovernanceSubSubCategory } from '../types/governanceNavigationTypes';

