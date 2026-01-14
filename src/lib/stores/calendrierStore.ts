/**
 * Store Zustand pour le module Calendrier & Planification
 * Gère l'état des onglets, filtres, et données
 * Architecture alignée avec analyticsCommandCenterStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CalendrierTab,
  CalendrierDomain,
  CalendrierSection,
  CalendrierView,
  CalendrierNavigationState,
  CalendrierContextFilters,
  FiltresCalendrier,
  KPICalendrier,
  SLA,
  Conflit,
  EcheanceOperationnelle,
  JalonProjet,
  Absence,
  Mission,
  Delegation,
  InstanceReunion,
  SuggestionIA,
  StatutSynchronisation,
} from '@/lib/types/calendrier.types';
import type {
  CalendrierModalState,
  CalendrierModalType,
  CalendrierDetailPanelState,
  CalendrierDetailPanelType,
} from '@/lib/types/calendrier-modal.types';

interface KPIConfig {
  visible: boolean;
  collapsed: boolean;
  refreshInterval: number;
  autoRefresh: boolean;
}

interface CalendrierState {
  // Navigation (ancien système - à déprécier)
  ongletActif: CalendrierTab;
  setOngletActif: (onglet: CalendrierTab) => void;

  // Navigation hiérarchique (nouveau système)
  navigation: CalendrierNavigationState;
  navigationHistory: CalendrierNavigationState[];
  navigate: (
    domain: CalendrierDomain,
    section?: CalendrierSection,
    view?: CalendrierView,
    period?: 'week' | 'month' | 'quarter'
  ) => void;
  goBack: () => void;
  resetNavigation: () => void;

  // UI State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;
  filtersPanelOpen: boolean;
  toggleCommandPalette: () => void;
  toggleNotificationsPanel: () => void;
  setFiltersPanelOpen: (open: boolean) => void;

  // Modales
  modal: CalendrierModalState;
  modalStack: CalendrierModalState[];
  openModal: (
    type: CalendrierModalType,
    data?: Record<string, any>,
    options?: Partial<CalendrierModalState>
  ) => void;
  closeModal: () => void;
  pushModal: (
    type: CalendrierModalType,
    data?: Record<string, any>,
    options?: Partial<CalendrierModalState>
  ) => void;
  popModal: () => void;

  // Detail Panel
  detailPanel: CalendrierDetailPanelState;
  openDetailPanel: (
    type: CalendrierDetailPanelType,
    entityId: string,
    data?: Record<string, any>
  ) => void;
  closeDetailPanel: () => void;

  // KPIs
  kpis: KPICalendrier | null;
  setKPIs: (kpis: KPICalendrier) => void;
  kpiConfig: KPIConfig;
  setKPIConfig: (config: Partial<KPIConfig>) => void;

  // Filtres
  filtres: FiltresCalendrier;
  setFiltres: (filtres: Partial<FiltresCalendrier>) => void;
  resetFiltres: () => void;

  // Données
  slas: SLA[];
  setSLAs: (slas: SLA[]) => void;
  conflits: Conflit[];
  setConflits: (conflits: Conflit[]) => void;
  echeances: EcheanceOperationnelle[];
  setEcheances: (echeances: EcheanceOperationnelle[]) => void;
  jalons: JalonProjet[];
  setJalons: (jalons: JalonProjet[]) => void;
  absences: Absence[];
  setAbsences: (absences: Absence[]) => void;
  missions: Mission[];
  setMissions: (missions: Mission[]) => void;
  delegations: Delegation[];
  setDelegations: (delegations: Delegation[]) => void;
  instances: InstanceReunion[];
  setInstances: (instances: InstanceReunion[]) => void;
  suggestionsIA: SuggestionIA[];
  setSuggestionsIA: (suggestions: SuggestionIA[]) => void;

  // Synchronisation
  statutsSynchronisation: StatutSynchronisation[];
  setStatutsSynchronisation: (statuts: StatutSynchronisation[]) => void;

  // Vue calendrier
  vueCalendrier: 'liste' | 'calendrier';
  setVueCalendrier: (vue: 'liste' | 'calendrier') => void;
  periodeCalendrier: 'jour' | 'semaine' | 'mois';
  setPeriodeCalendrier: (periode: 'jour' | 'semaine' | 'mois') => void;

  // Filtres contextuels
  contextFilters: CalendrierContextFilters;
  setContextFilters: (filters: Partial<CalendrierContextFilters>) => void;
  resetContextFilters: () => void;
}

const FILTRES_DEFAUT: FiltresCalendrier = {};

const defaultKPIConfig: KPIConfig = {
  visible: true,
  collapsed: false,
  refreshInterval: 30,
  autoRefresh: true,
};

const defaultModalState: CalendrierModalState = {
  type: null,
  isOpen: false,
  data: {},
  size: 'lg',
};

const defaultDetailPanelState: CalendrierDetailPanelState = {
  isOpen: false,
  type: null,
  entityId: null,
  data: {},
};

const defaultNavigation: CalendrierNavigationState = {
  domain: 'overview',
  section: null,
  view: null,
  period: 'month',
};

export const useCalendrierStore = create<CalendrierState>()(
  persist(
    (set, get) => ({
      // Navigation (ancien système)
      ongletActif: 'vue-ensemble',
      setOngletActif: (onglet) => set({ ongletActif: onglet }),

      // Navigation hiérarchique (nouveau système)
      navigation: defaultNavigation,
      navigationHistory: [],
      navigate: (domain, section = null, view = null, period = 'month') => {
        const current = get().navigation;
        set((state) => ({
          navigationHistory: [...state.navigationHistory, current],
          navigation: {
            domain,
            section,
            view,
            period,
          },
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

      // UI State
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      commandPaletteOpen: false,
      notificationsPanelOpen: false,
      filtersPanelOpen: false,
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      toggleNotificationsPanel: () => set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),
      setFiltersPanelOpen: (open: boolean) => set({ filtersPanelOpen: open }),

      // Modales
      modal: defaultModalState,
      modalStack: [],
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

      // Detail Panel
      detailPanel: defaultDetailPanelState,
      openDetailPanel: (type, entityId, data = {}) => {
        set({
          detailPanel: {
            isOpen: true,
            type,
            entityId,
            data,
          },
        });
      },
      closeDetailPanel: () => {
        set({
          detailPanel: defaultDetailPanelState,
        });
      },

      // KPIs
      kpis: null,
      setKPIs: (kpis) => set({ kpis }),
      kpiConfig: defaultKPIConfig,
      setKPIConfig: (config) => set((state) => ({ kpiConfig: { ...state.kpiConfig, ...config } })),

      // Filtres
      filtres: FILTRES_DEFAUT,
      setFiltres: (nouveauxFiltres) =>
        set((state) => ({
          filtres: { ...state.filtres, ...nouveauxFiltres },
        })),
      resetFiltres: () => set({ filtres: FILTRES_DEFAUT }),

      // Données
      slas: [],
      setSLAs: (slas) => set({ slas }),
      conflits: [],
      setConflits: (conflits) => set({ conflits }),
      echeances: [],
      setEcheances: (echeances) => set({ echeances }),
      jalons: [],
      setJalons: (jalons) => set({ jalons }),
      absences: [],
      setAbsences: (absences) => set({ absences }),
      missions: [],
      setMissions: (missions) => set({ missions }),
      delegations: [],
      setDelegations: (delegations) => set({ delegations }),
      instances: [],
      setInstances: (instances) => set({ instances }),
      suggestionsIA: [],
      setSuggestionsIA: (suggestions) => set({ suggestionsIA: suggestions }),

      // Synchronisation
      statutsSynchronisation: [],
      setStatutsSynchronisation: (statuts) => set({ statutsSynchronisation: statuts }),

      // Vue calendrier
      vueCalendrier: 'liste',
      setVueCalendrier: (vue) => set({ vueCalendrier: vue }),
      periodeCalendrier: 'mois',
      setPeriodeCalendrier: (periode) => set({ periodeCalendrier: periode }),

      // Filtres contextuels
      contextFilters: {
        chantierId: null,
        teamId: null,
        eventType: null,
      },
      setContextFilters: (filters) =>
        set((state) => ({
          contextFilters: { ...state.contextFilters, ...filters },
        })),
      resetContextFilters: () =>
        set({
          contextFilters: {
            chantierId: null,
            teamId: null,
            eventType: null,
          },
        }),
    }),
    {
      name: 'calendrier-storage',
      partialize: (state) => ({
        ongletActif: state.ongletActif,
        navigation: state.navigation,
        sidebarCollapsed: state.sidebarCollapsed,
        kpiConfig: state.kpiConfig,
        filtres: state.filtres,
        periodeCalendrier: state.periodeCalendrier,
      }),
    }
  )
);
