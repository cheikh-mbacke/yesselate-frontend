/**
 * SERVICE: API Échanges Inter-Bureaux - Pattern Pilotage
 */
import type { EchangesFilter } from '@/lib/stores/echangesWorkspaceStore';

export interface Echange {
  id: string; ref: string; sujet: string; message: string;
  status: 'pending' | 'resolved' | 'escalated';
  priority: 'urgent' | 'high' | 'normal';
  bureauFrom: { id: string; name: string };
  bureauTo: { id: string; name: string };
  auteur: { id: string; name: string };
  dateCreation: string; dateResolution?: string;
  project?: { id: string; name: string };
  attachments: number; responses: number;
}

export interface EchangesStats {
  total: number; pending: number; resolved: number; escalated: number;
  byBureau: Record<string, number>; byPriority: Record<string, number>;
  urgentCount: number; avgResponseTime: number; ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mockEchanges: Echange[] = [
  { id: 'ECH001', ref: 'ECH-2026-001', sujet: 'Demande validation budget projet Alpha', message: 'Besoin approbation DAF pour déblocage fonds...', status: 'pending', priority: 'urgent', bureauFrom: { id: 'BT', name: 'Bureau Technique' }, bureauTo: { id: 'DAF', name: 'Direction Administrative' }, auteur: { id: 'EMP001', name: 'Jean Dupont' }, dateCreation: '2026-01-09', project: { id: 'PRJ-001', name: 'Projet Alpha' }, attachments: 3, responses: 2 },
  { id: 'ECH002', ref: 'ECH-2026-002', sujet: 'Coordination livraison matériaux chantier C12', message: 'Planning à confirmer avec BAP...', status: 'resolved', priority: 'high', bureauFrom: { id: 'BL', name: 'Bureau Logistique' }, bureauTo: { id: 'BAP', name: 'Bureau Achats' }, auteur: { id: 'EMP002', name: 'Marie Claire' }, dateCreation: '2026-01-07', dateResolution: '2026-01-09', attachments: 1, responses: 5 },
  { id: 'ECH003', ref: 'ECH-2026-003', sujet: 'Clarification contrat fournisseur', message: 'Clause ambiguë article 5.2...', status: 'escalated', priority: 'urgent', bureauFrom: { id: 'BAP', name: 'Bureau Achats' }, bureauTo: { id: 'BJ', name: 'Bureau Juridique' }, auteur: { id: 'EMP003', name: 'Paul Martin' }, dateCreation: '2026-01-05', attachments: 2, responses: 8 },
  { id: 'ECH004', ref: 'ECH-2026-004', sujet: 'Demande affectation personnel projet Beta', message: 'Besoin 2 ingénieurs supplémentaires...', status: 'pending', priority: 'normal', bureauFrom: { id: 'BT', name: 'Bureau Technique' }, bureauTo: { id: 'RH', name: 'Ressources Humaines' }, auteur: { id: 'EMP004', name: 'Sophie Diallo' }, dateCreation: '2026-01-10', project: { id: 'PRJ-002', name: 'Projet Beta' }, attachments: 0, responses: 1 },
  { id: 'ECH005', ref: 'ECH-2026-005', sujet: 'Validation technique plans architecturaux', message: 'Plans révisés après remarques client...', status: 'pending', priority: 'high', bureauFrom: { id: 'BT', name: 'Bureau Technique' }, bureauTo: { id: 'BMO', name: 'Bureau Maître d\'Ouvrage' }, auteur: { id: 'EMP005', name: 'Ahmed Koné' }, dateCreation: '2026-01-08', attachments: 5, responses: 0 },
];

export const echangesApiService = {
  async getAll(filter?: EchangesFilter, sortBy?: string, page = 1, limit = 20): Promise<{ data: Echange[]; total: number; page: number; totalPages: number }> {
    await delay(300);
    let data = [...mockEchanges];
    if (filter?.status) data = data.filter(e => e.status === filter.status);
    if (filter?.priority) data = data.filter(e => e.priority === filter.priority);
    if (filter?.bureauFrom) data = data.filter(e => e.bureauFrom.id === filter.bureauFrom);
    if (filter?.bureauTo) data = data.filter(e => e.bureauTo.id === filter.bureauTo);
    if (filter?.search) { const q = filter.search.toLowerCase(); data = data.filter(e => e.ref.toLowerCase().includes(q) || e.sujet.toLowerCase().includes(q)); }
    if (sortBy === 'priority') { const order = { urgent: 0, high: 1, normal: 2 }; data.sort((a, b) => order[a.priority] - order[b.priority]); }
    const total = data.length; const totalPages = Math.ceil(total / limit); const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },
  async getById(id: string): Promise<Echange | undefined> { await delay(200); return mockEchanges.find(e => e.id === id); },
  async getStats(): Promise<EchangesStats> {
    await delay(250); const data = mockEchanges;
    const pending = data.filter(e => e.status === 'pending').length;
    const resolved = data.filter(e => e.status === 'resolved').length;
    const escalated = data.filter(e => e.status === 'escalated').length;
    const urgentCount = data.filter(e => e.priority === 'urgent').length;
    const byBureau: Record<string, number> = {}; const byPriority: Record<string, number> = {};
    data.forEach(e => { byBureau[e.bureauFrom.id] = (byBureau[e.bureauFrom.id] || 0) + 1; byPriority[e.priority] = (byPriority[e.priority] || 0) + 1; });
    return { total: data.length, pending, resolved, escalated, byBureau, byPriority, urgentCount, avgResponseTime: 24, ts: new Date().toISOString() };
  },
  getStatusLabel: (s: string): string => ({ pending: 'En attente', resolved: 'Résolu', escalated: 'Escaladé' }[s] || s),
  getPriorityLabel: (p: string): string => ({ urgent: 'Urgent', high: 'Haute', normal: 'Normale' }[p] || p),
  getStatusColor: (s: string): string => ({ pending: 'amber', resolved: 'emerald', escalated: 'red' }[s] || 'slate'),
  getPriorityColor: (p: string): string => ({ urgent: 'red', high: 'amber', normal: 'slate' }[p] || 'slate'),
};

