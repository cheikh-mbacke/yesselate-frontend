/**
 * Hook pour récupérer les statistiques de gouvernance
 */

import { useEffect, useState } from 'react';
import { getGouvernanceStats } from '../api/gouvernanceApi';
import { useGouvernanceFiltersStore } from '../stores/gouvernanceFiltersStore';
import type { GouvernanceStats } from '../types/gouvernanceTypes';

export function useGouvernanceStats() {
  const { getFilters, stats, setStats } = useGouvernanceFiltersStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const filters = getFilters();

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getGouvernanceStats(filters);
        if (!cancelled) {
          setStats(data);
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

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [filters.periode, filters.projet_id, filters.date_debut, filters.date_fin]);

  return {
    stats,
    isLoading,
    error,
    refetch: async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getGouvernanceStats(filters);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      } finally {
        setIsLoading(false);
      }
    },
  };
}

