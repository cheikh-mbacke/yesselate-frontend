/**
 * Configuration de navigation à 3 niveaux pour le module Paramètres
 */

import type { ParametresMainCategory } from '../types/parametresNavigationTypes';
import {
  Settings,
  Shield,
  Bell,
  Plug,
  Users,
  Database,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: NavNode[];
}

export const parametresNavigationConfig: Record<ParametresMainCategory, NavNode> = {
  general: {
    id: 'general',
    label: 'Général',
    icon: Settings,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'profile', label: 'Profil' }, { id: 'preferences', label: 'Préférences' }, { id: 'theme', label: 'Thème' }, { id: 'language', label: 'Langue' }] }],
  },
  security: {
    id: 'security',
    label: 'Sécurité',
    icon: Shield,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'password', label: 'Mot de passe' }, { id: 'two-factor', label: 'Authentification 2FA' }, { id: 'sessions', label: 'Sessions' }] }],
  },
  notifications: {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    badge: 0,
    badgeType: 'warning',
    children: [{ id: 'all', label: 'Tout', badge: 0, badgeType: 'warning', children: [{ id: 'email', label: 'Email' }, { id: 'push', label: 'Push' }, { id: 'sms', label: 'SMS' }] }],
  },
  integrations: {
    id: 'integrations',
    label: 'Intégrations',
    icon: Plug,
    children: [{ id: 'all', label: 'Toutes', children: [{ id: 'active', label: 'Actives' }, { id: 'available', label: 'Disponibles' }] }],
  },
  permissions: {
    id: 'permissions',
    label: 'Permissions',
    icon: Users,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'users', label: 'Utilisateurs' }, { id: 'roles', label: 'Rôles' }, { id: 'policies', label: 'Politiques' }] }],
  },
  backup: {
    id: 'backup',
    label: 'Sauvegardes',
    icon: Database,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'schedule', label: 'Planification' }, { id: 'history', label: 'Historique' }] }],
  },
};

export function findNavNodeById(mainCategory: ParametresMainCategory, subCategory?: string, subSubCategory?: string): NavNode | undefined {
  const mainNode = parametresNavigationConfig[mainCategory];
  if (!mainNode) return undefined;
  if (!subCategory) return mainNode;
  const subNode = mainNode.children?.find((child) => child.id === subCategory);
  if (!subNode) return undefined;
  if (!subSubCategory) return subNode;
  return subNode.children?.find((child) => child.id === subSubCategory);
}

export function getSubCategories(mainCategory: ParametresMainCategory): NavNode[] {
  const mainNode = parametresNavigationConfig[mainCategory];
  return mainNode?.children || [];
}

export function getSubSubCategories(mainCategory: ParametresMainCategory, subCategory: string): NavNode[] {
  const mainNode = parametresNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

