import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/predictive
 * 
 * Retourne les insights prédictifs et recommandations IA
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const horizon = searchParams.get('horizon') || 'week'; // day, week, month
    const focus = searchParams.get('focus'); // sla, validation, delay, budget

    // Prédictions
    const predictions = [
      {
        id: 'pred-001',
        type: 'risk',
        title: 'Risque de dépassement SLA',
        description: '12 demandes risquent de dépasser le SLA dans les prochaines 48 heures si le rythme actuel de traitement est maintenu.',
        affectedItems: 12,
        probability: 87,
        impact: 'high',
        timeframe: '48h',
        suggestedAction: 'Prioriser le traitement des demandes BTP et DG en attente depuis plus de 5 jours.',
        metrics: {
          currentRate: 15,
          requiredRate: 22,
          gap: 7,
        },
      },
      {
        id: 'pred-002',
        type: 'opportunity',
        title: 'Amélioration du taux de validation',
        description: 'Si la tendance actuelle se maintient, le taux de validation devrait atteindre 85% d\'ici fin du mois.',
        probability: 72,
        impact: 'medium',
        timeframe: '3 semaines',
        suggestedAction: 'Maintenir le rythme actuel et renforcer les équipes les plus performantes.',
        metrics: {
          currentRate: 78,
          projectedRate: 85,
          improvement: 7,
        },
      },
      {
        id: 'pred-003',
        type: 'warning',
        title: 'Surcharge prévisionnelle',
        description: 'Le bureau BJ devrait recevoir 30% de demandes en plus la semaine prochaine (période de clôture juridique).',
        probability: 91,
        impact: 'medium',
        timeframe: '1 semaine',
        suggestedAction: 'Planifier des ressources supplémentaires ou redistribuer une partie de la charge.',
        metrics: {
          currentLoad: 67,
          projectedLoad: 87,
          capacityThreshold: 80,
        },
      },
      {
        id: 'pred-004',
        type: 'insight',
        title: 'Pattern de productivité',
        description: 'Les mardis et mercredis montrent une productivité 25% supérieure à la moyenne. Les vendredis après-midi sont les moins productifs.',
        probability: 94,
        impact: 'low',
        timeframe: 'Récurrent',
        suggestedAction: 'Planifier les demandes urgentes en début de semaine.',
        metrics: {
          peakDays: ['Mardi', 'Mercredi'],
          lowDays: ['Vendredi PM'],
          avgDiff: 25,
        },
      },
    ];

    // Recommandations optimisées
    const recommendations = [
      {
        id: 'rec-001',
        priority: 1,
        title: 'Optimisation de la charge',
        description: 'Redistribuer 5 demandes du bureau BTP vers le bureau DAF pour équilibrer la charge de travail.',
        expectedImpact: {
          validationRate: '+3%',
          avgDelay: '-0.5j',
          slaCompliance: '+2%',
        },
        effort: 'low',
        confidence: 82,
      },
      {
        id: 'rec-002',
        priority: 2,
        title: 'Priorisation intelligente',
        description: 'Traiter en priorité les 8 demandes critiques identifiées pour éviter les dépassements SLA.',
        expectedImpact: {
          slaCompliance: '+5%',
          overdueReduction: '-6',
        },
        effort: 'medium',
        confidence: 89,
      },
      {
        id: 'rec-003',
        priority: 3,
        title: 'Formation ciblée',
        description: 'Former les équipes du bureau DSI sur les procédures de validation rapide (potentiel d\'amélioration identifié).',
        expectedImpact: {
          validationRate: '+8%',
          avgDelay: '-1.2j',
        },
        effort: 'high',
        confidence: 65,
      },
    ];

    // Anomalies détectées
    const anomalies = [
      {
        id: 'anom-001',
        type: 'spike',
        severity: 'warning',
        metric: 'Délai moyen',
        description: 'Augmentation inhabituelle du délai moyen de traitement (+40%) détectée hier.',
        detectedAt: new Date(Date.now() - 86400000).toISOString(),
        possibleCauses: ['Absence personnel clé', 'Afflux de demandes complexes'],
        affectedBureaux: ['BJ', 'DSI'],
      },
      {
        id: 'anom-002',
        type: 'pattern_break',
        severity: 'info',
        metric: 'Volume demandes',
        description: 'Volume de demandes 20% inférieur à la moyenne saisonnière.',
        detectedAt: new Date(Date.now() - 172800000).toISOString(),
        possibleCauses: ['Période de transition', 'Changement de processus'],
        affectedBureaux: ['Tous'],
      },
    ];

    // Scores de santé prédictifs
    const healthScores = {
      overall: 76,
      sla: 82,
      validation: 78,
      efficiency: 71,
      workload: 68,
      trend: 'improving',
      projectedNextWeek: 79,
    };

    // Filtrer selon le focus si spécifié
    let filteredPredictions = predictions;
    if (focus) {
      filteredPredictions = predictions.filter(p => 
        p.title.toLowerCase().includes(focus) || 
        p.description.toLowerCase().includes(focus)
      );
    }

    return NextResponse.json({
      horizon,
      focus: focus || 'all',
      predictions: filteredPredictions,
      recommendations,
      anomalies,
      healthScores,
      modelInfo: {
        lastTrained: new Date(Date.now() - 86400000 * 7).toISOString(),
        accuracy: 84,
        dataPoints: 15420,
      },
      ts: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics/predictive:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des insights prédictifs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/predictive/feedback
 * 
 * Enregistre le feedback sur une prédiction (pour améliorer le modèle)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { predictionId, feedback, outcome, notes } = body;

    if (!predictionId || !feedback) {
      return NextResponse.json(
        { error: 'predictionId et feedback sont requis' },
        { status: 400 }
      );
    }

    // En production, stocker le feedback pour améliorer le modèle
    
    return NextResponse.json({
      success: true,
      message: 'Feedback enregistré avec succès',
      predictionId,
      feedback,
      outcome,
      recordedAt: new Date().toISOString(),
    }, {
      status: 200,
    });
  } catch (error) {
    console.error('Erreur POST /api/analytics/predictive/feedback:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'enregistrement du feedback' },
      { status: 500 }
    );
  }
}

