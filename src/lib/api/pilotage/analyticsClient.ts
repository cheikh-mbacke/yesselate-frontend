import { fetchJson } from './http';

export type AnalyticsKpi = {
  id: string;
  name: string;
  value: number | string;
  target?: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  status?: 'good' | 'warning' | 'critical' | 'neutral';
  description?: string;
  category?: string;
};

export const analyticsAPI = {
  getKpis: () => fetchJson<{ kpis: AnalyticsKpi[] }>('/api/analytics/kpis'),
};


