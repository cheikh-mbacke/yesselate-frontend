/**
 * Store Zustand pour le Centre de Commandement Gouvernance
 * Architecture multi-niveaux: Onglets → Sous-onglets → Sous-sous-onglets
 * Conçu pour le pilotage stratégique et opérationnel grand compte (BTP, SNCF, Amazon)
 */

import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Domaines principaux (niveau 1) - 5 domaines
export type MainCategory = 
  | 'strategic-view'         // Vue stratégique
  | 'decisions-arbitrages'   // Décisions & Arbitrages
  | 'escalations-risks'      // Escalades & Risques
  | 'instances-coordination' // Instances & Coordination
  | 'compliance-performance'; // Conformité & Performance

// Sous-domaines par domaine (niveau 2)
export type SubCategoryMap = {
  'strategic-view': 
    | 'executive-dashboard'  // Tableau de bord exécutif
    | 'director-kpis'        // KPI directeurs
    | 'monthly-summary';     // Synthèse mensuelle
  'decisions-arbitrages':
    | 'pending-decisions'    // Décisions en attente
    | 'decision-history'     // Historique décisions
    | 'blocking-points';     // Points de blocage à trancher
  'escalations-risks':
    | 'active-escalations'   // Escalades en cours
    | 'major-risks'           // Risques majeurs & exposition
    | 'critical-blockages';  // Blocages critiques
  'instances-coordination':
    | 'scheduled-instances'  // Instances programmées
    | 'minutes-followup'      // Comptes-rendus & suivi décisions
    | 'sensitive-projects';   // Projets sensibles & priorités
  'compliance-performance':
    | 'contract-sla'          // Conformité contrats & SLA
    | 'commitments'           // Engagements (budgets, délais)
    | 'resource-utilization'; // Taux utilisation ressources
};

// Vues spécifiques (niveau 3) - optionnel, peut être null
export type SubSubCategoryMap = {
  'executive-dashboard': null;
  'director-kpis': null;
  'monthly-summary': null;
  'pending-decisions': null;
  'decision-history': null;
  'blocking-points': null;
  'active-escalations': null;
  'major-risks': null;
  'critical-blockages': null;
  'scheduled-instances': null;
  'minutes-followup': null;
  'sensitive-projects': null;
  'contract-sla': null;
  'commitments': null;
  'resource-utilization': null;
};

export type SubCategory = SubCategoryMap[MainCategory];
export type SubSubCategory = SubSubCategoryMap[SubCategory] | null;

// Navigation state
export interface NavigationState {
  mainCategory: MainCategory;
  subCategory: SubCategory | null;
  subSubCategory: SubSubCategory | null;
}

// Modal types
export type ModalType = 
  | 'project-detail'
  | 'resource-detail'
  | 'risk-detail'
  | 'alert-detail'
  | 'commitment-detail'
  | 'audit-detail'
  | 'validation-detail'
  | 'delegation-detail'
  | 'escalation'
  | 'decision'
  | 'action-plan'
  | 'document-viewer'
  | 'timeline-detail'
  | 'gantt-fullscreen'
  | 'export-config'
  | 'filters-advanced'
  | 'comparison'
  | 'drill-down';

// Modal state
export interface ModalState {
  type: ModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Panel de détail latéral
export interface DetailPanelState {
  isOpen: boolean;
  type: string | null;
  entityId: string | null;
  data: Record<string, any>;
}

// Filtres actifs
export interface ActiveFilters {
  dateRange: { start: Date | null; end: Date | null };
  projects: string[];
  teams: string[];
  priorities: ('critical' | 'high' | 'medium' | 'low')[];
  statuses: string[];
  categories: string[];
  assignees: string[];
  tags: string[];
  customFilters: Record<string, any>;
}

// Vue de tableau
export type TableViewMode = 'compact' | 'standard' | 'detailed';
export type SortDirection = 'asc' | 'desc';

export interface TableConfig {
  viewMode: TableViewMode;
  sortBy: string;
  sortDirection: SortDirection;
  columns: string[];
  groupBy: string | null;
  pageSize: number;
  currentPage: number;
}

// KPIs configuration
export interface KPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface GovernanceCommandCenterState {
  // Navigation
  navigation: NavigationState;
  navigationHistory: NavigationState[];
  
  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;
  
