/**
 * Store Zustand pour la navigation du module Alerts
 * Gère la navigation à 3 niveaux (main, sub, sub-sub)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AlertsMainCategory } from '@/modules/alerts/types/alertsNavigationTypes';

interface AlertsNavigationState {
  mainCategory: AlertsMainCategory;
  subCategory?: string | null;
  subSubCategory?: string | null;
  filter?: string | null;
}

interface AlertsNavigationHistory {
  mainCategory: AlertsMainCategory;
  subCategory?: string | null;
  subSubCategory?: string | null;
  filter?: string | null;
}

interface AlertsCommandCenterStore {
  navigation: AlertsNavigationState;
  navigationHistory: AlertsNavigationHistory[];
  sidebarCollapsed: boolean;

  // Actions
  navigate: (
    mainCategory: AlertsMainCategory,
    subCategory?: string | null,
    subSubCategory?: string | null,
    filter?: string | null
  ) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const defaultNavigation: AlertsNavigationState = {
  mainCategory: 'overview',
  subCategory: null,
  subSubCategory: null,
  filter: null,
};

export const useAlertsCommandCenterStore = create<AlertsCommandCenterStore>()(
  persist(
    (set, get) => ({
      navigation: defaultNavigation,
      navigationHistory: [],
      sidebarCollapsed: false,

      navigate: (mainCategory, subCategory, subSubCategory, filter) => {
        const current = get().navigation;
        
        // Ajouter à l'historique si on change de catégorie principale
        if (current.mainCategory !== mainCategory || current.subCategory !== subCategory) {
          set((state) => ({
            navigationHistory: [
              ...state.navigationHistory.slice(-9), // Garder max 10 entrées
              {
                mainCategory: current.mainCategory,
                subCategory: current.subCategory || null,
                subSubCategory: current.subSubCategory || null,
                filter: current.filter || null,
              },
            ],
          }));
        }

        set({
          navigation: {
            mainCategory,
            subCategory: subCategory || null,
            subSubCategory: subSubCategory || null,
            filter: filter || null,
          },
        });
      },

      goBack: () => {
        const history = get().navigationHistory;
        if (history.length === 0) return;

        const previous = history[history.length - 1];
        set((state) => ({
          navigation: {
            mainCategory: previous.mainCategory,
            subCategory: previous.subCategory || null,
            subSubCategory: previous.subSubCategory || null,
            filter: previous.filter || null,
          },
          navigationHistory: state.navigationHistory.slice(0, -1),
        }));
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },
    }),
    {
      name: 'alerts-command-center-storage',
      partialize: (state) => ({
        navigation: state.navigation,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

