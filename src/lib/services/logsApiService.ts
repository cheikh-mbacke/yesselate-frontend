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
  getLevelLabel: (l: string): string => ({ error: 'Erreur', warn: 'Warning', info: 'Info', debug: 'Debug' }[l] || l),
  getSourceLabel: (s: string): string => ({ system: 'Système', api: 'API', database: 'BDD', auth: 'Auth', business: 'Métier' }[s] || s),
  getLevelColor: (l: string): string => ({ error: 'red', warn: 'amber', info: 'blue', debug: 'slate' }[l] || 'slate'),
};

