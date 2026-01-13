// ============================================
// Helpers Analytics (mois, filtrage période, agrégations)
// ============================================

import { parseISO, isValid } from 'date-fns';

export const MONTHS_FR_ABBR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'] as const;

export type MonthFrAbbr = (typeof MONTHS_FR_ABBR)[number];

export function monthToIndex(month: string): number | null {
  const idx = MONTHS_FR_ABBR.indexOf(month as MonthFrAbbr);
  return idx >= 0 ? idx : null;
}

export function monthIndexToAbbr(idx: number): MonthFrAbbr {
  const safe = Math.max(0, Math.min(11, Math.floor(idx)));
  return MONTHS_FR_ABBR[safe]!;
}

function safeParseISODate(value?: string | null): Date | null {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

export type PeriodType = 'month' | 'quarter' | 'year' | 'custom';

export interface PeriodFilter {
  period?: PeriodType;
  startDate?: string;
  endDate?: string;
}

export function filterRowsByPeriod<T extends { month: string }>(
  rows: T[],
  filter: PeriodFilter
): T[] {
  if (!rows.length) return rows;

  const period = filter?.period;
  const start = safeParseISODate(filter?.startDate);
  const end = safeParseISODate(filter?.endDate);

  // On s'aligne sur le "dernier mois présent" dans les données (beaucoup plus stable que "maintenant" pour des mocks).
  const indices = rows.map((r) => monthToIndex(r.month)).filter((v): v is number => v !== null);
  const dataEndIdx = indices.length ? Math.max(...indices) : 11;
  const yearHint = (start ?? end ?? new Date()).getFullYear();

  const toDate = (m: string) => {
    const idx = monthToIndex(m);
    if (idx === null) return null;
    return new Date(yearHint, idx, 1);
  };

  if (period === 'custom' || start || end) {
    return rows.filter((r) => {
      const d = toDate(r.month);
      if (!d) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }

  if (period === 'month') {
    const target = monthIndexToAbbr(dataEndIdx);
    return rows.filter((r) => r.month === target);
  }

  if (period === 'quarter') {
    const startIdx = Math.max(0, dataEndIdx - 2);
    const allowed = new Set(MONTHS_FR_ABBR.slice(startIdx, dataEndIdx + 1));
    return rows.filter((r) => allowed.has(r.month as MonthFrAbbr));
  }

  // 'year' (ou undefined) => pas de filtre temporel (mais conserve l'ordre d'entrée)
  return rows;
}

export type MonthlyAggRow = {
  month: string;
  demandes: number;
  validations: number;
  rejets: number;
  budget: number;
};

export type BureauMonthlyRow = MonthlyAggRow & { bureau: string };

function stableHash01(input: string): number {
  // Petit hash stable -> [0,1)
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

export function expandMonthlyDataByBureau(
  monthly: MonthlyAggRow[],
  bureaux: Array<{ code: string }>,
  opts?: { jitter?: number }
): BureauMonthlyRow[] {
  const jitter = Math.max(0, Math.min(0.25, opts?.jitter ?? 0.08));
  const safeBureaux = (bureaux ?? []).filter((b) => b?.code);
  if (!safeBureaux.length) return [];

  return monthly.flatMap((m) => {
    const weights = safeBureaux.map((b) => {
      const r = stableHash01(`${b.code}-${m.month}`);
      const factor = 1 + (r - 0.5) * 2 * jitter; // [1-jitter, 1+jitter]
      return factor;
    });
    const totalW = weights.reduce((a, b) => a + b, 0) || 1;

    let sumDemandes = 0;
    let sumValidations = 0;
    let sumRejets = 0;
    let sumBudget = 0;

    return safeBureaux.map((b, i) => {
      const share = weights[i]! / totalW;
      const isLast = i === safeBureaux.length - 1;

      const d = isLast ? Math.max(0, Math.round(m.demandes - sumDemandes)) : Math.max(0, Math.round(m.demandes * share));
      const v = isLast ? Math.max(0, Math.round(m.validations - sumValidations)) : Math.max(0, Math.round(m.validations * share));
      const r = isLast ? Math.max(0, Math.round(m.rejets - sumRejets)) : Math.max(0, Math.round(m.rejets * share));
      const bud = isLast ? Math.max(0, Number((m.budget - sumBudget).toFixed(2))) : Math.max(0, Number((m.budget * share).toFixed(2)));

      sumDemandes += d;
      sumValidations += v;
      sumRejets += r;
      sumBudget += bud;

      return {
        month: m.month,
        bureau: b.code,
        demandes: d,
        validations: v,
        rejets: r,
        budget: bud,
      };
    });
  });
}

export function aggregateByMonth(rows: BureauMonthlyRow[]): MonthlyAggRow[] {
  const map = new Map<string, MonthlyAggRow>();
  for (const r of rows) {
    const cur = map.get(r.month) ?? { month: r.month, demandes: 0, validations: 0, rejets: 0, budget: 0 };
    cur.demandes += Number(r.demandes ?? 0);
    cur.validations += Number(r.validations ?? 0);
    cur.rejets += Number(r.rejets ?? 0);
    cur.budget += Number(r.budget ?? 0);
    map.set(r.month, cur);
  }
  return Array.from(map.values());
}