  // Modal
  modal: ModalState;
  modalStack: ModalState[]; // Pour les modales empilées
  
  // Panel de détail
  detailPanel: DetailPanelState;
  
  // Filtres
  filters: ActiveFilters;
  savedFilters: { name: string; filters: ActiveFilters }[];
  
  // Configuration tableaux
  tableConfigs: Record<string, TableConfig>;
  
  // KPIs
  kpiConfig: KPIConfig;
  
  // Sélections
  selectedItems: string[];
  
  // Recherche
  globalSearch: string;
  
  // Actions
  navigate: (main: MainCategory, sub?: SubCategory | null, subSub?: SubSubCategory | null) => void;
  goBack: () => void;
  
  // UI Actions
  toggleSidebar: () => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationsPanel: () => void;
  
  // Modal Actions
  openModal: (type: ModalType, data?: Record<string, any>, options?: Partial<ModalState>) => void;
  closeModal: () => void;
  pushModal: (type: ModalType, data?: Record<string, any>, options?: Partial<ModalState>) => void;
  popModal: () => void;
  
  // Detail Panel Actions
  openDetailPanel: (type: string, entityId: string, data?: Record<string, any>) => void;
  closeDetailPanel: () => void;
  
  // Filter Actions
  setFilter: <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => void;
  resetFilters: () => void;
  applyQuickFilter: (preset: string) => void;
  saveCurrentFilters: (name: string) => void;
  loadSavedFilters: (name: string) => void;
  
  // Table Actions
  setTableConfig: (tableId: string, config: Partial<TableConfig>) => void;
  
  // KPI Actions
  setKPIConfig: (config: Partial<KPIConfig>) => void;
  
