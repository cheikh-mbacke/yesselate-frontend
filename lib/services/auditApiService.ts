/**
 * Service API pour l'Audit et la Traçabilité
 */

export type AuditEventType = 'create' | 'update' | 'delete' | 'validate' | 'reject' | 'export' | 'login' | 'security';
export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditEventType;
  module: string;
  entityId: string;
  entityType: string;
  severity: AuditSeverity;
  details: string;
  ipAddress?: string;
}

export interface AuditStats {
  total: number;
  today: number;
  critiques: number;
  security: number;
  nouveaux: number;
  parModule: Array<{ module: string; count: number }>;
  parSeverity: Array<{ severity: AuditSeverity; count: number }>;
  ts: string;
}

class AuditApiService {
  async getStats(): Promise<AuditStats> {
    await this.delay(300);
    return {
      total: 15420,
      today: 342,
      critiques: 18,
      security: 45,
      nouveaux: 85,
      parModule: [
        { module: 'projets', count: 4250 },
        { module: 'finances', count: 3120 },
        { module: 'employes', count: 2580 },
        { module: 'clients', count: 1890 },
        { module: 'validation-bc', count: 1650 },
        { module: 'autres', count: 1930 },
      ],
      parSeverity: [
        { severity: 'info', count: 14200 },
        { severity: 'warning', count: 1100 },
        { severity: 'critical', count: 120 },
      ],
      ts: new Date().toISOString(),
    };
  }

  async getEvents(filters?: { 
    module?: string; 
    severity?: AuditSeverity; 
    userId?: string;
    dateDebut?: string;
    dateFin?: string;
  }): Promise<AuditEvent[]> {
    await this.delay(400);
    return []; // Mock vide pour l'instant
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const auditApiService = new AuditApiService();

