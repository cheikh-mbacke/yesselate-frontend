/**
 * ====================================================================
 * STORE: Depenses Workspace
 * ====================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DepenseTabType = 
  | 'inbox'          // Liste des dépenses
  | 'depense'        // Détail dépense
  | 'budgets'        // Suivi budgets
  | 'categories'     // Par catégorie
  | 'validation';    // En attente validation

export interface DepenseTab {
  id: string;
  type: DepenseTabType;
  title: string;
  icon: string;
  data: Record<string, unknown>;
  closable?: boolean;
}

export interface DepenseFilter {
  status?: 'pending' | 'approved' | 'rejected' | 'paid';
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface DepensesWorkspaceState {
  tabs: DepenseTab[];
  activeTabId: string | null;
  selectedIds: Set<string>;
  currentFilter: DepenseFilter;
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;

  openTab: (tab: Omit<DepenseTab, 'id'> & { id?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilter: (filter: Partial<DepenseFilter>) => void;
  clearFilter: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  reset: () => void;
}

const defaultTabs: DepenseTab[] = [
  { id: 'inbox:all', type: 'inbox', title: 'Toutes les dépenses', icon: '💸', data: { queue: 'all' }, closable: false },
];

export const useDepensesWorkspaceStore = create<DepensesWorkspaceState>()(
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
    { name: 'depenses:workspace' }
  )
);

