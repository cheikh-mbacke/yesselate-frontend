/**
 * Store Zustand pour la navigation du module Calendrier
 * Gère la navigation à 3 niveaux (main, sub, sub-sub)
 */

import { create } from 'zustand';
import type { CalendrierMainCategory } from '@/modules/calendrier/types/calendrierNavigationTypes';

interface CalendrierNavigationState {
  mainCategory: CalendrierMainCategory;
  subCategory?: string;
  subSubCategory?: string;
  filter?: string;
}

interface CalendrierNavigationHistory {
  mainCategory: CalendrierMainCategory;
  subCategory?: string;
  subSubCategory?: string;
  filter?: string;
}

interface CalendrierCommandCenterStore {
  navigation: CalendrierNavigationState;
  navigationHistory: CalendrierNavigationHistory[];
  sidebarCollapsed: boolean;

  // Actions
  navigate: (
    mainCategory: CalendrierMainCategory,
    subCategory?: string | null,
    subSubCategory?: string | null,
    filter?: string | null
  ) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  resetNavigation: () => void;
}

const defaultNavigation: CalendrierNavigationState = {
  mainCategory: 'overview',
  subCategory: undefined,
  subSubCategory: undefined,
  filter: undefined,
};

export const useCalendrierCommandCenterStore = create<CalendrierCommandCenterStore>((set, get) => ({
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
            subCategory: current.subCategory,
            subSubCategory: current.subSubCategory,
            filter: current.filter,
          },
        ],
      }));
    }

    set({
      navigation: {
        mainCategory,
        subCategory: subCategory || undefined,
        subSubCategory: subSubCategory || undefined,
        filter: filter || undefined,
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
        subCategory: previous.subCategory,
        subSubCategory: previous.subSubCategory,
        filter: previous.filter,
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

  resetNavigation: () => {
    set({
      navigation: defaultNavigation,
      navigationHistory: [],
    });
  },
}));

