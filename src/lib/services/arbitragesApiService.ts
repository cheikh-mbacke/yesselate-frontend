/**
 * ====================================================================
 * SERVICE: API Arbitrages & Goulots - Pattern Pilotage
 * ====================================================================
 */

import type { ArbitragesFilter } from '@/lib/stores/arbitragesWorkspaceStore';

export interface Arbitrage {
  id: string;
  ref: string;
  titre: string;
  description: string;
  type: 'goulot' | 'conflit' | 'arbitrage' | 'decision';
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated';
  priority: 'critical' | 'high' | 'medium' | 'low';
  bureaux: { id: string; name: string; position: string }[];
  initiateur: { id: string; name: string; bureau: string };
  montantImpact?: number;
  delaiJours: number;
  dateCreation: string;
  dateEcheance?: string;
  decisions?: { date: string; auteur: string; contenu: string }[];
  linkedDossiers?: string[];
}

export interface ArbitragesStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  escalated: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  byBureau: Record<string, number>;
  criticalCount: number;
  avgResolutionTime: number;
  goulotsPrincipaux: { bureau: string; count: number }[];
  ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function formatMontant(montant: number): string {
  if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(1)} Md`;
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(0)} M`;
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
  return montant.toLocaleString('fr-FR');
}

// Mock data
const mockArbitrages: Arbitrage[] = [
  { id: 'ARB001', ref: 'ARB-2026-001', titre: 'Conflit priorité projets BDC/DAF', description: 'Désaccord sur allocation budgétaire projet Alpha', type: 'conflit', status: 'escalated', priority: 'critical', bureaux: [{ id: 'BDC', name: 'Bureau Développement Commercial', position: 'demandeur' }, { id: 'DAF', name: 'Direction Administrative et Financière', position: 'opposant' }], initiateur: { id: 'EMP001', name: 'Jean Dupont', bureau: 'BDC' }, montantImpact: 250_000_000, delaiJours: 15, dateCreation: '2026-01-02', dateEcheance: '2026-01-17' },
  { id: 'ARB002', ref: 'ARB-2026-002', titre: 'Goulot validation contrats fournisseurs', description: 'Retard systématique validation BJ', type: 'goulot', status: 'in_progress', priority: 'high', bureaux: [{ id: 'BJ', name: 'Bureau Juridique', position: 'bloqueur' }, { id: 'BAP', name: 'Bureau Achats et Passation', position: 'impacté' }], initiateur: { id: 'EMP002', name: 'Marie Claire', bureau: 'BAP' }, montantImpact: 180_000_000, delaiJours: 8, dateCreation: '2026-01-05', linkedDossiers: ['DOS-2026-045', 'DOS-2026-067'] },
  { id: 'ARB003', ref: 'ARB-2026-003', titre: 'Arbitrage ressources humaines projet Beta', description: 'Affectation personnel entre projets concurrents', type: 'arbitrage', status: 'pending', priority: 'medium', bureaux: [{ id: 'RH', name: 'Ressources Humaines', position: 'arbitre' }, { id: 'BT', name: 'Bureau Technique', position: 'demandeur' }], initiateur: { id: 'EMP003', name: 'Paul Martin', bureau: 'BT' }, delaiJours: 5, dateCreation: '2026-01-08' },
  { id: 'ARB004', ref: 'ARB-2026-004', titre: 'Décision urgente chantier C12', description: 'Arrêt travaux pour non-conformité sécurité', type: 'decision', status: 'resolved', priority: 'critical', bureaux: [{ id: 'BMO', name: 'Bureau Maître d\'Ouvrage', position: 'décideur' }], initiateur: { id: 'EMP004', name: 'Sophie Diallo', bureau: 'HSE' }, montantImpact: 45_000_000, delaiJours: 0, dateCreation: '2026-01-10', decisions: [{ date: '2026-01-10', auteur: 'DG', contenu: 'Arrêt immédiat - reprise sous conditions' }] },
  { id: 'ARB005', ref: 'ARB-2026-005', titre: 'Conflit planning livraisons', description: 'Chevauchement calendrier équipements', type: 'conflit', status: 'pending', priority: 'high', bureaux: [{ id: 'BL', name: 'Bureau Logistique', position: 'coordinateur' }, { id: 'BT', name: 'Bureau Technique', position: 'impacté' }], initiateur: { id: 'EMP005', name: 'Ahmed Koné', bureau: 'BL' }, delaiJours: 3, dateCreation: '2026-01-09' },
];

