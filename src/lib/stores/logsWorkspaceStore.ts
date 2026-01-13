/**
 * STORE: Logs Workspace - Pattern Pilotage
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LogsTabType = 'inbox' | 'detail' | 'errors' | 'system' | 'api' | 'analytics';

export interface LogsTab { id: string; type: LogsTabType; title: string; icon: string; data: Record<string, unknown>; closable?: boolean; }
export interface LogsFilter { level?: string; source?: string; module?: string; search?: string; dateFrom?: string; dateTo?: string; }

interface LogsWorkspaceState {
  tabs: LogsTab[]; activeTabId: string | null; selectedIds: Set<string>; currentFilter: LogsFilter;
  watchlist: string[]; commandPaletteOpen: boolean; statsModalOpen: boolean; directionPanelOpen: boolean; viewMode: 'dashboard' | 'workspace';
  openTab: (tab: Omit<LogsTab, 'id'> & { id?: string }) => void; closeTab: (tabId: string) => void; setActiveTab: (tabId: string) => void;
  toggleSelected: (id: string) => void; selectAll: (ids: string[]) => void; clearSelection: () => void;
  setFilter: (filter: Partial<LogsFilter>) => void; clearFilter: () => void;
  addToWatchlist: (id: string) => void; removeFromWatchlist: (id: string) => void;
  setCommandPaletteOpen: (open: boolean) => void; setStatsModalOpen: (open: boolean) => void; setDirectionPanelOpen: (open: boolean) => void;
  setViewMode: (mode: 'dashboard' | 'workspace') => void; reset: () => void;
}

const defaultTabs: LogsTab[] = [{ id: 'inbox:all', type: 'inbox', title: 'Tous les logs', icon: '📋', data: { queue: 'all' }, closable: false }];

export const useLogsWorkspaceStore = create<LogsWorkspaceState>()(
  persist((set, get) => ({
    tabs: defaultTabs, activeTabId: 'inbox:all', selectedIds: new Set(), currentFilter: {}, watchlist: [],
    commandPaletteOpen: false, statsModalOpen: false, directionPanelOpen: false, viewMode: 'dashboard',
    openTab: (tab) => { const id = tab.id || `${tab.type}:${Date.now()}`; if (get().tabs.find(t => t.id === id)) { set({ activeTabId: id }); return; } set((s) => ({ tabs: [...s.tabs, { ...tab, id, closable: tab.closable ?? true }], activeTabId: id })); },
    closeTab: (tabId) => { const { tabs, activeTabId } = get(); const tab = tabs.find(t => t.id === tabId); if (!tab || tab.closable === false) return; const newTabs = tabs.filter(t => t.id !== tabId); let newActiveId = activeTabId; if (activeTabId === tabId) { const idx = tabs.findIndex(t => t.id === tabId); newActiveId = newTabs[Math.min(idx, newTabs.length - 1)]?.id || null; } set({ tabs: newTabs, activeTabId: newActiveId }); },
    setActiveTab: (tabId) => { if (get().tabs.find(t => t.id === tabId)) set({ activeTabId: tabId }); },
    toggleSelected: (id) => set((s) => { const n = new Set(s.selectedIds); n.has(id) ? n.delete(id) : n.add(id); return { selectedIds: n }; }),
    selectAll: (ids) => set({ selectedIds: new Set(ids) }), clearSelection: () => set({ selectedIds: new Set() }),
    setFilter: (f) => set((s) => ({ currentFilter: { ...s.currentFilter, ...f } })), clearFilter: () => set({ currentFilter: {} }),
    addToWatchlist: (id) => set((s) => ({ watchlist: s.watchlist.includes(id) ? s.watchlist : [...s.watchlist, id] })),
    removeFromWatchlist: (id) => set((s) => ({ watchlist: s.watchlist.filter(w => w !== id) })),
    setCommandPaletteOpen: (o) => set({ commandPaletteOpen: o }), setStatsModalOpen: (o) => set({ statsModalOpen: o }),
    setDirectionPanelOpen: (o) => set({ directionPanelOpen: o }), setViewMode: (m) => set({ viewMode: m }),
    reset: () => set({ tabs: defaultTabs, activeTabId: 'inbox:all', selectedIds: new Set(), currentFilter: {}, commandPaletteOpen: false }),
  }), { name: 'logs:workspace', partialize: (s) => ({ watchlist: s.watchlist, viewMode: s.viewMode }) })
);

