/**
 * Service d'Analytics et Tableaux de Bord
 * ========================================
 * 
 * Agrégation et visualisation de données métier
 */

// ============================================
// TYPES
// ============================================

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface CategoryData {
  category: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface KPIData {
  id: string;
  titre: string;
  valeur: number | string;
  unite?: string;
  evolution?: number; // Pourcentage d'évolution
  evolutionPeriode?: string;
  tendance?: 'up' | 'down' | 'stable';
  target?: number;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
}

export interface DashboardData {
  kpis: KPIData[];
  timeSeries: Record<string, TimeSeriesData[]>;
  categories: Record<string, CategoryData[]>;
  metadata: {
    dateDebut: string;
    dateFin: string;
    lastUpdate: string;
  };
}

// Analytics pour chaque module
export interface ProjetsAnalytics {
  evolutionBudget: TimeSeriesData[];
  repartitionStatuts: CategoryData[];
  evolutionProjets: TimeSeriesData[];
  topProjetsBudget: Array<{ projet: string; budget: number; consomme: number }>;
  kpis: {
    budgetTotal: number;
    budgetConsomme: number;
    nombreProjets: number;
    tauxReussite: number;
  };
}

export interface FinancesAnalytics {
  evolutionTresorerie: TimeSeriesData[];
  repartitionDepenses: CategoryData[];
  evolutionRecettes: TimeSeriesData[];
  previsionTresorerie: TimeSeriesData[];
  kpis: {
    tresorerie: number;
    recettesMensuelle: number;
    depensesMensuelle: number;
    soldeMoyen: number;
  };
}

export interface RHAnalytics {
  evolutionEffectifs: TimeSeriesData[];
  repartitionCompetences: CategoryData[];
  tauxOccupation: TimeSeriesData[];
  turnover: TimeSeriesData[];
  kpis: {
    effectifTotal: number;
    tauxOccupationMoyen: number;
    nbMissionsEnCours: number;
    turnoverAnnuel: number;
  };
}

export interface ClientsAnalytics {
  evolutionClients: TimeSeriesData[];
  repartitionSecteurs: CategoryData[];
  topClientsCA: Array<{ client: string; ca: number; nbProjets: number }>;
  satisfactionClients: TimeSeriesData[];
  kpis: {
    nombreClients: number;
    clientsActifs: number;
    caTotal: number;
    satisfactionMoyenne: number;
  };
}

// ============================================
// SERVICE
// ============================================

class AnalyticsService {
  private baseUrl = '/api/analytics';

  /**
   * Récupère les analytics des projets
   */
  async getProjetsAnalytics(
    dateDebut: string,
    dateFin: string
  ): Promise<ProjetsAnalytics> {
    await this.delay(600);

    return {
      evolutionBudget: this.generateTimeSeries('2026-01', '2026-12', 50000000, 200000000),
      repartitionStatuts: [
        { category: 'En cours', value: 45, percentage: 45, color: '#3b82f6' },
        { category: 'Planifié', value: 25, percentage: 25, color: '#8b5cf6' },
        { category: 'Bloqué', value: 15, percentage: 15, color: '#ef4444' },
        { category: 'Terminé', value: 15, percentage: 15, color: '#10b981' },
      ],
      evolutionProjets: this.generateTimeSeries('2026-01', '2026-12', 10, 50),
      topProjetsBudget: [
        { projet: 'Route RN7', budget: 85000000, consomme: 62000000 },
        { projet: 'Pont Sénégal', budget: 120000000, consomme: 98000000 },
        { projet: 'Autoroute A1', budget: 250000000, consomme: 180000000 },
      ],
      kpis: {
        budgetTotal: 850000000,
        budgetConsomme: 620000000,
        nombreProjets: 48,
        tauxReussite: 92,
      },
    };
  }

  /**
   * Récupère les analytics financières
   */
  async getFinancesAnalytics(
    dateDebut: string,
    dateFin: string
  ): Promise<FinancesAnalytics> {
    await this.delay(600);

    return {
      evolutionTresorerie: this.generateTimeSeries('2026-01', '2026-12', 50000000, 150000000),
      repartitionDepenses: [
        { category: 'Main d\'œuvre', value: 45, percentage: 45, color: '#3b82f6' },
        { category: 'Matériaux', value: 30, percentage: 30, color: '#10b981' },
        { category: 'Équipements', value: 15, percentage: 15, color: '#f59e0b' },
        { category: 'Autres', value: 10, percentage: 10, color: '#6b7280' },
      ],
      evolutionRecettes: this.generateTimeSeries('2026-01', '2026-12', 80000000, 180000000),
      previsionTresorerie: this.generateTimeSeries('2026-01', '2026-12', 100000000, 200000000, true),
      kpis: {
        tresorerie: 125000000,
        recettesMensuelle: 150000000,
        depensesMensuelle: 120000000,
        soldeMoyen: 110000000,
      },
    };
  }

  /**
   * Récupère les analytics RH
   */
  async getRHAnalytics(
    dateDebut: string,
    dateFin: string
  ): Promise<RHAnalytics> {
    await this.delay(600);

    return {
      evolutionEffectifs: this.generateTimeSeries('2026-01', '2026-12', 180, 220),
      repartitionCompetences: [
        { category: 'Ingénieurs', value: 45, percentage: 45, color: '#3b82f6' },
        { category: 'Techniciens', value: 30, percentage: 30, color: '#10b981' },
        { category: 'Admin', value: 15, percentage: 15, color: '#f59e0b' },
        { category: 'Support', value: 10, percentage: 10, color: '#6b7280' },
      ],
      tauxOccupation: this.generateTimeSeries('2026-01', '2026-12', 70, 95),
      turnover: this.generateTimeSeries('2026-01', '2026-12', 5, 15),
      kpis: {
        effectifTotal: 215,
        tauxOccupationMoyen: 85,
        nbMissionsEnCours: 142,
        turnoverAnnuel: 8.5,
      },
    };
  }

  /**
   * Récupère les analytics clients
   */
  async getClientsAnalytics(
    dateDebut: string,
    dateFin: string
  ): Promise<ClientsAnalytics> {
    await this.delay(600);

    return {
      evolutionClients: this.generateTimeSeries('2026-01', '2026-12', 50, 120),
      repartitionSecteurs: [
        { category: 'Public', value: 60, percentage: 60, color: '#3b82f6' },
        { category: 'Privé', value: 30, percentage: 30, color: '#10b981' },
        { category: 'ONG', value: 10, percentage: 10, color: '#f59e0b' },
      ],
      topClientsCA: [
        { client: 'AGEROUTE', ca: 450000000, nbProjets: 15 },
        { client: 'Ministère TP', ca: 380000000, nbProjets: 12 },
        { client: 'APIX', ca: 220000000, nbProjets: 8 },
      ],
      satisfactionClients: this.generateTimeSeries('2026-01', '2026-12', 7.5, 9.5),
      kpis: {
        nombreClients: 98,
        clientsActifs: 72,
        caTotal: 1250000000,
        satisfactionMoyenne: 8.6,
      },
    };
  }

  /**
   * Récupère les KPIs globaux du BMO
   */
  async getGlobalKPIs(): Promise<KPIData[]> {
    await this.delay(400);

    return [
      {
        id: 'projets_actifs',
        titre: 'Projets Actifs',
        valeur: 48,
        evolution: 12,
        evolutionPeriode: 'vs mois dernier',
        tendance: 'up',
        format: 'number',
      },
      {
        id: 'tresorerie',
        titre: 'Trésorerie',
        valeur: 125000000,
        unite: 'FCFA',
        evolution: 5,
        evolutionPeriode: 'vs mois dernier',
        tendance: 'up',
        format: 'currency',
      },
      {
        id: 'taux_occupation',
        titre: 'Taux d\'Occupation',
        valeur: 85,
        unite: '%',
        evolution: -3,
        evolutionPeriode: 'vs mois dernier',
        tendance: 'down',
        target: 90,
        format: 'percentage',
      },
      {
        id: 'satisfaction_clients',
        titre: 'Satisfaction Clients',
        valeur: 8.6,
        unite: '/10',
        evolution: 0,
        evolutionPeriode: 'vs mois dernier',
        tendance: 'stable',
        target: 9.0,
        format: 'number',
      },
      {
        id: 'budget_consomme',
        titre: 'Budget Consommé',
        valeur: 73,
        unite: '%',
        evolution: 8,
        evolutionPeriode: 'vs mois dernier',
        tendance: 'up',
        target: 75,
        format: 'percentage',
      },
      {
        id: 'delai_moyen',
        titre: 'Délai Moyen Projet',
        valeur: 245,
        unite: 'jours',
        evolution: -5,
        evolutionPeriode: 'vs mois dernier',
        tendance: 'down',
        target: 180,
        format: 'duration',
      },
    ];
  }

  /**
   * Génère des données de séries temporelles (mock)
   */
  private generateTimeSeries(
    startMonth: string,
    endMonth: string,
    minValue: number,
    maxValue: number,
    smooth: boolean = false
  ): TimeSeriesData[] {
    const start = new Date(startMonth + '-01');
    const end = new Date(endMonth + '-01');
    const data: TimeSeriesData[] = [];

    let currentValue = minValue + Math.random() * (maxValue - minValue);

    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
      if (smooth) {
        // Progression linéaire avec petite variation
        const progression = (d.getTime() - start.getTime()) / (end.getTime() - start.getTime());
        currentValue = minValue + progression * (maxValue - minValue) + (Math.random() - 0.5) * (maxValue - minValue) * 0.1;
      } else {
        // Variation aléatoire
        const change = (Math.random() - 0.5) * (maxValue - minValue) * 0.2;
        currentValue = Math.max(minValue, Math.min(maxValue, currentValue + change));
      }

      data.push({
        date: d.toISOString().substring(0, 7),
        value: Math.round(currentValue),
        label: d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      });
    }

    return data;
  }

  /**
   * Formate un montant en FCFA
   */
  formatCurrency(value: number): string {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}Md`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return `${value}`;
  }

  /**
   * Formate un pourcentage
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Exporte les analytics en CSV
   */
  async exportToCSV(data: any, filename: string): Promise<void> {
    // En production: générer CSV et télécharger
    console.log(`Exporting analytics to ${filename}.csv`);
    await this.delay(500);
  }

  /**
   * Exporte les analytics en PDF
   */
  async exportToPDF(data: any, filename: string): Promise<void> {
    // En production: générer PDF et télécharger
    console.log(`Exporting analytics to ${filename}.pdf`);
    await this.delay(800);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const analyticsService = new AnalyticsService();

