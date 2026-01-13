/**
 * Store Zustand pour le workspace Tickets-Clients BTP
 * ====================================================
 * 
 * Gère:
 * - Les onglets dynamiques (inbox, ticket, wizard, analytics, map, kanban)
 * - L'état UI de chaque onglet (section, sous-section, filtres, step)
 * - L'historique de navigation (pour précédent/suivant)
 * - Les préférences utilisateur
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

/** Types d'onglets dans le workspace tickets */
export type TicketTabType = 
  | 'inbox'       // Files de tickets (à traiter, urgents, etc.)
  | 'ticket'      // Détail d'un ticket
  | 'wizard'      // Assistant création/édition
  | 'analytics'   // Tableaux de bord et rapports
  | 'map'         // Vue carte des chantiers
  | 'kanban'      // Vue Kanban par statut
  | 'timeline'    // Vue chronologique
  | 'report';     // Rapport généré

/** Statut d'un ticket */
export type TicketStatus = 
  | 'nouveau'
  | 'en_cours'
  | 'en_attente_client'
  | 'en_attente_interne'
  | 'escalade'
  | 'resolu'
  | 'clos'
  | 'annule';

/** Priorité d'un ticket */
export type TicketPriority = 'critique' | 'haute' | 'normale' | 'basse';

/** Catégorie métier BTP */
export type TicketCategory = 
  | 'reclamation_qualite'
  | 'retard_livraison'
  | 'facturation'
  | 'demande_modification'
  | 'incident_chantier'
  | 'securite'
  | 'garantie'
  | 'information'
  | 'autre';

/** Sections disponibles dans un onglet ticket */
export type TicketSection = 
  | 'overview'          // Vue d'ensemble
  | 'messages'          // Fil de discussion
  | 'documents'         // Pièces jointes
  | 'historique'        // Historique des actions
  | 'sla'               // Suivi SLA et délais
  | 'escalade'          // Escalade et responsables
  | 'chantier'          // Infos chantier lié
  | 'facturation'       // Impact financier
  | 'resolution';       // Résolution et clôture

/** Sous-sections par section */
export type TicketSubSection = 
  | 'sla_details' | 'sla_history' | 'sla_alerts'
  | 'escalade_chain' | 'escalade_history'
  | 'docs_list' | 'docs_upload' | 'docs_preview'
  | 'msg_thread' | 'msg_internal' | 'msg_client'
  | 'chantier_info' | 'chantier_planning' | 'chantier_equipe'
  | 'factu_impact' | 'factu_avoir' | 'factu_relance'
  | 'reso_diagnostic' | 'reso_solution' | 'reso_validation';

/** État UI d'un onglet ticket */
export interface TicketUIState {
  section: TicketSection;
  subSection?: TicketSubSection;
  scrollY?: number;
  collapsed?: string[];        // Sections collapsées
  filters?: Record<string, any>;
  step?: number;               // Pour wizard
  maxStep?: number;
}

/** Définition d'un onglet */
export interface TicketTab {
  id: string;
  type: TicketTabType;
  title: string;
  icon: string;
  data?: Record<string, unknown>;
  createdAt: number;
  ui?: TicketUIState;
  pinned?: boolean;
  modified?: boolean;
  badge?: number;              // Compteur de notifications
}

/** Entrée historique de navigation */
interface NavHistoryEntry {
  tabId: string;
  section?: TicketSection;
  subSection?: TicketSubSection;
  timestamp: number;
}

/** Préférences utilisateur */
interface UserPreferences {
  autoRefresh: boolean;
  refreshInterval: number;     // en secondes
  defaultView: 'list' | 'kanban' | 'map' | 'timeline';
  compactMode: boolean;
  showClosedTickets: boolean;
  theme: 'auto' | 'light' | 'dark';
  notifications: {
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };
}

// ============================================
// STORE INTERFACE
// ============================================

interface TicketsClientWorkspaceState {
  // Tabs
  tabs: TicketTab[];
  activeTabId: string | null;
  
  // Navigation history
  navHistory: NavHistoryEntry[];
  navHistoryIndex: number;
  
  // Préférences
  preferences: UserPreferences;
  
  // Actions - Tabs
  openTab: (tab: Omit<TicketTab, 'createdAt' | 'ui'>) => void;
  closeTab: (tabId: string) => void;
  closeOtherTabs: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<TicketTab>) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  
  // Navigation
  nextTab: () => void;
  previousTab: () => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  
  // UI State par onglet
  setTabUI: (tabId: string, uiPatch: Partial<TicketUIState>) => void;
  getTabUI: (tabId: string) => TicketUIState | undefined;
  navigateToSection: (tabId: string, section: TicketSection, subSection?: TicketSubSection) => void;
  
  // Préférences
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  
  // Getters
  getActiveTab: () => TicketTab | null;
  getTabsByType: (type: TicketTabType) => TicketTab[];
}

// ============================================
// DEFAULT VALUES
// ============================================

const DEFAULT_UI_STATE: TicketUIState = {
  section: 'overview',
  subSection: undefined,
  scrollY: 0,
  collapsed: [],
  step: 0,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  autoRefresh: true,
  refreshInterval: 60,
  defaultView: 'list',
  compactMode: false,
  showClosedTickets: false,
  theme: 'auto',
  notifications: {
    sound: true,
    desktop: true,
    email: false,
  },
};

// ============================================
// STORE
// ============================================

