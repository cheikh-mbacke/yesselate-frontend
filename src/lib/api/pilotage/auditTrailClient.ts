/**
 * Client API pour l'audit trail des alertes
 * Traçabilité complète de toutes les actions
 */

import { apiClient } from '../client';

// ================================
// Types
// ================================

export interface AuditEntry {
  id: string;
  alertId: string;
  action: AuditAction;
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  timestamp: string;
  changes?: Record<string, { from: any; to: any }>;
  metadata: {
    note?: string;
    reason?: string;
    ip?: string;
    userAgent?: string;
    location?: string;
    duration?: number; // Pour les actions avec durée (résolution)
  };
}

export type AuditAction =
  | 'created'
  | 'viewed'
  | 'acknowledged'
  | 'resolved'
  | 'escalated'
  | 'assigned'
  | 'reassigned'
  | 'updated'
  | 'deleted'
  | 'commented'
  | 'exported'
  | 'snoozed'
  | 'archived'
  | 'restored'
  | 'rule_triggered'
  | 'notification_sent';

export interface AuditFilters {
  alertId?: string;
  actorId?: string;
  actions?: AuditAction[];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditStats {
  totalActions: number;
  byAction: Record<AuditAction, number>;
  byActor: Array<{ actorId: string; actorName: string; count: number }>;
  avgResponseTime: number; // ms entre création et acknowledge
  avgResolutionTime: number; // ms entre acknowledge et résolution
  mostActiveHour: number; // 0-23
  mostActiveDay: string; // lundi, mardi, etc.
}

// ================================
// API Client
// ================================

export const auditTrailAPI = {
  /**
   * Récupérer l'audit trail d'une alerte
   */
  async getAlertAudit(alertId: string, filters?: Omit<AuditFilters, 'alertId'>): Promise<{
    entries: AuditEntry[];
    total: number;
    page: number;
    limit: number;
  }> {
    return apiClient.get(`/api/alerts/${alertId}/audit`, filters);
  },

  /**
   * Récupérer l'audit trail global
   */
  async getAuditTrail(filters?: AuditFilters): Promise<{
    entries: AuditEntry[];
    total: number;
    page: number;
    limit: number;
  }> {
    return apiClient.get('/api/alerts/audit', filters);
  },

  /**
   * Ajouter une entrée d'audit (normalement fait automatiquement par le backend)
   */
  async addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<{
    entry: AuditEntry;
  }> {
    return apiClient.post('/api/alerts/audit', entry);
  },

  /**
   * Obtenir les statistiques d'audit
   */
  async getAuditStats(filters?: {
    startDate?: string;
    endDate?: string;
    bureau?: string;
  }): Promise<{
    stats: AuditStats;
  }> {
    return apiClient.get('/api/alerts/audit/stats', filters);
  },

  /**
   * Exporter l'audit trail
   */
  async exportAudit(filters?: AuditFilters, format: 'csv' | 'json' | 'pdf' = 'csv'): Promise<Blob> {
    const params = { ...filters, format };
    return apiClient.download('/api/alerts/audit/export', params);
  },

  /**
   * Obtenir la timeline d'une alerte (version simplifiée pour l'UI)
   */
  async getAlertTimeline(alertId: string): Promise<{
    timeline: Array<{
      id: string;
      type: 'action' | 'comment' | 'system';
      action?: AuditAction;
      actor?: string;
      content?: string;
      timestamp: string;
      metadata?: any;
    }>;
  }> {
    return apiClient.get(`/api/alerts/${alertId}/timeline`);
  },

  /**
   * Rechercher dans l'audit trail
   */
  async searchAudit(query: string, filters?: AuditFilters): Promise<{
    results: AuditEntry[];
    total: number;
  }> {
    return apiClient.get('/api/alerts/audit/search', { q: query, ...filters });
  },
};

// ================================
// Helper functions
// ================================

/**
 * Formater une action pour l'affichage
 */
export function formatAuditAction(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    created: 'Créée',
    viewed: 'Consultée',
    acknowledged: 'Acquittée',
    resolved: 'Résolue',
    escalated: 'Escaladée',
    assigned: 'Assignée',
    reassigned: 'Réassignée',
    updated: 'Modifiée',
    deleted: 'Supprimée',
    commented: 'Commentée',
    exported: 'Exportée',
    snoozed: 'Mise en pause',
    archived: 'Archivée',
    restored: 'Restaurée',
    rule_triggered: 'Règle déclenchée',
    notification_sent: 'Notification envoyée',
  };
  return labels[action] || action;
}

/**
 * Obtenir l'icône pour une action
 */
export function getAuditActionIcon(action: AuditAction): string {
  const icons: Record<AuditAction, string> = {
    created: '✨',
    viewed: '👁️',
    acknowledged: '✅',
    resolved: '✔️',
    escalated: '⬆️',
    assigned: '👤',
    reassigned: '🔄',
    updated: '✏️',
    deleted: '🗑️',
    commented: '💬',
    exported: '📥',
    snoozed: '😴',
    archived: '📦',
    restored: '♻️',
    rule_triggered: '⚙️',
    notification_sent: '📧',
  };
  return icons[action] || '📝';
}

/**
 * Obtenir la couleur pour une action
 */
export function getAuditActionColor(action: AuditAction): string {
  const colors: Record<AuditAction, string> = {
    created: 'blue',
    viewed: 'slate',
    acknowledged: 'purple',
    resolved: 'emerald',
    escalated: 'orange',
    assigned: 'blue',
    reassigned: 'indigo',
    updated: 'amber',
    deleted: 'red',
    commented: 'cyan',
    exported: 'teal',
    snoozed: 'slate',
    archived: 'gray',
    restored: 'green',
    rule_triggered: 'violet',
    notification_sent: 'sky',
  };
  return colors[action] || 'slate';
}

/**
 * Formater le diff des changements
 */
export function formatChanges(changes: Record<string, { from: any; to: any }>): string[] {
  return Object.entries(changes).map(([field, { from, to }]) => {
    return `${field}: ${from} → ${to}`;
  });
}

/**
 * Calculer la durée entre deux entrées d'audit
 */
export function calculateDuration(start: AuditEntry, end: AuditEntry): number {
  const startTime = new Date(start.timestamp).getTime();
  const endTime = new Date(end.timestamp).getTime();
  return endTime - startTime;
}

/**
 * Obtenir le temps de réponse (création → acknowledge)
 */
export function getResponseTime(entries: AuditEntry[]): number | null {
  const created = entries.find((e) => e.action === 'created');
  const acknowledged = entries.find((e) => e.action === 'acknowledged');
  
  if (!created || !acknowledged) return null;
  
  return calculateDuration(created, acknowledged);
}

/**
 * Obtenir le temps de résolution (acknowledge → résolution)
 */
export function getResolutionTime(entries: AuditEntry[]): number | null {
  const acknowledged = entries.find((e) => e.action === 'acknowledged');
  const resolved = entries.find((e) => e.action === 'resolved');
  
  if (!acknowledged || !resolved) return null;
  
  return calculateDuration(acknowledged, resolved);
}

/**
 * Formater une durée en texte lisible
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}j ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

