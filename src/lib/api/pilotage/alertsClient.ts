import { fetchJson } from './http';

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export type AlertItem = {
  id: string;
  type: AlertSeverity;
  title: string;
  description?: string;
  source?: string;
  createdAt: string;
  status?: 'open' | 'acknowledged' | 'resolved' | 'escalated';
};

export const alertsAPI = {
  acknowledge: (id: string, payload: { note?: string; userId?: string }) =>
    fetchJson<{ success: boolean; alert: any; message?: string }>(`/api/alerts/${encodeURIComponent(id)}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resolve: (
    id: string,
    payload: { resolutionType: string; note: string; proof?: string; userId?: string }
  ) =>
    fetchJson<{ success: boolean; alert: any; message?: string }>(`/api/alerts/${encodeURIComponent(id)}/resolve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  escalate: (
    id: string,
    payload: { escalateTo: string; reason: string; priority?: string; userId?: string }
  ) =>
    fetchJson<{ success: boolean; alert: any; notification?: any; message?: string }>(
      `/api/alerts/${encodeURIComponent(id)}/escalate`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  getTimeline: (params?: { days?: number; severity?: 'critical' | 'warning' | 'all' }) => {
    const sp = new URLSearchParams();
    if (typeof params?.days === 'number') sp.set('days', String(params.days));
    if (params?.severity) sp.set('severity', params.severity);
    const qs = sp.toString();
    return fetchJson<any>(`/api/alerts/timeline${qs ? `?${qs}` : ''}`);
  },
};


