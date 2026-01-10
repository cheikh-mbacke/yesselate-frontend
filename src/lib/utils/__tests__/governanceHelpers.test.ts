/**
 * Tests unitaires pour les helpers de gouvernance
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateProjectHealth,
  calculateRiskCriticality,
  isAlertUrgent,
  formatCurrency,
  formatRelativeDate,
  formatShortDate,
  formatPercentage,
  filterProjects,
  sortProjects,
  isOverdue,
  daysUntilDue,
  isUrgent,
  calculatePortfolioStats,
  groupRisksByCriticality,
} from '@/lib/utils/governanceHelpers';

import type { Project, Risk, Alert } from '@/lib/services/governanceService';

// ═══════════════════════════════════════════════════════════════════════════
// CALCULS DE STATUT
// ═══════════════════════════════════════════════════════════════════════════

describe('calculateProjectHealth', () => {
  it('devrait retourner on-track pour un projet sain', () => {
    const project: Project = {
      id: '1',
      reference: 'PRJ-001',
      name: 'Test Project',
      status: 'active',
      healthStatus: 'on-track',
      progress: 50,
      budget: 100000,
      budgetConsumed: 45000,
      startDate: '2024-01-01',
      endDate: '2026-12-31',
      manager: 'Test Manager',
      team: [],
      alerts: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    expect(calculateProjectHealth(project)).toBe('on-track');
  });

  it('devrait retourner at-risk pour un projet avec dépassement budget', () => {
    const project: Project = {
      id: '1',
      reference: 'PRJ-001',
      name: 'Test Project',
      status: 'active',
      healthStatus: 'on-track',
      progress: 40,
      budget: 100000,
      budgetConsumed: 60000, // 60% consommé pour 40% d'avancement
      startDate: '2024-01-01',
      endDate: '2026-12-31',
      manager: 'Test Manager',
      team: [],
      alerts: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    expect(calculateProjectHealth(project)).toBe('at-risk');
  });

  it('devrait retourner late pour un projet très en retard', () => {
    const project: Project = {
      id: '1',
      reference: 'PRJ-001',
      name: 'Test Project',
      status: 'active',
      healthStatus: 'on-track',
      progress: 20, // Très en retard
      budget: 100000,
      budgetConsumed: 50000,
      startDate: '2023-01-01', // Projet commencé il y a 2 ans
      endDate: '2026-12-31',
      manager: 'Test Manager',
      team: [],
      alerts: 8, // Beaucoup d'alertes
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    expect(calculateProjectHealth(project)).toBe('late');
  });
});

describe('calculateRiskCriticality', () => {
  it('devrait calculer correctement la criticité faible', () => {
    const risk: Risk = {
      id: '1',
      reference: 'RSK-001',
      title: 'Test Risk',
      description: 'Test',
      probability: 'low',
      impact: 'minor',
      status: 'identified',
      owner: 'Test Owner',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    expect(calculateRiskCriticality(risk)).toBe(1); // 1 × 1
  });

  it('devrait calculer correctement la criticité critique', () => {
    const risk: Risk = {
      id: '1',
      reference: 'RSK-001',
      title: 'Test Risk',
      description: 'Test',
      probability: 'high',
      impact: 'critical',
      status: 'identified',
      owner: 'Test Owner',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    expect(calculateRiskCriticality(risk)).toBe(12); // 3 × 4
  });
});

describe('isAlertUrgent', () => {
  it('devrait identifier une alerte critique comme urgente', () => {
    const alert: Alert = {
      id: '1',
      type: 'critical',
      category: 'budget',
      title: 'Test Alert',
      description: 'Test',
      source: 'System',
      status: 'new',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    expect(isAlertUrgent(alert)).toBe(true);
  });

  it('devrait identifier une alerte ancienne comme urgente', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);

    const alert: Alert = {
      id: '1',
      type: 'warning',
      category: 'project',
      title: 'Test Alert',
      description: 'Test',
      source: 'System',
      status: 'new',
      isRead: false,
      createdAt: yesterday.toISOString(),
    };

    expect(isAlertUrgent(alert)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FORMATAGE
// ═══════════════════════════════════════════════════════════════════════════

describe('formatCurrency', () => {
  it('devrait formater correctement un montant en euros', () => {
    expect(formatCurrency(1234567)).toBe('1 234 567 €');
  });

  it('devrait gérer les montants négatifs', () => {
    expect(formatCurrency(-1000)).toBe('-1 000 €');
  });
});

describe('formatPercentage', () => {
  it('devrait formater un pourcentage sans décimales', () => {
    expect(formatPercentage(45.678)).toBe('45%');
  });

  it('devrait formater un pourcentage avec décimales', () => {
    expect(formatPercentage(45.678, 2)).toBe('45.68%');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FILTRAGE ET TRI
// ═══════════════════════════════════════════════════════════════════════════

describe('filterProjects', () => {
  const projects: Project[] = [
    {
      id: '1',
      reference: 'PRJ-001',
      name: 'Alpha Project',
      status: 'active',
      healthStatus: 'on-track',
      progress: 50,
      budget: 100000,
      budgetConsumed: 45000,
      startDate: '2024-01-01',
      endDate: '2026-12-31',
      manager: 'Manager A',
      team: [],
      alerts: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      reference: 'PRJ-002',
      name: 'Beta Project',
      status: 'on-hold',
      healthStatus: 'at-risk',
      progress: 30,
      budget: 200000,
      budgetConsumed: 80000,
      startDate: '2024-01-01',
      endDate: '2026-12-31',
      manager: 'Manager B',
      team: [],
      alerts: 3,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  it('devrait filtrer par statut', () => {
    const filtered = filterProjects(projects, { status: ['active'] });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('devrait filtrer par healthStatus', () => {
    const filtered = filterProjects(projects, { healthStatus: ['at-risk'] });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('devrait filtrer par recherche textuelle', () => {
    const filtered = filterProjects(projects, { search: 'alpha' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });
});

describe('sortProjects', () => {
  const projects: Project[] = [
    {
      id: '1',
      reference: 'PRJ-001',
      name: 'Zebra Project',
      status: 'active',
      healthStatus: 'on-track',
      progress: 30,
      budget: 100000,
      budgetConsumed: 30000,
      startDate: '2024-01-01',
      endDate: '2026-12-31',
      manager: 'Manager A',
      team: [],
      alerts: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      reference: 'PRJ-002',
      name: 'Alpha Project',
      status: 'active',
      healthStatus: 'at-risk',
      progress: 60,
      budget: 100000,
      budgetConsumed: 60000,
      startDate: '2024-01-01',
      endDate: '2026-06-30',
      manager: 'Manager B',
      team: [],
      alerts: 3,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  it('devrait trier par nom croissant', () => {
    const sorted = sortProjects(projects, 'name', 'asc');
    expect(sorted[0].name).toBe('Alpha Project');
    expect(sorted[1].name).toBe('Zebra Project');
  });

  it('devrait trier par progression décroissant', () => {
    const sorted = sortProjects(projects, 'progress', 'desc');
    expect(sorted[0].progress).toBe(60);
    expect(sorted[1].progress).toBe(30);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

describe('isOverdue', () => {
  it('devrait détecter une date dépassée', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    expect(isOverdue(pastDate.toISOString())).toBe(true);
  });

  it('devrait détecter une date future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    expect(isOverdue(futureDate.toISOString())).toBe(false);
  });
});

describe('isUrgent', () => {
  it('devrait identifier une échéance urgente (< 3 jours)', () => {
    const urgentDate = new Date();
    urgentDate.setDate(urgentDate.getDate() + 2);
    expect(isUrgent(urgentDate.toISOString())).toBe(true);
  });

  it('devrait identifier une échéance non urgente', () => {
    const normalDate = new Date();
    normalDate.setDate(normalDate.getDate() + 10);
    expect(isUrgent(normalDate.toISOString())).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AGRÉGATION
// ═══════════════════════════════════════════════════════════════════════════

describe('calculatePortfolioStats', () => {
  const projects: Project[] = [
    {
      id: '1',
      reference: 'PRJ-001',
      name: 'Project 1',
      status: 'active',
      healthStatus: 'on-track',
      progress: 50,
      budget: 100000,
      budgetConsumed: 45000,
      startDate: '2024-01-01',
      endDate: '2026-12-31',
      manager: 'Manager A',
      team: [],
      alerts: 2,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      reference: 'PRJ-002',
      name: 'Project 2',
      status: 'active',
      healthStatus: 'at-risk',
      progress: 30,
      budget: 200000,
      budgetConsumed: 80000,
      startDate: '2024-01-01',
      endDate: '2026-12-31',
      manager: 'Manager B',
      team: [],
      alerts: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  it('devrait calculer les stats correctement', () => {
    const stats = calculatePortfolioStats(projects);

    expect(stats.totalProjects).toBe(2);
    expect(stats.totalBudget).toBe(300000);
    expect(stats.totalConsumed).toBe(125000);
    expect(stats.avgProgress).toBe(40); // (50 + 30) / 2
    expect(stats.totalAlerts).toBe(7); // 2 + 5
    expect(stats.byHealthStatus['on-track']).toBe(1);
    expect(stats.byHealthStatus['at-risk']).toBe(1);
  });
});

describe('groupRisksByCriticality', () => {
  const risks: Risk[] = [
    {
      id: '1',
      reference: 'RSK-001',
      title: 'Low Risk',
      description: 'Test',
      probability: 'low',
      impact: 'minor',
      status: 'identified',
      owner: 'Owner',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      reference: 'RSK-002',
      title: 'Critical Risk',
      description: 'Test',
      probability: 'high',
      impact: 'critical',
      status: 'identified',
      owner: 'Owner',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  it('devrait grouper les risques correctement', () => {
    const grouped = groupRisksByCriticality(risks);

    expect(grouped.low).toHaveLength(1);
    expect(grouped.critical).toHaveLength(1);
    expect(grouped.medium).toHaveLength(0);
  });
});

