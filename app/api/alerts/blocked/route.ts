/**
 * API Route: GET /api/alerts/blocked
 * Récupère les alertes bloquées (en attente d'action)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason'); // 'validation', 'document', 'payment', 'arbitration'
    const limit = parseInt(searchParams.get('limit') || '50');

    // Mock blocked alerts
    const blockedAlerts = [
      {
        id: 'BLOCKED-001',
        alertId: 'ALERT-003',
        title: 'Contrat en attente validation DG',
        type: 'contract',
        severity: 'warning',
        
        blockage: {
          reason: 'validation',
          reasonLabel: 'En attente de validation',
          blockedSince: '2026-01-08T09:00:00Z',
          daysBlocked: 2,
          blocker: 'Direction Générale',
          blockerId: 'TEAM-DG',
          requiredAction: 'Signature contrat CT-2026-005',
          documents: ['contrat_ct2026005.pdf'],
          comments: 'En attente retour congé DG'
        },
        
        impact: {
          level: 'moyen',
          description: 'Retard démarrage travaux',
          estimatedCost: 500000,
          currency: 'XOF'
        },
        
        responsible: 'Fatou SALL',
        bureau: 'Bureau Juridique',
        createdAt: '2026-01-05T14:00:00Z',
        priority: 'haute'
      },
      {
        id: 'BLOCKED-002',
        alertId: 'ALERT-007',
        title: 'Document justificatif manquant',
        type: 'document',
        severity: 'warning',
        
        blockage: {
          reason: 'document',
          reasonLabel: 'Document manquant',
          blockedSince: '2026-01-09T11:00:00Z',
          daysBlocked: 1,
          blocker: 'Fournisseur ABC',
          blockerId: 'SUPPLIER-ABC',
          requiredAction: 'Facture proforma + bon de commande',
          documents: [],
          comments: 'Relancé le 09/01'
        },
        
        impact: {
          level: 'faible',
          description: 'Retard traitement dépense',
          estimatedCost: 0,
          currency: 'XOF'
        },
        
        responsible: 'Ousmane NDIAYE',
        bureau: 'Bureau Achats',
        createdAt: '2026-01-08T16:00:00Z',
        priority: 'normale'
      },
      {
        id: 'BLOCKED-003',
        alertId: 'ALERT-011',
        title: 'Paiement bloqué - Fonds insuffisants',
        type: 'payment',
        severity: 'critical',
        
        blockage: {
          reason: 'payment',
          reasonLabel: 'Fonds insuffisants',
          blockedSince: '2026-01-07T08:00:00Z',
          daysBlocked: 3,
          blocker: 'Trésorerie',
          blockerId: 'TEAM-TRESORERIE',
          requiredAction: 'Approvisionnement compte ou arbitrage',
          documents: ['situation_tresorerie.xlsx'],
          comments: 'Attente virement client CAT-2025-012'
        },
        
        impact: {
          level: 'critique',
          description: 'Pénalités de retard fournisseur',
          estimatedCost: 2500000,
          currency: 'XOF'
        },
        
        responsible: 'Mamadou BA',
        bureau: 'Bureau Comptabilité',
        createdAt: '2026-01-05T09:00:00Z',
        priority: 'critique'
      },
      {
        id: 'BLOCKED-004',
        alertId: 'ALERT-015',
        title: 'Arbitrage budgétaire requis',
        type: 'budget',
        severity: 'warning',
        
        blockage: {
          reason: 'arbitration',
          reasonLabel: 'Arbitrage requis',
          blockedSince: '2026-01-09T14:00:00Z',
          daysBlocked: 1,
          blocker: 'Comité de direction',
          blockerId: 'TEAM-CODIR',
          requiredAction: 'Décision réallocation budget PROJ-003',
          documents: ['note_arbitrage.pdf', 'simulations_budget.xlsx'],
          comments: 'CODIR programmé le 12/01'
        },
        
        impact: {
          level: 'moyen',
          description: 'Blocage avancement projet',
          estimatedCost: 1200000,
          currency: 'XOF'
        },
        
        responsible: 'Amadou DIOP',
        bureau: 'Bureau Finances',
        createdAt: '2026-01-08T10:00:00Z',
        priority: 'haute'
      }
    ];

    // Filter by reason
    let filtered = [...blockedAlerts];
    if (reason) {
      filtered = filtered.filter(a => a.blockage.reason === reason);
    }

    // Sort by days blocked (descending) then by severity
    filtered.sort((a, b) => {
      if (b.blockage.daysBlocked !== a.blockage.daysBlocked) {
        return b.blockage.daysBlocked - a.blockage.daysBlocked;
      }
      
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const aSev = severityOrder[a.severity as keyof typeof severityOrder] ?? 99;
      const bSev = severityOrder[b.severity as keyof typeof severityOrder] ?? 99;
      return aSev - bSev;
    });

    // Summary
    const summary = {
      total: blockedAlerts.length,
      byReason: {
        validation: blockedAlerts.filter(a => a.blockage.reason === 'validation').length,
        document: blockedAlerts.filter(a => a.blockage.reason === 'document').length,
        payment: blockedAlerts.filter(a => a.blockage.reason === 'payment').length,
        arbitration: blockedAlerts.filter(a => a.blockage.reason === 'arbitration').length
      },
      avgDaysBlocked: 1.75,
      totalImpact: blockedAlerts.reduce((sum, a) => sum + (a.impact.estimatedCost || 0), 0),
      currency: 'XOF',
      criticalCount: blockedAlerts.filter(a => a.severity === 'critical').length
    };

    return NextResponse.json({
      success: true,
      data: {
        alerts: filtered.slice(0, limit),
        summary
      },
      pagination: {
        total: filtered.length,
        limit,
        offset: 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API /api/alerts/blocked:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des alertes bloquées',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

