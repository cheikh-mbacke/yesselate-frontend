/**
 * Configuration des catégories du Centre de Commandement Gouvernance
 * Module Maître d'Ouvrage - Structure hiérarchique 3 niveaux
 * Route: maitre-ouvrage/governance
 */

import {
  LayoutDashboard,
  Scale,
  AlertTriangle,
  Users,
  ShieldCheck,
  BarChart3,
  Target,
  Clock,
  FileText,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Calendar,
  FileCheck,
  Activity,
} from 'lucide-react';
import type { MainCategoryConfig, SubCategoryConfig, SubSubCategoryConfig } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// DOMAINES PRINCIPAUX (Niveau 1 - 5 domaines)
// ═══════════════════════════════════════════════════════════════════════════

export const mainCategories: MainCategoryConfig[] = [
  {
    id: 'strategic-view',
    label: 'Vue stratégique',
    icon: LayoutDashboard,
    description: 'Tableau de bord consolidé avec KPIs stratégiques',
  },
  {
    id: 'decisions-arbitrages',
    label: 'Décisions & Arbitrages',
    icon: Scale,
    description: 'Décisions stratégiques et arbitrages à fort impact',
    badge: 5,
    badgeType: 'warning',
  },
  {
    id: 'escalations-risks',
    label: 'Escalades & Risques',
    icon: AlertTriangle,
    description: 'Agrégation des escalades critiques et risques majeurs',
    badge: 12,
    badgeType: 'critical',
  },
  {
    id: 'instances-coordination',
    label: 'Instances & Coordination',
    icon: Users,
    description: 'Coordination instances décisionnelles critiques',
  },
  {
    id: 'compliance-performance',
    label: 'Conformité & Performance',
    icon: ShieldCheck,
    description: 'Conformité SLA, engagements et performance',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SOUS-DOMAINES PAR DOMAINE (Niveau 2)
// ═══════════════════════════════════════════════════════════════════════════

export const subCategories: Record<string, SubCategoryConfig[]> = {
  'strategic-view': [
    {
      id: 'executive-dashboard',
      label: 'Tableau de bord exécutif',
      icon: LayoutDashboard,
      description: 'KPI synthétiques, alertes critiques, tendances trimestre',
    },
    {
      id: 'director-kpis',
      label: 'KPI directeurs',
      icon: BarChart3,
      description: 'Projets actifs, budget, jalons, risques',
    },
    {
      id: 'monthly-summary',
      label: 'Synthèse mensuelle',
      icon: FileText,
      description: 'Rapport mensuel synthétique, comparaison période précédente',
    },
  ],
  'decisions-arbitrages': [
    {
      id: 'pending-decisions',
      label: 'Décisions en attente',
      icon: Clock,
      badge: 5,
      badgeType: 'warning',
      description: 'Liste décisions à prendre, contexte/enjeux, urgence',
    },
    {
      id: 'decision-history',
      label: 'Historique décisions',
      icon: FileText,
      description: 'Toutes décisions prises (derniers 3 mois), implémentation',
    },
    {
      id: 'blocking-points',
      label: 'Points de blocage à trancher',
      icon: AlertCircle,
      badge: 3,
      badgeType: 'critical',
      description: 'Blocages sur projets critiques, propositions d\'arbitrage',
    },
  ],
  'escalations-risks': [
    {
      id: 'active-escalations',
      label: 'Escalades en cours',
      icon: AlertTriangle,
      badge: 8,
      badgeType: 'critical',
      description: 'Escalades actives par niveau, délai depuis escalade',
    },
    {
      id: 'major-risks',
      label: 'Risques majeurs & exposition',
      icon: TrendingUp,
      description: 'Matrice risques, exposition financière, plan d\'atténuation',
    },
    {
      id: 'critical-blockages',
      label: 'Blocages critiques',
      icon: AlertCircle,
      badge: 4,
      badgeType: 'critical',
      description: 'Blocages impactant jalons contrats, actions correctives',
    },
  ],
  'instances-coordination': [
    {
      id: 'scheduled-instances',
      label: 'Instances programmées',
      icon: Calendar,
      description: 'Calendrier instances (CSPS, comités), participants attendus',
    },
    {
      id: 'minutes-followup',
      label: 'Comptes-rendus & suivi décisions',
      icon: FileCheck,
      description: 'CR dernières instances, suivi décisions antérieures',
    },
    {
      id: 'sensitive-projects',
      label: 'Projets sensibles & priorités',
      icon: Target,
      description: 'Liste projets sensibles, critères, priorités stratégiques',
    },
  ],
  'compliance-performance': [
    {
      id: 'contract-sla',
      label: 'Conformité contrats & SLA',
      icon: ShieldCheck,
      description: 'Respect SLA fournisseurs, conformité clauses, pénalités',
    },
    {
      id: 'commitments',
      label: 'Engagements (budgets, délais)',
      icon: CheckCircle2,
      description: 'Respect budgets/jalons, écarts vs engagement initial',
    },
    {
      id: 'resource-utilization',
      label: 'Taux utilisation ressources',
      icon: Activity,
      description: '% allocation équipes, taux productivité, recommandations',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// VUES SPÉCIFIQUES (Niveau 3 - optionnel, peut être vide)
// ═══════════════════════════════════════════════════════════════════════════

export const subSubCategories: Record<string, SubSubCategoryConfig[]> = {
  // Pour l'instant, pas de niveau 3, mais la structure est prête
  'executive-dashboard': [],
  'director-kpis': [],
  'monthly-summary': [],
  'pending-decisions': [],
  'decision-history': [],
  'blocking-points': [],
  'active-escalations': [],
  'major-risks': [],
  'critical-blockages': [],
  'scheduled-instances': [],
  'minutes-followup': [],
  'sensitive-projects': [],
  'contract-sla': [],
  'commitments': [],
  'resource-utilization': [],
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const getMainCategory = (id: string) => mainCategories.find(c => c.id === id);
export const getSubCategories = (mainId: string) => subCategories[mainId] || [];
export const getSubCategory = (mainId: string, subId: string) => 
  subCategories[mainId]?.find(s => s.id === subId);
export const getSubSubCategories = (subId: string) => subSubCategories[subId] || [];

// Helper pour obtenir le label d'une sous-catégorie
export const getSubCategoryLabel = (mainId: string, subId: string) => {
  const sub = getSubCategory(mainId, subId);
  return sub?.label || subId;
};

