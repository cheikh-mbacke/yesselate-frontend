/**
 * Configuration de navigation pour le module Finances
 */

import type { FinancesMainCategory } from '../types/financesTypes';
import {
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  CreditCard,
  Wallet,
  TrendingDown,
  TrendingUp,
  FileBarChart,
  FolderOpen,
  Briefcase,
  BarChart3,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  children?: NavNode[];
}

export const financesNavigationConfig: Record<FinancesMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    children: [
      { id: 'dashboard', label: 'Tableau de bord' },
      { id: 'summary', label: 'Synthèse' },
      { id: 'highlights', label: 'Points clés', badge: 0, badgeType: 'warning' },
    ],
  },
  transactions: {
    id: 'transactions',
    label: 'Transactions',
    icon: ArrowLeftRight,
    children: [
      {
        id: 'all',
        label: 'Toutes',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'recent',
        label: 'Récentes',
        badge: 0,
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'pending',
        label: 'En attente',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'pending-bureau-finance', label: 'Bureau Finance' },
        ],
      },
    ],
  },
  invoices: {
    id: 'invoices',
    label: 'Factures',
    icon: FileText,
    children: [
      {
        id: 'all',
        label: 'Toutes',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'pending',
        label: 'En attente',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'pending-validation', label: 'Validation' },
          { id: 'pending-payment', label: 'Paiement' },
        ],
      },
      {
        id: 'paid',
        label: 'Payées',
        badge: 0,
        children: [
          { id: 'paid-recent', label: 'Récentes' },
          { id: 'paid-month', label: 'Ce mois' },
        ],
      },
      {
        id: 'overdue',
        label: 'En retard',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'overdue-critical', label: 'Critiques' },
          { id: 'overdue-moderate', label: 'Modérées' },
        ],
      },
    ],
  },
  payments: {
    id: 'payments',
    label: 'Paiements',
    icon: CreditCard,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'pending',
        label: 'En attente',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'pending-today', label: "Aujourd'hui" },
          { id: 'pending-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'completed',
        label: 'Complétés',
        badge: 0,
        children: [
          { id: 'completed-today', label: "Aujourd'hui" },
          { id: 'completed-week', label: 'Cette semaine' },
          { id: 'completed-month', label: 'Ce mois' },
        ],
      },
      {
        id: 'failed',
        label: 'Échoués',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'failed-recent', label: 'Récents' },
          { id: 'failed-old', label: 'Anciens' },
        ],
      },
    ],
  },
  budgets: {
    id: 'budgets',
    label: 'Budgets',
    icon: Wallet,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'active',
        label: 'Actifs',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'active-on-track', label: 'En bonne voie' },
          { id: 'active-at-risk', label: 'À risque' },
        ],
      },
      {
        id: 'exceeded',
        label: 'Dépassés',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'exceeded-critical', label: 'Critiques' },
          { id: 'exceeded-moderate', label: 'Modérés' },
        ],
      },
    ],
  },
  expenses: {
    id: 'expenses',
    label: 'Dépenses',
    icon: TrendingDown,
    children: [
      {
        id: 'all',
        label: 'Toutes',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'recent',
        label: 'Récentes',
        badge: 0,
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'high',
        label: 'Élevées',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'high-bureau-finance', label: 'Bureau Finance' },
        ],
      },
    ],
  },
  revenue: {
    id: 'revenue',
    label: 'Revenus',
    icon: TrendingUp,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'recent',
        label: 'Récents',
        badge: 0,
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'by-month',
        label: 'Par mois',
        badge: 0,
        children: [
          { id: 'month-current', label: 'Mois en cours' },
          { id: 'month-previous', label: 'Mois précédent' },
        ],
      },
    ],
  },
  reports: {
    id: 'reports',
    label: 'Rapports',
    icon: FileBarChart,
    children: [
      {
        id: 'financial',
        label: 'Financiers',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'financial-monthly', label: 'Mensuels' },
          { id: 'financial-quarterly', label: 'Trimestriels' },
        ],
      },
      {
        id: 'budget',
        label: 'Budgétaires',
        badge: 0,
        children: [
          { id: 'budget-monthly', label: 'Mensuels' },
          { id: 'budget-annual', label: 'Annuels' },
        ],
      },
      {
        id: 'tax',
        label: 'Fiscaux',
        badge: 0,
        children: [
          { id: 'tax-monthly', label: 'Mensuels' },
          { id: 'tax-annual', label: 'Annuels' },
        ],
      },
    ],
  },
  'by-category': {
    id: 'by-category',
    label: 'Par catégorie',
    icon: FolderOpen,
    children: [
      {
        id: 'operations',
        label: 'Opérations',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'operations-income', label: 'Revenus' },
          { id: 'operations-expense', label: 'Dépenses' },
        ],
      },
      {
        id: 'personnel',
        label: 'Personnel',
        badge: 0,
        children: [
          { id: 'personnel-salary', label: 'Salaires' },
          { id: 'personnel-benefits', label: 'Avantages' },
        ],
      },
      {
        id: 'equipment',
        label: 'Équipement',
        badge: 0,
        children: [
          { id: 'equipment-purchase', label: 'Achats' },
          { id: 'equipment-maintenance', label: 'Maintenance' },
        ],
      },
    ],
  },
  'by-project': {
    id: 'by-project',
    label: 'Par projet',
    icon: Briefcase,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-active', label: 'Actifs' },
          { id: 'all-completed', label: 'Terminés' },
        ],
      },
      {
        id: 'active',
        label: 'Actifs',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'active-on-budget', label: 'Dans le budget' },
          { id: 'active-over-budget', label: 'Hors budget' },
        ],
      },
      {
        id: 'high-value',
        label: 'Valeur élevée',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'high-value-active', label: 'Actifs' },
        ],
      },
    ],
  },
  analytics: {
    id: 'analytics',
    label: 'Analytiques',
    icon: BarChart3,
    children: [
      { id: 'dashboard', label: 'Tableau de bord' },
      { id: 'statistics', label: 'Statistiques' },
      { id: 'trends', label: 'Tendances' },
      { id: 'forecasts', label: 'Prévisions' },
    ],
  },
};

export function findNavNodeById(id: string, parentChildren?: NavNode[]): NavNode | undefined {
  const searchIn = parentChildren || Object.values(financesNavigationConfig);
  
  for (const node of searchIn) {
    if (node.id === id) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findNavNodeById(id, node.children);
      if (found) return found;
    }
  }
  return undefined;
}

export function getSubCategories(mainCategory: FinancesMainCategory): NavNode[] {
  return financesNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: FinancesMainCategory, subCategory: string): NavNode[] {
  const mainNode = financesNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

