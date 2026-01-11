export type KpiCategory =
  | 'overview'
  | 'performance'
  | 'financial'
  | 'trends'
  | 'alerts'
  | 'reports'
  | 'kpis'
  | 'comparison'
  | 'bureaux';

export type KpiStatus = 'ok' | 'warning' | 'critical';

export type KpiFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';

export type Kpi = {
  id: string;
  key: string;
  title: string;
  description?: string;

  category: KpiCategory;
  status: KpiStatus;

  ownerLabel?: string;     // ex: Direction Technique
  sourceLabel?: string;    // ex: system / Ciril / 3P / Marco / etc.
  frequency: KpiFrequency;

  unit?: string;           // %, jours, €, etc.
  value: number;           // valeur courante
  target?: number;         // objectif
  delta?: number;          // évolution (ex: +3)
  deltaPct?: number;       // évolution %

  thresholds?: {
    successGte?: number;
    warningGte?: number;
    criticalLt?: number;
  };

  formula?: string;        // ex: (validées / total) * 100

  updatedAt: string;       // ISO
  tags?: string[];
  relatedKpiIds?: string[];
};

export type KpiTimeseriesPoint = {
  ts: string;   // ISO
  value: number;
};

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'open' | 'ack' | 'resolved';

export type Alert = {
  id: string;
  kpiId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  ownerLabel?: string;
};

export type ReportStatus = 'draft' | 'running' | 'done' | 'failed';

export type Report = {
  id: string;
  title: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  category?: KpiCategory;
};

export type Notification = {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message?: string;
  createdAt: string;
  read: boolean;
};

export type CursorPage<T> = {
  items: T[];
  nextCursor?: string | null;
  totals?: Record<string, number>;
};

