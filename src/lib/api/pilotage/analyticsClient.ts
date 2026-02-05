import { fetchJson } from './http';

// ============================================
// TYPES
// ============================================

export type AnalyticsKpi = {
  id: string;
  name: string;
  value: number | string;
  target?: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  change?: number;
  status?: 'success' | 'warning' | 'critical' | 'neutral';
  description?: string;
  category?: string;
  lastUpdate?: string;
  sparkline?: number[];
};

export type AnalyticsReport = {
  id: string;
  title: string;
  description?: string;
  type: 'performance' | 'financial' | 'operational' | 'strategic';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  data?: Record<string, unknown>;
};

export type AnalyticsAlert = {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'threshold' | 'anomaly' | 'trend';
  kpiId?: string;
  triggeredAt: string;
  acknowledged: boolean;
  resolvedAt?: string;
};

export type AnalyticsTrend = {
  id: string;
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
  period: string;
};

export type BureauPerformance = {
  bureauCode: string;
  bureauName: string;
  score: number;
  kpis: {
    validation: number;
    processing: number;
    satisfaction: number;
    sla: number;
  };
  trends: {
    validation: 'up' | 'down' | 'stable';
    processing: 'up' | 'down' | 'stable';
  };
  alerts: number;
  lastUpdate: string;
};

export type AnalyticsStats = {
  total: number;
  kpis: number;
  reports: number;
  alerts: number;
  trends: number;
  avgPerformance: number;
  byCategory: { category: string; count: number }[];
  byDepartment: { department: string; count: number }[];
  ts: string;
};

export type AnalyticsFilters = {
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  bureau?: string[];
  category?: string[];
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
};

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export type ExportRequest = {
  format: ExportFormat;
  data: 'kpis' | 'reports' | 'alerts' | 'trends' | 'all';
  filters?: AnalyticsFilters;
  includeCharts?: boolean;
};

// ============================================
// API CLIENT
// ============================================

export const analyticsAPI = {
  // KPIs
  getKpis: (filters?: AnalyticsFilters) => 
    fetchJson<{ kpis: AnalyticsKpi[] }>('/api/analytics/kpis', {
      method: 'GET',
      params: filters,
    }),

  getKpiById: (id: string) =>
    fetchJson<{ kpi: AnalyticsKpi }>(`/api/analytics/kpis/${id}`),

  updateKpi: (id: string, data: Partial<AnalyticsKpi>) =>
    fetchJson<{ kpi: AnalyticsKpi }>(`/api/analytics/kpis/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Reports
  getReports: (filters?: AnalyticsFilters) =>
    fetchJson<{ reports: AnalyticsReport[] }>('/api/analytics/reports', {
      method: 'GET',
      params: filters,
    }),

  getReportById: (id: string) =>
    fetchJson<{ report: AnalyticsReport }>(`/api/analytics/reports/${id}`),

  createReport: (data: Omit<AnalyticsReport, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchJson<{ report: AnalyticsReport }>('/api/analytics/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateReport: (id: string, data: Partial<AnalyticsReport>) =>
    fetchJson<{ report: AnalyticsReport }>(`/api/analytics/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteReport: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/analytics/reports/${id}`, {
      method: 'DELETE',
    }),

  // Alerts
  getAlerts: (filters?: AnalyticsFilters) =>
    fetchJson<{ alerts: AnalyticsAlert[] }>('/api/analytics/alerts', {
      method: 'GET',
      params: filters,
    }),

  getAlertDetail: (id: string) =>
    fetchJson<{ alert: AnalyticsAlert }>(`/api/analytics/alerts/${id}`),

  acknowledgeAlert: (id: string) =>
    fetchJson<{ alert: AnalyticsAlert }>(`/api/analytics/alerts/${id}/acknowledge`, {
      method: 'POST',
    }),

  resolveAlert: (id: string, resolution?: string) =>
    fetchJson<{ alert: AnalyticsAlert }>(`/api/analytics/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    }),

  // Trends
  getTrends: (filters?: AnalyticsFilters) =>
    fetchJson<{ trends: AnalyticsTrend[] }>('/api/analytics/trends', {
      method: 'GET',
      params: filters,
    }),

  // Bureau Performance
  getBureauPerformance: (filters?: AnalyticsFilters) =>
    fetchJson<{ bureaux: BureauPerformance[] }>('/api/analytics/bureaux', {
      method: 'GET',
      params: filters,
    }),

  getBureauById: (bureauCode: string) =>
    fetchJson<{ bureau: BureauPerformance }>(`/api/analytics/bureaux/${bureauCode}`),

  // Stats
  getStats: (filters?: AnalyticsFilters) =>
    fetchJson<AnalyticsStats>('/api/analytics/stats', {
      method: 'GET',
      params: filters,
    }),

  // Export
  exportData: (request: ExportRequest) =>
    fetchJson<{ url: string; filename: string }>('/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // Dashboard
  getDashboard: (filters?: AnalyticsFilters) =>
    fetchJson<{
      kpis: AnalyticsKpi[];
      alerts: AnalyticsAlert[];
      trends: AnalyticsTrend[];
      stats: AnalyticsStats;
    }>('/api/analytics/dashboard', {
      method: 'GET',
      params: filters,
    }),

  // Comparison
  comparePerformance: (params: {
    type: 'bureaux' | 'period' | 'category';
    entities: string[];
    metrics: string[];
    period?: string;
  }) =>
    fetchJson<{
      comparison: Record<string, Record<string, number>>;
      insights: string[];
    }>('/api/analytics/compare', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  compareEntities: (params: {
    type: 'bureaux' | 'periods';
    entities: string[];
    metrics: string[];
    dateRange?: { start: string; end: string };
  }) =>
    fetchJson<{
      type: string;
      entities: Array<{
        id: string;
        name: string;
        metrics: Record<string, number>;
        history: Array<{ date: string; values: Record<string, number> }>;
      }>;
      globalStats: any;
      insights: Array<{ type: string; message: string; priority: string }>;
    }>('/api/analytics/comparison', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};
