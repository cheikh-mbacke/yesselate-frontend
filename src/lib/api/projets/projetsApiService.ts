/**
 * API Service - Projets
 * Service pour la gestion des projets BMO
 * Les fonctions simulent des appels API et peuvent être facilement remplacées
 * par de vraies requêtes HTTP vers un backend.
 */

import {
  mockProjects,
  getProjectById as getMockProjectById,
  getProjectsByStatus as getMockProjectsByStatus,
  getProjectsByBureau as getMockProjectsByBureau,
  getProjectsByPriority as getMockProjectsByPriority,
  getDelayedProjects as getMockDelayedProjects,
  getActiveProjects as getMockActiveProjects,
  getAtRiskProjects as getMockAtRiskProjects,
  searchProjects as searchMockProjects,
  type Project,
  type ProjectStatus,
  type ProjectPriority,
  type Bureau,
} from '@/lib/mocks/projets/mockProjects';

import {
  mockMilestones,
  getMilestoneById as getMockMilestoneById,
  getMilestonesByProject as getMockMilestonesByProject,
  getUpcomingMilestones as getMockUpcomingMilestones,
  getDelayedMilestones as getMockDelayedMilestones,
  getCriticalMilestones as getMockCriticalMilestones,
  type Milestone,
  type MilestoneStatus,
} from '@/lib/mocks/projets/mockMilestones';

import {
  mockTeams,
  mockTeamMembers,
  mockAssignments,
  getMemberById as getMockMemberById,
  getTeamById as getMockTeamById,
  getAvailableMembers as getMockAvailableMembers,
  getAssignmentsByProject as getMockAssignmentsByProject,
  getGlobalUtilizationRate,
  type Team,
  type TeamMember,
  type ProjectAssignment,
} from '@/lib/mocks/projets/mockTeams';

import {
  mockProjectBudgets,
  mockBudgetSummary,
  getBudgetByProject as getMockBudgetByProject,
  getCriticalBudgets as getMockCriticalBudgets,
  getRecentTransactions as getMockRecentTransactions,
  type ProjectBudget,
  type BudgetSummary,
  type Transaction,
} from '@/lib/mocks/projets/mockBudgets';

import {
  mockNotifications,
  getUnreadNotifications as getMockUnreadNotifications,
  getUnreadCount as getMockUnreadCount,
  getCriticalNotifications as getMockCriticalNotifications,
  groupNotificationsByDate as groupMockNotificationsByDate,
  markAsRead as mockMarkAsRead,
  markAllAsRead as mockMarkAllAsRead,
  type Notification,
  type NotificationGroup,
} from '@/lib/mocks/projets/mockNotifications';

import {
  mockPerformanceMetrics,
  mockBureauComparison,
  mockStatusDistribution,
  mockTypeDistribution,
  mockProjectEvolution,
  mockBudgetEvolution,
  type PerformanceMetric,
  type BureauComparison,
  type CategoryData,
  type TimeSeriesPoint,
} from '@/lib/mocks/projets/mockAnalytics';

import { getGlobalStats, getDashboardSummary } from '@/lib/mocks/projets';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  bureau?: Bureau[];
  priority?: ProjectPriority[];
  search?: string;
  dateRange?: { start: string; end: string };
  type?: string[];
  riskLevel?: ('high' | 'medium' | 'low')[];
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER - Simulate API delay
// ═══════════════════════════════════════════════════════════════════════════

const simulateDelay = (ms: number = 200): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const wrapResponse = <T>(data: T): ApiResponse<T> => ({
  data,
  success: true,
  timestamp: new Date().toISOString(),
});

// ═══════════════════════════════════════════════════════════════════════════
// PROJECTS API
// ═══════════════════════════════════════════════════════════════════════════

