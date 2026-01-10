/**
 * Store Command Center - Validation BC
 * Architecture identique à governanceCommandCenterStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ValidationBCMainCategory = 
  | 'overview' 
  | 'pending' 
  | 'anomalies' 
  | 'urgent' 
  | 'validated' 
  | 'rejected';

export type ValidationBCSubCategory = 
  | 'all' 
  | 'bc' 
  | 'factures' 
  | 'avenants' 
  | 'achats' 
  | 'finance' 
  | 'juridique';

export interface ValidationBCFilters {
  status: string[];
  bureaux: string[];
  types: string[];
  dateRange: { from: string | null; to: string | null };
  montantMin: number | null;
  montantMax: number | null;
  search: string;
}

export interface ValidationBCLiveStats {
  total: number;
  pending: number;
  anomalies: number;
  urgent: number;
  validated: number;
  rejected: number;
  avgDelay: number;
  totalMontant: number;
  isRefreshing: boolean;
  connectionStatus: 'connected' | 'syncing' | 'disconnected';
}

interface ValidationBCCommandCenterState {
  navigation: {
    mainCategory: ValidationBCMainCategory;
    subCategory: ValidationBCSubCategory;
    subSubCategory: string | null;
  };
  navigationHistory: Array<{
    mainCategory: ValidationBCMainCategory;
    subCategory: ValidationBCSubCategory;
    subSubCategory: string | null;
  }>;

  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  activeModal: string | null;
  modalData: Record<string, unknown>;

  filters: ValidationBCFilters;
  activeFilterPreset: string | null;

  tableConfig: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    pageSize: number;
    currentPage: number;
  };

  liveStats: ValidationBCLiveStats;
  selectedItems: string[];
  globalSearch: string;
  autoRefresh: boolean;
  refreshInterval: number;

  // Actions
  navigate: (main: ValidationBCMainCategory, sub?: ValidationBCSubCategory, subSub?: string | null) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationsPanel: () => void;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  setFilters: (filters: Partial<ValidationBCFilters>) => void;
  resetFilters: () => void;
  setTableConfig: (config: Partial<ValidationBCCommandCenterState['tableConfig']>) => void;
  setLiveStats: (stats: Partial<ValidationBCLiveStats>) => void;
  startRefresh: () => void;
  endRefresh: () => void;
  toggleItemSelection: (id: string) => void;
  selectAllItems: (ids: string[]) => void;
  clearSelection: () => void;
  setGlobalSearch: (search: string) => void;
  setAutoRefresh: (enabled: boolean) => void;
}

const defaultFilters: ValidationBCFilters = {
  status: [],
  bureaux: [],
  types: [],
  dateRange: { from: null, to: null },
  montantMin: null,
  montantMax: null,
  search: '',
};

const defaultLiveStats: ValidationBCLiveStats = {
  total: 0,
  pending: 0,
  anomalies: 0,
  urgent: 0,
  validated: 0,
  rejected: 0,
  avgDelay: 0,
  totalMontant: 0,
  isRefreshing: false,
  connectionStatus: 'connected',
};

export const useValidationBCCommandCenterStore = create<ValidationBCCommandCenterState>()(
  persist(
    (set, get) => ({
      navigation: {
        mainCategory: 'overview',
        subCategory: 'all',
        subSubCategory: null,
      },
      navigationHistory: [],

      sidebarCollapsed: false,
      fullscreen: false,
      commandPaletteOpen: false,
      notificationsPanelOpen: false,

      activeModal: null,
      modalData: {},

      filters: defaultFilters,
      activeFilterPreset: null,

      tableConfig: {
        sortBy: 'date',
        sortOrder: 'desc',
        pageSize: 25,
        currentPage: 1,
      },

      liveStats: defaultLiveStats,

      selectedItems: [],
      globalSearch: '',
      autoRefresh: true,
      refreshInterval: 60000,

      navigate: (main, sub = 'all', subSub = null) => {
        const current = get().navigation;
        set({
          navigationHistory: [
            ...get().navigationHistory.slice(-9),
            { ...current },
          ],
          navigation: {
            mainCategory: main,
            subCategory: sub,
            subSubCategory: subSub,
          },
          selectedItems: [],
        });
      },

      goBack: () => {
        const history = get().navigationHistory;
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        set({
          navigation: previous,
          navigationHistory: history.slice(0, -1),
        });
      },

      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      toggleFullscreen: () => set({ fullscreen: !get().fullscreen }),
      toggleCommandPalette: () => set({ commandPaletteOpen: !get().commandPaletteOpen }),
      toggleNotificationsPanel: () => set({ notificationsPanelOpen: !get().notificationsPanelOpen }),

      openModal: (modalId, data = {}) => set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: {} }),

      setFilters: (newFilters) => set({
        filters: { ...get().filters, ...newFilters },
        tableConfig: { ...get().tableConfig, currentPage: 1 },
      }),

      resetFilters: () => set({
        filters: defaultFilters,
        activeFilterPreset: null,
        tableConfig: { ...get().tableConfig, currentPage: 1 },
      }),

      setTableConfig: (config) => set({
        tableConfig: { ...get().tableConfig, ...config },
      }),

      setLiveStats: (stats) => set({
        liveStats: { ...get().liveStats, ...stats },
      }),

      startRefresh: () => set({
        liveStats: { ...get().liveStats, isRefreshing: true },
      }),

      endRefresh: () => set({
        liveStats: { ...get().liveStats, isRefreshing: false },
      }),

      toggleItemSelection: (id) => {
        const current = get().selectedItems;
        set({
          selectedItems: current.includes(id)
            ? current.filter((i) => i !== id)
            : [...current, id],
        });
      },

      selectAllItems: (ids) => set({ selectedItems: ids }),
      clearSelection: () => set({ selectedItems: [] }),
      setGlobalSearch: (search) => set({ globalSearch: search }),
      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
    }),
    {
      name: 'bmo-validation-bc-command-center',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        autoRefresh: state.autoRefresh,
        tableConfig: state.tableConfig,
      }),
    }
  )
);

