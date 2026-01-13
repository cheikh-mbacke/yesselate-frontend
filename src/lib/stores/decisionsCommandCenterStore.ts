/**
 * Store Zustand pour le Centre de Commandement Decisions
 * Architecture cohérente avec Analytics Command Center
 * Gestion centralisée de l'état : navigation, filtres, modals, sélections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (niveau 1)
export type DecisionsMainCategory =
  | 'overview'      // Vue d'ensemble
  | 'pending'       // En attente
  | 'critical'      // Critiques
  | 'strategique'   // Stratégiques
  | 'operationnel'  // Opérationnelles
  | 'approved'      // Approuvées
  | 'history'       // Historique
  | 'analytics'     // Analytics
  | 'types';        // Par type

// Sous-catégories (niveau 2)
export type DecisionsSubCategory = string | null;

// Filtres de niveau 3
export type DecisionsFilter = string | null;

// État de navigation
export interface DecisionsNavigationState {
  mainCategory: DecisionsMainCategory;
  subCategory: DecisionsSubCategory;
  filter: DecisionsFilter;
}

// Types de modals
export type DecisionsModalType =
  | 'stats'
  | 'export'
  | 'decision-detail'
  | 'filters'
  | 'settings'
  | 'shortcuts'
  | 'help'
  | 'confirm';

// État des modals
export interface DecisionsModalState {
  type: DecisionsModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Panel de détail latéral
export interface DecisionsDetailPanelState {
  isOpen: boolean;
  type: 'decision' | null;
  entityId: string | null;
  data: Record<string, any>;
}

// Filtres actifs
export interface DecisionsActiveFilters {
  dateRange: { start: Date | null; end: Date | null };
  statuses: string[];
  types: string[];
  impacts: ('critical' | 'high' | 'medium' | 'low')[];
  niveaux: string[];
  auteurs: string[];
  customFilters: Record<string, any>;
}

// Filtre sauvegardé
export interface SavedFilter {
  id: string;
  name: string;
  filters: DecisionsActiveFilters;
  createdAt: string;
}

// Configuration KPIs
export interface DecisionsKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
  autoRefresh: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface DecisionsCommandCenterState {
  // Navigation
  navigation: DecisionsNavigationState;
  navigationHistory: DecisionsNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: DecisionsModalState;
  modalStack: DecisionsModalState[];

  // Panel de détail
  detailPanel: DecisionsDetailPanelState;

  // Filtres
  filters: DecisionsActiveFilters;
  savedFilters: SavedFilter[];

  // KPIs
  kpiConfig: DecisionsKPIConfig;

  // Sélections
  selectedItems: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: DecisionsMainCategory,
    sub?: DecisionsSubCategory,
    filter?: DecisionsFilter
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
    type: DecisionsModalType,
    data?: Record<string, any>,
    options?: Partial<DecisionsModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: DecisionsModalType,
    data?: Record<string, any>,
    options?: Partial<DecisionsModalState>
  ) => void;
  popModal: () => void;

  // Actions Detail Panel
  openDetailPanel: (
    type: 'decision',
    entityId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // Actions Filtres
  setFilter: <K extends keyof DecisionsActiveFilters>(
    key: K,
    value: DecisionsActiveFilters[K]
  ) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (id: string) => void;
  deleteFilter: (id: string) => void;

  // Actions KPI
  setKPIConfig: (config: Partial<DecisionsKPIConfig>) => void;

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

const defaultNavigation: DecisionsNavigationState = {
  mainCategory: 'overview',
  subCategory: null,
  filter: null,
};

const defaultFilters: DecisionsActiveFilters = {
  dateRange: { start: null, end: null },
  statuses: [],
  types: [],
  impacts: [],
  niveaux: [],
  auteurs: [],
  customFilters: {},
};

const defaultKPIConfig: DecisionsKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30,
  autoRefresh: true,
};

const defaultModalState: DecisionsModalState = {
  type: null,
  isOpen: false,
  data: {},
  size: 'lg',
};

const defaultDetailPanelState: DecisionsDetailPanelState = {
  isOpen: false,
  type: null,
  entityId: null,
  data: {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useDecisionsCommandCenterStore = create<DecisionsCommandCenterState>()(
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
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      toggleNotificationsPanel: () => set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),

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
          modal: {
            ...defaultModalState,
          },
        });
      },

      pushModal: (type, data = {}, options = {}) => {
        const current = get().modal;
        set((state) => ({
          modalStack: [...state.modalStack, current],
          modal: {
            type,
            isOpen: true,
            data,
            size: options.size || 'lg',
          },
        }));
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
          set({ modal: defaultModalState });
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

      resetFilters: () => {
        set({
          filters: { ...defaultFilters },
        });
      },

      saveFilter: (name) => {
        const filters = get().filters;
        const newFilter: SavedFilter = {
          id: `filter-${Date.now()}`,
          name,
          filters,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          savedFilters: [newFilter, ...state.savedFilters].slice(0, 20),
        }));
      },

      loadFilter: (id) => {
        const savedFilters = get().savedFilters;
        const filter = savedFilters.find((f) => f.id === id);
        if (filter) {
          set({
            filters: { ...filter.filters },
          });
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
          selectedItems: [...state.selectedItems, id],
        }));
      },

      deselectItem: (id) => {
        set((state) => ({
          selectedItems: state.selectedItems.filter((itemId) => itemId !== id),
        }));
      },

      selectAll: (ids) => {
        set({ selectedItems: ids });
      },

      clearSelection: () => {
        set({ selectedItems: [] });
      },

      toggleSelection: (id) => {
        set((state) => {
          const isSelected = state.selectedItems.includes(id);
          return {
            selectedItems: isSelected
              ? state.selectedItems.filter((itemId) => itemId !== id)
              : [...state.selectedItems, id],
          };
        });
      },

      // Search Actions
      setGlobalSearch: (term) => {
        set({ globalSearch: term });
      },
    }),
    {
      name: 'decisions-command-center-storage',
      partialize: (state) => ({
        navigation: state.navigation,
        sidebarCollapsed: state.sidebarCollapsed,
        kpiConfig: state.kpiConfig,
        filters: state.filters,
        savedFilters: state.savedFilters,
      }),
    }
  )
);

