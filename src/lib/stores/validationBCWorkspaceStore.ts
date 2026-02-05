import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ================================
// Types
// ================================
export type ValidationTabType = 'inbox' | 'bc' | 'facture' | 'avenant' | 'wizard' | 'comparison' | 'audit';

export interface ValidationTab {
  id: string;
  type: ValidationTabType;
  title: string;
  icon: string;
  data?: Record<string, unknown>;
  closable?: boolean;
}

interface ValidationBCWorkspaceState {
  tabs: ValidationTab[];
  activeTabId: string | null;
  openTab: (tab: ValidationTab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<ValidationTab>) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  duplicateTab: (id: string) => void;
  goToNextTab: () => void;
  goToPreviousTab: () => void;
}

// ================================
// Store
// ================================
export const useValidationBCWorkspaceStore = create<ValidationBCWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,

      openTab: (tab: ValidationTab) => {
        const { tabs } = get();
        const existing = tabs.find((t) => t.id === tab.id);

        if (existing) {
          // Tab exists, just activate it
          set({ activeTabId: tab.id });
        } else {
          // Add new tab
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

        // If closing active tab, select another
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

      updateTab: (id: string, updates: Partial<ValidationTab>) => {
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

      goToNextTab: () => {
        const { tabs, activeTabId } = get();
        if (tabs.length < 2) return;
        const currentIdx = tabs.findIndex((t) => t.id === activeTabId);
        if (currentIdx === -1) return;
        const nextIdx = (currentIdx + 1) % tabs.length;
        set({ activeTabId: tabs[nextIdx].id });
      },

      goToPreviousTab: () => {
        const { tabs, activeTabId } = get();
        if (tabs.length < 2) return;
        const currentIdx = tabs.findIndex((t) => t.id === activeTabId);
        if (currentIdx === -1) return;
        const prevIdx = currentIdx === 0 ? tabs.length - 1 : currentIdx - 1;
        set({ activeTabId: tabs[prevIdx].id });
      },
    }),
    {
      name: 'bmo-validation-bc-workspace',
      partialize: (state) => ({
        tabs: state.tabs.slice(0, 20), // Limit persisted tabs
        activeTabId: state.activeTabId,
      }),
    }
  )
);

