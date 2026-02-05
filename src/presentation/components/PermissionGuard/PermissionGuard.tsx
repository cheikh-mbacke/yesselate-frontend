/**
 * PermissionGuard Component
 * Composant pour protéger des éléments selon les permissions
 */

'use client';

import { ReactNode } from 'react';
import { useMemo } from 'react';
import { canPerformAction, hasRole, hasAnyRole, hasAllRoles } from '@/application/utils/permissionUtils';
import type { UserPermissions, Permission, Role } from '@/application/utils/permissionUtils';

interface PermissionGuardProps {
  user: UserPermissions;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  role?: Role;
  roles?: Role[];
  requireAllRoles?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  user,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  requireAllRoles = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const hasAccess = useMemo(() => {
    // Vérifier les permissions
    if (permission) {
      if (!canPerformAction(user, permission)) {
        return false;
      }
    }

    if (permissions && permissions.length > 0) {
      if (requireAll) {
        if (!permissions.every(p => canPerformAction(user, p))) {
          return false;
        }
      } else {
        if (!permissions.some(p => canPerformAction(user, p))) {
          return false;
        }
      }
    }

    // Vérifier les rôles
    if (role) {
      if (!hasRole(user, role)) {
        return false;
      }
    }

    if (roles && roles.length > 0) {
      if (requireAllRoles) {
        if (!hasAllRoles(user, roles)) {
          return false;
        }
      } else {
        if (!hasAnyRole(user, roles)) {
          return false;
        }
      }
    }

    return true;
  }, [user, permission, permissions, requireAll, role, roles, requireAllRoles]);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

