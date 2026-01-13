import { fetchJson } from './http';

export type CalendarEventType = 'meeting' | 'deadline' | 'milestone' | 'task' | 'reminder';

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // ISO
  startTime?: string;
  endTime?: string;
  type: CalendarEventType;
  priority?: 'high' | 'medium' | 'low';
  project?: string;
  participants?: string[];
  location?: string;
};

export const calendarAPI = {
  listEvents: (params?: { startDate?: string; endDate?: string; type?: string }) => {
    const sp = new URLSearchParams();
    if (params?.startDate) sp.set('startDate', params.startDate);
    if (params?.endDate) sp.set('endDate', params.endDate);
    if (params?.type) sp.set('type', params.type);
    const qs = sp.toString();
    return fetchJson<{ events: CalendarEvent[]; count: number; timestamp: string }>(
      `/api/calendar/events${qs ? `?${qs}` : ''}`
    );
  },

  createEvent: (payload: Partial<CalendarEvent> & { title: string; date: string }) =>
    fetchJson<{ success: boolean; event: CalendarEvent; message?: string }>('/api/calendar/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  detectConflicts: (params?: { startDate?: string; endDate?: string }) => {
    const sp = new URLSearchParams();
    if (params?.startDate) sp.set('startDate', params.startDate);
    if (params?.endDate) sp.set('endDate', params.endDate);
    const qs = sp.toString();
    return fetchJson<any>(`/api/calendar/conflicts${qs ? `?${qs}` : ''}`);
  },
};


