/**
 * Service API pour la gestion des Litiges
 */

export interface LitigesStats {
  total: number;
  actifs: number;
  audiencesPrevues: number;
  clos: number;
  expositionTotale: number;
  parType: Array<{ type: string; count: number }>;
  ts: string;
}

class LitigesApiService {
  async getStats(): Promise<LitigesStats> {
    await this.delay(300);
    return {
      total: 24,
      actifs: 12,
      audiencesPrevues: 4,
      clos: 8,
      expositionTotale: 1250000000,
      parType: [
        { type: 'Commercial', count: 8 },
        { type: 'Contractuel', count: 7 },
        { type: 'Social', count: 5 },
        { type: 'Pénal', count: 4 },
      ],
      ts: new Date().toISOString(),
    };
  }

  formatMontant(montant: number): string {
    if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(2)} Md`;
    if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(2)} M`;
    return montant.toString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const litigesApiService = new LitigesApiService();

