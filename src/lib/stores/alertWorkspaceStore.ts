/**
 * Store Zustand pour le workspace Alertes & Risques
 * =================================================
 * 
 * Gère les onglets + l'état UI + sélection + filtres.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

/** Types d'onglets supportés dans le workspace alertes */
export type AlertTabType = 'inbox' | 'alert' | 'heatmap' | 'report' | 'analytics';

/** État UI d'un onglet alerte (arborescence interne) */
export type AlertUIState = {
  section:
    | 'overview'
    | 'details'
    | 'timeline'
    | 'impact'
    | 'actions'
    | 'related'
    | 'audit';
  sub?:
    | 'context'
    | 'blocking'
    | 'affected'
    | 'responsible'
    | 'escalation'
    | 'resolution'
    | 'history'
    | 'logs'
    | 'metrics'
    | 'analysis';
  explorerOpen?: boolean;
};

export type AlertTab = {
  id: string;
  type: AlertTabType;
  title: string;
  icon?: string;
  data?: {
    queue?: string;
    alertId?: string;
    severity?: string;
    type?: string;
    bureau?: string;
    [key: string]: unknown;
  };
  isDirty?: boolean;
  createdAt: number;
  /** État UI interne de l'onglet (pour type 'alert') */
  ui?: AlertUIState;
};

/** Filtres des alertes */
export interface AlertFilter {
  status?: string | string[];
  severity?: string | string[];
  queue?: string;
  assignedTo?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

type OpenTabInput = Omit<AlertTab, 'createdAt' | 'ui'>;

interface AlertWorkspaceState {
  tabs: AlertTab[];
  activeTabId: string | null;
  
  // Sélection multiple
  selectedIds: Set<string>;
  
  // Filtres actifs
  currentFilter: AlertFilter;
  
  // Watchlist (alertes suivies)
  watchlist: string[];
  
  // UI State
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;
  directionPanelOpen: boolean;
  
  // Actions - Tabs
  openTab: (tab: OpenTabInput) => void;
  setActiveTab: (id: string) => void;
  closeTab: (id: string) => void;
  updateTab: (id: string, patch: Partial<AlertTab>) => void;
  closeOthers: (id: string) => void;
  closeAll: () => void;
  
  // Actions - Sélection
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  
  // Actions - Filtres
  setFilter: (filter: Partial<AlertFilter>) => void;
  clearFilter: () => void;
  
  // Actions - Watchlist
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  isWatched: (id: string) => boolean;
  
  // Actions - UI State
  setCommandPaletteOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  setDirectionPanelOpen: (open: boolean) => void;
  
  // UI State par onglet
  setTabUI: (tabId: string, uiPatch: Partial<AlertUIState>) => void;
  getTabUI: (tabId: string) => AlertUIState | undefined;
  
  // Reset
  reset: () => void;
}

// ============================================
// DEFAULT UI STATE
// ============================================

const DEFAULT_UI_STATE: AlertUIState = {
  section: 'overview',
  sub: undefined,
  explorerOpen: true,
};

const DEFAULT_FILTER: AlertFilter = {};

// ============================================
// STORE
// ============================================

export const useAlertWorkspaceStore = create<AlertWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      selectedIds: new Set(),
      currentFilter: DEFAULT_FILTER,
      watchlist: [],
      commandPaletteOpen: false,
      statsModalOpen: false,
      directionPanelOpen: false,

      // ================================
      // TABS
      // ================================
      
      openTab: (input) => {
        set((state) => {
          const existing = state.tabs.find((t) => t.id === input.id);
          if (existing) {
            return { activeTabId: input.id };
          }
          
          const newTab: AlertTab = {
            ...input,
            createdAt: Date.now(),
            ui: input.type === 'alert' ? { ...DEFAULT_UI_STATE } : undefined,
          };
          
          return {
            tabs: [...state.tabs, newTab],
            activeTabId: input.id,
          };
        });
      },

      setActiveTab: (id) => {
        set({ activeTabId: id });
      },

      closeTab: (id) => {
        set((state) => {
          const idx = state.tabs.findIndex((t) => t.id === id);
          if (idx === -1) return state;

          const newTabs = state.tabs.filter((t) => t.id !== id);
          let newActive = state.activeTabId;

          if (state.activeTabId === id) {
            if (newTabs.length === 0) {
              newActive = null;
            } else if (idx >= newTabs.length) {
              newActive = newTabs[newTabs.length - 1].id;
            } else {
              newActive = newTabs[idx].id;
            }
          }

          return { tabs: newTabs, activeTabId: newActive };
        });
      },

      updateTab: (id, patch) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }));
      },

      closeOthers: (id) => {
        set((state) => ({
          tabs: state.tabs.filter((t) => t.id === id),
          activeTabId: id,
        }));
      },

      closeAll: () => {
        set({ tabs: [], activeTabId: null });
      },

      // ================================
      // SÉLECTION
      // ================================
      
      toggleSelected: (id) => {
        set((state) => {
          const newSet = new Set(state.selectedIds);
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
          return { selectedIds: newSet };
        });
      },

      selectAll: (ids) => {
        set({ selectedIds: new Set(ids) });
      },

      clearSelection: () => {
        set({ selectedIds: new Set() });
      },

      isSelected: (id) => {
        return get().selectedIds.has(id);
      },

      // ================================
      // FILTRES
      // ================================
      
      setFilter: (filter) => {
        set((state) => ({
          currentFilter: { ...state.currentFilter, ...filter },
        }));
      },

      clearFilter: () => {
        set({ currentFilter: DEFAULT_FILTER });
      },

      // ================================
      // WATCHLIST
      // ================================
      
      addToWatchlist: (id) => {
        set((state) => ({
          watchlist: state.watchlist.includes(id) 
            ? state.watchlist 
            : [...state.watchlist, id],
        }));
      },

      removeFromWatchlist: (id) => {
        set((state) => ({
          watchlist: state.watchlist.filter((w) => w !== id),
        }));
      },

      isWatched: (id) => {
        return get().watchlist.includes(id);
      },

      // ================================
      // UI STATE
      // ================================
      
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setStatsModalOpen: (open) => set({ statsModalOpen: open }),
      setDirectionPanelOpen: (open) => set({ directionPanelOpen: open }),

      // ================================
      // UI State par onglet
      // ================================
      
      setTabUI: (tabId, uiPatch) => {
        set((state) => ({
          tabs: state.tabs.map((t) => {
            if (t.id !== tabId) return t;
            return {
              ...t,
              ui: {
                ...(t.ui ?? DEFAULT_UI_STATE),
                ...uiPatch,
              },
            };
          }),
        }));
      },

      getTabUI: (tabId) => {
        const tab = get().tabs.find((t) => t.id === tabId);
        return tab?.ui;
      },

      // ================================
      // RESET
      // ================================
      
      reset: () => {
        set({
          tabs: [],
          activeTabId: null,
          selectedIds: new Set(),
          currentFilter: DEFAULT_FILTER,
          watchlist: [],
          commandPaletteOpen: false,
          statsModalOpen: false,
          directionPanelOpen: false,
        });
      },
    }),
    {
      name: 'alert-workspace-storage',
      partialize: (state) => ({
        watchlist: state.watchlist,
        currentFilter: state.currentFilter,
      }),
    }
  )
);


