/**
 * Store Zustand pour le Centre d'Alertes - Maître d'Ouvrage
 * Supervision transversale des alertes, risques, anomalies
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Onglets principaux (9 onglets obligatoires)
export type MainCategory = 
  | 'overview'              // Vue d'ensemble
  | 'critical'              // Alertes critiques
  | 'operational'           // Alertes opérationnelles
  | 'sla-delays'            // Alertes SLA & délais
  | 'financial'             // Alertes financières
  | 'rh-resources'          // Alertes RH & ressources
  | 'projects-sites'        // Alertes projets & chantiers
  | 'system-security'        // Alertes système & sécurité
  | 'history';               // Historique & traçabilité

// Types d'alertes
export type AlertSeverity = 'critical' | 'urgent' | 'warning' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'escalated' | 'archived';
export type AlertSource = 
  | 'execution'      // Exécution (Demandes, Validations, Paiements, etc.)
  | 'projects'       // Projets & Clients
  | 'rh'             // RH & Ressources
  | 'finance'        // Finance & Contentieux
  | 'communication'  // Communication
  | 'system'         // Système
  | 'calendar';      // Calendrier

export interface Alert {
  id: string;
  source: AlertSource;
  type: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: Date;
  updatedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  escalatedAt?: Date;
  assignedTo?: string;
  modulePath?: string;  // Chemin vers le module source
  entityId?: string;    // ID de l'entité source
  metadata?: Record<string, any>;
  impact?: {
    financial?: number;
    operational?: string;
    reputation?: string;
  };
}

// Modal types
export type ModalType = 
  | 'alert-detail'
  | 'treat'
  | 'escalate'
  | 'assign'
  | 'acknowledge'
  | 'resolve'
  | 'comment'
  | 'export'
  | 'filters';

// Modal state
export interface ModalState {
  type: ModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Filtres actifs
export interface ActiveFilters {
  dateRange: { start: Date | null; end: Date | null };
  sources: AlertSource[];
  severities: AlertSeverity[];
  statuses: AlertStatus[];
  modules: string[];
  assignees: string[];
  search: string;
}

// KPIs
export interface AlertKPIs {
  critical: number;
  warnings: number;
  slaExceeded: number;
  blocked: number;
  acknowledged: number;
  resolved: number;
  avgResponseTime: number;  // en heures
  avgResolutionTime: number; // en heures
}

// Navigation state
export interface NavigationState {
  mainCategory: MainCategory;
  navigationHistory: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface CentreAlertesCommandCenterState {
  // Navigation
  mainCategory: MainCategory;
  navigationHistory: string[];
  sidebarCollapsed: boolean;
  kpiBarCollapsed: boolean;
  
  // Modals
  modal: ModalState;
  
  // Filtres
  filters: ActiveFilters;
  filtersPanelOpen: boolean;
  
  // Notifications
  notificationsPanelOpen: boolean;
  
  // Fullscreen
  fullscreen: boolean;
  
  // Sélection
  selectedAlertIds: string[];
  
  // KPIs
  kpis: AlertKPIs | null;
  kpisLoading: boolean;
  
  // Actions
  setMainCategory: (category: MainCategory) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  toggleKpiBar: () => void;
  toggleFullscreen: () => void;
  toggleFiltersPanel: () => void;
  toggleNotificationsPanel: () => void;
  
  // Modals
  openModal: (type: ModalType, data?: Record<string, any>, title?: string, size?: ModalState['size']) => void;
  closeModal: () => void;
  
  // Filtres
  setFilters: (filters: Partial<ActiveFilters>) => void;
  clearFilters: () => void;
  
  // Sélection
  toggleAlertSelection: (alertId: string) => void;
  selectAllAlerts: (alertIds: string[]) => void;
  clearSelection: () => void;
  
  // KPIs
  setKPIs: (kpis: AlertKPIs) => void;
  setKPIsLoading: (loading: boolean) => void;
  
  // Reset
  reset: () => void;
}

const defaultFilters: ActiveFilters = {
  dateRange: { start: null, end: null },
  sources: [],
  severities: [],
  statuses: [],
  modules: [],
  assignees: [],
  search: '',
};

const defaultKPIs: AlertKPIs = {
  critical: 0,
  warnings: 0,
  slaExceeded: 0,
  blocked: 0,
  acknowledged: 0,
  resolved: 0,
  avgResponseTime: 0,
  avgResolutionTime: 0,
};

export const useCentreAlertesCommandCenterStore = create<CentreAlertesCommandCenterState>()(
  persist(
    (set, get) => ({
      // État initial
      mainCategory: 'overview',
      navigationHistory: [],
      sidebarCollapsed: false,
      kpiBarCollapsed: false,
      modal: {
        type: null,
        isOpen: false,
        data: {},
      },
      filters: defaultFilters,
      filtersPanelOpen: false,
      notificationsPanelOpen: false,
      fullscreen: false,
      selectedAlertIds: [],
      kpis: null,
      kpisLoading: false,
      
      // Navigation
      setMainCategory: (category) => {
        const current = get().mainCategory;
        if (current !== category) {
          set((state) => ({
            mainCategory: category,
            navigationHistory: [...state.navigationHistory, current],
          }));
        }
      },
      
      goBack: () => {
        const history = get().navigationHistory;
        if (history.length > 0) {
          const previous = history[history.length - 1];
          set({
            mainCategory: previous as MainCategory,
            navigationHistory: history.slice(0, -1),
          });
        }
      },
      
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleKpiBar: () => set((state) => ({ kpiBarCollapsed: !state.kpiBarCollapsed })),
      toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),
      toggleFiltersPanel: () => set((state) => ({ filtersPanelOpen: !state.filtersPanelOpen })),
      toggleNotificationsPanel: () => set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),
      
      // Modals
      openModal: (type, data = {}, title, size = 'lg') => {
        set({
          modal: {
            type,
            isOpen: true,
            data,
            title,
            size,
          },
        });
      },
      
      closeModal: () => {
        set({
          modal: {
            type: null,
            isOpen: false,
            data: {},
          },
        });
      },
      
      // Filtres
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },
      
      clearFilters: () => {
        set({ filters: defaultFilters });
      },
      
      // Sélection
      toggleAlertSelection: (alertId) => {
        set((state) => {
          const selected = state.selectedAlertIds;
          if (selected.includes(alertId)) {
            return { selectedAlertIds: selected.filter(id => id !== alertId) };
          }
          return { selectedAlertIds: [...selected, alertId] };
        });
      },
      
      selectAllAlerts: (alertIds) => {
        set({ selectedAlertIds: alertIds });
      },
      
      clearSelection: () => {
        set({ selectedAlertIds: [] });
      },
      
      // KPIs
      setKPIs: (kpis) => {
        set({ kpis });
      },
      
      setKPIsLoading: (loading) => {
        set({ kpisLoading: loading });
      },
      
      // Reset
      reset: () => {
        set({
          mainCategory: 'overview',
          navigationHistory: [],
          modal: { type: null, isOpen: false, data: {} },
          filters: defaultFilters,
          selectedAlertIds: [],
          kpis: null,
        });
      },
    }),
    {
      name: 'centre-alertes-command-center',
      partialize: (state) => ({
        mainCategory: state.mainCategory,
        sidebarCollapsed: state.sidebarCollapsed,
        kpiBarCollapsed: state.kpiBarCollapsed,
        filters: state.filters,
      }),
    }
  )
);

