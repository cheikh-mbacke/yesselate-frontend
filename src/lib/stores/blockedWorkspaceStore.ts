/**
 * Store Zustand pour le workspace Dossiers Bloqués
 * ============================================
 * 
 * Gère les onglets + l'état UI de chaque onglet (section, sous-section, explorer).
 * Module de pilotage et de résolution des blocages pour le BMO.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

/** Types d'onglets supportés dans le workspace Blocked */
export type BlockedTabType = 
  | 'inbox'           // Liste filtrée des dossiers
  | 'dossier'         // Détail d'un dossier bloqué
  | 'matrix'          // Matrice d'urgence (impact x délai)
  | 'timeline'        // Timeline chronologique des blocages
  | 'bureau'          // Vue par bureau
  | 'resolution'      // Wizard de résolution
  | 'escalation'      // Workflow d'escalade
  | 'substitution'    // Workflow de substitution
  | 'audit'           // Historique et traçabilité
  | 'analytics';      // Analytique prédictive

/** État UI d'un onglet dossier bloqué (arborescence interne) */
export type BlockedUIState = {
  section:
    | 'overview'        // Vue d'ensemble
    | 'details'         // Détails du blocage
    | 'context'         // Contexte projet/workflow
    | 'actions'         // Actions possibles
    | 'resolution'      // Résolution
    | 'escalation'      // Escalade
    | 'substitution'    // Substitution
    | 'audit';          // Audit trail
  sub?:
    | 'reason'          // Raison du blocage
    | 'impact'          // Analyse d'impact
    | 'dependencies'    // Dépendances
    | 'timeline'        // Timeline
    | 'stakeholders'    // Parties prenantes
    | 'documents'       // Documents liés
    | 'history'         // Historique
    | 'hashchain'       // Chaîne de hash
    | 'recommendations' // Recommandations IA
    | 'scenarios';      // Scénarios de résolution
  explorerOpen?: boolean;
};

export type BlockedTab = {
  id: string;
  type: BlockedTabType;
  title: string;
  icon?: string;
  data?: {
    queue?: string;
    dossierId?: string;
    impact?: 'critical' | 'high' | 'medium' | 'low';
    bureauId?: string;
    action?: string;
    batchIds?: string[];
    [key: string]: unknown;
  };
  isDirty?: boolean;
  createdAt: number;
  /** État UI interne de l'onglet (pour type 'dossier') */
  ui?: BlockedUIState;
};

type OpenTabInput = Omit<BlockedTab, 'createdAt' | 'ui'>;

/** Statistiques en temps réel */
export type BlockedStats = {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  avgDelay: number;
  avgPriority: number;
  totalAmount: number;
  overdueSLA: number;
  resolvedToday: number;
  escalatedToday: number;
  byBureau: { bureau: string; count: number; critical: number }[];
  byType: { type: string; count: number }[];
  ts: string;
};

/** Entrée du registre de décision */
export type BlockedDecisionEntry = {
  id: string;
  at: string;
  batchId?: string;
  action: 'resolution' | 'escalation' | 'substitution' | 'complement' | 'audit';
  dossierId: string;
  dossierSubject: string;
  bureau: string;
  impact: string;
  delay: number;
  amount: number;
  priority: number;
  userId: string;
  userName: string;
  userRole: string;
  details: string;
  hash: string;
};

interface BlockedWorkspaceState {
  tabs: BlockedTab[];
  activeTabId: string | null;
  
  // Stats
  stats: BlockedStats | null;
  statsLoading: boolean;
  
  // Registre des décisions
  decisionRegister: BlockedDecisionEntry[];
  lastDecisionHash: string | null;
  
  // Alias pour compatibilité
  decisions: BlockedDecisionEntry[];
  
  // Sélection
  selectedIds: Set<string>;
  
  // Préférences
  autoRefresh: boolean;
  
  // Actions tabs
  openTab: (tab: OpenTabInput) => void;
  setActiveTab: (id: string) => void;
  closeTab: (id: string) => void;
  updateTab: (id: string, patch: Partial<BlockedTab>) => void;
  closeOthers: (id: string) => void;
  closeAll: () => void;
  
  // UI State par onglet
  setTabUI: (tabId: string, uiPatch: Partial<BlockedUIState>) => void;
  getTabUI: (tabId: string) => BlockedUIState | undefined;
  
  // Stats
  setStats: (stats: BlockedStats | null) => void;
  setStatsLoading: (loading: boolean) => void;
  
  // Registre
  addDecision: (entry: Omit<BlockedDecisionEntry, 'id'>) => void;
  clearRegister: () => void;
  
