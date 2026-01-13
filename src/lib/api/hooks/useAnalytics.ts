/**
 * React Query hooks for Analytics API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  analyticsAPI,
  type AnalyticsKpi,
  type AnalyticsReport,
  type AnalyticsAlert,
  type AnalyticsTrend,
  type BureauPerformance,
  type AnalyticsStats,
  type AnalyticsFilters,
  type ExportRequest,
} from '../pilotage/analyticsClient';

// ============================================
// QUERY KEYS
// ============================================

export const analyticsKeys = {
  all: ['analytics'] as const,
  kpis: () => [...analyticsKeys.all, 'kpis'] as const,
  kpi: (id: string) => [...analyticsKeys.kpis(), id] as const,
  kpisFiltered: (filters?: AnalyticsFilters) => [...analyticsKeys.kpis(), filters] as const,
  
  reports: () => [...analyticsKeys.all, 'reports'] as const,
  report: (id: string) => [...analyticsKeys.reports(), id] as const,
  reportsFiltered: (filters?: AnalyticsFilters) => [...analyticsKeys.reports(), filters] as const,
  
  alerts: () => [...analyticsKeys.all, 'alerts'] as const,
  alert: (id: string) => [...analyticsKeys.alerts(), id] as const,
  alertsFiltered: (filters?: AnalyticsFilters) => [...analyticsKeys.alerts(), filters] as const,
  
  trends: () => [...analyticsKeys.all, 'trends'] as const,
  trendsFiltered: (filters?: AnalyticsFilters) => [...analyticsKeys.trends(), filters] as const,
  
  bureaux: () => [...analyticsKeys.all, 'bureaux'] as const,
  bureau: (code: string) => [...analyticsKeys.bureaux(), code] as const,
  bureauxFiltered: (filters?: AnalyticsFilters) => [...analyticsKeys.bureaux(), filters] as const,
  
  stats: () => [...analyticsKeys.all, 'stats'] as const,
  statsFiltered: (filters?: AnalyticsFilters) => [...analyticsKeys.stats(), filters] as const,
  
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  dashboardFiltered: (filters?: AnalyticsFilters) => [...analyticsKeys.dashboard(), filters] as const,
};

// ============================================
// HOOKS - KPIs
// ============================================

export function useKpis(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.kpisFiltered(filters),
    queryFn: () => analyticsAPI.getKpis(filters),
    staleTime: 30_000, // 30 seconds
  });
}

export function useKpi(id: string) {
  return useQuery({
    queryKey: analyticsKeys.kpi(id),
    queryFn: () => analyticsAPI.getKpiById(id),
    enabled: !!id,
  });
}

export function useUpdateKpi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AnalyticsKpi> }) =>
      analyticsAPI.updateKpi(id, data),
    onSuccess: (response, variables) => {
      // Invalidate KPIs queries
      queryClient.invalidateQueries({ queryKey: analyticsKeys.kpis() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.stats() });
    },
  });
}

// ============================================
// HOOKS - REPORTS
// ============================================

export function useReports(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.reportsFiltered(filters),
    queryFn: () => analyticsAPI.getReports(filters),
    staleTime: 60_000, // 1 minute
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: analyticsKeys.report(id),
    queryFn: () => analyticsAPI.getReportById(id),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<AnalyticsReport, 'id' | 'createdAt' | 'updatedAt'>) =>
      analyticsAPI.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reports() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.stats() });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AnalyticsReport> }) =>
      analyticsAPI.updateReport(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.report(variables.id) });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reports() });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => analyticsAPI.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reports() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.stats() });
    },
  });
}

// ============================================
// HOOKS - ALERTS
// ============================================

export function useAlerts(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.alertsFiltered(filters),
    queryFn: () => analyticsAPI.getAlerts(filters),
    staleTime: 15_000, // 15 seconds
    refetchInterval: 30_000, // Auto-refresh every 30 seconds
  });
}

export function useAlertDetail(id: string) {
  return useQuery({
    queryKey: analyticsKeys.alert(id),
    queryFn: () => analyticsAPI.getAlertDetail(id),
    enabled: !!id,
    staleTime: 30_000, // 30 seconds
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => analyticsAPI.acknowledgeAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.dashboard() });
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution?: string }) =>
      analyticsAPI.resolveAlert(id, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.stats() });
    },
  });
}

// ============================================
// HOOKS - TRENDS
// ============================================

export function useTrends(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.trendsFiltered(filters),
    queryFn: () => analyticsAPI.getTrends(filters),
    staleTime: 60_000, // 1 minute
  });
}

// ============================================
// HOOKS - BUREAU PERFORMANCE
// ============================================

export function useBureauxPerformance(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.bureauxFiltered(filters),
    queryFn: () => analyticsAPI.getBureauPerformance(filters),
    staleTime: 30_000, // 30 seconds
  });
}

export function useBureau(bureauCode: string) {
  return useQuery({
    queryKey: analyticsKeys.bureau(bureauCode),
    queryFn: () => analyticsAPI.getBureauById(bureauCode),
    enabled: !!bureauCode,
  });
}

// ============================================
// HOOKS - STATS
// ============================================

export function useAnalyticsStats(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.statsFiltered(filters),
    queryFn: () => analyticsAPI.getStats(filters),
    staleTime: 30_000, // 30 seconds
  });
}

// ============================================
// HOOKS - DASHBOARD
// ============================================

export function useAnalyticsDashboard(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.dashboardFiltered(filters),
    queryFn: () => analyticsAPI.getDashboard(filters),
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Auto-refresh every minute
  });
}

// ============================================
// HOOKS - EXPORT
// ============================================

export function useExportData() {
  return useMutation({
    mutationFn: (request: ExportRequest) => analyticsAPI.exportData(request),
    onSuccess: (response) => {
      // Automatically download the file
      if (response.url) {
        const link = document.createElement('a');
        link.href = response.url;
        link.download = response.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  });
}

// ============================================
// HOOKS - COMPARISON
// ============================================

export function useComparePerformance() {
  return useMutation({
    mutationFn: (params: {
      type: 'bureaux' | 'period' | 'category';
      entities: string[];
      metrics: string[];
      period?: string;
    }) => analyticsAPI.comparePerformance(params),
  });
}

export function useComparison(params: {
  type: 'bureaux' | 'periods';
  entities: string[];
  metrics: string[];
  dateRange?: { start: string; end: string };
}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['analytics', 'comparison', params],
    queryFn: () => analyticsAPI.compareEntities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && params.entities.length > 0,
  });
}

// ============================================
// PREFETCH HELPERS
// ============================================

export function usePrefetchAnalytics() {
  const queryClient = useQueryClient();

  return {
    prefetchKpis: (filters?: AnalyticsFilters) =>
      queryClient.prefetchQuery({
        queryKey: analyticsKeys.kpisFiltered(filters),
        queryFn: () => analyticsAPI.getKpis(filters),
      }),

    prefetchDashboard: (filters?: AnalyticsFilters) =>
      queryClient.prefetchQuery({
        queryKey: analyticsKeys.dashboardFiltered(filters),
        queryFn: () => analyticsAPI.getDashboard(filters),
      }),

    prefetchStats: (filters?: AnalyticsFilters) =>
      queryClient.prefetchQuery({
        queryKey: analyticsKeys.statsFiltered(filters),
        queryFn: () => analyticsAPI.getStats(filters),
      }),
  };
}

