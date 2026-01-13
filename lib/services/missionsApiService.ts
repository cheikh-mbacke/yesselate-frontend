/**
 * Service API pour la gestion des Missions
 */

export interface MissionsStats {
  total: number;
  enCours: number;
  planifiees: number;
  terminees: number;
  budgetTotal: number;
  fraisDeclares: number;
  parType: Array<{ type: string; count: number }>;
  ts: string;
}

class MissionsApiService {
  async getStats(): Promise<MissionsStats> {
    await this.delay(300);
    return {
      total: 78,
      enCours: 5,
      planifiees: 8,
      terminees: 65,
      budgetTotal: 2450000,
      fraisDeclares: 320000,
      parType: [
        { type: 'Terrain', count: 42 },
        { type: 'Formation', count: 18 },
        { type: 'Audit', count: 12 },
        { type: 'Commercial', count: 6 },
      ],
      ts: new Date().toISOString(),
    };
  }

  formatMontant(montant: number): string {
    if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(2)} M`;
    if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
    return montant.toString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const missionsApiService = new MissionsApiService();

