/**
 * ====================================================================
 * STORE: Arbitrages & Goulots Workspace - Pattern Pilotage
 * ====================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ArbitragesTabType = 
  | 'inbox'          // Liste des arbitrages
  | 'detail'         // Détail d'un arbitrage
  | 'goulots'        // Goulots d'étranglement
  | 'conflits'       // Conflits inter-bureaux
  | 'timeline'       // Timeline des décisions
  | 'analytics';     // Dashboard analytique

export interface ArbitragesTab {
  id: string;
  type: ArbitragesTabType;
  title: string;
  icon: string;
  data: Record<string, unknown>;
  closable?: boolean;
}

export interface ArbitragesFilter {
  status?: 'pending' | 'in_progress' | 'resolved' | 'escalated';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  type?: 'goulot' | 'conflit' | 'arbitrage' | 'decision';
  bureaux?: string[];
  search?: string;
}

interface ArbitragesWorkspaceState {
  tabs: ArbitragesTab[];
  activeTabId: string | null;
  selectedIds: Set<string>;
  currentFilter: ArbitragesFilter;
  watchlist: string[];
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;
  exportModalOpen: boolean;
  decisionModalOpen: boolean;
  directionPanelOpen: boolean;
  viewMode: 'dashboard' | 'workspace';

  openTab: (tab: Omit<ArbitragesTab, 'id'> & { id?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilter: (filter: Partial<ArbitragesFilter>) => void;
  clearFilter: () => void;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setDecisionModalOpen: (open: boolean) => void;
  setDirectionPanelOpen: (open: boolean) => void;
  setViewMode: (mode: 'dashboard' | 'workspace') => void;
  reset: () => void;
}

const defaultTabs: ArbitragesTab[] = [
  { id: 'inbox:all', type: 'inbox', title: 'Tous les arbitrages', icon: '⚖️', data: { queue: 'all' }, closable: false },
];

export const useArbitragesWorkspaceStore = create<ArbitragesWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: defaultTabs,
      activeTabId: 'inbox:all',
      selectedIds: new Set(),
      currentFilter: {},
      watchlist: [],
      commandPaletteOpen: false,
      statsModalOpen: false,
      exportModalOpen: false,
      decisionModalOpen: false,
      directionPanelOpen: false,
      viewMode: 'dashboard',

      openTab: (tab) => {
        const id = tab.id || `${tab.type}:${Date.now()}`;
        if (get().tabs.find(t => t.id === id)) { set({ activeTabId: id }); return; }
        set((state) => ({ tabs: [...state.tabs, { ...tab, id, closable: tab.closable ?? true }], activeTabId: id }));
      },

      closeTab: (tabId) => {
        const { tabs, activeTabId } = get();
        const tab = tabs.find(t => t.id === tabId);
        if (!tab || tab.closable === false) return;
        const newTabs = tabs.filter(t => t.id !== tabId);
        let newActiveId = activeTabId;
        if (activeTabId === tabId) {
          const idx = tabs.findIndex(t => t.id === tabId);
          newActiveId = newTabs[Math.min(idx, newTabs.length - 1)]?.id || null;
        }
        set({ tabs: newTabs, activeTabId: newActiveId });
      },

      setActiveTab: (tabId) => { if (get().tabs.find(t => t.id === tabId)) set({ activeTabId: tabId }); },
      toggleSelected: (id) => set((state) => { const s = new Set(state.selectedIds); s.has(id) ? s.delete(id) : s.add(id); return { selectedIds: s }; }),
      selectAll: (ids) => set({ selectedIds: new Set(ids) }),
      clearSelection: () => set({ selectedIds: new Set() }),
      setFilter: (filter) => set((state) => ({ currentFilter: { ...state.currentFilter, ...filter } })),
      clearFilter: () => set({ currentFilter: {} }),
      addToWatchlist: (id) => set((state) => ({ watchlist: state.watchlist.includes(id) ? state.watchlist : [...state.watchlist, id] })),
      removeFromWatchlist: (id) => set((state) => ({ watchlist: state.watchlist.filter(wid => wid !== id) })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setStatsModalOpen: (open) => set({ statsModalOpen: open }),
      setExportModalOpen: (open) => set({ exportModalOpen: open }),
      setDecisionModalOpen: (open) => set({ decisionModalOpen: open }),
      setDirectionPanelOpen: (open) => set({ directionPanelOpen: open }),
      setViewMode: (mode) => set({ viewMode: mode }),
      reset: () => set({ tabs: defaultTabs, activeTabId: 'inbox:all', selectedIds: new Set(), currentFilter: {}, commandPaletteOpen: false }),
    }),
    { name: 'arbitrages:workspace', partialize: (state) => ({ watchlist: state.watchlist, viewMode: state.viewMode }) }
  )
);
