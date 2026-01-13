/**
 * Store Zustand pour le Workspace Gouvernance
 * Gère l'état des onglets multiples et la navigation
 */

import { create } from 'zustand';

// Types d'onglets supportés
export type GovernanceTabType = 
  | 'dashboard'       // Vue d'accueil
  | 'raci-inbox'      // Liste des activités RACI
  | 'alerts-inbox'    // Liste des alertes
  | 'raci-activity'   // Détail d'une activité RACI
  | 'alert-detail'    // Détail d'une alerte
  | 'raci-comparator' // Comparateur RACI
  | 'raci-heatmap'    // Heatmap RACI
  | 'analytics';      // Analytics & Rapports

// Sections disponibles pour chaque type d'onglet
export type GovernanceTabSection = 
  | 'overview'
  | 'matrix'
  | 'roles'
  | 'conflicts'
  | 'details'
  | 'impact'
  | 'resolution'
  | 'timeline'
  | 'audit';

// Sous-sections
export type GovernanceTabSubSection = 
  | 'info'
  | 'stakeholders'
  | 'history'
  | 'comments'
  | 'attachments'
  | 'ai-suggestions';

// État UI d'un onglet
export interface GovernanceTabUI {
  section?: GovernanceTabSection;
  subSection?: GovernanceTabSubSection;
  explorerOpen?: boolean;
  sidebarOpen?: boolean;
}

// Définition d'un onglet
export interface GovernanceTab {
  id: string;
  type: GovernanceTabType;
  title: string;
  subtitle?: string;
  icon?: string;
  metadata?: Record<string, any>; // Données spécifiques à l'onglet
  ui?: GovernanceTabUI;
  createdAt: number;
  modifiedAt: number;
  isPinned?: boolean;
}

// État du store
interface GovernanceWorkspaceState {
  // Tabs
  tabs: GovernanceTab[];
  activeTabId: string | null;
  
  // UI State
  showDashboard: boolean;
  sidebarOpen: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  showHelp: boolean;
  
  // Filters & Search (pour les vues inbox)
  raciQueue: 'all' | 'conflicts' | 'incomplete' | 'critical' | 'unassigned';
  alertQueue: 'all' | 'system' | 'blocked' | 'payment' | 'contract' | 'critical';
  searchTerm: string;
  
  // Actions
  openTab: (type: GovernanceTabType, title: string, metadata?: Record<string, any>) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<GovernanceTab>) => void;
  setTabUI: (tabId: string, ui: Partial<GovernanceTabUI>) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  
  // UI Actions
  toggleDashboard: () => void;
  toggleSidebar: () => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;
  toggleHelp: () => void;
  
  // Queue & Search Actions
  setRACIQueue: (queue: GovernanceWorkspaceState['raciQueue']) => void;
  setAlertQueue: (queue: GovernanceWorkspaceState['alertQueue']) => void;
  setSearchTerm: (term: string) => void;
  
  // Navigation helpers
  goToNextTab: () => void;
  goToPreviousTab: () => void;
  getActiveTab: () => GovernanceTab | null;
}

