/**
 * Exports centralisés pour le workspace Délégations
 */

// Workspace principal
export { DelegationWorkspaceTabs } from './DelegationWorkspaceTabs';
export { DelegationWorkspaceContent } from './DelegationWorkspaceContent';
export { DelegationLiveCounters } from './DelegationLiveCounters';
export { DelegationCommandPalette } from './DelegationCommandPalette';
export { DelegationDirectionPanel } from './DelegationDirectionPanel';
export { DelegationAlertsBanner } from './DelegationAlertsBanner';
export { DelegationBatchActions } from './DelegationBatchActions';
export { DelegationTimeline } from './DelegationTimeline';
export { DelegationNotifications } from './DelegationNotifications';
export { DelegationSearchBar } from './DelegationSearchBar';
export { DelegationViewer } from './DelegationViewer';

// Nouveaux composants d'amélioration
export { DelegationToastProvider, useDelegationToast } from './DelegationToast';
export { DelegationSearchPanel } from './DelegationSearchPanel';
export { DelegationExportModal } from './DelegationExportModal';
export { DelegationActiveFilters } from './DelegationActiveFilters';
export {
  DelegationDashboardSkeleton,
  DelegationListSkeleton,
  DelegationDetailSkeleton,
  Skeleton,
} from './DelegationSkeletons';

// Vues
export { DelegationInboxView } from './views/DelegationInboxView';
export { DelegationDetailView } from './views/DelegationDetailView';
export { DelegationCreateWizard } from './views/DelegationCreateWizard';

// Sections
export * from './sections';

