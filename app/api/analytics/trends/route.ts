import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/trends
 * 
 * Récupère les données de tendances Analytics
 * Paramètres optionnels: period, metric, bureau
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // week, month, quarter, year
    const metric = searchParams.get('metric') || 'all';
    const bureau = searchParams.get('bureau');

    // Générer des données de tendance
    const generateTrendPoints = (days: number) => {
      const points = [];
      const now = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        points.push({
          date: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          validationRate: Math.round(70 + Math.random() * 20),
          slaCompliance: Math.round(80 + Math.random() * 15),
          avgDelay: Math.round(3 + Math.random() * 5),
          demandCount: Math.round(50 + Math.random() * 30),
          pendingCount: Math.round(10 + Math.random() * 15),
          overdueCount: Math.round(2 + Math.random() * 5),
        });
      }
      
      return points;
    };

    const days = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365;
    const trendData = generateTrendPoints(days);

    // Calculer les statistiques globales
    const avgValidation = Math.round(trendData.reduce((sum, p) => sum + p.validationRate, 0) / trendData.length);
    const avgSLA = Math.round(trendData.reduce((sum, p) => sum + p.slaCompliance, 0) / trendData.length);
    const avgDelay = Math.round(trendData.reduce((sum, p) => sum + p.avgDelay, 0) / trendData.length * 10) / 10;

    // Calculer la tendance (comparaison première moitié vs deuxième moitié)
    const midPoint = Math.floor(trendData.length / 2);
    const firstHalf = trendData.slice(0, midPoint);
    const secondHalf = trendData.slice(midPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, p) => sum + p.validationRate, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, p) => sum + p.validationRate, 0) / secondHalf.length;
    const trend = secondHalfAvg > firstHalfAvg ? 'up' : secondHalfAvg < firstHalfAvg ? 'down' : 'stable';
    const trendPercentage = Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);

    // Projections
    const projection = {
      nextWeek: {
        validationRate: Math.min(100, avgValidation + (trend === 'up' ? 2 : trend === 'down' ? -2 : 0)),
        slaCompliance: Math.min(100, avgSLA + (trend === 'up' ? 1 : trend === 'down' ? -1 : 0)),
        expectedDemands: Math.round(trendData[trendData.length - 1].demandCount * 1.05),
      },
      nextMonth: {
        validationRate: Math.min(100, avgValidation + (trend === 'up' ? 5 : trend === 'down' ? -5 : 0)),
        slaCompliance: Math.min(100, avgSLA + (trend === 'up' ? 3 : trend === 'down' ? -3 : 0)),
        expectedDemands: Math.round(trendData[trendData.length - 1].demandCount * 1.15),
      },
    };

    // Signaux faibles détectés
    const signals = [
      {
        id: 'sig-1',
        type: 'warning',
        metric: 'Délai moyen',
        message: 'Augmentation progressive du délai moyen de traitement (+0.5j/semaine)',
        detectedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'sig-2',
        type: 'positive',
        metric: 'Taux validation',
        message: 'Amélioration constante du taux de validation depuis 2 semaines',
        detectedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ];

    return NextResponse.json({
      period,
      metric,
      bureau: bureau || 'all',
      data: trendData,
      summary: {
        avgValidation,
        avgSLA,
        avgDelay,
        trend,
        trendPercentage,
        totalDemands: trendData.reduce((sum, p) => sum + p.demandCount, 0),
      },
      projection,
      signals,
      ts: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics/trends:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des tendances' },
      { status: 500 }
    );
  }
}

