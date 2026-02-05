/**
 * POST /api/analytics/comparison
 * Compare les performances entre bureaux ou périodes
 */

import { NextRequest, NextResponse } from 'next/server';

interface ComparisonRequest {
  type: 'bureaux' | 'periods';
  entities: string[]; // IDs des bureaux ou périodes
  metrics: string[]; // Métriques à comparer
  dateRange?: {
    start: string;
    end: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ComparisonRequest = await request.json();
    const { type, entities, metrics, dateRange } = body;

    // Validation
    if (!type || !entities || entities.length === 0 || !metrics || metrics.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'type, entities, and metrics are required',
        },
        { status: 400 }
      );
    }

    // Simuler une latence réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data pour les comparaisons
    const comparisonData = entities.map((entityId) => {
      const basePerformance = 70 + Math.random() * 25;
      
      return {
        id: entityId,
        name: type === 'bureaux' 
          ? getBureauName(entityId)
          : getPeriodName(entityId),
        
        metrics: metrics.reduce((acc, metricId) => {
          acc[metricId] = generateMetricValue(metricId, basePerformance);
          return acc;
        }, {} as Record<string, number>),

        // Données historiques (30 derniers jours)
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
          values: metrics.reduce((acc, metricId) => {
            acc[metricId] = generateMetricValue(metricId, basePerformance + (Math.random() - 0.5) * 10);
            return acc;
          }, {} as Record<string, number>),
        })),

        // Statistiques
        stats: {
          trend: Math.random() > 0.5 ? 'up' : 'down',
          changePercent: (Math.random() - 0.5) * 20,
          rank: Math.floor(Math.random() * entities.length) + 1,
        },

        // Métadonnées
        metadata: type === 'bureaux' ? {
          manager: getRandomName(),
          teamSize: Math.floor(Math.random() * 20) + 5,
          budget: Math.floor(Math.random() * 500000) + 100000,
        } : {
          daysInPeriod: 30,
          workingDays: 22,
        },
      };
    });

    // Calculer les statistiques globales
    const globalStats = {
      best: comparisonData.reduce((best, current) => {
        const bestPerf = best.metrics['performance'] || 0;
        const currentPerf = current.metrics['performance'] || 0;
        return currentPerf > bestPerf ? current : best;
      }),
      worst: comparisonData.reduce((worst, current) => {
        const worstPerf = worst.metrics['performance'] || Infinity;
        const currentPerf = current.metrics['performance'] || Infinity;
        return currentPerf < worstPerf ? current : worst;
      }),
      average: metrics.reduce((acc, metricId) => {
        const values = comparisonData.map(d => d.metrics[metricId] || 0);
        acc[metricId] = values.reduce((sum, v) => sum + v, 0) / values.length;
        return acc;
      }, {} as Record<string, number>),
      median: metrics.reduce((acc, metricId) => {
        const values = comparisonData.map(d => d.metrics[metricId] || 0).sort((a, b) => a - b);
        acc[metricId] = values[Math.floor(values.length / 2)];
        return acc;
      }, {} as Record<string, number>),
    };

    // Insights automatiques
    const insights = [
      {
        type: 'best_performer',
        message: `${globalStats.best.name} est le meilleur performer avec ${globalStats.best.metrics['performance']?.toFixed(1)}%`,
        priority: 'info',
      },
      {
        type: 'improvement_needed',
        message: `${globalStats.worst.name} nécessite une attention particulière`,
        priority: 'warning',
      },
      {
        type: 'trend',
        message: comparisonData.filter(d => d.stats.trend === 'up').length > comparisonData.length / 2
          ? 'Tendance générale positive'
          : 'Tendance générale à surveiller',
        priority: 'info',
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        type,
        entities: comparisonData,
        globalStats,
        insights,
        dateRange: dateRange || {
          start: new Date(Date.now() - 30 * 86400000).toISOString(),
          end: new Date().toISOString(),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing comparison:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process comparison',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper functions
function getBureauName(id: string): string {
  const bureaux: Record<string, string> = {
    btp: 'Bureau Technique et Pilotage',
    bj: 'Bureau Juridique',
    bs: 'Bureau Social',
    dg: 'Direction Générale',
    daf: 'Direction Administrative et Financière',
    dsi: 'Direction des Systèmes d\'Information',
  };
  return bureaux[id] || id.toUpperCase();
}

function getPeriodName(id: string): string {
  const periods: Record<string, string> = {
    'current-month': 'Mois en cours',
    'last-month': 'Mois dernier',
    'current-quarter': 'Trimestre en cours',
    'last-quarter': 'Trimestre dernier',
    'current-year': 'Année en cours',
    'last-year': 'Année dernière',
  };
  return periods[id] || id;
}

function generateMetricValue(metricId: string, basePerformance: number): number {
  const metricConfigs: Record<string, { min: number; max: number; decimals: number }> = {
    performance: { min: 60, max: 100, decimals: 1 },
    validation_rate: { min: 70, max: 95, decimals: 1 },
    sla_compliance: { min: 75, max: 98, decimals: 1 },
    avg_delay: { min: 1, max: 10, decimals: 1 },
    productivity: { min: 60, max: 95, decimals: 1 },
    quality_score: { min: 65, max: 100, decimals: 1 },
    budget_usage: { min: 50, max: 95, decimals: 1 },
    active_projects: { min: 5, max: 30, decimals: 0 },
  };

  const config = metricConfigs[metricId] || { min: 0, max: 100, decimals: 1 };
  
  // Pour avg_delay, inverser la logique (plus bas = mieux)
  let value = metricId === 'avg_delay'
    ? config.max - (basePerformance / 100) * (config.max - config.min)
    : config.min + (basePerformance / 100) * (config.max - config.min);

  // Ajouter une variation aléatoire
  value += (Math.random() - 0.5) * (config.max - config.min) * 0.1;

  // Contraindre dans les limites
  value = Math.max(config.min, Math.min(config.max, value));

  return parseFloat(value.toFixed(config.decimals));
}

function getRandomName(): string {
  const names = [
    'Jean Dupont',
    'Marie Martin',
    'Pierre Durand',
    'Sophie Bernard',
    'Luc Petit',
    'Anne Dubois',
  ];
  return names[Math.floor(Math.random() * names.length)];
}
