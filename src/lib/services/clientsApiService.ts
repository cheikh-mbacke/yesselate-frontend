/**
 * ====================================================================
 * SERVICE: API Clients - Pattern Pilotage
 * ====================================================================
 */

import type { ClientsFilter } from '@/lib/stores/clientsWorkspaceStore';

export interface Client {
  id: string;
  name: string;
  type: 'particulier' | 'entreprise' | 'institution';
  status: 'active' | 'litige' | 'termine' | 'prospect';
  segment: 'premium' | 'standard' | 'occasionnel';
  email?: string;
  phone?: string;
  address?: string;
  contactPrincipal?: string;
  chiffreAffaires: number;
  projetsCount: number;
  projetsEnCours: number;
  dateCreation: string;
  dernierContact?: string;
  notes?: string;
}

export interface ClientsStats {
  total: number;
  active: number;
  litige: number;
  termine: number;
  prospect: number;
  byType: Record<string, number>;
  bySegment: Record<string, number>;
  chiffreAffairesTotal: number;
  projetsTotal: number;
  projetsEnCours: number;
  topClients: { id: string; name: string; ca: number }[];
  ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function formatMontant(montant: number): string {
  if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(1)} Md`;
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(0)} M`;
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
  return montant.toLocaleString('fr-FR');
}

const mockClients: Client[] = [
  { id: 'CLI001', name: 'Groupe SONATEL', type: 'entreprise', status: 'active', segment: 'premium', email: 'contact@sonatel.sn', phone: '+221 33 839 00 00', chiffreAffaires: 2_500_000_000, projetsCount: 12, projetsEnCours: 3, dateCreation: '2020-01-15', dernierContact: '2026-01-08' },
  { id: 'CLI002', name: 'Ministère des Infrastructures', type: 'institution', status: 'active', segment: 'premium', email: 'mi@gouv.sn', phone: '+221 33 822 00 00', chiffreAffaires: 5_800_000_000, projetsCount: 8, projetsEnCours: 5, dateCreation: '2019-06-01', dernierContact: '2026-01-10' },
  { id: 'CLI003', name: 'Entreprise DIALLO & Fils', type: 'entreprise', status: 'litige', segment: 'standard', email: 'contact@diallo-fils.sn', phone: '+221 77 123 45 67', chiffreAffaires: 450_000_000, projetsCount: 3, projetsEnCours: 0, dateCreation: '2022-03-20', dernierContact: '2025-12-15', notes: 'Litige impayés - Dossier en cours' },
  { id: 'CLI004', name: 'M. Abdoulaye NDIAYE', type: 'particulier', status: 'termine', segment: 'occasionnel', phone: '+221 76 987 65 43', chiffreAffaires: 25_000_000, projetsCount: 1, projetsEnCours: 0, dateCreation: '2024-08-10', dernierContact: '2025-11-30' },
  { id: 'CLI005', name: 'ONG Développement Durable', type: 'institution', status: 'prospect', segment: 'standard', email: 'info@odd.org', chiffreAffaires: 0, projetsCount: 0, projetsEnCours: 0, dateCreation: '2025-12-01', notes: 'En négociation pour projet école' },
  { id: 'CLI006', name: 'Banque Atlantique Sénégal', type: 'entreprise', status: 'active', segment: 'premium', email: 'btp@banqueatlantique.net', phone: '+221 33 859 50 00', chiffreAffaires: 1_200_000_000, projetsCount: 5, projetsEnCours: 2, dateCreation: '2021-02-28', dernierContact: '2026-01-05' },
];

export const clientsApiService = {
  async getAll(filter?: ClientsFilter, sortBy?: string, page = 1, limit = 20): Promise<{ data: Client[]; total: number; page: number; totalPages: number }> {
    await delay(300);
    let data = [...mockClients];

    if (filter?.status) data = data.filter(c => c.status === filter.status);
    if (filter?.type) data = data.filter(c => c.type === filter.type);
    if (filter?.segment) data = data.filter(c => c.segment === filter.segment);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      data = data.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
    }

    if (sortBy === 'ca') data.sort((a, b) => b.chiffreAffaires - a.chiffreAffaires);
    else if (sortBy === 'projets') data.sort((a, b) => b.projetsEnCours - a.projetsEnCours);
    else if (sortBy === 'name') data.sort((a, b) => a.name.localeCompare(b.name));

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },

  async getById(id: string): Promise<Client | undefined> {
    await delay(200);
    return mockClients.find(c => c.id === id);
  },

  async getStats(): Promise<ClientsStats> {
    await delay(250);
    const data = mockClients;
    const active = data.filter(c => c.status === 'active').length;
    const litige = data.filter(c => c.status === 'litige').length;
    const termine = data.filter(c => c.status === 'termine').length;
    const prospect = data.filter(c => c.status === 'prospect').length;
    const chiffreAffairesTotal = data.reduce((acc, c) => acc + c.chiffreAffaires, 0);
    const projetsTotal = data.reduce((acc, c) => acc + c.projetsCount, 0);
    const projetsEnCours = data.reduce((acc, c) => acc + c.projetsEnCours, 0);

    const byType: Record<string, number> = {};
    const bySegment: Record<string, number> = {};
    data.forEach(c => {
      byType[c.type] = (byType[c.type] || 0) + 1;
      bySegment[c.segment] = (bySegment[c.segment] || 0) + 1;
    });

    const topClients = [...data].sort((a, b) => b.chiffreAffaires - a.chiffreAffaires).slice(0, 5).map(c => ({ id: c.id, name: c.name, ca: c.chiffreAffaires }));

    return { total: data.length, active, litige, termine, prospect, byType, bySegment, chiffreAffairesTotal, projetsTotal, projetsEnCours, topClients, ts: new Date().toISOString() };
  },

  formatMontant,

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { active: 'Actif', litige: 'En litige', termine: 'Terminé', prospect: 'Prospect' };
    return labels[status] || status;
  },

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { particulier: 'Particulier', entreprise: 'Entreprise', institution: 'Institution' };
    return labels[type] || type;
  },

  getSegmentLabel(segment: string): string {
    const labels: Record<string, string> = { premium: 'Premium', standard: 'Standard', occasionnel: 'Occasionnel' };
    return labels[segment] || segment;
  },

  getStatusColor(status: string): string {
    const colors: Record<string, string> = { active: 'emerald', litige: 'red', termine: 'slate', prospect: 'blue' };
    return colors[status] || 'slate';
  },

  getSegmentColor(segment: string): string {
    const colors: Record<string, string> = { premium: 'amber', standard: 'indigo', occasionnel: 'slate' };
    return colors[segment] || 'slate';
  },
};

