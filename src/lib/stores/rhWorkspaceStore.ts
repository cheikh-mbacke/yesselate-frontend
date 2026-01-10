/**
 * Store Zustand pour le workspace Demandes RH
 * ============================================
 * 
 * Gère les onglets + l'état UI de chaque onglet (section, sous-section, explorer).
 * Inspiré du pattern delegationWorkspaceStore mais adapté pour les demandes RH.
 */

import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

/** Types d'onglets supportés dans le workspace RH */
export type RHTabType = 'inbox' | 'demande-rh' | 'report' | 'wizard';

/** État UI d'un onglet demande RH (arborescence interne) */
export type RHUIState = {
  section:
    | 'overview'
    | 'details'
    | 'documents'
    | 'validation'
    | 'substitution'
    | 'audit';
  sub?:
    | 'info'
    | 'dates'
    | 'montant'
    | 'destination'
    | 'files'
    | 'history'
    | 'approvers'
    | 'timeline'
    | 'hashchain'
    | 'impact';
  explorerOpen?: boolean;
};

export type RHTab = {
  id: string;
  type: RHTabType;
  title: string;
  icon?: string;
  data?: {
    queue?: string;
    demandeId?: string;
    action?: string;
    [key: string]: unknown;
  };
  isDirty?: boolean;
  createdAt: number;
  /** État UI interne de l'onglet (pour type 'demande-rh') */
  ui?: RHUIState;
};

type OpenTabInput = Omit<RHTab, 'createdAt' | 'ui'>;

interface RHWorkspaceState {
  tabs: RHTab[];
  activeTabId: string | null;
  
  // Actions
  openTab: (tab: OpenTabInput) => void;
  setActiveTab: (id: string) => void;
  closeTab: (id: string) => void;
  updateTab: (id: string, patch: Partial<RHTab>) => void;
  closeOthers: (id: string) => void;
  closeAll: () => void;
  
  // UI State par onglet
  setTabUI: (tabId: string, uiPatch: Partial<RHUIState>) => void;
  getTabUI: (tabId: string) => RHUIState | undefined;
}

// ============================================
// DEFAULT UI STATE
// ============================================

const DEFAULT_UI_STATE: RHUIState = {
  section: 'overview',
  sub: undefined,
  explorerOpen: true,
};

// ============================================
// STORE
// ============================================

export const useRHWorkspaceStore = create<RHWorkspaceState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (input) => {
    set((state) => {
      const existing = state.tabs.find((t) => t.id === input.id);
      if (existing) {
        return { activeTabId: input.id };
      }
      
      const newTab: RHTab = {
        ...input,
        createdAt: Date.now(),
        ui: input.type === 'demande-rh' ? { ...DEFAULT_UI_STATE } : undefined,
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

