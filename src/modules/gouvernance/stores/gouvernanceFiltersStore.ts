/**
 * Store Zustand pour les filtres et la période du module Gouvernance
 * Gère l'état des filtres, période, vue active, et statistiques
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PeriodeGouvernance,
  VueGouvernance,
  GouvernanceDomain,
  GouvernanceSection,
  GouvernanceFilters,
  GouvernanceStats,
} from '../types/gouvernanceTypes';

interface GouvernanceFiltersState {
  // Filtres
  periode: PeriodeGouvernance;
  vue: VueGouvernance;
  domain: GouvernanceDomain | null;
  section: GouvernanceSection | null;
  projet_id: number | null;
  date_debut: string | null;
  date_fin: string | null;
  search: string;

  // Stats
  stats: GouvernanceStats | null;

  // Actions
  setPeriode: (periode: PeriodeGouvernance) => void;
  setVue: (vue: VueGouvernance) => void;
  setDomain: (domain: GouvernanceDomain | null) => void;
  setSection: (section: GouvernanceSection | null) => void;
  setProjetId: (projet_id: number | null) => void;
  setDateRange: (date_debut: string | null, date_fin: string | null) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
  getFilters: () => GouvernanceFilters;

  // Stats
  setStats: (stats: GouvernanceStats) => void;
}

const defaultStats: GouvernanceStats = {
  projets_actifs: 0,
  budget_consomme_pourcent: 0,
  jalons_respectes_pourcent: 0,
  risques_critiques: 0,
  validations_en_attente: 0,
  budget_total: 0,
  budget_consomme: 0,
  jalons_total: 0,
  jalons_valides: 0,
  jalons_retard: 0,
  exposition_financiere: 0,
  escalades_actives: 0,
  decisions_en_attente: 0,
  taux_conformite: 0,
};

export const useGouvernanceFiltersStore = create<GouvernanceFiltersState>()(
  persist(
    (set, get) => ({
      // État initial
      periode: 'month',
      vue: 'dashboard',
      domain: null,
      section: null,
      projet_id: null,
      date_debut: null,
      date_fin: null,
      search: '',
      stats: null,

      // Actions
      setPeriode: (periode) => set({ periode }),
      setVue: (vue) => set({ vue }),
      setDomain: (domain) => set({ domain }),
      setSection: (section) => set({ section }),
      setProjetId: (projet_id) => set({ projet_id }),
      setDateRange: (date_debut, date_fin) => set({ date_debut, date_fin }),
      setSearch: (search) => set({ search }),
      resetFilters: () =>
        set({
          periode: 'month',
          vue: 'dashboard',
          domain: null,
          section: null,
          projet_id: null,
          date_debut: null,
          date_fin: null,
          search: '',
        }),
      getFilters: () => {
        const state = get();
        return {
          periode: state.periode,
          vue: state.vue,
          domain: state.domain || undefined,
          section: state.section || undefined,
          projet_id: state.projet_id || undefined,
          date_debut: state.date_debut || undefined,
          date_fin: state.date_fin || undefined,
          search: state.search || undefined,
        };
      },

      // Stats
      setStats: (stats) => set({ stats }),
    }),
    {
      name: 'gouvernance-filters-storage',
      partialize: (state) => ({
        periode: state.periode,
        vue: state.vue,
        domain: state.domain,
        section: state.section,
        projet_id: state.projet_id,
        date_debut: state.date_debut,
        date_fin: state.date_fin,
        search: state.search,
      }),
    }
  )
);

