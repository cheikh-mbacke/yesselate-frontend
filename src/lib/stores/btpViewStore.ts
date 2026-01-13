/**
 * Store pour gérer les vues et modales BTP Analytics
 * Gère les modes de vue, l'état des modales, et les préférences utilisateur
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ViewMode = 'grid' | 'dashboard' | 'comparative';

interface ModalState {
  export: boolean;
  simulation: boolean;
  comparison: boolean;
  filters: boolean;
  search: boolean;
  [key: string]: boolean;
}

interface BTPViewState {
  // Mode de vue actuel
  viewMode: ViewMode;
  
  // État des modales
  modals: ModalState;
  
  // État du panneau de filtres
  filtersPanelOpen: boolean;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  toggleModal: (modalName: string) => void;
  toggleFiltersPanel: () => void;
  closeAllModals: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const defaultModals: ModalState = {
  export: false,
  simulation: false,
  comparison: false,
  filters: false,
  search: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useBTPViewStore = create<BTPViewState>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      modals: defaultModals,
      filtersPanelOpen: false,

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      openModal: (modalName) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalName]: true,
          },
        }));
      },

      closeModal: (modalName) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalName]: false,
          },
        }));
      },

      toggleModal: (modalName) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalName]: !state.modals[modalName],
          },
        }));
      },

      toggleFiltersPanel: () => {
        set((state) => ({
          filtersPanelOpen: !state.filtersPanelOpen,
        }));
      },

      closeAllModals: () => {
        set({
          modals: defaultModals,
          filtersPanelOpen: false,
        });
      },
    }),
    {
      name: 'btp-view-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
      }),
    }
  )
);

