/**
 * ====================================================================
 * SERVICE: API Substitution - Pattern Pilotage
 * ====================================================================
 */

import type { SubstitutionFilter } from '@/lib/stores/substitutionWorkspaceStore';
import { substitutions, blockedDossiers, employees, plannedAbsences, delegations } from '@/lib/data';

export interface Substitution {
  id: string;
  ref: string;
  bureau: string;
  description: string;
  amount: number;
  delay: number;
  reason: 'absence' | 'blocage' | 'technique' | 'documents';
  status: 'active' | 'pending' | 'completed' | 'expired';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  titulaire: { id: string; name: string; bureau: string };
  substitut?: { id: string; name: string; bureau: string; score: number };
  dateDebut: string;
  dateFin?: string;
  linkedProjects?: string[];
}

export interface SubstitutionStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  expired: number;
  byReason: Record<string, number>;
  byBureau: Record<string, number>;
  avgDelay: number;
  criticalCount: number;
  absencesCount: number;
  delegationsCount: number;
  ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function formatMontant(montant: number): string {
  if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(1)} Md`;
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(0)} M`;
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
  return montant.toLocaleString('fr-FR');
}

// Mock data transformation
const mockSubstitutions: Substitution[] = [
  { id: 'SUB001', ref: 'SUB-2026-001', bureau: 'BDC', description: 'Validation BC fournisseur', amount: 15_000_000, delay: 5, reason: 'absence', status: 'active', urgency: 'high', titulaire: { id: 'EMP001', name: 'Jean Dupont', bureau: 'BDC' }, substitut: { id: 'EMP002', name: 'Marie Claire', bureau: 'BDC', score: 95 }, dateDebut: '2026-01-08', dateFin: '2026-01-15', linkedProjects: ['PRJ-001'] },
  { id: 'SUB002', ref: 'SUB-2026-002', bureau: 'DAF', description: 'Approbation paiement urgent', amount: 8_500_000, delay: 3, reason: 'technique', status: 'pending', urgency: 'critical', titulaire: { id: 'EMP003', name: 'Paul Martin', bureau: 'DAF' }, dateDebut: '2026-01-10', linkedProjects: ['PRJ-002'] },
  { id: 'SUB003', ref: 'SUB-2026-003', bureau: 'BMO', description: 'Arbitrage inter-bureaux', amount: 45_000_000, delay: 8, reason: 'blocage', status: 'active', urgency: 'high', titulaire: { id: 'EMP004', name: 'Sophie Diallo', bureau: 'BMO' }, substitut: { id: 'EMP005', name: 'Ahmed Koné', bureau: 'BMO', score: 88 }, dateDebut: '2026-01-05' },
  { id: 'SUB004', ref: 'SUB-2026-004', bureau: 'BJ', description: 'Signature contrat litige', amount: 120_000_000, delay: 12, reason: 'documents', status: 'pending', urgency: 'medium', titulaire: { id: 'EMP006', name: 'Fatou Sow', bureau: 'BJ' }, dateDebut: '2026-01-03' },
  { id: 'SUB005', ref: 'SUB-2026-005', bureau: 'RH', description: 'Validation congés équipe', amount: 0, delay: 2, reason: 'absence', status: 'completed', urgency: 'low', titulaire: { id: 'EMP007', name: 'Kouadio Yao', bureau: 'RH' }, substitut: { id: 'EMP008', name: 'Awa Traoré', bureau: 'RH', score: 92 }, dateDebut: '2026-01-01', dateFin: '2026-01-07' },
];

export const substitutionApiService = {
  async getAll(filter?: SubstitutionFilter, sortBy?: string, page = 1, limit = 20): Promise<{
    data: Substitution[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await delay(300);
    let data = [...mockSubstitutions];

    if (filter?.status) data = data.filter(s => s.status === filter.status);
    if (filter?.reason) data = data.filter(s => s.reason === filter.reason);
    if (filter?.bureau) data = data.filter(s => s.bureau === filter.bureau);
    if (filter?.urgency) data = data.filter(s => s.urgency === filter.urgency);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      data = data.filter(s => s.ref.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.titulaire.name.toLowerCase().includes(q));
    }

    if (sortBy === 'urgency') {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      data.sort((a, b) => order[a.urgency] - order[b.urgency]);
    } else if (sortBy === 'delay') {
      data.sort((a, b) => b.delay - a.delay);
    } else if (sortBy === 'amount') {
      data.sort((a, b) => b.amount - a.amount);
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },

  async getById(id: string): Promise<Substitution | undefined> {
    await delay(200);
    return mockSubstitutions.find(s => s.id === id);
  },

  async getStats(): Promise<SubstitutionStats> {
    await delay(250);
    const data = mockSubstitutions;
    const active = data.filter(s => s.status === 'active').length;
    const pending = data.filter(s => s.status === 'pending').length;
    const completed = data.filter(s => s.status === 'completed').length;
    const expired = data.filter(s => s.status === 'expired').length;
    const criticalCount = data.filter(s => s.urgency === 'critical').length;
    const avgDelay = data.length > 0 ? data.reduce((acc, s) => acc + s.delay, 0) / data.length : 0;

    const byReason: Record<string, number> = {};
    const byBureau: Record<string, number> = {};
    data.forEach(s => {
      byReason[s.reason] = (byReason[s.reason] || 0) + 1;
      byBureau[s.bureau] = (byBureau[s.bureau] || 0) + 1;
    });

    return {
      total: data.length,
      active,
      pending,
      completed,
      expired,
      byReason,
      byBureau,
      avgDelay: Math.round(avgDelay),
      criticalCount,
      absencesCount: plannedAbsences?.length || 0,
      delegationsCount: delegations?.length || 0,
      ts: new Date().toISOString(),
    };
  },

  async assignSubstitut(substitutionId: string, substitutId: string): Promise<{ success: boolean }> {
    await delay(500);
    return { success: true };
  },

  async completeSubstitution(substitutionId: string): Promise<{ success: boolean }> {
    await delay(500);
    return { success: true };
  },

  formatMontant,

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { active: 'Active', pending: 'En attente', completed: 'Terminée', expired: 'Expirée' };
    return labels[status] || status;
  },

  getReasonLabel(reason: string): string {
    const labels: Record<string, string> = { absence: 'Absence', blocage: 'Blocage', technique: 'Technique', documents: 'Documents' };
    return labels[reason] || reason;
  },

  getUrgencyColor(urgency: string): string {
    const colors: Record<string, string> = { critical: 'red', high: 'amber', medium: 'blue', low: 'slate' };
    return colors[urgency] || 'slate';
  },

  getStatusColor(status: string): string {
    const colors: Record<string, string> = { active: 'blue', pending: 'amber', completed: 'emerald', expired: 'slate' };
    return colors[status] || 'slate';
  },
};

