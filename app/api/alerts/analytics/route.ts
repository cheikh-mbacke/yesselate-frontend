/**
 * API Route: GET /api/alerts/analytics
 * Récupère les analytics avancées des alertes
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // 'day', 'week', 'month', 'year'
    const type = searchParams.get('type'); // Filter by alert type

    // Mock analytics data
    const analytics = {
      period: {
        type: period,
        startDate: '2026-01-04',
        endDate: '2026-01-10'
      },

      // Volume metrics
      volume: {
        total: 127,
        new: 23,
        resolved: 89,
        pending: 15,
        escalated: 8,
        
        byDay: [
          { date: '2026-01-04', created: 18, resolved: 12 },
          { date: '2026-01-05', created: 15, resolved: 14 },
          { date: '2026-01-06', created: 22, resolved: 18 },
          { date: '2026-01-07', created: 19, resolved: 16 },
          { date: '2026-01-08', created: 21, resolved: 15 },
          { date: '2026-01-09', created: 17, resolved: 12 },
          { date: '2026-01-10', created: 15, resolved: 2 }
        ]
      },

      // By severity
      bySeverity: {
        critical: { count: 8, percentage: 6.3, trend: 'up', trendValue: 12 },
        warning: { count: 34, percentage: 26.8, trend: 'stable', trendValue: 2 },
        info: { count: 62, percentage: 48.8, trend: 'down', trendValue: -8 },
        success: { count: 23, percentage: 18.1, trend: 'up', trendValue: 5 }
      },

      // By type
      byType: [
        { type: 'budget', label: 'Budget', count: 28, percentage: 22.0 },
        { type: 'payment', label: 'Paiements', count: 24, percentage: 18.9 },
        { type: 'contract', label: 'Contrats', count: 21, percentage: 16.5 },
        { type: 'deadline', label: 'Délais', count: 19, percentage: 15.0 },
        { type: 'resource', label: 'Ressources', count: 15, percentage: 11.8 },
        { type: 'system', label: 'Système', count: 12, percentage: 9.4 },
        { type: 'other', label: 'Autres', count: 8, percentage: 6.3 }
      ],

      // By source
      bySource: [
        { source: 'automatic', label: 'Automatique', count: 89, percentage: 70.1 },
        { source: 'manual', label: 'Manuel', count: 28, percentage: 22.0 },
        { source: 'external', label: 'Externe', count: 10, percentage: 7.9 }
      ],

      // Response times
      responseTimes: {
        average: 2.4, // hours
        median: 1.8,
        min: 0.1,
        max: 48.2,
        p90: 8.5,
        p95: 12.3,
        
        byPriority: [
          { priority: 'critical', avgHours: 0.8, target: 1, compliance: 92.5 },
          { priority: 'high', avgHours: 2.1, target: 4, compliance: 88.2 },
          { priority: 'medium', avgHours: 6.4, target: 8, compliance: 85.7 },
          { priority: 'low', avgHours: 12.8, target: 24, compliance: 94.1 }
        ]
      },

      // Resolution times
      resolutionTimes: {
        average: 18.6, // hours
        median: 12.4,
        min: 0.5,
        max: 168.0,
        p90: 48.0,
        p95: 72.0,
        
        byType: [
          { type: 'budget', avgHours: 24.5 },
          { type: 'payment', avgHours: 12.8 },
          { type: 'contract', avgHours: 36.2 },
          { type: 'deadline', avgHours: 8.4 },
          { type: 'resource', avgHours: 16.3 },
          { type: 'system', avgHours: 4.2 }
        ]
      },

      // SLA compliance
      slaCompliance: {
        overall: 89.4,
        byCategory: [
          { category: 'Response', target: '1h', compliance: 92.5 },
          { category: 'Acknowledgment', target: '4h', compliance: 88.2 },
          { category: 'Resolution', target: '48h', compliance: 85.7 },
          { category: 'Escalation', target: '2h', compliance: 94.1 }
        ],
        trend: [
          { date: '2026-01-04', compliance: 87.2 },
          { date: '2026-01-05', compliance: 88.5 },
          { date: '2026-01-06', compliance: 89.1 },
          { date: '2026-01-07', compliance: 88.8 },
          { date: '2026-01-08', compliance: 90.2 },
          { date: '2026-01-09', compliance: 89.8 },
          { date: '2026-01-10', compliance: 89.4 }
        ]
      },

      // Top performers (fastest resolvers)
      topPerformers: [
        { name: 'Amadou DIOP', resolved: 28, avgTime: 8.2, score: 95 },
        { name: 'Fatou SALL', resolved: 24, avgTime: 10.5, score: 92 },
        { name: 'Ousmane NDIAYE', resolved: 19, avgTime: 12.1, score: 88 },
        { name: 'Aïssatou DIAGNE', resolved: 18, avgTime: 14.3, score: 85 }
      ],

      // Problem areas
      problemAreas: [
        {
          area: 'Contrats en attente',
          alertCount: 12,
          avgAge: 72, // hours
          severity: 'high',
          recommendation: 'Accélérer le processus de validation'
        },
        {
          area: 'Dépassements budget',
          alertCount: 8,
          avgAge: 48,
          severity: 'critical',
          recommendation: 'Réviser les engagements et prévisions'
        },
        {
          area: 'Retards paiement',
          alertCount: 6,
          avgAge: 36,
          severity: 'high',
          recommendation: 'Prioriser les règlements en attente'
        }
      ],

      // Predictions (AI-based)
      predictions: {
        nextWeekVolume: 115,
        volumeTrend: 'stable',
        riskAlerts: [
          {
            type: 'budget',
            probability: 75,
            description: 'Risque de dépassement budget sur 3 projets'
          },
          {
            type: 'deadline',
            probability: 60,
            description: 'Possible retard sur 2 contrats'
          }
        ]
      },

      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API /api/alerts/analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des analytics',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

