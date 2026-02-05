/**
 * GET /api/analytics/alerts/:id
 * Récupère les détails complets d'une alerte spécifique
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: alertId } = await params;

    // Simuler une latence réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock data détaillée pour une alerte
    const alert = {
      id: alertId,
      title: 'Taux de validation sous objectif',
      message: 'Le taux de validation (85%) est inférieur à l\'objectif fixé (90%). Cette situation persiste depuis 3 jours et affecte principalement le bureau BJ.',
      severity: 'critical' as const,
      type: 'threshold',
      category: 'performance',
      status: 'active' as const,
      priority: 'high' as const,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      resolvedAt: null,
      assignedTo: 'Marie Dubois',
      assignedBy: 'Jean Dupont',
      kpiId: 'kpi-1',
      kpiName: 'Taux de validation',
      bureauId: 'bj',
      bureauName: 'Bureau Juridique',
      affectedBureaux: ['BJ', 'DSI'],
      metric: 'Taux de validation',
      currentValue: 85,
      targetValue: 90,
      unit: '%',
      recommendation: 'Analyser les causes de rejet et former les équipes. Envisager une revue des processus de validation.',
      impact: 'Impact moyen sur les délais de traitement. Risque de non-respect des SLA si la situation perdure.',
      
      // Timeline détaillée
      timeline: [
        {
          id: 't1',
          type: 'created',
          user: 'Système',
          userId: 'system',
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          message: 'Alerte créée automatiquement suite au dépassement du seuil critique',
          data: {
            threshold: 90,
            value: 85,
          },
        },
        {
          id: 't2',
          type: 'assigned',
          user: 'Jean Dupont',
          userId: 'user-1',
          timestamp: new Date(Date.now() - 86400000 * 2.5).toISOString(),
          message: 'Alerte assignée à Marie Dubois',
          data: {
            assignedTo: 'Marie Dubois',
            reason: 'Responsable du service validation',
          },
        },
        {
          id: 't3',
          type: 'commented',
          user: 'Marie Dubois',
          userId: 'user-2',
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          message: 'Analyse en cours. Contact avec le bureau BJ pour investigation.',
        },
        {
          id: 't4',
          type: 'status_changed',
          user: 'Marie Dubois',
          userId: 'user-2',
          timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
          message: 'Statut changé: En cours de traitement',
          data: {
            oldStatus: 'new',
            newStatus: 'in_progress',
          },
        },
        {
          id: 't5',
          type: 'commented',
          user: 'Pierre Durant',
          userId: 'user-3',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          message: 'Même problème observé au DSI. Formation planifiée.',
        },
      ],

      // Commentaires
      comments: [
        {
          id: 'c1',
          user: 'Marie Dubois',
          userId: 'user-2',
          userRole: 'Manager',
          message: 'J\'ai identifié que le problème vient d\'un manque de formation sur les nouveaux critères de validation. Formation prévue la semaine prochaine.',
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          attachments: [],
        },
        {
          id: 'c2',
          user: 'Pierre Durant',
          userId: 'user-3',
          userRole: 'Analyste',
          message: 'J\'ai observé la même chose au bureau DSI. Formation planifiée pour la semaine prochaine. Le taux devrait remonter rapidement.',
          timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
          attachments: [],
        },
        {
          id: 'c3',
          user: 'Jean Dupont',
          userId: 'user-1',
          userRole: 'Directeur',
          message: 'Merci pour le suivi. Tenez-moi informé après la formation.',
          timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
          attachments: [],
        },
      ],

      // Métadonnées
      metadata: {
        source: 'automated_monitoring',
        triggerType: 'threshold_breach',
        notificationsSent: ['email', 'dashboard'],
        escalationLevel: 1,
        slaDeadline: new Date(Date.now() + 86400000 * 2).toISOString(),
        relatedIncidents: [],
        tags: ['validation', 'performance', 'formation'],
      },
    };

    return NextResponse.json({
      success: true,
      data: alert,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching alert detail:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch alert details',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

