import { create } from 'zustand';

export type WorkspaceTabType = 'inbox' | 'demand' | 'report';

export type WorkspaceTab = {
  id: string;
  type: WorkspaceTabType;
  title: string;
  icon?: string;
  data?: Record<string, unknown>;
  isDirty?: boolean;
  createdAt: number;
};

type WorkspaceState = {
  tabs: WorkspaceTab[];
  activeTabId: string | null;

  openTab: (tab: Omit<WorkspaceTab, 'createdAt'>) => void;
  setActiveTab: (id: string) => void;
  closeTab: (id: string) => void;
  updateTab: (id: string, patch: Partial<WorkspaceTab>) => void;
  closeOthers: (id: string) => void;
  closeAll: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (input) => {
    const id = input.id;
    const existing = get().tabs.find((t) => t.id === id);

    if (existing) {
      set((s) => ({
        tabs: s.tabs.map((t) => (t.id === id ? { ...t, ...input } : t)),
        activeTabId: id,
      }));
      return;
    }

    const tab: WorkspaceTab = { ...input, createdAt: Date.now() };

    set((s) => ({
      tabs: [...s.tabs, tab],
      activeTabId: tab.id,
    }));
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  closeTab: (id) => {
    set((s) => {
      const idx = s.tabs.findIndex((t) => t.id === id);
      const nextTabs = s.tabs.filter((t) => t.id !== id);

      let nextActive = s.activeTabId;
      if (s.activeTabId === id) {
        const left = idx - 1;
        const candidate = nextTabs[left] ?? nextTabs[nextTabs.length - 1] ?? null;
        nextActive = candidate?.id ?? null;
      }

      return { tabs: nextTabs, activeTabId: nextActive };
    });
  },

  updateTab: (id, patch) => {
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  },

  closeOthers: (id) => {
    set((s) => {
      const keep = s.tabs.find((t) => t.id === id);
      return { tabs: keep ? [keep] : [], activeTabId: keep?.id ?? null };
    });
  },

  closeAll: () => set({ tabs: [], activeTabId: null }),
}));
