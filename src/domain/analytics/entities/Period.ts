/**
 * Period Entity
 * Représente une période de temps avec ses métriques
 */

export interface PeriodData {
  period: string;
  label: string;
  value: number;
  critical?: number;
  warning?: number;
  resolved?: number;
  trend?: number;
}

export type PeriodType = 'months' | 'quarters' | 'years';

export interface Period {
  id: string;
  type: PeriodType;
  startDate: Date;
  endDate: Date;
  label: string;
}