  // Sélection
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: (ids?: string[]) => void;
  clearSelection: () => void;
  
  // Préférences
  setAutoRefresh: (value: boolean) => void;
}

// ============================================
// DEFAULT UI STATE
// ============================================

const DEFAULT_UI_STATE: BlockedUIState = {
  section: 'overview',
  sub: undefined,
  explorerOpen: true,
};

// ============================================
// STORE
// ============================================

export const useBlockedWorkspaceStore = create<BlockedWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      stats: null,
      statsLoading: false,
      decisionRegister: [],
      lastDecisionHash: null,
      selectedIds: new Set(),
      autoRefresh: true,
      
      // Getter alias pour decisions
      get decisions() {
        return get().decisionRegister;
      },

      // ================================
      // TABS
      // ================================
      
      openTab: (input) => {
        set((state) => {
          const existing = state.tabs.find((t) => t.id === input.id);
          if (existing) {
            return { activeTabId: input.id };
          }
          
          const newTab: BlockedTab = {
            ...input,
            createdAt: Date.now(),
            ui: input.type === 'dossier' ? { ...DEFAULT_UI_STATE } : undefined,
          };
          
          return {
            tabs: [...state.tabs, newTab],
            activeTabId: input.id,
          };
        });
      },

      setActiveTab: (id) => {
        set({ activeTabId: id });
      },

      closeTab: (id) => {
        set((state) => {
          const idx = state.tabs.findIndex((t) => t.id === id);
          if (idx === -1) return state;

          const newTabs = state.tabs.filter((t) => t.id !== id);
          let newActive = state.activeTabId;

          if (state.activeTabId === id) {
            if (newTabs.length === 0) {
              newActive = null;
            } else if (idx >= newTabs.length) {
              newActive = newTabs[newTabs.length - 1].id;
            } else {
              newActive = newTabs[idx].id;
            }
          }

          return { tabs: newTabs, activeTabId: newActive };
        });
      },

      updateTab: (id, patch) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }));
      },

      closeOthers: (id) => {
        set((state) => ({
          tabs: state.tabs.filter((t) => t.id === id),
          activeTabId: id,
        }));
      },

      closeAll: () => {
        set({ tabs: [], activeTabId: null });
      },

      // ================================
      // UI State par onglet
      // ================================
      
      setTabUI: (tabId, uiPatch) => {
        set((state) => ({
          tabs: state.tabs.map((t) => {
            if (t.id !== tabId) return t;
            return {
              ...t,
              ui: {
                ...(t.ui ?? DEFAULT_UI_STATE),
                ...uiPatch,
              },
            };
          }),
        }));
      },

      getTabUI: (tabId) => {
        const tab = get().tabs.find((t) => t.id === tabId);
        return tab?.ui;
      },

      // ================================
      // STATS
      // ================================
      
      setStats: (stats) => {
        set({ stats });
      },

      setStatsLoading: (loading) => {
        set({ statsLoading: loading });
      },

      // ================================
      // REGISTRE DÉCISIONS
      // ================================
      
      addDecision: (entry) => {
        const id = `DEC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({
          decisionRegister: [{ ...entry, id }, ...state.decisionRegister].slice(0, 500),
          lastDecisionHash: entry.hash,
        }));
      },

      clearRegister: () => {
        set({ decisionRegister: [], lastDecisionHash: null });
      },

      // ================================
      // SÉLECTION
      // ================================
      
      toggleSelected: (id) => {
        set((state) => {
          const next = new Set(state.selectedIds);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return { selectedIds: next };
        });
      },

      selectAll: (ids) => {
        set((state) => {
          const next = new Set(state.selectedIds);
          ids.forEach((id) => next.add(id));
          return { selectedIds: next };
        });
      },

      deselectAll: (ids) => {
        set((state) => {
          const next = new Set(state.selectedIds);
          if (ids) {
            ids.forEach((id) => next.delete(id));
          } else {
            next.clear();
          }
          return { selectedIds: next };
        });
      },

      clearSelection: () => {
        set({ selectedIds: new Set() });
      },

      // ================================
      // PRÉFÉRENCES
      // ================================
      
      setAutoRefresh: (value) => {
        set({ autoRefresh: value });
      },
    }),
    {
      name: 'bmo-blocked-workspace',
      partialize: (state) => ({
        tabs: state.tabs.slice(0, 20),
        activeTabId: state.activeTabId,
        autoRefresh: state.autoRefresh,
        // Ne pas persister: stats, decisionRegister, selectedIds
      }),
    }
  )
);

