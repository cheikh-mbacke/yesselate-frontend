// Workspace components for validation-BC module
// Core components
export { ValidationBCWorkspaceTabs } from './ValidationBCWorkspaceTabs';
export { ValidationBCWorkspaceContent } from './ValidationBCWorkspaceContent';
export { ValidationBCLiveCounters } from './ValidationBCLiveCounters';
export { ValidationBCDirectionPanel } from './ValidationBCDirectionPanel';
export { ValidationBCAlertsBanner } from './ValidationBCAlertsBanner';
export { ValidationBCCommandPalette } from './ValidationBCCommandPalette';
export { ValidationBCNotifications } from './ValidationBCNotifications';
export { ValidationBCToastProvider, useValidationBCToast } from './ValidationBCToast';
export { ValidationBCDashboardSkeleton } from './ValidationBCSkeletons';

// Modal components
export { ValidationBCExportModal } from './ValidationBCExportModal';
export { ValidationBCStatsModal } from './ValidationBCStatsModal';
export { ValidationBCBatchActions } from './ValidationBCBatchActions';
export { ValidationBCTimeline } from './ValidationBCTimeline';
export { ValidationBCSearchPanel } from './ValidationBCSearchPanel';
export { ValidationBCQuickCreateModal } from './ValidationBCQuickCreate';
export { ValidationBCModals, type ValidationBCModalType } from './ValidationBCModals';
export { ValidationBCNotificationPanel } from './ValidationBCNotificationPanel';
export { ValidationBCDetailModal } from './ValidationBCDetailModal';
export { useValidationBCListNavigation } from './useValidationBCListNavigation';

// Favorites system
export { ValidationBCFavoritesProvider, useValidationBCFavorites, ValidationBCFavoritesPanel, ValidationBCQuickFavorites } from './ValidationBCFavorites';
export { ValidationBCActiveFilters } from './ValidationBCActiveFilters';

// Advanced features (comme demandes-rh)
export { ValidationBCWorkflowEngine } from './ValidationBCWorkflowEngine';
export { ValidationBCPredictiveAnalytics } from './ValidationBCPredictiveAnalytics';
export { ValidationBCDelegationManager } from './ValidationBCDelegationManager';
export { ValidationBCRemindersSystem } from './ValidationBCRemindersSystem';
export { ValidationBCActivityHistory } from './ValidationBCActivityHistory';

// Business Rules & Controls (Amazon-style)
export { ValidationBCBusinessRules } from './ValidationBCBusinessRules';

// Service Queues (Achats, Finance, Juridique)
export { ValidationBCServiceQueues } from './ValidationBCServiceQueues';
export type { ValidationDocument, DocumentType, ServiceSource, DocumentStatus } from './ValidationBCServiceQueues';

// Validation Modal (multi-step approval)
export { ValidationBCValidationModal } from './ValidationBCValidationModal';

// Document Preview with zoom/rotation/verification (inspired by RHDocumentPreview)
export { ValidationBCDocumentPreview } from './ValidationBCDocumentPreview';
export type { DocumentPiece } from './ValidationBCDocumentPreview';

// Document View - detailed view with 3-way match, validation chain, stakeholders (inspired by DemandView)
export { ValidationBCDocumentView } from './ValidationBCDocumentView';

// Multi-level validation (inspired by RHMultiLevelValidation)
export { ValidationBCMultiLevelValidation } from './ValidationBCMultiLevelValidation';

// Request justificatif modal (demand for supporting documents)
export { ValidationBCRequestJustificatif } from './ValidationBCRequestJustificatif';

// 360 Panel - stakeholders, tasks, risks (inspired by Demand360Panel)
export { ValidationBC360Panel } from './ValidationBC360Panel';

