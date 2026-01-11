/**
 * Store Zustand pour le Centre de Commandement Demandes RH
 * Architecture cohérente avec Analytics Command Center
 * Gestion centralisée de l'état : navigation, filtres, modals, sélections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Catégories principales (niveau 1)
export type DemandesRHMainCategory =
  | 'overview'      // Vue d'ensemble
  | 'conges'        // Congés
  | 'depenses'      // Dépenses
  | 'deplacements'  // Déplacements
  | 'avances'       // Avances
  | 'urgent'        // Urgentes
  | 'pending'       // En attente
  | 'validated'     // Validées
  | 'analytics';    // Analytics

// Sous-catégories (niveau 2)
export type DemandesRHSubCategory = string | null;

// Filtre (niveau 3)
export type DemandesRHFilter = string | null;

// État de navigation
export interface DemandesRHNavigationState {
  mainCategory: DemandesRHMainCategory;
  subCategory: DemandesRHSubCategory;
  filter: DemandesRHFilter;
}

// Types de modals
export type DemandesRHModalType =
  | 'stats'
  | 'export'
  | 'settings'
  | 'shortcuts'
  | 'help'
  | 'confirm'
  | 'filters'
  | 'detail'; // Modal de détail avec pattern overlay

// État des modals
export interface DemandesRHModalState {
  type: DemandesRHModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Panel de détail latéral (si nécessaire)
export interface DemandesRHDetailPanelState {
  isOpen: boolean;
  type: 'demande' | null;
  demandeId: string | null;
  data: Record<string, any>;
}

// Filtres actifs
export interface DemandesRHActiveFilters {
  types: string[]; // 'conges' | 'depenses' | 'deplacements' | 'avances'
  statuses: string[]; // 'en_attente' | 'validee' | 'rejetee' | 'annulee'
  priorities: ('normale' | 'urgente' | 'critique')[];
  bureaux: string[];
  agents: string[];
  dateRange: { start: Date | null; end: Date | null };
  customFilters: Record<string, any>;
}

// Filtre sauvegardé
export interface SavedFilter {
  id: string;
  name: string;
  filters: DemandesRHActiveFilters;
  createdAt: string;
}

// Configuration KPIs
export interface DemandesRHKPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number; // en secondes
  autoRefresh: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface DemandesRHCommandCenterState {
  // Navigation
  navigation: DemandesRHNavigationState;
  navigationHistory: DemandesRHNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;

  // Modal
  modal: DemandesRHModalState;
  modalStack: DemandesRHModalState[]; // Pour les modales empilées

  // Panel de détail
  detailPanel: DemandesRHDetailPanelState;

  // Detail Modal (pattern overlay)
  detailModalOpen: boolean;
  selectedDemandeId: string | null;

  // Filtres
  filters: DemandesRHActiveFilters;
  savedFilters: SavedFilter[];

  // KPIs
  kpiConfig: DemandesRHKPIConfig;

  // Sélections
  selectedItems: string[];

  // Recherche
  globalSearch: string;

  // Actions Navigation
  navigate: (
    main: DemandesRHMainCategory,
    sub?: DemandesRHSubCategory,
    filter?: DemandesRHFilter
  ) => void;
  goBack: () => void;
  resetNavigation: () => void;

  // Actions UI
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationsPanel: () => void;

  // Actions Modal
  openModal: (
    type: DemandesRHModalType,
    data?: Record<string, any>,
    options?: Partial<DemandesRHModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: DemandesRHModalType,
    data?: Record<string, any>,
    options?: Partial<DemandesRHModalState>
  ) => void;
  popModal: () => void;

  // Actions Detail Panel
  openDetailPanel: (
    type: 'demande',
    demandeId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // Actions Detail Modal (pattern overlay)
  openDetailModal: (demandeId: string) => void;
  closeDetailModal: () => void;
  setSelectedDemandeId: (id: string | null) => void;

  // Actions Filtres
  setFilter: (key: keyof DemandesRHActiveFilters, value: any) => void;
  resetFilters: () => void;
  saveFilter: (name: string) => string;
  loadFilter: (id: string) => void;
  deleteFilter: (id: string) => void;

  // Actions KPIs
  setKPIConfig: (config: Partial<DemandesRHKPIConfig>) => void;

  // Actions Sélection
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;

  // Actions Recherche
  setGlobalSearch: (term: string) => void;

  // Refresh
  startRefresh: () => void;
  endRefresh: () => void;
  isRefreshing: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const defaultNavigation: DemandesRHNavigationState = {
  mainCategory: 'overview',
  subCategory: null,
  filter: null,
};

const defaultFilters: DemandesRHActiveFilters = {
  types: [],
  statuses: [],
  priorities: [],
  bureaux: [],
  agents: [],
  dateRange: { start: null, end: null },
  customFilters: {},
};

const defaultKPIConfig: DemandesRHKPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30, // 30 secondes
  autoRefresh: true,
};

const defaultModalState: DemandesRHModalState = {
  type: null,
  isOpen: false,
  data: {},
  size: 'lg',
};

const defaultDetailPanelState: DemandesRHDetailPanelState = {
  isOpen: false,
  type: null,
  demandeId: null,
  data: {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useDemandesRHCommandCenterStore = create<DemandesRHCommandCenterState>()(
  persist(
    (set, get) => ({
      // Initial state
      navigation: defaultNavigation,
      navigationHistory: [],

      sidebarCollapsed: false,
      fullscreen: false,
      commandPaletteOpen: false,
      notificationsPanelOpen: false,

      modal: defaultModalState,
      modalStack: [],

      detailPanel: defaultDetailPanelState,

      detailModalOpen: false,
      selectedDemandeId: null,

      filters: { ...defaultFilters },
      savedFilters: [],

      kpiConfig: { ...defaultKPIConfig },

      selectedItems: [],
      globalSearch: '',

      isRefreshing: false,

      // Navigation Actions
      navigate: (main, sub = null, filter = null) => {
        const current = get().navigation;
        set((state) => ({
          navigationHistory: [...state.navigationHistory.slice(-9), current],
          navigation: {
            mainCategory: main,
            subCategory: sub,
            filter: filter,
          },
          // Reset selection on navigation
          selectedItems: [],
        }));
      },

      goBack: () => {
        const history = get().navigationHistory;
        if (history.length > 0) {
          const previous = history[history.length - 1];
          set({
            navigation: previous,
            navigationHistory: history.slice(0, -1),
          });
        }
      },

      resetNavigation: () => {
        set({
          navigation: defaultNavigation,
          navigationHistory: [],
        });
      },

      // UI Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleFullscreen: () => {
        const newFullscreen = !get().fullscreen;
        if (newFullscreen) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
        set({ fullscreen: newFullscreen });
      },
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      toggleNotificationsPanel: () =>
        set((state) => ({
          notificationsPanelOpen: !state.notificationsPanelOpen,
        })),

      // Modal Actions
      openModal: (type, data = {}, options = {}) => {
        set({
          modal: {
            type,
            isOpen: true,
            data,
            size: options.size || 'lg',
          },
        });
      },

      closeModal: () => {
        set({
          modal: defaultModalState,
        });
      },

      pushModal: (type, data = {}, options = {}) => {
        const current = get().modal;
        if (current.isOpen) {
          set((state) => ({
            modalStack: [...state.modalStack, current],
            modal: {
              type,
              isOpen: true,
              data,
              size: options.size || 'lg',
            },
          }));
        } else {
          get().openModal(type, data, options);
        }
      },

      popModal: () => {
        const stack = get().modalStack;
        if (stack.length > 0) {
          const previous = stack[stack.length - 1];
          set({
            modal: previous,
            modalStack: stack.slice(0, -1),
          });
        } else {
          get().closeModal();
        }
      },

      // Detail Panel Actions
      openDetailPanel: (type, demandeId, data = {}) => {
        set({
          detailPanel: {
            isOpen: true,
            type,
            demandeId,
            data,
          },
        });
      },

      closeDetailPanel: () => {
        set({
          detailPanel: defaultDetailPanelState,
        });
      },

      // Detail Modal Actions (pattern overlay)
      openDetailModal: (demandeId) => {
        set({
          detailModalOpen: true,
          selectedDemandeId: demandeId,
        });
      },

      closeDetailModal: () => {
        set({
          detailModalOpen: false,
          selectedDemandeId: null,
        });
      },

      setSelectedDemandeId: (id) => {
        set({
          selectedDemandeId: id,
          detailModalOpen: id !== null,
        });
      },

      // Filter Actions
      setFilter: (key, value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        }));
      },

      resetFilters: () => set({ filters: { ...defaultFilters } }),

      saveFilter: (name) => {
        const currentFilters = get().filters;
        const newFilter: SavedFilter = {
          id: `filter-${Date.now()}`,
          name,
          filters: { ...currentFilters },
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          savedFilters: [...state.savedFilters, newFilter],
        }));
        return newFilter.id;
      },

      loadFilter: (id) => {
        const saved = get().savedFilters.find((f) => f.id === id);
        if (saved) {
          set({ filters: { ...saved.filters } });
        }
      },

      deleteFilter: (id) => {
        set((state) => ({
          savedFilters: state.savedFilters.filter((f) => f.id !== id),
        }));
      },

      // KPI Actions
      setKPIConfig: (config) => {
        set((state) => ({
          kpiConfig: { ...state.kpiConfig, ...config },
        }));
      },

      // Selection Actions
      selectItem: (id) => {
        set((state) => ({
          selectedItems: state.selectedItems.includes(id)
            ? state.selectedItems
            : [...state.selectedItems, id],
        }));
      },

      deselectItem: (id) => {
        set((state) => ({
          selectedItems: state.selectedItems.filter((i) => i !== id),
        }));
      },

      selectAll: (ids) => set({ selectedItems: ids }),

      clearSelection: () => set({ selectedItems: [] }),

      toggleSelection: (id) => {
        const state = get();
        if (state.selectedItems.includes(id)) {
          state.deselectItem(id);
        } else {
          state.selectItem(id);
        }
      },

      // Search
      setGlobalSearch: (term) => set({ globalSearch: term }),

      // Refresh
      startRefresh: () => set({ isRefreshing: true }),
      endRefresh: () => set({ isRefreshing: false }),
    }),
    {
      name: 'demandes-rh-command-center-storage',
      // Ne persister que ce qui est nécessaire
      partialize: (state) => ({
        navigation: state.navigation,
        sidebarCollapsed: state.sidebarCollapsed,
        filters: state.filters,
        savedFilters: state.savedFilters,
        kpiConfig: state.kpiConfig,
        // Ne pas persister: modals, selections, search, detailModal, etc.
      }),
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export const useDemandesRHNavigation = () => {
  const { navigation, navigate, goBack, resetNavigation } = useDemandesRHCommandCenterStore();
  return { navigation, navigate, goBack, resetNavigation };
};

