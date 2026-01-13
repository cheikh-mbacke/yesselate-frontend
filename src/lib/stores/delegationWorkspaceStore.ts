/**
 * Store Zustand pour le workspace Délégations
 * ============================================
 * 
 * Gère les onglets + l'état UI de chaque onglet (section, sous-section, explorer).
 */

import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

/** Types d'onglets supportés dans le workspace délégations */
export type DelegationTabType = 'inbox' | 'delegation' | 'report' | 'wizard';

/** État UI d'un onglet délégation (arborescence interne) */
export type DelegationUIState = {
  section:
    | 'overview'
    | 'scope'
    | 'limits'
    | 'actors'
    | 'commitments'
    | 'audit'
    | 'simulator';
  sub?:
    | 'projects'
    | 'bureaux'
    | 'suppliers'
    | 'categories'
    | 'thresholds'
    | 'dual'
    | 'exclusions'
    | 'exceptions'
    | 'raci'
    | 'approvers'
    | 'controllers'
    | 'notifications'
    | 'timeline'
    | 'hashchain'
    | 'exports'
    | 'anomalies'
    | 'test'
    | 'scenarios';
  explorerOpen?: boolean;
};

export type DelegationTab = {
  id: string;
  type: DelegationTabType;
  title: string;
  icon?: string;
  data?: {
    queue?: string;
    delegationId?: string;
    action?: string;
    [key: string]: unknown;
  };
  isDirty?: boolean;
  createdAt: number;
  /** État UI interne de l'onglet (pour type 'delegation') */
  ui?: DelegationUIState;
};

type OpenTabInput = Omit<DelegationTab, 'createdAt' | 'ui'>;

interface DelegationWorkspaceState {
  tabs: DelegationTab[];
  activeTabId: string | null;
  
  // Actions
  openTab: (tab: OpenTabInput) => void;
  setActiveTab: (id: string) => void;
  closeTab: (id: string) => void;
  updateTab: (id: string, patch: Partial<DelegationTab>) => void;
  closeOthers: (id: string) => void;
  closeAll: () => void;
  
  // UI State par onglet
  setTabUI: (tabId: string, uiPatch: Partial<DelegationUIState>) => void;
  getTabUI: (tabId: string) => DelegationUIState | undefined;
}

// ============================================
// DEFAULT UI STATE
// ============================================

const DEFAULT_UI_STATE: DelegationUIState = {
  section: 'overview',
  sub: undefined,
  explorerOpen: true,
};

// ============================================
// STORE
// ============================================

export const useDelegationWorkspaceStore = create<DelegationWorkspaceState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (input) => {
    set((state) => {
      const existing = state.tabs.find((t) => t.id === input.id);
      if (existing) {
        return { activeTabId: input.id };
      }
      
      const newTab: DelegationTab = {
        ...input,
        createdAt: Date.now(),
        ui: input.type === 'delegation' ? { ...DEFAULT_UI_STATE } : undefined,
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
}));
