/**
 * Hook pour récupérer les données de gouvernance selon la section active
 */

import { useEffect, useState } from 'react';
import { useGouvernanceFilters } from './useGouvernanceFilters';
import {
  getGouvernanceOverview,
  getTendancesMensuelles,
  getSyntheseProjets,
  getSyntheseBudget,
  getSyntheseJalons,
  getSyntheseRisques,
  getSyntheseValidations,
  getDepassementsBudget,
  getRetardsCritiques,
  getRessourcesIndispo,
  getEscalades,
  getDecisionsValidees,
  getArbitragesEnAttente,
  getHistoriqueDecisions,
  getReunionsDG,
  getReunionsMOAMOE,
  getReunionsTransverses,
  getIndicateursConformite,
  getAuditGouvernance,
  getSuiviEngagements,
} from '../api/gouvernanceApi';
import type { GouvernanceSection } from '../types/gouvernanceTypes';

export function useGouvernanceData(section: GouvernanceSection) {
  const { getFilters } = useGouvernanceFilters();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const filters = getFilters();

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        let result;

        switch (section) {
          case 'executive-dashboard':
            result = await getGouvernanceOverview(filters);
            break;
          case 'tendances':
            result = await getTendancesMensuelles(filters);
            break;
          case 'synthese-projets':
            result = await getSyntheseProjets(filters);
            break;
          case 'synthese-budget':
            result = await getSyntheseBudget(filters);
            break;
          case 'synthese-jalons':
            result = await getSyntheseJalons(filters);
            break;
          case 'synthese-risques':
            result = await getSyntheseRisques(filters);
            break;
          case 'synthese-validations':
            result = await getSyntheseValidations(filters);
            break;
          case 'depassements-budget':
            result = await getDepassementsBudget(filters);
            break;
          case 'retards-critiques':
            result = await getRetardsCritiques(filters);
            break;
          case 'ressources-indispo':
            result = await getRessourcesIndispo(filters);
            break;
          case 'escalades':
            result = await getEscalades(filters);
            break;
          case 'decisions-validees':
            result = await getDecisionsValidees(filters);
            break;
          case 'arbitrages-en-attente':
            result = await getArbitragesEnAttente(filters);
            break;
          case 'historique-decisions':
            result = await getHistoriqueDecisions(filters);
            break;
          case 'reunions-dg':
            result = await getReunionsDG(filters);
            break;
          case 'reunions-moa-moe':
            result = await getReunionsMOAMOE(filters);
            break;
          case 'reunions-transverses':
            result = await getReunionsTransverses(filters);
            break;
          case 'indicateurs-conformite':
            result = await getIndicateursConformite(filters);
            break;
          case 'audit-gouvernance':
            result = await getAuditGouvernance(filters);
            break;
          case 'suivi-engagements':
            result = await getSuiviEngagements(filters);
            break;
          default:
            result = null;
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [section, filters.periode, filters.projet_id, filters.date_debut, filters.date_fin]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    const currentFilters = getFilters();

    try {
      let result;

      switch (section) {
        case 'executive-dashboard':
          result = await getGouvernanceOverview(currentFilters);
          break;
        case 'tendances':
          result = await getTendancesMensuelles(currentFilters);
          break;
        case 'synthese-projets':
          result = await getSyntheseProjets(currentFilters);
          break;
        case 'synthese-budget':
          result = await getSyntheseBudget(currentFilters);
          break;
        case 'synthese-jalons':
          result = await getSyntheseJalons(currentFilters);
          break;
        case 'synthese-risques':
          result = await getSyntheseRisques(currentFilters);
          break;
        case 'synthese-validations':
          result = await getSyntheseValidations(currentFilters);
          break;
        case 'depassements-budget':
          result = await getDepassementsBudget(currentFilters);
          break;
        case 'retards-critiques':
          result = await getRetardsCritiques(currentFilters);
          break;
        case 'ressources-indispo':
          result = await getRessourcesIndispo(currentFilters);
          break;
        case 'escalades':
          result = await getEscalades(currentFilters);
          break;
        case 'decisions-validees':
          result = await getDecisionsValidees(currentFilters);
          break;
        case 'arbitrages-en-attente':
          result = await getArbitragesEnAttente(currentFilters);
          break;
        case 'historique-decisions':
          result = await getHistoriqueDecisions(currentFilters);
          break;
        case 'reunions-dg':
          result = await getReunionsDG(currentFilters);
          break;
        case 'reunions-moa-moe':
          result = await getReunionsMOAMOE(currentFilters);
          break;
        case 'reunions-transverses':
          result = await getReunionsTransverses(currentFilters);
          break;
        case 'indicateurs-conformite':
          result = await getIndicateursConformite(currentFilters);
          break;
        case 'audit-gouvernance':
          result = await getAuditGouvernance(currentFilters);
          break;
        case 'suivi-engagements':
          result = await getSuiviEngagements(currentFilters);
          break;
        default:
          result = null;
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

