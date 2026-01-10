import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/kpis/:id
 * 
 * Récupère un KPI spécifique avec son historique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kpiId } = await params;

    // Générer l'historique (30 derniers jours)
    const generateHistory = () => {
      const history = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        history.push({
          date: date.toISOString(),
          value: Math.round((70 + Math.random() * 25) * 10) / 10,
        });
      }
      
      return history;
    };

    const kpi = {
      id: kpiId,
      name: 'Taux de validation',
      category: 'performance',
      value: 85,
      unit: '%',
      target: 90,
      current: 85,
      previous: 80,
      status: 'warning',
      trend: 'up',
      changePercent: 6.25,
      history: generateHistory(),
      metadata: {
        description: 'Pourcentage de demandes validées par rapport au total traité',
        formula: '(Validées / Total) * 100',
        threshold: {
          success: 90,
          warning: 80,
          critical: 70,
        },
        updateFrequency: 'hourly',
        dataSource: 'system',
        owner: 'Direction Technique',
        lastCalculated: new Date().toISOString(),
      },
      relatedKPIs: [
        { id: 'kpi-2', name: 'Délai moyen', correlation: 0.85 },
        { id: 'kpi-3', name: 'Conformité SLA', correlation: 0.92 },
      ],
      affectedBureaux: [
        { id: 'btp', name: 'BTP', value: 92 },
        { id: 'bj', name: 'BJ', value: 85 },
        { id: 'bs', name: 'BS', value: 88 },
      ],
    };

    return NextResponse.json({
      ...kpi,
      generatedAt: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=120', // 2 minutes
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics/kpis/:id:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération du KPI' },
      { status: 500 }
    );
  }
}

