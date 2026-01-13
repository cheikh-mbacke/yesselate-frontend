/**
 * ====================================================================
 * SERVICE: API Projets en Cours
 * ====================================================================
 */

import type { ProjetFilter } from '@/lib/stores/projetsWorkspaceStore';
import { projects } from '@/lib/data';

export interface Projet {
  id: string;
  name: string;
  client: string;
  bureau: string;
  status: 'active' | 'completed' | 'blocked' | 'pending';
  progress: number;
  budget: string;
  spent: string;
  team: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  risks?: { level: 'low' | 'medium' | 'high'; description: string }[];
  milestones?: { name: string; date: string; completed: boolean }[];
}

export interface ProjetsStats {
  total: number;
  active: number;
  completed: number;
  blocked: number;
  pending: number;
  avgProgress: number;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  totalTeam: number;
  ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function parseMontant(value: string): number {
  const cleaned = value.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) * 1000000;
}

function formatMontant(montant: number): string {
  if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(1)} Md`;
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(0)} M`;
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
  return montant.toLocaleString('fr-FR');
}

export const projetsApiService = {
  async getAll(filter?: ProjetFilter, sortBy?: string, page = 1, limit = 12): Promise<{
    data: Projet[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await delay(300);
    let data = [...projects] as Projet[];

    if (filter?.status) data = data.filter(p => p.status === filter.status);
    if (filter?.bureau) data = data.filter(p => p.bureau === filter.bureau);
    if (filter?.client) data = data.filter(p => p.client.toLowerCase().includes(filter.client!.toLowerCase()));
    if (filter?.minProgress !== undefined) data = data.filter(p => p.progress >= filter.minProgress!);
    if (filter?.maxProgress !== undefined) data = data.filter(p => p.progress <= filter.maxProgress!);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      data = data.filter(p => p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q));
    }

    if (sortBy === 'progress') data.sort((a, b) => b.progress - a.progress);
    else if (sortBy === 'budget') data.sort((a, b) => parseMontant(b.budget) - parseMontant(a.budget));
    else if (sortBy === 'status') {
      const order = { blocked: 0, active: 1, pending: 2, completed: 3 };
      data.sort((a, b) => order[a.status] - order[b.status]);
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },

  async getById(id: string): Promise<Projet | undefined> {
    await delay(200);
    return projects.find(p => p.id === id) as Projet | undefined;
  },

  async getStats(): Promise<ProjetsStats> {
    await delay(250);
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const blocked = projects.filter(p => p.status === 'blocked').length;
    const pending = projects.filter(p => p.status === 'pending').length;
    const avgProgress = Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length);
    const totalBudget = projects.reduce((a, p) => a + parseMontant(p.budget), 0);
    const totalSpent = projects.reduce((a, p) => a + parseMontant(p.spent), 0);
    const totalTeam = projects.reduce((a, p) => a + p.team, 0);

    return {
      total: projects.length,
      active,
      completed,
      blocked,
      pending,
      avgProgress,
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      totalTeam,
      ts: new Date().toISOString(),
    };
  },

  formatMontant,

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'En cours',
      completed: 'Terminé',
      blocked: 'Bloqué',
      pending: 'En attente',
    };
    return labels[status] || status;
  },

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'amber',
      completed: 'emerald',
      blocked: 'red',
      pending: 'slate',
    };
    return colors[status] || 'slate';
  },

  getProgressColor(progress: number): string {
    if (progress >= 90) return 'emerald';
    if (progress >= 50) return 'amber';
    return 'orange';
  },
};

