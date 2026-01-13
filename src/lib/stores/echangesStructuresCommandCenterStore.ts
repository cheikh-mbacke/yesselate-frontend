/**
 * Store Zustand pour le Centre de Commandement Échanges Structurés
 * Architecture cohérente avec Analytics Command Center
 * Gestion centralisée de l'état : navigation, filtres, modals, sélections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (niveau 1)
export type EchangesStructuresMainCategory =
  | 'overview'        // Vue d'ensemble
  | 'ouvert'          // Ouverts
  | 'en_traitement'   // En traitement
  | 'escalade'        // Escaladés
  | 'resolu'          // Résolus
  | 'critiques'       // Critiques
  | 'en_retard'       // En retard
  | 'analytics'       // Analytiques
  | 'settings';       // Paramètres

// Sous-catégories (niveau 2)
export type EchangesStructuresSubCategory = string | null;

// Filtres de niveau 3
export type EchangesStructuresFilter = string | null;

// État de navigation
export interface EchangesStructuresNavigationState {
  mainCategory: EchangesStructuresMainCategory;
  subCategory: EchangesStructuresSubCategory;
  filter: EchangesStructuresFilter;
}

// Types de modals
export type EchangesStructuresModalType =
  | 'create'
  | 'detail'
  | 'export'
  | 'filters'
  | 'stats'
  | 'settings'
  | 'shortcuts'
  | 'help'
  | 'confirm';

// État des modals
export interface EchangesStructuresModalState {
  type: EchangesStructuresModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Panel de détail latéral
export interface EchangesStructuresDetailPanelState {
  isOpen: boolean;
  echangeId: string | null;
  data: Record<string, any>;
}

// Filtres actifs
export interface EchangesStructuresActiveFilters {
  status: ('ouvert' | 'en_traitement' | 'escalade' | 'resolu' | 'cloture_sans_suite')[];
  type: ('demande_info' | 'alerte_risque' | 'proposition_substitution' | 'demande_validation' | 'signalement_blocage' | 'coordination_urgente')[];
  priority: ('normale' | 'haute' | 'urgente' | 'critique')[];
  bureauxFrom: string[];
  bureauxTo: string[];
  dateRange: { start: Date | null; end: Date | null };
  searchQuery: string;
}

// Filtre sauvegardé
export interface SavedEchangesStructuresFilter {
  id: string;
  name: string;
  filters: EchangesStructuresActiveFilters;
  createdAt: string;
}

// Configuration KPIs
export interface EchangesStructuresKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
  autoRefresh: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface EchangesStructuresCommandCenterState {
  // Navigation
  navigation: EchangesStructuresNavigationState;
  navigationHistory: EchangesStructuresNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: EchangesStructuresModalState;
  modalStack: EchangesStructuresModalState[]; // Pour les modales empilées

  // Panel de détail
  detailPanel: EchangesStructuresDetailPanelState;

  // Filtres
  filters: EchangesStructuresActiveFilters;
  savedFilters: SavedEchangesStructuresFilter[];

  // KPIs
  kpiConfig: EchangesStructuresKPIConfig;

  // Sélections
  selectedItems: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: EchangesStructuresMainCategory,
    sub?: EchangesStructuresSubCategory,
    filter?: EchangesStructuresFilter
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
    type: EchangesStructuresModalType,
    data?: Record<string, any>,
    options?: Partial<EchangesStructuresModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: EchangesStructuresModalType,
    data?: Record<string, any>,
    options?: Partial<EchangesStructuresModalState>
  ) => void;
  popModal: () => void;

  // Actions Detail Panel
  openDetailPanel: (
    echangeId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // Actions Filtres
  setFilter: <K extends keyof EchangesStructuresActiveFilters>(
    key: K,
    value: EchangesStructuresActiveFilters[K]
  ) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (id: string) => void;
  deleteFilter: (id: string) => void;

  // Actions KPI
  setKPIConfig: (config: Partial<EchangesStructuresKPIConfig>) => void;

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

const defaultNavigation: EchangesStructuresNavigationState = {
  mainCategory: 'overview',
  subCategory: null,
  filter: null,
};

const defaultFilters: EchangesStructuresActiveFilters = {
  status: [],
  type: [],
  priority: [],
  bureauxFrom: [],
  bureauxTo: [],
  dateRange: { start: null, end: null },
  searchQuery: '',
};

const defaultKPIConfig: EchangesStructuresKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30, // 30 secondes
  autoRefresh: true,
};

const defaultModalState: EchangesStructuresModalState = {
  type: null,
  isOpen: false,
  data: {},
  size: 'lg',
};

const defaultDetailPanelState: EchangesStructuresDetailPanelState = {
  isOpen: false,
  echangeId: null,
  data: {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useEchangesStructuresCommandCenterStore = create<EchangesStructuresCommandCenterState>()(
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

      setSidebarCollapsed: (collapsed) => {
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
        }
      },

      // Detail Panel Actions
      openDetailPanel: (echangeId, data = {}) => {
        set({
          detailPanel: {
            isOpen: true,
            echangeId,
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
        const newFilter: SavedEchangesStructuresFilter = {
          id: `filter-${Date.now()}`,
          name,
          filters,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          savedFilters: [...state.savedFilters, newFilter],
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
          kpiConfig: {
            ...state.kpiConfig,
            ...config,
          },
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
          selectedItems: state.selectedItems.filter((item) => item !== id),
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
              ? state.selectedItems.filter((item) => item !== id)
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
      name: 'echanges-structures-command-center',
      partialize: (state) => ({
        navigation: state.navigation,
        sidebarCollapsed: state.sidebarCollapsed,
        filters: state.filters,
        kpiConfig: state.kpiConfig,
        savedFilters: state.savedFilters,
      }),
    }
  )
);

