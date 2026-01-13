/**
 * ====================================================================
 * STORE: Validation Paiements Workspace
 * ====================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PaiementTabType = 
  | 'inbox'           // Liste des paiements à valider
  | 'paiement'        // Détail d'un paiement
  | 'echeancier'      // Échéancier des paiements
  | 'tresorerie'      // Vue trésorerie
  | 'fournisseurs'    // Par fournisseur
  | 'audit'           // Historique des décisions
  | 'analytics';      // Statistiques

export interface PaiementTab {
  id: string;
  type: PaiementTabType;
  title: string;
  icon: string;
  data: Record<string, unknown>;
  closable?: boolean;
}

export interface PaiementDecisionEntry {
  id: string;
  at: string;
  action: 'validation' | 'rejet' | 'report' | 'blocage' | 'escalation';
  paiementId: string;
  paiementRef: string;
  fournisseur: string;
  montant: number;
  userId: string;
  userName: string;
  userRole: string;
  details: string;
  hash: string;
  batchId?: string;
}

export interface PaiementFilter {
  status?: 'pending' | 'validated' | 'rejected' | 'scheduled' | 'paid' | 'blocked';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  fournisseur?: string;
  minMontant?: number;
  maxMontant?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface PaiementsWorkspaceState {
  tabs: PaiementTab[];
  activeTabId: string | null;
  selectedIds: Set<string>;
  currentFilter: PaiementFilter;
  savedFilters: { id: string; name: string; filter: PaiementFilter }[];
  watchlist: string[];
  decisionRegister: PaiementDecisionEntry[];
  lastDecisionHash: string | null;
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;

  openTab: (tab: Omit<PaiementTab, 'id'> & { id?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilter: (filter: Partial<PaiementFilter>) => void;
  clearFilter: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (filterId: string) => void;
  deleteFilter: (filterId: string) => void;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  addDecision: (entry: Omit<PaiementDecisionEntry, 'id'>) => void;
  clearRegister: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  reset: () => void;
}

const defaultTabs: PaiementTab[] = [
  {
    id: 'inbox:all',
    type: 'inbox',
    title: 'À valider',
    icon: '📋',
    data: { queue: 'pending' },
    closable: false,
  },
];

export const usePaiementsWorkspaceStore = create<PaiementsWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: defaultTabs,
      activeTabId: 'inbox:all',
      selectedIds: new Set(),
      currentFilter: {},
      savedFilters: [],
      watchlist: [],
      decisionRegister: [],
      lastDecisionHash: null,
      commandPaletteOpen: false,
      statsModalOpen: false,

      openTab: (tab) => {
        const id = tab.id || `${tab.type}:${Date.now()}`;
        const existingTab = get().tabs.find(t => t.id === id);
        if (existingTab) {
          set({ activeTabId: id });
          return;
        }
        const newTab: PaiementTab = { ...tab, id, closable: tab.closable ?? true };
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
        if (get().tabs.find(t => t.id === tabId)) {
          set({ activeTabId: tabId });
        }
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

      saveFilter: (name) => {
        const { currentFilter, savedFilters } = get();
        const id = `filter-${Date.now()}`;
        set({ savedFilters: [...savedFilters, { id, name, filter: currentFilter }] });
      },

      loadFilter: (filterId) => {
        const saved = get().savedFilters.find(f => f.id === filterId);
        if (saved) set({ currentFilter: saved.filter });
      },

      deleteFilter: (filterId) => {
        set((state) => ({ savedFilters: state.savedFilters.filter(f => f.id !== filterId) }));
      },

      addToWatchlist: (id) => {
        set((state) => ({
          watchlist: state.watchlist.includes(id) ? state.watchlist : [...state.watchlist, id],
        }));
      },

      removeFromWatchlist: (id) => {
        set((state) => ({ watchlist: state.watchlist.filter(wid => wid !== id) }));
      },

      addDecision: (entry) => {
        const id = `DEC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({
          decisionRegister: [{ ...entry, id }, ...state.decisionRegister].slice(0, 500),
          lastDecisionHash: entry.hash,
        }));
      },

      clearRegister: () => set({ decisionRegister: [], lastDecisionHash: null }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setStatsModalOpen: (open) => set({ statsModalOpen: open }),

      reset: () => {
        set({
          tabs: defaultTabs,
          activeTabId: 'inbox:all',
          selectedIds: new Set(),
          currentFilter: {},
          commandPaletteOpen: false,
          statsModalOpen: false,
        });
      },
    }),
    {
      name: 'paiements:workspace',
      partialize: (state) => ({
        savedFilters: state.savedFilters,
        watchlist: state.watchlist,
        decisionRegister: state.decisionRegister,
      }),
    }
  )
);

