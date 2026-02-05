/**
 * Store Zustand pour le Centre de Commandement Analytics
 * Architecture cohérente avec Governance Command Center
 * Gestion centralisée de l'état : navigation, filtres, modals, sélections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (niveau 1)
export type AnalyticsMainCategory =
  | 'overview'      // Vue d'ensemble
  | 'performance'   // Performance
  | 'financial'     // Financier
  | 'trends'        // Tendances
  | 'alerts'        // Alertes
  | 'reports'       // Rapports
  | 'kpis'          // KPIs
  | 'comparison'    // Comparaison
  | 'bureaux';      // Bureaux

// Sous-catégories (niveau 2)
export type AnalyticsSubCategory = string | null;

// Filtres de niveau 3
export type AnalyticsFilter = string | null;

// État de navigation
export interface AnalyticsNavigationState {
  mainCategory: AnalyticsMainCategory;
  subCategory: AnalyticsSubCategory;
  filter: AnalyticsFilter;
}

// Types de modals
export type AnalyticsModalType =
  | 'stats'
  | 'export'
  | 'alert-config'
  | 'report'
  | 'kpi-detail'
  | 'alert-detail'
  | 'filters'
  | 'comparison'
  | 'settings'
  | 'shortcuts'
  | 'help'
  | 'confirm'
  | 'create-task'
  | 'schedule-meeting'
  | 'assign-responsible';

// État des modals
export interface AnalyticsModalState {
  type: AnalyticsModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Panel de détail latéral
export interface AnalyticsDetailPanelState {
  isOpen: boolean;
  type: 'kpi' | 'alert' | 'report' | null;
  entityId: string | null;
  data: Record<string, any>;
}

// Filtres actifs
export interface AnalyticsActiveFilters {
  dateRange: { start: Date | null; end: Date | null };
  bureaux: string[];
  categories: string[];
  statuses: string[];
  priorities: ('critical' | 'high' | 'medium' | 'low')[];
  tags: string[];
  customFilters: Record<string, any>;
}

// Filtre sauvegardé
export interface SavedFilter {
  id: string;
  name: string;
  filters: AnalyticsActiveFilters;
  createdAt: string;
}

// Configuration KPIs
export interface AnalyticsKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
  autoRefresh: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface AnalyticsCommandCenterState {
  // Navigation
  navigation: AnalyticsNavigationState;
  navigationHistory: AnalyticsNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: AnalyticsModalState;
  modalStack: AnalyticsModalState[]; // Pour les modales empilées

  // Panel de détail
  detailPanel: AnalyticsDetailPanelState;

  // Filtres
  filters: AnalyticsActiveFilters;
  savedFilters: SavedFilter[];

  // KPIs
  kpiConfig: AnalyticsKPIConfig;

  // Sélections
  selectedItems: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: AnalyticsMainCategory,
    sub?: AnalyticsSubCategory,
    filter?: AnalyticsFilter
  ) => void;
  goBack: () => void;
  resetNavigation: () => void;

  // Actions UI
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationsPanel: () => void;

  // Actions Modal
  openModal: (
    type: AnalyticsModalType,
    data?: Record<string, any>,
    options?: Partial<AnalyticsModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: AnalyticsModalType,
    data?: Record<string, any>,
    options?: Partial<AnalyticsModalState>
  ) => void;
  popModal: () => void;

  // Actions Detail Panel
  openDetailPanel: (
    type: 'kpi' | 'alert' | 'report',
    entityId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // Actions Filtres
  setFilter: <K extends keyof AnalyticsActiveFilters>(
    key: K,
    value: AnalyticsActiveFilters[K]
  ) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (id: string) => void;
  deleteFilter: (id: string) => void;

  // Actions KPI
  setKPIConfig: (config: Partial<AnalyticsKPIConfig>) => void;

  // Actions Sélection
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;

  // Actions Recherche
  setGlobalSearch: (term: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const defaultNavigation: AnalyticsNavigationState = {
  mainCategory: 'overview',
  subCategory: null,
  filter: null,
};

const defaultFilters: AnalyticsActiveFilters = {
  dateRange: { start: null, end: null },
  bureaux: [],
  categories: [],
  statuses: [],
  priorities: [],
  tags: [],
  customFilters: {},
};

const defaultKPIConfig: AnalyticsKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30, // 30 secondes
  autoRefresh: true,
};

const defaultModalState: AnalyticsModalState = {
  type: null,
  isOpen: false,
  data: {},
  size: 'lg',
};

const defaultDetailPanelState: AnalyticsDetailPanelState = {
  isOpen: false,
  type: null,
  entityId: null,
  data: {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useAnalyticsCommandCenterStore = create<AnalyticsCommandCenterState>()(
  persist(
    (set, get) => ({
      // Initial state
      navigation: defaultNavigation,
      navigationHistory: [],

      sidebarCollapsed: false,
      fullscreen: false,
      commandPaletteOpen: false,
      notificationsPanelOpen: false,

      modal: defaultModalState,
      modalStack: [],

      detailPanel: defaultDetailPanelState,

      filters: { ...defaultFilters },
      savedFilters: [],

      kpiConfig: { ...defaultKPIConfig },

      selectedItems: [],
      globalSearch: '',

      // Navigation Actions
      navigate: (main, sub = null, filter = null) => {
        const current = get().navigation;
        set((state) => ({
          navigationHistory: [...state.navigationHistory.slice(-9), current],
          navigation: {
            mainCategory: main,
            subCategory: sub,
            filter: filter,
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

      resetNavigation: () => {
        set({
          navigation: defaultNavigation,
          navigationHistory: [],
        });
      },

      // UI Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleFullscreen: () => {
        const newFullscreen = !get().fullscreen;
        if (newFullscreen) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
        set({ fullscreen: newFullscreen });
      },
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      toggleNotificationsPanel: () =>
        set((state) => ({
          notificationsPanelOpen: !state.notificationsPanelOpen,
        })),

      // Modal Actions
      openModal: (type, data = {}, options = {}) => {
        set({
          modal: {
            type,
            isOpen: true,
            data,
            size: options.size || 'lg',
          },
        });
      },

      closeModal: () => {
        set({
          modal: defaultModalState,
        });
      },

      pushModal: (type, data = {}, options = {}) => {
        const current = get().modal;
        if (current.isOpen) {
          set((state) => ({
            modalStack: [...state.modalStack, current],
            modal: {
              type,
              isOpen: true,
              data,
              size: options.size || 'lg',
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
          detailPanel: defaultDetailPanelState,
        });
      },

      // Filter Actions
      setFilter: (key, value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        }));
      },

      resetFilters: () => set({ filters: { ...defaultFilters } }),

      saveFilter: (name) => {
        const currentFilters = get().filters;
        const newFilter: SavedFilter = {
          id: `filter-${Date.now()}`,
          name,
          filters: { ...currentFilters },
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          savedFilters: [...state.savedFilters, newFilter],
        }));
        return newFilter.id;
      },

      loadFilter: (id) => {
        const saved = get().savedFilters.find((f) => f.id === id);
        if (saved) {
          set({ filters: { ...saved.filters } });
        }
      },

      deleteFilter: (id) => {
        set((state) => ({
          savedFilters: state.savedFilters.filter((f) => f.id !== id),
        }));
      },

      // KPI Actions
      setKPIConfig: (config) => {
        set((state) => ({
          kpiConfig: { ...state.kpiConfig, ...config },
        }));
      },

      // Selection Actions
      selectItem: (id) => {
        set((state) => ({
          selectedItems: state.selectedItems.includes(id)
            ? state.selectedItems
            : [...state.selectedItems, id],
        }));
      },

      deselectItem: (id) => {
        set((state) => ({
          selectedItems: state.selectedItems.filter((i) => i !== id),
        }));
      },

      selectAll: (ids) => set({ selectedItems: ids }),

      clearSelection: () => set({ selectedItems: [] }),

      toggleSelection: (id) => {
        const state = get();
        if (state.selectedItems.includes(id)) {
          state.deselectItem(id);
        } else {
          state.selectItem(id);
        }
      },

      // Search
      setGlobalSearch: (term) => set({ globalSearch: term }),
    }),
    {
      name: 'analytics-command-center-storage',
      // Ne persister que ce qui est nécessaire
      partialize: (state) => ({
        navigation: state.navigation,
        sidebarCollapsed: state.sidebarCollapsed,
        filters: state.filters,
        savedFilters: state.savedFilters,
        kpiConfig: state.kpiConfig,
        // Ne pas persister: modals, selections, search, etc.
      }),
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export const useAnalyticsNavigation = () => {
  return useAnalyticsCommandCenterStore((state) => ({
    navigation: state.navigation,
    navigate: state.navigate,
    goBack: state.goBack,
    resetNavigation: state.resetNavigation,
    canGoBack: state.navigationHistory.length > 0,
  }));
};

export const useAnalyticsModal = () => {
  const { modal, openModal, closeModal, pushModal, popModal } =
    useAnalyticsCommandCenterStore();
  return { modal, openModal, closeModal, pushModal, popModal };
};

export const useAnalyticsFilters = () => {
  const {
    filters,
    setFilter,
    resetFilters,
    saveFilter,
    loadFilter,
    deleteFilter,
    savedFilters,
  } = useAnalyticsCommandCenterStore();
  return {
    filters,
    setFilter,
    resetFilters,
    saveFilter,
    loadFilter,
    deleteFilter,
    savedFilters,
  };
};

export const useAnalyticsSelection = () => {
  const {
    selectedItems,
    selectItem,
    deselectItem,
    selectAll,
    clearSelection,
    toggleSelection,
  } = useAnalyticsCommandCenterStore();
  return {
    selectedItems,
    selectItem,
    deselectItem,
    selectAll,
    clearSelection,
    toggleSelection,
    hasSelection: selectedItems.length > 0,
    selectionCount: selectedItems.length,
  };
};
