import type {
  Alert,
  CursorPage,
  Kpi,
  KpiCategory,
  KpiStatus,
  KpiTimeseriesPoint,
  Notification,
  Report,
} from './types';

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function nowIso() {
  return new Date().toISOString();
}

function isoMinusMinutes(min: number) {
  return new Date(Date.now() - min * 60_000).toISOString();
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function statusFromValue(v: number, thresholds?: Kpi['thresholds']): KpiStatus {
  if (!thresholds) return 'ok';
  if (typeof thresholds.successGte === 'number' && v >= thresholds.successGte) return 'ok';
  if (typeof thresholds.warningGte === 'number' && v >= thresholds.warningGte) return 'warning';
  return 'critical';
}

const KPIS: Kpi[] = (() => {
  const base: Array<Partial<Kpi> & Pick<Kpi, 'id' | 'key' | 'title' | 'category'>> = [
    { id: 'kpi-validation-rate', key: 'validation_rate', title: 'Taux de validation', category: 'performance' },
    { id: 'kpi-sla', key: 'sla_compliance', title: 'Conformité SLA', category: 'performance' },
    { id: 'kpi-avg-delay', key: 'avg_delay', title: 'Délai moyen', category: 'performance' },
    { id: 'kpi-budget-exec', key: 'budget_exec', title: 'Exécution budgétaire', category: 'financial' },
    { id: 'kpi-alerts-active', key: 'alerts_active', title: 'Alertes actives', category: 'alerts' },
    { id: 'kpi-reports', key: 'reports_generated', title: 'Rapports générés', category: 'reports' },
    { id: 'kpi-trends', key: 'trends_followed', title: 'Tendances suivies', category: 'trends' },
    { id: 'kpi-kpis-active', key: 'kpis_active', title: 'KPIs actifs', category: 'kpis' },
  ];

  const owners = ['Direction Technique', 'DAF', 'Cabinet', 'BMO', 'DSI'];
  const sources = ['system', '3P', 'Ciril', 'Marco', 'ERP interne'];

  const items: Kpi[] = [];

  for (let i = 0; i < 24; i++) {
    const tpl = base[i % base.length];
    const seed = mulberry32(hashString(`${tpl.id}-${i}`));

    const unit = tpl.id.includes('delay') ? 'jours' : tpl.id.includes('budget') ? '%' : '%';
    const frequency = i % 3 === 0 ? 'realtime' : i % 3 === 1 ? 'hourly' : 'daily';

    const thresholds =
      unit === '%'
        ? { successGte: 90, warningGte: 80, criticalLt: 80 }
        : { successGte: 3, warningGte: 5, criticalLt: 9999 };

    let value = unit === 'jours' ? 2 + seed() * 6 : 60 + seed() * 40; // 2..8 jours ou 60..100%
    value = Number(value.toFixed(unit === 'jours' ? 1 : 0));

    const target = unit === 'jours' ? 3 : 90;
    const deltaPct = Number(((seed() - 0.4) * 10).toFixed(2));
    const delta = unit === 'jours' ? Number(((seed() - 0.5) * 1.2).toFixed(1)) : Number(((seed() - 0.5) * 6).toFixed(0));

    const kpi: Kpi = {
      id: `${tpl.id}-${i + 1}`,
      key: tpl.key,
      title: tpl.title,
      description:
        tpl.id.includes('validation')
          ? 'Pourcentage de demandes validées par rapport au total traité'
          : tpl.id.includes('sla')
          ? 'Respect des délais SLA sur les dossiers traités'
          : tpl.id.includes('delay')
          ? 'Temps moyen entre création et clôture'
          : 'Indicateur calculé automatiquement',
      category: tpl.category as KpiCategory,
      status: statusFromValue(unit === 'jours' ? 100 - value * 10 : value, thresholds),
      ownerLabel: owners[Math.floor(seed() * owners.length)],
      sourceLabel: sources[Math.floor(seed() * sources.length)],
      frequency,
      unit,
      value,
      target,
      delta,
      deltaPct,
      thresholds: unit === '%' ? thresholds : undefined,
      formula: tpl.id.includes('validation') ? '(Validées / Total) * 100' : undefined,
      updatedAt: isoMinusMinutes(Math.floor(seed() * 180)),
      tags: i % 4 === 0 ? ['prioritaire'] : i % 5 === 0 ? ['surveillance'] : [],
      relatedKpiIds: [],
    };

    items.push(kpi);
  }

  // liaisons simples
  items.forEach((k, idx) => {
    k.relatedKpiIds = [
      items[(idx + 1) % items.length].id,
      items[(idx + 5) % items.length].id,
    ];
  });

  return items;
})();

const ALERTS: Alert[] = [
  {
    id: 'al-1',
    kpiId: KPIS[4].id,
    severity: 'critical',
    status: 'open',
    title: 'Seuil critique atteint',
    message: 'Le KPI est passé sous le seuil critique défini.',
    createdAt: isoMinusMinutes(25),
    updatedAt: isoMinusMinutes(25),
    ownerLabel: 'BMO',
  },
  {
    id: 'al-2',
    kpiId: KPIS[0].id,
    severity: 'warning',
    status: 'ack',
    title: 'Tendance négative',
    message: 'Une baisse persistante est détectée sur 7 jours.',
    createdAt: isoMinusMinutes(80),
    updatedAt: isoMinusMinutes(15),
    ownerLabel: 'Direction Technique',
  },
];

const REPORTS: Report[] = [
  { id: 'rp-1', title: 'Rapport Hebdomadaire Performance', status: 'done', createdAt: isoMinusMinutes(120), updatedAt: isoMinusMinutes(120), category: 'performance' },
  { id: 'rp-2', title: 'Analyse Budgétaire Q4', status: 'running', createdAt: isoMinusMinutes(1440), updatedAt: isoMinusMinutes(10), category: 'financial' },
  { id: 'rp-3', title: 'Comparaison Bureaux - Décembre', status: 'done', createdAt: isoMinusMinutes(2880), updatedAt: isoMinusMinutes(2880), category: 'comparison' },
];

let NOTIFS: Notification[] = [
  { id: 'nt-1', type: 'critical', title: 'KPI Performance critique', message: 'Un KPI est passé en critique', createdAt: isoMinusMinutes(15), read: false },
  { id: 'nt-2', type: 'warning', title: 'Tendance négative détectée', message: 'Baisse sur plusieurs périodes', createdAt: isoMinusMinutes(60), read: false },
  { id: 'nt-3', type: 'info', title: 'Rapport disponible', message: 'Rapport hebdo généré', createdAt: isoMinusMinutes(180), read: true },
];

export const analyticsMocks = {
  listKpis(params: {
    category?: string;
    status?: string;
    q?: string;
    limit?: number;
    cursor?: string | null;
  }): CursorPage<Kpi> {
    const { category, status, q, limit = 50, cursor } = params;

    let items = KPIS.slice();

    if (category) items = items.filter((k) => k.category === category);
    if (status) items = items.filter((k) => k.status === status);

    if (q) {
      const s = q.toLowerCase();
      items = items.filter((k) => (k.title + ' ' + (k.description ?? '')).toLowerCase().includes(s));
    }

    const start = cursor ? Number(cursor) || 0 : 0;
    const page = items.slice(start, start + limit);
    const nextCursor = start + limit < items.length ? String(start + limit) : null;

    const totals = {
      total: items.length,
      ok: items.filter((k) => k.status === 'ok').length,
      warning: items.filter((k) => k.status === 'warning').length,
      critical: items.filter((k) => k.status === 'critical').length,
    };

    return { items: page, nextCursor, totals };
  },

  getKpi(id: string): Kpi | null {
    return KPIS.find((k) => k.id === id) ?? null;
  },

  getTimeseries(id: string, opts?: { points?: number }): KpiTimeseriesPoint[] {
    const kpi = KPIS.find((k) => k.id === id);
    if (!kpi) return [];

    const points = opts?.points ?? 30;
    const seed = mulberry32(hashString(id));
    const base = kpi.unit === 'jours' ? clamp(kpi.value, 1, 10) : clamp(kpi.value, 40, 100);

    const arr: KpiTimeseriesPoint[] = [];
    for (let i = points - 1; i >= 0; i--) {
      const ts = new Date(Date.now() - i * 24 * 60 * 60_000).toISOString();
      const noise = (seed() - 0.5) * (kpi.unit === 'jours' ? 1.2 : 6);
      const value = kpi.unit === 'jours' ? clamp(base + noise, 1, 12) : clamp(base + noise, 40, 100);
      arr.push({ ts, value: Number(value.toFixed(kpi.unit === 'jours' ? 1 : 0)) });
    }
    return arr;
  },

  listAlerts(): Alert[] {
    return ALERTS.slice();
  },

  listReports(): Report[] {
    return REPORTS.slice();
  },

  listNotifications(): Notification[] {
    return NOTIFS.slice();
  },

  markNotificationRead(id: string): Notification | null {
    const idx = NOTIFS.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    NOTIFS[idx] = { ...NOTIFS[idx], read: true };
    return NOTIFS[idx];
  },
};

