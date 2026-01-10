/**
 * ====================================================================
 * SERVICE: API Depenses
 * ====================================================================
 */

import type { DepenseFilter } from '@/lib/stores/depensesWorkspaceStore';

export interface Depense {
  id: string;
  description: string;
  montant: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  category: string;
  date: string;
  demandeur: string;
  bureau: string;
  projet?: string;
  justificatif?: boolean;
}

export interface DepensesStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  paid: number;
  montantTotal: number;
  montantPending: number;
  montantApproved: number;
  montantPaid: number;
  byCategory: Record<string, number>;
  ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function formatMontant(montant: number): string {
  if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(1)} Md`;
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(0)} M`;
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
  return montant.toLocaleString('fr-FR');
}

const mockDepenses: Depense[] = [
  { id: 'DEP001', description: 'Achat matériel informatique', montant: 2_500_000, status: 'pending', category: 'Équipement', date: '2026-01-10', demandeur: 'Jean Dupont', bureau: 'DSI', justificatif: true },
  { id: 'DEP002', description: 'Frais de mission Abidjan', montant: 850_000, status: 'approved', category: 'Déplacements', date: '2026-01-09', demandeur: 'Marie Claire', bureau: 'BDC', projet: 'PRJ-001', justificatif: true },
  { id: 'DEP003', description: 'Fournitures bureau', montant: 150_000, status: 'paid', category: 'Fournitures', date: '2026-01-08', demandeur: 'Paul Martin', bureau: 'ADM', justificatif: true },
  { id: 'DEP004', description: 'Formation sécurité', montant: 1_200_000, status: 'pending', category: 'Formation', date: '2026-01-07', demandeur: 'Sophie Diallo', bureau: 'RH', justificatif: false },
  { id: 'DEP005', description: 'Réparation véhicule', montant: 450_000, status: 'rejected', category: 'Maintenance', date: '2026-01-06', demandeur: 'Kouadio Yao', bureau: 'LOG', justificatif: true },
];

export const depensesApiService = {
  async getAll(filter?: DepenseFilter, sortBy?: string, page = 1, limit = 20): Promise<{
    data: Depense[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await delay(300);
    let data = [...mockDepenses];
    if (filter?.status) data = data.filter(d => d.status === filter.status);
    if (filter?.category) data = data.filter(d => d.category === filter.category);
    if (filter?.minAmount) data = data.filter(d => d.montant >= filter.minAmount!);
    if (filter?.maxAmount) data = data.filter(d => d.montant <= filter.maxAmount!);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      data = data.filter(d => d.id.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.demandeur.toLowerCase().includes(q));
    }
    if (sortBy === 'amount') data.sort((a, b) => b.montant - a.montant);
    else if (sortBy === 'date') data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },

  async getById(id: string): Promise<Depense | undefined> {
    await delay(200);
    return mockDepenses.find(d => d.id === id);
  },

  async getStats(): Promise<DepensesStats> {
    await delay(250);
    const data = mockDepenses;
    const pending = data.filter(d => d.status === 'pending').length;
    const approved = data.filter(d => d.status === 'approved').length;
    const rejected = data.filter(d => d.status === 'rejected').length;
    const paid = data.filter(d => d.status === 'paid').length;
    const montantTotal = data.reduce((acc, d) => acc + d.montant, 0);
    const montantPending = data.filter(d => d.status === 'pending').reduce((acc, d) => acc + d.montant, 0);
    const montantApproved = data.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.montant, 0);
    const montantPaid = data.filter(d => d.status === 'paid').reduce((acc, d) => acc + d.montant, 0);
    const byCategory: Record<string, number> = {};
    data.forEach(d => { byCategory[d.category] = (byCategory[d.category] || 0) + 1; });
    return { total: data.length, pending, approved, rejected, paid, montantTotal, montantPending, montantApproved, montantPaid, byCategory, ts: new Date().toISOString() };
  },

  formatMontant,

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { pending: 'En attente', approved: 'Approuvée', rejected: 'Rejetée', paid: 'Payée' };
    return labels[status] || status;
  },

  getStatusColor(status: string): string {
    const colors: Record<string, string> = { pending: 'amber', approved: 'blue', rejected: 'red', paid: 'emerald' };
    return colors[status] || 'slate';
  },
};

