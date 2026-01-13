/**
 * Service API pour la gestion des Décisions
 */

export interface DecisionsStats {
  total: number;
  enAttente: number;
  validees: number;
  rejetees: number;
  critiques: number;
  strategiques: number;
  parType: Array<{ type: string; count: number }>;
  ts: string;
}

class DecisionsApiService {
  async getStats(): Promise<DecisionsStats> {
    await this.delay(300);
    return {
      total: 245,
      enAttente: 18,
      validees: 198,
      rejetees: 29,
      critiques: 12,
      strategiques: 35,
      parType: [
        { type: 'Stratégique', count: 35 },
        { type: 'Opérationnelle', count: 120 },
        { type: 'Financière', count: 45 },
        { type: 'RH', count: 28 },
        { type: 'Technique', count: 17 },
      ],
      ts: new Date().toISOString(),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const decisionsApiService = new DecisionsApiService();

