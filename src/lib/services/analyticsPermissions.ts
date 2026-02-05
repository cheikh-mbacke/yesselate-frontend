/**
 * Système de permissions pour Analytics
 * RBAC (Role-Based Access Control) pour contrôler l'accès aux données
 */

// ============================================
// TYPES
// ============================================

export type AnalyticsRole = 
  | 'admin'           // Accès complet
  | 'manager'         // Gestion analytics bureau
  | 'analyst'         // Analyse et export
  | 'viewer'          // Lecture seule
  | 'guest';          // Accès très limité

export type AnalyticsPermission =
  // Lecture
  | 'analytics.view_all'
  | 'analytics.view_bureau'
  | 'analytics.view_own'
  
  // KPIs
  | 'analytics.kpis.view'
  | 'analytics.kpis.create'
  | 'analytics.kpis.update'
  | 'analytics.kpis.delete'
  
  // Reports
  | 'analytics.reports.view'
  | 'analytics.reports.create'
  | 'analytics.reports.update'
  | 'analytics.reports.delete'
  | 'analytics.reports.publish'
  
  // Alerts
  | 'analytics.alerts.view'
  | 'analytics.alerts.acknowledge'
  | 'analytics.alerts.resolve'
  | 'analytics.alerts.configure'
  
  // Export
  | 'analytics.export.basic'
  | 'analytics.export.sensitive'
  | 'analytics.export.schedule'
  
  // Stats & Dashboard
  | 'analytics.stats.view'
  | 'analytics.stats.detailed'
  | 'analytics.dashboard.view'
  | 'analytics.dashboard.customize'
  
  // Comparaison
  | 'analytics.compare.bureaux'
  | 'analytics.compare.periods'
  
  // Administration
  | 'analytics.settings.manage'
  | 'analytics.permissions.manage'
  | 'analytics.audit.view';

export interface UserContext {
  id: string;
  role: AnalyticsRole;
  bureauCode?: string;
  permissions?: AnalyticsPermission[];
  isAdmin?: boolean;
}

export interface DataContext {
  type: 'kpi' | 'report' | 'alert' | 'trend' | 'stat';
  bureauCode?: string;
  createdBy?: string;
  isSensitive?: boolean;
  isPublic?: boolean;
}

// ============================================
// CONFIGURATION DES RÔLES
// ============================================

const ROLE_PERMISSIONS: Record<AnalyticsRole, AnalyticsPermission[]> = {
  admin: [
    'analytics.view_all',
    'analytics.kpis.view',
    'analytics.kpis.create',
    'analytics.kpis.update',
    'analytics.kpis.delete',
    'analytics.reports.view',
    'analytics.reports.create',
    'analytics.reports.update',
    'analytics.reports.delete',
    'analytics.reports.publish',
    'analytics.alerts.view',
    'analytics.alerts.acknowledge',
    'analytics.alerts.resolve',
    'analytics.alerts.configure',
    'analytics.export.basic',
    'analytics.export.sensitive',
    'analytics.export.schedule',
    'analytics.stats.view',
    'analytics.stats.detailed',
    'analytics.dashboard.view',
    'analytics.dashboard.customize',
    'analytics.compare.bureaux',
    'analytics.compare.periods',
    'analytics.settings.manage',
    'analytics.permissions.manage',
    'analytics.audit.view',
  ],
  
  manager: [
    'analytics.view_all',
    'analytics.view_bureau',
    'analytics.kpis.view',
    'analytics.kpis.create',
    'analytics.kpis.update',
    'analytics.reports.view',
    'analytics.reports.create',
    'analytics.reports.update',
    'analytics.reports.publish',
    'analytics.alerts.view',
    'analytics.alerts.acknowledge',
    'analytics.alerts.resolve',
    'analytics.export.basic',
    'analytics.export.schedule',
    'analytics.stats.view',
    'analytics.stats.detailed',
    'analytics.dashboard.view',
    'analytics.dashboard.customize',
    'analytics.compare.bureaux',
  ],
  
  analyst: [
    'analytics.view_bureau',
    'analytics.kpis.view',
    'analytics.kpis.update',
    'analytics.reports.view',
    'analytics.reports.create',
    'analytics.alerts.view',
    'analytics.alerts.acknowledge',
    'analytics.export.basic',
    'analytics.stats.view',
    'analytics.stats.detailed',
    'analytics.dashboard.view',
    'analytics.compare.bureaux',
    'analytics.compare.periods',
  ],
  
  viewer: [
    'analytics.view_bureau',
    'analytics.kpis.view',
    'analytics.reports.view',
    'analytics.alerts.view',
    'analytics.export.basic',
    'analytics.stats.view',
    'analytics.dashboard.view',
  ],
  
  guest: [
    'analytics.view_own',
    'analytics.kpis.view',
    'analytics.reports.view',
    'analytics.dashboard.view',
  ],
};

// ============================================
// SERVICE DE PERMISSIONS
// ============================================

export class AnalyticsPermissionService {
  private static instance: AnalyticsPermissionService;

  public static getInstance(): AnalyticsPermissionService {
    if (!this.instance) {
      this.instance = new AnalyticsPermissionService();
    }
    return this.instance;
  }

  /**
   * Vérifier si un utilisateur a une permission
   */
  hasPermission(user: UserContext, permission: AnalyticsPermission): boolean {
    // Admin a toutes les permissions
    if (user.isAdmin || user.role === 'admin') {
      return true;
    }

    // Vérifier permissions du rôle
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    if (rolePermissions.includes(permission)) {
      return true;
    }

    // Vérifier permissions personnalisées
    if (user.permissions && user.permissions.includes(permission)) {
      return true;
    }

    return false;
  }

