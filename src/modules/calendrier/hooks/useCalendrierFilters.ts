/**
 * Hook pour gérer les filtres du calendrier
 * Utilise le store Zustand pour la persistance
 */

import { useCalendrierFiltersStore } from '../stores/calendrierFiltersStore';
import type { PeriodeVue, ModeVue, CalendrierFilters } from '../types/calendrierTypes';

export function useCalendrierFilters() {
  const {
    periode,
    vue,
    chantier_id,
    equipe_id,
    date_debut,
    date_fin,
    setPeriode,
    setVue,
    setChantierId,
    setEquipeId,
    setDateRange,
    resetFilters,
    getFilters,
  } = useCalendrierFiltersStore();

  return {
    // État
    periode,
    vue,
    chantierId: chantier_id,
    equipeId: equipe_id,
    dateDebut: date_debut,
    dateFin: date_fin,

    // Actions
    setPeriode,
    setVue,
    setChantierId,
    setEquipeId,
    setDateRange,
    resetFilters,
    getFilters,
  };
}

