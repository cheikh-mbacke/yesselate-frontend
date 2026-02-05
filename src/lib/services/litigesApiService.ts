/**
 * ====================================================================
 * SERVICE: API Litiges
 * ====================================================================
 */

import type { LitigeFilter } from '@/lib/stores/litigesWorkspaceStore';
import { litiges } from '@/lib/data';

export interface Litige {
  id: string;
  adversaire: string;
  objet: string;
  montant: number;
  exposure: number;
  status: 'active' | 'closed' | 'negotiation' | 'judgment';
  type: string;
  juridiction: string;
  avocat: string;
  prochainRDV?: string;
  dateOuverture: string;
  description?: string;
  risque: 'low' | 'medium' | 'high';
}

export interface LitigesStats {
  total: number;
  active: number;
  closed: number;
  negotiation: number;
  judgment: number;
  totalExposure: number;
  avgExposure: number;
  byType: Record<string, number>;
  byRisk: Record<string, number>;
  prochesAudiences: number;
  ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function formatMontant(montant: number): string {
  if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(1)} Md`;
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(0)} M`;
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
  return montant.toLocaleString('fr-FR');
}

export const litigesApiService = {
  async getAll(filter?: LitigeFilter, sortBy?: string, page = 1, limit = 20): Promise<{
    data: Litige[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await delay(300);
    let data = [...litiges] as unknown as Litige[];

    if (filter?.status) data = data.filter(l => l.status === filter.status);
    if (filter?.type) data = data.filter(l => l.type === filter.type);
    if (filter?.jurisdiction) data = data.filter(l => l.juridiction === filter.jurisdiction);
    if (filter?.minExposure) data = data.filter(l => l.exposure >= filter.minExposure!);
    if (filter?.maxExposure) data = data.filter(l => l.exposure <= filter.maxExposure!);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      data = data.filter(l => l.id.toLowerCase().includes(q) || l.adversaire.toLowerCase().includes(q) || l.objet.toLowerCase().includes(q));
    }

    if (sortBy === 'exposure') data.sort((a, b) => b.exposure - a.exposure);
    else if (sortBy === 'date') data.sort((a, b) => new Date(b.dateOuverture || '').getTime() - new Date(a.dateOuverture || '').getTime());
    else if (sortBy === 'risk') {
      const order = { high: 0, medium: 1, low: 2 };
      data.sort((a, b) => order[a.risque || 'low'] - order[b.risque || 'low']);
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },

  async getById(id: string): Promise<Litige | undefined> {
    await delay(200);
    return litiges.find(l => l.id === id) as unknown as Litige | undefined;
  },

  async getStats(): Promise<LitigesStats> {
    await delay(250);
    const data = litiges as unknown as Litige[];
    const active = data.filter(l => l.status === 'active').length;
    const closed = data.filter(l => l.status === 'closed').length;
    const negotiation = data.filter(l => l.status === 'negotiation').length;
    const judgment = data.filter(l => l.status === 'judgment').length;
    const totalExposure = data.reduce((acc, l) => acc + (l.exposure || 0), 0);

    const byType: Record<string, number> = {};
    const byRisk: Record<string, number> = {};
    data.forEach(l => {
      byType[l.type] = (byType[l.type] || 0) + 1;
      if (l.risque) byRisk[l.risque] = (byRisk[l.risque] || 0) + 1;
    });

    return {
      total: data.length,
      active,
      closed,
      negotiation,
      judgment,
      totalExposure,
      avgExposure: data.length > 0 ? totalExposure / data.length : 0,
      byType,
      byRisk,
      prochesAudiences: data.filter(l => l.prochainRDV).length,
      ts: new Date().toISOString(),
    };
  },

  formatMontant,

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { active: 'Actif', closed: 'Clos', negotiation: 'En négociation', judgment: 'Jugement rendu' };
    return labels[status] || status;
  },

  getRiskColor(risk: string): string {
    const colors: Record<string, string> = { high: 'red', medium: 'amber', low: 'emerald' };
    return colors[risk] || 'slate';
  },
};