  // Selection Actions
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Search
  setGlobalSearch: (term: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const defaultFilters: ActiveFilters = {
  dateRange: { start: null, end: null },
  projects: [],
  teams: [],
  priorities: [],
  statuses: [],
  categories: [],
  assignees: [],
  tags: [],
  customFilters: {},
};

const defaultTableConfig: TableConfig = {
  viewMode: 'standard',
  sortBy: 'date',
  sortDirection: 'desc',
  columns: [],
  groupBy: null,
  pageSize: 25,
  currentPage: 1,
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useGovernanceCommandCenterStore = create<GovernanceCommandCenterState>((set, get) => ({
  // Initial state
  navigation: {
    mainCategory: 'strategic-view',
    subCategory: 'executive-dashboard',
    subSubCategory: null,
  },
  navigationHistory: [],
  
  sidebarCollapsed: false,
  fullscreen: false,
  commandPaletteOpen: false,
  notificationsPanelOpen: false,
  
  modal: {
    type: null,
    isOpen: false,
    data: {},
    size: 'lg',
  },
  modalStack: [],
  
  detailPanel: {
    isOpen: false,
    type: null,
    entityId: null,
    data: {},
  },
  
  filters: { ...defaultFilters },
  savedFilters: [],
  
  tableConfigs: {},
  
  kpiConfig: {
    visible: true,
    collapsed: false,
    refreshInterval: 30,
  },
  
  selectedItems: [],
  globalSearch: '',
  
  // Navigation
  navigate: (main, sub = null, subSub = null) => {
    const current = get().navigation;
    set(state => ({
      navigationHistory: [...state.navigationHistory.slice(-9), current],
      navigation: {
        mainCategory: main,
        subCategory: sub,
        subSubCategory: subSub,
      },
      // Reset selection on navigation
      selectedItems: [],
    }));
  },
  
  goBack: () => {
    const history = get().navigationHistory;
    if (history.length > 0) {
      const previous = history[history.length - 1];
      set({
        navigation: previous,
        navigationHistory: history.slice(0, -1),
      });
    }
  },
  
  // UI Actions
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleFullscreen: () => {
    const newFullscreen = !get().fullscreen;
    if (newFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    set({ fullscreen: newFullscreen });
  },
  toggleCommandPalette: () => set(state => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  toggleNotificationsPanel: () => set(state => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),
  
  // Modal Actions
  openModal: (type, data = {}, options = {}) => {
    set({
      modal: {
        type,
        isOpen: true,
        data,
        size: options.size || 'lg',
        title: options.title,
      },
    });
  },
  
  closeModal: () => {
    set({
      modal: {
        type: null,
        isOpen: false,
        data: {},
        size: 'lg',
      },
    });
  },
  
  pushModal: (type, data = {}, options = {}) => {
    const current = get().modal;
    if (current.isOpen) {
      set(state => ({
        modalStack: [...state.modalStack, current],
        modal: {
          type,
          isOpen: true,
          data,
          size: options.size || 'lg',
          title: options.title,
        },
      }));
    } else {
      get().openModal(type, data, options);
    }
  },
  
  popModal: () => {
    const stack = get().modalStack;
    if (stack.length > 0) {
      const previous = stack[stack.length - 1];
      set({
        modal: previous,
        modalStack: stack.slice(0, -1),
      });
    } else {
      get().closeModal();
    }
  },
  
  // Detail Panel Actions
  openDetailPanel: (type, entityId, data = {}) => {
    set({
      detailPanel: {
        isOpen: true,
        type,
        entityId,
        data,
      },
    });
  },
  
  closeDetailPanel: () => {
    set({
      detailPanel: {
        isOpen: false,
        type: null,
        entityId: null,
        data: {},
      },
    });
  },
  
  // Filter Actions
  setFilter: (key, value) => {
    set(state => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },
  
  resetFilters: () => set({ filters: { ...defaultFilters } }),
  
  applyQuickFilter: (preset) => {
    const presets: Record<string, Partial<ActiveFilters>> = {
      'critical-only': { priorities: ['critical'] },
      'this-week': { 
        dateRange: { 
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
          end: new Date() 
        } 
      },
      'my-items': { assignees: ['current-user'] },
      'pending': { statuses: ['pending', 'in-review'] },
      'overdue': { statuses: ['overdue', 'late'] },
    };
    
    const presetFilters = presets[preset];
    if (presetFilters) {
      set(state => ({
        filters: { ...state.filters, ...presetFilters },
      }));
    }
  },
  
  saveCurrentFilters: (name) => {
    const currentFilters = get().filters;
    set(state => ({
      savedFilters: [
        ...state.savedFilters.filter(f => f.name !== name),
        { name, filters: { ...currentFilters } },
      ],
    }));
  },
  
  loadSavedFilters: (name) => {
    const saved = get().savedFilters.find(f => f.name === name);
    if (saved) {
      set({ filters: { ...saved.filters } });
    }
  },
  
  // Table Actions
  setTableConfig: (tableId, config) => {
    set(state => ({
      tableConfigs: {
        ...state.tableConfigs,
        [tableId]: {
          ...(state.tableConfigs[tableId] || defaultTableConfig),
          ...config,
        },
      },
    }));
  },
  
  // KPI Actions
  setKPIConfig: (config) => {
    set(state => ({
      kpiConfig: { ...state.kpiConfig, ...config },
    }));
  },
  
  // Selection Actions
  selectItem: (id) => {
    set(state => ({
      selectedItems: state.selectedItems.includes(id) 
        ? state.selectedItems 
        : [...state.selectedItems, id],
    }));
  },
  
  deselectItem: (id) => {
    set(state => ({
      selectedItems: state.selectedItems.filter(i => i !== id),
    }));
  },
  
  selectAll: (ids) => set({ selectedItems: ids }),
  
  clearSelection: () => set({ selectedItems: [] }),
  
  // Search
  setGlobalSearch: (term) => set({ globalSearch: term }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// HELPER HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export const useCurrentNavigation = () => {
  return useGovernanceCommandCenterStore(state => state.navigation);
};

export const useGovernanceModal = () => {
  const { modal, openModal, closeModal, pushModal, popModal } = useGovernanceCommandCenterStore();
  return { modal, openModal, closeModal, pushModal, popModal };
};

export const useGovernanceFilters = () => {
  const { filters, setFilter, resetFilters, applyQuickFilter } = useGovernanceCommandCenterStore();
  return { filters, setFilter, resetFilters, applyQuickFilter };
};