export const arbitragesApiService = {
  async getAll(filter?: ArbitragesFilter, sortBy?: string, page = 1, limit = 20): Promise<{ data: Arbitrage[]; total: number; page: number; totalPages: number }> {
    await delay(300);
    let data = [...mockArbitrages];

    if (filter?.status) data = data.filter(a => a.status === filter.status);
    if (filter?.priority) data = data.filter(a => a.priority === filter.priority);
    if (filter?.type) data = data.filter(a => a.type === filter.type);
    if (filter?.bureaux?.length) data = data.filter(a => a.bureaux.some(b => filter.bureaux!.includes(b.id)));
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      data = data.filter(a => a.ref.toLowerCase().includes(q) || a.titre.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }

    if (sortBy === 'priority') {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      data.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sortBy === 'delay') {
      data.sort((a, b) => b.delaiJours - a.delaiJours);
    } else if (sortBy === 'amount') {
      data.sort((a, b) => (b.montantImpact || 0) - (a.montantImpact || 0));
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },

  async getById(id: string): Promise<Arbitrage | undefined> {
    await delay(200);
    return mockArbitrages.find(a => a.id === id);
  },

  async getStats(): Promise<ArbitragesStats> {
    await delay(250);
    const data = mockArbitrages;
    const pending = data.filter(a => a.status === 'pending').length;
    const inProgress = data.filter(a => a.status === 'in_progress').length;
    const resolved = data.filter(a => a.status === 'resolved').length;
    const escalated = data.filter(a => a.status === 'escalated').length;
    const criticalCount = data.filter(a => a.priority === 'critical').length;

    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byBureau: Record<string, number> = {};
    data.forEach(a => {
      byType[a.type] = (byType[a.type] || 0) + 1;
      byPriority[a.priority] = (byPriority[a.priority] || 0) + 1;
      a.bureaux.forEach(b => { byBureau[b.id] = (byBureau[b.id] || 0) + 1; });
    });

    const goulotsPrincipaux = Object.entries(byBureau).map(([bureau, count]) => ({ bureau, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      total: data.length,
      pending, inProgress, resolved, escalated,
      byType, byPriority, byBureau,
      criticalCount,
      avgResolutionTime: 5,
      goulotsPrincipaux,
      ts: new Date().toISOString(),
    };
  },

  async takeDecision(arbitrageId: string, decision: string): Promise<{ success: boolean }> {
    await delay(500);
    return { success: true };
  },

  async escalate(arbitrageId: string): Promise<{ success: boolean }> {
    await delay(500);
    return { success: true };
  },

  formatMontant,

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { pending: 'En attente', in_progress: 'En cours', resolved: 'Résolu', escalated: 'Escaladé' };
    return labels[status] || status;
  },

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { goulot: 'Goulot', conflit: 'Conflit', arbitrage: 'Arbitrage', decision: 'Décision' };
    return labels[type] || type;
  },

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = { critical: 'red', high: 'amber', medium: 'blue', low: 'slate' };
    return colors[priority] || 'slate';
  },

  getStatusColor(status: string): string {
    const colors: Record<string, string> = { pending: 'amber', in_progress: 'blue', resolved: 'emerald', escalated: 'red' };
    return colors[status] || 'slate';
  },

  getTypeColor(type: string): string {
    const colors: Record<string, string> = { goulot: 'orange', conflit: 'red', arbitrage: 'indigo', decision: 'emerald' };
    return colors[type] || 'slate';
  },
};

