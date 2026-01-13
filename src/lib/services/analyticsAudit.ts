/**
 * Système d'audit pour Analytics
 * Tracking de toutes les actions pour conformité et sécurité
 */

// ============================================
// TYPES
// ============================================

export type AnalyticsAuditAction =
  // KPIs
  | 'KPI_CREATED'
  | 'KPI_UPDATED'
  | 'KPI_DELETED'
  | 'KPI_VIEWED'
  
  // Reports
  | 'REPORT_CREATED'
  | 'REPORT_UPDATED'
  | 'REPORT_DELETED'
  | 'REPORT_PUBLISHED'
  | 'REPORT_ARCHIVED'
  | 'REPORT_VIEWED'
  | 'REPORT_DOWNLOADED'
  
  // Alerts
  | 'ALERT_TRIGGERED'
  | 'ALERT_ACKNOWLEDGED'
  | 'ALERT_RESOLVED'
  | 'ALERT_CONFIGURED'
  
  // Export
  | 'DATA_EXPORTED'
  | 'EXPORT_SCHEDULED'
  | 'EXPORT_CANCELLED'
  
  // Dashboard
  | 'DASHBOARD_VIEWED'
  | 'DASHBOARD_CUSTOMIZED'
  
  // Comparaison
  | 'COMPARISON_PERFORMED'
  
  // Stats
  | 'STATS_VIEWED'
  
  // Trends
  | 'TREND_ANALYZED'
  
  // Settings
  | 'SETTINGS_UPDATED'
  | 'PERMISSION_GRANTED'
  | 'PERMISSION_REVOKED';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AnalyticsAuditLog {
  id: string;
  action: AnalyticsAuditAction;
  userId: string;
  userName: string;
  userRole: string;
  bureauCode?: string;
  
  // Ressource affectée
  resourceType: 'kpi' | 'report' | 'alert' | 'export' | 'dashboard' | 'settings';
  resourceId?: string;
  resourceName?: string;
  
  // Détails
  details: Record<string, unknown>;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  
  // Métadonnées
  severity: AuditSeverity;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  
  // Statut
  success: boolean;
  errorMessage?: string;
}

export interface AuditSearchFilters {
  userId?: string;
  action?: AnalyticsAuditAction[];
  resourceType?: string[];
  severity?: AuditSeverity[];
  dateFrom?: string;
  dateTo?: string;
  success?: boolean;
}

export interface AuditStatistics {
  totalActions: number;
  byAction: Record<AnalyticsAuditAction, number>;
  byUser: Record<string, number>;
  bySeverity: Record<AuditSeverity, number>;
  successRate: number;
  topActions: { action: AnalyticsAuditAction; count: number }[];
  topUsers: { userId: string; userName: string; count: number }[];
}

// ============================================
// SERVICE D'AUDIT
// ============================================

export class AnalyticsAuditService {
  private static instance: AnalyticsAuditService;
  private logs: AnalyticsAuditLog[] = [];

  public static getInstance(): AnalyticsAuditService {
    if (!this.instance) {
      this.instance = new AnalyticsAuditService();
    }
    return this.instance;
  }

  /**
   * Enregistrer une action
   */
  async log(params: {
    action: AnalyticsAuditAction;
    userId: string;
    userName: string;
    userRole: string;
    bureauCode?: string;
    resourceType: AnalyticsAuditLog['resourceType'];
    resourceId?: string;
    resourceName?: string;
    details?: Record<string, unknown>;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    success?: boolean;
    errorMessage?: string;
  }): Promise<AnalyticsAuditLog> {
    const severity = this.calculateSeverity(params.action);
    
    const log: AnalyticsAuditLog = {
      id: this.generateId(),
      action: params.action,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      bureauCode: params.bureauCode,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      details: params.details || {},
      before: params.before,
      after: params.after,
      severity,
      timestamp: new Date().toISOString(),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      sessionId: params.sessionId,
      success: params.success ?? true,
      errorMessage: params.errorMessage,
    };

    this.logs.push(log);

    // Persister en DB (à implémenter)
    await this.persistLog(log);

    // Notifier si critique
    if (severity === 'critical') {
      await this.notifyCriticalAction(log);
    }

    return log;
  }

  /**
   * Récupérer les logs avec filtres
   */
  async getLogs(filters: AuditSearchFilters = {}): Promise<AnalyticsAuditLog[]> {
    let filteredLogs = [...this.logs];

    if (filters.userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId);
    }

    if (filters.action && filters.action.length > 0) {
      filteredLogs = filteredLogs.filter((log) => filters.action!.includes(log.action));
    }

    if (filters.resourceType && filters.resourceType.length > 0) {
      filteredLogs = filteredLogs.filter((log) => 
        filters.resourceType!.includes(log.resourceType)
      );
    }

    if (filters.severity && filters.severity.length > 0) {
      filteredLogs = filteredLogs.filter((log) => 
        filters.severity!.includes(log.severity)
      );
    }

