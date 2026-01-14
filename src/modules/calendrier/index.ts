/**
 * Module Calendrier & Planification v3.0
 * Exports principaux
 */

// Navigation
export { CalendrierSidebar } from './navigation/CalendrierSidebar';
export { calendrierNavigation } from './navigation/calendrierNavigationConfig';
export type { CalendrierNavItem } from './navigation/calendrierNavigationConfig';

// Types
export type * from './types/calendrierTypes';

// Stores
export { useCalendrierFiltersStore } from './stores/calendrierFiltersStore';

// Hooks
export { useCalendrierFilters } from './hooks/useCalendrierFilters';
export { useCalendrierData, useJalons, useEvenements, useAbsences } from './hooks/useCalendrierData';
export { useCalendrierSyncStatus } from './hooks/useCalendrierSyncStatus';

// API
export * from './api/calendrierApi';

// Components
export { CalendarHeader } from './components/CalendarHeader';
export { CalendarViewSwitcher } from './components/CalendarViewSwitcher';
export { PeriodSelector } from './components/PeriodSelector';
export { AlertsSummaryPanel } from './components/AlertsSummaryPanel';
export { QuickActionsPanel } from './components/QuickActionsPanel';
export { ControlStationPanel } from './components/ControlStationPanel';
export { GanttChart } from './components/GanttChart';
export { CalendarGrid } from './components/CalendarGrid';
export { TimelineView } from './components/TimelineView';

// Pages
export { CalendrierOverviewPage } from './pages/overview/CalendrierOverviewPage';
export { CalendrierGlobalView } from './pages/overview/CalendrierGlobalView';
export { CalendrierByChantierView } from './pages/overview/CalendrierByChantierView';
export { GanttGlobalView } from './pages/gantt/GanttGlobalView';
export { GanttByChantierView } from './pages/gantt/GanttByChantierView';
export { TimelineGlobalView } from './pages/timeline/TimelineGlobalView';
export { TimelineByChantierView } from './pages/timeline/TimelineByChantierView';
export { JalonsSlaRisquePage } from './pages/jalons/JalonsSlaRisquePage';
export { JalonsRetardsPage } from './pages/jalons/JalonsRetardsPage';
export { JalonsAVenirPage } from './pages/jalons/JalonsAVenirPage';
export { AbsencesGlobalPage } from './pages/absences/AbsencesGlobalPage';
export { AbsencesParEquipePage } from './pages/absences/AbsencesParEquipePage';
export { AbsencesParChantierPage } from './pages/absences/AbsencesParChantierPage';
export { EvenementsInternesPage } from './pages/evenements/EvenementsInternesPage';
export { ReunionsProjetsPage } from './pages/evenements/ReunionsProjetsPage';
export { ReunionsDecisionnellesPage } from './pages/evenements/ReunionsDecisionnellesPage';

