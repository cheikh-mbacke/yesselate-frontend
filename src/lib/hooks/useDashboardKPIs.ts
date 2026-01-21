/**
 * Hooks pour récupérer et gérer les KPIs du Dashboard
 */

import { useMemo } from 'react';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';
import { dashboardAPI } from '@/lib/api/pilotage/dashboardClient';
import {
  DASHBOARD_KPI_MAPPINGS,
  transformKPIData,
  type KPIDisplayData,
  type KPIMapping,
  type KPIPeriod,
} from '@/lib/mappings/dashboardKPIMapping';

/**
 * Hook pour récupérer tous les KPIs du dashboard
 */
export function useDashboardKPIs(period: KPIPeriod = 'year') {
  const { data: statsData, isLoading, error, refetch } = useApiQuery(
    async (signal) => dashboardAPI.getStats({ period }),
    [period]
  );

  const kpis = useMemo<KPIDisplayData[]>(() => {
    if (!statsData) {
      // Retourner les valeurs par défaut
      return Object.values(DASHBOARD_KPI_MAPPINGS).map(m => m.display);
    }

    return Object.keys(DASHBOARD_KPI_MAPPINGS).map(kpiId => {
      const transformed = transformKPIData(kpiId, statsData);
      return transformed || DASHBOARD_KPI_MAPPINGS[kpiId].display;
    });
  }, [statsData]);

  return {
    kpis,
    isLoading,
    error,
    lastUpdate: statsData?.timestamp,
    refetch, // Exposer la fonction de refetch
  };
}

/**
 * Hook pour récupérer un KPI spécifique avec son détail
 */
export function useKPIDetail(kpiId: string, period: KPIPeriod = 'year') {
  const mapping = DASHBOARD_KPI_MAPPINGS[kpiId];
  const { data: statsData, isLoading: isLoadingStats } = useApiQuery(
    async (signal) => dashboardAPI.getStats({ period }),
    [period]
  );

  const { data: kpiDetail, isLoading: isLoadingDetail } = useApiQuery(
    async (signal) => {
      if (!mapping?.metadata.drillDownEnabled) {
        return null;
      }
      return dashboardAPI.getKpiDetail(kpiId, { period });
    },
    [kpiId, period]
  );

  const displayData = useMemo<KPIDisplayData | null>(() => {
    if (!statsData) return mapping?.display || null;
    return transformKPIData(kpiId, statsData);
  }, [kpiId, statsData]);

  return {
    displayData,
    detail: kpiDetail?.kpi,
    metadata: mapping?.metadata,
    isLoading: isLoadingStats || isLoadingDetail,
    error: null,
  };
}

/**
 * Hook pour récupérer les KPIs par catégorie
 */
export function useKPIsByCategory(category: KPIMapping['metadata']['category']) {
  const { kpis, isLoading, error } = useDashboardKPIs();

  const filteredKPIs = useMemo(() => {
    return kpis.filter((_, index) => {
      const mapping = Object.values(DASHBOARD_KPI_MAPPINGS)[index];
      return mapping?.metadata.category === category;
    });
  }, [kpis, category]);

  return {
    kpis: filteredKPIs,
    isLoading,
    error,
  };
}

