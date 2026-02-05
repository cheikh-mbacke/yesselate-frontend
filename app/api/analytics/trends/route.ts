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

    // Générer des trends individuels avec différentes tendances
    const trends = [
      {
        id: 'trend-validation-rate',
        metric: 'Taux de validation',
        current: avgValidation,
        previous: Math.round(avgValidation - (trend === 'up' ? 5 : trend === 'down' ? -5 : 0)),
        change: trend === 'up' ? 5 : trend === 'down' ? -5 : 0,
        changePercent: trendPercentage,
        trend: trend as 'up' | 'down' | 'stable',
        unit: '%',
        period: '30 jours',
      },
      {
        id: 'trend-sla-compliance',
        metric: 'Conformité SLA',
        current: avgSLA,
        previous: Math.round(avgSLA - (trend === 'up' ? 3 : trend === 'down' ? -3 : 0)),
        change: trend === 'up' ? 3 : trend === 'down' ? -3 : 0,
        changePercent: trend === 'up' ? Math.round((3 / (avgSLA - 3)) * 100) : trend === 'down' ? Math.round((-3 / (avgSLA + 3)) * 100) : 0,
        trend: trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'stable' as 'up' | 'down' | 'stable',
        unit: '%',
        period: '30 jours',
      },
      {
        id: 'trend-avg-delay',
        metric: 'Délai moyen',
        current: avgDelay,
        previous: Math.round((avgDelay - (trend === 'down' ? 0.5 : trend === 'up' ? -0.5 : 0)) * 10) / 10,
        change: trend === 'down' ? -0.5 : trend === 'up' ? 0.5 : 0,
        changePercent: trend === 'down' ? -15 : trend === 'up' ? 15 : 0,
        trend: trend === 'down' ? 'up' as const : trend === 'up' ? 'down' as const : 'stable' as const, // Inverse car moins de délai = mieux
        unit: 'jours',
        period: '30 jours',
      },
      {
        id: 'trend-demand-count',
        metric: 'Nombre de demandes',
        current: trendData[trendData.length - 1].demandCount,
        previous: trendData[Math.floor(trendData.length / 2)].demandCount,
        change: trendData[trendData.length - 1].demandCount - trendData[Math.floor(trendData.length / 2)].demandCount,
        changePercent: Math.round(((trendData[trendData.length - 1].demandCount - trendData[Math.floor(trendData.length / 2)].demandCount) / trendData[Math.floor(trendData.length / 2)].demandCount) * 100),
        trend: trendData[trendData.length - 1].demandCount > trendData[Math.floor(trendData.length / 2)].demandCount ? 'up' as const : trendData[trendData.length - 1].demandCount < trendData[Math.floor(trendData.length / 2)].demandCount ? 'down' as const : 'stable' as const,
        unit: 'demandes',
        period: '30 jours',
      },
      {
        id: 'trend-pending-count',
        metric: 'En attente',
        current: trendData[trendData.length - 1].pendingCount,
        previous: trendData[Math.floor(trendData.length / 2)].pendingCount,
        change: trendData[trendData.length - 1].pendingCount - trendData[Math.floor(trendData.length / 2)].pendingCount,
        changePercent: Math.round(((trendData[trendData.length - 1].pendingCount - trendData[Math.floor(trendData.length / 2)].pendingCount) / Math.max(1, trendData[Math.floor(trendData.length / 2)].pendingCount)) * 100),
        trend: trendData[trendData.length - 1].pendingCount < trendData[Math.floor(trendData.length / 2)].pendingCount ? 'up' as const : trendData[trendData.length - 1].pendingCount > trendData[Math.floor(trendData.length / 2)].pendingCount ? 'down' as const : 'stable' as const, // Inverse car moins d'attente = mieux
        unit: 'demandes',
        period: '30 jours',
      },
      {
        id: 'trend-productivity',
        metric: 'Productivité',
        current: Math.round((avgValidation * 0.6 + avgSLA * 0.4)),
        previous: Math.round((avgValidation * 0.6 + avgSLA * 0.4) - (trend === 'up' ? 4 : trend === 'down' ? -4 : 0)),
        change: trend === 'up' ? 4 : trend === 'down' ? -4 : 0,
        changePercent: trend === 'up' ? 5 : trend === 'down' ? -5 : 0,
        trend: trend as 'up' | 'down' | 'stable',
        unit: '%',
        period: '30 jours',
      },
    ];

    return NextResponse.json({
      period,
      metric,
      bureau: bureau || 'all',
      trends, // ✅ Tableau de trends avec propriété trend
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

