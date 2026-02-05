/**
 * ====================================================================
 * SERVICE: API Recouvrements
 * ====================================================================
 */

import type { RecouvrementFilter } from '@/lib/stores/recouvrementsWorkspaceStore';
import { recouvrements } from '@/lib/data';

export interface Creance {
  id: string;
  client: string;
  projet?: string;
  projetName?: string;
  montant: number;
  montantRecouvre: number;
  status: 'pending' | 'in_progress' | 'paid' | 'litige' | 'irrecoverable';
  dateEcheance: string;
  dateFacture: string;
  joursRetard: number;
  derniereRelance?: string;
  nbRelances: number;
  contactClient?: string;
}

export interface RecouvrementsStats {
  total: number;
  pending: number;
  in_progress: number;
  paid: number;
  litige: number;
  irrecoverable: number;
  montantTotal: number;
  montantRecouvre: number;
  montantEnAttente: number;
  tauxRecouvrement: number;
  montantEnRetard: number;
  ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function formatMontant(montant: number): string {
  if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(1)} Md`;
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(0)} M`;
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
  return montant.toLocaleString('fr-FR');
}

export const recouvrementsApiService = {
  async getAll(filter?: RecouvrementFilter, sortBy?: string, page = 1, limit = 20): Promise<{
    data: Creance[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await delay(300);
    let data = [...recouvrements] as unknown as Creance[];

    if (filter?.status) data = data.filter(c => c.status === filter.status);
    if (filter?.overdueOnly) data = data.filter(c => c.joursRetard > 0);
    if (filter?.minAmount) data = data.filter(c => c.montant >= filter.minAmount!);
    if (filter?.maxAmount) data = data.filter(c => c.montant <= filter.maxAmount!);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      data = data.filter(c => c.id.toLowerCase().includes(q) || c.client.toLowerCase().includes(q));
    }

    if (sortBy === 'amount') data.sort((a, b) => b.montant - a.montant);
    else if (sortBy === 'overdue') data.sort((a, b) => b.joursRetard - a.joursRetard);
    else if (sortBy === 'date') data.sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime());

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },

  async getById(id: string): Promise<Creance | undefined> {
    await delay(200);
    return recouvrements.find(c => c.id === id) as unknown as Creance | undefined;
  },

  async getStats(): Promise<RecouvrementsStats> {
    await delay(250);
    const data = recouvrements as unknown as Creance[];
    const pending = data.filter(c => c.status === 'pending').length;
    const in_progress = data.filter(c => c.status === 'in_progress').length;
    const paid = data.filter(c => c.status === 'paid').length;
    const litige = data.filter(c => c.status === 'litige').length;
    const irrecoverable = data.filter(c => c.status === 'irrecoverable').length;
    const montantTotal = data.reduce((acc, c) => acc + c.montant, 0);
    const montantRecouvre = data.reduce((acc, c) => acc + c.montantRecouvre, 0);
    const montantEnRetard = data.filter(c => c.joursRetard > 0).reduce((acc, c) => acc + c.montant - c.montantRecouvre, 0);

    return {
      total: data.length,
      pending,
      in_progress,
      paid,
      litige,
      irrecoverable,
      montantTotal,
      montantRecouvre,
      montantEnAttente: montantTotal - montantRecouvre,
      tauxRecouvrement: montantTotal > 0 ? Math.round((montantRecouvre / montantTotal) * 100) : 0,
      montantEnRetard,
      ts: new Date().toISOString(),
    };
  },

  formatMontant,

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { pending: 'En attente', in_progress: 'En cours', paid: 'Payé', litige: 'Litige', irrecoverable: 'Irrécouvrable' };
    return labels[status] || status;
  },

  getStatusColor(status: string): string {
    const colors: Record<string, string> = { pending: 'amber', in_progress: 'blue', paid: 'emerald', litige: 'red', irrecoverable: 'slate' };
    return colors[status] || 'slate';
  },
};

