/**
 * ====================================================================
 * STORE: Finances Workspace
 * ====================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FinancesTabType = 
  | 'dashboard'      // Vue d'ensemble
  | 'tresorerie'     // Trésorerie
  | 'budget'         // Budget
  | 'compte'         // Détail compte
  | 'previsions'     // Prévisions
  | 'audit';         // Historique

export interface FinancesTab {
  id: string;
  type: FinancesTabType;
  title: string;
  icon: string;
  data: Record<string, unknown>;
  closable?: boolean;
}

export interface FinancesFilter {
  period?: 'jour' | 'semaine' | 'mois' | 'trimestre' | 'annee';
  type?: string;
  compte?: string;
  search?: string;
}

interface FinancesWorkspaceState {
  tabs: FinancesTab[];
  activeTabId: string | null;
  currentFilter: FinancesFilter;
  commandPaletteOpen: boolean;
  statsModalOpen: boolean;

  // Command Center navigation
  activeCategory: string;
  activeSubCategory: string;
  activeFilter: string | null;
  navigationHistory: string[];
  sidebarCollapsed: boolean;
  kpiBarCollapsed: boolean;
  filtersPanelOpen: boolean;
  notificationsPanelOpen: boolean;
  isFullScreen: boolean;

  openTab: (tab: Omit<FinancesTab, 'id'> & { id?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  setFilter: (filter: Partial<FinancesFilter>) => void;
  clearFilter: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  reset: () => void;

  // Command Center actions
  setActiveCategory: (category: string) => void;
  setActiveSubCategory: (subCategory: string) => void;
  setActiveFilter: (filter: string | null) => void;
  toggleSidebar: () => void;
  toggleKpiBar: () => void;
  setFiltersPanelOpen: (open: boolean) => void;
  setNotificationsPanelOpen: (open: boolean) => void;
  toggleFullScreen: () => void;
  goBack: () => void;
}

const defaultTabs: FinancesTab[] = [
  { id: 'dashboard:main', type: 'dashboard', title: 'Vue d\'ensemble', icon: '📊', data: {}, closable: false },
];

export const useFinancesWorkspaceStore = create<FinancesWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: defaultTabs,
      activeTabId: 'dashboard:main',
      currentFilter: { period: 'mois' },
      commandPaletteOpen: false,
      statsModalOpen: false,

      // Command Center navigation
      activeCategory: 'overview',
      activeSubCategory: 'all',
      activeFilter: null,
      navigationHistory: [],
      sidebarCollapsed: false,
      kpiBarCollapsed: false,
      filtersPanelOpen: false,
      notificationsPanelOpen: false,
      isFullScreen: false,

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
      setFilter: (filter) => set((state) => ({ currentFilter: { ...state.currentFilter, ...filter } })),
      clearFilter: () => set({ currentFilter: { period: 'mois' } }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setStatsModalOpen: (open) => set({ statsModalOpen: open }),
      reset: () => set({ tabs: defaultTabs, activeTabId: 'dashboard:main', currentFilter: { period: 'mois' }, commandPaletteOpen: false, statsModalOpen: false }),

      // Command Center actions
      setActiveCategory: (category) => {
        const { activeCategory, navigationHistory } = get();
        if (category !== activeCategory) {
          set({
            activeCategory: category,
            navigationHistory: [...navigationHistory, activeCategory].slice(-20),
          });
        } else {
          set({ activeCategory: category });
        }
      },
      setActiveSubCategory: (subCategory) => set({ activeSubCategory: subCategory }),
      setActiveFilter: (filter) => set({ activeFilter: filter }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleKpiBar: () => set((state) => ({ kpiBarCollapsed: !state.kpiBarCollapsed })),
      setFiltersPanelOpen: (open) => set({ filtersPanelOpen: open }),
      setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),
      toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),
      goBack: () => {
        const { navigationHistory } = get();
        if (navigationHistory.length > 0) {
          const previousCategory = navigationHistory[navigationHistory.length - 1];
          set({
            navigationHistory: navigationHistory.slice(0, -1),
            activeCategory: previousCategory,
            activeSubCategory: 'all',
            activeFilter: null,
          });
        }
      },
    }),
    { name: 'finances:workspace' }
  )
);

