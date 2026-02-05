/**
 * Store Zustand pour le Centre de Commandement Alertes & Risques
 * Architecture cohérente avec Analytics Command Center
 * Gestion centralisée de l'état : navigation, filtres, modals, sélections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AlerteFiltres, AlerteSeverite, AlerteStatut, AlerteTypologie } from '@/modules/alertes/types/alertesTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (niveau 1)
export type AlertesMainCategory =
  | 'overview'      // Vue d'ensemble
  | 'en-cours'      // Alertes en cours
  | 'traitements'   // Traitements
  | 'governance';   // Gouvernance & Historique

// Sous-catégories (niveau 2)
export type AlertesSubCategory = string | null;

// Sous-sous-catégories (niveau 3)
export type AlertesSubSubCategory = string | null;

// État de navigation
export interface AlertesNavigationState {
  mainCategory: AlertesMainCategory;
  subCategory: AlertesSubCategory;
  subSubCategory: AlertesSubSubCategory;
}

// Types de modals
export type AlertesModalType =
  | 'stats'
  | 'export'
  | 'regle-config'
  | 'alerte-detail'
  | 'filters'
  | 'settings'
  | 'shortcuts'
  | 'help'
  | 'confirm'
  | 'acknowledge'
  | 'resolve'
  | 'escalate'
  | 'assign';

// État des modals
export interface AlertesModalState {
  type: AlertesModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Panel de détail latéral
export interface AlertesDetailPanelState {
  isOpen: boolean;
  alerteId: string | null;
  data: Record<string, any>;
}

// Filtres actifs
export interface AlertesActiveFilters extends AlerteFiltres {
  customFilters: Record<string, any>;
}

// Filtre sauvegardé
export interface SavedFilter {
  id: string;
  name: string;
  filters: AlertesActiveFilters;
  createdAt: string;
}

// Configuration KPIs
export interface AlertesKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
  autoRefresh: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface AlertesCommandCenterState {
  // Navigation
  navigation: AlertesNavigationState;
  navigationHistory: AlertesNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: AlertesModalState;
  modalStack: AlertesModalState[]; // Pour les modales empilées

  // Panel de détail
  detailPanel: AlertesDetailPanelState;

  // Filtres
  filters: AlertesActiveFilters;
  savedFilters: SavedFilter[];

  // KPIs
  kpiConfig: AlertesKPIConfig;

  // Sélections
  selectedItems: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: AlertesMainCategory,
    sub?: AlertesSubCategory,
    subSub?: AlertesSubSubCategory
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
    type: AlertesModalType,
    data?: Record<string, any>,
    options?: Partial<AlertesModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: AlertesModalType,
    data?: Record<string, any>,
    options?: Partial<AlertesModalState>
  ) => void;
  popModal: () => void;

  // Actions Detail Panel
  openDetailPanel: (
    alerteId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // Actions Filtres
  setFilter: <K extends keyof AlertesActiveFilters>(
    key: K,
    value: AlertesActiveFilters[K]
  ) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (id: string) => void;
  deleteFilter: (id: string) => void;

  // Actions KPI
  setKPIConfig: (config: Partial<AlertesKPIConfig>) => void;

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

const defaultNavigation: AlertesNavigationState = {
  mainCategory: 'overview',
  subCategory: null,
  subSubCategory: null,
};

const defaultFilters: AlertesActiveFilters = {
  severites: [],
  statuts: [],
  typologies: [],
  bureaux: [],
  responsables: [],
  projets: [],
  tags: [],
  customFilters: {},
};

const defaultKPIConfig: AlertesKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30, // 30 secondes
  autoRefresh: true,
};

const defaultModalState: AlertesModalState = {
  type: null,
  isOpen: false,
  data: {},
  size: 'lg',
};

const defaultDetailPanelState: AlertesDetailPanelState = {
  isOpen: false,
  alerteId: null,
  data: {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useAlertesCommandCenterStore = create<AlertesCommandCenterState>()(
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
      navigate: (main, sub = null, subSub = null) => {
        const current = get().navigation;
        set((state) => ({
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
      openDetailPanel: (alerteId, data = {}) => {
        set({
          detailPanel: {
            isOpen: true,
            alerteId,
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
      name: 'alertes-command-center-storage',
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

export const useAlertesNavigation = () => {
  return useAlertesCommandCenterStore((state) => ({
    navigation: state.navigation,
    navigate: state.navigate,
    goBack: state.goBack,
    resetNavigation: state.resetNavigation,
    canGoBack: state.navigationHistory.length > 0,
  }));
};

export const useAlertesModal = () => {
  const { modal, openModal, closeModal, pushModal, popModal } =
    useAlertesCommandCenterStore();
  return { modal, openModal, closeModal, pushModal, popModal };
};

export const useAlertesFilters = () => {
  const {
    filters,
    setFilter,
    resetFilters,
    saveFilter,
    loadFilter,
    deleteFilter,
    savedFilters,
  } = useAlertesCommandCenterStore();
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

export const useAlertesSelection = () => {
  const {
    selectedItems,
    selectItem,
    deselectItem,
    selectAll,
    clearSelection,
    toggleSelection,
  } = useAlertesCommandCenterStore();
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

