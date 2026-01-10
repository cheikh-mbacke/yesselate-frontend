/**
 * Données mock pour le développement
 * À remplacer par de vraies données API en production
 */

import type { Project, Risk, Alert, Decision, Escalation, KPI } from '@/lib/services/governanceService';

// ═══════════════════════════════════════════════════════════════════════════
// PROJETS
// ═══════════════════════════════════════════════════════════════════════════

export const mockProjects: Project[] = [
  {
    id: '1',
    reference: 'PRJ-2024-001',
    name: 'Tours Horizon - Phase 2',
    description: 'Construction de 2 tours de bureaux de 150m de hauteur',
    status: 'active',
    healthStatus: 'at-risk',
    progress: 45,
    budget: 12500000,
    budgetConsumed: 6200000,
    startDate: '2024-01-15',
    endDate: '2026-12-31',
    manager: 'Martin Dupont',
    team: ['Sophie Bernard', 'Pierre Durand', 'Marie Martin'],
    alerts: 3,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2026-01-10T15:30:00Z',
  },
  {
    id: '2',
    reference: 'PRJ-2024-002',
    name: 'Centre Commercial Atlantis',
    description: 'Rénovation et extension d\'un centre commercial',
    status: 'active',
    healthStatus: 'on-track',
    progress: 72,
    budget: 8200000,
    budgetConsumed: 5900000,
    startDate: '2024-03-01',
    endDate: '2026-06-30',
    manager: 'Sophie Bernard',
    team: ['Jean Moreau', 'Claire Petit'],
    alerts: 0,
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2026-01-10T14:20:00Z',
  },
  {
    id: '3',
    reference: 'PRJ-2024-003',
    name: 'Résidence Les Jardins',
    description: 'Construction de 120 logements sociaux',
    status: 'active',
    healthStatus: 'late',
    progress: 28,
    budget: 5800000,
    budgetConsumed: 2100000,
    startDate: '2024-06-01',
    endDate: '2026-02-28',
    manager: 'Jean Moreau',
    team: ['Thomas Richard', 'Marie Martin'],
    alerts: 5,
    createdAt: '2024-05-15T11:00:00Z',
    updatedAt: '2026-01-10T16:45:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// RISQUES
// ═══════════════════════════════════════════════════════════════════════════

export const mockRisks: Risk[] = [
  {
    id: '1',
    reference: 'RSK-001',
    title: 'Retard approvisionnement acier',
    description: 'Risque de retard de 3 semaines sur la livraison d\'acier structurel',
    projectId: '1',
    probability: 'high',
    impact: 'major',
    status: 'mitigating',
    owner: 'Responsable Achats',
    mitigationPlan: 'Diversification des fournisseurs, commande anticipée',
    dueDate: '2026-01-20',
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2026-01-10T14:30:00Z',
  },
  {
    id: '2',
    reference: 'RSK-002',
    title: 'Conditions météo défavorables Q1',
    description: 'Intempéries prévues pouvant impacter les travaux extérieurs',
    probability: 'medium',
    impact: 'moderate',
    status: 'monitoring',
    owner: 'Direction Opérationnelle',
    mitigationPlan: 'Planning de repli, travaux intérieurs prioritaires',
    dueDate: '2026-02-28',
    createdAt: '2025-11-20T09:00:00Z',
    updatedAt: '2026-01-09T11:20:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ALERTES
// ═══════════════════════════════════════════════════════════════════════════

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    category: 'budget',
    title: 'Dépassement budget lot 4',
    description: 'Le budget du lot 4 a dépassé le seuil d\'alerte de 15%',
    source: 'Système Finance',
    projectId: '1',
    assignee: 'Jean Dupont',
    status: 'new',
    isRead: false,
    createdAt: '2026-01-10T14:30:00Z',
  },
  {
    id: '2',
    type: 'critical',
    category: 'quality',
    title: 'Non-conformité détectée',
    description: 'Écart constaté lors du contrôle qualité béton B35',
    source: 'Contrôle Qualité',
    projectId: '3',
    status: 'acknowledged',
    isRead: false,
    createdAt: '2026-01-10T13:45:00Z',
  },
  {
    id: '3',
    type: 'warning',
    category: 'deadline',
    title: 'Retard validation BC #2847',
    description: 'Le bon de commande est en attente de validation depuis 5 jours',
    source: 'Workflow',
    projectId: '2',
    assignee: 'Marie Martin',
    status: 'in-progress',
    isRead: true,
    createdAt: '2026-01-10T10:20:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DÉCISIONS
// ═══════════════════════════════════════════════════════════════════════════

export const mockDecisions: Decision[] = [
  {
    id: '1',
    reference: 'DEC-2024-089',
    subject: 'Validation avenant budget lot 3',
    description: 'Demande d\'augmentation du budget de 200k€ pour le lot 3',
    requestedBy: 'Chef de projet',
    projectId: '1',
    type: 'budget',
    impact: 'high',
    deadline: '2026-01-12',
    status: 'pending',
    comments: [],
    createdAt: '2026-01-08T09:00:00Z',
  },
  {
    id: '2',
    reference: 'DEC-2024-090',
    subject: 'Prolongation délai phase 2',
    description: 'Demande de prolongation de 2 semaines',
    requestedBy: 'Conducteur travaux',
    projectId: '2',
    type: 'planning',
    impact: 'medium',
    deadline: '2026-01-14',
    status: 'in-review',
    comments: [],
    createdAt: '2026-01-09T11:30:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ESCALADES
// ═══════════════════════════════════════════════════════════════════════════

export const mockEscalations: Escalation[] = [
  {
    id: '1',
    reference: 'ESC-001',
    subject: 'Retard livraison matériaux site B',
    description: 'Retard de 10 jours sur la livraison critique',
    level: 2,
    urgency: 'high',
    sourceType: 'project',
    sourceId: '1',
    escalatedBy: 'Chef de projet',
    escalatedTo: 'Direction Opérationnelle',
    status: 'in-progress',
    createdAt: '2026-01-05T14:00:00Z',
  },
  {
    id: '2',
    reference: 'ESC-002',
    subject: 'Non-conformité qualité béton',
    description: 'Problème qualité nécessitant intervention direction',
    level: 3,
    urgency: 'critical',
    sourceType: 'risk',
    sourceId: '1',
    escalatedBy: 'Responsable Qualité',
    escalatedTo: 'Direction Générale',
    status: 'new',
    createdAt: '2026-01-08T16:30:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// KPIs
// ═══════════════════════════════════════════════════════════════════════════

export const mockKPIs: KPI[] = [
  {
    id: 'projects-active',
    label: 'Projets actifs',
    value: 24,
    trend: 'up',
    trendValue: 2,
    status: 'neutral',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'budget-consumed',
    label: 'Budget consommé',
    value: '67%',
    trend: 'stable',
    status: 'success',
    sparkline: [45, 52, 58, 61, 63, 65, 67],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'milestones-late',
    label: 'Jalons en retard',
    value: 5,
    trend: 'down',
    trendValue: -2,
    status: 'warning',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'risks-critical',
    label: 'Risques critiques',
    value: 3,
    trend: 'up',
    trendValue: 1,
    status: 'critical',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'validations-pending',
    label: 'Validations en attente',
    value: 12,
    trend: 'stable',
    status: 'warning',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'resources-utilization',
    label: 'Taux utilisation',
    value: '84%',
    unit: '%',
    trend: 'up',
    trendValue: 3,
    status: 'success',
    sparkline: [72, 75, 78, 80, 82, 83, 84],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'alerts-unread',
    label: 'Alertes non lues',
    value: 8,
    trend: 'down',
    trendValue: -5,
    status: 'neutral',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sla-compliance',
    label: 'Conformité SLA',
    value: '96%',
    unit: '%',
    trend: 'stable',
    status: 'success',
    lastUpdated: new Date().toISOString(),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getMockProject(id: string): Project | undefined {
  return mockProjects.find(p => p.id === id);
}

export function getMockRisk(id: string): Risk | undefined {
  return mockRisks.find(r => r.id === id);
}

export function getMockAlert(id: string): Alert | undefined {
  return mockAlerts.find(a => a.id === id);
}

export function getMockDecision(id: string): Decision | undefined {
  return mockDecisions.find(d => d.id === id);
}

export function getMockEscalation(id: string): Escalation | undefined {
  return mockEscalations.find(e => e.id === id);
}

/**
 * Simule un délai d'API
 */
export function delay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simule une réponse paginée
 */
export function mockPaginatedResponse<T>(
  data: T[],
  page: number = 1,
  pageSize: number = 10
) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = data.slice(start, end);

  return {
    data: items,
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize),
  };
}

