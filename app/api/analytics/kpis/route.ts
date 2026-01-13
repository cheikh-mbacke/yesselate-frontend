import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/kpis
 * 
 * Récupère les KPIs détaillés avec calculs automatiques
 * Query params: category, status, bureauId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const bureauId = searchParams.get('bureauId');

    const allKpis = [
      {
        id: 'kpi-1',
        name: 'Taux de validation',
        value: 85,
        target: 90,
        current: 85,
        unit: '%',
        trend: 'up',
        change: 5,
        status: 'warning',
        description: 'Pourcentage de demandes validées',
        category: 'performance',
        lastUpdate: new Date().toISOString(),
      },
      {
        id: 'kpi-2',
        name: 'Délai moyen',
        value: 2.8,
        target: 3,
        current: 2.8,
        unit: 'jours',
        trend: 'down',
        change: -7,
        status: 'success',
        description: 'Temps moyen de traitement',
        category: 'operational',
        lastUpdate: new Date().toISOString(),
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

    // Appliquer les filtres
    let kpis = allKpis;
    if (category) {
      kpis = kpis.filter(k => k.category === category);
    }
    if (status) {
      kpis = kpis.filter(k => k.status === status);
    }
    if (bureauId) {
      // En production, filtrer par bureau
      // Pour l'instant, retourner tous les KPIs
    }

    const summary = {
      total: kpis.length,
      success: kpis.filter(k => k.status === 'success').length,
      warning: kpis.filter(k => k.status === 'warning').length,
      critical: kpis.filter(k => k.status === 'critical').length,
      byCategory: {
        performance: allKpis.filter(k => k.category === 'performance').length,
        financial: allKpis.filter(k => k.category === 'financial').length,
        operational: allKpis.filter(k => k.category === 'operational').length,
        quality: allKpis.filter(k => k.category === 'quality').length,
        compliance: allKpis.filter(k => k.category === 'compliance').length,
      },
    };

    return NextResponse.json({
      kpis,
      summary,
      filters: { category, status, bureauId },
      ts: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=120', // 2 minutes
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

