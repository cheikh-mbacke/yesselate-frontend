/**
 * Store Zustand pour la navigation Validation-BC
 * Gestion de l'état de navigation hiérarchique
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ================================
// Types
// ================================

export type ValidationBCMainCategory =
  | 'overview'
  | 'types'
  | 'statut'
  | 'historique'
  | 'analyse';

export type ValidationBCSubCategory =
  | 'indicateurs'
  | 'stats'
  | 'tendances'
  | 'bc'
  | 'factures'
  | 'avenants'
  | 'en-attente'
  | 'valides'
  | 'rejetes'
  | 'urgents'
  | 'validations'
  | 'rejets'
  | 'validateurs'
  | 'services'
  | 'regles-metier'
  | null;

interface ValidationBCNavigationState {
  mainCategory: ValidationBCMainCategory;
  subCategory: ValidationBCSubCategory;
}

interface ValidationBCCommandCenterState {
  // Navigation
  navigation: ValidationBCNavigationState;
  navigationHistory: ValidationBCNavigationState[];

  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;
  kpiBarCollapsed: boolean;

  // Filtres
  filtersPanelOpen: boolean;

  // Actions Navigation
  navigate: (
    main: ValidationBCMainCategory,
    sub?: ValidationBCSubCategory | null
  ) => void;
  goBack: () => void;
  resetNavigation: () => void;

  // Actions UI
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationsPanel: () => void;
  toggleKpiBar: () => void;
  toggleFiltersPanel: () => void;
}

// ================================
// Default State
// ================================

const defaultNavigation: ValidationBCNavigationState = {
  mainCategory: 'overview',
  subCategory: 'indicateurs',
};

// ================================
// Store Creation
// ================================

export const useValidationBCCommandCenterStore =
  create<ValidationBCCommandCenterState>()(
    persist(
      (set, get) => ({
        // Initial state
        navigation: defaultNavigation,
        navigationHistory: [],

        sidebarCollapsed: false,
        fullscreen: false,
        commandPaletteOpen: false,
        notificationsPanelOpen: false,
        kpiBarCollapsed: false,
        filtersPanelOpen: false,

        // Navigation Actions
        navigate: (main, sub = null) => {
          const current = get().navigation;
          set((state) => ({
            navigationHistory: [...state.navigationHistory.slice(-9), current],
            navigation: {
              mainCategory: main,
              subCategory: sub,
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

        // UI Actions
        toggleSidebar: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        toggleFullscreen: () =>
          set((state) => ({ fullscreen: !state.fullscreen })),
        toggleCommandPalette: () =>
          set((state) => ({
            commandPaletteOpen: !state.commandPaletteOpen,
          })),
        toggleNotificationsPanel: () =>
          set((state) => ({
            notificationsPanelOpen: !state.notificationsPanelOpen,
          })),
        toggleKpiBar: () =>
          set((state) => ({ kpiBarCollapsed: !state.kpiBarCollapsed })),
        toggleFiltersPanel: () =>
          set((state) => ({ filtersPanelOpen: !state.filtersPanelOpen })),
      }),
      {
        name: 'validation-bc-command-center',
        partialize: (state) => ({
          navigation: state.navigation,
          sidebarCollapsed: state.sidebarCollapsed,
          kpiBarCollapsed: state.kpiBarCollapsed,
        }),
      }
    )
  );
