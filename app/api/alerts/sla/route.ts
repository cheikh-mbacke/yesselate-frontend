/**
 * API Route: GET /api/alerts/sla
 * Récupère les alertes SLA (dépassées ou en risque)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'breached', 'warning', 'ok'
    const limit = parseInt(searchParams.get('limit') || '50');

    // Mock SLA alerts
    const slaAlerts = [
      {
        id: 'ALERT-SLA-001',
        alertId: 'ALERT-001',
        title: 'Dépassement budget PROJ-001',
        type: 'budget',
        severity: 'critical',
        
        sla: {
          type: 'response',
          targetHours: 1,
          actualHours: 2.5,
          status: 'breached',
          breachedAt: '2026-01-10T09:30:00Z',
          breachDuration: 1.5, // hours
          penalty: 'Notification direction'
        },
        
        responsible: 'Amadou DIOP',
        bureau: 'Bureau Finances',
        createdAt: '2026-01-10T08:30:00Z',
        priority: 'haute'
      },
      {
        id: 'ALERT-SLA-002',
        alertId: 'ALERT-005',
        title: 'Contrat non signé CT-2026-003',
        type: 'contract',
        severity: 'warning',
        
        sla: {
          type: 'resolution',
          targetHours: 48,
          actualHours: 42,
          remainingHours: 6,
          status: 'warning',
          breachedAt: null,
          estimatedBreachAt: '2026-01-11T06:00:00Z',
          penalty: 'Escalade automatique'
        },
        
        responsible: 'Fatou SALL',
        bureau: 'Bureau Juridique',
        createdAt: '2026-01-08T12:00:00Z',
        priority: 'moyenne'
      },
      {
        id: 'ALERT-SLA-003',
        alertId: 'ALERT-012',
        title: 'Paiement fournisseur en retard',
        type: 'payment',
        severity: 'critical',
        
        sla: {
          type: 'resolution',
          targetHours: 24,
          actualHours: 72,
          status: 'breached',
          breachedAt: '2026-01-08T14:00:00Z',
          breachDuration: 48,
          penalty: 'Pénalités de retard + rapport incident'
        },
        
        responsible: 'Mamadou BA',
        bureau: 'Bureau Comptabilité',
        createdAt: '2026-01-07T14:00:00Z',
        priority: 'critique'
      },
      {
        id: 'ALERT-SLA-004',
        alertId: 'ALERT-018',
        title: 'Document manquant DP-2026-045',
        type: 'document',
        severity: 'info',
        
        sla: {
          type: 'acknowledgment',
          targetHours: 4,
          actualHours: 2,
          remainingHours: 2,
          status: 'ok',
          breachedAt: null,
          penalty: null
        },
        
        responsible: 'Ousmane NDIAYE',
        bureau: 'Bureau Administratif',
        createdAt: '2026-01-10T10:00:00Z',
        priority: 'basse'
      }
    ];

    // Filter by status
    let filtered = [...slaAlerts];
    if (status) {
      filtered = filtered.filter(a => a.sla.status === status);
    }

    // Sort by severity then by breach duration
    filtered.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const aSev = severityOrder[a.severity as keyof typeof severityOrder] ?? 99;
      const bSev = severityOrder[b.severity as keyof typeof severityOrder] ?? 99;
      
      if (aSev !== bSev) return aSev - bSev;
      
      const aBreachDuration = a.sla.breachDuration || 0;
      const bBreachDuration = b.sla.breachDuration || 0;
      return bBreachDuration - aBreachDuration;
    });

    // Summary stats
    const summary = {
      total: slaAlerts.length,
      breached: slaAlerts.filter(a => a.sla.status === 'breached').length,
      warning: slaAlerts.filter(a => a.sla.status === 'warning').length,
      ok: slaAlerts.filter(a => a.sla.status === 'ok').length,
      
      complianceRate: 75.0, // %
      avgBreachDuration: 24.75, // hours
      
      byType: [
        { type: 'response', breached: 1, warning: 0, ok: 2 },
        { type: 'acknowledgment', breached: 0, warning: 1, ok: 3 },
        { type: 'resolution', breached: 2, warning: 1, ok: 1 }
      ]
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
    console.error('Erreur API /api/alerts/sla:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des SLA',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

