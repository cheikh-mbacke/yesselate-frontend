/**
 * ====================================================================
 * SERVICE: API Tickets Clients - Pattern Pilotage
 * ====================================================================
 */

import type { TicketsFilter } from '@/lib/stores/ticketsWorkspaceStore';

export interface Ticket {
  id: string;
  ref: string;
  titre: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'technique' | 'commercial' | 'facturation' | 'livraison' | 'qualite' | 'autre';
  client: { id: string; name: string };
  assignee?: { id: string; name: string; bureau: string };
  project?: { id: string; name: string };
  dateCreation: string;
  dateEcheance?: string;
  dateResolution?: string;
  sla: { target: number; elapsed: number; breached: boolean };
  messages: number;
  attachments: number;
}

export interface TicketsStats {
  total: number;
  open: number;
  inProgress: number;
  pending: number;
  resolved: number;
  closed: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  criticalCount: number;
  slaBreached: number;
  avgResolutionTime: number;
  ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mockTickets: Ticket[] = [
  { id: 'TKT001', ref: 'TKT-2026-001', titre: 'Problème livraison matériaux chantier C12', description: 'Retard de 3 jours sur livraison béton armé', status: 'open', priority: 'critical', category: 'livraison', client: { id: 'CLI002', name: 'Ministère des Infrastructures' }, project: { id: 'PRJ-012', name: 'Construction pont Diamniadio' }, dateCreation: '2026-01-09', dateEcheance: '2026-01-11', sla: { target: 48, elapsed: 36, breached: false }, messages: 5, attachments: 2 },
  { id: 'TKT002', ref: 'TKT-2026-002', titre: 'Demande modification plans architecturaux', description: 'Client souhaite agrandir superficie étage 3', status: 'in_progress', priority: 'high', category: 'technique', client: { id: 'CLI001', name: 'Groupe SONATEL' }, assignee: { id: 'EMP001', name: 'Jean Dupont', bureau: 'BT' }, project: { id: 'PRJ-008', name: 'Siège social SONATEL' }, dateCreation: '2026-01-07', sla: { target: 72, elapsed: 60, breached: false }, messages: 12, attachments: 5 },
  { id: 'TKT003', ref: 'TKT-2026-003', titre: 'Contestation facture FV-2025-892', description: 'Écart montant facturé vs devis initial', status: 'pending', priority: 'medium', category: 'facturation', client: { id: 'CLI003', name: 'Entreprise DIALLO & Fils' }, assignee: { id: 'EMP002', name: 'Marie Claire', bureau: 'DAF' }, dateCreation: '2026-01-05', sla: { target: 120, elapsed: 130, breached: true }, messages: 8, attachments: 3 },
  { id: 'TKT004', ref: 'TKT-2026-004', titre: 'Défaut qualité carrelage livré', description: 'Lot carrelage présente des défauts visibles', status: 'resolved', priority: 'high', category: 'qualite', client: { id: 'CLI006', name: 'Banque Atlantique Sénégal' }, assignee: { id: 'EMP003', name: 'Paul Martin', bureau: 'BAP' }, dateCreation: '2026-01-03', dateResolution: '2026-01-08', sla: { target: 96, elapsed: 72, breached: false }, messages: 15, attachments: 8 },
  { id: 'TKT005', ref: 'TKT-2026-005', titre: 'Demande RDV commercial projet école', description: 'Prospect souhaite présentation services', status: 'open', priority: 'low', category: 'commercial', client: { id: 'CLI005', name: 'ONG Développement Durable' }, dateCreation: '2026-01-10', sla: { target: 168, elapsed: 8, breached: false }, messages: 2, attachments: 0 },
];

export const ticketsApiService = {
  async getAll(filter?: TicketsFilter, sortBy?: string, page = 1, limit = 20): Promise<{ data: Ticket[]; total: number; page: number; totalPages: number }> {
    await delay(300);
    let data = [...mockTickets];

    if (filter?.status) data = data.filter(t => t.status === filter.status);
    if (filter?.priority) data = data.filter(t => t.priority === filter.priority);
    if (filter?.category) data = data.filter(t => t.category === filter.category);
    if (filter?.client) data = data.filter(t => t.client.id === filter.client);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      data = data.filter(t => t.ref.toLowerCase().includes(q) || t.titre.toLowerCase().includes(q) || t.client.name.toLowerCase().includes(q));
    }

    if (sortBy === 'priority') {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      data.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sortBy === 'sla') {
      data.sort((a, b) => (b.sla.elapsed / b.sla.target) - (a.sla.elapsed / a.sla.target));
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },

  async getById(id: string): Promise<Ticket | undefined> {
    await delay(200);
    return mockTickets.find(t => t.id === id);
  },

  async getStats(): Promise<TicketsStats> {
    await delay(250);
    const data = mockTickets;
    const open = data.filter(t => t.status === 'open').length;
    const inProgress = data.filter(t => t.status === 'in_progress').length;
    const pending = data.filter(t => t.status === 'pending').length;
    const resolved = data.filter(t => t.status === 'resolved').length;
    const closed = data.filter(t => t.status === 'closed').length;
    const criticalCount = data.filter(t => t.priority === 'critical').length;
    const slaBreached = data.filter(t => t.sla.breached).length;

    const byPriority: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    data.forEach(t => {
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });

    return { total: data.length, open, inProgress, pending, resolved, closed, byPriority, byCategory, criticalCount, slaBreached, avgResolutionTime: 48, ts: new Date().toISOString() };
  },

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { open: 'Ouvert', in_progress: 'En cours', pending: 'En attente', resolved: 'Résolu', closed: 'Fermé' };
    return labels[status] || status;
  },

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = { technique: 'Technique', commercial: 'Commercial', facturation: 'Facturation', livraison: 'Livraison', qualite: 'Qualité', autre: 'Autre' };
    return labels[category] || category;
  },

  getStatusColor(status: string): string {
    const colors: Record<string, string> = { open: 'blue', in_progress: 'indigo', pending: 'amber', resolved: 'emerald', closed: 'slate' };
    return colors[status] || 'slate';
  },

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = { critical: 'red', high: 'amber', medium: 'blue', low: 'slate' };
    return colors[priority] || 'slate';
  },
};

