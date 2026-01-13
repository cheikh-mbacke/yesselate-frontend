/**
 * ====================================================================
 * SERVICE: API Évaluations RH
 * ====================================================================
 */

import type { Evaluation, EvaluationStatus } from '@/lib/types/bmo.types';
import { evaluations } from '@/lib/data';

// ============================================
// Types
// ============================================

export interface EvaluationsFilters {
  status?: EvaluationStatus | EvaluationStatus[];
  bureau?: string | string[];
  period?: string | string[];
  scoreMin?: number;
  scoreMax?: number;
  search?: string;
  pendingRecommendations?: boolean;
  dueSoon?: boolean;
  overdue?: boolean;
  evaluatorId?: string;
  employeeId?: string;
}

export interface EvaluationsStats {
  total: number;
  completed: number;
  scheduled: number;
  inProgress: number;
  cancelled: number;
  avgScore: number;
  excellent: number; // >= 90
  bon: number; // 75-89
  moyen: number; // 60-74
  ameliorer: number; // < 75
  pendingRecsTotal: number;
  overdueScheduled: number;
  dueSoon: number;
  byBureau: Record<string, number>;
  byPeriod: Record<string, number>;
  byEvaluator: Record<string, number>;
  ts: string;
}

export interface EvaluationsSortOptions {
  field: 'date' | 'score' | 'employeeName' | 'evaluatorName' | 'pendingRecs';
  direction: 'asc' | 'desc';
}

// ============================================
// Helpers
// ============================================

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const parseFRDateToMs = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const m = String(dateStr).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return 0;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
};

const daysUntil = (dateStr?: string): number | null => {
  const ms = parseFRDateToMs(dateStr);
  if (!ms) return null;
  const now = Date.now();
  return Math.ceil((ms - now) / (1000 * 60 * 60 * 24));
};

// ============================================
// API Service
// ============================================

