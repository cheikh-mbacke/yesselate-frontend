/**
 * Mock Data - Analytics
 * Données pour les graphiques et tableaux de bord
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

export interface CategoryData {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  current: number;
  target: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export interface BureauComparison {
  bureau: string;
  projects: number;
  completed: number;
  delayed: number;
  budget: number;
  budgetUsed: number;
  onTimeRate: number;
  qualityScore: number;
}

export interface MonthlyProgress {
  month: string;
  planned: number;
  actual: number;
  cumulative: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

// Évolution mensuelle des projets
export const mockProjectEvolution: TimeSeriesPoint[] = [
  { date: '2025-07', value: 48, label: 'Juillet 2025' },
  { date: '2025-08', value: 50, label: 'Août 2025' },
  { date: '2025-09', value: 52, label: 'Septembre 2025' },
  { date: '2025-10', value: 54, label: 'Octobre 2025' },
  { date: '2025-11', value: 55, label: 'Novembre 2025' },
  { date: '2025-12', value: 56, label: 'Décembre 2025' },
  { date: '2026-01', value: 58, label: 'Janvier 2026' },
];

// Évolution du budget consommé
export const mockBudgetEvolution: TimeSeriesPoint[] = [
  { date: '2025-07', value: 18500000000 },
  { date: '2025-08', value: 20200000000 },
  { date: '2025-09', value: 22100000000 },
  { date: '2025-10', value: 24500000000 },
  { date: '2025-11', value: 27000000000 },
  { date: '2025-12', value: 28800000000 },
  { date: '2026-01', value: 30150000000 },
];

// Répartition par statut
export const mockStatusDistribution: CategoryData[] = [
  { name: 'En cours', value: 28, color: '#10b981', percentage: 48.3 },
  { name: 'Terminés', value: 15, color: '#6b7280', percentage: 25.9 },
  { name: 'Planification', value: 8, color: '#3b82f6', percentage: 13.8 },
  { name: 'En retard', value: 5, color: '#ef4444', percentage: 8.6 },
  { name: 'Suspendus', value: 2, color: '#f59e0b', percentage: 3.4 },
];

// Répartition par type
export const mockTypeDistribution: CategoryData[] = [
  { name: 'Infrastructure', value: 24, color: '#3b82f6', percentage: 41.4 },
  { name: 'Bâtiment', value: 18, color: '#8b5cf6', percentage: 31.0 },
  { name: 'Ouvrage d\'art', value: 8, color: '#06b6d4', percentage: 13.8 },
  { name: 'Aménagement', value: 8, color: '#f97316', percentage: 13.8 },
];

// Répartition par priorité
export const mockPriorityDistribution: CategoryData[] = [
  { name: 'Haute', value: 22, color: '#ef4444', percentage: 37.9 },
  { name: 'Moyenne', value: 28, color: '#f59e0b', percentage: 48.3 },
  { name: 'Basse', value: 8, color: '#6b7280', percentage: 13.8 },
];

// Comparaison par bureau
export const mockBureauComparison: BureauComparison[] = [
  {
    bureau: 'BF',
    projects: 22,
    completed: 8,
    delayed: 2,
    budget: 18500000000,
    budgetUsed: 12400000000,
    onTimeRate: 91,
    qualityScore: 94,
  },
  {
    bureau: 'BM',
    projects: 18,
    completed: 5,
    delayed: 2,
    budget: 15200000000,
    budgetUsed: 9800000000,
    onTimeRate: 83,
    qualityScore: 92,
  },
  {
    bureau: 'BJ',
    projects: 12,
    completed: 2,
    delayed: 1,
    budget: 8200000000,
    budgetUsed: 5600000000,
    onTimeRate: 88,
    qualityScore: 91,
  },
  {
    bureau: 'BCT',
    projects: 6,
    completed: 0,
    delayed: 0,
    budget: 3100000000,
    budgetUsed: 2350000000,
    onTimeRate: 95,
    qualityScore: 93,
  },
];

// KPIs de performance
export const mockPerformanceMetrics: PerformanceMetric[] = [
  {
    id: 'on-time',
    name: 'Livraison à temps',
    current: 85,
    target: 90,
    previous: 82,
    trend: 'up',
    unit: '%',
    status: 'warning',
  },
  {
    id: 'budget-variance',
    name: 'Variance budget',
    current: -4.2,
    target: 0,
    previous: -5.8,
    trend: 'up',
    unit: '%',
    status: 'warning',
  },
  {
    id: 'quality-score',
    name: 'Score qualité',
    current: 92,
    target: 95,
    previous: 90,
    trend: 'up',
    unit: '%',
    status: 'good',
  },
  {
    id: 'client-satisfaction',
    name: 'Satisfaction client',
    current: 88,
    target: 90,
    previous: 86,
    trend: 'up',
    unit: '%',
    status: 'warning',
  },
  {
    id: 'team-utilization',
    name: 'Utilisation équipes',
    current: 78,
    target: 85,
    previous: 75,
    trend: 'up',
    unit: '%',
    status: 'warning',
  },
  {
    id: 'risk-index',
    name: 'Indice de risque',
    current: 2.3,
    target: 2.0,
    previous: 2.5,
    trend: 'up',
    unit: '/5',
    status: 'warning',
  },
];

// Progression mensuelle globale
export const mockMonthlyProgress: MonthlyProgress[] = [
  { month: 'Jan 2026', planned: 15, actual: 14, cumulative: 14 },
  { month: 'Fév 2026', planned: 18, actual: 0, cumulative: 14 },
  { month: 'Mar 2026', planned: 22, actual: 0, cumulative: 14 },
  { month: 'Avr 2026', planned: 25, actual: 0, cumulative: 14 },
  { month: 'Mai 2026', planned: 28, actual: 0, cumulative: 14 },
  { month: 'Juin 2026', planned: 32, actual: 0, cumulative: 14 },
];

// Taux de complétion par phase
export const mockPhaseCompletion: CategoryData[] = [
  { name: 'Conception', value: 95, color: '#10b981' },
  { name: 'Estimation', value: 88, color: '#3b82f6' },
  { name: 'Validation', value: 82, color: '#8b5cf6' },
  { name: 'Exécution', value: 45, color: '#f59e0b' },
  { name: 'Tests', value: 12, color: '#06b6d4' },
  { name: 'Clôture', value: 8, color: '#6b7280' },
];

// Risques par catégorie
export const mockRiskDistribution: CategoryData[] = [
  { name: 'Technique', value: 12, color: '#3b82f6' },
  { name: 'Financier', value: 8, color: '#f59e0b' },
  { name: 'Planning', value: 15, color: '#ef4444' },
  { name: 'Ressources', value: 6, color: '#8b5cf6' },
  { name: 'Externe', value: 9, color: '#6b7280' },
];

// Top 5 projets par budget
export const mockTopProjectsByBudget = [
  { id: 'PRJ-014', title: 'Barrage Hydroélectrique Niger', budget: 12000000000 },
  { id: 'PRJ-011', title: 'Campus Universitaire Ouagadougou', budget: 8500000000 },
  { id: 'PRJ-012', title: 'Extension Port de Lomé', budget: 6200000000 },
  { id: 'PRJ-007', title: 'Aéroport Régional Bobo-Dioulasso', budget: 5200000000 },
  { id: 'PRJ-001', title: 'Route Nationale RN7 - Tronçon Est', budget: 4750000000 },
];

// Alertes actives
export const mockActiveAlerts = [
  { id: 'ALT-001', type: 'critical', project: 'PRJ-002', message: 'Retard critique - Pont de Kaolack', date: '2026-01-09' },
  { id: 'ALT-002', type: 'warning', project: 'PRJ-008', message: 'Problèmes fonciers - Parc Industriel', date: '2026-01-08' },
  { id: 'ALT-003', type: 'warning', project: 'PRJ-001', message: 'Budget matériaux à 87%', date: '2026-01-08' },
  { id: 'ALT-004', type: 'info', project: 'PRJ-007', message: 'Terrassement phase 1 terminé', date: '2026-01-08' },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const getMetricById = (id: string): PerformanceMetric | undefined => {
  return mockPerformanceMetrics.find((m) => m.id === id);
};

export const getMetricsByStatus = (status: PerformanceMetric['status']): PerformanceMetric[] => {
  return mockPerformanceMetrics.filter((m) => m.status === status);
};

export const getBureauData = (bureau: string): BureauComparison | undefined => {
  return mockBureauComparison.find((b) => b.bureau === bureau);
};

export const getLatestEvolutionPoint = (): TimeSeriesPoint => {
  return mockProjectEvolution[mockProjectEvolution.length - 1];
};

export const calculateTotalByCategory = (data: CategoryData[]): number => {
  return data.reduce((sum, item) => sum + item.value, 0);
};