  /**
   * Vérifier si un utilisateur peut voir des données
   */
  canViewData(user: UserContext, data: DataContext): boolean {
    // Admin voit tout
    if (this.hasPermission(user, 'analytics.view_all')) {
      return true;
    }

    // Données publiques visibles par tous
    if (data.isPublic) {
      return true;
    }

    // Vérifier données du bureau
    if (data.bureauCode && user.bureauCode === data.bureauCode) {
      return this.hasPermission(user, 'analytics.view_bureau');
    }

    // Vérifier données propres
    if (data.createdBy === user.id) {
      return this.hasPermission(user, 'analytics.view_own');
    }

    return false;
  }

  /**
   * Vérifier si un utilisateur peut exporter
   */
  canExport(user: UserContext, sensitive: boolean = false): boolean {
    if (sensitive) {
      return this.hasPermission(user, 'analytics.export.sensitive');
    }
    return this.hasPermission(user, 'analytics.export.basic');
  }

  /**
   * Vérifier si un utilisateur peut créer un KPI
   */
  canCreateKPI(user: UserContext): boolean {
    return this.hasPermission(user, 'analytics.kpis.create');
  }

  /**
   * Vérifier si un utilisateur peut mettre à jour un KPI
   */
  canUpdateKPI(user: UserContext, kpi: DataContext): boolean {
    if (!this.hasPermission(user, 'analytics.kpis.update')) {
      return false;
    }

    // Admin peut tout
    if (user.isAdmin) {
      return true;
    }

    // Vérifier ownership
    if (kpi.createdBy === user.id) {
      return true;
    }

    // Vérifier bureau
    if (kpi.bureauCode === user.bureauCode) {
      return true;
    }

    return false;
  }

  /**
   * Vérifier si un utilisateur peut supprimer un KPI
   */
  canDeleteKPI(user: UserContext, kpi: DataContext): boolean {
    if (!this.hasPermission(user, 'analytics.kpis.delete')) {
      return false;
    }

    // Seul admin ou créateur
    return user.isAdmin || kpi.createdBy === user.id;
  }

  /**
   * Vérifier si un utilisateur peut créer un rapport
   */
  canCreateReport(user: UserContext): boolean {
    return this.hasPermission(user, 'analytics.reports.create');
  }

  /**
   * Vérifier si un utilisateur peut publier un rapport
   */
  canPublishReport(user: UserContext): boolean {
    return this.hasPermission(user, 'analytics.reports.publish');
  }

  /**
   * Vérifier si un utilisateur peut configurer des alertes
   */
  canConfigureAlerts(user: UserContext): boolean {
    return this.hasPermission(user, 'analytics.alerts.configure');
  }

  /**
   * Vérifier si un utilisateur peut voir les stats détaillées
   */
  canViewDetailedStats(user: UserContext): boolean {
    return this.hasPermission(user, 'analytics.stats.detailed');
  }

  /**
   * Vérifier si un utilisateur peut comparer des bureaux
   */
  canCompareBureaux(user: UserContext): boolean {
    return this.hasPermission(user, 'analytics.compare.bureaux');
  }

  /**
   * Obtenir les permissions d'un utilisateur
   */
  getUserPermissions(user: UserContext): AnalyticsPermission[] {
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const customPermissions = user.permissions || [];
    return [...new Set([...rolePermissions, ...customPermissions])];
  }

  /**
   * Filtrer les données selon les permissions
   */
  filterDataByPermissions(user: UserContext, data: DataContext[]): DataContext[] {
    return data.filter((item) => this.canViewData(user, item));
  }

  /**
   * Construire les filtres de requête selon les permissions
   */
  buildQueryFilters(user: UserContext): Record<string, unknown> {
    const filters: Record<string, unknown> = {};

    // Admin voit tout
    if (this.hasPermission(user, 'analytics.view_all')) {
      return filters;
    }

    // Filtre par bureau
    if (this.hasPermission(user, 'analytics.view_bureau') && user.bureauCode) {
      filters.bureauCode = user.bureauCode;
    }

    // Filtre par créateur
    if (this.hasPermission(user, 'analytics.view_own')) {
      filters.createdBy = user.id;
    }

    return filters;
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const analyticsPermissions = AnalyticsPermissionService.getInstance();

// ============================================
// HELPERS
// ============================================

/**
 * Hook pour vérifier les permissions
 */
export function useAnalyticsPermissions(user: UserContext) {
  const service = AnalyticsPermissionService.getInstance();

  return {
    hasPermission: (permission: AnalyticsPermission) => 
      service.hasPermission(user, permission),
    
    canView: (data: DataContext) => 
      service.canViewData(user, data),
    
    canExport: (sensitive?: boolean) => 
      service.canExport(user, sensitive),
    
    canCreateKPI: () => 
      service.canCreateKPI(user),
    
    canUpdateKPI: (kpi: DataContext) => 
      service.canUpdateKPI(user, kpi),
    
    canDeleteKPI: (kpi: DataContext) => 
      service.canDeleteKPI(user, kpi),
    
    canCreateReport: () => 
      service.canCreateReport(user),
    
    canPublishReport: () => 
      service.canPublishReport(user),
    
    canConfigureAlerts: () => 
      service.canConfigureAlerts(user),
    
    canViewDetailedStats: () => 
      service.canViewDetailedStats(user),
    
    canCompareBureaux: () => 
      service.canCompareBureaux(user),
    
    getUserPermissions: () => 
      service.getUserPermissions(user),
  };
}

