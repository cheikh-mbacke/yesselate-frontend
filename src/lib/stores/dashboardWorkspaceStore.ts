/**
 * ====================================================================
 * STORE: Dashboard Workspace
 * ====================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DashboardTabType = 
  | 'overview'       // Vue d'ensemble
  | 'kpis'           // KPIs détaillés
  | 'activities'     // Activités récentes
  | 'performance';   // Performance bureaux

export interface DashboardTab {
  id: string;
  type: DashboardTabType;
  title: string;
  icon: string;
  data: Record<string, unknown>;
  closable?: boolean;
}

interface DashboardWorkspaceState {
  tabs: DashboardTab[];
  activeTabId: string | null;
  commandPaletteOpen: boolean;
  refreshInterval: number;

  openTab: (tab: Omit<DashboardTab, 'id'> & { id?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  reset: () => void;
}

const defaultTabs: DashboardTab[] = [
  { id: 'overview:main', type: 'overview', title: 'Vue d\'ensemble', icon: '📊', data: {}, closable: false },
];

export const useDashboardWorkspaceStore = create<DashboardWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: defaultTabs,
      activeTabId: 'overview:main',
      commandPaletteOpen: false,
      refreshInterval: 60000,

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
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setRefreshInterval: (interval) => set({ refreshInterval: interval }),
      reset: () => set({ tabs: defaultTabs, activeTabId: 'overview:main', commandPaletteOpen: false }),
    }),
    { name: 'dashboard:workspace' }
  )
);

