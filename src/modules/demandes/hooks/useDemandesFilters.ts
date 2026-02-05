/**
 * Hook pour gérer les filtres des demandes avec Zustand
 */

import { create } from 'zustand';
import type { DemandeFilters } from '../types/demandesTypes';

interface DemandesFiltersStore {
  filters: DemandeFilters;
  setFilters: (filters: Partial<DemandeFilters>) => void;
  resetFilters: () => void;
  setStatus: (status: string[]) => void;
  setService: (service: string[]) => void;
  setSearch: (search: string) => void;
  setDateRange: (from: Date | undefined, to: Date | undefined) => void;
}

const initialFilters: DemandeFilters = {
  status: undefined,
  priority: undefined,
  service: undefined,
  dateRange: undefined,
  search: undefined,
};

export const useDemandesFilters = create<DemandesFiltersStore>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: initialFilters }),
  setStatus: (status) =>
    set((state) => ({
      filters: { ...state.filters, status: status as any },
    })),
  setService: (service) =>
    set((state) => ({
      filters: { ...state.filters, service: service as any },
    })),
  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search },
    })),
  setDateRange: (from, to) =>
    set((state) => ({
      filters: {
        ...state.filters,
        dateRange: from && to ? { from, to } : undefined,
      },
    })),
}));

