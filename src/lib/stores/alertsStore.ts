/**
 * Alerts Store
 * ============
 * 
 * Zustand store for alerts page UI state
 * Manages mode, search, filters, and sidebar state
 */

import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

export type AlertsMode = 'tout' | 'synthese' | 'points-cles' | 'a-traiter';

export type SidebarState = {
  openN2: string | null;
  openN3: string | null;
};

export interface AlertsStore {
  mode: AlertsMode;
  search: string;
  filtersOpen: boolean;
  sidebar: SidebarState;
  setMode: (m: AlertsMode) => void;
  setSearch: (q: string) => void;
  toggleFilters: () => void;
  setSidebar: (s: Partial<SidebarState>) => void;
}

// ============================================
// PERSISTENCE HELPERS
// ============================================

const persisted = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

// ============================================
// STORE
// ============================================

export const useAlertsStore = create<AlertsStore>((set, get) => ({
  mode: read<AlertsMode>('alerts:mode', 'tout'),
  search: '',
  filtersOpen: false,
  sidebar: read<SidebarState>('alerts:sidebar', { openN2: null, openN3: null }),

  setMode: (m) => {
    set({ mode: m });
    persisted('alerts:mode', m);
  },
  
  setSearch: (q) => set({ search: q }),
  
  toggleFilters: () => set({ filtersOpen: !get().filtersOpen }),
  
  setSidebar: (s) => {
    const next = { ...get().sidebar, ...s };
    set({ sidebar: next });
    persisted('alerts:sidebar', next);
  },
}));

