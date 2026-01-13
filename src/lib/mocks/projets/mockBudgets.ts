/**
 * Mock Data - Budgets
 * Données réalistes pour le suivi financier des projets
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type BudgetCategory = 
  | 'personnel' 
  | 'materials' 
  | 'equipment' 
  | 'subcontracting' 
  | 'studies' 
  | 'contingency' 
  | 'overhead' 
  | 'other';

export type TransactionType = 'expense' | 'commitment' | 'payment' | 'adjustment';
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface BudgetLine {
  id: string;
  category: BudgetCategory;
  categoryLabel: string;
  description: string;
  initial: number;
  revised: number;
  committed: number;
  consumed: number;
  remaining: number;
  variance: number;
  variancePercent: number;
}

export interface Transaction {
  id: string;
  projectId: string;
  type: TransactionType;
  category: BudgetCategory;
  amount: number;
  description: string;
  vendor?: string;
  invoiceNumber?: string;
  date: string;
  dueDate?: string;
  status: TransactionStatus;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  notes?: string;
}

export interface ProjectBudget {
  projectId: string;
  projectTitle: string;
  currency: string;
  
  // Totals
  initialBudget: number;
  revisedBudget: number;
  committed: number;
  consumed: number;
  remaining: number;
  forecast: number;
  
  // Variance
  variance: number;
  variancePercent: number;
  
  // Status
  status: 'healthy' | 'warning' | 'critical' | 'over-budget';
  consumptionRate: number;
  burnRate: number; // per month
  monthsRemaining: number;
  
  // Lines
  lines: BudgetLine[];
  
  // Recent transactions
  recentTransactions: Transaction[];
  
  // Alerts
  alerts: {
    type: 'info' | 'warning' | 'critical';
    message: string;
    date: string;
  }[];
  
  // History
  revisions: {
    date: string;
    previousAmount: number;
    newAmount: number;
    reason: string;
    approvedBy: string;
  }[];
  
  lastUpdated: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalConsumed: number;
  totalCommitted: number;
  totalRemaining: number;
  avgConsumption: number;
  projectsOverBudget: number;
  projectsAtRisk: number;
  monthlyBurnRate: number;
  forecastEndYear: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export const mockProjectBudgets: ProjectBudget[] = [
  {
    projectId: 'PRJ-001',
    projectTitle: 'Route Nationale RN7 - Tronçon Est',
    currency: 'XOF',
    initialBudget: 4500000000,
    revisedBudget: 4750000000,
    committed: 450000000,
    consumed: 2750000000,
    remaining: 1550000000,
    forecast: 4800000000,
    variance: -300000000,
    variancePercent: -6.3,
    status: 'warning',
    consumptionRate: 57.9,
    burnRate: 275000000,
    monthsRemaining: 5.6,
    lines: [
      { id: 'BL-001-1', category: 'personnel', categoryLabel: 'Personnel', description: 'Équipe projet', initial: 450000000, revised: 480000000, committed: 0, consumed: 290000000, remaining: 190000000, variance: -10000000, variancePercent: -2.1 },
      { id: 'BL-001-2', category: 'materials', categoryLabel: 'Matériaux', description: 'Bitume, granulats, etc.', initial: 2200000000, revised: 2350000000, committed: 280000000, consumed: 1450000000, remaining: 620000000, variance: -180000000, variancePercent: -7.7 },
      { id: 'BL-001-3', category: 'equipment', categoryLabel: 'Équipements', description: 'Location engins', initial: 680000000, revised: 700000000, committed: 80000000, consumed: 420000000, remaining: 200000000, variance: -40000000, variancePercent: -5.7 },
      { id: 'BL-001-4', category: 'subcontracting', categoryLabel: 'Sous-traitance', description: 'Travaux spécialisés', initial: 850000000, revised: 900000000, committed: 90000000, consumed: 450000000, remaining: 360000000, variance: -50000000, variancePercent: -5.6 },
      { id: 'BL-001-5', category: 'contingency', categoryLabel: 'Imprévus', description: 'Provision aléas', initial: 320000000, revised: 320000000, committed: 0, consumed: 140000000, remaining: 180000000, variance: -20000000, variancePercent: -6.3 },
    ],
    recentTransactions: [
      { id: 'TRX-001-1', projectId: 'PRJ-001', type: 'expense', category: 'materials', amount: 45000000, description: 'Livraison bitume lot 12', vendor: 'Colas SA', invoiceNumber: 'INV-2026-0145', date: '2026-01-09', status: 'paid', paidAt: '2026-01-09' },
      { id: 'TRX-001-2', projectId: 'PRJ-001', type: 'commitment', category: 'equipment', amount: 28000000, description: 'Location finisseur janvier', vendor: 'SATOM', date: '2026-01-05', status: 'approved', approvedBy: 'M. Konaté' },
      { id: 'TRX-001-3', projectId: 'PRJ-001', type: 'expense', category: 'personnel', amount: 32000000, description: 'Salaires décembre 2025', date: '2026-01-02', status: 'paid', paidAt: '2026-01-02' },
    ],
    alerts: [
      { type: 'warning', message: 'Budget matériaux à 87% de consommation', date: '2026-01-08' },
      { type: 'info', message: 'Révision budgétaire approuvée +250M', date: '2025-12-15' },
    ],
    revisions: [
      { date: '2025-12-15', previousAmount: 4500000000, newAmount: 4750000000, reason: 'Extension scope pont n°2', approvedBy: 'Direction' },
    ],
    lastUpdated: '2026-01-10T14:00:00Z',
  },
  {
    projectId: 'PRJ-002',
    projectTitle: 'Pont de Kaolack',
    currency: 'XOF',
    initialBudget: 850000000,
    revisedBudget: 920000000,
    committed: 180000000,
    consumed: 320000000,
    remaining: 420000000,
    forecast: 980000000,
    variance: -130000000,
    variancePercent: -14.1,
    status: 'critical',
    consumptionRate: 34.8,
    burnRate: 80000000,
    monthsRemaining: 5.25,
    lines: [
      { id: 'BL-002-1', category: 'personnel', categoryLabel: 'Personnel', description: 'Équipe projet', initial: 102000000, revised: 110000000, committed: 0, consumed: 55000000, remaining: 55000000, variance: -8000000, variancePercent: -7.3 },
      { id: 'BL-002-2', category: 'materials', categoryLabel: 'Matériaux', description: 'Béton, acier, câbles', initial: 425000000, revised: 480000000, committed: 120000000, consumed: 165000000, remaining: 195000000, variance: -80000000, variancePercent: -16.7 },
      { id: 'BL-002-3', category: 'equipment', categoryLabel: 'Équipements', description: 'Grues, échafaudages', initial: 170000000, revised: 175000000, committed: 35000000, consumed: 58000000, remaining: 82000000, variance: -15000000, variancePercent: -8.6 },
      { id: 'BL-002-4', category: 'subcontracting', categoryLabel: 'Sous-traitance', description: 'Travaux spécialisés', initial: 110000000, revised: 112000000, committed: 25000000, consumed: 32000000, remaining: 55000000, variance: -12000000, variancePercent: -10.7 },
      { id: 'BL-002-5', category: 'contingency', categoryLabel: 'Imprévus', description: 'Provision aléas', initial: 43000000, revised: 43000000, committed: 0, consumed: 10000000, remaining: 33000000, variance: -15000000, variancePercent: -34.9 },
    ],
    recentTransactions: [
      { id: 'TRX-002-1', projectId: 'PRJ-002', type: 'commitment', category: 'materials', amount: 85000000, description: 'Câbles haubanage', vendor: 'Freyssinet', date: '2026-01-08', status: 'pending' },
      { id: 'TRX-002-2', projectId: 'PRJ-002', type: 'expense', category: 'equipment', amount: 12000000, description: 'Location grue janvier', vendor: 'Manitowoc', date: '2026-01-05', status: 'paid', paidAt: '2026-01-05' },
    ],
    alerts: [
      { type: 'critical', message: 'Dépassement budgétaire prévu de 60M XOF', date: '2026-01-05' },
      { type: 'warning', message: 'Retard câbles impactant le planning', date: '2026-01-05' },
    ],
    revisions: [
      { date: '2025-12-20', previousAmount: 850000000, newAmount: 920000000, reason: 'Fondations renforcées suite étude géotech', approvedBy: 'Direction' },
    ],
    lastUpdated: '2026-01-09T16:00:00Z',
  },
  {
    projectId: 'PRJ-003',
    projectTitle: 'Centre Commercial Bamako',
    currency: 'XOF',
    initialBudget: 2100000000,
    revisedBudget: 2100000000,
    committed: 320000000,
    consumed: 1512000000,
    remaining: 268000000,
    forecast: 2050000000,
    variance: 50000000,
    variancePercent: 2.4,
    status: 'healthy',
    consumptionRate: 72.0,
    burnRate: 180000000,
    monthsRemaining: 1.5,
    lines: [
      { id: 'BL-003-1', category: 'personnel', categoryLabel: 'Personnel', description: 'Équipe projet', initial: 189000000, revised: 189000000, committed: 0, consumed: 135000000, remaining: 54000000, variance: 4000000, variancePercent: 2.1 },
      { id: 'BL-003-2', category: 'materials', categoryLabel: 'Matériaux', description: 'Gros œuvre et second œuvre', initial: 1050000000, revised: 1050000000, committed: 180000000, consumed: 756000000, remaining: 114000000, variance: 25000000, variancePercent: 2.4 },
      { id: 'BL-003-3', category: 'equipment', categoryLabel: 'Équipements', description: 'Engins et outillage', initial: 315000000, revised: 315000000, committed: 65000000, consumed: 227000000, remaining: 23000000, variance: 8000000, variancePercent: 2.5 },
      { id: 'BL-003-4', category: 'subcontracting', categoryLabel: 'Sous-traitance', description: 'Lots techniques', initial: 420000000, revised: 420000000, committed: 75000000, consumed: 302000000, remaining: 43000000, variance: 10000000, variancePercent: 2.4 },
      { id: 'BL-003-5', category: 'contingency', categoryLabel: 'Imprévus', description: 'Provision', initial: 126000000, revised: 126000000, committed: 0, consumed: 92000000, remaining: 34000000, variance: 3000000, variancePercent: 2.4 },
    ],
    recentTransactions: [
      { id: 'TRX-003-1', projectId: 'PRJ-003', type: 'expense', category: 'materials', amount: 38000000, description: 'Charpente métallique N3', vendor: 'CMM SA', invoiceNumber: 'CMM-2026-012', date: '2026-01-08', status: 'approved', approvedBy: 'K. Keita' },
    ],
    alerts: [],
    revisions: [],
    lastUpdated: '2026-01-10T10:00:00Z',
  },
  {
    projectId: 'PRJ-005',
    projectTitle: 'Réseau Assainissement Cotonou',
    currency: 'XOF',
    initialBudget: 1800000000,
    revisedBudget: 1850000000,
    committed: 280000000,
    consumed: 810000000,
    remaining: 760000000,
    forecast: 1880000000,
    variance: -80000000,
    variancePercent: -4.3,
    status: 'warning',
    consumptionRate: 43.8,
    burnRate: 101250000,
    monthsRemaining: 7.5,
    lines: [
      { id: 'BL-005-1', category: 'personnel', categoryLabel: 'Personnel', description: 'Équipe projet', initial: 162000000, revised: 166500000, committed: 0, consumed: 73000000, remaining: 93500000, variance: -7500000, variancePercent: -4.5 },
      { id: 'BL-005-2', category: 'materials', categoryLabel: 'Matériaux', description: 'Tuyaux, regards', initial: 900000000, revised: 925000000, committed: 180000000, consumed: 405000000, remaining: 340000000, variance: -40000000, variancePercent: -4.3 },
    ],
    recentTransactions: [],
    alerts: [
      { type: 'warning', message: 'Surcoût prévu dû aux réseaux existants', date: '2025-12-18' },
    ],
    revisions: [
      { date: '2025-12-18', previousAmount: 1800000000, newAmount: 1850000000, reason: 'Interférences réseaux', approvedBy: 'Direction' },
    ],
    lastUpdated: '2026-01-10T11:30:00Z',
  },
  {
    projectId: 'PRJ-007',
    projectTitle: 'Aéroport Régional Bobo-Dioulasso',
    currency: 'XOF',
    initialBudget: 5200000000,
    revisedBudget: 5200000000,
    committed: 850000000,
    consumed: 1456000000,
    remaining: 2894000000,
    forecast: 5400000000,
    variance: -200000000,
    variancePercent: -3.8,
    status: 'warning',
    consumptionRate: 28.0,
    burnRate: 121333333,
    monthsRemaining: 23.9,
    lines: [],
    recentTransactions: [],
    alerts: [
      { type: 'info', message: 'Prévision dépassement de 200M à surveiller', date: '2026-01-08' },
    ],
    revisions: [],
    lastUpdated: '2026-01-10T08:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MOCK SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

export const mockBudgetSummary: BudgetSummary = {
  totalBudget: 45000000000,
  totalConsumed: 30150000000,
  totalCommitted: 4500000000,
  totalRemaining: 10350000000,
  avgConsumption: 67,
  projectsOverBudget: 1,
  projectsAtRisk: 3,
  monthlyBurnRate: 2512500000,
  forecastEndYear: 46500000000,
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const getBudgetByProject = (projectId: string): ProjectBudget | undefined => {
  return mockProjectBudgets.find((b) => b.projectId === projectId);
};

export const getBudgetsByStatus = (status: ProjectBudget['status']): ProjectBudget[] => {
  return mockProjectBudgets.filter((b) => b.status === status);
};

export const getCriticalBudgets = (): ProjectBudget[] => {
  return mockProjectBudgets.filter((b) => b.status === 'critical' || b.status === 'over-budget');
};

export const getRecentTransactions = (limit: number = 10): Transaction[] => {
  const allTransactions = mockProjectBudgets.flatMap((b) => b.recentTransactions);
  return allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const getTotalBudgetByCategory = (category: BudgetCategory): number => {
  return mockProjectBudgets.reduce((sum, budget) => {
    const line = budget.lines.find((l) => l.category === category);
    return sum + (line?.revised || 0);
  }, 0);
};

export const getConsumptionByCategory = (category: BudgetCategory): number => {
  return mockProjectBudgets.reduce((sum, budget) => {
    const line = budget.lines.find((l) => l.category === category);
    return sum + (line?.consumed || 0);
  }, 0);
};

