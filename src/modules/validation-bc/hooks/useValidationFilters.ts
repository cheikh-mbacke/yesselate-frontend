/**
 * Hook pour gérer les filtres de validation avec Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ValidationFiltres } from '../types/validationTypes';

interface ValidationFiltersState {
  filtres: ValidationFiltres;
  setFiltres: (filtres: ValidationFiltres) => void;
  resetFiltres: () => void;
}

export const useValidationFiltersStore = create<ValidationFiltersState>()(
  persist(
    (set) => ({
      filtres: {},
      setFiltres: (filtres) => set({ filtres }),
      resetFiltres: () => set({ filtres: {} }),
    }),
    {
      name: 'validation-bc-filters',
    }
  )
);

/**
 * Hook pour utiliser les filtres
 */
export function useValidationFilters() {
  const { filtres, setFiltres, resetFiltres } = useValidationFiltersStore();
  return { filtres, setFiltres, resetFiltres };
}

