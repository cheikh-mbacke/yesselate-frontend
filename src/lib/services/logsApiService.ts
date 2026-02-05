/**
 * SERVICE: API Logs - Pattern Pilotage
 */
import type { LogsFilter } from '@/lib/stores/logsWorkspaceStore';

export interface LogEntry {
  id: string; timestamp: string; level: 'error' | 'warn' | 'info' | 'debug';
  source: 'system' | 'api' | 'database' | 'auth' | 'business';
  module: string; message: string; details?: string;
  metadata?: { userId?: string; ip?: string; requestId?: string; duration?: number };
}

export interface LogsStats {
  total: number; byLevel: Record<string, number>; bySource: Record<string, number>;
  errorCount: number; last24h: number; lastHour: number; ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mockLogs: LogEntry[] = [
  { id: 'LOG001', timestamp: '2026-01-10T11:30:00Z', level: 'error', source: 'database', module: 'postgres', message: 'Connection pool exhausted', details: 'Max connections (100) reached', metadata: { duration: 5000 } },
  { id: 'LOG002', timestamp: '2026-01-10T11:28:00Z', level: 'warn', source: 'api', module: 'payments', message: 'Payment gateway timeout', details: 'Retry attempt 2/3', metadata: { requestId: 'REQ-45678', duration: 30000 } },
  { id: 'LOG003', timestamp: '2026-01-10T11:25:00Z', level: 'info', source: 'auth', module: 'login', message: 'Successful login', metadata: { userId: 'EMP001', ip: '192.168.1.10' } },
  { id: 'LOG004', timestamp: '2026-01-10T11:20:00Z', level: 'error', source: 'api', module: 'documents', message: 'File upload failed', details: 'Disk quota exceeded', metadata: { requestId: 'REQ-45680' } },
  { id: 'LOG005', timestamp: '2026-01-10T11:15:00Z', level: 'info', source: 'system', module: 'cron', message: 'Scheduled backup completed', metadata: { duration: 45000 } },
  { id: 'LOG006', timestamp: '2026-01-10T11:10:00Z', level: 'debug', source: 'business', module: 'contracts', message: 'Contract validation started', metadata: { requestId: 'REQ-45682' } },
  { id: 'LOG007', timestamp: '2026-01-10T11:05:00Z', level: 'warn', source: 'system', module: 'memory', message: 'High memory usage detected', details: '85% of available memory used' },
];

// Types supplémentaires
export interface LogHistoryEntry {
  id: string;
  timestamp: string;
  action: 'read' | 'archived' | 'resolved' | 'exported' | 'commented';
  userId?: string;
  userName?: string;
  details?: string;
}

export interface LogContext {
  previous: LogEntry[];
  current: LogEntry;
  next: LogEntry[];
}

export const logsApiService = {
  async getAll(filter?: LogsFilter, sortBy?: string, page = 1, limit = 50): Promise<{ data: LogEntry[]; total: number; page: number; totalPages: number }> {
    await delay(200);
    let data = [...mockLogs];
    if (filter?.level) data = data.filter(l => l.level === filter.level);
    if (filter?.source) data = data.filter(l => l.source === filter.source);
    if (filter?.module) data = data.filter(l => l.module === filter.module);
    if (filter?.search) { const q = filter.search.toLowerCase(); data = data.filter(l => l.message.toLowerCase().includes(q) || l.module.toLowerCase().includes(q)); }
    data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const total = data.length; const totalPages = Math.ceil(total / limit); const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },
  async getStats(): Promise<LogsStats> {
    await delay(150); const data = mockLogs;
    const byLevel: Record<string, number> = {}; const bySource: Record<string, number> = {};
    data.forEach(l => { byLevel[l.level] = (byLevel[l.level] || 0) + 1; bySource[l.source] = (bySource[l.source] || 0) + 1; });
    const errorCount = data.filter(l => l.level === 'error').length;
    return { total: data.length, byLevel, bySource, errorCount, last24h: data.length, lastHour: data.length, ts: new Date().toISOString() };
  },
  async getLogById(id: string): Promise<LogEntry | null> {
    await delay(100);
    const log = mockLogs.find(l => l.id === id);
    return log || null;
  },
  async getLogContext(id: string): Promise<LogContext | null> {
    await delay(150);
    const index = mockLogs.findIndex(l => l.id === id);
    if (index === -1) return null;
    const current = mockLogs[index];
    const previous = index > 0 ? mockLogs.slice(Math.max(0, index - 3), index) : [];
    const next = index < mockLogs.length - 1 ? mockLogs.slice(index + 1, Math.min(mockLogs.length, index + 4)) : [];
    return { previous, current, next };
  },
  async getLogHistory(id: string): Promise<LogHistoryEntry[]> {
    await delay(100);
    // Mock history
    return [
      { id: 'HIST-001', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'read', userId: 'USER001', userName: 'Admin', details: 'Consultation du log' },
      { id: 'HIST-002', timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'exported', userId: 'USER001', userName: 'Admin', details: 'Export inclus dans le rapport' },
    ];
  },
  async exportLogs(filters?: LogsFilter, format: 'csv' | 'json' | 'txt' | 'pdf' = 'csv'): Promise<Blob> {
    await delay(500);
    let data = [...mockLogs];
    if (filters?.level) data = data.filter(l => l.level === filters.level);
    if (filters?.source) data = data.filter(l => l.source === filters.source);
    if (filters?.module) data = data.filter(l => l.module === filters.module);
    if (filters?.search) { const q = filters.search.toLowerCase(); data = data.filter(l => l.message.toLowerCase().includes(q) || l.module.toLowerCase().includes(q)); }
    
    let content = '';
    let mimeType = 'text/csv';
    
    if (format === 'csv') {
      content = 'ID,Timestamp,Level,Source,Module,Message\n';
      data.forEach(l => {
        content += `${l.id},${l.timestamp},${l.level},${l.source},${l.module},"${l.message.replace(/"/g, '""')}"\n`;
      });
    } else if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
    } else if (format === 'txt') {
      data.forEach(l => {
        content += `[${l.timestamp}] ${l.level.toUpperCase()} [${l.source}/${l.module}] ${l.message}\n`;
        if (l.details) content += `  Details: ${l.details}\n`;
      });
      mimeType = 'text/plain';
    } else if (format === 'pdf') {
      // Pour PDF, on génère un texte simple (en production, utiliser une lib PDF)
      content = `Rapport de Logs\n\n`;
      data.forEach(l => {
        content += `[${l.timestamp}] ${l.level.toUpperCase()} [${l.source}/${l.module}] ${l.message}\n`;
      });
      mimeType = 'application/pdf';
    }
    
    return new Blob([content], { type: mimeType });
  },
  async markLogAsRead(id: string): Promise<void> {
    await delay(100);
    // En production, appeler l'API pour marquer comme lu
    console.log(`Log ${id} marqué comme lu`);
  },
  async archiveLog(id: string): Promise<void> {
    await delay(200);
    // En production, appeler l'API pour archiver
    console.log(`Log ${id} archivé`);
  },
  async getNotifications(): Promise<Array<{ id: string; type: 'error' | 'warning' | 'info'; message: string; timestamp: string; read: boolean }>> {
    await delay(100);
    return [
      { id: 'NOTIF-001', type: 'error', message: 'Nouvelle erreur critique détectée', timestamp: new Date(Date.now() - 300000).toISOString(), read: false },
      { id: 'NOTIF-002', type: 'warning', message: 'Pic d\'avertissements système', timestamp: new Date(Date.now() - 600000).toISOString(), read: false },
      { id: 'NOTIF-003', type: 'info', message: 'Rapport de logs généré', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true },
    ];
  },
  getLevelLabel: (l: string): string => ({ error: 'Erreur', warn: 'Warning', info: 'Info', debug: 'Debug' }[l] || l),
  getSourceLabel: (s: string): string => ({ system: 'Système', api: 'API', database: 'BDD', auth: 'Auth', business: 'Métier' }[s] || s),
  getLevelColor: (l: string): string => ({ error: 'red', warn: 'amber', info: 'blue', debug: 'slate' }[l] || 'slate'),
};

