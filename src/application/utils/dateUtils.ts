/**
 * Date Utilities
 * Helpers pour les dates et périodes
 */

import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInQuarters,
  differenceInYears,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameQuarter,
  isSameYear,
  format,
  parseISO,
  isValid,
} from 'date-fns';
import { fr } from 'date-fns/locale';

export type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Obtient le début d'une période
 */
export function getPeriodStart(date: Date, period: PeriodType): Date {
  switch (period) {
    case 'day':
      return startOfDay(date);
    case 'week':
      return startOfWeek(date, { weekStartsOn: 1, locale: fr });
    case 'month':
      return startOfMonth(date);
    case 'quarter':
      return startOfQuarter(date);
    case 'year':
      return startOfYear(date);
    default:
      return date;
  }
}

/**
 * Obtient la fin d'une période
 */
export function getPeriodEnd(date: Date, period: PeriodType): Date {
  switch (period) {
    case 'day':
      return endOfDay(date);
    case 'week':
      return endOfWeek(date, { weekStartsOn: 1, locale: fr });
    case 'month':
      return endOfMonth(date);
    case 'quarter':
      return endOfQuarter(date);
    case 'year':
      return endOfYear(date);
    default:
      return date;
  }
}

/**
 * Ajoute une période à une date
 */
export function addPeriod(date: Date, period: PeriodType, amount: number = 1): Date {
  switch (period) {
    case 'day':
      return addDays(date, amount);
    case 'week':
      return addWeeks(date, amount);
    case 'month':
      return addMonths(date, amount);
    case 'quarter':
      return addQuarters(date, amount);
    case 'year':
      return addYears(date, amount);
    default:
      return date;
  }
}

/**
 * Soustrait une période d'une date
 */
export function subtractPeriod(date: Date, period: PeriodType, amount: number = 1): Date {
  switch (period) {
    case 'day':
      return subDays(date, amount);
    case 'week':
      return subWeeks(date, amount);
    case 'month':
      return subMonths(date, amount);
    case 'quarter':
      return subQuarters(date, amount);
    case 'year':
      return subYears(date, amount);
    default:
      return date;
  }
}

/**
 * Calcule la différence entre deux dates dans une période donnée
 */
export function getPeriodDifference(
  dateLeft: Date,
  dateRight: Date,
  period: PeriodType
): number {
  switch (period) {
    case 'day':
      return differenceInDays(dateLeft, dateRight);
    case 'week':
      return differenceInWeeks(dateLeft, dateRight);
    case 'month':
      return differenceInMonths(dateLeft, dateRight);
    case 'quarter':
      return differenceInQuarters(dateLeft, dateRight);
    case 'year':
      return differenceInYears(dateLeft, dateRight);
    default:
      return 0;
  }
}

/**
 * Vérifie si deux dates sont dans la même période
 */
export function isSamePeriod(
  dateLeft: Date,
  dateRight: Date,
  period: PeriodType
): boolean {
  switch (period) {
    case 'day':
      return isSameDay(dateLeft, dateRight);
    case 'week':
      return isSameWeek(dateLeft, dateRight, { weekStartsOn: 1, locale: fr });
    case 'month':
      return isSameMonth(dateLeft, dateRight);
    case 'quarter':
      return isSameQuarter(dateLeft, dateRight);
    case 'year':
      return isSameYear(dateLeft, dateRight);
    default:
      return false;
  }
}

/**
 * Génère une plage de dates pour une période
 */
export function generateDateRange(
  startDate: Date,
  endDate: Date,
  period: PeriodType
): Date[] {
  const dates: Date[] = [];
  let current = getPeriodStart(startDate, period);
  const end = getPeriodEnd(endDate, period);

  while (current <= end) {
    dates.push(new Date(current));
    current = addPeriod(current, period, 1);
  }

  return dates;
}

/**
 * Formate une période
 */
export function formatPeriod(date: Date, period: PeriodType): string {
  switch (period) {
    case 'day':
      return format(date, 'dd/MM/yyyy', { locale: fr });
    case 'week':
      return `Semaine ${format(date, 'w', { locale: fr })} ${format(date, 'yyyy', { locale: fr })}`;
    case 'month':
      return format(date, 'MMMM yyyy', { locale: fr });
    case 'quarter':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `T${quarter} ${format(date, 'yyyy', { locale: fr })}`;
    case 'year':
      return format(date, 'yyyy', { locale: fr });
    default:
      return format(date, 'dd/MM/yyyy', { locale: fr });
  }
}

/**
 * Obtient les périodes prédéfinies
 */
export function getPresetPeriods(): Array<{
  label: string;
  start: Date;
  end: Date;
  period: PeriodType;
}> {
  const now = new Date();
  
  return [
    {
      label: "Aujourd'hui",
      start: getPeriodStart(now, 'day'),
      end: getPeriodEnd(now, 'day'),
      period: 'day',
    },
    {
      label: 'Cette semaine',
      start: getPeriodStart(now, 'week'),
      end: getPeriodEnd(now, 'week'),
      period: 'week',
    },
    {
      label: 'Ce mois',
      start: getPeriodStart(now, 'month'),
      end: getPeriodEnd(now, 'month'),
      period: 'month',
    },
    {
      label: 'Ce trimestre',
      start: getPeriodStart(now, 'quarter'),
      end: getPeriodEnd(now, 'quarter'),
      period: 'quarter',
    },
    {
      label: 'Cette année',
      start: getPeriodStart(now, 'year'),
      end: getPeriodEnd(now, 'year'),
      period: 'year',
    },
    {
      label: '7 derniers jours',
      start: subtractPeriod(now, 'day', 7),
      end: now,
      period: 'day',
    },
    {
      label: '30 derniers jours',
      start: subtractPeriod(now, 'day', 30),
      end: now,
      period: 'day',
    },
    {
      label: '3 derniers mois',
      start: subtractPeriod(now, 'month', 3),
      end: now,
      period: 'month',
    },
  ];
}

