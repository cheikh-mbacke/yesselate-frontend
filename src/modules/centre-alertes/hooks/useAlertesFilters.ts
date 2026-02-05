/**
 * Hook pour gérer les filtres des alertes avec Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AlerteFiltres } from '../types/alertesTypes';

interface AlertesFiltersState {
  filtres: AlerteFiltres;
  setFiltres: (filtres: AlerteFiltres) => void;
  resetFiltres: () => void;
}

export const useAlertesFiltersStore = create<AlertesFiltersState>()(
  persist(
    (set) => ({
      filtres: {},
      setFiltres: (filtres) => set({ filtres }),
      resetFiltres: () => set({ filtres: {} }),
    }),
    {
      name: 'centre-alertes-filters',
    }
  )
);

/**
 * Hook pour utiliser les filtres
 */
export function useAlertesFilters() {
  const { filtres, setFiltres, resetFiltres } = useAlertesFiltersStore();
  return { filtres, setFiltres, resetFiltres };
}

