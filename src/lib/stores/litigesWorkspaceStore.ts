/**
 * ====================================================================
 * STORE: Litiges Workspace
 * ====================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LitigeTabType = 
  | 'inbox'          // Liste des litiges
  | 'litige'         // Détail d'un litige
  | 'calendrier'     // Calendrier audiences
  | 'risques'        // Analyse des risques
  | 'negociation'    // Suivi négociations
  | 'audit';         // Historique décisions

export interface LitigeTab {
  id: string;
  type: LitigeTabType;
  title: string;
  icon: string;
  data: Record<string, unknown>;
  closable?: boolean;
}

export interface LitigeFilter {
  status?: 'active' | 'closed' | 'negotiation' | 'judgment';
  type?: string;
  jurisdiction?: string;
  minExposure?: number;
  maxExposure?: number;
  search?: string;
}

interface LitigesWorkspaceState {
  tabs: LitigeTab[];
  activeTabId: string | null;
  selectedIds: Set<string>;
  currentFilter: LitigeFilter;
  watchlist: string[];
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;

  openTab: (tab: Omit<LitigeTab, 'id'> & { id?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilter: (filter: Partial<LitigeFilter>) => void;
  clearFilter: () => void;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  reset: () => void;
}

const defaultTabs: LitigeTab[] = [
  { id: 'inbox:all', type: 'inbox', title: 'Tous les litiges', icon: '⚖️', data: { queue: 'all' }, closable: false },
];

export const useLitigesWorkspaceStore = create<LitigesWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: defaultTabs,
      activeTabId: 'inbox:all',
      selectedIds: new Set(),
      currentFilter: {},
      watchlist: [],
      commandPaletteOpen: false,
      statsModalOpen: false,

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
      reset: () => set({ tabs: defaultTabs, activeTabId: 'inbox:all', selectedIds: new Set(), currentFilter: {}, commandPaletteOpen: false, statsModalOpen: false }),
    }),
    { name: 'litiges:workspace', partialize: (state) => ({ watchlist: state.watchlist }) }
  )
);

