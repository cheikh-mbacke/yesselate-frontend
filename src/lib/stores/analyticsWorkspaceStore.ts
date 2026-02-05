/**
 * analyticsWorkspaceStore.ts
 * ==========================
 * 
 * Store Zustand pour le workspace Analytics
 * Architecture multi-onglets inspirée du workspace Délégations
 * 
 * Fonctionnalités:
 * - Multi-onglets (inbox, dashboard, rapports)
 * - Navigation avec historique
 * - UI state persisté par onglet
 * - Command palette
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

/**
 * Type d'onglet Analytics
 */
export type AnalyticsTabType = 
  | 'inbox'       // Liste des rapports/KPIs
  | 'dashboard'   // Dashboard principal
  | 'report'      // Rapport détaillé
  | 'trend'       // Analyse tendances
  | 'comparison'  // Comparaison bureaux/périodes
  | 'export';     // Export et planification

/**
 * File de travail pour la vue inbox
 */
export type AnalyticsQueue =
  | 'all'           // Tous les KPIs
  | 'overview'      // Vue d'ensemble
  | 'performance'   // Performance
  | 'financial'     // Financier
  | 'operations'    // Opérations
  | 'alerts'        // Alertes
  | 'trends';       // Tendances

/**
 * Onglet Analytics
 */
export interface AnalyticsTab {
  id: string;
  type: AnalyticsTabType;
  title: string;
  icon: string;
  data?: Record<string, unknown>;
  createdAt?: string;
  lastAccessed?: string;
}

/**
 * État UI par onglet (personnalisable selon le type)
 */
export interface AnalyticsUIState {
  // Pour inbox
  queue?: AnalyticsQueue;
  viewMode?: 'cards' | 'list' | 'compact';
  searchQuery?: string;
  filterType?: string;
  sortBy?: string;
  
  // Pour dashboard/report
  explorerOpen?: boolean;
  activeSection?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  comparisonMode?: boolean;
  
  // Pour charts
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  groupBy?: 'day' | 'week' | 'month' | 'bureau' | 'type';
}

/**
 * Store Zustand
 */
interface AnalyticsWorkspaceStore {
  // État
  tabs: AnalyticsTab[];
  activeTabId: string | null;
  tabsUI: Record<string, AnalyticsUIState>;
  isFullScreen: boolean;
  commandPaletteOpen: boolean;
  
  // Actions - Tabs
  openTab: (tab: AnalyticsTab) => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<AnalyticsTab>) => void;
  
  // Actions - UI State
  setTabUI: (tabId: string, ui: Partial<AnalyticsUIState>) => void;
  getTabUI: (tabId: string) => AnalyticsUIState | undefined;
  
  // Actions - UI
  toggleFullScreen: () => void;
  setFullScreen: (value: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  
  // Helpers
  getActiveTab: () => AnalyticsTab | undefined;
}

// ============================================
// STORE
// ============================================

export const useAnalyticsWorkspaceStore = create<AnalyticsWorkspaceStore>()(
  persist(
    (set, get) => ({
      // État initial
      tabs: [],
      activeTabId: null,
      tabsUI: {},
      isFullScreen: false,
      commandPaletteOpen: false,
      
      // ================================
      // ACTIONS - TABS
      // ================================
      
      openTab: (tab: AnalyticsTab) => {
        const existing = get().tabs.find(t => t.id === tab.id);
        
        if (existing) {
          // Onglet existe déjà, le rendre actif
          set({ activeTabId: existing.id });
          set(state => ({
            tabs: state.tabs.map(t => 
              t.id === existing.id 
                ? { ...t, lastAccessed: new Date().toISOString() }
                : t
            )
          }));
        } else {
          // Nouvel onglet
          const now = new Date().toISOString();
          const newTab = {
            ...tab,
            createdAt: now,
            lastAccessed: now,
          };
          
          set(state => ({
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id,
          }));
        }
      },
      
      closeTab: (tabId: string) => {
        const state = get();
        const index = state.tabs.findIndex(t => t.id === tabId);
        
        if (index === -1) return;
        
        // Supprimer l'onglet
        const newTabs = state.tabs.filter(t => t.id !== tabId);
        
        // Si c'est l'onglet actif, choisir le suivant ou précédent
        let newActiveId = state.activeTabId;
        if (state.activeTabId === tabId) {
          if (newTabs.length > 0) {
            // Prendre l'onglet suivant, ou le précédent si c'était le dernier
            const nextIndex = Math.min(index, newTabs.length - 1);
            newActiveId = newTabs[nextIndex]?.id || null;
          } else {
            newActiveId = null;
          }
        }
        
        // Supprimer l'UI state aussi
        const newTabsUI = { ...state.tabsUI };
        delete newTabsUI[tabId];
        
        set({ 
          tabs: newTabs, 
          activeTabId: newActiveId,
          tabsUI: newTabsUI,
        });
      },
      
      closeAllTabs: () => {
        set({ 
          tabs: [], 
          activeTabId: null,
          tabsUI: {},
        });
      },
      
      setActiveTab: (tabId: string) => {
        const tab = get().tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        set({ activeTabId: tabId });
        set(state => ({
          tabs: state.tabs.map(t => 
            t.id === tabId 
              ? { ...t, lastAccessed: new Date().toISOString() }
              : t
          )
        }));
      },
      
      updateTab: (tabId: string, updates: Partial<AnalyticsTab>) => {
        set(state => ({
          tabs: state.tabs.map(t => 
            t.id === tabId ? { ...t, ...updates } : t
          )
        }));
      },
      
      // ================================
      // ACTIONS - UI STATE
      // ================================
      
      setTabUI: (tabId: string, ui: Partial<AnalyticsUIState>) => {
        set(state => ({
          tabsUI: {
            ...state.tabsUI,
            [tabId]: {
              ...state.tabsUI[tabId],
              ...ui,
            }
          }
        }));
      },
      
      getTabUI: (tabId: string) => {
        return get().tabsUI[tabId];
      },
      
      // ================================
      // ACTIONS - UI
      // ================================
      
      toggleFullScreen: () => {
        set(state => ({ isFullScreen: !state.isFullScreen }));
      },
      
      setFullScreen: (value: boolean) => {
        set({ isFullScreen: value });
      },
      
      openCommandPalette: () => {
        set({ commandPaletteOpen: true });
      },
      
      closeCommandPalette: () => {
        set({ commandPaletteOpen: false });
      },
      
      toggleCommandPalette: () => {
        set(state => ({ commandPaletteOpen: !state.commandPaletteOpen }));
      },
      
      // ================================
      // HELPERS
      // ================================
      
      getActiveTab: () => {
        const state = get();
        return state.tabs.find(t => t.id === state.activeTabId);
      },
    }),
    {
      name: 'analytics-workspace-storage',
      // Ne persister que ce qui est nécessaire
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        tabsUI: state.tabsUI,
        isFullScreen: state.isFullScreen,
      }),
    }
  )
);

