/**
 * Service API pour les Logs Système
 */

export type LogLevel = 'error' | 'warning' | 'info' | 'debug';
export type LogSource = 'system' | 'api' | 'database' | 'security' | 'application';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  details?: Record<string, unknown>;
  stackTrace?: string;
}

export interface LogsStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  parSource: Array<{ source: LogSource; count: number }>;
  parLevel: Array<{ level: LogLevel; count: number }>;
  ts: string;
}

class LogsApiService {
  async getStats(): Promise<LogsStats> {
    await this.delay(300);
    return {
      total: 125480,
      errors: 245,
      warnings: 1850,
      info: 123385,
      parSource: [
        { source: 'api', count: 85200 },
        { source: 'system', count: 22150 },
        { source: 'database', count: 12340 },
        { source: 'security', count: 4120 },
        { source: 'application', count: 1670 },
      ],
      parLevel: [
        { level: 'error', count: 245 },
        { level: 'warning', count: 1850 },
        { level: 'info', count: 123000 },
        { level: 'debug', count: 385 },
      ],
      ts: new Date().toISOString(),
    };
  }

  async getLogs(filters?: {
    level?: LogLevel;
    source?: LogSource;
    search?: string;
    dateDebut?: string;
    dateFin?: string;
  }): Promise<LogEntry[]> {
    await this.delay(400);
    return []; // Mock vide pour l'instant
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const logsApiService = new LogsApiService();

