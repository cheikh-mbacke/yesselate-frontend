import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ================================
// Types
// ================================
export type AlertTabType = 'inbox' | 'alert' | 'escalation' | 'resolution' | 'analysis';

export interface AlertTab {
  id: string;
  type: AlertTabType;
  title: string;
  icon: string;
  data?: Record<string, unknown>;
  closable?: boolean;
}

interface AlertWorkspaceState {
  // Tabs management
  tabs: AlertTab[];
  activeTabId: string | null;
  openTab: (tab: AlertTab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<AlertTab>) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  duplicateTab: (id: string) => void;
  // Selection management
  selectedAlertIds: string[];
  setSelectedAlertIds: (ids: string[]) => void;
  clearSelection: () => void;
}

// ================================
// Store
// ================================
export const useAlertWorkspaceStore = create<AlertWorkspaceState>()(
  persist(
    (set, get) => ({
      // Tabs
      tabs: [],
      activeTabId: null,

      // Selection
      selectedAlertIds: [],
      setSelectedAlertIds: (ids: string[]) => set({ selectedAlertIds: ids }),
      clearSelection: () => set({ selectedAlertIds: [] }),

      openTab: (tab: AlertTab) => {
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

      updateTab: (id: string, updates: Partial<AlertTab>) => {
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
    }),
    {
      name: 'bmo-alert-workspace',
      partialize: (state) => ({
        tabs: state.tabs.slice(0, 20),
        activeTabId: state.activeTabId,
      }),
    }
  )
);

