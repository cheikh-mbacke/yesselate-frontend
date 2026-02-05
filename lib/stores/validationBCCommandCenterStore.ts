/**
 * Store Zustand pour la navigation du module Validation-BC
 * Gère la navigation hiérarchique et l'état de la sidebar
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ValidationBCMainCategory = 
  | 'overview' 
  | 'types' 
  | 'statut' 
  | 'historique' 
  | 'analyse';

interface ValidationBCNavigation {
  mainCategory: ValidationBCMainCategory;
  subCategory: string | null;
  subSubCategory: string | null;
}

interface NavigationHistoryItem {
  mainCategory: ValidationBCMainCategory;
  subCategory: string | null;
  subSubCategory: string | null;
}

interface ValidationBCCommandCenterState {
  navigation: ValidationBCNavigation;
  navigationHistory: NavigationHistoryItem[];
  sidebarCollapsed: boolean;
  
  // Actions
  navigate: (
    mainCategory: ValidationBCMainCategory,
    subCategory: string | null,
    subSubCategory: string | null
  ) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const initialNavigation: ValidationBCNavigation = {
  mainCategory: 'overview',
  subCategory: 'indicateurs',
  subSubCategory: null,
};

export const useValidationBCCommandCenterStore = create<ValidationBCCommandCenterState>()(
  persist(
    (set, get) => ({
      navigation: initialNavigation,
      navigationHistory: [],
      sidebarCollapsed: false,

      navigate: (mainCategory, subCategory, subSubCategory) => {
        const current = get().navigation;
        
        // Ajouter à l'historique si on change de catégorie principale
        if (current.mainCategory !== mainCategory || current.subCategory !== subCategory) {
          set((state) => ({
            navigation: {
              mainCategory,
              subCategory,
              subSubCategory,
            },
            navigationHistory: [
              ...state.navigationHistory,
              {
                mainCategory: current.mainCategory,
                subCategory: current.subCategory,
                subSubCategory: current.subSubCategory,
              },
            ].slice(-10), // Garder les 10 derniers
          }));
        } else {
          set({
            navigation: {
              mainCategory,
              subCategory,
              subSubCategory,
            },
          });
        }
      },

      goBack: () => {
        const history = get().navigationHistory;
        if (history.length === 0) return;

        const previous = history[history.length - 1];
        set((state) => ({
          navigation: {
            mainCategory: previous.mainCategory,
            subCategory: previous.subCategory,
            subSubCategory: previous.subSubCategory,
          },
          navigationHistory: state.navigationHistory.slice(0, -1),
        }));
      },

      toggleSidebar: () => {
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        }));
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },
    }),
    {
      name: 'validation-bc-command-center',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        navigation: state.navigation,
      }),
    }
  )
);

