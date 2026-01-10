/**
 * Store Zustand pour le Centre de Commandement Dashboard
 * Architecture multi-niveaux comme Gouvernance
 * Pilotage stratégique et opérationnel du BMO
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (onglets niveau 1)
export type DashboardMainCategory =
  | 'overview'      // Vue d'ensemble - Dashboard principal
  | 'performance'   // Performance & KPIs
  | 'actions'       // Actions prioritaires (Work Inbox)
  | 'risks'         // Risques & Santé organisationnelle
  | 'decisions'     // Décisions & Timeline
  | 'realtime';     // Indicateurs temps réel

// Sous-catégories par thématique (onglets niveau 2)
export type DashboardSubCategoryMap = {
  overview: 'summary' | 'kpis' | 'bureaux' | 'trends';
  performance: 'validation' | 'budget' | 'delays' | 'comparison';
  actions: 'all' | 'urgent' | 'blocked' | 'pending' | 'completed';
  risks: 'critical' | 'warnings' | 'blocages' | 'payments' | 'contracts';
  decisions: 'pending' | 'executed' | 'timeline' | 'audit';
  realtime: 'live' | 'alerts' | 'notifications' | 'sync';
};

export type DashboardSubCategory = DashboardSubCategoryMap[DashboardMainCategory];

// Types de modales
export type DashboardModalType =
  | 'kpi-drilldown'
  | 'risk-detail'
  | 'action-detail'
  | 'decision-detail'
  | 'bureau-detail'
  | 'export'
  | 'filters'
  | 'settings'
  | 'shortcuts'
  | 'theme'
  | 'layout'
  | 'confirm';

// État de navigation
export interface DashboardNavigationState {
  mainCategory: DashboardMainCategory;
  subCategory: DashboardSubCategory | null;
}

// État d'une modale
export interface DashboardModalState {
  type: DashboardModalType | null;
  isOpen: boolean;
  data: Record<string, unknown>;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Configuration KPI Bar
export interface DashboardKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
  autoRefresh: boolean;
}

// Filtres actifs
export interface DashboardActiveFilters {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  bureaux: string[];
  search: string;
  status: string[];
  severity: string[];
  dateRange?: { start: string; end: string };
}

// Configuration d'affichage
export interface DashboardDisplayConfig {
  viewMode: 'compact' | 'extended';
  theme: 'dark' | 'light' | 'system';
  focusMode: boolean;
  presentationMode: boolean;
}

// Sections du dashboard (pour layout editor)
export interface DashboardSection {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface DashboardCommandCenterState {
  // Navigation
  navigation: DashboardNavigationState;
  navigationHistory: DashboardNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: DashboardModalState;
  modalStack: DashboardModalState[];

  // Filtres
  filters: DashboardActiveFilters;
  savedFilters: { name: string; filters: DashboardActiveFilters }[];

  // KPIs
  kpiConfig: DashboardKPIConfig;

  // Display
  displayConfig: DashboardDisplayConfig;

  // Sections
  sections: DashboardSection[];

  // Sélections
  selectedItems: string[];
  pinnedBureaux: string[];

  // Recherche globale
  globalSearch: string;

  // Stats temps réel
  liveStats: {
    lastUpdate: string | null;
    isRefreshing: boolean;
    connectionStatus: 'connected' | 'disconnected' | 'syncing';
  };

  // Actions Navigation
  navigate: (main: DashboardMainCategory, sub?: DashboardSubCategory | null) => void;
  goBack: () => void;
  resetNavigation: () => void;

  // Actions UI
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationsPanel: () => void;

  // Actions Modal
  openModal: (type: DashboardModalType, data?: Record<string, unknown>, options?: Partial<DashboardModalState>) => void;
  closeModal: () => void;
  pushModal: (type: DashboardModalType, data?: Record<string, unknown>, options?: Partial<DashboardModalState>) => void;
  popModal: () => void;

  // Actions Filtres
  setFilter: <K extends keyof DashboardActiveFilters>(key: K, value: DashboardActiveFilters[K]) => void;
  resetFilters: () => void;
  saveCurrentFilters: (name: string) => void;
  loadSavedFilters: (name: string) => void;
  deleteSavedFilters: (name: string) => void;

  // Actions KPI
  setKPIConfig: (config: Partial<DashboardKPIConfig>) => void;
  toggleKPIBar: () => void;

  // Actions Display
  setDisplayConfig: (config: Partial<DashboardDisplayConfig>) => void;
  toggleFocusMode: () => void;
  togglePresentationMode: () => void;

  // Actions Sections
  setSections: (sections: DashboardSection[]) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  resetSections: () => void;

  // Actions Sélection
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItemSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  // Actions Bureaux épinglés
  togglePinBureau: (code: string) => void;
  setPinnedBureaux: (codes: string[]) => void;

  // Actions Recherche
  setGlobalSearch: (search: string) => void;

  // Actions Stats temps réel
  setLiveStats: (stats: Partial<DashboardCommandCenterState['liveStats']>) => void;
  startRefresh: () => void;
  endRefresh: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const defaultNavigation: DashboardNavigationState = {
  mainCategory: 'overview',
  subCategory: 'summary',
};

const defaultFilters: DashboardActiveFilters = {
  period: 'year',
  bureaux: [],
  search: '',
  status: [],
  severity: [],
};

const defaultKPIConfig: DashboardKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30,
  autoRefresh: true,
};

const defaultDisplayConfig: DashboardDisplayConfig = {
  viewMode: 'extended',
  theme: 'dark',
  focusMode: false,
  presentationMode: false,
};

const defaultSections: DashboardSection[] = [
  { id: 'performance', label: 'Performance Globale', visible: true, order: 0 },
  { id: 'actions', label: 'Actions Prioritaires', visible: true, order: 1 },
  { id: 'risks', label: 'Risques & Santé', visible: true, order: 2 },
  { id: 'decisions', label: 'Décisions', visible: true, order: 3 },
  { id: 'realtime', label: 'Indicateurs Temps Réel', visible: true, order: 4 },
  { id: 'analytics', label: 'Analyses Avancées', visible: true, order: 5 },
];

// ═══════════════════════════════════════════════════════════════════════════
// STORE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export const useDashboardCommandCenterStore = create<DashboardCommandCenterState>()(
  persist(
    (set, get) => ({
      // Initial State
      navigation: defaultNavigation,
      navigationHistory: [],
      sidebarCollapsed: false,
      fullscreen: false,
      commandPaletteOpen: false,
      notificationsPanelOpen: false,
      modal: { type: null, isOpen: false, data: {} },
      modalStack: [],
      filters: defaultFilters,
      savedFilters: [],
      kpiConfig: defaultKPIConfig,
      displayConfig: defaultDisplayConfig,
      sections: defaultSections,
      selectedItems: [],
      pinnedBureaux: [],
      globalSearch: '',
      liveStats: {
        lastUpdate: null,
        isRefreshing: false,
        connectionStatus: 'connected',
      },

      // Navigation Actions
      navigate: (main, sub = null) => {
        const current = get().navigation;
        set({
          navigation: { mainCategory: main, subCategory: sub },
          navigationHistory: [...get().navigationHistory, current].slice(-20),
        });
      },

      goBack: () => {
        const history = get().navigationHistory;
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        set({
          navigation: previous,
          navigationHistory: history.slice(0, -1),
        });
      },

      resetNavigation: () => {
        set({
          navigation: defaultNavigation,
          navigationHistory: [],
        });
      },

      // UI Actions
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleFullscreen: () => set({ fullscreen: !get().fullscreen }),
      toggleCommandPalette: () => set({ commandPaletteOpen: !get().commandPaletteOpen }),
      toggleNotificationsPanel: () => set({ notificationsPanelOpen: !get().notificationsPanelOpen }),

      // Modal Actions
      openModal: (type, data = {}, options = {}) => {
        set({
          modal: {
            type,
            isOpen: true,
            data,
            ...options,
          },
        });
      },

      closeModal: () => {
        set({
          modal: { type: null, isOpen: false, data: {} },
        });
      },

      pushModal: (type, data = {}, options = {}) => {
        const currentModal = get().modal;
        if (currentModal.isOpen) {
          set({
            modalStack: [...get().modalStack, currentModal],
          });
        }
        set({
          modal: {
            type,
            isOpen: true,
            data,
            ...options,
          },
        });
      },

      popModal: () => {
        const stack = get().modalStack;
        if (stack.length === 0) {
          set({ modal: { type: null, isOpen: false, data: {} } });
          return;
        }
        const previous = stack[stack.length - 1];
        set({
          modal: previous,
          modalStack: stack.slice(0, -1),
        });
      },

      // Filter Actions
      setFilter: (key, value) => {
        set({
          filters: { ...get().filters, [key]: value },
        });
      },

      resetFilters: () => set({ filters: defaultFilters }),

      saveCurrentFilters: (name) => {
        const current = get().filters;
        const saved = get().savedFilters.filter((f) => f.name !== name);
        set({
          savedFilters: [...saved, { name, filters: current }],
        });
      },

      loadSavedFilters: (name) => {
        const saved = get().savedFilters.find((f) => f.name === name);
        if (saved) {
          set({ filters: saved.filters });
        }
      },

      deleteSavedFilters: (name) => {
        set({
          savedFilters: get().savedFilters.filter((f) => f.name !== name),
        });
      },

      // KPI Actions
      setKPIConfig: (config) => {
        set({
          kpiConfig: { ...get().kpiConfig, ...config },
        });
      },

      toggleKPIBar: () => {
        set({
          kpiConfig: { ...get().kpiConfig, collapsed: !get().kpiConfig.collapsed },
        });
      },

      // Display Actions
      setDisplayConfig: (config) => {
        set({
          displayConfig: { ...get().displayConfig, ...config },
        });
      },

      toggleFocusMode: () => {
        set({
          displayConfig: { ...get().displayConfig, focusMode: !get().displayConfig.focusMode },
        });
      },

      togglePresentationMode: () => {
        set({
          displayConfig: { ...get().displayConfig, presentationMode: !get().displayConfig.presentationMode },
        });
      },

      // Sections Actions
      setSections: (sections) => set({ sections }),

      toggleSectionVisibility: (sectionId) => {
        set({
          sections: get().sections.map((s) =>
            s.id === sectionId ? { ...s, visible: !s.visible } : s
          ),
        });
      },

      reorderSections: (fromIndex, toIndex) => {
        const sections = [...get().sections];
        const [removed] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, removed);
        set({
          sections: sections.map((s, i) => ({ ...s, order: i })),
        });
      },

      resetSections: () => set({ sections: defaultSections }),

      // Selection Actions
      selectItem: (id) => {
        if (!get().selectedItems.includes(id)) {
          set({ selectedItems: [...get().selectedItems, id] });
        }
      },

      deselectItem: (id) => {
        set({ selectedItems: get().selectedItems.filter((i) => i !== id) });
      },

      toggleItemSelection: (id) => {
        const items = get().selectedItems;
        if (items.includes(id)) {
          set({ selectedItems: items.filter((i) => i !== id) });
        } else {
          set({ selectedItems: [...items, id] });
        }
      },

      selectAll: (ids) => set({ selectedItems: ids }),
      clearSelection: () => set({ selectedItems: [] }),

      // Bureaux épinglés
      togglePinBureau: (code) => {
        const pinned = get().pinnedBureaux;
        if (pinned.includes(code)) {
          set({ pinnedBureaux: pinned.filter((c) => c !== code) });
        } else {
          set({ pinnedBureaux: [...pinned, code] });
        }
      },

      setPinnedBureaux: (codes) => set({ pinnedBureaux: codes }),

      // Recherche
      setGlobalSearch: (search) => set({ globalSearch: search }),

      // Stats temps réel
      setLiveStats: (stats) => {
        set({
          liveStats: { ...get().liveStats, ...stats },
        });
      },

      startRefresh: () => {
        set({
          liveStats: { ...get().liveStats, isRefreshing: true, connectionStatus: 'syncing' },
        });
      },

      endRefresh: () => {
        set({
          liveStats: {
            ...get().liveStats,
            isRefreshing: false,
            connectionStatus: 'connected',
            lastUpdate: new Date().toISOString(),
          },
        });
      },
    }),
    {
      name: 'bmo-dashboard-command-center',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        filters: state.filters,
        savedFilters: state.savedFilters,
        kpiConfig: state.kpiConfig,
        displayConfig: state.displayConfig,
        sections: state.sections,
        pinnedBureaux: state.pinnedBureaux,
      }),
    }
  )
);

// Export du type pour utilisation externe
export type { DashboardCommandCenterState };

