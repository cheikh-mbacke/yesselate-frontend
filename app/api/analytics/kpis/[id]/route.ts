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

    // Mapper les IDs de trends vers des IDs de KPIs équivalents
    const trendToKpiMapping: Record<string, string> = {
      'trend-sla-compliance': 'kpi-sla-compliance',
      'trend-validation-rate': 'kpi-validation-rate',
      'trend-avg-delay': 'kpi-avg-delay',
      'trend-pending': 'kpi-pending',
      'trend-pending-count': 'kpi-pending',
      'trend-productivity': 'kpi-productivity',
      'trend-quality-score': 'kpi-quality-score',
      'trend-demand-count': 'kpi-1', // Nombre de demandes -> Taux de validation
    };

    // Normaliser l'ID (convertir trend-* en kpi-* si nécessaire)
    const normalizedKpiId = trendToKpiMapping[kpiId] || kpiId.replace(/^trend-/, 'kpi-');

    // Générer des données dynamiques basées sur l'ID du KPI
    const kpiConfigs: Record<string, any> = {
      'kpi-1': {
        name: 'Taux de validation',
        category: 'performance',
        value: 85,
        target: 90,
        unit: '%',
        description: 'Pourcentage de demandes validées par rapport au total traité',
      },
      'kpi-2': {
        name: 'Délai moyen',
        category: 'operations',
        value: 2.8,
        target: 3,
        unit: 'jours',
        description: 'Temps moyen de traitement des demandes',
      },
      'kpi-3': {
        name: 'Conformité SLA',
        category: 'quality',
        value: 92,
        target: 90,
        unit: '%',
        description: 'Respect des délais contractuels (SLA)',
      },
      'kpi-4': {
        name: 'Demandes en attente',
        category: 'operations',
        value: 8,
        target: 10,
        unit: '',
        description: 'Nombre de demandes nécessitant une action',
      },
      'kpi-5': {
        name: 'Productivité',
        category: 'performance',
        value: 78,
        target: 75,
        unit: '%',
        description: 'Ratio validation vs total des demandes',
      },
      'kpi-6': {
        name: 'Score qualité',
        category: 'quality',
        value: 82,
        target: 80,
        unit: '/100',
        description: 'Score global de qualité composite',
      },
      'kpi-7': {
        name: 'Budget consommé',
        category: 'financier',
        value: 75,
        target: 80,
        unit: '%',
        description: 'Pourcentage du budget utilisé',
      },
      'kpi-8': {
        name: 'Coût moyen/demande',
        category: 'financier',
        value: 45,
        target: 50,
        unit: 'M FCFA',
        description: 'Coût unitaire moyen par demande',
      },
      'kpi-9': {
        name: 'Taux de satisfaction',
        category: 'quality',
        value: 88,
        target: 85,
        unit: '%',
        description: 'Satisfaction globale des utilisateurs',
      },
      // Support pour les IDs avec tirets (format alternatif)
      'kpi-validation-rate': {
        name: 'Taux de validation',
        category: 'performance',
        value: 85,
        target: 90,
        unit: '%',
        description: 'Pourcentage de demandes validées par rapport au total traité',
      },
      'kpi-avg-delay': {
        name: 'Délai moyen',
        category: 'operations',
        value: 2.8,
        target: 3,
        unit: 'jours',
        description: 'Temps moyen de traitement des demandes',
      },
      'kpi-sla-compliance': {
        name: 'Conformité SLA',
        category: 'quality',
        value: 92,
        target: 90,
        unit: '%',
        description: 'Respect des délais contractuels (SLA)',
      },
      'kpi-pending': {
        name: 'Demandes en attente',
        category: 'operations',
        value: 8,
        target: 10,
        unit: '',
        description: 'Nombre de demandes nécessitant une action',
      },
      'kpi-productivity': {
        name: 'Productivité',
        category: 'performance',
        value: 78,
        target: 75,
        unit: '%',
        description: 'Ratio validation vs total des demandes',
      },
      'kpi-quality-score': {
        name: 'Score qualité',
        category: 'quality',
        value: 82,
        target: 80,
        unit: '/100',
        description: 'Score global de qualité composite',
      },
    };

    // Trouver la config ou utiliser des valeurs par défaut
    const config = kpiConfigs[normalizedKpiId] || kpiConfigs[kpiId] || {
      name: 'KPI',
      category: 'performance',
      value: 75,
      target: 80,
      unit: '%',
      description: 'Indicateur de performance',
    };

    const kpi = {
      id: kpiId, // Garder l'ID original pour la cohérence
      name: config.name,
      category: config.category,
      value: config.value,
      unit: config.unit || (normalizedKpiId.includes('rate') || normalizedKpiId.includes('compliance') || normalizedKpiId.includes('productivity') || normalizedKpiId.includes('score') ? '%' : normalizedKpiId.includes('delay') ? 'jours' : ''),
      target: config.target,
      current: config.value,
      previous: config.value - (Math.random() * 10 - 5),
      status: config.value >= config.target ? 'success' : config.value >= config.target * 0.8 ? 'warning' : 'critical',
      trend: config.value >= config.target ? 'up' : 'stable',
      changePercent: Math.round(((config.value - (config.value - 5)) / (config.value - 5)) * 100),
      history: generateHistory(),
      metadata: {
        description: config.description,
        formula: normalizedKpiId.includes('validation') ? '(Validées / Total) * 100' : normalizedKpiId.includes('delay') ? 'Moyenne des délais' : 'Calcul composite',
        threshold: {
          success: config.target,
          warning: config.target * 0.8,
          critical: config.target * 0.7,
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
      kpi: {
        ...kpi,
      },
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

