/**
 * SERVICE: API Décisions - Pattern Pilotage
 */
import type { DecisionsFilter } from '@/lib/stores/decisionsWorkspaceStore';

export interface Decision {
  id: string; ref: string; titre: string; description: string;
  type: 'strategique' | 'operationnel' | 'financier' | 'rh' | 'technique';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'executed';
  niveau: 'dg' | 'direction' | 'bureau' | 'equipe';
  auteur: { id: string; name: string; role: string };
  approbateurs: { id: string; name: string; status: string; date?: string }[];
  dateCreation: string; dateDecision?: string; dateExecution?: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  montantImpact?: number; linkedDossiers?: string[];
}

export interface DecisionsStats {
  total: number; draft: number; pending: number; approved: number; rejected: number; executed: number;
  byType: Record<string, number>; byNiveau: Record<string, number>; byImpact: Record<string, number>;
  criticalPending: number; montantTotal: number; avgApprovalTime: number; ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const formatMontant = (m: number): string => m >= 1e9 ? `${(m/1e9).toFixed(1)} Md` : m >= 1e6 ? `${(m/1e6).toFixed(0)} M` : m >= 1e3 ? `${(m/1e3).toFixed(0)} K` : m.toLocaleString('fr-FR');

const mockDecisions: Decision[] = [
  { id: 'DEC001', ref: 'DEC-2026-001', titre: 'Lancement projet infrastructure Alpha', description: 'Approbation démarrage phase 1 du projet', type: 'strategique', status: 'pending', niveau: 'dg', auteur: { id: 'EMP001', name: 'Ahmed Koné', role: 'DG' }, approbateurs: [{ id: 'CA01', name: 'Conseil Admin', status: 'pending' }], dateCreation: '2026-01-08', impact: 'critical', montantImpact: 2_500_000_000 },
  { id: 'DEC002', ref: 'DEC-2026-002', titre: 'Recrutement équipe technique', description: 'Validation budget recrutement 5 ingénieurs', type: 'rh', status: 'approved', niveau: 'direction', auteur: { id: 'EMP002', name: 'Marie Claire', role: 'DRH' }, approbateurs: [{ id: 'DG', name: 'Direction Générale', status: 'approved', date: '2026-01-09' }], dateCreation: '2026-01-05', dateDecision: '2026-01-09', impact: 'medium', montantImpact: 150_000_000 },
  { id: 'DEC003', ref: 'DEC-2026-003', titre: 'Changement fournisseur béton', description: 'Nouveau partenariat suite rupture contrat', type: 'operationnel', status: 'executed', niveau: 'bureau', auteur: { id: 'EMP003', name: 'Paul Martin', role: 'Chef BAP' }, approbateurs: [{ id: 'DAF', name: 'DAF', status: 'approved', date: '2026-01-07' }], dateCreation: '2026-01-03', dateDecision: '2026-01-07', dateExecution: '2026-01-10', impact: 'high' },
  { id: 'DEC004', ref: 'DEC-2026-004', titre: 'Allocation budget urgence chantier C12', description: 'Déblocage fonds supplémentaires sécurité', type: 'financier', status: 'pending', niveau: 'dg', auteur: { id: 'EMP004', name: 'Sophie Diallo', role: 'DAF' }, approbateurs: [{ id: 'DG', name: 'Direction Générale', status: 'pending' }], dateCreation: '2026-01-10', impact: 'critical', montantImpact: 85_000_000 },
  { id: 'DEC005', ref: 'DEC-2026-005', titre: 'Mise à jour procédures qualité', description: 'Révision normes ISO projet Beta', type: 'technique', status: 'draft', niveau: 'equipe', auteur: { id: 'EMP005', name: 'Jean Dupont', role: 'Ing. Qualité' }, approbateurs: [], dateCreation: '2026-01-09', impact: 'low' },
];

export const decisionsApiService = {
  async getAll(filter?: DecisionsFilter, sortBy?: string, page = 1, limit = 20): Promise<{ data: Decision[]; total: number; page: number; totalPages: number }> {
    await delay(300);
    let data = [...mockDecisions];
    if (filter?.status) data = data.filter(d => d.status === filter.status);
    if (filter?.type) data = data.filter(d => d.type === filter.type);
    if (filter?.niveau) data = data.filter(d => d.niveau === filter.niveau);
    if (filter?.search) { const q = filter.search.toLowerCase(); data = data.filter(d => d.ref.toLowerCase().includes(q) || d.titre.toLowerCase().includes(q)); }
    if (sortBy === 'impact') { const order = { critical: 0, high: 1, medium: 2, low: 3 }; data.sort((a, b) => order[a.impact] - order[b.impact]); }
    const total = data.length; const totalPages = Math.ceil(total / limit); const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },
  async getById(id: string): Promise<Decision | undefined> { await delay(200); return mockDecisions.find(d => d.id === id); },
  async getStats(): Promise<DecisionsStats> {
    await delay(250); const data = mockDecisions;
    const draft = data.filter(d => d.status === 'draft').length;
    const pending = data.filter(d => d.status === 'pending').length;
    const approved = data.filter(d => d.status === 'approved').length;
    const rejected = data.filter(d => d.status === 'rejected').length;
    const executed = data.filter(d => d.status === 'executed').length;
    const criticalPending = data.filter(d => d.status === 'pending' && d.impact === 'critical').length;
    const montantTotal = data.reduce((a, d) => a + (d.montantImpact || 0), 0);
    const byType: Record<string, number> = {}; const byNiveau: Record<string, number> = {}; const byImpact: Record<string, number> = {};
    data.forEach(d => { byType[d.type] = (byType[d.type] || 0) + 1; byNiveau[d.niveau] = (byNiveau[d.niveau] || 0) + 1; byImpact[d.impact] = (byImpact[d.impact] || 0) + 1; });
    return { total: data.length, draft, pending, approved, rejected, executed, byType, byNiveau, byImpact, criticalPending, montantTotal, avgApprovalTime: 48, ts: new Date().toISOString() };
  },
  formatMontant,
  getStatusLabel: (s: string): string => ({ draft: 'Brouillon', pending: 'En attente', approved: 'Approuvée', rejected: 'Rejetée', executed: 'Exécutée' }[s] || s),
  getTypeLabel: (t: string): string => ({ strategique: 'Stratégique', operationnel: 'Opérationnel', financier: 'Financier', rh: 'RH', technique: 'Technique' }[t] || t),
  getNiveauLabel: (n: string): string => ({ dg: 'DG', direction: 'Direction', bureau: 'Bureau', equipe: 'Équipe' }[n] || n),
  getStatusColor: (s: string): string => ({ draft: 'slate', pending: 'amber', approved: 'emerald', rejected: 'red', executed: 'blue' }[s] || 'slate'),
  getImpactColor: (i: string): string => ({ critical: 'red', high: 'amber', medium: 'blue', low: 'slate' }[i] || 'slate'),
};

