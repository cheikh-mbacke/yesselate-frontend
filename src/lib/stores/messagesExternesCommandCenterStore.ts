/**
 * Store Zustand pour le Centre de Commandement Messages Externes
 * Architecture cohérente avec Analytics et Governance Command Center
 * Gestion centralisée de l'état : navigation, filtres, modals, sélections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (niveau 1)
export type MessagesExternesMainCategory =
  | 'overview'      // Vue d'ensemble
  | 'unread'        // Non lus
  | 'requires_response'  // À répondre
  | 'replied'       // Répondus
  | 'archived'      // Archivés
  | 'by_type'       // Par type
  | 'by_priority'   // Par priorité
  | 'analytics'     // Analytiques
  | 'settings';     // Paramètres

// Sous-catégories (niveau 2)
export type MessagesExternesSubCategory = string | null;

// Filtres de niveau 3
export type MessagesExternesFilter = string | null;

// État de navigation
export interface MessagesExternesNavigationState {
  mainCategory: MessagesExternesMainCategory;
  subCategory: MessagesExternesSubCategory;
  filter: MessagesExternesFilter;
}

// Types de modals
export type MessagesExternesModalType =
  | 'stats'
  | 'export'
  | 'respond'
  | 'assign'
  | 'link'
  | 'archive'
  | 'filters'
  | 'settings'
  | 'shortcuts'
  | 'help'
  | 'confirm';

// État des modals
export interface MessagesExternesModalState {
  type: MessagesExternesModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Panel de détail latéral
export interface MessagesExternesDetailPanelState {
  isOpen: boolean;
  type: 'message' | null;
  entityId: string | null;
  data: Record<string, any>;
}

// Filtres actifs
export interface MessagesExternesActiveFilters {
  dateRange: { start: Date | null; end: Date | null };
  types: string[];
  statuses: string[];
  priorities: ('urgent' | 'high' | 'normal' | 'low')[];
  requiresResponse: boolean | null;
  projects: string[];
  bureaux: string[];
  tags: string[];
  customFilters: Record<string, any>;
}

// Filtre sauvegardé
export interface SavedFilter {
  id: string;
  name: string;
  filters: MessagesExternesActiveFilters;
  createdAt: string;
}

// Configuration KPIs
export interface MessagesExternesKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
  autoRefresh: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface MessagesExternesCommandCenterState {
  // Navigation
  navigation: MessagesExternesNavigationState;
  navigationHistory: MessagesExternesNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: MessagesExternesModalState;
  modalStack: MessagesExternesModalState[]; // Pour les modales empilées

  // Panel de détail
  detailPanel: MessagesExternesDetailPanelState;

  // Filtres
  filters: MessagesExternesActiveFilters;
  savedFilters: SavedFilter[];

  // KPIs
  kpiConfig: MessagesExternesKPIConfig;

  // Sélections
  selectedItems: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: MessagesExternesMainCategory,
    sub?: MessagesExternesSubCategory,
    filter?: MessagesExternesFilter
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
    type: MessagesExternesModalType,
    data?: Record<string, any>,
    options?: Partial<MessagesExternesModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: MessagesExternesModalType,
    data?: Record<string, any>,
    options?: Partial<MessagesExternesModalState>
  ) => void;
  popModal: () => void;

  // Actions Detail Panel
  openDetailPanel: (
    type: 'message',
    entityId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // Actions Filters
  setFilter: <K extends keyof MessagesExternesActiveFilters>(
    key: K,
    value: MessagesExternesActiveFilters[K]
  ) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => void;
  deleteSavedFilter: (id: string) => void;

  // Actions KPIs
  setKPIConfig: (config: Partial<MessagesExternesKPIConfig>) => void;

  // Actions Sélection
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  // Actions Recherche
  setGlobalSearch: (search: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const defaultNavigation: MessagesExternesNavigationState = {
  mainCategory: 'overview',
  subCategory: 'all',
  filter: null,
};

const defaultModalState: MessagesExternesModalState = {
  type: null,
  isOpen: false,
  data: {},
  size: 'md',
};

const defaultDetailPanelState: MessagesExternesDetailPanelState = {
  isOpen: false,
  type: null,
  entityId: null,
  data: {},
};

const defaultFilters: MessagesExternesActiveFilters = {
  dateRange: { start: null, end: null },
  types: [],
  statuses: [],
  priorities: [],
  requiresResponse: null,
  projects: [],
  bureaux: [],
  tags: [],
  customFilters: {},
};

const defaultKPIConfig: MessagesExternesKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30,
  autoRefresh: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useMessagesExternesCommandCenterStore = create<MessagesExternesCommandCenterState>()(
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
            size: options.size || 'md',
          },
        });
      },

      closeModal: () => {
        set({
          modal: {
            ...get().modal,
            isOpen: false,
          },
        });
      },

      pushModal: (type, data = {}, options = {}) => {
        const current = get().modal;
        set({
          modalStack: [...get().modalStack, current],
          modal: {
            type,
            isOpen: true,
            data,
            size: options.size || 'md',
          },
        });
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
        const filters = get().filters;
        const newFilter: SavedFilter = {
          id: `filter-${Date.now()}`,
          name,
          filters: { ...filters },
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          savedFilters: [...state.savedFilters, newFilter],
        }));
      },

      deleteSavedFilter: (id: string) => {
        set((state) => ({
          savedFilters: state.savedFilters.filter((f) => f.id !== id),
        }));
      },

      // KPI Config Actions
      setKPIConfig: (config: Partial<MessagesExternesKPIConfig>) => {
        set((state) => ({
          kpiConfig: {
            ...state.kpiConfig,
            ...config,
          },
        }));
      },

      // Selection Actions
      toggleSelection: (id: string) => {
        set((state) => {
          const isSelected = state.selectedItems.includes(id);
          return {
            selectedItems: isSelected
              ? state.selectedItems.filter((item) => item !== id)
              : [...state.selectedItems, id],
          };
        });
      },

      selectAll: (ids: string[]) => {
        set({ selectedItems: ids });
      },

      clearSelection: () => {
        set({ selectedItems: [] });
      },

      // Search Actions
      setGlobalSearch: (search: string) => {
        set({ globalSearch: search });
      },
    }),
    {
      name: 'messages-externes-command-center',
      partialize: (state) => ({
        navigation: state.navigation,
        sidebarCollapsed: state.sidebarCollapsed,
        filters: state.filters,
        savedFilters: state.savedFilters,
        kpiConfig: state.kpiConfig,
      }),
    }
  )
);

