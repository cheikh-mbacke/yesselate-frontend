/**
 * Store Zustand pour le workspace Arbitrages
 * ============================================
 * 
 * Gère les onglets + l'état UI de chaque onglet (section, sous-section, explorer).
 */

import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

/** Types d'onglets supportés dans le workspace arbitrages */
export type ArbitrageTabType = 'inbox' | 'arbitrage' | 'bureau' | 'report' | 'wizard';

/** État UI d'un onglet arbitrage (arborescence interne) */
export type ArbitrageUIState = {
  section:
    | 'contexte'
    | 'options'
    | 'parties'
    | 'documents'
    | 'deliberation'
    | 'decision'
    | 'audit'
    | 'timeline';
  sub?:
    | 'background'
    | 'risks'
    | 'financial'
    | 'linked'
    | 'ai_options'
    | 'pros_cons'
    | 'impact'
    | 'decideur'
    | 'demandeur'
    | 'defendeur'
    | 'experts'
    | 'raci'
    | 'attachments'
    | 'briefings'
    | 'notes'
    | 'votes'
    | 'conference'
    | 'resolution'
    | 'motif'
    | 'hashchain'
    | 'notifications'
    | 'exports';
  explorerOpen?: boolean;
  viewTab?: 'contexte' | 'options' | 'parties' | 'documents';
};

/** État UI d'un onglet bureau */
export type BureauUIState = {
  section: 'overview' | 'agents' | 'charge' | 'budget' | 'goulots' | 'raci' | 'history';
  sub?: 'details' | 'comparison' | 'trends';
  explorerOpen?: boolean;
};

export type ArbitrageTab = {
  id: string;
  type: ArbitrageTabType;
  title: string;
  icon?: string;
  data?: {
    queue?: string;
    arbitrageId?: string;
    arbitrageType?: 'vivant' | 'simple';
    bureauCode?: string;
    action?: string;
    [key: string]: unknown;
  };
  isDirty?: boolean;
  createdAt: number;
  /** État UI interne de l'onglet */
  ui?: ArbitrageUIState | BureauUIState;
};

type OpenTabInput = Omit<ArbitrageTab, 'createdAt' | 'ui'>;

interface ArbitragesWorkspaceState {
  tabs: ArbitrageTab[];
  activeTabId: string | null;
  
  // Actions
  openTab: (tab: OpenTabInput) => void;
  setActiveTab: (id: string) => void;
  closeTab: (id: string) => void;
  updateTab: (id: string, patch: Partial<ArbitrageTab>) => void;
  closeOthers: (id: string) => void;
  closeAll: () => void;
  
  // UI State par onglet
  setTabUI: (tabId: string, uiPatch: Partial<ArbitrageUIState | BureauUIState>) => void;
  getTabUI: (tabId: string) => ArbitrageUIState | BureauUIState | undefined;
}

// ============================================
// DEFAULT UI STATES
// ============================================

const DEFAULT_ARBITRAGE_UI_STATE: ArbitrageUIState = {
  section: 'contexte',
  sub: undefined,
  explorerOpen: true,
  viewTab: 'contexte',
};

const DEFAULT_BUREAU_UI_STATE: BureauUIState = {
  section: 'overview',
  sub: undefined,
  explorerOpen: true,
};

// ============================================
// STORE
// ============================================

export const useArbitragesWorkspaceStore = create<ArbitragesWorkspaceState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (input) => {
    set((state) => {
      const existing = state.tabs.find((t) => t.id === input.id);
      if (existing) {
        return { activeTabId: input.id };
      }
      
      let defaultUI: ArbitrageUIState | BureauUIState | undefined;
      
      if (input.type === 'arbitrage') {
        defaultUI = { ...DEFAULT_ARBITRAGE_UI_STATE };
      } else if (input.type === 'bureau') {
        defaultUI = { ...DEFAULT_BUREAU_UI_STATE };
      }
      
      const newTab: ArbitrageTab = {
        ...input,
        createdAt: Date.now(),
        ui: defaultUI,
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
  // UI State par onglet
  // ================================
  
  setTabUI: (tabId, uiPatch) => {
    set((state) => ({
      tabs: state.tabs.map((t) => {
        if (t.id !== tabId) return t;
        
        const tab = state.tabs.find((x) => x.id === tabId);
        let defaultUI: ArbitrageUIState | BureauUIState;
        
        if (tab?.type === 'bureau') {
          defaultUI = DEFAULT_BUREAU_UI_STATE;
        } else {
          defaultUI = DEFAULT_ARBITRAGE_UI_STATE;
        }
        
        return {
          ...t,
          ui: {
            ...(t.ui ?? defaultUI),
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
}));


