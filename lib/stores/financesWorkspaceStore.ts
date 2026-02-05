import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ================================
// Types
// ================================
export type FinanceTabType = 'inbox' | 'tresorerie' | 'budget' | 'flux' | 'previsions' | 'wizard' | 'stats';

export interface FinanceTab {
  id: string;
  type: FinanceTabType;
  title: string;
  icon: string;
  data?: Record<string, unknown>;
  closable?: boolean;
}

interface FinancesWorkspaceState {
  // Tabs management
  tabs: FinanceTab[];
  activeTabId: string | null;
  openTab: (tab: FinanceTab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<FinanceTab>) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  duplicateTab: (id: string) => void;

  // Navigation state (Command Center architecture)
  activeCategory: string;
  activeSubCategory: string;
  activeFilter: string | null;
  sidebarCollapsed: boolean;
  kpiBarCollapsed: boolean;
  navigationHistory: string[];
  setActiveCategory: (category: string) => void;
  setActiveSubCategory: (subCategory: string) => void;
  setActiveFilter: (filter: string | null) => void;
  toggleSidebar: () => void;
  toggleKpiBar: () => void;
  goBack: () => void;

  // UI State
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  statsModalOpen: boolean;
  setStatsModalOpen: (open: boolean) => void;
  filtersPanelOpen: boolean;
  setFiltersPanelOpen: (open: boolean) => void;
  notificationsPanelOpen: boolean;
  setNotificationsPanelOpen: (open: boolean) => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;

  // Detail Modals (comme tickets-clients)
  selectedTransactionId: string | null;
  setSelectedTransactionId: (id: string | null) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;
  selectedBudgetId: string | null;
  setSelectedBudgetId: (id: string | null) => void;
  invoiceFormOpen: boolean;
  setInvoiceFormOpen: (open: boolean) => void;
  exportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
}

// ================================
// Store
// ================================
export const useFinancesWorkspaceStore = create<FinancesWorkspaceState>()(
  persist(
    (set, get) => ({
      // Tabs
      tabs: [],
      activeTabId: null,

      openTab: (tab: FinanceTab) => {
        const { tabs } = get();
        const existing = tabs.find((t) => t.id === tab.id);

        if (existing) {
          set({ activeTabId: tab.id });
        } else {
          set({
            tabs: [...tabs, { ...tab, closable: tab.closable ?? true }],
            activeTabId: tab.id,
          });
        }
      },

      closeTab: (id: string) => {
        const { tabs, activeTabId } = get();
        const tabIndex = tabs.findIndex((t) => t.id === id);

        if (tabIndex === -1) return;

        const newTabs = tabs.filter((t) => t.id !== id);
        let newActiveId = activeTabId;

        if (activeTabId === id) {
          if (newTabs.length === 0) {
            newActiveId = null;
          } else if (tabIndex > 0) {
            newActiveId = newTabs[tabIndex - 1].id;
          } else {
            newActiveId = newTabs[0].id;
          }
        }

        set({ tabs: newTabs, activeTabId: newActiveId });
      },

      setActiveTab: (id: string) => {
        const { tabs } = get();
        const exists = tabs.some((t) => t.id === id);
        if (exists) {
          set({ activeTabId: id });
        }
      },

      updateTab: (id: string, updates: Partial<FinanceTab>) => {
        set((state) => ({
          tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab)),
        }));
      },

      closeAllTabs: () => {
        set({ tabs: [], activeTabId: null });
      },

      closeOtherTabs: (id: string) => {
        const { tabs } = get();
        const targetTab = tabs.find((t) => t.id === id);
        if (targetTab) {
          set({ tabs: [targetTab], activeTabId: id });
        }
      },

      duplicateTab: (id: string) => {
        const { tabs } = get();
        const tab = tabs.find((t) => t.id === id);
        if (tab) {
          const newId = `${tab.id}-copy-${Date.now()}`;
          const newTab = { ...tab, id: newId, title: `${tab.title} (copie)` };
          set({
            tabs: [...tabs, newTab],
            activeTabId: newId,
          });
        }
      },

      // Navigation state (Command Center)
      activeCategory: 'overview',
      activeSubCategory: 'all',
      activeFilter: null,
      sidebarCollapsed: false,
      kpiBarCollapsed: false,
      navigationHistory: [],

      setActiveCategory: (category: string) => {
        const { activeCategory, navigationHistory } = get();
        set({
          navigationHistory: [...navigationHistory, activeCategory],
          activeCategory: category,
          activeSubCategory: 'all',
          activeFilter: null,
        });
      },

      setActiveSubCategory: (subCategory: string) => {
        set({ activeSubCategory: subCategory, activeFilter: null });
      },

      setActiveFilter: (filter: string | null) => {
        set({ activeFilter: filter });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      toggleKpiBar: () => {
        set((state) => ({ kpiBarCollapsed: !state.kpiBarCollapsed }));
      },

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

      // UI State
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),

      statsModalOpen: false,
      setStatsModalOpen: (open: boolean) => set({ statsModalOpen: open }),

      filtersPanelOpen: false,
      setFiltersPanelOpen: (open: boolean) => set({ filtersPanelOpen: open }),

      notificationsPanelOpen: false,
      setNotificationsPanelOpen: (open: boolean) => set({ notificationsPanelOpen: open }),

      isFullScreen: false,
      toggleFullScreen: () => {
        set((state) => ({ isFullScreen: !state.isFullScreen }));
      },

      // Detail Modals (pattern tickets-clients)
      selectedTransactionId: null,
      setSelectedTransactionId: (id: string | null) => set({ selectedTransactionId: id }),

      selectedInvoiceId: null,
      setSelectedInvoiceId: (id: string | null) => set({ selectedInvoiceId: id }),

      selectedBudgetId: null,
      setSelectedBudgetId: (id: string | null) => set({ selectedBudgetId: id }),

      invoiceFormOpen: false,
      setInvoiceFormOpen: (open: boolean) => set({ invoiceFormOpen: open }),

      exportModalOpen: false,
      setExportModalOpen: (open: boolean) => set({ exportModalOpen: open }),
    }),
    {
      name: 'bmo-finances-workspace',
      partialize: (state) => ({
        tabs: state.tabs.slice(0, 20),
        activeTabId: state.activeTabId,
        sidebarCollapsed: state.sidebarCollapsed,
        kpiBarCollapsed: state.kpiBarCollapsed,
      }),
    }
  )
);

