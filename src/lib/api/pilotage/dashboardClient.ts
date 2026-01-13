import { fetchJson } from './http';

export type DashboardPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export type DashboardStatsResponse = {
  period: string;
  timestamp: string;
  kpis: Record<
    string,
    {
      value: number | string;
      unit?: string;
      trend?: number;
      previousValue?: number | string;
      target?: number | string;
    }
  >;
  counters: Record<string, number>;
  bureaux?: Array<{ code: string; name?: string; score?: number; charge?: number; blocages?: number }>;
  trends?: Array<Record<string, any>>;
};

export type DashboardRisk = {
  id: string;
  kind: string;
  severity: 'critical' | 'warning' | 'watch';
  score: number;
  title: string;
  detail: string;
  source: string;
  explain: string;
  trend?: 'up' | 'down' | 'stable';
  createdAt: string;
  relatedItem?: string;
};

export type DashboardRisksResponse = {
  risks: DashboardRisk[];
  stats: { total: number; critical: number; warning: number; avgScore: number };
  timestamp: string;
};

export type DashboardActionsResponse = {
  actions: any[];
  stats: Record<string, number>;
  timestamp: string;
};

export type DashboardDecisionsResponse = {
  decisions: any[];
  stats: Record<string, number>;
  timestamp: string;
};

export type DashboardBureauxResponse = {
  bureaux: any[];
  stats: Record<string, number>;
  timestamp: string;
};

export type DashboardTrendsResponse = any;

export type DashboardKpiDetailResponse = {
  kpi: any;
  timestamp: string;
};

export const dashboardAPI = {
  getStats: (params?: { period?: string }) => {
    const sp = new URLSearchParams();
    if (params?.period) sp.set('period', params.period);
    const qs = sp.toString();
    return fetchJson<DashboardStatsResponse>(`/api/dashboard/stats${qs ? `?${qs}` : ''}`);
  },

  getRisks: (params?: { severity?: 'critical' | 'warning' | 'all'; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.severity) sp.set('severity', params.severity);
    if (typeof params?.limit === 'number') sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return fetchJson<DashboardRisksResponse>(`/api/dashboard/risks${qs ? `?${qs}` : ''}`);
  },

  getActions: (params?: { urgency?: string; status?: string; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.urgency) sp.set('urgency', params.urgency);
    if (params?.status) sp.set('status', params.status);
    if (typeof params?.limit === 'number') sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return fetchJson<DashboardActionsResponse>(`/api/dashboard/actions${qs ? `?${qs}` : ''}`);
  },

  getDecisions: (params?: { status?: string; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (typeof params?.limit === 'number') sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return fetchJson<DashboardDecisionsResponse>(`/api/dashboard/decisions${qs ? `?${qs}` : ''}`);
  },

  getBureaux: (params?: { sortBy?: string; order?: 'asc' | 'desc' }) => {
    const sp = new URLSearchParams();
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.order) sp.set('order', params.order);
    const qs = sp.toString();
    return fetchJson<DashboardBureauxResponse>(`/api/dashboard/bureaux${qs ? `?${qs}` : ''}`);
  },

  getTrends: (params?: { kpi?: string; months?: number }) => {
    const sp = new URLSearchParams();
    if (params?.kpi) sp.set('kpi', params.kpi);
    if (typeof params?.months === 'number') sp.set('months', String(params.months));
    const qs = sp.toString();
    return fetchJson<DashboardTrendsResponse>(`/api/dashboard/trends${qs ? `?${qs}` : ''}`);
  },

  getKpiDetail: (id: string, params?: { period?: string }) => {
    const sp = new URLSearchParams();
    if (params?.period) sp.set('period', params.period);
    const qs = sp.toString();
    return fetchJson<DashboardKpiDetailResponse>(`/api/dashboard/kpis/${encodeURIComponent(id)}${qs ? `?${qs}` : ''}`);
  },

  refresh: (scope: string = 'all') =>
    fetchJson<{ success: boolean; scope: string; data: any; timestamp: string; message?: string }>(
      '/api/dashboard/refresh',
      { method: 'POST', body: JSON.stringify({ scope }) }
    ),

  export: (payload: {
    format?: 'pdf' | 'excel' | 'csv';
    sections?: string[];
    period?: string;
    includeGraphs?: boolean;
    includeDetails?: boolean;
  }) =>
    fetchJson<{ success: boolean; export: any; message?: string }>('/api/dashboard/export', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};


