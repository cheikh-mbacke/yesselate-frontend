/**
 * GET /api/dashboard/risks
 * Risques temps réel du Dashboard
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity'); // 'critical' | 'warning' | 'all'
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Données de démonstration
    let risks = [
      {
        id: 'RISK-001',
        kind: 'blocked_dossier',
        severity: 'critical',
        score: 92,
        title: 'BC bloqué depuis 5 jours',
        detail: 'BC-2024-0847 • Matériaux Phase 3',
        source: 'BF',
        explain: 'SLA dépassé: substitution recommandée pour rétablir la chaîne de validation.',
        trend: 'up',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        relatedItem: 'BC-2024-0847',
      },
      {
        id: 'RISK-002',
        kind: 'payment_due',
        severity: 'critical',
        score: 88,
        title: 'Paiement en retard 3 jours',
        detail: 'PAY-2024-1234 • ACME Corp • 128.5M FCFA',
        source: 'BCG',
        explain: 'Retard: risque réputationnel / pénalités / blocage fournisseur.',
        trend: 'stable',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        relatedItem: 'PAY-2024-1234',
      },
      {
        id: 'RISK-003',
        kind: 'contract_expiry',
        severity: 'warning',
        score: 72,
        title: 'Contrat expire dans 5 jours',
        detail: 'CTR-2024-0567 • Sous-traitance électricité',
        source: 'BJA',
        explain: 'Expiration proche: sécuriser la signature et la traçabilité.',
        trend: 'down',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        relatedItem: 'CTR-2024-0567',
      },
      {
        id: 'RISK-004',
        kind: 'system_alert',
        severity: 'warning',
        score: 65,
        title: 'Charge bureau excessive',
        detail: 'BOP • Charge à 95% • 4 goulots détectés',
        source: 'Système',
        explain: 'Alerte préventive: risque de retards en cascade.',
        trend: 'up',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'RISK-005',
        kind: 'blocked_dossier',
        severity: 'warning',
        score: 58,
        title: 'Arbitrage en attente 3 jours',
        detail: 'ARB-2024-0089 • Conflit ressources',
        source: 'BOP',
        explain: 'Délai de décision allongé: impact sur planning.',
        trend: 'stable',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        relatedItem: 'ARB-2024-0089',
      },
    ];

    // Filtrer par sévérité
    if (severity && severity !== 'all') {
      risks = risks.filter((r) => r.severity === severity);
    }

    // Trier par score décroissant
    risks.sort((a, b) => b.score - a.score);

    // Limiter
    risks = risks.slice(0, limit);

    // Stats agrégées
    const stats = {
      total: risks.length,
      critical: risks.filter((r) => r.severity === 'critical').length,
      warning: risks.filter((r) => r.severity === 'warning').length,
      avgScore: Math.round(risks.reduce((acc, r) => acc + r.score, 0) / (risks.length || 1)),
    };

    return NextResponse.json({
      risks,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching dashboard risks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard risks' },
      { status: 500 }
    );
  }
}