export const useGovernanceWorkspaceStore = create<GovernanceWorkspaceState>((set, get) => ({
  // Initial state
  tabs: [],
  activeTabId: null,
  showDashboard: true,
  sidebarOpen: true,
  fullscreen: false,
  commandPaletteOpen: false,
  showHelp: false,
  raciQueue: 'all',
  alertQueue: 'all',
  searchTerm: '',
  
  // Open a new tab or focus existing
  openTab: (type, title, metadata = {}) => {
    const state = get();
    
    // Check if tab already exists (pour certains types)
    if (type === 'raci-activity' && metadata.activityId) {
      const existing = state.tabs.find(
        t => t.type === 'raci-activity' && t.metadata?.activityId === metadata.activityId
      );
      if (existing) {
        set({ activeTabId: existing.id, showDashboard: false });
        return existing.id;
      }
    }
    
    if (type === 'alert-detail' && metadata.alertId) {
      const existing = state.tabs.find(
        t => t.type === 'alert-detail' && t.metadata?.alertId === metadata.alertId
      );
      if (existing) {
        set({ activeTabId: existing.id, showDashboard: false });
        return existing.id;
      }
    }
    
    // Create new tab
    const newTab: GovernanceTab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      title,
      metadata,
      ui: {
        section: 'overview',
        explorerOpen: true,
        sidebarOpen: true,
      },
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      isPinned: false,
    };
    
    set({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
      showDashboard: false,
    });
    
    return newTab.id;
  },
  
  // Close a tab
  closeTab: (tabId) => {
    const state = get();
    const tabIndex = state.tabs.findIndex(t => t.id === tabId);
    
    if (tabIndex === -1) return;
    
    const newTabs = state.tabs.filter(t => t.id !== tabId);
    let newActiveTabId = state.activeTabId;
    
    // If closing active tab, switch to another
    if (state.activeTabId === tabId) {
      if (newTabs.length === 0) {
        newActiveTabId = null;
        set({ tabs: newTabs, activeTabId: null, showDashboard: true });
        return;
      }
      
      // Try next tab, or previous if at end
      const nextTab = newTabs[tabIndex] || newTabs[tabIndex - 1];
      newActiveTabId = nextTab.id;
    }
    
    set({ tabs: newTabs, activeTabId: newActiveTabId });
  },
  
  // Set active tab
  setActiveTab: (tabId) => {
    const state = get();
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab) {
      set({ activeTabId: tabId, showDashboard: false });
    }
  },
  
  // Update tab properties
  updateTab: (tabId, updates) => {
    set(state => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId
          ? { ...tab, ...updates, modifiedAt: Date.now() }
          : tab
      ),
    }));
  },
  
  // Update tab UI state
  setTabUI: (tabId, ui) => {
    set(state => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId
          ? {
              ...tab,
              ui: { ...tab.ui, ...ui },
              modifiedAt: Date.now(),
            }
          : tab
      ),
    }));
  },
  
  // Close all tabs
  closeAllTabs: () => {
    set({ tabs: [], activeTabId: null, showDashboard: true });
  },
  
  // Close other tabs
  closeOtherTabs: (tabId) => {
    const state = get();
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab) {
      set({ tabs: [tab], activeTabId: tabId });
    }
  },
  
  // Pin/Unpin tab
  pinTab: (tabId) => {
    set(state => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId ? { ...tab, isPinned: true } : tab
      ),
    }));
  },
  
  unpinTab: (tabId) => {
    set(state => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId ? { ...tab, isPinned: false } : tab
      ),
    }));
  },
  
  // Toggle dashboard
  toggleDashboard: () => {
    set(state => ({ showDashboard: !state.showDashboard }));
  },
  
  // Toggle sidebar
  toggleSidebar: () => {
    set(state => ({ sidebarOpen: !state.sidebarOpen }));
  },
  
  // Toggle fullscreen
  toggleFullscreen: () => {
    set(state => {
      const newFullscreen = !state.fullscreen;
      if (newFullscreen) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      return { fullscreen: newFullscreen };
    });
  },
  
  // Toggle command palette
  toggleCommandPalette: () => {
    set(state => ({ commandPaletteOpen: !state.commandPaletteOpen }));
  },
  
  // Toggle help
  toggleHelp: () => {
    set(state => ({ showHelp: !state.showHelp }));
  },
  
  // Set RACI queue
  setRACIQueue: (queue) => {
    set({ raciQueue: queue });
  },
  
  // Set Alert queue
  setAlertQueue: (queue) => {
    set({ alertQueue: queue });
  },
  
  // Set search term
  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },
  
  // Navigate to next tab
  goToNextTab: () => {
    const state = get();
    if (state.tabs.length === 0) return;
    
    const currentIndex = state.tabs.findIndex(t => t.id === state.activeTabId);
    const nextIndex = (currentIndex + 1) % state.tabs.length;
    const nextTab = state.tabs[nextIndex];
    
    set({ activeTabId: nextTab.id, showDashboard: false });
  },
  
  // Navigate to previous tab
  goToPreviousTab: () => {
    const state = get();
    if (state.tabs.length === 0) return;
    
    const currentIndex = state.tabs.findIndex(t => t.id === state.activeTabId);
    const prevIndex = currentIndex <= 0 ? state.tabs.length - 1 : currentIndex - 1;
    const prevTab = state.tabs[prevIndex];
    
    set({ activeTabId: prevTab.id, showDashboard: false });
  },
  
  // Get active tab
  getActiveTab: () => {
    const state = get();
    return state.tabs.find(t => t.id === state.activeTabId) || null;
  },
}));

