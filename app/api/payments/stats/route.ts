import { NextRequest, NextResponse } from 'next/server';
import { paymentsN1 } from '@/lib/data';

// ================================
// Helpers
// ================================
const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s0 = String(v ?? '').trim();
  if (!s0) return 0;
  const raw = s0.replace(/\s/g, '').replace(/FCFA|XOF|F\s?CFA/gi, '').replace(/[^\d,.-]/g, '');
  const normalized = raw.replace(/[,.]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

const parseAnyDate = (d?: string | null): Date | null => {
  if (!d || d === '—') return null;
  const parts = d.split('/');
  if (parts.length === 3) {
    const [dd, mm, yy] = parts.map((x) => Number(x));
    if (dd && mm && yy) return new Date(yy, mm - 1, dd, 0, 0, 0, 0);
  }
  const t = Date.parse(d);
  if (!Number.isNaN(t)) return new Date(t);
  return null;
};

const getDaysToDue = (dueDateStr: string): number => {
  const dueDate = parseAnyDate(dueDateStr);
  if (!dueDate) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ================================
// Stats Calculation
// ================================
export async function GET(request: NextRequest) {
  try {
    const payments = paymentsN1 as any[];

    // Calculate stats
    const total = payments.length;
    const pending = payments.filter((p) => p.status === 'pending').length;
    const validated = payments.filter((p) => p.status === 'validated').length;
    const blocked = payments.filter((p) => p.status === 'blocked').length;

    const enriched = payments.map((p) => {
      const daysToDue = getDaysToDue(p.dueDate);
      const amount = parseMoney(p.amount);
      return { ...p, daysToDue, amount };
    });

    const in7Days = enriched.filter((p) => p.daysToDue >= 0 && p.daysToDue <= 7 && p.status === 'pending').length;
    const late = enriched.filter((p) => p.daysToDue < 0 && p.status === 'pending').length;
    const critical = enriched.filter((p) => p.amount >= 5_000_000 && p.status === 'pending').length;
    const bfPending = enriched.filter((p) => p.amount >= 5_000_000 && p.status === 'pending').length;

    const totalAmount = enriched.reduce((acc, p) => acc + p.amount, 0);

    // Risk calculation
    const risky = enriched.filter((p) => {
      let score = 0;
      if (p.daysToDue < 0) score += 55;
      if (p.daysToDue >= 0 && p.daysToDue <= 3) score += 25;
      if (p.amount >= 5_000_000) score += 18;
      return score >= 65;
    }).length;

    // By bureau
    const byBureau = payments.reduce((acc: any, p) => {
      const bureau = p.bureau || 'N/A';
      if (!acc[bureau]) {
        acc[bureau] = { code: bureau, name: bureau, count: 0, amount: 0 };
      }
      acc[bureau].count++;
      acc[bureau].amount += parseMoney(p.amount);
      return acc;
    }, {});

    // By type
    const byType = payments.reduce((acc: any, p) => {
      const type = p.type || 'N/A';
      if (!acc[type]) {
        acc[type] = { type, count: 0, amount: 0 };
      }
      acc[type].count++;
      acc[type].amount += parseMoney(p.amount);
      return acc;
    }, {});

    const stats = {
      total,
      pending,
      validated,
      blocked,
      in7Days,
      late,
      critical,
      bfPending,
      totalAmount,
      risky,
      avgProcessingTime: 2.4, // Mock - would come from real data
      validationRate: total > 0 ? ((validated / total) * 100).toFixed(1) : '0',
      trends: {
        total: 12,
        pending: -8,
        validated: 15,
        amount: 8,
        time: -18,
      },
      byBureau: Object.values(byBureau).map((b: any) => ({
        ...b,
        rate: total > 0 ? Math.round((b.count / total) * 100) : 0,
      })),
      byType: Object.values(byType),
      byRisk: [
        { level: 'Faible', count: enriched.filter((p) => p.daysToDue > 7 && p.amount < 5_000_000).length },
        { level: 'Moyen', count: enriched.filter((p) => (p.daysToDue >= 0 && p.daysToDue <= 7) || p.amount >= 5_000_000).length },
        { level: 'Élevé', count: enriched.filter((p) => p.daysToDue < 0 || p.amount >= 10_000_000).length },
        { level: 'Critique', count: enriched.filter((p) => p.daysToDue < -7 && p.amount >= 5_000_000).length },
      ].map((r) => ({
        ...r,
        percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
      })),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul des statistiques' },
      { status: 500 }
    );
  }
}

