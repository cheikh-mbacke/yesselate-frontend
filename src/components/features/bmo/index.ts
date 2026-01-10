/**
 * BMO Features Components Index
 * ==============================
 * 
 * Point d'entrée centralisé pour tous les composants BMO
 */

// Composants principaux
export { NotificationCenter } from './NotificationCenter';
export { CommentSection } from './CommentSection';
export { AlertsPanel } from './AlertsPanel';
export { WorkflowViewer } from './WorkflowViewer';
export { AnalyticsDashboard } from './AnalyticsDashboard';

// Composants workspace - Finances
export { 
  FinancesWorkspaceTabs,
  FinancesWorkspaceContent,
  FinancesLiveCounters,
  FinancesCommandPalette,
  FinancesStatsModal,
  FinancesDashboardView,
  FinancesTresorerieView
} from './workspace/finances';

// Composants workspace - Recouvrements
export {
  RecouvrementsWorkspaceTabs,
  RecouvrementsWorkspaceContent,
  RecouvrementsLiveCounters,
  RecouvrementsCommandPalette,
  RecouvrementsStatsModal,
  RecouvrementsDashboardView,
  RecouvrementsQueueView
} from './workspace/recouvrements';

// Composants workspace - Litiges
export {
  LitigesWorkspaceTabs,
  LitigesWorkspaceContent,
  LitigesLiveCounters,
  LitigesCommandPalette,
  LitigesStatsModal,
  LitigesDashboardView,
  LitigesQueueView
} from './workspace/litiges';

// Composants workspace - Missions
export {
  MissionsWorkspaceTabs,
  MissionsWorkspaceContent,
  MissionsLiveCounters,
  MissionsCommandPalette,
  MissionsStatsModal,
  MissionsDashboardView
} from './workspace/missions';

// Composants workspace - Employes
export {
  EmployesWorkspaceTabs,
  EmployesWorkspaceContent,
  EmployesLiveCounters,
  EmployesCommandPalette,
  EmployesDashboardView,
  EmployesDirectionPanel
} from './workspace/employes';

// Note: Ajoutez d'autres exports selon vos besoins
