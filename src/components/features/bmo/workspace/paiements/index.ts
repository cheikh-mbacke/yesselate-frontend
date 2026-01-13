// Paiements Workspace Components
// ==============================

// Workspace Components
export { PaiementsWorkspaceTabs } from './PaiementsWorkspaceTabs';
export { PaiementsWorkspaceContent } from './PaiementsWorkspaceContent';
export { PaiementsContentRouter } from './PaiementsContentRouter';
export { PaiementsLiveCounters } from './PaiementsLiveCounters';
export { PaiementsCommandPalette } from './PaiementsCommandPalette';

// Command Center Components (new architecture)
export { PaiementsCommandSidebar } from './PaiementsCommandSidebar';
export { PaiementsSubNavigation } from './PaiementsSubNavigation';
export { PaiementsKPIBar } from './PaiementsKPIBar';
export { PaiementsStatusBar } from './PaiementsStatusBar';
export { PaiementsToast } from './PaiementsToast';
export { PaiementsFiltersPanel, countActiveFiltersUtil } from './PaiementsFiltersPanel';
export type { PaiementsActiveFilters } from './PaiementsFiltersPanel';

// Modals (new)
export { PaiementsModals } from './PaiementsModals';
export type { PaiementModalType } from './PaiementsModals';
export { PaiementsStatsModal } from './PaiementsStatsModal';
export { PaiementsNotificationPanel } from './PaiementsNotificationPanel';

// Modals détaillés
export { PaiementDetailsModal } from './modals/PaiementDetailsModal';
export { PaiementValidationModal } from './modals/PaiementValidationModal';

// Views
export { 
  PaiementsInboxView, 
  PaiementsDetailView,
  PaiementsEcheancierView,
  PaiementsTresorerieView,
} from './views';

