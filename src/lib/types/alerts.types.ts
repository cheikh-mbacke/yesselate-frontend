export type Severity = 'critical' | 'warning' | 'info' | 'success';

export type Alert = {
  id: string;
  severity: Severity;
  type: string;          // payment | contract | validation | system | budget ...
  bureau?: string;       // BF | BJ | BM | BMO ...
  title: string;
  description?: string;
  createdAt: string;     // ISO
  entity?: { kind: string; id: string; projectId?: string; supplierId?: string };
  impact?: { money?: number; scheduleDays?: number; legal?: boolean };
  slaDueAt?: string;     // ISO
  status?: 'open' | 'ack' | 'snoozed' | 'resolved';
};

export type Incident = {
  id: string;
  fingerprint: string;
  severity: Severity;
  title: string;
  bureau?: string;
  impactMoney: number;
  dueAt?: string;
  alerts: Alert[];
};

export function fingerprintAlert(a: Alert): string {
  const e = a.entity;
  return [
    a.type,
    e?.kind ?? 'none',
    e?.id ?? 'none',
    e?.projectId ?? 'noproj',
    e?.supplierId ?? 'nosupplier',
  ].join('|');
}

export function correlateAlertsToIncidents(alerts: Alert[]): Incident[] {
  const map = new Map<string, Incident>();

  for (const a of alerts) {
    const fp = fingerprintAlert(a);
    const existing = map.get(fp);

    const money = a.impact?.money ?? 0;

    if (!existing) {
      map.set(fp, {
        id: `INC-${fp.replaceAll('|', '-').slice(0, 32)}`,
        fingerprint: fp,
        severity: a.severity,
        title: a.title,
        bureau: a.bureau,
        impactMoney: money,
        dueAt: a.slaDueAt,
        alerts: [a],
      });
    } else {
      existing.alerts.push(a);
      existing.impactMoney += money;

      // severity max (critical > warning > info > success)
      const rank = (s: Severity) => ({ critical: 4, warning: 3, info: 2, success: 1 }[s]);
      if (rank(a.severity) > rank(existing.severity)) existing.severity = a.severity;

      // dueAt earliest
      if (a.slaDueAt && (!existing.dueAt || a.slaDueAt < existing.dueAt)) existing.dueAt = a.slaDueAt;
    }
  }

  return Array.from(map.values()).sort((x, y) => {
    const rank = (s: Severity) => ({ critical: 4, warning: 3, info: 2, success: 1 }[s]);
    if (rank(y.severity) !== rank(x.severity)) return rank(y.severity) - rank(x.severity);
    return (x.dueAt ?? '9999') < (y.dueAt ?? '9999') ? -1 : 1;
  });
}

