/**
 * Store Zustand pour le workspace Calendrier
 * ============================================
 * 
 * Gère les onglets + l'état UI de chaque onglet (vue, section, explorer).
 */

import { create } from 'zustand';
import type { CalendarView } from '@/lib/types/calendar.types';

// ============================================
// TYPES
// ============================================

/** Types d'onglets supportés dans le workspace calendrier */
export type CalendarTabType = 'inbox' | 'event' | 'scenario' | 'report' | 'wizard' | 'calendar' | 'viewer';

/** État UI d'un onglet calendrier (arborescence interne) */
export type CalendarUIState = {
  section:
    | 'overview'
    | 'details'
    | 'participants'
    | 'logistics'
    | 'conflicts'
    | 'sla'
    | 'history';
  sub?:
    | 'assignees'
    | 'location'
    | 'equipment'
    | 'budget'
    | 'dependencies'
    | 'timeline'
    | 'resolutions'
    | 'notifications'
    | 'audit'
    | 'hashchain';
  explorerOpen?: boolean;
  view?: CalendarView;
};

export type CalendarTab = {
  id: string;
  type: CalendarTabType;
  title: string;
  icon?: string;
  data?: {
    queue?: string;
    eventId?: string;
    scenarioId?: string;
    view?: CalendarView;
    [key: string]: unknown;
  };
  isDirty?: boolean;
  createdAt: number;
  /** État UI interne de l'onglet (pour type 'event') */
  ui?: CalendarUIState;
};

type OpenTabInput = Omit<CalendarTab, 'createdAt' | 'ui'>;

interface CalendarWorkspaceState {
  tabs: CalendarTab[];
  activeTabId: string | null;
  
  // Actions
  openTab: (tab: OpenTabInput) => void;
  setActiveTab: (id: string) => void;
  closeTab: (id: string) => void;
  updateTab: (id: string, patch: Partial<CalendarTab>) => void;
  closeOthers: (id: string) => void;
  closeAll: () => void;
  
  // UI State par onglet
  setTabUI: (tabId: string, uiPatch: Partial<CalendarUIState>) => void;
  getTabUI: (tabId: string) => CalendarUIState | undefined;
}

// ============================================
// DEFAULT UI STATE
// ============================================

const DEFAULT_UI_STATE: CalendarUIState = {
  section: 'overview',
  sub: undefined,
  explorerOpen: true,
  view: 'week',
};

// ============================================
// STORE
// ============================================

export const useCalendarWorkspaceStore = create<CalendarWorkspaceState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (input) => {
    set((state) => {
      const existing = state.tabs.find((t) => t.id === input.id);
      if (existing) {
        return { activeTabId: input.id };
      }
      
      const newTab: CalendarTab = {
        ...input,
        createdAt: Date.now(),
        ui: input.type === 'event' ? { ...DEFAULT_UI_STATE } : undefined,
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

