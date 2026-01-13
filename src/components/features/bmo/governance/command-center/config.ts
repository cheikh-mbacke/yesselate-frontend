/**
 * Configuration des catégories du Centre de Commandement
 * Organisation métier pour pilotage BTP/Industrie
 */

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Wallet,
  AlertTriangle,
  Shield,
  Workflow,
  TrendingUp,
  Clock,
  FileCheck,
  AlertOctagon,
  Target,
  Milestone,
  Package,
  GitBranch,
  Lock,
  UserCog,
  BarChart3,
  Brain,
  Truck,
  Building2,
  Receipt,
  CreditCard,
  PiggyBank,
  LineChart,
  FileWarning,
  Bell,
  Siren,
  ShieldCheck,
  ScrollText,
  Scale,
  ClipboardCheck,
  Award,
  HardHat,
  GitPullRequest,
  CheckSquare,
  Handshake,
  Network,
  BookOpen,
} from 'lucide-react';
import type { MainCategoryConfig, SubCategoryConfig, SubSubCategoryConfig } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CATÉGORIES PRINCIPALES
// ═══════════════════════════════════════════════════════════════════════════

export const mainCategories: MainCategoryConfig[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    description: 'Dashboard opérationnel et KPIs',
  },
  {
    id: 'projects',
    label: 'Pilotage Projets',
    icon: FolderKanban,
    description: 'Portefeuille et avancement',
    badge: 3,
    badgeType: 'warning',
  },
  {
    id: 'resources',
    label: 'Ressources & Équipes',
    icon: Users,
    description: 'Allocation et capacité',
  },
  {
    id: 'financial',
    label: 'Engagements & Budget',
    icon: Wallet,
    description: 'Finances et trésorerie',
    badge: 2,
    badgeType: 'critical',
  },
  {
    id: 'risks',
    label: 'Risques & Alertes',
    icon: AlertTriangle,
    description: 'Gestion des risques',
    badge: 5,
    badgeType: 'critical',
  },
  {
    id: 'compliance',
    label: 'Conformité & Audit',
    icon: Shield,
    description: 'Réglementaire et qualité',
  },
  {
    id: 'processes',
    label: 'Processus & Workflows',
    icon: Workflow,
    description: 'Validations et RACI',
    badge: 8,
    badgeType: 'warning',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SOUS-CATÉGORIES PAR THÉMATIQUE
// ═══════════════════════════════════════════════════════════════════════════

export const subCategories: Record<string, SubCategoryConfig[]> = {
  overview: [
    { id: 'kpis', label: 'KPIs Stratégiques', icon: TrendingUp },
    { id: 'timeline', label: 'Timeline Globale', icon: Clock },
    { id: 'decisions', label: 'Décisions à prendre', icon: FileCheck, badge: 4, badgeType: 'warning' },
    { id: 'escalations', label: 'Escalades', icon: AlertOctagon, badge: 2, badgeType: 'critical' },
  ],
  projects: [
    { id: 'portfolio', label: 'Portefeuille', icon: Target },
    { id: 'milestones', label: 'Jalons & Livrables', icon: Milestone, badge: 5, badgeType: 'warning' },
    { id: 'deliverables', label: 'Livrables', icon: Package },
    { id: 'dependencies', label: 'Dépendances', icon: GitBranch },
    { id: 'blockers', label: 'Points bloquants', icon: Lock, badge: 3, badgeType: 'critical' },
  ],
  resources: [
    { id: 'allocation', label: 'Affectations', icon: UserCog },
    { id: 'capacity', label: 'Plan de charge', icon: BarChart3 },
    { id: 'skills', label: 'Compétences', icon: Brain },
    { id: 'subcontractors', label: 'Sous-traitants', icon: Truck },
    { id: 'mobilization', label: 'Mobilisation', icon: Building2 },
  ],
  financial: [
    { id: 'commitments', label: 'Engagements', icon: Receipt, badge: 2, badgeType: 'warning' },
    { id: 'invoicing', label: 'Facturation', icon: CreditCard },
    { id: 'forecasts', label: 'Prévisions', icon: LineChart },
    { id: 'variances', label: 'Écarts', icon: TrendingUp, badge: 1, badgeType: 'critical' },
    { id: 'cashflow', label: 'Trésorerie', icon: PiggyBank },
  ],
  risks: [
    { id: 'register', label: 'Registre des risques', icon: FileWarning },
    { id: 'alerts', label: 'Alertes actives', icon: Bell, badge: 5, badgeType: 'critical' },
    { id: 'incidents', label: 'Incidents', icon: Siren },
    { id: 'mitigation', label: 'Plans de mitigation', icon: ShieldCheck },
    { id: 'monitoring', label: 'Surveillance', icon: Target },
  ],
  compliance: [
    { id: 'regulations', label: 'Réglementations', icon: ScrollText },
    { id: 'contracts', label: 'Contrats', icon: Scale },
    { id: 'audits', label: 'Audits', icon: ClipboardCheck },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'hse', label: 'HSE', icon: HardHat },
  ],
  processes: [
    { id: 'workflows', label: 'Workflows', icon: GitPullRequest },
    { id: 'validations', label: 'Validations', icon: CheckSquare, badge: 8, badgeType: 'warning' },
    { id: 'delegations', label: 'Délégations', icon: Handshake },
    { id: 'raci', label: 'Matrice RACI', icon: Network },
    { id: 'procedures', label: 'Procédures', icon: BookOpen },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SOUS-SOUS-CATÉGORIES
// ═══════════════════════════════════════════════════════════════════════════

export const subSubCategories: Record<string, SubSubCategoryConfig[]> = {
  // Projects > Portfolio
  portfolio: [
    { id: 'active', label: 'En cours', count: 12 },
    { id: 'pipeline', label: 'En préparation', count: 5 },
    { id: 'archived', label: 'Terminés', count: 28 },
    { id: 'critical', label: 'Critiques', count: 3 },
  ],
  // Projects > Milestones
  milestones: [
    { id: 'upcoming', label: 'À venir', count: 15 },
    { id: 'late', label: 'En retard', count: 5 },
    { id: 'achieved', label: 'Atteints', count: 42 },
    { id: 'by-project', label: 'Par projet' },
  ],
  // Resources > Allocation
  allocation: [
    { id: 'by-project', label: 'Par projet' },
    { id: 'by-team', label: 'Par équipe' },
    { id: 'conflicts', label: 'Conflits', count: 2 },
    { id: 'optimization', label: 'Optimisation' },
  ],
  // Financial > Commitments
  commitments: [
    { id: 'pending', label: 'En attente', count: 8 },
    { id: 'approved', label: 'Approuvés', count: 45 },
    { id: 'rejected', label: 'Rejetés', count: 3 },
    { id: 'by-category', label: 'Par catégorie' },
  ],
  // Risks > Register
  register: [
    { id: 'high', label: 'Élevés', count: 4 },
    { id: 'medium', label: 'Moyens', count: 12 },
    { id: 'low', label: 'Faibles', count: 8 },
    { id: 'closed', label: 'Clôturés', count: 15 },
  ],
  // Risks > Alerts
  alerts: [
    { id: 'critical', label: 'Critiques', count: 2 },
    { id: 'warning', label: 'Avertissements', count: 5 },
    { id: 'info', label: 'Informations', count: 8 },
    { id: 'resolved', label: 'Résolues', count: 24 },
  ],
  // Compliance > Audits
  audits: [
    { id: 'planned', label: 'Planifiés', count: 6 },
    { id: 'ongoing', label: 'En cours', count: 2 },
    { id: 'completed', label: 'Terminés', count: 18 },
    { id: 'findings', label: 'Constats', count: 12 },
  ],
  // Processes > Validations
  validations: [
    { id: 'pending', label: 'En attente', count: 8 },
    { id: 'in-review', label: 'En revue', count: 3 },
    { id: 'escalated', label: 'Escaladées', count: 2 },
    { id: 'completed', label: 'Traitées', count: 156 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const getMainCategory = (id: string) => mainCategories.find(c => c.id === id);
export const getSubCategories = (mainId: string) => subCategories[mainId] || [];
export const getSubCategory = (mainId: string, subId: string) => 
  subCategories[mainId]?.find(s => s.id === subId);
export const getSubSubCategories = (subId: string) => subSubCategories[subId] || [];

