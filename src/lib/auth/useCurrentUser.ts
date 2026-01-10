/**
 * Hook pour obtenir l'utilisateur courant et ses permissions
 * Système RBAC (Role-Based Access Control)
 */

'use client';

import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ================================
// Types
// ================================

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export type Permission =
  | 'alerts.view'
  | 'alerts.create'
  | 'alerts.acknowledge'
  | 'alerts.resolve'
  | 'alerts.escalate'
  | 'alerts.assign'
  | 'alerts.delete'
  | 'alerts.export'
  | 'alerts.bulk'
  | 'alerts.stats'
  | 'alerts.rules.view'
  | 'alerts.rules.edit'
  | 'alerts.audit.view'
  | 'admin.users'
  | 'admin.settings';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bureau?: string;
  phone?: string;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      browser: boolean;
      sound: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: 'fr' | 'en';
  };
}

// ================================
// Permissions par rôle
// ================================

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'alerts.view',
    'alerts.create',
    'alerts.acknowledge',
    'alerts.resolve',
    'alerts.escalate',
    'alerts.assign',
    'alerts.delete',
    'alerts.export',
    'alerts.bulk',
    'alerts.stats',
    'alerts.rules.view',
    'alerts.rules.edit',
    'alerts.audit.view',
    'admin.users',
    'admin.settings',
  ],
  manager: [
    'alerts.view',
    'alerts.create',
    'alerts.acknowledge',
    'alerts.resolve',
    'alerts.escalate',
    'alerts.assign',
    'alerts.export',
    'alerts.bulk',
    'alerts.stats',
    'alerts.rules.view',
    'alerts.audit.view',
  ],
  operator: [
    'alerts.view',
    'alerts.acknowledge',
    'alerts.resolve',
    'alerts.export',
    'alerts.stats',
  ],
  viewer: [
    'alerts.view',
    'alerts.stats',
  ],
};

// ================================
// Store
// ================================

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null, // Will be set after login

      setUser: (user) => set({ user }),

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        const permissions = ROLE_PERMISSIONS[user.role] || [];
        return permissions.includes(permission);
      },

      hasAnyPermission: (permissions) => {
        return permissions.some((p) => get().hasPermission(p));
      },

      hasAllPermissions: (permissions) => {
        return permissions.every((p) => get().hasPermission(p));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// ================================
// Hook principal
// ================================

export function useCurrentUser() {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore();

  // Pour le développement, retourner un utilisateur mock si non connecté
  const mockUser: User = {
    id: 'user-dev-001',
    email: 'john.doe@yesselate.com',
    name: 'John Doe',
    role: 'manager', // Changez selon vos besoins de test
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    bureau: 'BF',
    phone: '+33 6 12 34 56 78',
    preferences: {
      notifications: {
        email: true,
        sms: true,
        browser: true,
        sound: true,
      },
      theme: 'auto',
      language: 'fr',
    },
  };

  const currentUser = user || mockUser;

  return {
    user: currentUser,
    isAuthenticated: !!user,
    role: currentUser.role,
    permissions: ROLE_PERMISSIONS[currentUser.role],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Helpers pour les rôles
    isAdmin: currentUser.role === 'admin',
    isManager: currentUser.role === 'manager',
    isOperator: currentUser.role === 'operator',
    isViewer: currentUser.role === 'viewer',
    
    // Helper pour vérifier si l'utilisateur peut faire une action
    can: (permission: Permission) => hasPermission(permission),
  };
}

// ================================
// Hook pour vérifier les permissions avec throw
// ================================

export function useRequirePermission(permission: Permission) {
  const { hasPermission } = useCurrentUser();
  
  if (!hasPermission(permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

// ================================
// Composant HOC pour protéger les actions
// ================================

export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  permission: Permission
) {
  return function ProtectedComponent(props: T) {
    const { hasPermission } = useCurrentUser();
    
    if (!hasPermission(permission)) {
      return null;
    }
    
    return React.createElement(Component, props);
  };
}

// ================================
// Helper pour formater le nom d'utilisateur
// ================================

export function formatUserName(user: User | null): string {
  if (!user) return 'Invité';
  return user.name;
}

export function getUserInitials(user: User | null): string {
  if (!user) return '?';
  return user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

