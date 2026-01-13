/**
 * ====================================================================
 * SERVICE: API Finances
 * ====================================================================
 */

import type { FinancesFilter } from '@/lib/stores/financesWorkspaceStore';

export interface CompteBancaire {
  id: string;
  nom: string;
  banque: string;
  solde: number;
  type: 'courant' | 'epargne' | 'devise';
  devise: string;
  lastUpdated: string;
}

export interface MouvementFinancier {
  id: string;
  date: string;
  libelle: string;
  montant: number;
  type: 'credit' | 'debit';
  compte: string;
  categorie: string;
  statut: 'valide' | 'en_attente' | 'rejete';
}

export interface FinancesStats {
  tresorerieGlobale: number;
  tresorerieMensuelle: number;
  budgetTotal: number;
  budgetConsomme: number;
  budgetRestant: number;
  nbComptes: number;
  fluxEntrants: number;
  fluxSortants: number;
  variationMensuelle: number;
  ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function formatMontant(montant: number): string {
  if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(1)} Md`;
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(0)} M`;
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
  return montant.toLocaleString('fr-FR');
}

const mockComptes: CompteBancaire[] = [
  { id: 'CPT001', nom: 'Compte Principal', banque: 'BCEAO', solde: 2_500_000_000, type: 'courant', devise: 'FCFA', lastUpdated: '2026-01-10' },
  { id: 'CPT002', nom: 'Compte Exploitation', banque: 'SGBCI', solde: 850_000_000, type: 'courant', devise: 'FCFA', lastUpdated: '2026-01-10' },
  { id: 'CPT003', nom: 'Compte Épargne', banque: 'BICICI', solde: 1_200_000_000, type: 'epargne', devise: 'FCFA', lastUpdated: '2026-01-09' },
  { id: 'CPT004', nom: 'Compte USD', banque: 'NSIA', solde: 500_000, type: 'devise', devise: 'USD', lastUpdated: '2026-01-10' },
];

const mockMouvements: MouvementFinancier[] = [
  { id: 'MVT001', date: '2026-01-10', libelle: 'Paiement fournisseur BTP', montant: 45_000_000, type: 'debit', compte: 'CPT001', categorie: 'Fournisseurs', statut: 'valide' },
  { id: 'MVT002', date: '2026-01-09', libelle: 'Encaissement client Alpha', montant: 120_000_000, type: 'credit', compte: 'CPT001', categorie: 'Clients', statut: 'valide' },
  { id: 'MVT003', date: '2026-01-08', libelle: 'Salaires Janvier', montant: 85_000_000, type: 'debit', compte: 'CPT002', categorie: 'Salaires', statut: 'valide' },
  { id: 'MVT004', date: '2026-01-08', libelle: 'Virement interne', montant: 200_000_000, type: 'credit', compte: 'CPT002', categorie: 'Interne', statut: 'en_attente' },
];

export const financesApiService = {
  async getComptes(): Promise<CompteBancaire[]> {
    await delay(300);
    return mockComptes;
  },

  async getCompteById(id: string): Promise<CompteBancaire | undefined> {
    await delay(200);
    return mockComptes.find(c => c.id === id);
  },

  async getMouvements(filter?: FinancesFilter, page = 1, limit = 20): Promise<{
    data: MouvementFinancier[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await delay(300);
    let data = [...mockMouvements];
    if (filter?.compte) data = data.filter(m => m.compte === filter.compte);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      data = data.filter(m => m.libelle.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));
    }
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },

  async getStats(): Promise<FinancesStats> {
    await delay(250);
    const tresorerieGlobale = mockComptes.reduce((acc, c) => acc + (c.devise === 'FCFA' ? c.solde : c.solde * 600), 0);
    const fluxEntrants = mockMouvements.filter(m => m.type === 'credit').reduce((acc, m) => acc + m.montant, 0);
    const fluxSortants = mockMouvements.filter(m => m.type === 'debit').reduce((acc, m) => acc + m.montant, 0);

    return {
      tresorerieGlobale,
      tresorerieMensuelle: tresorerieGlobale * 0.15,
      budgetTotal: 15_000_000_000,
      budgetConsomme: 8_500_000_000,
      budgetRestant: 6_500_000_000,
      nbComptes: mockComptes.length,
      fluxEntrants,
      fluxSortants,
      variationMensuelle: ((fluxEntrants - fluxSortants) / tresorerieGlobale) * 100,
      ts: new Date().toISOString(),
    };
  },

  formatMontant,
};