export const useTicketsClientWorkspaceStore = create<TicketsClientWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      navHistory: [],
      navHistoryIndex: -1,
      preferences: DEFAULT_PREFERENCES,

      // ===== TABS ACTIONS =====
      
      openTab: (input) => {
        set((state) => {
          const existing = state.tabs.find((t) => t.id === input.id);
          
          if (existing) {
            // Mettre à jour l'historique
            const newEntry: NavHistoryEntry = {
              tabId: input.id,
              timestamp: Date.now(),
            };
            
            return {
              activeTabId: input.id,
              navHistory: [...state.navHistory.slice(0, state.navHistoryIndex + 1), newEntry],
              navHistoryIndex: state.navHistoryIndex + 1,
            };
          }
          
          const newTab: TicketTab = {
            ...input,
            createdAt: Date.now(),
            ui: input.type === 'ticket' ? { ...DEFAULT_UI_STATE } : undefined,
          };
          
          const newEntry: NavHistoryEntry = {
            tabId: newTab.id,
            timestamp: Date.now(),
          };
          
          return {
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id,
            navHistory: [...state.navHistory.slice(0, state.navHistoryIndex + 1), newEntry],
            navHistoryIndex: state.navHistoryIndex + 1,
          };
        });
      },

      closeTab: (tabId) => {
        set((state) => {
          const idx = state.tabs.findIndex((t) => t.id === tabId);
          if (idx === -1) return state;

          const newTabs = state.tabs.filter((t) => t.id !== tabId);
          let newActiveId = state.activeTabId;

          if (state.activeTabId === tabId) {
            if (newTabs.length === 0) {
              newActiveId = null;
            } else if (idx < newTabs.length) {
              newActiveId = newTabs[idx].id;
            } else {
              newActiveId = newTabs[idx - 1].id;
            }
          }

          return {
            tabs: newTabs,
            activeTabId: newActiveId,
          };
        });
      },

      closeOtherTabs: (tabId) => {
        set((state) => ({
          tabs: state.tabs.filter((t) => t.id === tabId || t.pinned),
          activeTabId: tabId,
        }));
      },

      closeAllTabs: () => {
        set((state) => ({
          tabs: state.tabs.filter((t) => t.pinned),
          activeTabId: state.tabs.find((t) => t.pinned)?.id ?? null,
        }));
      },

      setActiveTab: (tabId) => {
        set((state) => {
          const exists = state.tabs.find((t) => t.id === tabId);
          if (!exists) return state;
          
          const newEntry: NavHistoryEntry = {
            tabId,
            timestamp: Date.now(),
          };
          
          return {
            activeTabId: tabId,
            navHistory: [...state.navHistory.slice(0, state.navHistoryIndex + 1), newEntry],
            navHistoryIndex: state.navHistoryIndex + 1,
          };
        });
      },

      updateTab: (tabId, updates) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, ...updates } : t)),
        }));
      },

      pinTab: (tabId) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, pinned: true } : t)),
        }));
      },

      unpinTab: (tabId) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, pinned: false } : t)),
        }));
      },

      reorderTabs: (fromIndex, toIndex) => {
        set((state) => {
          const newTabs = [...state.tabs];
          const [moved] = newTabs.splice(fromIndex, 1);
          newTabs.splice(toIndex, 0, moved);
          return { tabs: newTabs };
        });
      },

      // ===== NAVIGATION =====
      
      nextTab: () => {
        const { tabs, activeTabId } = get();
        if (tabs.length === 0) return;

        const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        get().setActiveTab(tabs[nextIndex].id);
      },

      previousTab: () => {
        const { tabs, activeTabId } = get();
        if (tabs.length === 0) return;

        const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
        const previousIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        get().setActiveTab(tabs[previousIndex].id);
      },

      goBack: () => {
        set((state) => {
          if (state.navHistoryIndex <= 0) return state;
          
          const prevEntry = state.navHistory[state.navHistoryIndex - 1];
          return {
            navHistoryIndex: state.navHistoryIndex - 1,
            activeTabId: prevEntry.tabId,
          };
        });
      },

      goForward: () => {
        set((state) => {
          if (state.navHistoryIndex >= state.navHistory.length - 1) return state;
          
          const nextEntry = state.navHistory[state.navHistoryIndex + 1];
          return {
            navHistoryIndex: state.navHistoryIndex + 1,
            activeTabId: nextEntry.tabId,
          };
        });
      },

      canGoBack: () => get().navHistoryIndex > 0,
      canGoForward: () => get().navHistoryIndex < get().navHistory.length - 1,

      // ===== UI STATE =====
      
      setTabUI: (tabId, uiPatch) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === tabId
              ? { ...t, ui: { ...(t.ui ?? DEFAULT_UI_STATE), ...uiPatch } }
              : t
          ),
        }));
      },

      getTabUI: (tabId) => {
        return get().tabs.find((t) => t.id === tabId)?.ui;
      },

      navigateToSection: (tabId, section, subSection) => {
        const { setTabUI, navHistory, navHistoryIndex } = get();
        
        setTabUI(tabId, { section, subSection });
        
        const newEntry: NavHistoryEntry = {
          tabId,
          section,
          subSection,
          timestamp: Date.now(),
        };
        
        set({
          navHistory: [...navHistory.slice(0, navHistoryIndex + 1), newEntry],
          navHistoryIndex: navHistoryIndex + 1,
        });
      },

      // ===== PREFERENCES =====
      
      setPreference: (key, value) => {
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        }));
      },

      // ===== GETTERS =====
      
      getActiveTab: () => {
        const { tabs, activeTabId } = get();
        return tabs.find((t) => t.id === activeTabId) ?? null;
      },

      getTabsByType: (type) => {
        return get().tabs.filter((t) => t.type === type);
      },
    }),
    {
      name: 'bmo-tickets-client-workspace',
      partialize: (state) => ({
        tabs: state.tabs.filter((t) => t.pinned),
        activeTabId: null,
        preferences: state.preferences,
      }),
    }
  )
);

