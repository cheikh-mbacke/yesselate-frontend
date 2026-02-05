/**
 * ====================================================================
 * STORE: Validation Contrats Workspace
 * ====================================================================
 * 
 * Gestion de l'état du workspace de validation des contrats.
 * Pattern identique à blockedWorkspaceStore pour cohérence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ================================
// Types
// ================================

export type ContratTabType = 
  | 'inbox'           // Liste des contrats à valider
  | 'contrat'         // Détail d'un contrat
  | 'comparison'      // Comparaison avant/après
  | 'timeline'        // Historique du contrat
  | 'negociation'     // Workflow de négociation
  | 'validation'      // Workflow de validation
  | 'audit'           // Historique des décisions
  | 'analytics';      // Statistiques

export interface ContratTab {
  id: string;
  type: ContratTabType;
  title: string;
  icon: string;
  data: Record<string, unknown>;
  closable?: boolean;
}

export interface ContratDecisionEntry {
  id: string;
  at: string;
  action: 'validation' | 'rejet' | 'negociation' | 'escalation' | 'audit';
  contratId: string;
  contratTitle: string;
  fournisseur: string;
  montant: number;
  userId: string;
  userName: string;
  userRole: string;
  details: string;
  hash: string;
  batchId?: string;
}

export interface ContratFilter {
  status?: 'pending' | 'validated' | 'rejected' | 'negotiation' | 'expired';
  type?: string;
  fournisseur?: string;
  minMontant?: number;
  maxMontant?: number;
  dateFrom?: string;
  dateTo?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  search?: string;
}

interface ContratsWorkspaceState {
  // Tabs
  tabs: ContratTab[];
  activeTabId: string | null;
  
  // Selection
  selectedIds: Set<string>;
  
  // Filters
  currentFilter: ContratFilter;
  savedFilters: { id: string; name: string; filter: ContratFilter }[];
  
  // Favorites
  watchlist: string[];
  
  // Decision register
  decisionRegister: ContratDecisionEntry[];
  lastDecisionHash: string | null;
  
  // UI State
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;
  
  // Actions
  openTab: (tab: Omit<ContratTab, 'id'> & { id?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  
  setFilter: (filter: Partial<ContratFilter>) => void;
  clearFilter: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (filterId: string) => void;
  deleteFilter: (filterId: string) => void;
  
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  
  addDecision: (entry: Omit<ContratDecisionEntry, 'id'>) => void;
  clearRegister: () => void;
  
  setCommandPaletteOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  
  reset: () => void;
}

// ================================
// Initial State
// ================================

const defaultTabs: ContratTab[] = [
  {
    id: 'inbox:all',
    type: 'inbox',
    title: 'À valider',
    icon: '📋',
    data: { queue: 'pending' },
    closable: false,
  },
];

// ================================
// Store
// ================================

export const useContratsWorkspaceStore = create<ContratsWorkspaceState>()(
  persist(
    (set, get) => ({
      // Initial state
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

      // Tab actions
      openTab: (tab) => {
        const id = tab.id || `${tab.type}:${Date.now()}`;
        const existingTab = get().tabs.find(t => t.id === id);
        
        if (existingTab) {
          set({ activeTabId: id });
          return;
        }

        const newTab: ContratTab = {
          ...tab,
          id,
          closable: tab.closable ?? true,
        };

        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: id,
        }));
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

      // Selection
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

      // Filters
      setFilter: (filter) => {
        set((state) => ({
          currentFilter: { ...state.currentFilter, ...filter },
        }));
      },

      clearFilter: () => {
        set({ currentFilter: {} });
      },

      saveFilter: (name) => {
        const { currentFilter, savedFilters } = get();
        const id = `filter-${Date.now()}`;
        set({
          savedFilters: [...savedFilters, { id, name, filter: currentFilter }],
        });
      },

      loadFilter: (filterId) => {
        const saved = get().savedFilters.find(f => f.id === filterId);
        if (saved) {
          set({ currentFilter: saved.filter });
        }
      },

      deleteFilter: (filterId) => {
        set((state) => ({
          savedFilters: state.savedFilters.filter(f => f.id !== filterId),
        }));
      },

      // Watchlist
      addToWatchlist: (id) => {
        set((state) => ({
          watchlist: state.watchlist.includes(id) 
            ? state.watchlist 
            : [...state.watchlist, id],
        }));
      },

      removeFromWatchlist: (id) => {
        set((state) => ({
          watchlist: state.watchlist.filter(wid => wid !== id),
        }));
      },

      // Decision register
      addDecision: (entry) => {
        const id = `DEC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({
          decisionRegister: [{ ...entry, id }, ...state.decisionRegister].slice(0, 500),
          lastDecisionHash: entry.hash,
        }));
      },

      clearRegister: () => {
        set({ decisionRegister: [], lastDecisionHash: null });
      },

      // UI
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setStatsModalOpen: (open) => set({ statsModalOpen: open }),

      // Reset
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
      name: 'contrats:workspace',
      partialize: (state) => ({
        savedFilters: state.savedFilters,
        watchlist: state.watchlist,
        decisionRegister: state.decisionRegister,
      }),
    }
  )
);