export const projetsApi = {
  // Get all projects with optional filters
  async getProjects(filters?: ProjectFilters): Promise<ApiResponse<Project[]>> {
    await simulateDelay();
    
    let projects = [...mockProjects];
    
    if (filters) {
      if (filters.status?.length) {
        projects = projects.filter(p => filters.status!.includes(p.status));
      }
      if (filters.bureau?.length) {
        projects = projects.filter(p => filters.bureau!.includes(p.bureau));
      }
      if (filters.priority?.length) {
        projects = projects.filter(p => filters.priority!.includes(p.priority));
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        projects = projects.filter(p => 
          p.title.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          p.client.name.toLowerCase().includes(query)
        );
      }
      if (filters.type?.length) {
        projects = projects.filter(p => filters.type!.includes(p.type));
      }
      if (filters.riskLevel?.length) {
        projects = projects.filter(p => filters.riskLevel!.includes(p.riskLevel));
      }
    }
    
    return wrapResponse(projects);
  },

  // Get paginated projects
  async getProjectsPaginated(
    page: number = 1, 
    pageSize: number = 10, 
    filters?: ProjectFilters
  ): Promise<ApiResponse<PaginatedResponse<Project>>> {
    await simulateDelay();
    
    const allProjects = (await this.getProjects(filters)).data;
    const total = allProjects.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const data = allProjects.slice(startIndex, startIndex + pageSize);
    
    return wrapResponse({
      data,
      total,
      page,
      pageSize,
      totalPages,
    });
  },

  // Get single project by ID
  async getProjectById(id: string): Promise<ApiResponse<Project | null>> {
    await simulateDelay();
    return wrapResponse(getMockProjectById(id) || null);
  },

  // Get projects by status
  async getProjectsByStatus(status: ProjectStatus): Promise<ApiResponse<Project[]>> {
    await simulateDelay();
    return wrapResponse(getMockProjectsByStatus(status));
  },

  // Get projects by bureau
  async getProjectsByBureau(bureau: Bureau): Promise<ApiResponse<Project[]>> {
    await simulateDelay();
    return wrapResponse(getMockProjectsByBureau(bureau));
  },

  // Get delayed projects
  async getDelayedProjects(): Promise<ApiResponse<Project[]>> {
    await simulateDelay();
    return wrapResponse(getMockDelayedProjects());
  },

  // Get active projects
  async getActiveProjects(): Promise<ApiResponse<Project[]>> {
    await simulateDelay();
    return wrapResponse(getMockActiveProjects());
  },

  // Get at-risk projects
  async getAtRiskProjects(): Promise<ApiResponse<Project[]>> {
    await simulateDelay();
    return wrapResponse(getMockAtRiskProjects());
  },

  // Search projects
  async searchProjects(query: string): Promise<ApiResponse<Project[]>> {
    await simulateDelay();
    return wrapResponse(searchMockProjects(query));
  },

  // Get global stats
  async getStats(): Promise<ApiResponse<ReturnType<typeof getGlobalStats>>> {
    await simulateDelay();
    return wrapResponse(getGlobalStats());
  },

  // Get dashboard summary
  async getDashboard(): Promise<ApiResponse<ReturnType<typeof getDashboardSummary>>> {
    await simulateDelay();
    return wrapResponse(getDashboardSummary());
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONES API
// ═══════════════════════════════════════════════════════════════════════════

export const milestonesApi = {
  // Get all milestones
  async getMilestones(): Promise<ApiResponse<Milestone[]>> {
    await simulateDelay();
    return wrapResponse(mockMilestones);
  },

  // Get milestone by ID
  async getMilestoneById(id: string): Promise<ApiResponse<Milestone | null>> {
    await simulateDelay();
    return wrapResponse(getMockMilestoneById(id) || null);
  },

  // Get milestones by project
  async getMilestonesByProject(projectId: string): Promise<ApiResponse<Milestone[]>> {
    await simulateDelay();
    return wrapResponse(getMockMilestonesByProject(projectId));
  },

  // Get upcoming milestones
  async getUpcomingMilestones(days: number = 30): Promise<ApiResponse<Milestone[]>> {
    await simulateDelay();
    return wrapResponse(getMockUpcomingMilestones(days));
  },

  // Get delayed milestones
  async getDelayedMilestones(): Promise<ApiResponse<Milestone[]>> {
    await simulateDelay();
    return wrapResponse(getMockDelayedMilestones());
  },

  // Get critical milestones
  async getCriticalMilestones(): Promise<ApiResponse<Milestone[]>> {
    await simulateDelay();
    return wrapResponse(getMockCriticalMilestones());
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TEAMS API
// ═══════════════════════════════════════════════════════════════════════════

export const teamsApi = {
  // Get all teams
  async getTeams(): Promise<ApiResponse<Team[]>> {
    await simulateDelay();
    return wrapResponse(mockTeams);
  },

  // Get team by ID
  async getTeamById(id: string): Promise<ApiResponse<Team | null>> {
    await simulateDelay();
    return wrapResponse(getMockTeamById(id) || null);
  },

  // Get all team members
  async getMembers(): Promise<ApiResponse<TeamMember[]>> {
    await simulateDelay();
    return wrapResponse(mockTeamMembers);
  },

  // Get member by ID
  async getMemberById(id: string): Promise<ApiResponse<TeamMember | null>> {
    await simulateDelay();
    return wrapResponse(getMockMemberById(id) || null);
  },

  // Get available members
  async getAvailableMembers(minAvailability: number = 20): Promise<ApiResponse<TeamMember[]>> {
    await simulateDelay();
    return wrapResponse(getMockAvailableMembers(minAvailability));
  },

  // Get assignments by project
  async getAssignmentsByProject(projectId: string): Promise<ApiResponse<ProjectAssignment[]>> {
    await simulateDelay();
    return wrapResponse(getMockAssignmentsByProject(projectId));
  },

  // Get global utilization
  async getUtilization(): Promise<ApiResponse<number>> {
    await simulateDelay();
    return wrapResponse(getGlobalUtilizationRate());
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BUDGET API
// ═══════════════════════════════════════════════════════════════════════════

export const budgetApi = {
  // Get all project budgets
  async getBudgets(): Promise<ApiResponse<ProjectBudget[]>> {
    await simulateDelay();
    return wrapResponse(mockProjectBudgets);
  },

  // Get budget by project
  async getBudgetByProject(projectId: string): Promise<ApiResponse<ProjectBudget | null>> {
    await simulateDelay();
    return wrapResponse(getMockBudgetByProject(projectId) || null);
  },

  // Get budget summary
  async getSummary(): Promise<ApiResponse<BudgetSummary>> {
    await simulateDelay();
    return wrapResponse(mockBudgetSummary);
  },

  // Get critical budgets
  async getCriticalBudgets(): Promise<ApiResponse<ProjectBudget[]>> {
    await simulateDelay();
    return wrapResponse(getMockCriticalBudgets());
  },

  // Get recent transactions
  async getRecentTransactions(limit: number = 10): Promise<ApiResponse<Transaction[]>> {
    await simulateDelay();
    return wrapResponse(getMockRecentTransactions(limit));
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS API
// ═══════════════════════════════════════════════════════════════════════════

export const notificationsApi = {
  // Get all notifications
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    await simulateDelay();
    return wrapResponse(mockNotifications);
  },

  // Get unread notifications
  async getUnread(): Promise<ApiResponse<Notification[]>> {
    await simulateDelay();
    return wrapResponse(getMockUnreadNotifications());
  },

  // Get unread count
  async getUnreadCount(): Promise<ApiResponse<number>> {
    await simulateDelay();
    return wrapResponse(getMockUnreadCount());
  },

  // Get critical notifications
  async getCritical(): Promise<ApiResponse<Notification[]>> {
    await simulateDelay();
    return wrapResponse(getMockCriticalNotifications());
  },

  // Get grouped notifications
  async getGrouped(): Promise<ApiResponse<NotificationGroup[]>> {
    await simulateDelay();
    return wrapResponse(groupMockNotificationsByDate());
  },

  // Mark as read
  async markAsRead(id: string): Promise<ApiResponse<void>> {
    await simulateDelay();
    mockMarkAsRead(id);
    return wrapResponse(undefined);
  },

  // Mark all as read
  async markAllAsRead(): Promise<ApiResponse<void>> {
    await simulateDelay();
    mockMarkAllAsRead();
    return wrapResponse(undefined);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS API
// ═══════════════════════════════════════════════════════════════════════════

export const analyticsApi = {
  // Get performance metrics
  async getPerformanceMetrics(): Promise<ApiResponse<PerformanceMetric[]>> {
    await simulateDelay();
    return wrapResponse(mockPerformanceMetrics);
  },

  // Get bureau comparison
  async getBureauComparison(): Promise<ApiResponse<BureauComparison[]>> {
    await simulateDelay();
    return wrapResponse(mockBureauComparison);
  },

  // Get status distribution
  async getStatusDistribution(): Promise<ApiResponse<CategoryData[]>> {
    await simulateDelay();
    return wrapResponse(mockStatusDistribution);
  },

  // Get type distribution
  async getTypeDistribution(): Promise<ApiResponse<CategoryData[]>> {
    await simulateDelay();
    return wrapResponse(mockTypeDistribution);
  },

  // Get project evolution
  async getProjectEvolution(): Promise<ApiResponse<TimeSeriesPoint[]>> {
    await simulateDelay();
    return wrapResponse(mockProjectEvolution);
  },

  // Get budget evolution
  async getBudgetEvolution(): Promise<ApiResponse<TimeSeriesPoint[]>> {
    await simulateDelay();
    return wrapResponse(mockBudgetEvolution);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED API EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const projetsApiService = {
  projects: projetsApi,
  milestones: milestonesApi,
  teams: teamsApi,
  budget: budgetApi,
  notifications: notificationsApi,
  analytics: analyticsApi,
};

export default projetsApiService;

