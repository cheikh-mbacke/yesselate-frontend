/**
 * Store Zustand pour les filtres et stats du module Calendrier
 * Gère l'état des filtres, période, vue active, et statistiques
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PeriodeVue, ModeVue, CalendrierFilters, CalendrierStats } from '../types/calendrierTypes';

interface CalendrierFiltersState {
  // Filtres
  periode: PeriodeVue;
  vue: ModeVue;
  chantier_id: number | null;
  equipe_id: number | null;
  date_debut: string | null;
  date_fin: string | null;

  // Actions
  setPeriode: (periode: PeriodeVue) => void;
  setVue: (vue: ModeVue) => void;
  setChantierId: (chantier_id: number | null) => void;
  setEquipeId: (equipe_id: number | null) => void;
  setDateRange: (date_debut: string | null, date_fin: string | null) => void;
  resetFilters: () => void;
  getFilters: () => CalendrierFilters;

  // Stats
  stats: CalendrierStats | null;
  setStats: (stats: CalendrierStats) => void;
}

const defaultStats: CalendrierStats = {
  jalons_at_risk_count: 0,
  jalons_retard_count: 0,
  jalons_total_count: 0,
  retards_detectes_count: 0,
  sur_allocation_ressources_count: 0,
};

export const useCalendrierFiltersStore = create<CalendrierFiltersState>()(
  persist(
    (set, get) => ({
      // État initial
      periode: "mois",
      vue: "calendrier",
      chantier_id: null,
      equipe_id: null,
      date_debut: null,
      date_fin: null,
      stats: null,

      // Actions
      setPeriode: (periode) => set({ periode }),
      setVue: (vue) => set({ vue }),
      setChantierId: (chantier_id) => set({ chantier_id }),
      setEquipeId: (equipe_id) => set({ equipe_id }),
      setDateRange: (date_debut, date_fin) => set({ date_debut, date_fin }),
      resetFilters: () =>
        set({
          periode: "mois",
          vue: "calendrier",
          chantier_id: null,
          equipe_id: null,
          date_debut: null,
          date_fin: null,
        }),
      getFilters: () => {
        const state = get();
        return {
          periode: state.periode,
          vue: state.vue,
          chantier_id: state.chantier_id,
          equipe_id: state.equipe_id,
          date_debut: state.date_debut || undefined,
          date_fin: state.date_fin || undefined,
        };
      },

      // Stats
      setStats: (stats) => set({ stats }),
    }),
    {
      name: "calendrier-filters-storage",
      partialize: (state) => ({
        periode: state.periode,
        vue: state.vue,
        chantier_id: state.chantier_id,
        equipe_id: state.equipe_id,
        date_debut: state.date_debut,
        date_fin: state.date_fin,
      }),
    }
  )
);

