import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ================================
// Types
// ================================
export type ClientTabType = 'inbox' | 'client' | 'contact' | 'historique' | 'wizard' | 'stats';

export interface ClientTab {
  id: string;
  type: ClientTabType;
  title: string;
  icon: string;
  data?: Record<string, unknown>;
  closable?: boolean;
}

interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

// Sous-catégories par catégorie principale
const subCategoriesMap: Record<string, SubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'summary', label: 'Résumé' },
    { id: 'activity', label: 'Activité récente', badge: 12 },
  ],
  prospects: [
    { id: 'all', label: 'Tous', badge: 12 },
    { id: 'hot', label: 'Chauds', badge: 3, badgeType: 'critical' },
    { id: 'warm', label: 'Tièdes', badge: 5, badgeType: 'warning' },
    { id: 'cold', label: 'Froids', badge: 4 },
  ],
  premium: [
    { id: 'all', label: 'Tous', badge: 8 },
    { id: 'strategic', label: 'Stratégiques', badge: 3 },
    { id: 'growth', label: 'Croissance', badge: 5 },
  ],
  litiges: [
    { id: 'all', label: 'Tous', badge: 3 },
    { id: 'open', label: 'Ouverts', badge: 2, badgeType: 'critical' },
    { id: 'in_progress', label: 'En cours', badge: 1, badgeType: 'warning' },
    { id: 'resolved', label: 'Résolus' },
  ],
  historique: [
    { id: 'all', label: 'Tout' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'quarter', label: 'Ce trimestre' },
  ],
  contrats: [
    { id: 'all', label: 'Tous', badge: 24 },
    { id: 'active', label: 'Actifs', badge: 18 },
    { id: 'expiring', label: 'À renouveler', badge: 4, badgeType: 'warning' },
    { id: 'expired', label: 'Expirés', badge: 2 },
  ],
  performance: [
    { id: 'all', label: 'Vue générale' },
    { id: 'satisfaction', label: 'Satisfaction' },
    { id: 'revenue', label: 'Chiffre d\'affaires' },
    { id: 'retention', label: 'Rétention' },
  ],
  entreprises: [
    { id: 'all', label: 'Toutes', badge: 156 },
    { id: 'tpe', label: 'TPE', badge: 45 },
    { id: 'pme', label: 'PME', badge: 68 },
    { id: 'eti', label: 'ETI', badge: 32 },
    { id: 'ge', label: 'GE', badge: 11 },
  ],
  interactions: [
    { id: 'all', label: 'Toutes', badge: 28 },
    { id: 'pending', label: 'En attente', badge: 5, badgeType: 'warning' },
    { id: 'today', label: 'Aujourd\'hui', badge: 8 },
    { id: 'week', label: 'Cette semaine', badge: 15 },
  ],
};

interface ClientsWorkspaceState {
  // Tabs management
  tabs: ClientTab[];
  activeTabId: string | null;
  openTab: (tab: ClientTab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<ClientTab>) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  duplicateTab: (id: string) => void;

  // Navigation State (Command Center)
  activeCategory: string;
  activeSubCategory: string;
  sidebarCollapsed: boolean;
  navigationHistory: string[];
  setActiveCategory: (category: string) => void;
  setActiveSubCategory: (subCategory: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  goBack: () => void;
  getSubCategories: () => SubCategory[];

  // UI State
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  statsModalOpen: boolean;
  setStatsModalOpen: (open: boolean) => void;
  directionPanelOpen: boolean;
  setDirectionPanelOpen: (open: boolean) => void;
  notificationsPanelOpen: boolean;
  setNotificationsPanelOpen: (open: boolean) => void;
  filtersPanelOpen: boolean;
  setFiltersPanelOpen: (open: boolean) => void;
  kpiBarCollapsed: boolean;
  setKpiBarCollapsed: (collapsed: boolean) => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  viewMode: 'dashboard' | 'workspace';
  setViewMode: (mode: 'dashboard' | 'workspace') => void;
}

// ================================
// Store
// ================================
export const useClientsWorkspaceStore = create<ClientsWorkspaceState>()(
  persist(
    (set, get) => ({
      // Tabs
      tabs: [],
      activeTabId: null,

      openTab: (tab: ClientTab) => {
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

      updateTab: (id: string, updates: Partial<ClientTab>) => {
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

      // Navigation State (Command Center)
      activeCategory: 'overview',
      activeSubCategory: 'all',
      sidebarCollapsed: false,
      navigationHistory: [],

      setActiveCategory: (category: string) => {
        const { activeCategory } = get();
        set((state) => ({
          navigationHistory: [...state.navigationHistory, activeCategory],
          activeCategory: category,
          activeSubCategory: 'all',
        }));
      },

      setActiveSubCategory: (subCategory: string) => {
        set({ activeSubCategory: subCategory });
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      toggleSidebarCollapsed: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      goBack: () => {
        const { navigationHistory } = get();
        if (navigationHistory.length > 0) {
          const previousCategory = navigationHistory[navigationHistory.length - 1];
          set({
            navigationHistory: navigationHistory.slice(0, -1),
            activeCategory: previousCategory,
            activeSubCategory: 'all',
          });
        }
      },

      getSubCategories: () => {
        const { activeCategory } = get();
        return subCategoriesMap[activeCategory] || [];
      },

      // UI State
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),
      statsModalOpen: false,
      setStatsModalOpen: (open: boolean) => set({ statsModalOpen: open }),
      directionPanelOpen: false,
      setDirectionPanelOpen: (open: boolean) => set({ directionPanelOpen: open }),
      notificationsPanelOpen: false,
      setNotificationsPanelOpen: (open: boolean) => set({ notificationsPanelOpen: open }),
      filtersPanelOpen: false,
      setFiltersPanelOpen: (open: boolean) => set({ filtersPanelOpen: open }),
      kpiBarCollapsed: false,
      setKpiBarCollapsed: (collapsed: boolean) => set({ kpiBarCollapsed: collapsed }),
      isFullScreen: false,
      toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),
      viewMode: 'dashboard',
      setViewMode: (mode: 'dashboard' | 'workspace') => set({ viewMode: mode }),
    }),
    {
      name: 'bmo-clients-workspace',
      partialize: (state) => ({
        tabs: state.tabs.slice(0, 20),
        activeTabId: state.activeTabId,
        viewMode: state.viewMode,
        activeCategory: state.activeCategory,
        activeSubCategory: state.activeSubCategory,
        sidebarCollapsed: state.sidebarCollapsed,
        kpiBarCollapsed: state.kpiBarCollapsed,
      }),
    }
  )
);

// Export subcategories map for external use
export { subCategoriesMap };
