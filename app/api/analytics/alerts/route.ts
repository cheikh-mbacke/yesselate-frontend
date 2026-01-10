import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/alerts
 * 
 * Récupère les alertes actives du système
 * Query params: status, severity, bureauId, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status')?.split(',');
    const severityFilter = searchParams.get('severity')?.split(',');
    const bureauId = searchParams.get('bureauId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const allAlerts = [
      {
        id: 'alert-1',
        type: 'critical',
        category: 'performance',
        title: 'Taux de validation sous objectif',
        message: 'Le taux de validation (85%) est inférieur à l\'objectif (90%)',
        severity: 'critical',
        metric: 'Taux de validation',
        currentValue: 85,
        targetValue: 90,
        unit: '%',
        priority: 'high',
        affectedBureaux: ['BJ', 'DSI'],
        recommendation: 'Analyser les causes de rejet et former les équipes',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'active',
        assignedTo: null,
        kpiId: 'kpi-1',
        bureauId: 'bj',
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

    // Appliquer les filtres
    let alerts = allAlerts;
    if (statusFilter && statusFilter.length > 0) {
      alerts = alerts.filter(a => statusFilter.includes(a.status));
    }
    if (severityFilter && severityFilter.length > 0) {
      alerts = alerts.filter(a => severityFilter.includes(a.severity));
    }
    if (bureauId) {
      alerts = alerts.filter(a => a.bureauId === bureauId || a.affectedBureaux.includes(bureauId));
    }

    // Pagination
    const paginatedAlerts = alerts.slice(offset, offset + limit);

    const summary = {
      total: alerts.length,
      unreadCount: alerts.filter(a => a.status === 'active').length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
      byCategory: {
        performance: alerts.filter(a => a.category === 'performance').length,
        financial: alerts.filter(a => a.category === 'financial').length,
        operational: alerts.filter(a => a.category === 'operational').length,
      },
      byStatus: {
        active: alerts.filter(a => a.status === 'active').length,
        resolved: alerts.filter(a => a.status === 'resolved').length,
        snoozed: alerts.filter(a => a.status === 'snoozed').length,
      },
    };

    return NextResponse.json({
      alerts: paginatedAlerts,
      summary,
      filters: { status: statusFilter, severity: severityFilter, bureauId },
      pagination: {
        total: alerts.length,
        limit,
        offset,
        hasMore: offset + limit < alerts.length,
      },
      ts: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
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

