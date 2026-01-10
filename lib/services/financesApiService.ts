/**
 * Service API pour la gestion Financière
 */

export interface FinancesStats {
  tresorerie: number;
  budgetTotal: number;
  budgetConsomme: number;
  tauxConsommation: number;
  fluxEntrants: number;
  fluxSortants: number;
  soldeNet: number;
  ts: string;
}

class FinancesApiService {
  async getStats(): Promise<FinancesStats> {
    await this.delay(300);
    return {
      tresorerie: 4550000000,
      budgetTotal: 15000000000,
      budgetConsomme: 8550000000,
      tauxConsommation: 57,
      fluxEntrants: 2300000000,
      fluxSortants: 1850000000,
      soldeNet: 450000000,
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

export const financesApiService = new FinancesApiService();

