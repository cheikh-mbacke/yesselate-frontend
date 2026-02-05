/**
 * Store Zustand pour le Centre de Commandement Logs
 * Architecture cohérente avec Analytics Command Center
 * Gestion centralisée de l'état : navigation, filtres, modals, sélections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (niveau 1)
export type LogsMainCategory =
  | 'overview'      // Vue d'ensemble
  | 'errors'        // Erreurs
  | 'warnings'      // Avertissements
  | 'system'        // Système
  | 'api'           // API
  | 'security'      // Sécurité
  | 'audit'         // Audit
  | 'user-actions'  // Actions utilisateur
  | 'analysis';     // Analyse

// Sous-catégories (niveau 2)
export type LogsSubCategory = string | null;

// Filtres de niveau 3
export type LogsFilter = string | null;

// État de navigation
export interface LogsNavigationState {
  mainCategory: LogsMainCategory;
  subCategory: LogsSubCategory;
  filter: LogsFilter;
}

// Types de modals
export type LogsModalType =
  | 'stats'
  | 'export'
  | 'filters'
  | 'settings'
  | 'shortcuts'
  | 'help'
  | 'confirm'
  | 'log-detail';

// État des modals
export interface LogsModalState {
  type: LogsModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Panel de détail latéral
export interface LogsDetailPanelState {
  isOpen: boolean;
  type: 'log' | null;
  entityId: string | null;
  data: Record<string, any>;
}

// Filtres actifs
export interface LogsActiveFilters {
  dateRange: { start: Date | null; end: Date | null };
  levels: ('error' | 'warning' | 'info' | 'debug' | 'critical')[];
  sources: ('system' | 'api' | 'database' | 'auth' | 'business')[];
  modules: string[];
  search: string;
  customFilters: Record<string, any>;
}

// Filtre sauvegardé
export interface SavedLogsFilter {
  id: string;
  name: string;
  filters: LogsActiveFilters;
  createdAt: string;
}

// Configuration KPIs
export interface LogsKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
  autoRefresh: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface LogsCommandCenterState {
  // Navigation
  navigation: LogsNavigationState;
  navigationHistory: LogsNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: LogsModalState;
  modalStack: LogsModalState[]; // Pour les modales empilées

  // Panel de détail
  detailPanel: LogsDetailPanelState;

  // Filtres
  filters: LogsActiveFilters;
  savedFilters: SavedLogsFilter[];

  // KPIs
  kpiConfig: LogsKPIConfig;

  // Sélections
  selectedItems: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: LogsMainCategory,
    sub?: LogsSubCategory,
    filter?: LogsFilter
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
    type: LogsModalType,
    data?: Record<string, any>,
    options?: Partial<LogsModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: LogsModalType,
    data?: Record<string, any>,
    options?: Partial<LogsModalState>
  ) => void;
  popModal: () => void;

  // Actions Detail Panel
  openDetailPanel: (
    type: 'log',
    entityId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // Actions Filtres
  setFilter: <K extends keyof LogsActiveFilters>(
    key: K,
    value: LogsActiveFilters[K]
  ) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (id: string) => void;
  deleteFilter: (id: string) => void;

  // Actions KPI
  setKPIConfig: (config: Partial<LogsKPIConfig>) => void;

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

const defaultNavigation: LogsNavigationState = {
  mainCategory: 'overview',
  subCategory: null,
  filter: null,
};

const defaultFilters: LogsActiveFilters = {
  dateRange: { start: null, end: null },
  levels: [],
  sources: [],
  modules: [],
  search: '',
  customFilters: {},
};

const defaultKPIConfig: LogsKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 10, // 10 secondes pour les logs
  autoRefresh: true,
};

const defaultModalState: LogsModalState = {
  type: null,
  isOpen: false,
  data: {},
  size: 'lg',
};

const defaultDetailPanelState: LogsDetailPanelState = {
  isOpen: false,
  type: null,
  entityId: null,
  data: {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useLogsCommandCenterStore = create<LogsCommandCenterState>()(
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
        const newFilter: SavedLogsFilter = {
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
      name: 'logs-command-center-storage',
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

export const useLogsNavigation = () => {
  return useLogsCommandCenterStore((state) => ({
    navigation: state.navigation,
    navigate: state.navigate,
    goBack: state.goBack,
    resetNavigation: state.resetNavigation,
    canGoBack: state.navigationHistory.length > 0,
  }));
};

export const useLogsModal = () => {
  const { modal, openModal, closeModal, pushModal, popModal } =
    useLogsCommandCenterStore();
  return { modal, openModal, closeModal, pushModal, popModal };
};

export const useLogsFilters = () => {
  const {
    filters,
    setFilter,
    resetFilters,
    saveFilter,
    loadFilter,
    deleteFilter,
    savedFilters,
  } = useLogsCommandCenterStore();
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

export const useLogsSelection = () => {
  const {
    selectedItems,
    selectItem,
    deselectItem,
    selectAll,
    clearSelection,
    toggleSelection,
  } = useLogsCommandCenterStore();
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
