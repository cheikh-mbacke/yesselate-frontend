/**
 * Advanced Permission Utilities
 * Helpers pour les permissions avancées
 */

// Note: Permission et Role existent déjà dans permissionUtils.ts
export type PermissionAdvanced = string;
export type RoleAdvanced = string;

export interface PermissionSet {
  permissions: PermissionAdvanced[];
  roles: RoleAdvanced[];
}

/**
 * Vérifie si un utilisateur a une permission (version avancée)
 * Note: hasPermission existe déjà dans permissionUtils.ts
 */
export function hasPermissionAdvanced(
  userPermissions: PermissionAdvanced[],
  requiredPermission: PermissionAdvanced
): boolean {
  return userPermissions.includes(requiredPermission);
}

// Note: hasAllPermissions existe déjà dans permissionUtils.ts
export function hasAllPermissionsAdvanced(
  userPermissions: PermissionAdvanced[],
  requiredPermissions: PermissionAdvanced[]
): boolean {
  return requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  );
}

// Note: hasAnyPermission existe déjà dans permissionUtils.ts
export function hasAnyPermissionAdvanced(
  userPermissions: PermissionAdvanced[],
  requiredPermissions: PermissionAdvanced[]
): boolean {
  return requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );
}

// Note: hasRole existe déjà dans permissionUtils.ts
export function hasRoleAdvanced(userRoles: RoleAdvanced[], requiredRole: RoleAdvanced): boolean {
  return userRoles.includes(requiredRole);
}

// Note: hasAllRoles existe déjà dans permissionUtils.ts
export function hasAllRolesAdvanced(userRoles: RoleAdvanced[], requiredRoles: RoleAdvanced[]): boolean {
  return requiredRoles.every(role => userRoles.includes(role));
}

// Note: hasAnyRole existe déjà dans permissionUtils.ts
export function hasAnyRoleAdvanced(userRoles: RoleAdvanced[], requiredRoles: RoleAdvanced[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Crée un gestionnaire de permissions
 */
export class PermissionManager {
  private permissions: PermissionAdvanced[] = [];
  private roles: RoleAdvanced[] = [];

  constructor(permissionSet?: PermissionSet) {
    if (permissionSet) {
      this.permissions = permissionSet.permissions;
      this.roles = permissionSet.roles;
    }
  }

  /**
   * Définit les permissions
   */
  setPermissions(permissions: PermissionAdvanced[]): void {
    this.permissions = permissions;
  }

  /**
   * Définit les rôles
   */
  setRoles(roles: RoleAdvanced[]): void {
    this.roles = roles;
  }

  /**
   * Ajoute une permission
   */
  addPermission(permission: PermissionAdvanced): void {
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission);
    }
  }

  /**
   * Supprime une permission
   */
  removePermission(permission: PermissionAdvanced): void {
    this.permissions = this.permissions.filter(p => p !== permission);
  }

  /**
   * Ajoute un rôle
   */
  addRole(role: RoleAdvanced): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
    }
  }

  /**
   * Supprime un rôle
   */
  removeRole(role: RoleAdvanced): void {
    this.roles = this.roles.filter(r => r !== role);
  }

  /**
   * Vérifie une permission
   */
  can(permission: PermissionAdvanced): boolean {
    return hasPermissionAdvanced(this.permissions, permission);
  }

  /**
   * Vérifie toutes les permissions
   */
  canAll(permissions: PermissionAdvanced[]): boolean {
    return hasAllPermissionsAdvanced(this.permissions, permissions);
  }

  /**
   * Vérifie au moins une permission
   */
  canAny(permissions: PermissionAdvanced[]): boolean {
    return hasAnyPermissionAdvanced(this.permissions, permissions);
  }

  /**
   * Vérifie un rôle
   */
  is(role: RoleAdvanced): boolean {
    return hasRoleAdvanced(this.roles, role);
  }

  /**
   * Vérifie tous les rôles
   */
  isAll(roles: RoleAdvanced[]): boolean {
    return hasAllRolesAdvanced(this.roles, roles);
  }

  /**
   * Vérifie au moins un rôle
   */
  isAny(roles: RoleAdvanced[]): boolean {
    return hasAnyRoleAdvanced(this.roles, roles);
  }

  /**
   * Obtient toutes les permissions
   */
  getPermissions(): PermissionAdvanced[] {
    return [...this.permissions];
  }

  /**
   * Obtient tous les rôles
   */
  getRoles(): RoleAdvanced[] {
    return [...this.roles];
  }

  /**
   * Réinitialise
   */
  reset(): void {
    this.permissions = [];
    this.roles = [];
  }
}

/**
 * Crée un gestionnaire de permissions
 */
export function createPermissionManager(
  permissionSet?: PermissionSet
): PermissionManager {
  return new PermissionManager(permissionSet);
}

/**
 * Mappe les rôles vers les permissions
 */
export function mapRolesToPermissions(
  roles: RoleAdvanced[],
  rolePermissionMap: Record<RoleAdvanced, PermissionAdvanced[]>
): PermissionAdvanced[] {
  const permissions: Permission[] = [];

  roles.forEach(role => {
    const rolePermissions = rolePermissionMap[role] || [];
    rolePermissions.forEach(permission => {
      if (!permissions.includes(permission)) {
        permissions.push(permission);
      }
    });
  });

  return permissions;
}

/**
 * Vérifie les permissions avec un système de hiérarchie
 */
export function checkPermissionWithHierarchy(
  userPermissions: PermissionAdvanced[],
  requiredPermission: PermissionAdvanced,
  hierarchy: Record<PermissionAdvanced, PermissionAdvanced[]>
): boolean {
  // Vérifie la permission directe
  if (hasPermissionAdvanced(userPermissions, requiredPermission)) {
    return true;
  }

  // Vérifie les permissions parentes
  const parentPermissions = hierarchy[requiredPermission] || [];
  return hasAnyPermissionAdvanced(userPermissions, parentPermissions);
}

