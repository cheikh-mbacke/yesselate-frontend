import { NextRequest, NextResponse } from 'next/server';
import { coordinationStats, arbitragesVivants, arbitrages, bureauxGovernance } from '@/lib/data';

/**
 * GET /api/arbitrages/stats
 * ========================
 * Retourne les statistiques globales sur les arbitrages
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

    // Calculer les arbitrages simples urgents
    const simplesUrgent = arbitrages.filter((a: any) => {
      if (a.status !== 'pending') return false;
      const d = parseFrDate(a.deadline);
      if (!d) return false;
      const in3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      return d <= in3;
    }).length;

    const simplesPending = arbitrages.filter((a: any) => a.status === 'pending').length;
    const simplesResolved = arbitrages.filter((a: any) => a.status === 'resolved').length;

    // Stats bureaux
    const bureauxSurcharge = bureauxGovernance.filter((b: any) => b.charge > 85).length;
    const totalGoulots = bureauxGovernance.reduce((acc: number, b: any) => acc + (b.goulots?.length || 0), 0);

    // Stats par bureau
    const byBureau = bureauxGovernance.map((b: any) => ({
      bureau: b.nom || b.id,
      count: b.arbitragesCount || Math.floor(Math.random() * 10) + 1,
      critiques: b.charge > 85 ? Math.floor(Math.random() * 3) + 1 : 0,
    })).slice(0, 10);

    // Stats par type
    const byType = [
      { type: 'Budget', count: Math.floor(simplesPending * 0.3) },
      { type: 'Ressources', count: Math.floor(simplesPending * 0.25) },
      { type: 'Planning', count: Math.floor(simplesPending * 0.2) },
      { type: 'Technique', count: Math.floor(simplesPending * 0.15) },
      { type: 'Autre', count: Math.floor(simplesPending * 0.1) },
    ];

    // Tendances (simulées)
    const trends = {
      daily: Math.floor(Math.random() * 10) - 5,
      weekly: Math.floor(Math.random() * 20) - 10,
      monthly: Math.floor(Math.random() * 30) - 15,
    };

    const now = new Date();

    // Calculer les arbitrages en retard
    let enRetard = 0;
    
    // Arbitrages vivants en retard
    enRetard += arbitragesVivants.filter((a: any) => {
      if (a.status === 'tranche') return false;
      return a.timing?.isOverdue === true || (a.timing?.daysRemaining && a.timing.daysRemaining < 0);
    }).length;

    // Arbitrages simples en retard
    enRetard += arbitrages.filter((a: any) => {
      if (a.status !== 'pending') return false;
      const d = parseFrDate(a.deadline);
      if (!d) return false;
      return d < now;
    }).length;

    // Exposition financière
    const expositionTotale = arbitragesVivants
      .filter((a: any) => a.status !== 'tranche')
      .reduce((acc: number, a: any) => {
        return acc + (a.context?.financialExposure || a.montant || a.amount || 0);
      }, 0);

    // Temps de résolution moyen (simulé)
    const avgResolutionTime = Math.floor(Math.random() * 5) + 3;

    // Compteurs de base
    const baseStats = coordinationStats.arbitrages || {
      total: 0,
      ouverts: 0,
      tranches: 0,
      critiques: 0,
    };

    const stats = {
      total: baseStats.total || arbitragesVivants.length + arbitrages.length,
      ouverts: baseStats.ouverts || arbitragesVivants.filter((a: any) => a.status !== 'tranche').length,
      tranches: baseStats.tranches || arbitragesVivants.filter((a: any) => a.status === 'tranche').length + simplesResolved,
      critiques: baseStats.critiques || arbitragesVivants.filter((a: any) => a.context?.riskLevel === 'critique').length,
      enRetard,
      simplesPending,
      simplesResolved,
      simplesUrgent,
      bureauxSurcharge,
      totalGoulots,
      byBureau,
      byType,
      trends,
      expositionTotale,
      avgResolutionTime,
      ts: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching arbitrages stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch arbitrages statistics' },
      { status: 500 }
    );
  }
}

