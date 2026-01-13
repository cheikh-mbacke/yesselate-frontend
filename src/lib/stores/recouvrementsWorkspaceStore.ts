/**
 * ====================================================================
 * STORE: Recouvrements Workspace
 * ====================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RecouvrementTabType = 
  | 'inbox'          // Liste des créances
  | 'creance'        // Détail créance
  | 'relances'       // Suivi relances
  | 'contentieux'    // Dossiers contentieux
  | 'statistiques';  // Dashboard

export interface RecouvrementTab {
  id: string;
  type: RecouvrementTabType;
  title: string;
  icon: string;
  data: Record<string, unknown>;
  closable?: boolean;
}

export interface RecouvrementFilter {
  status?: 'pending' | 'in_progress' | 'paid' | 'litige' | 'irrecoverable';
  type?: string;
  client?: string;
  minAmount?: number;
  maxAmount?: number;
  overdueOnly?: boolean;
  search?: string;
}

interface RecouvrementsWorkspaceState {
  tabs: RecouvrementTab[];
  activeTabId: string | null;
  selectedIds: Set<string>;
  currentFilter: RecouvrementFilter;
  watchlist: string[];
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;

  openTab: (tab: Omit<RecouvrementTab, 'id'> & { id?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilter: (filter: Partial<RecouvrementFilter>) => void;
  clearFilter: () => void;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  reset: () => void;
}

const defaultTabs: RecouvrementTab[] = [
  { id: 'inbox:all', type: 'inbox', title: 'Toutes les créances', icon: '💰', data: { queue: 'all' }, closable: false },
];

export const useRecouvrementsWorkspaceStore = create<RecouvrementsWorkspaceState>()(
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
    { name: 'recouvrements:workspace', partialize: (state) => ({ watchlist: state.watchlist }) }
  )
);

