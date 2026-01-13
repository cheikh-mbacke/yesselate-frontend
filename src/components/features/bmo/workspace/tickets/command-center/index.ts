/**
 * Tickets Command Center Components
 * Export centralisé des composants du centre de commandement Tickets
 */

// Core Navigation
export { TicketsCommandSidebar, ticketsCategories } from './TicketsCommandSidebar';
export type { SidebarCategory } from './TicketsCommandSidebar';

export { TicketsSubNavigation, ticketsSubCategoriesMap, ticketsFiltersMap } from './TicketsSubNavigation';
export type { SubCategory } from './TicketsSubNavigation';

export { TicketsKPIBar } from './TicketsKPIBar';
export type { KPIItem } from './TicketsKPIBar';

export { TicketsContentRouter } from './TicketsContentRouter';

// Modals & Decision Center
export { TicketsModals } from './TicketsModals';
export { TicketsDecisionCenter } from './TicketsDecisionCenter';

// Toast Notifications
export { TicketsToastProvider, useTicketsToast } from './TicketsToast';

// Filters Panel
export { 
  TicketsFiltersPanel,
  countActiveTicketsFilters,
  type TicketsActiveFilters,
} from './TicketsFiltersPanel';

// Analytics Charts
export {
  TicketsTrendChart,
  TicketsPriorityChart,
  TicketsCategoryChart,
  TicketsResponseTimeChart,
  TicketsAgentPerformanceChart,
  TicketsSatisfactionChart,
  TicketsSLAComplianceChart,
  TicketsHourlyVolumeChart,
  TicketsClientDistributionChart,
} from './TicketsAnalyticsCharts';