export const evaluationsApiService = {
  /**
   * Récupérer toutes les évaluations avec filtres et tri
   */
  async getAll(
    filters?: EvaluationsFilters,
    sortOptions?: EvaluationsSortOptions,
    page = 1,
    limit = 20
  ): Promise<{ data: Evaluation[]; total: number; page: number; totalPages: number }> {
    await delay(300); // Simuler latence API

    let data: Evaluation[] = [...evaluations];

    // Appliquer les filtres
    if (filters) {
      // Filtre par statut
      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        data = data.filter(e => statuses.includes(e.status));
      }

      // Filtre par bureau
      if (filters.bureau) {
        const bureaux = Array.isArray(filters.bureau) ? filters.bureau : [filters.bureau];
        data = data.filter(e => bureaux.includes(e.bureau));
      }

      // Filtre par période
      if (filters.period) {
        const periods = Array.isArray(filters.period) ? filters.period : [filters.period];
        data = data.filter(e => periods.includes(e.period));
      }

      // Filtre par score
      if (filters.scoreMin !== undefined) {
        data = data.filter(e => (e.scoreGlobal || 0) >= filters.scoreMin!);
      }
      if (filters.scoreMax !== undefined) {
        data = data.filter(e => (e.scoreGlobal || 0) <= filters.scoreMax!);
      }

      // Filtre par recommandations en attente
      if (filters.pendingRecommendations) {
        data = data.filter(e => {
          const pending = (e.recommendations || []).filter(r => r.status === 'pending').length;
          return pending > 0;
        });
      }

      // Filtre échéances proches (≤14 jours)
      if (filters.dueSoon) {
        data = data.filter(e => {
          if (e.status !== 'scheduled') return false;
          const days = daysUntil(e.date);
          return typeof days === 'number' && days >= 0 && days <= 14;
        });
      }

      // Filtre échéances en retard
      if (filters.overdue) {
        data = data.filter(e => {
          if (e.status !== 'scheduled') return false;
          const ms = parseFRDateToMs(e.date);
          return ms > 0 && ms < Date.now();
        });
      }

      // Filtre par évaluateur
      if (filters.evaluatorId) {
        data = data.filter(e => e.evaluatorId === filters.evaluatorId);
      }

      // Filtre par employé
      if (filters.employeeId) {
        data = data.filter(e => e.employeeId === filters.employeeId);
      }

      // Recherche textuelle
      if (filters.search) {
        const q = normalize(filters.search);
        data = data.filter(e =>
          normalize(e.employeeName || '').includes(q) ||
          normalize(e.employeeRole || '').includes(q) ||
          normalize(e.evaluatorName || '').includes(q) ||
          normalize(e.period || '').includes(q) ||
          normalize(e.bureau || '').includes(q) ||
          normalize(e.id || '').includes(q)
        );
      }
    }

    // Appliquer le tri
    if (sortOptions) {
      data.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortOptions.field) {
          case 'date':
            aVal = parseFRDateToMs(a.date);
            bVal = parseFRDateToMs(b.date);
            break;
          case 'score':
            aVal = a.scoreGlobal || 0;
            bVal = b.scoreGlobal || 0;
            break;
          case 'employeeName':
            aVal = normalize(a.employeeName || '');
            bVal = normalize(b.employeeName || '');
            break;
          case 'evaluatorName':
            aVal = normalize(a.evaluatorName || '');
            bVal = normalize(b.evaluatorName || '');
            break;
          case 'pendingRecs':
            aVal = (a.recommendations || []).filter(r => r.status === 'pending').length;
            bVal = (b.recommendations || []).filter(r => r.status === 'pending').length;
            break;
          default:
            return 0;
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOptions.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const comparison = aVal.localeCompare(bVal);
          return sortOptions.direction === 'asc' ? comparison : -comparison;
        }
        return 0;
      });
    }

    // Pagination
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedData = data.slice(start, start + limit);

    return {
      data: paginatedData,
      total,
      page,
      totalPages,
    };
  },

  /**
   * Récupérer une évaluation par ID
   */
  async getById(id: string): Promise<Evaluation | undefined> {
    await delay(200);
    return evaluations.find(e => e.id === id);
  },

  /**
   * Créer une nouvelle évaluation
   */
  async create(data: Partial<Evaluation>): Promise<Evaluation> {
    await delay(500);
    
    const newEvaluation: Evaluation = {
      id: `EVAL-${new Date().getFullYear()}-${String(evaluations.length + 1).padStart(4, '0')}`,
      employeeId: data.employeeId || '',
      employeeName: data.employeeName || '',
      employeeRole: data.employeeRole || '',
      bureau: data.bureau || '',
      evaluatorId: data.evaluatorId || '',
      evaluatorName: data.evaluatorName || '',
      date: data.date || new Date().toLocaleDateString('fr-FR'),
      period: data.period || `${new Date().getFullYear()}-Annuel`,
      status: data.status || 'scheduled',
      scoreGlobal: data.scoreGlobal || 0,
      criteria: data.criteria || [],
      strengths: data.strengths || [],
      improvements: data.improvements || [],
      recommendations: data.recommendations || [],
      nextEvaluation: data.nextEvaluation,
      documents: data.documents || [],
      hash: `SHA3-256:eval${Date.now()}...`,
      employeeComment: data.employeeComment,
    };

    evaluations.push(newEvaluation);
    return newEvaluation;
  },

  /**
   * Mettre à jour une évaluation
   */
  async update(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    await delay(400);
    
    const index = evaluations.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Évaluation ${id} non trouvée`);
    }

    evaluations[index] = {
      ...evaluations[index],
      ...updates,
      hash: `SHA3-256:eval${Date.now()}...`, // Re-hash après modification
    };

    return evaluations[index];
  },

  /**
   * Supprimer une évaluation
   */
  async delete(id: string): Promise<void> {
    await delay(300);
    
    const index = evaluations.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Évaluation ${id} non trouvée`);
    }

    evaluations.splice(index, 1);
  },

  /**
   * Valider une recommandation
   */
  async validateRecommendation(evalId: string, recId: string): Promise<Evaluation> {
    await delay(400);
    
    const evaluation = evaluations.find(e => e.id === evalId);
    if (!evaluation) {
      throw new Error(`Évaluation ${evalId} non trouvée`);
    }

    const recommendation = (evaluation.recommendations || []).find(r => r.id === recId);
    if (!recommendation) {
      throw new Error(`Recommandation ${recId} non trouvée`);
    }

    recommendation.status = 'approved';
    recommendation.approvedBy = 'A. DIALLO'; // En production, récupérer depuis le contexte utilisateur
    recommendation.approvedAt = new Date().toLocaleDateString('fr-FR');

    return evaluation;
  },

  /**
   * Obtenir les statistiques
   */
  async getStats(filters?: EvaluationsFilters): Promise<EvaluationsStats> {
    await delay(200);

    let data = [...evaluations];

    // Appliquer les mêmes filtres que getAll
    if (filters?.bureau) {
      const bureaux = Array.isArray(filters.bureau) ? filters.bureau : [filters.bureau];
      data = data.filter(e => bureaux.includes(e.bureau));
    }

    const completed = data.filter(e => e.status === 'completed');
    const scheduled = data.filter(e => e.status === 'scheduled');
    const inProgress = data.filter(e => e.status === 'in_progress');
    const cancelled = data.filter(e => e.status === 'cancelled');

    const avgScore =
      completed.length > 0
        ? Math.round(completed.reduce((acc, e) => acc + (e.scoreGlobal || 0), 0) / completed.length)
        : 0;

    const excellent = completed.filter(e => (e.scoreGlobal || 0) >= 90).length;
    const bon = completed.filter(e => (e.scoreGlobal || 0) >= 75 && (e.scoreGlobal || 0) < 90).length;
    const moyen = completed.filter(e => (e.scoreGlobal || 0) >= 60 && (e.scoreGlobal || 0) < 75).length;
    const ameliorer = completed.filter(e => (e.scoreGlobal || 0) < 75).length;

    const pendingRecsTotal = completed.reduce((acc, e) => {
      const pending = (e.recommendations || []).filter(r => r.status === 'pending').length;
      return acc + pending;
    }, 0);

    const now = Date.now();
    const overdueScheduled = scheduled.filter(e => {
      const ms = parseFRDateToMs(e.date);
      return ms > 0 && ms < now;
    }).length;

    const dueSoon = scheduled.filter(e => {
      const d = daysUntil(e.date);
      return typeof d === 'number' && d >= 0 && d <= 14;
    }).length;

    // Stats par bureau
    const byBureau: Record<string, number> = {};
    data.forEach(e => {
      byBureau[e.bureau] = (byBureau[e.bureau] || 0) + 1;
    });

    // Stats par période
    const byPeriod: Record<string, number> = {};
    data.forEach(e => {
      byPeriod[e.period] = (byPeriod[e.period] || 0) + 1;
    });

    // Stats par évaluateur
    const byEvaluator: Record<string, number> = {};
    data.forEach(e => {
      byEvaluator[e.evaluatorId] = (byEvaluator[e.evaluatorId] || 0) + 1;
    });

    return {
      total: data.length,
      completed: completed.length,
      scheduled: scheduled.length,
      inProgress: inProgress.length,
      cancelled: cancelled.length,
      avgScore,
      excellent,
      bon,
      moyen,
      ameliorer,
      pendingRecsTotal,
      overdueScheduled,
      dueSoon,
      byBureau,
      byPeriod,
      byEvaluator,
      ts: new Date().toISOString(),
    };
  },

  /**
   * Obtenir les bureaux uniques
   */
  async getBureaux(): Promise<string[]> {
    await delay(100);
    const set = new Set<string>();
    evaluations.forEach(e => e.bureau && set.add(e.bureau));
    return Array.from(set).sort((a, b) => normalize(a).localeCompare(normalize(b)));
  },

  /**
   * Obtenir les périodes uniques
   */
  async getPeriods(): Promise<string[]> {
    await delay(100);
    const set = new Set<string>();
    evaluations.forEach(e => e.period && set.add(e.period));
    return Array.from(set).sort((a, b) => normalize(a).localeCompare(normalize(b)));
  },
};

