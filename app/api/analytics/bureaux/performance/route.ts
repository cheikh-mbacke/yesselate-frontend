import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/bureaux/performance
 * 
 * Récupère les statistiques de performance par bureau
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const metric = searchParams.get('metric');

    const bureaux = [
      {
        id: 'btp',
        name: 'Bureau Technique et Pilotage',
        code: 'BTP',
        performance: {
          overall: 92,
          kpiCount: 12,
          alertCount: 1,
          complianceRate: 95,
          avgResponseTime: 2.1,
          productivityScore: 89,
          qualityScore: 93,
          budgetUsage: 68,
        },
        topKPIs: [
          {
            id: 'kpi-btp-1',
            name: 'Taux de validation',
            value: 95,
            status: 'success',
            trend: 'up',
          },
          {
            id: 'kpi-btp-2',
            name: 'Conformité SLA',
            value: 97,
            status: 'success',
            trend: 'up',
          },
          {
            id: 'kpi-btp-3',
            name: 'Score qualité',
            value: 93,
            status: 'success',
            trend: 'stable',
          },
        ],
        trends: {
          performanceChange: '+5%',
          alertsChange: '-2',
          projectsChange: '+3',
        },
        activeProjects: 12,
        completedProjects: 45,
        pendingItems: 5,
        team: {
          total: 25,
          active: 23,
          onLeave: 2,
        },
      },
      {
        id: 'bj',
        name: 'Bureau Juridique',
        code: 'BJ',
        performance: {
          overall: 85,
          kpiCount: 8,
          alertCount: 3,
          complianceRate: 88,
          avgResponseTime: 3.2,
          productivityScore: 82,
          qualityScore: 87,
          budgetUsage: 78,
        },
        topKPIs: [
          {
            id: 'kpi-bj-1',
            name: 'Taux de validation',
            value: 85,
            status: 'warning',
            trend: 'down',
          },
          {
            id: 'kpi-bj-2',
            name: 'Conformité SLA',
            value: 88,
            status: 'warning',
            trend: 'stable',
          },
          {
            id: 'kpi-bj-3',
            name: 'Score qualité',
            value: 87,
            status: 'success',
            trend: 'up',
          },
        ],
        trends: {
          performanceChange: '-3%',
          alertsChange: '+1',
          projectsChange: '0',
        },
        activeProjects: 8,
        completedProjects: 32,
        pendingItems: 12,
        team: {
          total: 18,
          active: 17,
          onLeave: 1,
        },
      },
      {
        id: 'bs',
        name: 'Bureau Social',
        code: 'BS',
        performance: {
          overall: 88,
          kpiCount: 10,
          alertCount: 4,
          complianceRate: 91,
          avgResponseTime: 2.8,
          productivityScore: 85,
          qualityScore: 90,
          budgetUsage: 72,
        },
        topKPIs: [
          {
            id: 'kpi-bs-1',
            name: 'Taux de validation',
            value: 90,
            status: 'success',
            trend: 'up',
          },
          {
            id: 'kpi-bs-2',
            name: 'Conformité SLA',
            value: 91,
            status: 'success',
            trend: 'stable',
          },
          {
            id: 'kpi-bs-3',
            name: 'Score qualité',
            value: 90,
            status: 'success',
            trend: 'up',
          },
        ],
        trends: {
          performanceChange: '+2%',
          alertsChange: '+2',
          projectsChange: '+1',
        },
        activeProjects: 10,
        completedProjects: 38,
        pendingItems: 8,
        team: {
          total: 22,
          active: 21,
          onLeave: 1,
        },
      },
    ];

    // Classement
    const ranking = bureaux
      .sort((a, b) => b.performance.overall - a.performance.overall)
      .map((b, index) => ({
        rank: index + 1,
        bureauId: b.id,
        bureauName: b.name,
        code: b.code,
        score: b.performance.overall,
      }));

    // Comparaison
    const comparison = {
      best: ranking[0],
      worst: ranking[ranking.length - 1],
      average: Math.round(
        bureaux.reduce((sum, b) => sum + b.performance.overall, 0) / bureaux.length
      ),
    };

    return NextResponse.json({
      bureaux,
      ranking,
      comparison,
      period,
      metric: metric || 'overall',
      generatedAt: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics/bureaux/performance:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des performances' },
      { status: 500 }
    );
  }
}