    if (filters.dateFrom) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp <= filters.dateTo!);
    }

    if (filters.success !== undefined) {
      filteredLogs = filteredLogs.filter((log) => log.success === filters.success);
    }

    return filteredLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Obtenir l'historique d'une ressource
   */
  async getResourceHistory(
    resourceType: string,
    resourceId: string
  ): Promise<AnalyticsAuditLog[]> {
    return this.logs.filter(
      (log) => log.resourceType === resourceType && log.resourceId === resourceId
    );
  }

  /**
   * Obtenir l'historique d'un utilisateur
   */
  async getUserHistory(userId: string): Promise<AnalyticsAuditLog[]> {
    return this.logs.filter((log) => log.userId === userId);
  }

  /**
   * Obtenir les statistiques d'audit
   */
  async getStatistics(filters: AuditSearchFilters = {}): Promise<AuditStatistics> {
    const logs = await this.getLogs(filters);

    const byAction: Record<string, number> = {};
    const byUser: Record<string, { name: string; count: number }> = {};
    const bySeverity: Record<AuditSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    let successCount = 0;

    logs.forEach((log) => {
      // Par action
      byAction[log.action] = (byAction[log.action] || 0) + 1;

      // Par utilisateur
      if (!byUser[log.userId]) {
        byUser[log.userId] = { name: log.userName, count: 0 };
      }
      byUser[log.userId].count++;

      // Par sévérité
      bySeverity[log.severity]++;

      // Taux de succès
      if (log.success) {
        successCount++;
      }
    });

    const topActions = Object.entries(byAction)
      .map(([action, count]) => ({ action: action as AnalyticsAuditAction, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topUsers = Object.entries(byUser)
      .map(([userId, data]) => ({ userId, userName: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalActions: logs.length,
      byAction: byAction as Record<AnalyticsAuditAction, number>,
      byUser: Object.fromEntries(
        Object.entries(byUser).map(([k, v]) => [k, v.count])
      ),
      bySeverity,
      successRate: logs.length > 0 ? (successCount / logs.length) * 100 : 0,
      topActions,
      topUsers,
    };
  }

  /**
   * Comparer deux versions d'une ressource
   */
  compareVersions(before: Record<string, unknown>, after: Record<string, unknown>): {
    added: string[];
    removed: string[];
    modified: Array<{ key: string; before: unknown; after: unknown }>;
  } {
    const added: string[] = [];
    const removed: string[] = [];
    const modified: Array<{ key: string; before: unknown; after: unknown }> = [];

    // Vérifier les ajouts et modifications
    Object.keys(after).forEach((key) => {
      if (!(key in before)) {
        added.push(key);
      } else if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        modified.push({ key, before: before[key], after: after[key] });
      }
    });

    // Vérifier les suppressions
    Object.keys(before).forEach((key) => {
      if (!(key in after)) {
        removed.push(key);
      }
    });

    return { added, removed, modified };
  }

  /**
   * Calculer la sévérité d'une action
   */
  private calculateSeverity(action: AnalyticsAuditAction): AuditSeverity {
    const criticalActions: AnalyticsAuditAction[] = [
      'KPI_DELETED',
      'REPORT_DELETED',
      'PERMISSION_GRANTED',
      'PERMISSION_REVOKED',
      'SETTINGS_UPDATED',
    ];

    const highActions: AnalyticsAuditAction[] = [
      'KPI_CREATED',
      'KPI_UPDATED',
      'REPORT_PUBLISHED',
      'ALERT_CONFIGURED',
      'DATA_EXPORTED',
    ];

    const mediumActions: AnalyticsAuditAction[] = [
      'REPORT_CREATED',
      'REPORT_UPDATED',
      'ALERT_RESOLVED',
      'EXPORT_SCHEDULED',
    ];

    if (criticalActions.includes(action)) return 'critical';
    if (highActions.includes(action)) return 'high';
    if (mediumActions.includes(action)) return 'medium';
    return 'low';
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Persister le log en base de données
   */
  private async persistLog(log: AnalyticsAuditLog): Promise<void> {
    // TODO: Implémenter la persistance en DB
    // await prisma.analyticsAuditLog.create({ data: log });
    console.log('[Audit] Log persisted:', log.action);
  }

  /**
   * Notifier une action critique
   */
  private async notifyCriticalAction(log: AnalyticsAuditLog): Promise<void> {
    // TODO: Envoyer une notification
    console.warn('[Audit] Critical action:', log.action, 'by', log.userName);
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const analyticsAudit = AnalyticsAuditService.getInstance();

// ============================================
// HELPERS
// ============================================

/**
 * Hook pour utiliser le service d'audit
 */
export function useAnalyticsAudit() {
  const service = AnalyticsAuditService.getInstance();

  return {
    log: (params: Parameters<typeof service.log>[0]) => service.log(params),
    getLogs: (filters?: AuditSearchFilters) => service.getLogs(filters),
    getResourceHistory: (type: string, id: string) =>
      service.getResourceHistory(type, id),
    getUserHistory: (userId: string) => service.getUserHistory(userId),
    getStatistics: (filters?: AuditSearchFilters) => service.getStatistics(filters),
    compareVersions: (before: Record<string, unknown>, after: Record<string, unknown>) =>
      service.compareVersions(before, after),
  };
}

