/**
 * Service API pour la gestion des Recouvrements
 */

export interface RecouvrementsStats {
  total: number;
  montantTotal: number;
  recouvre: number;
  enCours: number;
  enRetard: number;
  tauxRecouvrement: number;
  ts: string;
}

class RecouvrementsApiService {
  async getStats(): Promise<RecouvrementsStats> {
    await this.delay(300);
    return {
      total: 156,
      montantTotal: 2500000000,
      recouvre: 1950000000,
      enCours: 320000000,
      enRetard: 230000000,
      tauxRecouvrement: 78,
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

export const recouvrementsApiService = new RecouvrementsApiService();

