/**
 * Vue d'ensemble du Dashboard
 * Dashboard principal avec KPIs, actions et risques enrichis
 * v3.1 - Enrichi avec Workflow, Calendrier J+7, Actions/Risks/Decisions détaillés
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  ArrowRight,
  BarChart3,
  Users,
  Wallet,
  FileCheck,
  Building2,
  DollarSign,
  User,
  UserCheck,
  AlertCircle,
  FileText,
  Scale,
  XCircle,
  Eye,
  Calendar,
  GitBranch,
  Lightbulb,
  Unlock,
  Sparkles,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import { useDashboardCommandCenterStore, type DashboardMainCategory } from '@/lib/stores/dashboardCommandCenterStore';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';
import { dashboardAPI } from '@/lib/api/pilotage/dashboardClient';
import { useLogger } from '@/lib/utils/logger';

// ============================================
// TYPES & INTERFACES
// ============================================

type BureauCode = 'BF' | 'BCG' | 'BJA' | 'BOP' | 'BCT' | 'BJ' | 'BMO';

interface ActionPrioritaire {
  id: string;
  icon: string;
  titre: string;
  type: 'contrat' | 'bc' | 'paiement' | 'arbitrage';
  bureau: BureauCode;
  code: string;
  priorite: 'critique' | 'haute' | 'moyenne';
  projet: {
    id: string;
    nom: string;
  };
  montant: number; // en FCFA
  deadline: string;
  responsable: {
    nom: string;
    id: string;
  };
  contexte: string;
  impact: string;
  aiSuggestion?: {
    action: string;
    confidence: number; // 0-1
    reasoning: string;
  };
}

interface RiskItem {
  id: string;
  titre: string;
  description: string;
  source: BureauCode;
  score: number; // 0-100
  impact: 'mineur' | 'moyen' | 'majeur' | 'critique';
  probabilite: 'faible' | 'moyenne' | 'elevee' | 'certaine';
  age: number; // en jours
  projet?: {
    id: string;
    nom: string;
  };
  solutions: Array<{
    id: string;
    titre: string;
    description: string;
    confidence: number; // 0-1
    priorite: number; // 1, 2, 3...
  }>;
}

interface WorkflowStage {
  id: string;
  label: string;
  count: number;
  color: string; // tailwind color
  bureau?: BureauCode;
  avgTime: number; // en jours
  targetTime: number; // en jours
  isBottleneck: boolean;
}

interface AgendaEvent {
  id: string;
  date: string; // ISO date
  time: string;
  titre: string;
  description: string;
  type: 'deadline' | 'meeting' | 'visite' | 'audience' | 'livraison';
  priorite: 'critique' | 'urgent' | 'normal';
  bureau?: BureauCode;
  projet?: string;
  participants?: string[];
}

interface Decision {
  id: string;
  code: string; // DÉC-2024-001
  type: 'substitution' | 'delegation' | 'arbitrage' | 'validation';
  titre: string;
  description: string;
  status: 'en_attente' | 'executee' | 'rejetee';
  demandeur: {
    nom: string;
    bureau: BureauCode;
  };
  details: Record<string, any>; // Flexible selon type
  impact: string;
  dateCreation: string; // ISO
  dateExecution?: string; // ISO
  validateurFinal?: string;
}

// ============================================
// DONNÉES MOCK ENRICHIES
// ============================================

const mockKPIs = [
  { id: 'demandes', label: 'Demandes', value: 247, trend: 12, icon: FileCheck, color: 'blue' },
  { id: 'validations', label: 'Validations', value: '89%', trend: 3, icon: CheckCircle, color: 'emerald' },
  { id: 'budget', label: 'Budget traité', value: '4.2Mds', trend: -2, icon: Wallet, color: 'amber' },
  { id: 'bureaux', label: 'Bureaux actifs', value: 12, trend: 0, icon: Users, color: 'purple' },
];

const actionsPrioritaires: ActionPrioritaire[] = [
  {
    id: 'AP-001',
    icon: '🔥',
    titre: 'Contrat sous-traitance électricité',
    type: 'contrat',
    bureau: 'BJA',
    code: 'J-5',
    priorite: 'critique',
    projet: {
      id: 'PRJ-0018',
      nom: 'Villa Diamniadio',
    },
    montant: 8200000,
    deadline: 'Aujourd\'hui 17h',
    responsable: {
      nom: 'N. FAYE',
      id: 'EMP-008',
    },
    contexte: 'Contrat béton SOCOCIM pour coulage dalle lundi. Validation urgente requise.',
    impact: 'Retard livraison 5 jours → Pénalités client 2M FCFA',
    aiSuggestion: {
      action: 'Déléguer à M. Sarr',
      confidence: 0.92,
      reasoning: 'Délégation active, disponible immédiatement, compétence juridique validée',
    },
  },
  {
    id: 'AP-002',
    icon: '⚡',
    titre: 'Conflit ressources Lot 4',
    type: 'arbitrage',
    bureau: 'BOP',
    code: '5j',
    priorite: 'haute',
    projet: {
      id: 'PRJ-0018',
      nom: 'Villa Diamniadio',
    },
    montant: 0,
    deadline: 'Demain 12h',
    responsable: {
      nom: 'C. GUEYE',
      id: 'EMP-007',
    },
    contexte: 'Chevauchement équipes maçonnerie entre Lot 4 et chantier Almadies',
    impact: 'Blocage avancement Lot 4 → Retard 3 jours',
    aiSuggestion: {
      action: 'Prioriser Diamniadio, recruter intérimaires Almadies',
      confidence: 0.85,
      reasoning: 'Diamniadio deadline plus serrée, intérimaires disponibles sous 24h',
    },
  },
  {
    id: 'AP-003',
    icon: '💳',
    titre: 'Paiement fournisseur ACME',
    type: 'paiement',
    bureau: 'BCG',
    code: '3j retard',
    priorite: 'haute',
    projet: {
      id: 'PRJ-0017',
      nom: 'Route Zone B',
    },
    montant: 4500000,
    deadline: 'Échue il y a 3j',
    responsable: {
      nom: 'F. DIOP',
      id: 'EMP-004',
    },
    contexte: 'Facture ACME matériaux routiers échue. Risque suspension livraisons.',
    impact: 'Pénalités 150K FCFA + suspension fournisseur',
  },
];

const risksRadar: RiskItem[] = [
  {
    id: 'R-001',
    titre: 'BC bloqué depuis 5 jours',
    description: 'BC-2025-0041 (2.8M FCFA) bloqué au BF depuis 5 jours. Risque rupture stock chantier Diamniadio.',
    source: 'BF',
    score: 92,
    impact: 'majeur',
    probabilite: 'elevee',
    age: 5,
    projet: {
      id: 'PRJ-0018',
      nom: 'Villa Diamniadio',
    },
    solutions: [
      {
        id: 'SOL-001',
        titre: 'Substituer à M. Sarr',
        description: 'Délégation active BC < 2M, disponible immédiatement',
        confidence: 0.92,
        priorite: 1,
      },
      {
        id: 'SOL-002',
        titre: 'Escalader au DG',
        description: 'Si non résolu sous 24h',
        confidence: 0.75,
        priorite: 2,
      },
      {
        id: 'SOL-003',
        titre: 'Stock sécurité',
        description: '3 jours disponible',
        confidence: 0.60,
        priorite: 3,
      },
    ],
  },
  {
    id: 'R-002',
    titre: 'Retard paiement fournisseur',
    description: 'Facture ACME non réglée depuis 3 jours. Risque suspension livraisons.',
    source: 'BCG',
    score: 88,
    impact: 'majeur',
    probabilite: 'elevee',
    age: 3,
    projet: {
      id: 'PRJ-0017',
      nom: 'Route Zone B',
    },
    solutions: [
      {
        id: 'SOL-004',
        titre: 'Paiement immédiat',
        description: 'Valider paiement aujourd\'hui pour éviter suspension',
        confidence: 0.95,
        priorite: 1,
      },
    ],
  },
  {
    id: 'R-003',
    titre: 'Contrat expirant',
    description: 'Contrat sous-traitance BCT expirant dans 7 jours. Renouvellement non initié.',
    source: 'BJA',
    score: 72,
    impact: 'moyen',
    probabilite: 'moyenne',
    age: 0,
    projet: {
      id: 'PRJ-0018',
      nom: 'Villa Diamniadio',
    },
    solutions: [
      {
        id: 'SOL-005',
        titre: 'Initier renouvellement',
        description: 'Démarrer procédure renouvellement aujourd\'hui',
        confidence: 0.80,
        priorite: 1,
      },
    ],
  },
];

const workflowStages: WorkflowStage[] = [
  {
    id: 'initiated',
    label: 'Demandes Initiées',
    count: 247,
    color: 'blue',
    avgTime: 0,
    targetTime: 0,
    isBottleneck: false,
  },
  {
    id: 'bf',
    label: 'Validation BF',
    count: 202,
    color: 'blue',
    bureau: 'BF',
    avgTime: 0.8,
    targetTime: 0.5,
    isBottleneck: true,
  },
  {
    id: 'bj',
    label: 'Validation BJ',
    count: 174,
    color: 'purple',
    bureau: 'BJ',
    avgTime: 0.6,
    targetTime: 0.5,
    isBottleneck: false,
  },
  {
    id: 'bmo',
    label: 'Approuvé BMO',
    count: 151,
    color: 'green',
    bureau: 'BMO',
    avgTime: 0.4,
    targetTime: 0.3,
    isBottleneck: false,
  },
];

const agendaJ7: AgendaEvent[] = [
  {
    id: 'EVT-001',
    date: '2025-12-24',
    time: '17:00',
    titre: 'Deadline Contrat BJA',
    description: 'Contrat sous-traitance électricité',
    type: 'deadline',
    priorite: 'critique',
    bureau: 'BJA',
    projet: 'PRJ-0018',
  },
  {
    id: 'EVT-002',
    date: '2025-12-24',
    time: '10:00',
    titre: 'Réunion coordination',
    description: 'Salle A - Tous bureaux',
    type: 'meeting',
    priorite: 'normal',
  },
  {
    id: 'EVT-003',
    date: '2025-12-25',
    time: '09:00',
    titre: 'Rapport mensuel BMO',
    description: 'À soumettre avant 12h',
    type: 'deadline',
    priorite: 'urgent',
    bureau: 'BMO',
  },
  {
    id: 'EVT-004',
    date: '2025-12-25',
    time: '12:00',
    titre: 'Arbitrage Lot 4',
    description: 'Conflit ressources',
    type: 'meeting',
    priorite: 'normal',
  },
  {
    id: 'EVT-005',
    date: '2025-12-27',
    time: '09:00',
    titre: 'Paiement EIFFAGE',
    description: '8.75M FCFA échéance',
    type: 'deadline',
    priorite: 'urgent',
  },
  {
    id: 'EVT-006',
    date: '2025-12-28',
    time: '08:00',
    titre: 'Visite chantier',
    description: 'Villa Diamniadio',
    type: 'visite',
    priorite: 'normal',
    projet: 'PRJ-0018',
  },
  {
    id: 'EVT-007',
    date: '2026-01-03',
    time: '10:00',
    titre: 'Audience TGI',
    description: 'Contentieux SUNEOR',
    type: 'audience',
    priorite: 'critique',
  },
];

const decisions: Decision[] = [
  {
    id: 'DEC-001',
    code: 'DÉC-2024-001',
    type: 'substitution',
    titre: 'Substitution',
    description: 'Substitution validation BC urgente',
    status: 'en_attente',
    demandeur: {
      nom: 'F. DIOP',
      bureau: 'BF',
    },
    details: {
      cible: 'M. SARR',
      montant: '4.5M FCFA',
      nbBC: 3,
      raison: 'Surcharge BF (12 BC en attente)',
    },
    impact: 'Déblocage sous 24h',
    dateCreation: '2026-01-18T17:18:23.433Z',
  },
  {
    id: 'DEC-002',
    code: 'DÉC-2024-002',
    type: 'delegation',
    titre: 'Délégation',
    description: 'Délégation pouvoir signature',
    status: 'executee',
    demandeur: {
      nom: 'A. DIALLO',
      bureau: 'BMO',
    },
    details: {
      beneficiaire: 'I. FALL',
      perimetre: 'BC < 2M FCFA',
      duree: '3 mois',
    },
    impact: 'Délégation active',
    dateCreation: '2026-01-17T10:00:00.000Z',
    dateExecution: '2026-01-17T18:23:00.000Z',
    validateurFinal: 'A. DIALLO (DG)',
  },
  {
    id: 'DEC-003',
    code: 'DÉC-2024-003',
    type: 'arbitrage',
    titre: 'Arbitrage',
    description: 'Arbitrage conflit ressources Lot 4',
    status: 'en_attente',
    demandeur: {
      nom: 'C. GUEYE',
      bureau: 'BCT',
    },
    details: {
      conflit: 'Équipes maçonnerie',
      projets: 'PRJ-0018 vs PRJ-0016',
      impact: 'Retard 3 jours',
    },
    impact: 'Résolution conflit ressources',
    dateCreation: '2026-01-16T14:30:00.000Z',
  },
];

// Composant Badge Bureau
function BureauBadge({ code, size = 'default' }: { code: BureauCode; size?: 'sm' | 'default' }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-slate-700 text-slate-400',
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      )}
    >
      {code}
    </Badge>
  );
}

export function OverviewView() {
  // Logger avec contexte
  const log = useLogger('OverviewView');

  // Utiliser des sélecteurs explicites pour garantir les re-renders
  const navigate = useDashboardCommandCenterStore((state) => state.navigate);
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);

  // Log de navigation depuis le store
  useEffect(() => {
    log.debug('Navigation depuis store', {
      mainCategory: navigation.mainCategory,
      subCategory: navigation.subCategory,
      filter: navigation.filter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation.mainCategory, navigation.subCategory, navigation.filter]); // log est stable

  // CORRECTION : Normaliser les valeurs du store avec useMemo pour garantir le recalcul
  const { activeMainMenu, activeSubMenu, activeFilter } = useMemo(() => {
    // Récupérer les valeurs du store
    let mainMenu = navigation.mainCategory || 'overview';
    let subMenu = navigation.subCategory || null;
    let filter = navigation.filter || null;

    // Correction pour gérer les valeurs invalides dans le store
    const validMainCategories = ['overview', 'performance', 'actions', 'risks', 'decisions', 'realtime'];
    
    // Si mainCategory est invalide (ex: 'highlights', 'vue-ensemble'), corriger
    if (mainMenu && !validMainCategories.includes(mainMenu as any)) {
      const invalidMainValue = mainMenu as string;
      
      // Si c'est un ID de niveau 3 (filter), déplacer vers filter
      if (invalidMainValue === 'highlights' || invalidMainValue === 'dashboard' || 
          invalidMainValue === 'projets' || invalidMainValue === 'demandes' || 
          invalidMainValue === 'points-cles') {
        // C'est un filter, pas un mainCategory
        filter = invalidMainValue === 'points-cles' ? 'highlights' : invalidMainValue;
        mainMenu = 'overview';
        subMenu = (invalidMainValue === 'highlights' || invalidMainValue === 'dashboard' || 
                   invalidMainValue === 'points-cles') ? 'summary' : (subMenu || 'kpis');
      } else if (invalidMainValue === 'vue-ensemble') {
        // Alias pour 'overview'
        mainMenu = 'overview';
        subMenu = subMenu || 'summary';
        filter = filter || 'dashboard';
      } else {
        // Par défaut, utiliser 'overview'
        mainMenu = 'overview';
        subMenu = subMenu || 'summary';
        filter = filter || 'dashboard';
      }
    }
    
    // Normaliser 'points-cles' → 'highlights' (l'ID réel dans la config)
    if (filter === 'points-cles') {
      filter = 'highlights';
    }
    
    // Valeur par défaut si rien n'est défini
    if (!mainMenu) {
      mainMenu = 'overview';
      subMenu = 'summary';
      filter = 'dashboard';
    }

    const result = {
      activeMainMenu: mainMenu as DashboardMainCategory,
      activeSubMenu: subMenu,
      activeFilter: filter,
    };

    // Log de normalisation si nécessaire
    if (navigation.mainCategory !== mainMenu || navigation.subCategory !== subMenu || navigation.filter !== filter) {
      log.debug('Normalisation appliquée', {
        avant: { mainCategory: navigation.mainCategory, subCategory: navigation.subCategory, filter: navigation.filter },
        après: result,
      });
    }

    return result;
  }, [navigation.mainCategory, navigation.subCategory, navigation.filter]);

  // Log du re-render avec navigation
  useEffect(() => {
    log.debug('Composant re-render avec navigation', {
      mainCategory: navigation.mainCategory,
      subCategory: navigation.subCategory,
      filter: navigation.filter,
      activeMainMenu,
      activeSubMenu,
      activeFilter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation.mainCategory, navigation.subCategory, navigation.filter, activeMainMenu, activeSubMenu, activeFilter]); // log est stable

  // DEBUG : Log après normalisation
  // Évaluer les conditions AVANT le return pour garantir le re-render
  const showDashboard = activeMainMenu === 'overview' && (!activeSubMenu || activeSubMenu === 'summary') && (!activeFilter || activeFilter === 'dashboard');
  const showHighlights = activeMainMenu === 'overview' && activeSubMenu === 'summary' && activeFilter === 'highlights';
  const showProjets = activeMainMenu === 'overview' && activeSubMenu === 'kpis' && activeFilter === 'projets';
  const showDemandes = activeMainMenu === 'overview' && activeSubMenu === 'kpis' && activeFilter === 'demandes';
  const showBudget = activeMainMenu === 'overview' && activeSubMenu === 'kpis' && activeFilter === 'budget';
  
  // Log des valeurs normalisées et conditions
  useEffect(() => {
    log.debug('Valeurs normalisées', {
      activeMainMenu,
      activeSubMenu,
      activeFilter,
    });

    log.debug('Conditions évaluées', {
      'Dashboard principal': showDashboard,
      'Points clés': showHighlights,
      'KPIs Projets': showProjets,
      'KPIs Demandes': showDemandes,
      'KPIs Budget': showBudget,
      'Aucune match': !showDashboard && !showHighlights && !showProjets && !showDemandes && !showBudget,
    });

    // Log détaillé pour chaque condition overview
    if (activeMainMenu === 'overview') {
      log.debug('Détail conditions overview', {
        activeSubMenu,
        activeFilter,
        'check dashboard': (!activeSubMenu || activeSubMenu === 'summary') && (!activeFilter || activeFilter === 'dashboard'),
        'check highlights': activeSubMenu === 'summary' && activeFilter === 'highlights',
        'check projets': activeSubMenu === 'kpis' && activeFilter === 'projets',
        'check demandes': activeSubMenu === 'kpis' && activeFilter === 'demandes',
        'check budget': activeSubMenu === 'kpis' && activeFilter === 'budget',
      });
    }
  }, [activeMainMenu, activeSubMenu, activeFilter, showDashboard, showHighlights, showProjets, showDemandes, showBudget, log]);

  const { data: statsData } = useApiQuery(async (_signal: AbortSignal) => dashboardAPI.getStats({ period: 'month' }), []);
  const { data: actionsData } = useApiQuery(async (_signal: AbortSignal) => dashboardAPI.getActions({ limit: 6 }), []);
  const { data: risksData } = useApiQuery(async (_signal: AbortSignal) => dashboardAPI.getRisks({ limit: 6 }), []);
  const { data: decisionsData } = useApiQuery(async (_signal: AbortSignal) => dashboardAPI.getDecisions({ limit: 3 }), []);

  const kpis = useMemo(() => {
    if (!statsData?.kpis) return mockKPIs;
    return [
      {
        id: 'demandes',
        label: 'Demandes',
        value: Number(statsData.kpis.demandes?.value ?? 0),
        trend: Number(statsData.kpis.demandes?.trend ?? 0),
        icon: FileCheck,
        color: 'blue',
      },
      {
        id: 'validations',
        label: 'Validations',
        value: `${statsData.kpis.validations?.value ?? 0}${statsData.kpis.validations?.unit ?? '%'}`,
        trend: Number(statsData.kpis.validations?.trend ?? 0),
        icon: CheckCircle,
        color: 'emerald',
      },
      {
        id: 'budget',
        label: 'Budget traité',
        value: `${statsData.kpis.budget?.value ?? 0}${statsData.kpis.budget?.unit ? ` ${statsData.kpis.budget.unit}` : ''}`,
        trend: Number(statsData.kpis.budget?.trend ?? 0),
        icon: Wallet,
        color: 'amber',
      },
      {
        id: 'bureaux',
        label: 'Bureaux actifs',
        value: statsData.bureaux?.length ?? 0,
        trend: 0,
        icon: Users,
        color: 'purple',
      },
    ];
  }, [statsData]);

  // Utiliser les données mock enrichies par défaut - Sécurisation avec fallback sur tableaux vides
  const actions: ActionPrioritaire[] = Array.isArray((actionsData as any)?.actions) && (actionsData as any).actions.length > 0 
    ? (actionsData as any).actions 
    : actionsPrioritaires;
  const risks: RiskItem[] = Array.isArray((risksData as any)?.risks) && (risksData as any).risks.length > 0 
    ? (risksData as any).risks 
    : risksRadar;
  const decisionsList: Decision[] = Array.isArray((decisionsData as any)?.decisions) && (decisionsData as any).decisions.length > 0 
    ? (decisionsData as any).decisions 
    : decisions;

  // Helper pour formater les montants
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K FCFA`;
    }
    return `${amount} FCFA`;
  };

  // Calculer les pertes entre étapes du workflow
  const calculateWorkflowLosses = (stages: WorkflowStage[]) => {
    if (!Array.isArray(stages) || stages.length === 0) return [];
    const losses: number[] = [];
    for (let i = 0; i < stages.length - 1; i++) {
      losses.push(stages[i].count - stages[i + 1].count);
    }
    return losses;
  };

  const workflowLosses = calculateWorkflowLosses(workflowStages || []);

  // Grouper les événements par date pour le calendrier
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, AgendaEvent[]> = {};
    if (Array.isArray(agendaJ7)) {
      agendaJ7.forEach((event) => {
        if (!grouped[event.date]) {
          grouped[event.date] = [];
        }
        grouped[event.date].push(event);
      });
    }
    return grouped;
  }, []);

  // Événements aujourd'hui, demain et semaine prochaine
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const todayEvents = Array.isArray(eventsByDate[today]) ? eventsByDate[today] : [];
  const tomorrowEvents = Array.isArray(eventsByDate[tomorrow]) ? eventsByDate[tomorrow] : [];
  const weekEvents = Array.isArray(Object.entries(eventsByDate))
    ? Object.entries(eventsByDate)
        .filter(([date]) => date !== today && date !== tomorrow)
        .slice(0, 3)
        .map(([date, events]) => ({ date, events: Array.isArray(events) ? events : [] }))
    : [];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* DEBUG : Afficher navigation actuelle */}
      <div className="mb-4 bg-yellow-500/20 border border-yellow-500 rounded-lg p-3">
        <p className="text-yellow-300 text-sm font-mono">
          🔍 DEBUG Navigation : {activeMainMenu} → {activeSubMenu || 'null'} → {activeFilter || 'null'}
        </p>
        {navigation.mainCategory !== activeMainMenu && (
          <p className="text-orange-300 text-xs mt-2">
            ⚠️ Valeurs corrigées depuis le store : {navigation.mainCategory} → {activeMainMenu}
          </p>
        )}
      </div>

      {/* Breadcrumb dynamique */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <span>Dashboard</span>
        <ArrowRight className="w-4 h-4" />
        {activeMainMenu === 'overview' && <span>Vue d'ensemble</span>}
        {activeMainMenu === 'performance' && <span>Performance & KPIs</span>}
        {activeSubMenu && (
          <>
            <ArrowRight className="w-4 h-4" />
            <span className="capitalize">{activeSubMenu.replace(/-/g, ' ')}</span>
          </>
        )}
        {activeFilter && (
          <>
            <ArrowRight className="w-4 h-4" />
            <span className="text-white capitalize">{activeFilter.replace(/-/g, ' ')}</span>
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════ */}
      {/* VUE D'ENSEMBLE - Dashboard Principal (défaut) */}
      {/* ════════════════════════════════════════════════ */}
      {showDashboard && (
        <>
      {/* Section KPIs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Performance Globale
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('performance')}
            className="text-slate-400 hover:text-slate-200"
          >
            Voir tout
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.isArray(kpis) && kpis.map((kpi) => {
            const Icon = kpi.icon;
            const iconColorClasses = {
              blue: 'text-blue-400',
              emerald: 'text-emerald-400',
              amber: 'text-amber-400',
              purple: 'text-purple-400',
            }[kpi.color];

            return (
              <button
                key={kpi.id}
                onClick={() => openModal('kpi-drilldown', { kpiId: kpi.id })}
                className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <Icon className={cn('w-5 h-5', iconColorClasses)} />
                  </div>
                  {kpi.trend !== 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                      {kpi.trend > 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-400" />
                      )}
                      {Math.abs(kpi.trend)}%
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-slate-200">{kpi.value}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{kpi.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* NOUVEAU : Section Workflow Pipeline */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-orange-400" />
            Circuit de Validation
          </h3>
          <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300">
            Voir détails <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          {/* Pipeline horizontal */}
          <div className="flex items-center gap-3 mb-6">
            {(Array.isArray(workflowStages) ? workflowStages : []).map((stage, idx) => {
              const bgClass = {
                blue: 'bg-blue-500/20',
                purple: 'bg-purple-500/20',
                green: 'bg-green-500/20',
              }[stage.color] || 'bg-slate-500/20';

              const borderClass = {
                blue: 'border-blue-500',
                purple: 'border-purple-500',
                green: 'border-green-500',
              }[stage.color] || 'border-slate-500';

              const textClass = {
                blue: 'text-blue-400',
                purple: 'text-purple-400',
                green: 'text-green-400',
              }[stage.color] || 'text-slate-400';

              return (
                <React.Fragment key={stage.id}>
                  <div className="flex-1">
                    <div className={cn('rounded-lg p-4 text-center relative border-2', bgClass, borderClass)}>
                      <div className={cn('text-3xl font-bold mb-1', textClass)}>
                        {stage.count}
                      </div>
                      <div className="text-xs text-slate-400">{stage.label}</div>
                      {stage.isBottleneck && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                          ⚠️ Goulot
                        </div>
                      )}
                    </div>
                  </div>
                  {idx < (Array.isArray(workflowStages) ? workflowStages : []).length - 1 && (
                    <div className="flex flex-col items-center">
                      <ArrowRight className="w-6 h-6 text-slate-600" />
                      {Array.isArray(workflowLosses) && workflowLosses[idx] > 0 && (
                        <div className="text-[10px] text-red-400 mt-1">-{workflowLosses[idx]}</div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Stats détaillées */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">2.1j</div>
              <div className="text-xs text-slate-400">Temps moyen total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">0.8j</div>
              <div className="text-xs text-slate-400">Goulot BF (target: 0.5j)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">61%</div>
              <div className="text-xs text-slate-400">Taux validation global</div>
            </div>
          </div>

          {/* Alerte goulot */}
          <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-orange-300 font-medium mb-1">
                Goulot détecté : BF traite en 0.8j (objectif: 0.5j)
              </p>
              <p className="text-xs text-slate-400 mb-2">
                12 BC en attente dépassent le délai standard
              </p>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">IA Suggère:</span>
                <span className="text-xs text-slate-300">
                  Déléguer BC &lt; 2M à M. Sarr pour fluidifier le circuit
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOUVEAU : Section Calendrier J+7 */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            Agenda Exécutif J+7
          </h3>
          <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300">
            Calendrier complet <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Aujourd'hui */}
          <div className="bg-slate-800 rounded-xl border-2 border-orange-500 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <span className="text-lg font-bold text-orange-400">24</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">Aujourd'hui</div>
                <div className="text-xs text-slate-400">Lundi 24 déc.</div>
              </div>
            </div>

            <div className="space-y-2">
              {Array.isArray(todayEvents) && todayEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'rounded-r-lg p-3 border-l-4',
                    event.priorite === 'critique'
                      ? 'bg-red-500/10 border-red-500'
                      : event.priorite === 'urgent'
                      ? 'bg-orange-500/10 border-orange-500'
                      : 'bg-slate-700/30 border-blue-500'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock
                      className={cn(
                        'w-3 h-3',
                        event.priorite === 'critique'
                          ? 'text-red-400'
                          : event.priorite === 'urgent'
                          ? 'text-orange-400'
                          : 'text-slate-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs font-bold',
                        event.priorite === 'critique'
                          ? 'text-red-400'
                          : event.priorite === 'urgent'
                          ? 'text-orange-400'
                          : 'text-slate-300'
                      )}
                    >
                      {event.time}
                    </span>
                    {event.priorite !== 'normal' && (
                      <Badge
                        variant={event.priorite === 'critique' ? 'destructive' : 'warning'}
                        className="text-[10px]"
                      >
                        {event.priorite === 'critique' ? 'CRITIQUE' : 'URGENT'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-white font-medium mb-1">{event.titre}</p>
                  <p className="text-xs text-slate-400">{event.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Demain */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-300">25</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">Demain</div>
                <div className="text-xs text-slate-400">Mardi 25 déc.</div>
              </div>
            </div>

            <div className="space-y-2">
              {Array.isArray(tomorrowEvents) && tomorrowEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'rounded-r-lg p-3 border-l-4',
                    event.priorite === 'critique'
                      ? 'bg-red-500/10 border-red-500'
                      : event.priorite === 'urgent'
                      ? 'bg-orange-500/10 border-orange-500'
                      : 'bg-slate-700/30 border-blue-500'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock
                      className={cn(
                        'w-3 h-3',
                        event.priorite === 'critique'
                          ? 'text-red-400'
                          : event.priorite === 'urgent'
                          ? 'text-orange-400'
                          : 'text-slate-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs font-bold',
                        event.priorite === 'critique'
                          ? 'text-red-400'
                          : event.priorite === 'urgent'
                          ? 'text-orange-400'
                          : 'text-slate-300'
                      )}
                    >
                      {event.time}
                    </span>
                    {event.priorite !== 'normal' && (
                      <Badge
                        variant={event.priorite === 'critique' ? 'destructive' : 'warning'}
                        className="text-[10px]"
                      >
                        {event.priorite === 'critique' ? 'CRITIQUE' : 'URGENT'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-white font-medium mb-1">{event.titre}</p>
                  <p className="text-xs text-slate-400">{event.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* J+3 à J+7 (condensé) */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div className="text-sm font-bold text-white">Semaine prochaine</div>
            </div>

            <div className="space-y-3">
              {Array.isArray(weekEvents) && weekEvents.map(({ date, events }) =>
                Array.isArray(events) && events.length > 0 ? events.map((event) => (
                  <div key={event.id}>
                    <div className="text-xs text-slate-500 mb-2">
                      {new Date(date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    <div
                      className={cn(
                        'rounded-r p-2 border-l-2',
                        event.priorite === 'critique'
                          ? 'bg-red-500/10 border-red-500'
                          : event.priorite === 'urgent'
                          ? 'bg-orange-500/10 border-orange-500'
                          : 'bg-slate-700/30 border-blue-500'
                      )}
                    >
                      <p className="text-sm text-white">{event.titre}</p>
                      <p
                        className={cn(
                          'text-xs',
                          event.priorite === 'critique'
                            ? 'text-red-400'
                            : event.priorite === 'urgent'
                            ? 'text-orange-400'
                            : 'text-slate-400'
                        )}
                      >
                        {event.description}
                      </p>
                    </div>
                  </div>
                )) : null
              )}
            </div>
          </div>
        </div>

        {/* Conflits détectés */}
        <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-orange-300 font-medium mb-2">
                2 conflits détectés dans le planning
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>
                    Jeudi 27 déc. : Livraison matériaux + Visite DG (même équipe BCT)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>
                    Vendredi 28 déc. : 3 réunions simultanées nécessitant N. FAYE (BJ)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Actions Prioritaires ENRICHIE */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-400" />
              Actions Prioritaires
          </h3>
            <div className="flex items-center gap-2">
            <Badge variant="warning">{actions.length}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('actions')}
              className="text-orange-400 hover:text-orange-300"
              >
              Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

        <div className="space-y-4">
          {Array.isArray(actions) && actions.slice(0, 3).map((action) => {
            // Sécurité : valeurs par défaut si propriétés manquantes
            const priorite = action.priorite || 'moyenne';
            const prioriteBadgeVariant = priorite === 'critique' ? 'destructive' : 'warning';
            const iconBgColor = priorite === 'critique' ? 'bg-red-500/20' : 'bg-orange-500/20';
            const icon = action.icon || '📋';
            const titre = action.titre || action.title || 'Action';
            const bureau = action.bureau || 'BMO';
            const code = action.code || action.delay || 'N/A';
            const type = action.type || 'action';

            return (
              <div
                key={action.id}
                className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-orange-500/50 transition-colors"
              >
                {/* Header avec priorité visuelle */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={cn('w-12 h-12 rounded-lg flex items-center justify-center text-2xl', iconBgColor)}
                  >
                    {icon}
                </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white">{titre}</h4>
                      <Badge variant={prioriteBadgeVariant} className="text-xs">
                        {priorite.toUpperCase()}
                  </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <BureauBadge code={bureau as BureauCode} />
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full font-bold">
                        {code}
                      </span>
                      <span className="text-slate-500">• {type}</span>
                    </div>
                  </div>
                </div>

                {/* Contexte métier */}
                {action.projet && (
                  <div className="bg-slate-900/50 rounded-lg p-3 mb-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">Projet:</span>
                      <span className="text-white font-medium">
                        {action.projet.nom} ({action.projet.id})
                      </span>
                    </div>
                    {action.montant && action.montant > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Montant:</span>
                        <span className="text-white font-medium">{formatAmount(action.montant)}</span>
                      </div>
                    )}
                    {action.deadline && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-slate-400">Deadline:</span>
                        <span className="text-orange-400 font-medium">{action.deadline}</span>
                      </div>
                    )}
                    {action.responsable && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Responsable:</span>
                        <span className="text-white">{action.responsable.nom}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description détaillée */}
                {(action.contexte || action.impact) && (
                  <div className="bg-slate-900/30 rounded-lg p-3 mb-3">
                    {action.contexte && (
                      <>
                        <p className="text-xs text-slate-400 mb-1">📋 Contexte</p>
                        <p className="text-sm text-slate-300 mb-2">{action.contexte}</p>
                      </>
                    )}
                    {action.impact && (
                      <>
                        <p className="text-xs text-slate-400 mb-1">⚠️ Impact si non traité</p>
                        <p className="text-sm text-orange-300">{action.impact}</p>
                      </>
                    )}
                  </div>
                )}

                {/* IA Suggestion */}
                {action.aiSuggestion && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-blue-400">
                        IA Suggère ({Math.round(action.aiSuggestion.confidence * 100)}% confiance)
                  </span>
                </div>
                    <p className="text-sm text-slate-300">{action.aiSuggestion.action}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="default" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir détails
                  </Button>
                  <Button size="sm" variant="default" className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Valider
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Users className="w-4 h-4 mr-1" />
                    Déléguer
                  </Button>
                </div>
              </div>
            );
          })}
          </div>
        </section>

      {/* Section Risk Radar ENRICHIE */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
              Risk Radar
          </h3>
            <div className="flex items-center gap-2">
            <Badge variant="destructive">{risks.length}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('risks')}
              className="text-orange-400 hover:text-orange-300"
              >
              Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

        <div className="space-y-4">
          {Array.isArray(risks) && risks.slice(0, 2).map((risk) => {
            const impactLabel: Record<string, string> = {
              mineur: 'Mineur',
              moyen: 'Moyen',
              majeur: 'Majeur',
              critique: 'Critique',
            };
            const probaLabel: Record<string, string> = {
              faible: 'Faible',
              moyenne: 'Moyenne',
              elevee: 'Élevée',
              certaine: 'Certaine',
            };

            return (
              <div
                key={risk.id}
                className="p-4 bg-slate-800 rounded-xl border-l-4 border-l-red-500"
              >
                {/* Header avec score */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-lg bg-red-500 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{risk.score}</span>
                    <span className="text-[10px] text-red-100">score</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1">{risk.titre}</h4>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <Badge variant="destructive" className="text-xs">
                        Impact: {impactLabel[risk.impact]}
                      </Badge>
                      <Badge variant="warning" className="text-xs">
                        Proba: {probaLabel[risk.probabilite]}
                      </Badge>
                      <BureauBadge code={risk.source} size="sm" />
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-medium">
                        {risk.age} jours
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-slate-300 mb-2">{risk.description}</p>
                  {risk.projet && risk.projet.nom && risk.projet.id && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Building2 className="w-3 h-3" />
                      <span>
                        Projet: {risk.projet.nom} ({risk.projet.id})
                      </span>
                    </div>
                  )}
                </div>

                {/* Solutions IA */}
                {risk.solutions && Array.isArray(risk.solutions) && risk.solutions.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-blue-400">Solutions proposées (IA)</span>
                    </div>
                    <div className="space-y-2">
                      {risk.solutions.map((solution) => (
                      <div key={solution.id} className="flex items-start gap-2">
                <div
                  className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                            solution.priorite === 1
                              ? 'bg-green-500/20'
                              : solution.priorite === 2
                              ? 'bg-orange-500/20'
                              : 'bg-yellow-500/20'
                          )}
                        >
                          <span
                    className={cn(
                              'text-xs',
                              solution.priorite === 1
                                ? 'text-green-400'
                                : solution.priorite === 2
                                ? 'text-orange-400'
                                : 'text-yellow-400'
                            )}
                          >
                            {solution.priorite}
                          </span>
                </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-300 font-medium">{solution.titre}</p>
                          <p className="text-xs text-slate-400">{solution.description}</p>
                          {solution.confidence > 0.8 && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="h-1 w-20 bg-slate-700 rounded-full overflow-hidden">
                                <div
                    className={cn(
                                    'h-full bg-green-500',
                                    `w-[${Math.round(solution.confidence * 100)}%]`
                                  )}
                                  style={{ width: `${solution.confidence * 100}%` }}
                                ></div>
                </div>
                              <span className="text-xs text-green-400 font-medium">
                                {Math.round(solution.confidence * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
            ))}
          </div>
      </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="default" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Unlock className="w-4 h-4 mr-1" />
                    Débloquer
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <FileText className="w-4 h-4 mr-1" />
                    Voir détails
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section Décisions Récentes ENRICHIE */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-orange-400" />
            Décisions Récentes
          </h3>
          <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300">
            Voir historique <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.isArray(decisionsList) && decisionsList.slice(0, 3).map((decision) => {
            // Sécurité : valeurs par défaut
            const decisionType = decision.type || 'validation';
            const decisionStatus = decision.status || 'en_attente';
            const decisionCode = decision.code || decision.id || 'N/A';
            const decisionTitre = decision.titre || decision.type || 'Décision';
            const decisionDescription = decision.description || '';

            const typeIcon = {
              substitution: Users,
              delegation: FileText,
              arbitrage: Scale,
              validation: CheckCircle,
            }[decisionType];

            const Icon = typeIcon || FileText;
            const borderColor =
              decisionStatus === 'executee'
                ? 'border-l-green-500'
                : decisionStatus === 'rejetee'
                ? 'border-l-red-500'
                : 'border-l-orange-500';

            return (
              <div
              key={decision.id}
                className={cn('bg-slate-800 rounded-xl p-4 border-l-4', borderColor)}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                <Badge
                      variant={
                        decisionStatus === 'executee'
                          ? 'success'
                          : decisionStatus === 'rejetee'
                          ? 'destructive'
                          : 'warning'
                      }
                  className="text-xs"
                >
                      {decisionStatus === 'executee'
                        ? 'Exécutée'
                        : decisionStatus === 'rejetee'
                        ? 'Rejetée'
                        : 'En attente'}
                </Badge>
                    <span className="text-xs text-slate-500">{decisionCode}</span>
              </div>
                  <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
                </div>

                {/* Type */}
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-bold text-white">{decisionTitre}</span>
                </div>

                {/* Description */}
                {decisionDescription && (
                  <p className="text-sm text-slate-300 mb-3">{decisionDescription}</p>
                )}

                {/* Détails */}
                <div className="bg-slate-900/50 rounded-lg p-3 mb-3 space-y-2">
                  {decisionType === 'substitution' && (
                    <>
                      {decision.demandeur && (
                        <div className="flex items-center gap-2 text-xs">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Demandeur:</span>
                          <span className="text-white">
                            {decision.demandeur.nom || 'N/A'} ({decision.demandeur.bureau || 'N/A'})
                          </span>
                        </div>
                      )}
                      {decision.details?.cible && (
                        <div className="flex items-center gap-2 text-xs">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Cible:</span>
                          <span className="text-white">{decision.details.cible}</span>
                        </div>
                      )}
                      {decision.details?.montant && (
                        <div className="flex items-center gap-2 text-xs">
                          <DollarSign className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Montant:</span>
                          <span className="text-white">{decision.details.montant}</span>
                        </div>
                      )}
                      {decision.details?.raison && (
                        <div className="flex items-center gap-2 text-xs">
                          <AlertCircle className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Raison:</span>
                          <span className="text-white">{decision.details.raison}</span>
                        </div>
                      )}
                    </>
                  )}

                  {decisionType === 'delegation' && (
                    <>
                      {decision.details?.beneficiaire && (
                        <div className="flex items-center gap-2 text-xs">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Bénéficiaire:</span>
                          <span className="text-white">{decision.details.beneficiaire}</span>
                        </div>
                      )}
                      {decision.details?.perimetre && (
                        <div className="flex items-center gap-2 text-xs">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Périmètre:</span>
                          <span className="text-white">{decision.details.perimetre}</span>
                        </div>
                      )}
                      {decision.details?.duree && (
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Durée:</span>
                          <span className="text-white">{decision.details.duree}</span>
                        </div>
                      )}
                      {decision.validateurFinal && (
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-slate-400">Validé par:</span>
                          <span className="text-white">{decision.validateurFinal}</span>
                        </div>
                      )}
                      {decision.dateExecution && (
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Date:</span>
                          <span className="text-white">
                            {new Date(decision.dateExecution).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {decisionType === 'arbitrage' && (
                    <>
                      {decision.demandeur && (
                        <div className="flex items-center gap-2 text-xs">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Demandeur:</span>
                          <span className="text-white">
                            {decision.demandeur.nom || 'N/A'} ({decision.demandeur.bureau || 'N/A'})
                          </span>
                        </div>
                      )}
                      {decision.details?.conflit && (
                        <div className="flex items-center gap-2 text-xs">
                          <AlertTriangle className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Conflit:</span>
                          <span className="text-white">{decision.details.conflit}</span>
                        </div>
                      )}
                      {decision.details?.projets && (
                        <div className="flex items-center gap-2 text-xs">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Projets:</span>
                          <span className="text-white">{decision.details.projets}</span>
                        </div>
                      )}
                      {decision.details?.impact && (
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3 text-orange-400" />
                          <span className="text-slate-400">Impact:</span>
                          <span className="text-orange-400">{decision.details.impact}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Impact ou Options */}
                {decisionStatus === 'en_attente' && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-3">
                    {decisionType === 'arbitrage' ? (
                      <>
                        <p className="text-xs text-blue-300 mb-2">
                          <span className="font-semibold">Options:</span>
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                            <span>[A] Prioriser Diamniadio</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                            <span>[B] Recruter intérimaires</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      decision.impact && (
                        <p className="text-xs text-blue-300">
                          <span className="font-semibold">Impact:</span> {decision.impact}
                        </p>
                      )
                    )}
                  </div>
                )}

                {/* Actions */}
                {decisionStatus === 'en_attente' ? (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {decisionType === 'arbitrage' ? 'Arbitrer' : 'Approuver'}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <XCircle className="w-3 h-3 mr-1" />
                      Rejeter
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="w-3 h-3 mr-1" />
                    Voir détails
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>
        </>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* SYNTHÈSE → Points Clés */}
      {/* ════════════════════════════════════════════════ */}
      {showHighlights && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Points Clés</h2>
            <p className="text-slate-400">Indicateurs stratégiques essentiels</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* KPI Card 1 */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border-2 border-blue-500/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Taux de validation</p>
                  <p className="text-3xl font-bold text-white">89%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>+3% vs mois dernier</span>
              </div>
            </div>

            {/* KPI Card 2 */}
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl p-6 border-2 border-orange-500/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Temps moyen</p>
                  <p className="text-3xl font-bold text-white">2.4j</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <TrendingDown className="w-4 h-4" />
                <span>-0.3j amélioration</span>
              </div>
            </div>

            {/* KPI Card 3 */}
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-6 border-2 border-red-500/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Risques critiques</p>
                  <p className="text-3xl font-bold text-white">3</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <TrendingDown className="w-4 h-4" />
                <span>-1 résolu aujourd'hui</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* KPIs → Projets */}
      {/* ════════════════════════════════════════════════ */}
      {showProjets && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">KPIs par Projet</h2>
            <p className="text-slate-400">Indicateurs détaillés par projet</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-white">PRJ-0018 - Villa Diamniadio</h4>
                <Badge className="bg-blue-500">68%</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Budget</span>
                  <span className="text-white font-medium">36.4M FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Dépensé</span>
                  <span className="text-white font-medium">24.7M FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Équipe</span>
                  <span className="text-white font-medium">8 agents</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avancement</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[68%] bg-blue-500"></div>
                    </div>
                    <span className="text-white font-medium">68%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-white">PRJ-0017 - Route Zone B</h4>
                <Badge className="bg-orange-500">45%</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Budget</span>
                  <span className="text-white font-medium">125M FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Dépensé</span>
                  <span className="text-white font-medium">56.2M FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Équipe</span>
                  <span className="text-white font-medium">15 agents</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avancement</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-orange-500"></div>
                    </div>
                    <span className="text-white font-medium">45%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* KPIs → Budget */}
      {/* ════════════════════════════════════════════════ */}
      {showBudget && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">KPIs Budget</h2>
            <p className="text-slate-400">Suivi budgétaire détaillé</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-5xl font-bold text-white mb-2">4.2 Mds</p>
                <p className="text-slate-400">Budget traité</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-green-400 mb-2">67%</p>
                <p className="text-slate-400">Taux exécution</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-orange-400 mb-2">1.4 Mds</p>
                <p className="text-slate-400">Reste à traiter</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* KPIs → Demandes */}
      {/* ════════════════════════════════════════════════ */}
      {showDemandes && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">KPIs Demandes</h2>
            <p className="text-slate-400">Statistiques sur les demandes</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-4xl font-bold text-white mb-2">247</p>
              <p className="text-sm text-slate-400">Total demandes</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-4xl font-bold text-green-400 mb-2">202</p>
              <p className="text-sm text-slate-400">En cours</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-4xl font-bold text-orange-400 mb-2">31</p>
              <p className="text-sm text-slate-400">En attente</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-4xl font-bold text-red-400 mb-2">14</p>
              <p className="text-sm text-slate-400">Urgentes</p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* Si rien ne match : Message par défaut */}
      {/* ════════════════════════════════════════════════ */}
      {!(activeMainMenu === 'overview' && (!activeSubMenu || activeSubMenu === 'summary') && (!activeFilter || activeFilter === 'dashboard')) &&
       !(activeMainMenu === 'overview' && activeSubMenu === 'summary' && activeFilter === 'highlights') &&
       !(activeMainMenu === 'overview' && activeSubMenu === 'kpis' && activeFilter === 'projets') &&
       !(activeMainMenu === 'overview' && activeSubMenu === 'kpis' && activeFilter === 'demandes') &&
       !(activeMainMenu === 'overview' && activeSubMenu === 'kpis' && activeFilter === 'budget') && (
        <div className="text-center py-20">
          <BarChart3 className="w-20 h-20 mx-auto text-slate-700 mb-4" />
          <p className="text-xl text-slate-400">
            Vue non implémentée : {activeMainMenu} → {activeSubMenu || 'null'} → {activeFilter || 'null'}
          </p>
        </div>
      )}
    </div>
  );
}

