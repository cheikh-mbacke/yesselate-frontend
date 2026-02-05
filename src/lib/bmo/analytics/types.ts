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
  ownerLabel?: string;
  sourceLabel?: string;
  frequency: KpiFrequency;
  unit?: string;
  value: number;
  target?: number;
  delta?: number;
  deltaPct?: number;
  thresholds?: {
    successGte?: number;
    warningGte?: number;
    criticalLt?: number;
  };
  formula?: string;
  updatedAt: string;
  tags?: string[];
  relatedKpiIds?: string[];
};

export type KpiTimeseriesPoint = {
  ts: string;
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
  createdAt: string;
  updatedAt: string;
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
