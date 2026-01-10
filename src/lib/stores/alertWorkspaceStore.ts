/**
 * Store Zustand pour le workspace Alertes & Risques
 * =================================================
 * 
 * Gère les onglets + l'état UI de chaque onglet (section, sous-section, explorer).
 */

import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

/** Types d'onglets supportés dans le workspace alertes */
export type AlertTabType = 'inbox' | 'alert' | 'heatmap' | 'report' | 'analytics';

/** État UI d'un onglet alerte (arborescence interne) */
export type AlertUIState = {
  section:
    | 'overview'
    | 'details'
    | 'timeline'
    | 'impact'
    | 'actions'
    | 'related'
    | 'audit';
  sub?:
    | 'context'
    | 'blocking'
    | 'affected'
    | 'responsible'
    | 'escalation'
    | 'resolution'
    | 'history'
    | 'logs'
    | 'metrics'
    | 'analysis';
  explorerOpen?: boolean;
};

export type AlertTab = {
  id: string;
  type: AlertTabType;
  title: string;
  icon?: string;
  data?: {
    queue?: string;
    alertId?: string;
    severity?: string;
    type?: string;
    bureau?: string;
    [key: string]: unknown;
  };
  isDirty?: boolean;
  createdAt: number;
  /** État UI interne de l'onglet (pour type 'alert') */
  ui?: AlertUIState;
};

type OpenTabInput = Omit<AlertTab, 'createdAt' | 'ui'>;

interface AlertWorkspaceState {
  tabs: AlertTab[];
  activeTabId: string | null;
  
  // Actions
  openTab: (tab: OpenTabInput) => void;
  setActiveTab: (id: string) => void;
  closeTab: (id: string) => void;
  updateTab: (id: string, patch: Partial<AlertTab>) => void;
  closeOthers: (id: string) => void;
  closeAll: () => void;
  
  // UI State par onglet
  setTabUI: (tabId: string, uiPatch: Partial<AlertUIState>) => void;
  getTabUI: (tabId: string) => AlertUIState | undefined;
}

// ============================================
// DEFAULT UI STATE
// ============================================

const DEFAULT_UI_STATE: AlertUIState = {
  section: 'overview',
  sub: undefined,
  explorerOpen: true,
};

// ============================================
// STORE
// ============================================

export const useAlertWorkspaceStore = create<AlertWorkspaceState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (input) => {
    set((state) => {
      const existing = state.tabs.find((t) => t.id === input.id);
      if (existing) {
        return { activeTabId: input.id };
      }
      
      const newTab: AlertTab = {
        ...input,
        createdAt: Date.now(),
        ui: input.type === 'alert' ? { ...DEFAULT_UI_STATE } : undefined,
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

