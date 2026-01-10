/**
 * Hook pour gérer les permissions utilisateur
 */

'use client';

import React, { useMemo } from 'react';

export interface UserPermissions {
  canView: boolean;
  canValidate: boolean;
  canReject: boolean;
  canCreate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canManageRules: boolean;
  canViewAnalytics: boolean;
  canManageValidators: boolean;
  canBulkActions: boolean;
  role: 'admin' | 'validator' | 'viewer' | 'manager';
}

/**
 * Hook pour récupérer les permissions de l'utilisateur connecté
 * En production, cela devrait appeler une API ou lire depuis un context
 */
export function useUserPermissions(): UserPermissions {
  // TODO: En production, récupérer depuis l'API ou un context d'authentification
  const userRole = typeof window !== 'undefined'
    ? (localStorage.getItem('userRole') as UserPermissions['role']) || 'viewer'
    : 'viewer';

  const permissions = useMemo(() => {
    const basePermissions: UserPermissions = {
      canView: false,
      canValidate: false,
      canReject: false,
      canCreate: false,
      canDelete: false,
      canExport: false,
      canManageRules: false,
      canViewAnalytics: false,
      canManageValidators: false,
      canBulkActions: false,
      role: userRole,
    };

    switch (userRole) {
      case 'admin':
        return {
          ...basePermissions,
          canView: true,
          canValidate: true,
          canReject: true,
          canCreate: true,
          canDelete: true,
          canExport: true,
          canManageRules: true,
          canViewAnalytics: true,
          canManageValidators: true,
          canBulkActions: true,
        };

      case 'manager':
        return {
          ...basePermissions,
          canView: true,
          canValidate: true,
          canReject: true,
          canCreate: true,
          canExport: true,
          canViewAnalytics: true,
          canBulkActions: true,
        };

      case 'validator':
        return {
          ...basePermissions,
          canView: true,
          canValidate: true,
          canReject: true,
          canExport: true,
        };

      case 'viewer':
      default:
        return {
          ...basePermissions,
          canView: true,
          canExport: true,
        };
    }
  }, [userRole]);

  return permissions;
}

/**
 * Hook pour vérifier une permission spécifique
 */
export function usePermission(permission: keyof Omit<UserPermissions, 'role'>): boolean {
  const permissions = useUserPermissions();
  return permissions[permission];
}

/**
 * HOC pour wrapper un composant avec vérification de permission
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: keyof Omit<UserPermissions, 'role'>,
  fallback?: React.ReactNode
) {
  return function PermissionWrapper(props: P) {
    const hasPermission = usePermission(requiredPermission);

    if (!hasPermission) {
      return fallback || null;
    }

    return React.createElement(Component, props);
  };
}

