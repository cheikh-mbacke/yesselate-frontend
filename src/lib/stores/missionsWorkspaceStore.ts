/**
 * ====================================================================
 * STORE: Missions Workspace
 * ====================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MissionTabType = 
  | 'inbox'          // Liste des missions
  | 'mission'        // Détail mission
  | 'calendrier'     // Calendrier missions
  | 'frais'          // Frais de mission
  | 'validation';    // En attente validation

export interface MissionTab {
  id: string;
  type: MissionTabType;
  title: string;
  icon: string;
  data: Record<string, unknown>;
  closable?: boolean;
}

export interface MissionFilter {
  status?: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface MissionsWorkspaceState {
  tabs: MissionTab[];
  activeTabId: string | null;
  selectedIds: Set<string>;
  currentFilter: MissionFilter;
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;

  openTab: (tab: Omit<MissionTab, 'id'> & { id?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilter: (filter: Partial<MissionFilter>) => void;
  clearFilter: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  reset: () => void;
}

const defaultTabs: MissionTab[] = [
  { id: 'inbox:all', type: 'inbox', title: 'Toutes les missions', icon: '✈️', data: { queue: 'all' }, closable: false },
];

export const useMissionsWorkspaceStore = create<MissionsWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: defaultTabs,
      activeTabId: 'inbox:all',
      selectedIds: new Set(),
      currentFilter: {},
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
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setStatsModalOpen: (open) => set({ statsModalOpen: open }),
      reset: () => set({ tabs: defaultTabs, activeTabId: 'inbox:all', selectedIds: new Set(), currentFilter: {}, commandPaletteOpen: false, statsModalOpen: false }),
    }),
    { name: 'missions:workspace' }
  )
);

