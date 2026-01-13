import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/validation-bc/insights
 * 
 * Récupère les insights et analyses prédictives pour la validation BC
 */
export async function GET(req: NextRequest) {
  try {
    const insights = {
      // KPIs principaux
      kpis: {
        healthScore: 78,
        validationRate: 85.2,
        avgProcessingTime: 18.5, // heures
        slaCompliance: 92.3,
        anomalyRate: 4.8,
      },

      // Prédictions
      predictions: {
        expectedVolumeToday: 23,
        expectedVolumeWeek: 145,
        predictedBottlenecks: [
          {
            bureau: 'DRE',
            reason: 'Accumulation de BC en attente',
            estimatedDelay: 24, // heures
            confidence: 0.85,
          },
          {
            bureau: 'DSI',
            reason: 'Congé validateur principal',
            estimatedDelay: 48,
            confidence: 0.72,
          },
        ],
        riskOfSlaBreaches: [
          {
            documentId: 'BC-2026-0052',
            probabilityOfBreach: 0.78,
            estimatedBreachTime: '2026-01-11T17:00:00Z',
          },
        ],
      },

      // Tendances
      trends: {
        volumeTrend: 'increasing', // increasing, stable, decreasing
        volumeChange: 12.5, // %
        processingTimeTrend: 'stable',
        processingTimeChange: -2.3,
        anomalyTrend: 'decreasing',
        anomalyChange: -15.2,
      },

      // À décider aujourd'hui
      toDecide: {
        urgent: [
          {
            id: 'BC-2026-0048',
            type: 'bc',
            title: 'Fournitures bureau urgent',
            bureau: 'DRE',
            amount: 2500000,
            createdAt: '2026-01-08T10:00:00Z',
            slaExpiresAt: '2026-01-10T17:00:00Z',
            hoursRemaining: 4,
          },
          {
            id: 'FAC-2026-0095',
            type: 'facture',
            title: 'Facture prestataire informatique',
            bureau: 'DSI',
            amount: 8500000,
            createdAt: '2026-01-07T14:30:00Z',
            slaExpiresAt: '2026-01-10T14:30:00Z',
            hoursRemaining: 1,
          },
        ],
        highValue: [
          {
            id: 'BC-2026-0049',
            type: 'bc',
            title: 'Équipement serveur datacenter',
            bureau: 'DSI',
            amount: 45000000,
            requiresApproval: ['DAF', 'DG'],
            createdAt: '2026-01-09T09:00:00Z',
          },
        ],
        withAnomalies: [
          {
            id: 'BC-2026-0045',
            type: 'bc',
            anomalyType: 'amount',
            anomalyDescription: 'Montant 150% supérieur à la moyenne',
          },
        ],
      },

      // Recommandations IA
      recommendations: [
        {
          priority: 'high',
          type: 'process',
          title: 'Optimiser le workflow DRE',
          description: 'Les BC DRE prennent 35% plus de temps que la moyenne. Analyse des causes recommandée.',
          impact: 'Réduction estimée de 8h sur le temps moyen de traitement',
          action: 'Voir analyse détaillée',
        },
        {
          priority: 'medium',
          type: 'delegation',
          title: 'Configurer des délégations temporaires',
          description: 'Plusieurs validateurs seront absents la semaine prochaine',
          impact: 'Éviter les retards de validation',
          action: 'Configurer délégations',
        },
        {
          priority: 'low',
          type: 'automation',
          title: 'Automatiser les BC récurrents',
          description: '23% des BC sont des renouvellements de contrats récurrents',
          impact: 'Gain de 15h/semaine',
          action: 'Voir les candidats à l\'automatisation',
        },
      ],

      // Performance par bureau
      bureauPerformance: [
        {
          bureau: 'DRE',
          pending: 12,
          avgProcessingTime: 24.5,
          slaCompliance: 88.2,
          trend: 'decreasing',
        },
        {
          bureau: 'DAAF',
          pending: 8,
          avgProcessingTime: 16.2,
          slaCompliance: 95.1,
          trend: 'stable',
        },
        {
          bureau: 'DSI',
          pending: 15,
          avgProcessingTime: 22.1,
          slaCompliance: 91.5,
          trend: 'increasing',
        },
        {
          bureau: 'DRH',
          pending: 5,
          avgProcessingTime: 12.8,
          slaCompliance: 98.3,
          trend: 'stable',
        },
      ],

      ts: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('Erreur récupération insights:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

