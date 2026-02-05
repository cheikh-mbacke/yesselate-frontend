import { NextRequest, NextResponse } from 'next/server';
import { arbitragesVivants, arbitrages } from '@/lib/data';

/**
 * GET /api/arbitrages/escalade
 * ============================
 * Retourne les Top 5 arbitrages à trancher en priorité
 * Triés par score = criticité × retard × exposition
 */
export async function GET(request: NextRequest) {
  try {
    const parseFrDate = (d?: string | null) => {
      if (!d) return null;
      const parts = d.split('/');
      if (parts.length !== 3) return null;
      const [dd, mm, yyyy] = parts.map((x) => Number(x));
      if (!dd || !mm || !yyyy) return null;
      const iso = `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
      const date = new Date(iso);
      return Number.isNaN(date.getTime()) ? null : date;
    };

    const getRiskMultiplier = (level?: string) => {
      switch (level) {
        case 'critique': return 4;
        case 'eleve': return 3;
        case 'modere': return 2;
        case 'faible': return 1;
        default: return 1;
      }
    };

    const now = new Date();
    const items: any[] = [];

    // Traiter les arbitrages vivants
    for (const arb of arbitragesVivants) {
      // Ne garder que les non tranchés
      if (arb.status === 'tranche') continue;

      const riskLevel = arb.context?.riskLevel || 'modere';
      const exposure = arb.context?.financialExposure || 0;
      
      // Calculer le retard
      let daysOverdue = 0;
      if (arb.timing?.isOverdue) {
        daysOverdue = Math.abs(arb.timing.daysRemaining || 0);
      } else if (arb.timing?.daysRemaining && arb.timing.daysRemaining < 0) {
        daysOverdue = Math.abs(arb.timing.daysRemaining);
      }

      // Calculer le score
      const riskMultiplier = getRiskMultiplier(riskLevel);
      const overdueMultiplier = 1 + (daysOverdue * 0.1);
      const exposureScore = Math.log10(Math.max(exposure, 1000)) / 10;
      const score = Math.round(riskMultiplier * overdueMultiplier * (1 + exposureScore) * 10);

      items.push({
        id: arb.id,
        subject: arb.subject,
        riskLevel,
        daysOverdue,
        exposure,
        score,
      });
    }

    // Traiter les arbitrages simples urgents
    for (const arb of arbitrages) {
      if (arb.status !== 'pending') continue;

      const deadline = parseFrDate(arb.deadline);
      if (!deadline) continue;

      const diffMs = now.getTime() - deadline.getTime();
      const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      
      if (daysOverdue <= 0) continue; // Pas en retard

      const riskLevel = arb.impact === 'high' ? 'eleve' : arb.impact === 'critical' ? 'critique' : 'modere';
      const riskMultiplier = getRiskMultiplier(riskLevel);
      const overdueMultiplier = 1 + (daysOverdue * 0.1);
      const score = Math.round(riskMultiplier * overdueMultiplier * 10);

      items.push({
        id: arb.id,
        subject: arb.subject,
        riskLevel,
        daysOverdue,
        exposure: 0,
        score,
      });
    }

    // Trier par score décroissant et prendre le top 5
    items.sort((a, b) => b.score - a.score);
    const top5 = items.slice(0, 5);

    return NextResponse.json({
      items: top5,
      total: items.length,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching escalade:', error);
    return NextResponse.json(
      { error: 'Failed to fetch escalade items' },
      { status: 500 }
    );
  }
}

