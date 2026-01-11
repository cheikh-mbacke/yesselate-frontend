import type { CursorPage, Kpi, KpiTimeseriesPoint, Notification } from './types';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API_ERROR ${res.status}`);
  return (await res.json()) as T;
}

export const analyticsRepo = {
  listKpis(params: {
    category?: string;
    status?: string;
    q?: string;
    limit?: number;
    cursor?: string | null;
  }): Promise<CursorPage<Kpi>> {
    const sp = new URLSearchParams();
    if (params.category) sp.set('category', params.category);
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.limit) sp.set('limit', String(params.limit));
    if (params.cursor) sp.set('cursor', String(params.cursor));
    return fetchJson(`/api/analytics/kpis?${sp.toString()}`);
  },

  getKpi(id: string): Promise<Kpi> {
    return fetchJson(`/api/analytics/kpis/${encodeURIComponent(id)}`);
  },

  getTimeseries(id: string, points = 30): Promise<{ points: KpiTimeseriesPoint[] }> {
    return fetchJson(`/api/analytics/kpis/${encodeURIComponent(id)}/timeseries?points=${points}`);
  },

  listNotifications(): Promise<{ items: Notification[] }> {
    return fetchJson(`/api/analytics/notifications`);
  },

  markNotificationRead(id: string): Promise<Notification> {
    return fetchJson(`/api/analytics/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' });
  },
};

