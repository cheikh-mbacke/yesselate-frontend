/**
 * Mock Data pour le Développement Analytics BTP
 * Données réalistes pour tester l'interface sans backend
 */

import type { KPIData, AlertData, TrendData } from '@/lib/services/analyticsDataService';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function generateTrendData(months: number = 12, baseValue: number = 100): TrendData[] {
  const data: TrendData[] = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    const variation = randomBetween(-10, 15);
    const value = Math.max(0, baseValue + variation * (months - i) / months);
    const prevValue = i > 0 ? data[data.length - 1]?.value : value * 0.95;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      value_prev: Math.round(prevValue),
    });
  }
  
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA PAR DOMAINE
// ═══════════════════════════════════════════════════════════════════════════

export const analyticsMockData = {
  // Domaine : Chantiers
  'chantiers': {
    summary: {
      kpis: {
        'chantiers-actifs': {
          value: 45,
          target: 50,
          unit: '',
          trend: { value: 5, isPositive: true },
          status: 'good' as const,
        },
        'ca-total': {
          value: 125000000,
          target: 150000000,
          unit: 'FCFA',
          trend: { value: 8, isPositive: true },
          status: 'warning' as const,
        },
        'marge-globale': {
          value: 12.5,
          target: 15,
          unit: '%',
          trend: { value: -2, isPositive: false },
          status: 'warning' as const,
        },
        'taux-avancement': {
          value: 68,
          target: 100,
          unit: '%',
          trend: { value: 3, isPositive: true },
          status: 'good' as const,
        },
      },
      alerts: [
        {
          id: 'chantiers-retard',
          type: 'critical' as const,
          category: 'delay',
          title: '3 chantiers en retard',
          description: '3 chantiers présentent des retards significatifs',
          detectedAt: new Date().toISOString(),
          impact: {
            estimated: 'Élevé',
            elements: ['Chantier A', 'Chantier B', 'Chantier C'],
            costs: 5000000,
            delays: 15,
          },
        },
      ],
    },
    trends: generateTrendData(12, 40),
    status: [
      { status: 'En cours', count: 30 },
      { status: 'Terminé', count: 15 },
      { status: 'En retard', count: 3 },
    ],
    list: Array.from({ length: 20 }, (_, i) => ({
      id: `chantier-${i + 1}`,
      nom: `Chantier ${i + 1}`,
      statut: ['En cours', 'Terminé', 'En retard'][i % 3],
      avancement: randomBetween(30, 100),
      budget: randomBetween(1000000, 10000000),
      realise: randomBetween(800000, 9000000),
      marge: randomBetween(5, 20),
      responsable: `Responsable ${i + 1}`,
    })),
  },

  // Domaine : Financier
  'financier': {
    summary: {
      kpis: {
        'ca-total': {
          value: 250000000,
          unit: 'FCFA',
          trend: { value: 12, isPositive: true },
          status: 'good' as const,
        },
        'tresorerie': {
          value: 45000000,
          unit: 'FCFA',
          trend: { value: -5, isPositive: false },
          status: 'warning' as const,
        },
        'bfr': {
          value: 35000000,
          unit: 'FCFA',
          trend: { value: 3, isPositive: true },
          status: 'good' as const,
        },
        'marge-globale': {
          value: 14.5,
          target: 15,
          unit: '%',
          trend: { value: 1, isPositive: true },
          status: 'good' as const,
        },
      },
      alerts: [
        {
          id: 'tresorerie-critique',
          type: 'critical' as const,
          category: 'budget',
          title: 'Trésorerie critique',
          description: 'Le niveau de trésorerie est en dessous du seuil critique',
          detectedAt: new Date().toISOString(),
          impact: {
            estimated: 'Critique',
            elements: ['Trésorerie générale'],
            costs: 0,
          },
        },
      ],
    },
    trends: generateTrendData(12, 200000000),
    couts: [
      { categorie: 'Main d\'œuvre', montant: 100000000 },
      { categorie: 'Matériel', montant: 80000000 },
      { categorie: 'Sous-traitance', montant: 50000000 },
      { categorie: 'Autres', montant: 20000000 },
    ],
  },

  // Domaine : Ressources Humaines
  'ressources-humaines': {
    summary: {
      kpis: {
        'effectif-total': {
          value: 250,
          unit: '',
          trend: { value: 5, isPositive: true },
          status: 'good' as const,
        },
        'heures-travaillees': {
          value: 45000,
          unit: 'h',
          trend: { value: 3, isPositive: true },
          status: 'good' as const,
        },
        'couts-main-oeuvre': {
          value: 85000000,
          unit: 'FCFA',
          trend: { value: 4, isPositive: true },
          status: 'good' as const,
        },
        'taux-absenteisme': {
          value: 4.2,
          target: 5,
          unit: '%',
          trend: { value: -0.5, isPositive: true },
          status: 'good' as const,
        },
      },
      alerts: [
        {
          id: 'absenteisme-eleve',
          type: 'warning' as const,
          category: 'risk',
          title: 'Absentéisme élevé dans l\'équipe A',
          description: 'Le taux d\'absentéisme dépasse 6%',
          detectedAt: new Date().toISOString(),
        },
      ],
    },
    trends: generateTrendData(12, 240),
    absences: [
      { type: 'Maladie', count: 45 },
      { type: 'Congés', count: 120 },
      { type: 'Formation', count: 15 },
      { type: 'Autres', count: 10 },
    ],
  },

  // Domaine : Sous-traitants
  'sous-traitants': {
    summary: {
      kpis: {
        'nombre-sous-traitants': {
          value: 35,
          unit: '',
          trend: { value: 2, isPositive: true },
          status: 'good' as const,
        },
        'ca-sous-traitance': {
          value: 75000000,
          unit: 'FCFA',
          trend: { value: 8, isPositive: true },
          status: 'good' as const,
        },
        'performance-moyenne': {
          value: 82,
          target: 80,
          unit: '%',
          trend: { value: 2, isPositive: true },
          status: 'good' as const,
        },
        'taux-satisfaction': {
          value: 88,
          target: 90,
          unit: '%',
          trend: { value: 1, isPositive: true },
          status: 'good' as const,
        },
      },
      alerts: [
        {
          id: 'sous-traitants-retard',
          type: 'critical' as const,
          category: 'delay',
          title: '2 sous-traitants en retard',
          description: 'Des retards significatifs ont été détectés',
          detectedAt: new Date().toISOString(),
        },
      ],
    },
    performance: generateTrendData(12, 80),
    repartition: [
      { 'sous-traitant': 'ST A', score: 92 },
      { 'sous-traitant': 'ST B', score: 88 },
      { 'sous-traitant': 'ST C', score: 85 },
      { 'sous-traitant': 'ST D', score: 75 },
      { 'sous-traitant': 'ST E', score: 70 },
    ],
  },

  // Domaine : Matériel
  'materiel': {
    summary: {
      kpis: {
        'taux-utilisation': {
          value: 72,
          target: 75,
          unit: '%',
          trend: { value: 2, isPositive: true },
          status: 'good' as const,
        },
        'couts-maintenance': {
          value: 12000000,
          unit: 'FCFA',
          trend: { value: 5, isPositive: true },
          status: 'warning' as const,
        },
        'disponibilite': {
          value: 88,
          target: 90,
          unit: '%',
          trend: { value: -2, isPositive: false },
          status: 'warning' as const,
        },
        'roi-equipements': {
          value: 15.5,
          unit: '%',
          trend: { value: 1, isPositive: true },
          status: 'good' as const,
        },
      },
      alerts: [
        {
          id: 'pannes',
          type: 'critical' as const,
          category: 'risk',
          title: '3 équipements en panne',
          description: 'Des pannes critiques ont été détectées',
          detectedAt: new Date().toISOString(),
        },
      ],
    },
    utilisation: generateTrendData(12, 70),
    repartition: [
      { type: 'Engins', count: 25 },
      { type: 'Véhicules', count: 40 },
      { type: 'Outillage', count: 150 },
      { type: 'Autres', count: 30 },
    ],
  },

  // Domaine : Commercial
  'commercial': {
    summary: {
      kpis: {
        'pipeline-commercial': {
          value: 180000000,
          unit: 'FCFA',
          trend: { value: 15, isPositive: true },
          status: 'good' as const,
        },
        'taux-conversion': {
          value: 28,
          target: 30,
          unit: '%',
          trend: { value: 2, isPositive: true },
          status: 'good' as const,
        },
        'ca-previsionnel': {
          value: 280000000,
          unit: 'FCFA',
          trend: { value: 10, isPositive: true },
          status: 'good' as const,
        },
        'nombre-appels-offres': {
          value: 45,
          unit: '',
          trend: { value: 5, isPositive: true },
          status: 'good' as const,
        },
      },
      alerts: [
        {
          id: 'opportunites-risque',
          type: 'warning' as const,
          category: 'risk',
          title: '5 opportunités à risque',
          description: 'Des opportunités présentent des risques',
          detectedAt: new Date().toISOString(),
        },
      ],
    },
    pipeline: generateTrendData(12, 150000000),
    repartition: [
      { etape: 'Prospection', montant: 50000000 },
      { etape: 'Devis', montant: 60000000 },
      { etape: 'Négociation', montant: 40000000 },
      { etape: 'Signature', montant: 30000000 },
    ],
  },

  // Domaine : QSE
  'qse': {
    summary: {
      kpis: {
        'indicateurs-qualite': {
          value: 94,
          target: 95,
          unit: '%',
          trend: { value: 1, isPositive: true },
          status: 'good' as const,
        },
        'indicateurs-securite': {
          value: 98,
          target: 100,
          unit: '%',
          trend: { value: 0, isPositive: true },
          status: 'good' as const,
        },
        'indicateurs-environnement': {
          value: 87,
          target: 90,
          unit: '%',
          trend: { value: 2, isPositive: true },
          status: 'warning' as const,
        },
        'taux-incidents': {
          value: 2,
          unit: '',
          trend: { value: -1, isPositive: true },
          status: 'good' as const,
        },
      },
      alerts: [
        {
          id: 'incidents',
          type: 'critical' as const,
          category: 'qse',
          title: '2 incidents détectés',
          description: 'Des incidents QSE ont été signalés',
          detectedAt: new Date().toISOString(),
        },
      ],
    },
    trends: generateTrendData(12, 92),
    incidents: [
      { type: 'Sécurité', count: 1 },
      { type: 'Qualité', count: 1 },
      { type: 'Environnement', count: 0 },
    ],
  },

  // Domaine : Planification
  'planification': {
    summary: {
      kpis: {
        'respect-delais': {
          value: 85,
          target: 90,
          unit: '%',
          trend: { value: 2, isPositive: true },
          status: 'good' as const,
        },
        'charge-travail': {
          value: 78,
          target: 80,
          unit: '%',
          trend: { value: 3, isPositive: true },
          status: 'good' as const,
        },
        'optimisation-planning': {
          value: 72,
          unit: '%',
          trend: { value: 1, isPositive: true },
          status: 'good' as const,
        },
        'chemin-critique': {
          value: 8,
          unit: '',
          trend: { value: -1, isPositive: true },
          status: 'good' as const,
        },
      },
      alerts: [
        {
          id: 'retards',
          type: 'critical' as const,
          category: 'delay',
          title: '5 projets en retard',
          description: 'Des retards ont été détectés dans la planification',
          detectedAt: new Date().toISOString(),
        },
      ],
    },
    delais: generateTrendData(12, 85),
    charge: [
      { ressource: 'Équipe A', charge: 85 },
      { ressource: 'Équipe B', charge: 75 },
      { ressource: 'Équipe C', charge: 70 },
      { ressource: 'Équipe D', charge: 82 },
    ],
  },

  // Domaine : Multi-Agences
  'multi-agences': {
    summary: {
      kpis: {
        'performance-agence': {
          value: 82,
          unit: '%',
          trend: { value: 3, isPositive: true },
          status: 'good' as const,
        },
        'consolidation': {
          value: 350000000,
          unit: 'FCFA',
          trend: { value: 12, isPositive: true },
          status: 'good' as const,
        },
        'synergies': {
          value: 15,
          unit: '%',
          trend: { value: 2, isPositive: true },
          status: 'good' as const,
        },
        'gouvernance': {
          value: 88,
          unit: '%',
          trend: { value: 1, isPositive: true },
          status: 'good' as const,
        },
      },
      alerts: [
        {
          id: 'agences-sous-performantes',
          type: 'warning' as const,
          category: 'risk',
          title: '2 agences sous-performantes',
          description: 'Certaines agences présentent des performances faibles',
          detectedAt: new Date().toISOString(),
        },
      ],
    },
    comparison: [
      { agence: 'Paris', performance: 92 },
      { agence: 'Lyon', performance: 88 },
      { agence: 'Marseille', performance: 85 },
      { agence: 'Toulouse', performance: 75 },
      { agence: 'Lille', performance: 70 },
    ],
    consolidation: generateTrendData(12, 300000000),
  },

  // Domaine : Performance
  'performance': {
    summary: {
      kpis: {
        'performance-globale': {
          value: 84,
          target: 85,
          unit: '%',
          trend: { value: 2, isPositive: true },
          status: 'good' as const,
        },
        'rentabilite': {
          value: 14.5,
          target: 15,
          unit: '%',
          trend: { value: 1, isPositive: true },
          status: 'good' as const,
        },
        'efficacite': {
          value: 78,
          unit: '%',
          trend: { value: 2, isPositive: true },
          status: 'good' as const,
        },
        'satisfaction': {
          value: 87,
          target: 90,
          unit: '%',
          trend: { value: 1, isPositive: true },
          status: 'good' as const,
        },
      },
      alerts: [
        {
          id: 'performances-faibles',
          type: 'warning' as const,
          category: 'risk',
          title: 'Performances à améliorer',
          description: 'Certains indicateurs sont en dessous des objectifs',
          detectedAt: new Date().toISOString(),
        },
      ],
    },
    trends: generateTrendData(12, 80),
    radar: [
      { critere: 'Performance', score: 84 },
      { critere: 'Rentabilité', score: 88 },
      { critere: 'Efficacité', score: 78 },
      { critere: 'Satisfaction', score: 87 },
      { critere: 'Qualité', score: 92 },
    ],
  },
};

/**
 * Obtient les données mockées pour un domaine
 */
export function getMockDataForDomain(domainId: string): any {
  return analyticsMockData[domainId as keyof typeof analyticsMockData] || {};
}

/**
 * Simule une réponse API avec données mockées
 */
export function mockApiResponse(endpoint: string): any {
  // Extraire le domaine de l'endpoint
  const domainMatch = endpoint.match(/\/domains\/([^\/]+)/);
  if (!domainMatch) {
    return null;
  }

  const domainId = domainMatch[1];
  const mockData = getMockDataForDomain(domainId);

  // Déterminer le type de données selon l'endpoint
  if (endpoint.includes('/summary')) {
    return mockData.summary || {};
  }
  if (endpoint.includes('/trends')) {
    return mockData.trends || [];
  }
  if (endpoint.includes('/list')) {
    return mockData.list || [];
  }
  if (endpoint.includes('/alerts')) {
    return mockData.summary?.alerts || [];
  }
  if (endpoint.includes('/kpis/')) {
    const kpiId = endpoint.split('/kpis/')[1];
    return mockData.summary?.kpis?.[kpiId] || null;
  }

  return mockData;
}

