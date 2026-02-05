/**
 * Store Zustand pour le Centre de Commandement Employés
 * Architecture cohérente avec Analytics Command Center
 * Gestion centralisée de l'état : navigation, filtres, modals, sélections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (niveau 1)
export type EmployesMainCategory =
  | 'overview'      // Vue d'ensemble
  | 'all'           // Tous les employés
  | 'departments'   // Départements
  | 'skills'        // Compétences
  | 'performance'   // Performances
  | 'evaluations'   // Évaluations
  | 'contracts'     // Contrats
  | 'absences'      // Absences
  | 'spof';         // SPOF

// Sous-catégories (niveau 2)
export type EmployesSubCategory = string | null;

// Filtres de niveau 3
export type EmployesFilter = string | null;

// État de navigation
export interface EmployesNavigationState {
  mainCategory: EmployesMainCategory;
  subCategory: EmployesSubCategory;
  filter: EmployesFilter;
}

// Types de modals
export type EmployesModalType =
  | 'employee-detail'
  | 'export'
  | 'settings'
  | 'shortcuts'
  | 'confirm'
  | 'filters';

// État des modals
export interface EmployesModalState {
  type: EmployesModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Panel de détail latéral
export interface EmployesDetailPanelState {
  isOpen: boolean;
  type: 'employee' | null;
  entityId: string | null;
  data: Record<string, any>;
}

// Filtres actifs
export interface EmployesActiveFilters {
  status: ('actif' | 'conges' | 'mission' | 'absent' | 'inactif')[];
  departments: string[];
  contractTypes: ('CDI' | 'CDD' | 'Stage' | 'Intérim')[];
  bureaux: string[];
  performance: ('excellent' | 'good' | 'needs-improvement')[];
  spof: boolean | null;
  riskScore: { min: number | null; max: number | null };
  dateRange: { start: Date | null; end: Date | null };
  search: string;
}

// Filtre sauvegardé
export interface SavedFilter {
  id: string;
  name: string;
  filters: EmployesActiveFilters;
  createdAt: string;
}

// Configuration KPIs
export interface EmployesKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
  autoRefresh: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface EmployesCommandCenterState {
  // Navigation
  navigation: EmployesNavigationState;
  navigationHistory: EmployesNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: EmployesModalState;
  modalStack: EmployesModalState[]; // Pour les modales empilées

  // Panel de détail
  detailPanel: EmployesDetailPanelState;

  // Filtres
  filters: EmployesActiveFilters;
  savedFilters: SavedFilter[];

  // KPIs
  kpiConfig: EmployesKPIConfig;

  // Sélections
  selectedItems: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: EmployesMainCategory,
    sub?: EmployesSubCategory,
    filter?: EmployesFilter
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
    type: EmployesModalType,
    data?: Record<string, any>,
    options?: Partial<EmployesModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: EmployesModalType,
    data?: Record<string, any>,
    options?: Partial<EmployesModalState>
  ) => void;
  popModal: () => void;

  // Actions Detail Panel
  openDetailPanel: (
    type: 'employee',
    entityId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // Actions Filtres
  setFilter: <K extends keyof EmployesActiveFilters>(
    key: K,
    value: EmployesActiveFilters[K]
  ) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (id: string) => void;
  deleteFilter: (id: string) => void;

  // Actions KPI
  setKPIConfig: (config: Partial<EmployesKPIConfig>) => void;

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

const defaultNavigation: EmployesNavigationState = {
  mainCategory: 'overview',
  subCategory: null,
  filter: null,
};

const defaultFilters: EmployesActiveFilters = {
  status: [],
  departments: [],
  contractTypes: [],
  bureaux: [],
  performance: [],
  spof: null,
  riskScore: { min: null, max: null },
  dateRange: { start: null, end: null },
  search: '',
};

const defaultKPIConfig: EmployesKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30, // 30 secondes
  autoRefresh: true,
};

const defaultModalState: EmployesModalState = {
  type: null,
  isOpen: false,
  data: {},
  size: 'lg',
};

const defaultDetailPanelState: EmployesDetailPanelState = {
  isOpen: false,
  type: null,
  entityId: null,
  data: {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useEmployesCommandCenterStore = create<EmployesCommandCenterState>()(
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
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      toggleFullscreen: () => {
        set((state) => ({ fullscreen: !state.fullscreen }));
      },

      toggleCommandPalette: () => {
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen }));
      },

      toggleNotificationsPanel: () => {
        set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen }));
      },

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
        const { modalStack } = get();
        if (modalStack.length > 0) {
          const previous = modalStack[modalStack.length - 1];
          set({
            modal: previous,
            modalStack: modalStack.slice(0, -1),
          });
        } else {
          set({ modal: defaultModalState });
        }
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
        const { modalStack } = get();
        if (modalStack.length > 0) {
          const previous = modalStack[modalStack.length - 1];
          set({
            modal: previous,
            modalStack: modalStack.slice(0, -1),
          });
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
          filters: {
            ...state.filters,
            [key]: value,
          },
        }));
      },

      resetFilters: () => {
        set({ filters: { ...defaultFilters } });
      },

      saveFilter: (name: string) => {
        const { filters } = get();
        const newFilter: SavedFilter = {
          id: Date.now().toString(),
          name,
          filters: { ...filters },
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          savedFilters: [...state.savedFilters, newFilter],
        }));
      },

      loadFilter: (id: string) => {
        const { savedFilters } = get();
        const filter = savedFilters.find((f) => f.id === id);
        if (filter) {
          set({ filters: { ...filter.filters } });
        }
      },

      deleteFilter: (id: string) => {
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
      selectItem: (id: string) => {
        set((state) => {
          if (!state.selectedItems.includes(id)) {
            return { selectedItems: [...state.selectedItems, id] };
          }
          return state;
        });
      },

      deselectItem: (id: string) => {
        set((state) => ({
          selectedItems: state.selectedItems.filter((item) => item !== id),
        }));
      },

      selectAll: (ids: string[]) => {
        set({ selectedItems: [...ids] });
      },

      clearSelection: () => {
        set({ selectedItems: [] });
      },

      toggleSelection: (id: string) => {
        set((state) => {
          const index = state.selectedItems.indexOf(id);
          if (index > -1) {
            return {
              selectedItems: state.selectedItems.filter((item) => item !== id),
            };
          } else {
            return { selectedItems: [...state.selectedItems, id] };
          }
        });
      },

      // Search Actions
      setGlobalSearch: (term: string) => {
        set({ globalSearch: term });
      },
    }),
    {
      name: 'employes:command-center',
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

