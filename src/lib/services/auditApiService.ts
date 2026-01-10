/**
 * SERVICE: API Audit - Pattern Pilotage
 */
import type { AuditFilter } from '@/lib/stores/auditWorkspaceStore';

export interface AuditEvent {
  id: string; ref: string; action: string; description: string;
  type: 'security' | 'financial' | 'compliance' | 'system' | 'user';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'new' | 'reviewed' | 'resolved' | 'escalated';
  module: string; user: { id: string; name: string; ip?: string };
  target?: { type: string; id: string; label: string };
  timestamp: string; metadata?: Record<string, unknown>;
}

export interface AuditStats {
  total: number; new: number; reviewed: number; resolved: number; escalated: number;
  byType: Record<string, number>; bySeverity: Record<string, number>; byModule: Record<string, number>;
  criticalNew: number; last24h: number; last7d: number; ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mockEvents: AuditEvent[] = [
  { id: 'AUD001', ref: 'AUD-2026-0001', action: 'LOGIN_FAILED', description: 'Tentative de connexion échouée (3 fois)', type: 'security', severity: 'high', status: 'new', module: 'auth', user: { id: 'UNKNOWN', name: 'admin@test.com', ip: '192.168.1.45' }, timestamp: '2026-01-10T08:45:00Z' },
  { id: 'AUD002', ref: 'AUD-2026-0002', action: 'PAYMENT_APPROVED', description: 'Paiement de 50M FCFA approuvé', type: 'financial', severity: 'info', status: 'reviewed', module: 'paiements', user: { id: 'EMP001', name: 'Sophie Diallo' }, target: { type: 'payment', id: 'PAY-123', label: 'Facture F-2026-089' }, timestamp: '2026-01-10T09:12:00Z' },
  { id: 'AUD003', ref: 'AUD-2026-0003', action: 'DATA_EXPORT', description: 'Export massif données clients', type: 'compliance', severity: 'medium', status: 'new', module: 'clients', user: { id: 'EMP002', name: 'Jean Dupont' }, target: { type: 'export', id: 'EXP-456', label: '2500 enregistrements' }, timestamp: '2026-01-10T10:30:00Z' },
  { id: 'AUD004', ref: 'AUD-2026-0004', action: 'PERMISSION_CHANGED', description: 'Modification droits admin pour EMP003', type: 'security', severity: 'critical', status: 'escalated', module: 'iam', user: { id: 'EMP001', name: 'Ahmed Koné' }, target: { type: 'user', id: 'EMP003', label: 'Paul Martin' }, timestamp: '2026-01-10T07:00:00Z' },
  { id: 'AUD005', ref: 'AUD-2026-0005', action: 'CONTRACT_DELETED', description: 'Suppression contrat archivé', type: 'compliance', severity: 'medium', status: 'resolved', module: 'contrats', user: { id: 'EMP004', name: 'Marie Claire' }, target: { type: 'contract', id: 'CTR-789', label: 'Contrat C-2024-012' }, timestamp: '2026-01-09T16:45:00Z' },
  { id: 'AUD006', ref: 'AUD-2026-0006', action: 'SYSTEM_ERROR', description: 'Erreur critique base de données', type: 'system', severity: 'critical', status: 'new', module: 'database', user: { id: 'SYSTEM', name: 'System' }, timestamp: '2026-01-10T11:00:00Z' },
];

export const auditApiService = {
  async getAll(filter?: AuditFilter, sortBy?: string, page = 1, limit = 20): Promise<{ data: AuditEvent[]; total: number; page: number; totalPages: number }> {
    await delay(300);
    let data = [...mockEvents];
    if (filter?.status) data = data.filter(e => e.status === filter.status);
    if (filter?.type) data = data.filter(e => e.type === filter.type);
    if (filter?.severity) data = data.filter(e => e.severity === filter.severity);
    if (filter?.module) data = data.filter(e => e.module === filter.module);
    if (filter?.search) { const q = filter.search.toLowerCase(); data = data.filter(e => e.ref.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)); }
    if (sortBy === 'severity') { const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }; data.sort((a, b) => order[a.severity] - order[b.severity]); }
    else data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const total = data.length; const totalPages = Math.ceil(total / limit); const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },
  async getById(id: string): Promise<AuditEvent | undefined> { await delay(200); return mockEvents.find(e => e.id === id); },
  async getStats(): Promise<AuditStats> {
    await delay(250); const data = mockEvents;
    const newCount = data.filter(e => e.status === 'new').length;
    const reviewed = data.filter(e => e.status === 'reviewed').length;
    const resolved = data.filter(e => e.status === 'resolved').length;
    const escalated = data.filter(e => e.status === 'escalated').length;
    const criticalNew = data.filter(e => e.status === 'new' && e.severity === 'critical').length;
    const byType: Record<string, number> = {}; const bySeverity: Record<string, number> = {}; const byModule: Record<string, number> = {};
    data.forEach(e => { byType[e.type] = (byType[e.type] || 0) + 1; bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1; byModule[e.module] = (byModule[e.module] || 0) + 1; });
    return { total: data.length, new: newCount, reviewed, resolved, escalated, byType, bySeverity, byModule, criticalNew, last24h: data.length, last7d: data.length, ts: new Date().toISOString() };
  },
  getStatusLabel: (s: string): string => ({ new: 'Nouveau', reviewed: 'Examiné', resolved: 'Résolu', escalated: 'Escaladé' }[s] || s),
  getTypeLabel: (t: string): string => ({ security: 'Sécurité', financial: 'Financier', compliance: 'Conformité', system: 'Système', user: 'Utilisateur' }[t] || t),
  getSeverityLabel: (s: string): string => ({ critical: 'Critique', high: 'Haute', medium: 'Moyenne', low: 'Basse', info: 'Info' }[s] || s),
  getStatusColor: (s: string): string => ({ new: 'amber', reviewed: 'blue', resolved: 'emerald', escalated: 'red' }[s] || 'slate'),
  getSeverityColor: (s: string): string => ({ critical: 'red', high: 'amber', medium: 'yellow', low: 'blue', info: 'slate' }[s] || 'slate'),
  getTypeColor: (t: string): string => ({ security: 'red', financial: 'emerald', compliance: 'indigo', system: 'slate', user: 'blue' }[t] || 'slate'),
};

