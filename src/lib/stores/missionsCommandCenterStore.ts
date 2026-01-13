/**
 * Store Zustand pour le Centre de Commandement Missions
 * Architecture cohérente avec Governance et Analytics Command Center
 * Gestion centralisée de l'état : navigation, filtres, modals, sélections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (niveau 1)
export type MissionsMainCategory =
  | 'overview'      // Vue d'ensemble
  | 'planned'       // Planifiées
  | 'in-progress'   // En cours
  | 'on-site'       // Sur site
  | 'delayed'       // En retard
  | 'completed'     // Terminées
  | 'canceled'      // Annulées
  | 'by-region'     // Par région
  | 'analytics'     // Analytics
  | 'archive';      // Archives

// Sous-catégories (niveau 2)
export type MissionsSubCategory = string | null;

// Filtres de niveau 3
export type MissionsFilter = string | null;

// État de navigation
export interface MissionsNavigationState {
  mainCategory: MissionsMainCategory;
  subCategory: MissionsSubCategory;
  filter: MissionsFilter;
}

// Types de modals
export type MissionsModalType =
  | 'stats'
  | 'export'
  | 'mission-detail'
  | 'create-mission'
  | 'edit-mission'
  | 'filters'
  | 'settings'
  | 'shortcuts'
  | 'help'
  | 'confirm';

// État des modals
export interface MissionsModalState {
  type: MissionsModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Panel de détail latéral
export interface MissionsDetailPanelState {
  isOpen: boolean;
  type: 'mission' | null;
  entityId: string | null;
  data: Record<string, any>;
}

// Filtres actifs
export interface MissionsActiveFilters {
  dateRange: { start: Date | null; end: Date | null };
  regions: string[];
  statuses: string[];
  priorities: ('critical' | 'high' | 'medium' | 'low')[];
  teams: string[];
  tags: string[];
  customFilters: Record<string, any>;
}

// Filtre sauvegardé
export interface SavedFilter {
  id: string;
  name: string;
  filters: MissionsActiveFilters;
  createdAt: string;
}

// Configuration KPIs
export interface MissionsKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
  autoRefresh: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface MissionsCommandCenterState {
  // Navigation
  navigation: MissionsNavigationState;
  navigationHistory: MissionsNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: MissionsModalState;
  modalStack: MissionsModalState[]; // Pour les modales empilées

  // Panel de détail
  detailPanel: MissionsDetailPanelState;

  // Filtres
  filters: MissionsActiveFilters;
  savedFilters: SavedFilter[];

  // KPIs
  kpiConfig: MissionsKPIConfig;

  // Sélections
  selectedItems: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: MissionsMainCategory,
    sub?: MissionsSubCategory,
    filter?: MissionsFilter
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
    type: MissionsModalType,
    data?: Record<string, any>,
    options?: Partial<MissionsModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: MissionsModalType,
    data?: Record<string, any>,
    options?: Partial<MissionsModalState>
  ) => void;
  popModal: () => void;

  // Actions Detail Panel
  openDetailPanel: (
    type: 'mission',
    entityId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // Actions Filtres
  setFilter: (key: keyof MissionsActiveFilters, value: any) => void;
  setFilters: (filters: Partial<MissionsActiveFilters>) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => void;
  deleteSavedFilter: (id: string) => void;

  // Actions KPI Config
  setKPIConfig: (config: Partial<MissionsKPIConfig>) => void;

  // Actions Sélection
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  // Actions Recherche
  setGlobalSearch: (search: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════

const defaultNavigation: MissionsNavigationState = {
  mainCategory: 'overview',
  subCategory: null,
  filter: null,
};

const defaultFilters: MissionsActiveFilters = {
  dateRange: { start: null, end: null },
  regions: [],
  statuses: [],
  priorities: [],
  teams: [],
  tags: [],
  customFilters: {},
};

const defaultKPIConfig: MissionsKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30, // 30 secondes
  autoRefresh: true,
};

const defaultModalState: MissionsModalState = {
  type: null,
  isOpen: false,
  data: {},
  size: 'lg',
};

const defaultDetailPanelState: MissionsDetailPanelState = {
  isOpen: false,
  type: null,
  entityId: null,
  data: {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useMissionsCommandCenterStore = create<MissionsCommandCenterState>()(
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

      setFilters: (newFilters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...newFilters,
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
          id: `filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name,
          filters: { ...filters },
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          savedFilters: [newFilter, ...state.savedFilters].slice(0, 20),
        }));
      },

      deleteSavedFilter: (id) => {
        set((state) => ({
          savedFilters: state.savedFilters.filter((f) => f.id !== id),
        }));
      },

      // KPI Config Actions
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
          const selected = new Set(state.selectedItems);
          if (selected.has(id)) {
            selected.delete(id);
          } else {
            selected.add(id);
          }
          return { selectedItems: Array.from(selected) };
        });
      },

      selectAll: (ids) => {
        set({ selectedItems: ids });
      },

      clearSelection: () => {
        set({ selectedItems: [] });
      },

      // Search Actions
      setGlobalSearch: (search) => {
        set({ globalSearch: search });
      },
    }),
    {
      name: 'bmo-missions-command-center',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        kpiConfig: state.kpiConfig,
        savedFilters: state.savedFilters,
      }),
    }
  )
);

