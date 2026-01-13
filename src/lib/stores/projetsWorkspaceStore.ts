/**
 * ====================================================================
 * STORE: Projets en Cours Workspace
 * ====================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProjetTabType = 
  | 'inbox'          // Liste des projets
  | 'projet'         // Détail d'un projet
  | 'kanban'         // Vue Kanban
  | 'gantt'          // Vue Gantt
  | 'budget'         // Vue budget
  | 'equipe'         // Vue équipe
  | 'risques'        // Vue risques
  | 'audit';         // Historique

export interface ProjetTab {
  id: string;
  type: ProjetTabType;
  title: string;
  icon: string;
  data: Record<string, unknown>;
  closable?: boolean;
}

export interface ProjetFilter {
  status?: 'active' | 'completed' | 'blocked' | 'pending';
  bureau?: string;
  client?: string;
  minProgress?: number;
  maxProgress?: number;
  search?: string;
}

interface ProjetsWorkspaceState {
  tabs: ProjetTab[];
  activeTabId: string | null;
  selectedIds: Set<string>;
  currentFilter: ProjetFilter;
  savedFilters: { id: string; name: string; filter: ProjetFilter }[];
  watchlist: string[];
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;

  openTab: (tab: Omit<ProjetTab, 'id'> & { id?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilter: (filter: Partial<ProjetFilter>) => void;
  clearFilter: () => void;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  reset: () => void;
}

const defaultTabs: ProjetTab[] = [
  { id: 'inbox:all', type: 'inbox', title: 'Tous les projets', icon: '🏗️', data: { queue: 'all' }, closable: false },
];

export const useProjetsWorkspaceStore = create<ProjetsWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: defaultTabs,
      activeTabId: 'inbox:all',
      selectedIds: new Set(),
      currentFilter: {},
      savedFilters: [],
      watchlist: [],
      commandPaletteOpen: false,
      statsModalOpen: false,

      openTab: (tab) => {
        const id = tab.id || `${tab.type}:${Date.now()}`;
        const existingTab = get().tabs.find(t => t.id === id);
        if (existingTab) { set({ activeTabId: id }); return; }
        const newTab: ProjetTab = { ...tab, id, closable: tab.closable ?? true };
        set((state) => ({ tabs: [...state.tabs, newTab], activeTabId: id }));
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

      setActiveTab: (tabId) => {
        if (get().tabs.find(t => t.id === tabId)) set({ activeTabId: tabId });
      },

      toggleSelected: (id) => {
        set((state) => {
          const newSet = new Set(state.selectedIds);
          newSet.has(id) ? newSet.delete(id) : newSet.add(id);
          return { selectedIds: newSet };
        });
      },

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
    {
      name: 'projets:workspace',
      partialize: (state) => ({ savedFilters: state.savedFilters, watchlist: state.watchlist }),
    }
  )
);

