/**
 * API Route: GET /api/alerts/critical
 * Récupère les alertes critiques (haute priorité, action immédiate)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const acknowledged = searchParams.get('acknowledged'); // 'true', 'false'
    const limit = parseInt(searchParams.get('limit') || '50');

    // Mock critical alerts
    const criticalAlerts = [
      {
        id: 'CRIT-001',
        title: 'Dépassement budget critique PROJ-001',
        description: 'Le budget a atteint 95% avant la fin des travaux',
        type: 'budget',
        severity: 'critical',
        status: 'open',
        
        metrics: {
          currentValue: 95,
          threshold: 80,
          unit: '%',
          trend: 'up',
          riskScore: 9.2
        },
        
        context: {
          projectId: 'PROJ-001',
          projectName: 'Rénovation Dakar Centre',
          budgetTotal: 150000000,
          budgetUsed: 142500000,
          remaining: 7500000,
          currency: 'XOF'
        },
        
        urgency: {
          level: 'immediate',
          reason: 'Risque arrêt travaux sous 48h',
          deadline: '2026-01-12T18:00:00Z',
          hoursRemaining: 48
        },
        
        actions: [
          { id: 'A1', label: 'Demander rallonge', type: 'primary' },
          { id: 'A2', label: 'Suspendre engagements', type: 'warning' },
          { id: 'A3', label: 'Escalader à DG', type: 'danger' }
        ],
        
        responsible: 'Amadou DIOP',
        bureau: 'Bureau Finances',
        acknowledged: false,
        acknowledgedAt: null,
        createdAt: '2026-01-10T07:00:00Z',
        daysOpen: 0
      },
      {
        id: 'CRIT-002',
        title: 'Retard paiement fournisseur critique',
        description: 'Pénalités de retard en cours, risque arrêt livraisons',
        type: 'payment',
        severity: 'critical',
        status: 'acknowledged',
        
        metrics: {
          currentValue: 72,
          threshold: 48,
          unit: 'heures de retard',
          trend: 'up',
          riskScore: 8.8
        },
        
        context: {
          supplierId: 'SUPPLIER-005',
          supplierName: 'Ciments du Sahel',
          invoiceId: 'FAC-2025-1234',
          amount: 12500000,
          dueDate: '2026-01-07',
          currency: 'XOF'
        },
        
        urgency: {
          level: 'immediate',
          reason: 'Pénalités journalières de 50 000 XOF',
          deadline: null,
          penaltyPerDay: 50000
        },
        
        actions: [
          { id: 'A1', label: 'Effectuer paiement', type: 'primary' },
          { id: 'A2', label: 'Négocier délai', type: 'secondary' },
          { id: 'A3', label: 'Documenter raison', type: 'warning' }
        ],
        
        responsible: 'Mamadou BA',
        bureau: 'Bureau Comptabilité',
        acknowledged: true,
        acknowledgedAt: '2026-01-09T10:00:00Z',
        createdAt: '2026-01-07T08:00:00Z',
        daysOpen: 3
      },
      {
        id: 'CRIT-003',
        title: 'Conflit ressources sur 3 projets',
        description: 'Même équipe planifiée sur 3 chantiers simultanément',
        type: 'resource',
        severity: 'critical',
        status: 'escalated',
        
        metrics: {
          currentValue: 3,
          threshold: 1,
          unit: 'conflits',
          trend: 'stable',
          riskScore: 8.5
        },
        
        context: {
          projects: ['PROJ-001', 'PROJ-003', 'PROJ-007'],
          team: 'Équipe Électricité A',
          teamSize: 6,
          startDate: '2026-01-13'
        },
        
        urgency: {
          level: 'high',
          reason: 'Décision d\'arbitrage requise avant 13/01',
          deadline: '2026-01-12T18:00:00Z',
          hoursRemaining: 48
        },
        
        actions: [
          { id: 'A1', label: 'Replanifier', type: 'primary' },
          { id: 'A2', label: 'Allouer équipe B', type: 'secondary' },
          { id: 'A3', label: 'Reporter projet', type: 'warning' }
        ],
        
        responsible: 'Ousmane NDIAYE',
        bureau: 'Bureau Planification',
        acknowledged: true,
        acknowledgedAt: '2026-01-09T14:00:00Z',
        escalatedTo: 'Direction Technique',
        createdAt: '2026-01-09T11:00:00Z',
        daysOpen: 1
      },
      {
        id: 'CRIT-004',
        title: 'Deadline contrat J-2',
        description: 'Signature contrat requise avant 12/01 (clause pénale)',
        type: 'contract',
        severity: 'critical',
        status: 'open',
        
        metrics: {
          currentValue: 2,
          threshold: 5,
          unit: 'jours restants',
          trend: 'down',
          riskScore: 9.0
        },
        
        context: {
          contractId: 'CT-2026-008',
          contractName: 'Marché fournitures électriques',
          counterpart: 'SENELEC',
          value: 85000000,
          currency: 'XOF',
          penaltyClause: '1% par jour de retard'
        },
        
        urgency: {
          level: 'immediate',
          reason: 'Pénalité de 850 000 XOF/jour après deadline',
          deadline: '2026-01-12T18:00:00Z',
          hoursRemaining: 48
        },
        
        actions: [
          { id: 'A1', label: 'Finaliser & signer', type: 'primary' },
          { id: 'A2', label: 'Demander extension', type: 'secondary' },
          { id: 'A3', label: 'Escalader DG', type: 'danger' }
        ],
        
        responsible: 'Fatou SALL',
        bureau: 'Bureau Juridique',
        acknowledged: false,
        acknowledgedAt: null,
        createdAt: '2026-01-10T08:00:00Z',
        daysOpen: 0
      }
    ];

    // Filter by acknowledged status
    let filtered = [...criticalAlerts];
    if (acknowledged !== null) {
      const isAcknowledged = acknowledged === 'true';
      filtered = filtered.filter(a => a.acknowledged === isAcknowledged);
    }

    // Sort by risk score (descending)
    filtered.sort((a, b) => b.metrics.riskScore - a.metrics.riskScore);

    // Summary
    const summary = {
      total: criticalAlerts.length,
      open: criticalAlerts.filter(a => a.status === 'open').length,
      acknowledged: criticalAlerts.filter(a => a.acknowledged).length,
      escalated: criticalAlerts.filter(a => a.status === 'escalated').length,
      
      avgRiskScore: 8.9,
      immediateAction: criticalAlerts.filter(a => a.urgency.level === 'immediate').length,
      
      byType: {
        budget: criticalAlerts.filter(a => a.type === 'budget').length,
        payment: criticalAlerts.filter(a => a.type === 'payment').length,
        resource: criticalAlerts.filter(a => a.type === 'resource').length,
        contract: criticalAlerts.filter(a => a.type === 'contract').length
      },
      
      totalFinancialRisk: 98050000, // XOF
      currency: 'XOF'
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
    console.error('Erreur API /api/alerts/critical:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des alertes critiques',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

