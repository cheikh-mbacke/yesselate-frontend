/**
 * Store Zustand pour le Centre de Commandement IA
 * Architecture cohérente avec Analytics Command Center
 * Gestion centralisée de l'état : navigation, filtres, modals, sélections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (niveau 1)
export type IAMainCategory =
  | 'modules'        // Modules (vue d'ensemble)
  | 'active'         // Modules actifs
  | 'training'       // En formation
  | 'disabled'       // Désactivés
  | 'error'          // Erreurs
  | 'history'        // Historique
  | 'analysis'       // Analyses
  | 'prediction'     // Prédictions
  | 'anomaly'        // Anomalies
  | 'reports'        // Rapports
  | 'recommendations' // Recommandations
  | 'settings';      // Paramètres

// Sous-catégories (niveau 2)
export type IASubCategory = string | null;

// Filtres (niveau 3)
export type IAFilter = string | null;

// État de navigation
export interface IANavigationState {
  mainCategory: IAMainCategory;
  subCategory: IASubCategory;
  filter: IAFilter;
}

// État des modals
export type IAModalType =
  | 'export'
  | 'settings'
  | 'help'
  | 'shortcuts'
  | 'confirm'
  | null;

export interface IAModalState {
  type: IAModalType;
  isOpen: boolean;
  data?: Record<string, unknown>;
}

// Configuration KPI
export interface IAKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number;
}

// Filtres actifs
export interface IAActiveFilters {
  status?: string[];
  type?: string[];
  search?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════

const defaultNavigation: IANavigationState = {
  mainCategory: 'modules',
  subCategory: null,
  filter: null,
};

const defaultModalState: IAModalState = {
  type: null,
  isOpen: false,
  data: {},
};

const defaultKPIConfig: IAKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30000,
};

const defaultFilters: IAActiveFilters = {};

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface IACommandCenterState {
  // Navigation
  navigation: IANavigationState;
  navigationHistory: IANavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;

  // Modal
  modal: IAModalState;
  modalStack: IAModalState[]; // Pour les modales empilées

  // Filtres
  filters: IAActiveFilters;

  // KPIs
  kpiConfig: IAKPIConfig;

  // Sélections
  selectedItems: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: IAMainCategory,
    sub?: IASubCategory,
    filter?: IAFilter
  ) => void;
  goBack: () => void;
  resetNavigation: () => void;

  // Actions UI
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;

  // Actions Modal
  openModal: (
    type: IAModalType,
    data?: Record<string, unknown>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: IAModalType,
    data?: Record<string, unknown>
  ) => void;
  popModal: () => void;

  // Actions Filtres
  setFilter: (key: keyof IAActiveFilters, value: unknown) => void;
  resetFilters: () => void;

  // Actions KPI
  setKPIConfig: (config: Partial<IAKPIConfig>) => void;

  // Actions Sélection
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  // Actions Recherche
  setGlobalSearch: (query: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useIACommandCenterStore = create<IACommandCenterState>()(
  persist(
    (set, get) => ({
      // Initial state
      navigation: defaultNavigation,
      navigationHistory: [],

      sidebarCollapsed: false,
      fullscreen: false,
      commandPaletteOpen: false,

      modal: defaultModalState,
      modalStack: [],

      filters: { ...defaultFilters },

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
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        }));
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      toggleFullscreen: () => {
        set((state) => ({
          fullscreen: !state.fullscreen,
        }));
      },

      toggleCommandPalette: () => {
        set((state) => ({
          commandPaletteOpen: !state.commandPaletteOpen,
        }));
      },

      // Modal Actions
      openModal: (type, data = {}) => {
        set({
          modal: {
            type,
            isOpen: true,
            data,
          },
        });
      },

      closeModal: () => {
        set({
          modal: defaultModalState,
        });
      },

      pushModal: (type, data = {}) => {
        const current = get().modal;
        set((state) => ({
          modalStack: [...state.modalStack, current],
          modal: {
            type,
            isOpen: true,
            data,
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
          set({
            modal: defaultModalState,
          });
        }
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

      // KPI Actions
      setKPIConfig: (config) => {
        set((state) => ({
          kpiConfig: {
            ...state.kpiConfig,
            ...config,
          },
        }));
      },

      // Selection Actions
      toggleSelection: (id) => {
        set((state) => {
          const index = state.selectedItems.indexOf(id);
          if (index === -1) {
            return {
              selectedItems: [...state.selectedItems, id],
            };
          } else {
            return {
              selectedItems: state.selectedItems.filter((item) => item !== id),
            };
          }
        });
      },

      selectAll: (ids) => {
        set({ selectedItems: ids });
      },

      clearSelection: () => {
        set({ selectedItems: [] });
      },

      // Search Actions
      setGlobalSearch: (query) => {
        set({ globalSearch: query });
      },
    }),
    {
      name: 'ia-command-center-storage',
      partialize: (state) => ({
        navigation: state.navigation,
        sidebarCollapsed: state.sidebarCollapsed,
        kpiConfig: state.kpiConfig,
        filters: state.filters,
      }),
    }
  )
);

