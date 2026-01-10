import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/comparison
 * 
 * Compare les données Analytics selon différents critères
 * Paramètres: compareBy (bureau, period, type), items (liste des éléments à comparer)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const compareBy = searchParams.get('compareBy') || 'bureau'; // bureau, period, type
    const items = searchParams.get('items')?.split(',') || [];
    const metric = searchParams.get('metric') || 'all';

    // Données de comparaison par bureau
    const bureauComparison = [
      {
        code: 'BTP',
        name: 'Bureau des Travaux Publics',
        metrics: {
          totalDemands: 156,
          validated: 132,
          pending: 18,
          overdue: 6,
          validationRate: 85,
          slaCompliance: 92,
          avgDelay: 3.2,
          score: 88,
        },
        trend: 'up',
        trendValue: 5,
      },
      {
        code: 'DG',
        name: 'Direction Générale',
        metrics: {
          totalDemands: 98,
          validated: 78,
          pending: 15,
          overdue: 5,
          validationRate: 80,
          slaCompliance: 88,
          avgDelay: 4.1,
          score: 82,
        },
        trend: 'stable',
        trendValue: 0,
      },
      {
        code: 'DAF',
        name: 'Direction Administrative et Financière',
        metrics: {
          totalDemands: 124,
          validated: 99,
          pending: 20,
          overdue: 5,
          validationRate: 80,
          slaCompliance: 90,
          avgDelay: 3.8,
          score: 84,
        },
        trend: 'up',
        trendValue: 3,
      },
      {
        code: 'BJ',
        name: 'Bureau Juridique',
        metrics: {
          totalDemands: 67,
          validated: 52,
          pending: 10,
          overdue: 5,
          validationRate: 78,
          slaCompliance: 85,
          avgDelay: 5.2,
          score: 76,
        },
        trend: 'down',
        trendValue: -4,
      },
      {
        code: 'DSI',
        name: 'Direction des Systèmes d\'Information',
        metrics: {
          totalDemands: 45,
          validated: 32,
          pending: 8,
          overdue: 5,
          validationRate: 71,
          slaCompliance: 82,
          avgDelay: 6.1,
          score: 68,
        },
        trend: 'down',
        trendValue: -7,
      },
    ];

    // Données de comparaison par période
    const periodComparison = [
      {
        period: 'Cette semaine',
        code: 'current_week',
        metrics: {
          totalDemands: 89,
          validated: 72,
          pending: 12,
          overdue: 5,
          validationRate: 81,
          slaCompliance: 88,
          avgDelay: 3.5,
        },
      },
      {
        period: 'Semaine dernière',
        code: 'last_week',
        metrics: {
          totalDemands: 95,
          validated: 78,
          pending: 14,
          overdue: 3,
          validationRate: 82,
          slaCompliance: 91,
          avgDelay: 3.2,
        },
      },
      {
        period: 'Ce mois',
        code: 'current_month',
        metrics: {
          totalDemands: 342,
          validated: 278,
          pending: 45,
          overdue: 19,
          validationRate: 81,
          slaCompliance: 87,
          avgDelay: 3.8,
        },
      },
      {
        period: 'Mois dernier',
        code: 'last_month',
        metrics: {
          totalDemands: 358,
          validated: 286,
          pending: 52,
          overdue: 20,
          validationRate: 80,
          slaCompliance: 86,
          avgDelay: 4.1,
        },
      },
    ];

    // Sélectionner les données selon le type de comparaison
    let comparisonData;
    if (compareBy === 'bureau') {
      comparisonData = items.length > 0
        ? bureauComparison.filter(b => items.includes(b.code))
        : bureauComparison;
    } else if (compareBy === 'period') {
      comparisonData = items.length > 0
        ? periodComparison.filter(p => items.includes(p.code))
        : periodComparison;
    } else {
      comparisonData = bureauComparison;
    }

    // Calculer les statistiques globales de comparaison
    const stats = {
      best: comparisonData.reduce((best, current) => {
        const currentScore = current.metrics.validationRate + current.metrics.slaCompliance;
        const bestScore = best.metrics.validationRate + best.metrics.slaCompliance;
        return currentScore > bestScore ? current : best;
      }),
      worst: comparisonData.reduce((worst, current) => {
        const currentScore = current.metrics.validationRate + current.metrics.slaCompliance;
        const worstScore = worst.metrics.validationRate + worst.metrics.slaCompliance;
        return currentScore < worstScore ? current : worst;
      }),
      average: {
        validationRate: Math.round(comparisonData.reduce((sum, item) => sum + item.metrics.validationRate, 0) / comparisonData.length),
        slaCompliance: Math.round(comparisonData.reduce((sum, item) => sum + item.metrics.slaCompliance, 0) / comparisonData.length),
        avgDelay: Math.round(comparisonData.reduce((sum, item) => sum + item.metrics.avgDelay, 0) / comparisonData.length * 10) / 10,
      },
    };

    // Insights de comparaison
    const insights = [
      {
        type: 'gap',
        message: `Écart de ${stats.best.metrics.validationRate - stats.worst.metrics.validationRate}% entre le meilleur et le moins bon taux de validation`,
      },
      {
        type: 'improvement',
        message: comparisonData.filter((d: any) => d.trend === 'up').length > comparisonData.length / 2
          ? 'Majorité des éléments en progression'
          : 'Des améliorations sont nécessaires',
      },
    ];

    return NextResponse.json({
      compareBy,
      metric,
      data: comparisonData,
      stats,
      insights,
      ts: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics/comparison:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la comparaison' },
      { status: 500 }
    );
  }
}

