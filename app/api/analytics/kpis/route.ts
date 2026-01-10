import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/kpis
 * 
 * Récupère les KPIs détaillés avec calculs automatiques
 */
export async function GET(request: NextRequest) {
  try {
    const kpis = [
      {
        id: 'kpi-1',
        name: 'Taux de validation',
        value: 85,
        target: 90,
        unit: '%',
        trend: 'up',
        change: 5,
        status: 'warning',
        description: 'Pourcentage de demandes validées',
        category: 'performance',
      },
      {
        id: 'kpi-2',
        name: 'Délai moyen',
        value: 2.8,
        target: 3,
        unit: 'jours',
        trend: 'down',
        change: -7,
        status: 'good',
        description: 'Temps moyen de traitement',
        category: 'performance',
      },
      {
        id: 'kpi-3',
        name: 'Conformité SLA',
        value: 92,
        target: 90,
        unit: '%',
        trend: 'up',
        change: 3,
        status: 'good',
        description: 'Respect des délais contractuels',
        category: 'performance',
      },
      {
        id: 'kpi-4',
        name: 'Demandes en attente',
        value: 8,
        target: 10,
        unit: '',
        trend: 'stable',
        change: 0,
        status: 'good',
        description: 'Demandes nécessitant une action',
        category: 'performance',
      },
      {
        id: 'kpi-5',
        name: 'Productivité',
        value: 78,
        target: 75,
        unit: '%',
        trend: 'up',
        change: 4,
        status: 'good',
        description: 'Ratio validation/total',
        category: 'performance',
      },
      {
        id: 'kpi-6',
        name: 'Score qualité',
        value: 82,
        target: 80,
        unit: '/100',
        trend: 'up',
        change: 2,
        status: 'good',
        description: 'Score composite pondéré',
        category: 'performance',
      },
      {
        id: 'kpi-7',
        name: 'Budget consommé',
        value: 75,
        target: 80,
        unit: '%',
        trend: 'up',
        change: 5,
        status: 'good',
        description: 'Pourcentage du budget utilisé',
        category: 'financier',
      },
      {
        id: 'kpi-8',
        name: 'Coût moyen/demande',
        value: 45,
        target: 50,
        unit: 'M FCFA',
        trend: 'down',
        change: -10,
        status: 'good',
        description: 'Coût unitaire moyen',
        category: 'financier',
      },
      {
        id: 'kpi-9',
        name: 'Projets actifs',
        value: 18,
        target: 20,
        unit: '',
        trend: 'up',
        change: 2,
        status: 'good',
        description: 'Nombre de projets en cours',
        category: 'operationnel',
      },
      {
        id: 'kpi-10',
        name: 'Utilisation ressources',
        value: 78,
        target: 80,
        unit: '%',
        trend: 'stable',
        change: 0,
        status: 'good',
        description: 'Taux d\'utilisation des ressources',
        category: 'operationnel',
      },
    ];

    const summary = {
      total: kpis.length,
      good: kpis.filter(k => k.status === 'good').length,
      warning: kpis.filter(k => k.status === 'warning').length,
      critical: kpis.filter(k => k.status === 'critical').length,
      byCategory: {
        performance: kpis.filter(k => k.category === 'performance').length,
        financier: kpis.filter(k => k.category === 'financier').length,
        operationnel: kpis.filter(k => k.category === 'operationnel').length,
      },
    };

    return NextResponse.json({
      kpis,
      summary,
      ts: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics/kpis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des KPIs' },
      { status: 500 }
    );
  }
}

