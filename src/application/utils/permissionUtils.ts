/**
 * Permission Utilities
 * Helpers pour la gestion des permissions et rôles
 */

export type Permission = string;
export type Role = string;

export interface UserPermissions {
  roles: Role[];
  permissions: Permission[];
}

/**
 * Vérifie si un utilisateur a un rôle
 */
export function hasRole(user: UserPermissions, role: Role): boolean {
  return user.roles.includes(role);
}

/**
 * Vérifie si un utilisateur a un des rôles
 */
export function hasAnyRole(user: UserPermissions, roles: Role[]): boolean {
  return roles.some(role => user.roles.includes(role));
}

/**
 * Vérifie si un utilisateur a tous les rôles
 */
export function hasAllRoles(user: UserPermissions, roles: Role[]): boolean {
  return roles.every(role => user.roles.includes(role));
}

/**
 * Vérifie si un utilisateur a une permission
 */
export function hasPermission(user: UserPermissions, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

/**
 * Vérifie si un utilisateur a une des permissions
 */
export function hasAnyPermission(user: UserPermissions, permissions: Permission[]): boolean {
  return permissions.some(permission => user.permissions.includes(permission));
}

/**
 * Vérifie si un utilisateur a toutes les permissions
 */
export function hasAllPermissions(user: UserPermissions, permissions: Permission[]): boolean {
  return permissions.every(permission => user.permissions.includes(permission));
}

/**
 * Permissions pour le module Analytics
 */
export const AnalyticsPermissions = {
  // Lecture
  VIEW_ANALYTICS: 'analytics:view',
  VIEW_DASHBOARD: 'analytics:dashboard:view',
  VIEW_KPIS: 'analytics:kpis:view',
  VIEW_ALERTS: 'analytics:alerts:view',
  VIEW_REPORTS: 'analytics:reports:view',
  VIEW_TRENDS: 'analytics:trends:view',
  
  // Écriture
  CREATE_ALERT: 'analytics:alerts:create',
  UPDATE_ALERT: 'analytics:alerts:update',
  RESOLVE_ALERT: 'analytics:alerts:resolve',
  DELETE_ALERT: 'analytics:alerts:delete',
  
  CREATE_REPORT: 'analytics:reports:create',
  UPDATE_REPORT: 'analytics:reports:update',
  DELETE_REPORT: 'analytics:reports:delete',
  
  // Configuration
  CONFIGURE_KPIS: 'analytics:kpis:configure',
  CONFIGURE_ALERTS: 'analytics:alerts:configure',
  EXPORT_DATA: 'analytics:export',
} as const;

/**
 * Rôles pour le module Analytics
 */
export const AnalyticsRoles = {
  VIEWER: 'analytics:viewer',
  ANALYST: 'analytics:analyst',
  ADMIN: 'analytics:admin',
  SUPER_ADMIN: 'analytics:super_admin',
} as const;

/**
 * Permissions de base par rôle (définies séparément pour éviter les références circulaires)
 */
const viewerPermissions: Permission[] = [
  AnalyticsPermissions.VIEW_ANALYTICS,
  AnalyticsPermissions.VIEW_DASHBOARD,
  AnalyticsPermissions.VIEW_KPIS,
  AnalyticsPermissions.VIEW_ALERTS,
  AnalyticsPermissions.VIEW_REPORTS,
  AnalyticsPermissions.VIEW_TRENDS,
];

const analystPermissions: Permission[] = [
  ...viewerPermissions,
  AnalyticsPermissions.CREATE_ALERT,
  AnalyticsPermissions.UPDATE_ALERT,
  AnalyticsPermissions.RESOLVE_ALERT,
  AnalyticsPermissions.CREATE_REPORT,
  AnalyticsPermissions.UPDATE_REPORT,
  AnalyticsPermissions.EXPORT_DATA,
];

const adminPermissions: Permission[] = [
  ...analystPermissions,
  AnalyticsPermissions.DELETE_ALERT,
  AnalyticsPermissions.DELETE_REPORT,
  AnalyticsPermissions.CONFIGURE_KPIS,
  AnalyticsPermissions.CONFIGURE_ALERTS,
];

const superAdminPermissions: Permission[] = [
  ...Object.values(AnalyticsPermissions),
];

/**
 * Mappings rôle -> permissions
 */
export const rolePermissions: Record<string, Permission[]> = {
  [AnalyticsRoles.VIEWER]: viewerPermissions,
  [AnalyticsRoles.ANALYST]: analystPermissions,
  [AnalyticsRoles.ADMIN]: adminPermissions,
  [AnalyticsRoles.SUPER_ADMIN]: superAdminPermissions,
};

/**
 * Obtient les permissions d'un rôle
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Obtient toutes les permissions d'un utilisateur (rôles + permissions directes)
 */
export function getAllUserPermissions(user: UserPermissions): Permission[] {
  const rolePerms = user.roles.flatMap(role => getRolePermissions(role));
  const directPerms = user.permissions;
  
  // Dédupliquer
  return Array.from(new Set([...rolePerms, ...directPerms]));
}

/**
 * Vérifie si un utilisateur peut effectuer une action
 */
export function canPerformAction(
  user: UserPermissions,
  permission: Permission
): boolean {
  const allPermissions = getAllUserPermissions(user);
  return allPermissions.includes(permission);
}

