import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/dashboard
 * 
 * Récupère les données du dashboard principal Analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bureauId = searchParams.get('bureauId');
    const period = searchParams.get('period') || 'month';

    // Statistiques globales
    const stats = {
      totalKPIs: 24,
      avgPerformance: 87.5,
      totalAlerts: 8,
      criticalAlerts: 2,
      warningAlerts: 6,
      resolvedAlerts: 45,
      activeReports: 12,
      completedReports: 156,
      totalBureaux: 3,
      activeBureaux: 3,
      budgetConsumed: 75,
      budgetRemaining: 25,
    };

    // Activité récente
    const recentActivity = [
      {
        id: 'act-1',
        type: 'alert',
        title: 'Nouvelle alerte critique - Budget dépassé',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        userId: 'user-1',
        userName: 'Jean Dupont',
        severity: 'critical',
      },
      {
        id: 'act-2',
        type: 'report',
        title: 'Rapport mensuel généré',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        userId: 'user-2',
        userName: 'Marie Martin',
        severity: 'info',
      },
      {
        id: 'act-3',
        type: 'kpi_update',
        title: 'KPI Performance mis à jour - 92%',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: 'system',
        userName: 'Système',
        severity: 'success',
      },
      {
        id: 'act-4',
        type: 'alert',
        title: 'Alerte résolue - Délai SLA',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        userId: 'user-3',
        userName: 'Pierre Durant',
        severity: 'success',
      },
      {
        id: 'act-5',
        type: 'export',
        title: 'Export Excel généré',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        userId: 'user-1',
        userName: 'Jean Dupont',
        severity: 'info',
      },
    ];

    // KPIs en hausse/baisse
    const topMovers = {
      improving: [
        { id: 'kpi-1', name: 'Taux de conformité', change: '+12%', value: 92 },
        { id: 'kpi-2', name: 'Performance globale', change: '+8%', value: 87 },
        { id: 'kpi-3', name: 'Satisfaction client', change: '+5%', value: 88 },
      ],
      declining: [
        { id: 'kpi-4', name: 'Budget disponible', change: '-15%', value: 25 },
        { id: 'kpi-5', name: 'Délai moyen', change: '-3%', value: 2.8 },
      ],
    };

    // Bureaux performance
    const bureauxSummary = [
      {
        id: 'btp',
        name: 'Bureau Technique et Pilotage',
        code: 'BTP',
        performance: 92,
        trend: 'up',
        alerts: 1,
        activeProjects: 12,
      },
      {
        id: 'bj',
        name: 'Bureau Juridique',
        code: 'BJ',
        performance: 85,
        trend: 'stable',
        alerts: 3,
        activeProjects: 8,
      },
      {
        id: 'bs',
        name: 'Bureau Social',
        code: 'BS',
        performance: 88,
        trend: 'up',
        alerts: 4,
        activeProjects: 10,
      },
    ];

    // Recommandations
    const recommendations = [
      {
        id: 'rec-1',
        priority: 'high',
        title: 'Attention au budget',
        description: 'Le budget est consommé à 75%. Surveiller les dépenses.',
        action: 'Analyser les postes de dépenses',
      },
      {
        id: 'rec-2',
        priority: 'medium',
        title: 'Performance Bureau BJ',
        description: 'Le bureau BJ est à 85% de performance. Objectif: 90%',
        action: 'Renforcer l\'accompagnement',
      },
      {
        id: 'rec-3',
        priority: 'low',
        title: 'Optimisation possible',
        description: 'Le délai moyen peut encore être amélioré de 10%',
        action: 'Revoir les processus',
      },
    ];

    return NextResponse.json({
      stats,
      recentActivity,
      topMovers,
      bureauxSummary,
      recommendations,
      period,
      bureauId: bureauId || null,
      generatedAt: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics/dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération du dashboard' },
      { status: 500 }
    );
  }
}

