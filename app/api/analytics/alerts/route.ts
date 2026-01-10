import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/alerts
 * 
 * Récupère les alertes actives du système
 */
export async function GET(request: NextRequest) {
  try {
    const alerts = [
      {
        id: 'alert-1',
        type: 'critical',
        category: 'performance',
        title: 'Taux de validation sous objectif',
        description: 'Le taux de validation (85%) est inférieur à l\'objectif (90%)',
        metric: 'Taux de validation',
        currentValue: 85,
        targetValue: 90,
        unit: '%',
        priority: 'high',
        affectedBureaux: ['BJ', 'DSI'],
        recommendation: 'Analyser les causes de rejet et former les équipes',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'active',
      },
      {
        id: 'alert-2',
        type: 'warning',
        category: 'operationnel',
        title: 'Bureau DSI en sous-performance',
        description: 'Le bureau DSI affiche un score de 78/100',
        metric: 'Score bureau',
        currentValue: 78,
        targetValue: 80,
        unit: '/100',
        priority: 'medium',
        affectedBureaux: ['DSI'],
        recommendation: 'Renforcer l\'accompagnement et les ressources',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        status: 'active',
      },
      {
        id: 'alert-3',
        type: 'warning',
        category: 'performance',
        title: 'Demandes en attente élevées',
        description: '8 demandes nécessitent une action immédiate',
        metric: 'Demandes en attente',
        currentValue: 8,
        targetValue: 5,
        unit: '',
        priority: 'medium',
        affectedBureaux: ['DAF', 'DSI'],
        recommendation: 'Prioriser le traitement des demandes en attente',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        status: 'active',
      },
      {
        id: 'alert-4',
        type: 'info',
        category: 'financier',
        title: 'Budget consommé à 75%',
        description: 'Le budget annuel est consommé à 75%',
        metric: 'Budget consommé',
        currentValue: 75,
        targetValue: 80,
        unit: '%',
        priority: 'low',
        affectedBureaux: [],
        recommendation: 'Surveiller la consommation budgétaire',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        status: 'active',
      },
      {
        id: 'alert-5',
        type: 'critical',
        category: 'performance',
        title: 'Retards SLA détectés',
        description: '2 demandes dépassent les délais SLA',
        metric: 'Conformité SLA',
        currentValue: 92,
        targetValue: 95,
        unit: '%',
        priority: 'high',
        affectedBureaux: ['DAF', 'DSI'],
        recommendation: 'Traiter en urgence les demandes en retard',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        status: 'active',
      },
    ];

    const summary = {
      total: alerts.length,
      critical: alerts.filter(a => a.type === 'critical').length,
      warning: alerts.filter(a => a.type === 'warning').length,
      info: alerts.filter(a => a.type === 'info').length,
      byCategory: {
        performance: alerts.filter(a => a.category === 'performance').length,
        financier: alerts.filter(a => a.category === 'financier').length,
        operationnel: alerts.filter(a => a.category === 'operationnel').length,
      },
      byPriority: {
        high: alerts.filter(a => a.priority === 'high').length,
        medium: alerts.filter(a => a.priority === 'medium').length,
        low: alerts.filter(a => a.priority === 'low').length,
      },
    };

    return NextResponse.json({
      alerts,
      summary,
      ts: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics/alerts:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des alertes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/alerts
 * 
 * Marque une alerte comme résolue
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, action } = body;

    if (!alertId || !action) {
      return NextResponse.json(
        { error: 'alertId et action requis' },
        { status: 400 }
      );
    }

    // Simuler la résolution
    return NextResponse.json({
      message: 'Alerte traitée avec succès',
      alertId,
      action,
      resolvedAt: new Date().toISOString(),
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur POST /api/analytics/alerts:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors du traitement de l\'alerte' },
      { status: 500 }
    );
  }
}

