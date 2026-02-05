/**
 * Service API pour le module Gouvernance
 * Gère les appels API pour projets, risques, alertes, décisions, escalades
 */

import {
  mockProjects,
  mockRisks,
  mockAlerts,
  mockDecisions,
  mockEscalations,
  mockKPIs,
  delay,
  mockPaginatedResponse,
} from '@/lib/mocks/governanceMockData';

// Types
export interface Project {
  id: string;
  reference: string;
  name: string;
  description?: string;
  status: 'active' | 'on-hold' | 'completed' | 'cancelled';
  healthStatus: 'on-track' | 'at-risk' | 'late' | 'blocked';
  progress: number;
  budget: number;
  budgetConsumed: number;
  startDate: string;
  endDate: string;
  manager: string;
  team: string[];
  alerts: number;
  createdAt: string;
  updatedAt: string;
}

export interface Risk {
  id: string;
  reference: string;
  title: string;
  description: string;
  projectId?: string;
  probability: 'low' | 'medium' | 'high' | 'very-high';
  impact: 'minor' | 'moderate' | 'major' | 'critical';
  status: 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'closed';
  owner: string;
  mitigationPlan?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'system' | 'project' | 'budget' | 'resource' | 'quality' | 'deadline';
  title: string;
  description: string;
  source: string;
  projectId?: string;
  assignee?: string;
  status: 'new' | 'acknowledged' | 'in-progress' | 'resolved' | 'dismissed';
  isRead: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface Decision {
  id: string;
  reference: string;
  subject: string;
  description: string;
  requestedBy: string;
  projectId?: string;
  type: 'budget' | 'scope' | 'planning' | 'contract' | 'hr' | 'technical';
  impact: 'low' | 'medium' | 'high';
  deadline: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected' | 'deferred';
  decision?: 'approved' | 'rejected' | 'deferred';
  decidedBy?: string;
  decidedAt?: string;
  comments: { user: string; text: string; date: string }[];
  createdAt: string;
}

export interface Escalation {
  id: string;
  reference: string;
  subject: string;
  description: string;
  level: 1 | 2 | 3;
  urgency: 'normal' | 'high' | 'critical';
  sourceType: 'project' | 'risk' | 'alert' | 'other';
  sourceId?: string;
  escalatedBy: string;
  escalatedTo: string;
  status: 'new' | 'acknowledged' | 'in-progress' | 'resolved';
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface KPI {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  status?: 'success' | 'warning' | 'critical' | 'neutral';
  sparkline?: number[];
  lastUpdated: string;
}

// API Response types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Base URL - would come from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper for API calls
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECTS API
// ═══════════════════════════════════════════════════════════════════════════

export const projectsApi = {
  getAll: async (filters?: {
    status?: string;
    healthStatus?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Project>> => {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await fetchApi<PaginatedResponse<Project>>(
      `/governance/projects?${params}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await fetchApi<Project>(`/governance/projects/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await fetchApi<Project>(`/governance/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// RISKS API
// ═══════════════════════════════════════════════════════════════════════════

export const risksApi = {
  getAll: async (filters?: {
    probability?: string;
    impact?: string;
    status?: string;
    projectId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Risk>> => {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await fetchApi<PaginatedResponse<Risk>>(
      `/governance/risks?${params}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<Risk> => {
    const response = await fetchApi<Risk>(`/governance/risks/${id}`);
    return response.data;
  },

  create: async (data: Omit<Risk, 'id' | 'createdAt' | 'updatedAt'>): Promise<Risk> => {
    const response = await fetchApi<Risk>('/governance/risks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Risk>): Promise<Risk> => {
    const response = await fetchApi<Risk>(`/governance/risks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ALERTS API
// ═══════════════════════════════════════════════════════════════════════════

export const alertsApi = {
  getAll: async (filters?: {
    type?: string;
    category?: string;
    status?: string;
    isRead?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Alert>> => {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await fetchApi<PaginatedResponse<Alert>>(
      `/governance/alerts?${params}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<Alert> => {
    const response = await fetchApi<Alert>(`/governance/alerts/${id}`);
    return response.data;
  },

  markAsRead: async (id: string): Promise<Alert> => {
    const response = await fetchApi<Alert>(`/governance/alerts/${id}/read`, {
      method: 'POST',
    });
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await fetchApi('/governance/alerts/read-all', { method: 'POST' });
  },

  resolve: async (id: string, resolution?: string): Promise<Alert> => {
    const response = await fetchApi<Alert>(`/governance/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    });
    return response.data;
  },

  dismiss: async (id: string, reason?: string): Promise<Alert> => {
    const response = await fetchApi<Alert>(`/governance/alerts/${id}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// DECISIONS API
// ═══════════════════════════════════════════════════════════════════════════

export const decisionsApi = {
  getAll: async (filters?: {
    type?: string;
    status?: string;
    impact?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Decision>> => {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await fetchApi<PaginatedResponse<Decision>>(
      `/governance/decisions?${params}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<Decision> => {
    const response = await fetchApi<Decision>(`/governance/decisions/${id}`);
    return response.data;
  },

  create: async (data: {
    subject: string;
    description: string;
    type: Decision['type'];
    impact: Decision['impact'];
    deadline: string;
    projectId?: string;
  }): Promise<Decision> => {
    const response = await fetchApi<Decision>('/governance/decisions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  decide: async (
    id: string,
    data: {
      decision: 'approved' | 'rejected' | 'deferred';
      comment?: string;
    }
  ): Promise<Decision> => {
    const response = await fetchApi<Decision>(`/governance/decisions/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  addComment: async (id: string, text: string): Promise<Decision> => {
    const response = await fetchApi<Decision>(`/governance/decisions/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ESCALATIONS API
// ═══════════════════════════════════════════════════════════════════════════

export const escalationsApi = {
  getAll: async (filters?: {
    level?: number;
    urgency?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Escalation>> => {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await fetchApi<PaginatedResponse<Escalation>>(
      `/governance/escalations?${params}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<Escalation> => {
    const response = await fetchApi<Escalation>(`/governance/escalations/${id}`);
    return response.data;
  },

  create: async (data: {
    subject: string;
    description: string;
    level: 1 | 2 | 3;
    urgency: 'normal' | 'high' | 'critical';
    escalatedTo: string;
    sourceType?: Escalation['sourceType'];
    sourceId?: string;
  }): Promise<Escalation> => {
    const response = await fetchApi<Escalation>('/governance/escalations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  acknowledge: async (id: string): Promise<Escalation> => {
    const response = await fetchApi<Escalation>(`/governance/escalations/${id}/acknowledge`, {
      method: 'POST',
    });
    return response.data;
  },

  resolve: async (id: string, resolution: string): Promise<Escalation> => {
    const response = await fetchApi<Escalation>(`/governance/escalations/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    });
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// KPIs API
// ═══════════════════════════════════════════════════════════════════════════

export const kpisApi = {
  getAll: async (): Promise<KPI[]> => {
    const response = await fetchApi<KPI[]>('/governance/kpis');
    return response.data;
  },

  getById: async (id: string): Promise<KPI> => {
    const response = await fetchApi<KPI>(`/governance/kpis/${id}`);
    return response.data;
  },

  refresh: async (): Promise<KPI[]> => {
    const response = await fetchApi<KPI[]>('/governance/kpis/refresh', {
      method: 'POST',
    });
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT API
// ═══════════════════════════════════════════════════════════════════════════

export const exportApi = {
  exportProjects: async (format: 'excel' | 'pdf' | 'csv', filters?: any): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/governance/export/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, filters }),
    });
    return response.blob();
  },

  exportRisks: async (format: 'excel' | 'pdf' | 'csv', filters?: any): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/governance/export/risks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, filters }),
    });
    return response.blob();
  },

  exportAlerts: async (format: 'excel' | 'pdf' | 'csv', filters?: any): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/governance/export/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, filters }),
    });
    return response.blob();
  },

  exportReport: async (
    type: 'governance' | 'projects' | 'risks',
    format: 'pdf',
    options?: any
  ): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/governance/export/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, format, options }),
    });
    return response.blob();
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// GOVERNANCE SERVICE - Main export
// ═══════════════════════════════════════════════════════════════════════════

export const governanceService = {
  projects: projectsApi,
  risks: risksApi,
  alerts: alertsApi,
  decisions: decisionsApi,
  escalations: escalationsApi,
  kpis: kpisApi,
  export: exportApi,
};

export default governanceService;

