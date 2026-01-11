/**
 * Store Zustand pour le Centre de Commandement Délégations
 * Architecture cohérente avec Analytics Command Center
 * Gestion centralisée de l'état : navigation, filtres, modals, sélections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (niveau 1)
export type DelegationsMainCategory =
  | 'overview'        // Vue d'ensemble
  | 'active'          // Actives
  | 'expired'         // Expirées
  | 'revoked'         // Révoquées
  | 'suspended'       // Suspendues
  | 'expiring_soon'   // Expirant bientôt
  | 'history'         // Historique
  | 'analytics'       // Analytiques
  | 'settings';       // Paramètres

// Sous-catégories (niveau 2)
export type DelegationsSubCategory = string | null;

// Filtres de niveau 3
export type DelegationsFilter = string | null;

// État de navigation
export interface DelegationsNavigationState {
  mainCategory: DelegationsMainCategory;
  subCategory: DelegationsSubCategory;
  filter: DelegationsFilter;
}

// Types de modals
export type DelegationsModalType =
  | 'stats'
  | 'export'
  | 'create'
  | 'edit'
  | 'extend'
  | 'suspend'
  | 'revoke'
  | 'timeline'
  | 'batch-actions'
  | 'filters'
  | 'settings'
  | 'shortcuts'
  | 'help'
  | 'confirm'
  | 'delegation-detail';

// État des modals
export interface DelegationsModalState {
  type: DelegationsModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Panel de détail latéral
export interface DelegationsDetailPanelState {
  isOpen: boolean;
  type: 'delegation' | 'stat' | 'alert' | null;
  entityId: string | null;
  data: Record<string, any>;
}

// Filtres actifs
export interface DelegationsActiveFilters {
  dateRange: { start: Date | null; end: Date | null };
  bureaux: string[];
  types: string[];
  statuses: string[];
  priorities: ('critical' | 'high' | 'medium' | 'low')[];
  tags: string[];
  customFilters: Record<string, any>;
}

// Filtre sauvegardé
export interface SavedFilter {
  id: string;
  name: string;
  filters: DelegationsActiveFilters;
  createdAt: string;
}

// Configuration KPIs
export interface DelegationsKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
  autoRefresh: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface DelegationsCommandCenterState {
  // Navigation
  navigation: DelegationsNavigationState;
  navigationHistory: DelegationsNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: DelegationsModalState;
  modalStack: DelegationsModalState[]; // Pour les modales empilées

  // Panel de détail
  detailPanel: DelegationsDetailPanelState;

  // Filtres
  filters: DelegationsActiveFilters;
  savedFilters: SavedFilter[];

  // KPIs
  kpiConfig: DelegationsKPIConfig;

  // Sélections
  selectedItems: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: DelegationsMainCategory,
    sub?: DelegationsSubCategory,
    filter?: DelegationsFilter
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
    type: DelegationsModalType,
    data?: Record<string, any>,
    options?: Partial<DelegationsModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: DelegationsModalType,
    data?: Record<string, any>,
    options?: Partial<DelegationsModalState>
  ) => void;
  popModal: () => void;

  // Actions Detail Panel
  openDetailPanel: (
    type: 'delegation' | 'stat' | 'alert',
    entityId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // Actions Filtres
  setFilter: <K extends keyof DelegationsActiveFilters>(
    key: K,
    value: DelegationsActiveFilters[K]
  ) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (id: string) => void;
  deleteFilter: (id: string) => void;

  // Actions KPI
  setKPIConfig: (config: Partial<DelegationsKPIConfig>) => void;

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

const defaultNavigation: DelegationsNavigationState = {
  mainCategory: 'overview',
  subCategory: null,
  filter: null,
};

const defaultFilters: DelegationsActiveFilters = {
  dateRange: { start: null, end: null },
  bureaux: [],
  types: [],
  statuses: [],
  priorities: [],
  tags: [],
  customFilters: {},
};

const defaultKPIConfig: DelegationsKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30, // 30 secondes
  autoRefresh: true,
};

const defaultModalState: DelegationsModalState = {
  type: null,
  isOpen: false,
  data: {},
  size: 'lg',
};

const defaultDetailPanelState: DelegationsDetailPanelState = {
  isOpen: false,
  type: null,
  entityId: null,
  data: {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useDelegationsCommandCenterStore = create<DelegationsCommandCenterState>()(
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
        set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),

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
        set({ detailPanel: defaultDetailPanelState });
      },

      // Filter Actions
      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }));
      },

      resetFilters: () => {
        set({ filters: { ...defaultFilters } });
      },

      saveFilter: (name) => {
        const filters = get().filters;
        const savedFilter: SavedFilter = {
          id: `filter-${Date.now()}`,
          name,
          filters: { ...filters },
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          savedFilters: [...state.savedFilters, savedFilter],
        }));
      },

      loadFilter: (id) => {
        const savedFilter = get().savedFilters.find((f) => f.id === id);
        if (savedFilter) {
          set({ filters: { ...savedFilter.filters } });
        }
      },

      deleteFilter: (id) => {
        set((state) => ({
          savedFilters: state.savedFilters.filter((f) => f.id !== id),
        }));
      },

      // KPI Config Actions
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
      name: 'delegations-command-center-storage',
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
