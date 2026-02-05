/**
 * ====================================================================
 * SERVICE: API Missions
 * ====================================================================
 */

import type { MissionFilter } from '@/lib/stores/missionsWorkspaceStore';

export interface Mission {
  id: string;
  objet: string;
  destination: string;
  dateDepart: string;
  dateRetour: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  agent: string;
  bureau: string;
  budgetPrevu: number;
  fraisReels?: number;
  projet?: string;
}

export interface MissionsStats {
  total: number;
  pending: number;
  approved: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  budgetTotal: number;
  fraisTotal: number;
  byDestination: Record<string, number>;
  ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function formatMontant(montant: number): string {
  if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(1)} Md`;
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(0)} M`;
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
  return montant.toLocaleString('fr-FR');
}

const mockMissions: Mission[] = [
  { id: 'MIS001', objet: 'Supervision chantier Yamoussoukro', destination: 'Yamoussoukro', dateDepart: '2026-01-15', dateRetour: '2026-01-17', status: 'approved', agent: 'Jean Dupont', bureau: 'BDC', budgetPrevu: 450_000, projet: 'PRJ-001' },
  { id: 'MIS002', objet: 'Réunion partenaires Abidjan', destination: 'Abidjan', dateDepart: '2026-01-20', dateRetour: '2026-01-21', status: 'pending', agent: 'Marie Claire', bureau: 'DAF', budgetPrevu: 250_000 },
  { id: 'MIS003', objet: 'Formation technique Dakar', destination: 'Dakar', dateDepart: '2026-01-25', dateRetour: '2026-01-30', status: 'pending', agent: 'Paul Martin', bureau: 'DSI', budgetPrevu: 1_200_000 },
  { id: 'MIS004', objet: 'Audit chantier Bouaké', destination: 'Bouaké', dateDepart: '2026-01-10', dateRetour: '2026-01-12', status: 'completed', agent: 'Sophie Diallo', bureau: 'QHSE', budgetPrevu: 350_000, fraisReels: 320_000 },
  { id: 'MIS005', objet: 'Visite client Man', destination: 'Man', dateDepart: '2026-01-18', dateRetour: '2026-01-19', status: 'in_progress', agent: 'Kouadio Yao', bureau: 'COM', budgetPrevu: 200_000 },
];

export const missionsApiService = {
  async getAll(filter?: MissionFilter, sortBy?: string, page = 1, limit = 20): Promise<{
    data: Mission[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await delay(300);
    let data = [...mockMissions];
    if (filter?.status) data = data.filter(m => m.status === filter.status);
    if (filter?.destination) data = data.filter(m => m.destination.toLowerCase().includes(filter.destination!.toLowerCase()));
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      data = data.filter(m => m.id.toLowerCase().includes(q) || m.objet.toLowerCase().includes(q) || m.agent.toLowerCase().includes(q) || m.destination.toLowerCase().includes(q));
    }
    if (sortBy === 'date') data.sort((a, b) => new Date(b.dateDepart).getTime() - new Date(a.dateDepart).getTime());
    else if (sortBy === 'budget') data.sort((a, b) => b.budgetPrevu - a.budgetPrevu);
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },

  async getById(id: string): Promise<Mission | undefined> {
    await delay(200);
    return mockMissions.find(m => m.id === id);
  },

  async getStats(): Promise<MissionsStats> {
    await delay(250);
    const data = mockMissions;
    const pending = data.filter(m => m.status === 'pending').length;
    const approved = data.filter(m => m.status === 'approved').length;
    const in_progress = data.filter(m => m.status === 'in_progress').length;
    const completed = data.filter(m => m.status === 'completed').length;
    const cancelled = data.filter(m => m.status === 'cancelled').length;
    const budgetTotal = data.reduce((acc, m) => acc + m.budgetPrevu, 0);
    const fraisTotal = data.reduce((acc, m) => acc + (m.fraisReels || 0), 0);
    const byDestination: Record<string, number> = {};
    data.forEach(m => { byDestination[m.destination] = (byDestination[m.destination] || 0) + 1; });
    return { total: data.length, pending, approved, in_progress, completed, cancelled, budgetTotal, fraisTotal, byDestination, ts: new Date().toISOString() };
  },

  formatMontant,

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { pending: 'En attente', approved: 'Approuvée', in_progress: 'En cours', completed: 'Terminée', cancelled: 'Annulée' };
    return labels[status] || status;
  },

  getStatusColor(status: string): string {
    const colors: Record<string, string> = { pending: 'amber', approved: 'blue', in_progress: 'cyan', completed: 'emerald', cancelled: 'red' };
    return colors[status] || 'slate';
  },
};

