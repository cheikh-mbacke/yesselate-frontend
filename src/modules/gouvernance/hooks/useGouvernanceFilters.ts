/**
 * Hook pour gérer les filtres de gouvernance
 */

import { useGouvernanceFiltersStore } from '../stores/gouvernanceFiltersStore';
import type {
  PeriodeGouvernance,
  VueGouvernance,
  GouvernanceDomain,
  GouvernanceSection,
  GouvernanceFilters,
} from '../types/gouvernanceTypes';

export function useGouvernanceFilters() {
  const store = useGouvernanceFiltersStore();

  return {
    // État
    periode: store.periode,
    vue: store.vue,
    domain: store.domain,
    section: store.section,
    projet_id: store.projet_id,
    date_debut: store.date_debut,
    date_fin: store.date_fin,
    search: store.search,
    stats: store.stats,

    // Actions
    setPeriode: store.setPeriode,
    setVue: store.setVue,
    setDomain: store.setDomain,
    setSection: store.setSection,
    setProjetId: store.setProjetId,
    setDateRange: store.setDateRange,
    setSearch: store.setSearch,
    resetFilters: store.resetFilters,
    getFilters: store.getFilters,
  };
}

