/**
 * Mock Data - Projets
 * Point d'entrée pour toutes les données mock des projets
 */

// ═══════════════════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════════════════

export * from './mockProjects';
export type {
  Project,
  ProjectStatus,
  ProjectPriority,
  ProjectPhase,
  ProjectType,
  RiskLevel,
  Bureau,
  ProjectMember,
  ProjectDocument,
  ProjectRisk,
  ProjectNote,
} from './mockProjects';

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONES
// ═══════════════════════════════════════════════════════════════════════════

export * from './mockMilestones';
export type {
  Milestone,
  MilestoneStatus,
  MilestoneCategory,
  MilestoneTask,
  MilestoneDeliverable,
} from './mockMilestones';

// ═══════════════════════════════════════════════════════════════════════════
// TEAMS
// ═══════════════════════════════════════════════════════════════════════════

export * from './mockTeams';
export type {
  Team,
  TeamMember,
  TeamDepartment,
  MemberRole,
  MemberStatus,
  Skill,
  ProjectAssignment,
} from './mockTeams';

// ═══════════════════════════════════════════════════════════════════════════
// BUDGETS
// ═══════════════════════════════════════════════════════════════════════════

export * from './mockBudgets';
export type {
  ProjectBudget,
  BudgetLine,
  BudgetCategory,
  Transaction,
  TransactionType,
  TransactionStatus,
  BudgetSummary,
} from './mockBudgets';

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

export * from './mockAnalytics';
export type {
  TimeSeriesPoint,
  CategoryData,
  PerformanceMetric,
  BureauComparison,
  MonthlyProgress,
} from './mockAnalytics';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export * from './mockNotifications';
export type {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationGroup,
} from './mockNotifications';

// ═══════════════════════════════════════════════════════════════════════════
// AGGREGATED STATS
// ═══════════════════════════════════════════════════════════════════════════

import { mockProjects } from './mockProjects';
import { mockMilestones } from './mockMilestones';
import { mockTeams, mockTeamMembers } from './mockTeams';
import { mockBudgetSummary, mockProjectBudgets } from './mockBudgets';
import { mockNotifications } from './mockNotifications';

export const getGlobalStats = () => {
  const projects = mockProjects;
  
  return {
    // Projets
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    planning: projects.filter(p => p.status === 'planning').length,
    delayed: projects.filter(p => p.status === 'delayed').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on-hold').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length,
    
    // Progress
    avgProgress: Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length),
    
    // Budget
    totalBudget: projects.reduce((sum, p) => sum + p.budget.current, 0),
    budgetConsumed: projects.reduce((sum, p) => sum + p.budget.consumed, 0),
    avgBudgetUsage: mockBudgetSummary.avgConsumption,
    
    // Risks
    atRiskCount: projects.filter(p => p.riskLevel === 'high' || p.status === 'delayed').length,
    overdueCount: projects.filter(p => p.status === 'delayed').length,
    
    // Completion
    completedThisMonth: projects.filter(p => {
      if (p.status !== 'completed' || !p.actualEndDate) return false;
      const endDate = new Date(p.actualEndDate);
      const now = new Date();
      return endDate.getMonth() === now.getMonth() && endDate.getFullYear() === now.getFullYear();
    }).length,
    
    // Team
    teamSize: mockTeamMembers.length,
    onTimeDelivery: Math.round(projects
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.metrics.onTimeDelivery, 0) / 
      Math.max(1, projects.filter(p => p.status === 'completed').length)),
    
    // By Bureau
    byBureau: [
      { bureau: 'BF', count: projects.filter(p => p.bureau === 'BF').length, active: projects.filter(p => p.bureau === 'BF' && p.status === 'active').length, delayed: projects.filter(p => p.bureau === 'BF' && p.status === 'delayed').length },
      { bureau: 'BM', count: projects.filter(p => p.bureau === 'BM').length, active: projects.filter(p => p.bureau === 'BM' && p.status === 'active').length, delayed: projects.filter(p => p.bureau === 'BM' && p.status === 'delayed').length },
      { bureau: 'BJ', count: projects.filter(p => p.bureau === 'BJ').length, active: projects.filter(p => p.bureau === 'BJ' && p.status === 'active').length, delayed: projects.filter(p => p.bureau === 'BJ' && p.status === 'delayed').length },
      { bureau: 'BCT', count: projects.filter(p => p.bureau === 'BCT').length, active: projects.filter(p => p.bureau === 'BCT' && p.status === 'active').length, delayed: projects.filter(p => p.bureau === 'BCT' && p.status === 'delayed').length },
    ],
    
    // By Type
    byType: [
      { type: 'Infrastructure', count: projects.filter(p => p.type === 'Infrastructure').length },
      { type: 'Bâtiment', count: projects.filter(p => p.type === 'Bâtiment').length },
      { type: 'Ouvrage d\'art', count: projects.filter(p => p.type === 'Ouvrage d\'art').length },
      { type: 'Aménagement', count: projects.filter(p => p.type === 'Aménagement').length },
      { type: 'Réhabilitation', count: projects.filter(p => p.type === 'Réhabilitation').length },
      { type: 'Étude', count: projects.filter(p => p.type === 'Étude').length },
    ].filter(t => t.count > 0),
    
    // By Priority
    byPriority: [
      { priority: 'high', count: projects.filter(p => p.priority === 'high').length },
      { priority: 'medium', count: projects.filter(p => p.priority === 'medium').length },
      { priority: 'low', count: projects.filter(p => p.priority === 'low').length },
    ],
    
    ts: new Date().toISOString(),
  };
};

// Dashboard summary
export const getDashboardSummary = () => ({
  stats: getGlobalStats(),
  budget: mockBudgetSummary,
  teams: mockTeams.map(t => ({
    id: t.id,
    name: t.name,
    bureau: t.bureau,
    memberCount: t.memberCount,
    utilizationRate: t.utilizationRate,
    status: t.status,
  })),
  criticalBudgets: mockProjectBudgets.filter(b => b.status === 'critical'),
  unreadNotifications: mockNotifications.filter(n => !n.read).length,
  upcomingMilestones: mockMilestones
    .filter(m => m.status !== 'completed' && m.status !== 'cancelled')
    .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())
    .slice(0, 5),
});

