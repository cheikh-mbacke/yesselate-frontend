/**
 * usePermission Hook
 * Hook pour vérifier les permissions d'un utilisateur
 */

import { useMemo } from 'react';
import {
  canPerformAction,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getAllUserPermissions,
} from '../utils/permissionUtils';
import type { UserPermissions, Permission, Role } from '../utils/permissionUtils';

/**
 * Hook pour vérifier les permissions
 */
export function usePermission(user: UserPermissions) {
  const allPermissions = useMemo(
    () => getAllUserPermissions(user),
    [user]
  );

  return useMemo(
    () => ({
      // Permissions
      can: (permission: Permission) => canPerformAction(user, permission),
      hasPermission: (permission: Permission) => hasPermission(user, permission),
      hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(user, permissions),
      hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(user, permissions),
      
      // Rôles
      hasRole: (role: Role) => hasRole(user, role),
      hasAnyRole: (roles: Role[]) => hasAnyRole(user, roles),
      hasAllRoles: (roles: Role[]) => hasAllRoles(user, roles),
      
      // Utilitaires
      allPermissions,
      user,
    }),
    [user, allPermissions]
  );
}

