/**
 * Store Zustand pour System Logs Command Center
 * Architecture cohérente avec Analytics Command Center
 * Gestion centralisée de l'état : navigation, modals, filtres, sélections
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export type SystemLogsMainCategory =
  | 'overview'
  | 'by-level'
  | 'by-category'
  | 'security'
  | 'incidents'
  | 'correlation'
  | 'integrity'
  | 'exports'
  | 'advanced-search';

export type SystemLogsSubCategory = string | null;
export type SystemLogsFilter = string | null;

export interface SystemLogsNavigationState {
  mainCategory: SystemLogsMainCategory;
  subCategory: SystemLogsSubCategory;
  filter: SystemLogsFilter;
}

export type SystemLogsModalType =
  | 'log-detail'
  | 'export'
  | 'integrity-scan'
  | 'incident-detail'
  | 'alert-detail'
  | 'stats'
  | 'settings'
  | 'shortcuts'
  | 'confirm';

export interface SystemLogsModalState {
  isOpen: boolean;
  type: SystemLogsModalType | null;
  data?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface SystemLogsDetailPanelState {
  isOpen: boolean;
  type: 'log' | 'incident' | 'alert' | null;
  entityId: string | null;
  data: Record<string, any>;
}

export interface SystemLogsActiveFilters {
  level?: string[];
  category?: string[];
  timeRange?: string[];
  severity?: number[];
  source?: string[];
  userId?: string[];
  search?: string;
}

export interface SavedSystemLogsFilter {
  id: string;
  name: string;
  filters: SystemLogsActiveFilters;
  createdAt: string;
}

export interface SystemLogsKPIConfig {
  visible: boolean;
  collapsed: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface SystemLogsCommandCenterState {
  // Navigation
  navigation: SystemLogsNavigationState;
  navigationHistory: SystemLogsNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: SystemLogsModalState;
  modalStack: SystemLogsModalState[];

  // Panel de détail
  detailPanel: SystemLogsDetailPanelState;

  // Filtres
  filters: SystemLogsActiveFilters;
  savedFilters: SavedSystemLogsFilter[];

  // KPIs
  kpiConfig: SystemLogsKPIConfig;

  // Sélections
  selectedLogIds: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: SystemLogsMainCategory,
    sub?: SystemLogsSubCategory,
    filter?: SystemLogsFilter
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
    type: SystemLogsModalType,
    data?: Record<string, any>,
    options?: Partial<SystemLogsModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: SystemLogsModalType,
    data?: Record<string, any>,
    options?: Partial<SystemLogsModalState>
  ) => void;
  popModal: () => void;

  // Actions Detail Panel
  openDetailPanel: (
    type: 'log' | 'incident' | 'alert',
    entityId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // Actions Filtres
  setFilter: (key: keyof SystemLogsActiveFilters, value: any) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => void;
  deleteFilter: (id: string) => void;

  // Actions KPIs
  setKPIConfig: (config: Partial<SystemLogsKPIConfig>) => void;

  // Actions Sélections
  toggleLogSelection: (logId: string) => void;
  selectAllLogs: (logIds: string[]) => void;
  clearSelection: () => void;

  // Actions Recherche
  setGlobalSearch: (search: string) => void;
}

const initialState: SystemLogsNavigationState = {
  mainCategory: 'overview',
  subCategory: 'all',
  filter: null,
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useSystemLogsCommandCenterStore = create<SystemLogsCommandCenterState>()(
  persist(
    (set, get) => ({
      // Navigation
      navigation: initialState,
      navigationHistory: [],

      // UI State
      sidebarCollapsed: false,
      fullscreen: false,
      commandPaletteOpen: false,
      notificationsPanelOpen: false,

      // Modal
      modal: {
        isOpen: false,
        type: null,
        data: undefined,
        size: 'xl',
      },
      modalStack: [],

      // Detail Panel
      detailPanel: {
        isOpen: false,
        type: null,
        entityId: null,
        data: {},
      },

      // Filtres
      filters: {},
      savedFilters: [],

      // KPIs
      kpiConfig: {
        visible: true,
        collapsed: false,
      },

      // Sélections
      selectedLogIds: [],

      // Recherche
      globalSearch: '',

      // Actions Navigation
      navigate: (main, sub = 'all', filter = null) => {
        const current = get().navigation;
        set({
          navigation: { mainCategory: main, subCategory: sub, filter },
          navigationHistory: [...get().navigationHistory, current],
        });
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
          navigation: initialState,
          navigationHistory: [],
        });
      },

      // Actions UI
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      toggleNotificationsPanel: () => set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),

      // Actions Modal
      openModal: (type, data, options) => {
        set({
          modal: {
            isOpen: true,
            type,
            data,
            size: options?.size || 'xl',
          },
        });
      },

      closeModal: () => {
        set({
          modal: {
            isOpen: false,
            type: null,
            data: undefined,
            size: 'xl',
          },
        });
      },

      pushModal: (type, data, options) => {
        const current = get().modal;
        set({
          modalStack: [...get().modalStack, current],
          modal: {
            isOpen: true,
            type,
            data,
            size: options?.size || 'xl',
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
          get().closeModal();
        }
      },

      // Actions Detail Panel
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
          detailPanel: {
            isOpen: false,
            type: null,
            entityId: null,
            data: {},
          },
        });
      },

      // Actions Filtres
      setFilter: (key, value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        }));
      },

      resetFilters: () => {
        set({ filters: {} });
      },

      saveFilter: (name) => {
        const filters = get().filters;
        const saved: SavedSystemLogsFilter = {
          id: `filter-${Date.now()}`,
          name,
          filters,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          savedFilters: [...state.savedFilters, saved],
        }));
      },

      deleteFilter: (id) => {
        set((state) => ({
          savedFilters: state.savedFilters.filter((f) => f.id !== id),
        }));
      },

      // Actions KPIs
      setKPIConfig: (config) => {
        set((state) => ({
          kpiConfig: { ...state.kpiConfig, ...config },
        }));
      },

      // Actions Sélections
      toggleLogSelection: (logId) => {
        set((state) => {
          const selected = state.selectedLogIds.includes(logId)
            ? state.selectedLogIds.filter((id) => id !== logId)
            : [...state.selectedLogIds, logId];
          return { selectedLogIds: selected };
        });
      },

      selectAllLogs: (logIds) => {
        set({ selectedLogIds: logIds });
      },

      clearSelection: () => {
        set({ selectedLogIds: [] });
      },

      // Actions Recherche
      setGlobalSearch: (search) => {
        set({ globalSearch: search });
      },
    }),
    {
      name: 'system-logs-command-center',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        kpiConfig: state.kpiConfig,
        savedFilters: state.savedFilters,
      }),
    }
  )
);

