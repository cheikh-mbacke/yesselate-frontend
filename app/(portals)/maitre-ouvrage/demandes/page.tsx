'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PilotageBanner,
  SmartFilters,
  IntelligentSearch,
  DemandDetailsModal,
  RequestComplementModal,
  IntelligentAssignmentModal,
  DemandTimeline,
  DemandHeatmap,
} from '@/components/features/bmo/demandes';
import {
  demands,
  bureaux,
  decisions,
  echangesBureaux,
  employees,
} from '@/lib/data';
import type { DemandStatus, Priority, Demand } from '@/lib/types/bmo.types';
import { ArrowDown, ArrowUp, ArrowUpDown, BarChart3, Clock, Eye, FileText, Flame, ShieldAlert, ThumbsDown, ThumbsUp, UserPlus, X } from 'lucide-react';
import { usePageNavigation, useCrossPageLinks } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
import { useSearchParams } from 'next/navigation';

// Utilitaire pour générer un hash SHA3-256 simulé
const generateHash = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `SHA3:${Math.abs(hash).toString(16).padStart(12, '0')}...`;
};

// Calculer le délai en jours depuis une date DD/MM/YYYY
const calculateDelay = (dateStr: string): number => {
  const [day, month, year] = dateStr.split('/').map(Number);
  const demandDate = new Date(year, month - 1, day);
  const today = new Date();
  const diffTime = today.getTime() - demandDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

type MainTab = 'organisation' | 'pilotage' | 'insights';
type OrganisationAxis = 'bureau' | 'type' | 'priorite' | 'statut' | 'sla';
type PilotageSubTab = 'timeline' | 'heatmap';

interface AdvancedFilters {
  bureau?: string[];
  type?: string[];
  priority?: string[];
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: string;
  amountMax?: string;
  project?: string;
}

type EnrichedDemand = Demand & {
  delayDays: number;
  isOverdue: boolean;
  status: DemandStatus;
};

const MAIN_TABS: MainTab[] = ['organisation', 'pilotage', 'insights'];
const ORGANISATION_AXES: OrganisationAxis[] = ['bureau', 'statut', 'sla', 'type', 'priorite'];
const PILOTAGE_SUBTABS: PilotageSubTab[] = ['timeline', 'heatmap'];

const safeMainTab = (value: string | null | undefined): MainTab | null => {
  if (!value) return null;
  return (MAIN_TABS as string[]).includes(value) ? (value as MainTab) : null;
};

const safeOrganisationAxis = (value: string | null | undefined): OrganisationAxis | null => {
  if (!value) return null;
  return (ORGANISATION_AXES as string[]).includes(value) ? (value as OrganisationAxis) : null;
};

const safePilotageSubTab = (value: string | null | undefined): PilotageSubTab | null => {
  if (!value) return null;
  return (PILOTAGE_SUBTABS as string[]).includes(value) ? (value as PilotageSubTab) : null;
};

const safePriority = (value: string | null | undefined): Priority | null => {
  if (!value) return null;
  return (['urgent', 'high', 'normal', 'low'] as string[]).includes(value) ? (value as Priority) : null;
};

type SortKey = 'delay' | 'date' | 'priority' | 'amount';
type SortDir = 'asc' | 'desc';

const priorityScore = (p: Priority): number => {
  switch (p) {
    case 'urgent': return 4;
    case 'high': return 3;
    case 'normal': return 2;
    case 'low': return 1;
  }
};

const parseDDMMYYYY = (dateStr: string): number => {
  const [day, month, year] = dateStr.split('/').map(Number);
  const d = new Date(year, (month ?? 1) - 1, day ?? 1);
  return d.getTime();
};

const parseMoney = (amount: string): number => {
  if (!amount || amount === '—' || amount === 'N/A') return -1;
  // "1,250,000" -> 1250000
  const normalized = amount.replace(/[^\d]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : -1;
};

export default function DemandesPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const searchParams = useSearchParams();

  // Navigation automatique
  const { updateFilters } = usePageNavigation('demandes');
  const crossPageLinks = useCrossPageLinks('demandes');

  // Statut local (mock vivant): rend les sous-onglets "Validées/Rejetées" fonctionnels
  const [statusById, setStatusById] = useState<Record<string, DemandStatus>>(() => {
    const initial: Record<string, DemandStatus> = {};
    demands.forEach((d) => {
      initial[d.id] = d.status ?? 'pending';
    });
    return initial;
  });

  const [mainTab, setMainTab] = useState<MainTab>('organisation');
  const [organisationAxis, setOrganisationAxis] = useState<OrganisationAxis>('bureau');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupQuery, setGroupQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('delay');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [pilotageSubTab, setPilotageSubTab] = useState<PilotageSubTab>('timeline');
  const [filter, setFilter] = useState<'all' | Priority>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showComplementModal, setShowComplementModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [heatmapGroupBy, setHeatmapGroupBy] = useState<'bureau' | 'priority' | 'type'>('bureau');

  // Sync onglets <-> URL (pour pouvoir deep-link et garder l'état lors navigation)
  useEffect(() => {
    const urlTab = safeMainTab(searchParams.get('tab')) ?? 'organisation';
    const urlSubtab = searchParams.get('subtab');
    const urlFilter = searchParams.get('filter');
    const urlGroup = searchParams.get('group');

    setMainTab(urlTab);

    // Compat: anciens liens /demandes?filter=validated|rejected
    if (urlFilter === 'validated') {
      setOrganisationAxis('statut');
      setSelectedGroup('validated');
    } else if (urlFilter === 'rejected') {
      setOrganisationAxis('statut');
      setSelectedGroup('rejected');
    } else if (urlTab === 'organisation') {
      const nextAxis = safeOrganisationAxis(urlSubtab) ?? 'bureau';
      setOrganisationAxis(nextAxis);
      setSelectedGroup(urlGroup ?? null);
    } else if (urlTab === 'pilotage') {
      setPilotageSubTab(safePilotageSubTab(urlSubtab) ?? 'timeline');
    }
  }, [searchParams]);

  const setTabInUrl = useCallback((next: { tab: MainTab; subtab?: string; group?: string | null }) => {
    // Ne pas polluer l'URL: on conserve uniquement tab/subtab/filter (si présent)
    const filterParam = searchParams.get('filter');
    const payload: Record<string, string> = { tab: next.tab };
    if (next.subtab) payload.subtab = next.subtab;
    if (next.group) payload.group = next.group;
    if (filterParam) payload.filter = filterParam;
    updateFilters(payload, true);
  }, [searchParams, updateFilters]);

  // Synchronisation automatique des comptages pour la sidebar
  useAutoSyncCounts('demandes', () => {
    return enrichedDemands.filter(d => d.status === 'pending').length;
  }, { interval: 10000, immediate: true });

  // Enrichir les demandes avec le délai calculé + statut vivant
  const enrichedDemands: EnrichedDemand[] = useMemo(() => {
    return demands.map((d) => {
      const status = statusById[d.id] ?? d.status ?? 'pending';
      const delayDays = calculateDelay(d.date);
      return {
        ...d,
        status,
        delayDays,
        isOverdue: delayDays > 7 && status !== 'validated',
      };
    });
  }, [statusById]);

  // Filtrer les demandes avec tous les filtres
  const filteredDemands: EnrichedDemand[] = useMemo(() => {
    let result = enrichedDemands;

    // Filtre priorité simple
    if (filter !== 'all') {
      result = result.filter(d => d.priority === filter);
    }

    // Filtre recherche
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.subject.toLowerCase().includes(lowerQuery) ||
        d.id.toLowerCase().includes(lowerQuery) ||
        d.bureau.toLowerCase().includes(lowerQuery) ||
        d.type.toLowerCase().includes(lowerQuery)
      );
    }

    // Filtres avancés
    if (advancedFilters.bureau && advancedFilters.bureau.length > 0) {
      result = result.filter(d => advancedFilters.bureau!.includes(d.bureau));
    }

    if (advancedFilters.type && advancedFilters.type.length > 0) {
      result = result.filter(d => advancedFilters.type!.includes(d.type));
    }

    if (advancedFilters.priority && advancedFilters.priority.length > 0) {
      result = result.filter(d => advancedFilters.priority!.includes(d.priority));
    }

    if (advancedFilters.status && advancedFilters.status.length > 0) {
      result = result.filter(d => {
        return advancedFilters.status!.includes(d.status);
      });
    }

    // Filtres de date
    if (advancedFilters.dateFrom || advancedFilters.dateTo) {
      result = result.filter(d => {
        const [day, month, year] = d.date.split('/').map(Number);
        const demandDate = new Date(year, month - 1, day);
        
        if (advancedFilters.dateFrom) {
          const fromDate = new Date(advancedFilters.dateFrom);
          if (demandDate < fromDate) return false;
        }
        
        if (advancedFilters.dateTo) {
          const toDate = new Date(advancedFilters.dateTo);
          if (demandDate > toDate) return false;
        }
        
        return true;
      });
    }

    // Filtre projet (simulé)
    if (advancedFilters.project) {
      result = result.filter(d => d.subject.toLowerCase().includes(advancedFilters.project!.toLowerCase()));
    }

    return result;
  }, [enrichedDemands, filter, searchQuery, advancedFilters]);

  // Important: les regroupements Organisation sont une "lentille" (non destructive).
  // On ne modifie pas `advancedFilters`/`filter` quand on clique un groupe, pour éviter l'effet "figé".
  const visibleDemands: EnrichedDemand[] = useMemo(() => {
    if (!selectedGroup) return filteredDemands;

    if (organisationAxis === 'bureau') {
      return filteredDemands.filter((d) => d.bureau === selectedGroup);
    }

    if (organisationAxis === 'type') {
      return filteredDemands.filter((d) => d.type === selectedGroup);
    }

    if (organisationAxis === 'priorite') {
      const prio = safePriority(selectedGroup);
      return prio ? filteredDemands.filter((d) => d.priority === prio) : filteredDemands;
    }

    if (organisationAxis === 'statut') {
      const status = selectedGroup as DemandStatus;
      if (status === 'pending' || status === 'validated' || status === 'rejected') {
        return filteredDemands.filter((d) => d.status === status);
      }
      return filteredDemands;
    }

    // SLA
    if (selectedGroup === 'en-retard') {
      return filteredDemands.filter(d => d.isOverdue && d.status !== 'validated');
    }
    if (selectedGroup === 'a-jour') {
      return filteredDemands.filter(d => !d.isOverdue || d.status === 'validated');
    }

    return filteredDemands;
  }, [filteredDemands, organisationAxis, selectedGroup]);

  const sortedVisibleDemands: EnrichedDemand[] = useMemo(() => {
    const base = [...visibleDemands];
    const dir = sortDir === 'asc' ? 1 : -1;

    base.sort((a, b) => {
      let av = 0;
      let bv = 0;

      if (sortKey === 'delay') {
        av = a.delayDays;
        bv = b.delayDays;
      } else if (sortKey === 'date') {
        av = parseDDMMYYYY(a.date);
        bv = parseDDMMYYYY(b.date);
      } else if (sortKey === 'priority') {
        av = priorityScore(a.priority);
        bv = priorityScore(b.priority);
      } else if (sortKey === 'amount') {
        av = parseMoney(a.amount);
        bv = parseMoney(b.amount);
      }

      if (av === bv) return a.id.localeCompare(b.id);
      return av > bv ? dir : -dir;
    });

    return base;
  }, [visibleDemands, sortDir, sortKey]);

  type GroupItem = {
    id: string;
    title: string;
    subtitle?: string;
    count: number;
    urgent?: number;
    overdue?: number;
    badgeVariant?: 'default' | 'urgent' | 'warning' | 'success' | 'info' | 'gold' | 'gray';
    accentColor?: string;
    icon?: string;
  };

  const groupItems: GroupItem[] = useMemo(() => {
    const q = groupQuery.trim().toLowerCase();

    const match = (item: GroupItem) => {
      if (!q) return true;
      const hay = `${item.title} ${item.subtitle ?? ''}`.toLowerCase();
      return hay.includes(q);
    };

    if (organisationAxis === 'bureau') {
      return bureaux
        .filter((b) => filteredDemands.some((d) => d.bureau === b.code))
        .map((b) => {
          const list = filteredDemands.filter((d) => d.bureau === b.code);
          const urgent = list.filter((d) => d.priority === 'urgent' && d.status === 'pending').length;
          const overdue = list.filter((d) => d.isOverdue && d.status !== 'validated').length;
          return {
            id: b.code,
            title: b.code,
            subtitle: b.name,
            icon: b.icon,
            count: list.length,
            urgent,
            overdue,
            badgeVariant: overdue > 0 ? 'urgent' : urgent > 0 ? 'warning' : 'default',
            accentColor: b.color,
          } satisfies GroupItem;
        })
        .filter(match)
        .sort((a, b) => (b.overdue ?? 0) - (a.overdue ?? 0) || (b.urgent ?? 0) - (a.urgent ?? 0) || b.count - a.count || a.id.localeCompare(b.id));
    }

    if (organisationAxis === 'type') {
      return Array.from(new Set(filteredDemands.map((d) => d.type)))
        .map((t) => {
          const list = filteredDemands.filter((d) => d.type === t);
          const urgent = list.filter((d) => d.priority === 'urgent' && d.status === 'pending').length;
          const overdue = list.filter((d) => d.isOverdue && d.status !== 'validated').length;
          return { id: t, title: t, count: list.length, urgent, overdue, badgeVariant: overdue > 0 ? 'urgent' : urgent > 0 ? 'warning' : 'default' } satisfies GroupItem;
        })
        .filter(match)
        .sort((a, b) => (b.overdue ?? 0) - (a.overdue ?? 0) || (b.urgent ?? 0) - (a.urgent ?? 0) || b.count - a.count || a.id.localeCompare(b.id));
    }

    if (organisationAxis === 'priorite') {
      const priorities: Array<{ id: Priority; label: string; variant: GroupItem['badgeVariant'] }> = [
        { id: 'urgent', label: 'Urgent', variant: 'urgent' },
        { id: 'high', label: 'Élevée', variant: 'warning' },
        { id: 'normal', label: 'Normale', variant: 'default' },
        { id: 'low', label: 'Basse', variant: 'gray' },
      ];
      return priorities
        .map((p) => {
          const list = filteredDemands.filter((d) => d.priority === p.id);
          const overdue = list.filter((d) => d.isOverdue && d.status !== 'validated').length;
          return { id: p.id, title: p.label, count: list.length, overdue, badgeVariant: overdue > 0 ? 'urgent' : p.variant } satisfies GroupItem;
        })
        .filter(match)
        .sort((a, b) => b.count - a.count);
    }

    if (organisationAxis === 'statut') {
      const statuses: Array<{ id: DemandStatus; label: string; variant: GroupItem['badgeVariant'] }> = [
        { id: 'pending', label: 'À traiter', variant: 'warning' },
        { id: 'validated', label: 'Validées', variant: 'success' },
        { id: 'rejected', label: 'Rejetées', variant: 'urgent' },
      ];
      return statuses
        .map((s) => {
          const list = filteredDemands.filter((d) => d.status === s.id);
          const overdue = list.filter((d) => d.isOverdue && d.status !== 'validated').length;
          return { id: s.id, title: s.label, count: list.length, overdue, badgeVariant: s.variant } satisfies GroupItem;
        })
        .filter(match)
        .sort((a, b) => b.count - a.count);
    }

    // SLA
    const overdue = filteredDemands.filter((d) => d.isOverdue && d.status !== 'validated').length;
    const onTime = filteredDemands.filter((d) => !d.isOverdue || d.status === 'validated').length;
    return ([
      { id: 'en-retard', title: 'En retard', count: overdue, badgeVariant: 'urgent' },
      { id: 'a-jour', title: 'À jour', count: onTime, badgeVariant: 'success' },
    ] satisfies GroupItem[]).filter(match);
  }, [filteredDemands, groupQuery, organisationAxis]);

  // Stats globales
  const globalStats = useMemo(() => ({
    total: filteredDemands.length,
    urgent: filteredDemands.filter((d) => d.priority === 'urgent').length,
    high: filteredDemands.filter((d) => d.priority === 'high').length,
    normal: filteredDemands.filter((d) => d.priority === 'normal').length,
    avgDelay: filteredDemands.length > 0 ? Math.round(filteredDemands.reduce((a, d) => a + d.delayDays, 0) / filteredDemands.length) : 0,
    overdue: filteredDemands.filter(d => d.isOverdue).length,
    pending: filteredDemands.filter(d => d.status === 'pending').length,
    validated: filteredDemands.filter(d => d.status === 'validated').length,
    rejected: filteredDemands.filter(d => d.status === 'rejected').length,
  }), [filteredDemands]);

  // Stats par bureau
  const statsByBureau = useMemo(() => {
    const stats: Record<string, { total: number; urgent: number; avgDelay: number }> = {};
    bureaux.forEach((b) => {
      const bureauDemands = filteredDemands.filter((d) => d.bureau === b.code);
      stats[b.code] = {
        total: bureauDemands.length,
        urgent: bureauDemands.filter((d) => d.priority === 'urgent').length,
        avgDelay: bureauDemands.length > 0
          ? Math.round(bureauDemands.reduce((a, d) => a + d.delayDays, 0) / bureauDemands.length)
          : 0,
      };
    });
    return stats;
  }, [filteredDemands]);

  // Preuves liées à une demande
  const getProofsForDemand = (demandId: string) => {
    const relatedDecisions = decisions.filter((d) =>
      d.subject.includes(demandId) || d.subject.includes(demandId.replace('DEM-', ''))
    );
    const relatedExchanges = echangesBureaux.filter((e) =>
      e.subject.toLowerCase().includes(demandId.toLowerCase())
    );
    return { decisions: relatedDecisions, exchanges: relatedExchanges };
  };

  // Actions sur demande
  const handleValidate = (demand: Demand) => {
    const hash = generateHash(`${demand.id}-${Date.now()}-validate`);
    setStatusById((prev) => ({ ...prev, [demand.id]: 'validated' }));
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'validation',
      module: 'demandes',
      targetId: demand.id,
      targetType: 'Demande',
      targetLabel: demand.subject,
      details: `Demande validée - Hash: ${hash}`,
      bureau: demand.bureau,
    });
    addToast(`${demand.id} validée ✓ - Hash: ${hash.slice(0, 20)}...`, 'success');
  };

  const handleReject = (demand: Demand) => {
    const hash = generateHash(`${demand.id}-${Date.now()}-reject`);
    setStatusById((prev) => ({ ...prev, [demand.id]: 'rejected' }));
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'rejection',
      module: 'demandes',
      targetId: demand.id,
      targetType: 'Demande',
      targetLabel: demand.subject,
      details: `Demande rejetée - Hash: ${hash}`,
      bureau: demand.bureau,
    });
    addToast(`${demand.id} rejetée`, 'warning');
  };

  const handleRequestComplement = (demand: Demand) => {
    setSelectedDemand(demand);
    setShowComplementModal(true);
    addToast(`Ouverture de la modale de complément pour ${demand.id}`, 'info');
  };

  const handleAssign = (demand: Demand, employeeId?: string) => {
    if (employeeId) {
      const employee = employees.find((e) => e.id === employeeId);
      if (employee) {
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'delegation',
          module: 'demandes',
          targetId: demand.id,
          targetType: 'Demande',
          targetLabel: demand.subject,
          details: `Assignée à ${employee.name}`,
          bureau: demand.bureau,
        });
        addToast(`${demand.id} assignée à ${employee.name}`, 'success');
      }
    } else {
      setSelectedDemand(demand);
      setShowAssignmentModal(true);
    }
  };

  const handleAction = (action: 'resolve' | 'assign' | 'escalate' | 'replanify' | 'addNote' | 'addDocument') => {
    if (!selectedDemand) return;

    switch (action) {
      case 'resolve':
        handleValidate(selectedDemand);
        setShowDetailsModal(false);
        break;
      case 'assign':
        setShowDetailsModal(false);
        // Ouvrir la modale d'affectation après un court délai
        setTimeout(() => {
          setShowAssignmentModal(true);
        }, 300);
        break;
      case 'escalate':
        addToast(`Escalade de ${selectedDemand.id} vers le BMO`, 'warning');
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'escalation',
          module: 'demandes',
          targetId: selectedDemand.id,
          targetType: 'Demande',
          targetLabel: selectedDemand.subject,
          details: `Escalade vers le BMO`,
          bureau: selectedDemand.bureau,
        });
        break;
      case 'replanify':
        addToast(`Replanification de ${selectedDemand.id}`, 'info');
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'modification',
          module: 'demandes',
          targetId: selectedDemand.id,
          targetType: 'Demande',
          targetLabel: selectedDemand.subject,
          details: `Demande replanifiée`,
          bureau: selectedDemand.bureau,
        });
        break;
      case 'addNote':
        addToast('Note ajoutée avec succès', 'success');
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'modification',
          module: 'demandes',
          targetId: selectedDemand.id,
          targetType: 'Demande',
          targetLabel: selectedDemand.subject,
          details: `Note ajoutée`,
          bureau: selectedDemand.bureau,
        });
        break;
      case 'addDocument':
        addToast('Document ajouté avec succès', 'success');
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'modification',
          module: 'demandes',
          targetId: selectedDemand.id,
          targetType: 'Demande',
          targetLabel: selectedDemand.subject,
          details: `Document ajouté`,
          bureau: selectedDemand.bureau,
        });
        break;
    }
  };

  const handleFilterClick = (filterType: 'urgent' | 'overdue' | 'blocked') => {
    if (filterType === 'urgent') {
      setFilter('urgent');
      setMainTab('organisation');
      setOrganisationAxis('priorite');
      setSelectedGroup('urgent');
      setTabInUrl({ tab: 'organisation', subtab: 'priorite', group: 'urgent' });
      addToast('Filtrage des demandes urgentes', 'info');
    } else if (filterType === 'overdue') {
      const overdueDemands = enrichedDemands.filter(d => d.isOverdue);
      setMainTab('organisation');
      setOrganisationAxis('sla');
      setSelectedGroup('en-retard');
      setTabInUrl({ tab: 'organisation', subtab: 'sla', group: 'en-retard' });
      setFilter('all');
      addToast(overdueDemands.length > 0 ? `${overdueDemands.length} demande(s) en retard` : 'Aucune demande en retard', overdueDemands.length > 0 ? 'warning' : 'info');
    } else if (filterType === 'blocked') {
      setFilter('all');
      const blockedCount = enrichedDemands.filter(d => d.status === 'pending').length;
      setMainTab('organisation');
      setOrganisationAxis('statut');
      setSelectedGroup('pending');
      setTabInUrl({ tab: 'organisation', subtab: 'statut', group: 'pending' });
      addToast(`${blockedCount} demande(s) bloquée(s)`, 'warning');
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header amélioré */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Demandes à traiter
            <Badge variant={globalStats.pending > 0 ? 'warning' : 'success'}>{globalStats.pending}</Badge>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Console d&apos;organisation • regroupements, filtres et pilotage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SmartFilters
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
          />
        </div>
      </div>

      {/* Bandeau de pilotage */}
      <PilotageBanner
        demands={enrichedDemands}
        onFilterClick={handleFilterClick}
      />

      {/* Onglets principaux */}
      <Tabs
        value={mainTab}
        onValueChange={(value) => {
          const next = safeMainTab(value) ?? 'organisation';
          setMainTab(next);
          if (next === 'organisation') setTabInUrl({ tab: next, subtab: organisationAxis, group: selectedGroup });
          if (next === 'pilotage') setTabInUrl({ tab: next, subtab: pilotageSubTab });
          if (next === 'insights') setTabInUrl({ tab: next });
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList className="bg-slate-900/60">
              <TabsTrigger value="organisation">Organisation</TabsTrigger>
              <TabsTrigger value="pilotage">Pilotage</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => crossPageLinks.goToGovernance('alerts')}
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                Aller aux alertes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => crossPageLinks.goToAnalytics('demandes')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>

          {/* KPIs rapides (toujours visibles) */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Card className="border-slate-700/60">
              <CardContent className="p-3">
                <div className="text-xs text-slate-400">À traiter</div>
                <div className="text-lg font-bold">{globalStats.pending}</div>
              </CardContent>
            </Card>
            <Card className="border-slate-700/60">
              <CardContent className="p-3">
                <div className="text-xs text-slate-400 flex items-center gap-2"><Flame className="w-4 h-4 text-red-400" />Urgentes</div>
                <div className="text-lg font-bold text-red-400">{globalStats.urgent}</div>
              </CardContent>
            </Card>
            <Card className="border-slate-700/60">
              <CardContent className="p-3">
                <div className="text-xs text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" />En retard</div>
                <div className="text-lg font-bold text-amber-400">{globalStats.overdue}</div>
              </CardContent>
            </Card>
            <Card className="border-slate-700/60">
              <CardContent className="p-3">
                <div className="text-xs text-slate-400 flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-emerald-400" />Validées</div>
                <div className="text-lg font-bold text-emerald-400">{globalStats.validated}</div>
              </CardContent>
            </Card>
            <Card className="border-slate-700/60">
              <CardContent className="p-3">
                <div className="text-xs text-slate-400 flex items-center gap-2"><ThumbsDown className="w-4 h-4 text-rose-400" />Rejetées</div>
                <div className="text-lg font-bold text-rose-400">{globalStats.rejected}</div>
              </CardContent>
            </Card>
            <Card className="border-slate-700/60">
              <CardContent className="p-3">
                <div className="text-xs text-slate-400">Délai moyen</div>
                <div className="text-lg font-bold">{globalStats.avgDelay}j</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* === ORGANISATION === */}
        <TabsContent value="organisation">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
            {/* Panneau regroupements */}
            <Card className="border-slate-700/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <span>Organisation</span>
                  <Badge variant="default">{filteredDemands.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Tabs
                  value={organisationAxis}
                  onValueChange={(value) => {
                    const next = safeOrganisationAxis(value) ?? 'bureau';
                    setOrganisationAxis(next);
                    setSelectedGroup(null);
                    setGroupQuery('');
                    setTabInUrl({ tab: 'organisation', subtab: next, group: null });
                  }}
                >
                  <TabsList className="bg-slate-900/60 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="bureau">Bureau</TabsTrigger>
                    <TabsTrigger value="statut">Statut</TabsTrigger>
                    <TabsTrigger value="sla">SLA</TabsTrigger>
                    <TabsTrigger value="type">Type</TabsTrigger>
                    <TabsTrigger value="priorite">Priorité</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Input
                  value={groupQuery}
                  onChange={(e) => setGroupQuery(e.target.value)}
                  placeholder="Rechercher un groupe (ex: BCT, BC, À traiter)"
                />

                <div className="space-y-2 max-h-[540px] overflow-auto pr-1">
                  {groupItems.map((item) => {
                    const isActive = selectedGroup === item.id;
                    return (
                      <button
                        key={item.id}
                        className={cn(
                          'w-full text-left rounded-lg border border-slate-700/60 px-3 py-2 transition-colors hover:border-orange-500/50',
                          isActive && 'ring-2 ring-orange-500/40 border-orange-500/40'
                        )}
                        onClick={() => {
                          const nextGroup = isActive ? null : item.id;
                          setSelectedGroup(nextGroup);
                          setTabInUrl({ tab: 'organisation', subtab: organisationAxis, group: nextGroup });
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {item.icon && <span className="text-base">{item.icon}</span>}
                              <span
                                className="font-semibold truncate"
                                style={item.accentColor ? { color: item.accentColor } : undefined}
                              >
                                {item.title}
                              </span>
                            </div>
                            {item.subtitle && (
                              <div className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {(item.overdue ?? 0) > 0 && (
                              <Badge variant="urgent">⏱ {item.overdue}</Badge>
                            )}
                            {(item.urgent ?? 0) > 0 && (
                              <Badge variant="warning">🔥 {item.urgent}</Badge>
                            )}
                            <Badge variant={item.badgeVariant ?? 'default'}>{item.count}</Badge>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {groupItems.length === 0 && (
                    <div className="text-sm text-slate-400 text-center py-6">
                      Aucun groupe ne correspond à ta recherche.
                    </div>
                  )}
                </div>

                {selectedGroup && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedGroup(null);
                      setTabInUrl({ tab: 'organisation', subtab: organisationAxis, group: null });
                    }}
                  >
                    <X className="w-4 h-4" />
                    Effacer sélection
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Panneau liste */}
            <div className="space-y-3">
              <div className="sticky top-2 z-10">
                <Card className="border-slate-700/60 bg-slate-950/60 backdrop-blur">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm text-slate-300">
                        Liste <span className="text-slate-400">({sortedVisibleDemands.length})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setFilter('all');
                            setSearchQuery('');
                            setAdvancedFilters({});
                            setSelectedGroup(null);
                            setGroupQuery('');
                            setTabInUrl({ tab: 'organisation', subtab: organisationAxis, group: null });
                          }}
                        >
                          Réinitialiser tout
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <IntelligentSearch
                        demands={enrichedDemands}
                        onSelect={(demandId) => {
                          const demand = enrichedDemands.find(d => d.id === demandId);
                          if (demand) {
                            setSelectedDemand(demand);
                            setShowDetailsModal(true);
                          }
                        }}
                        onFilterChange={setSearchQuery}
                      />
                    </div>

                    {/* Tri + filtres rapides */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400">Trier par</span>
                        <Button size="xs" variant={sortKey === 'delay' ? 'default' : 'outline'} onClick={() => setSortKey('delay')}>Délai</Button>
                        <Button size="xs" variant={sortKey === 'date' ? 'default' : 'outline'} onClick={() => setSortKey('date')}>Date</Button>
                        <Button size="xs" variant={sortKey === 'priority' ? 'default' : 'outline'} onClick={() => setSortKey('priority')}>Priorité</Button>
                        <Button size="xs" variant={sortKey === 'amount' ? 'default' : 'outline'} onClick={() => setSortKey('amount')}>Montant</Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                          title="Inverser le tri"
                        >
                          <ArrowUpDown className="w-4 h-4" />
                          {sortDir === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400">Priorité</span>
                        <Button size="xs" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Toutes</Button>
                        <Button size="xs" variant={filter === 'urgent' ? 'default' : 'outline'} onClick={() => setFilter('urgent')}>Urgent</Button>
                        <Button size="xs" variant={filter === 'high' ? 'default' : 'outline'} onClick={() => setFilter('high')}>Élevée</Button>
                        <Button size="xs" variant={filter === 'normal' ? 'default' : 'outline'} onClick={() => setFilter('normal')}>Normale</Button>
                        <Button size="xs" variant={filter === 'low' ? 'default' : 'outline'} onClick={() => setFilter('low')}>Basse</Button>
                      </div>
                    </div>

                    {/* Chips filtres actifs */}
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedGroup && (
                        <Button size="xs" variant="secondary" onClick={() => { setSelectedGroup(null); setTabInUrl({ tab: 'organisation', subtab: organisationAxis, group: null }); }}>
                          Organisation: {organisationAxis}={selectedGroup}
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                      {searchQuery && (
                        <Button size="xs" variant="secondary" onClick={() => setSearchQuery('')}>
                          Recherche: {searchQuery}
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                      {filter !== 'all' && (
                        <Button size="xs" variant="secondary" onClick={() => setFilter('all')}>
                          Priorité: {filter}
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                      {advancedFilters.bureau?.map((b) => (
                        <Button
                          key={`bureau-${b}`}
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            setAdvancedFilters((prev) => {
                              const next = (prev.bureau ?? []).filter((x) => x !== b);
                              return { ...prev, bureau: next.length > 0 ? next : undefined };
                            });
                          }}
                        >
                          Bureau: {b}
                          <X className="w-3 h-3" />
                        </Button>
                      ))}
                      {advancedFilters.type?.map((t) => (
                        <Button
                          key={`type-${t}`}
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            setAdvancedFilters((prev) => {
                              const next = (prev.type ?? []).filter((x) => x !== t);
                              return { ...prev, type: next.length > 0 ? next : undefined };
                            });
                          }}
                        >
                          Type: {t}
                          <X className="w-3 h-3" />
                        </Button>
                      ))}
                      {advancedFilters.status?.map((s) => (
                        <Button
                          key={`status-${s}`}
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            setAdvancedFilters((prev) => {
                              const next = (prev.status ?? []).filter((x) => x !== s);
                              return { ...prev, status: next.length > 0 ? next : undefined };
                            });
                          }}
                        >
                          Statut: {s}
                          <X className="w-3 h-3" />
                        </Button>
                      ))}
                      {(advancedFilters.dateFrom || advancedFilters.dateTo) && (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => setAdvancedFilters((prev) => ({ ...prev, dateFrom: undefined, dateTo: undefined }))}
                        >
                          Dates: {advancedFilters.dateFrom ?? '…'} → {advancedFilters.dateTo ?? '…'}
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                      {(advancedFilters.amountMin || advancedFilters.amountMax) && (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => setAdvancedFilters((prev) => ({ ...prev, amountMin: undefined, amountMax: undefined }))}
                        >
                          Montant: {advancedFilters.amountMin ?? '…'} → {advancedFilters.amountMax ?? '…'}
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                      {advancedFilters.project && (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => setAdvancedFilters((prev) => ({ ...prev, project: undefined }))}
                        >
                          Projet: {advancedFilters.project}
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {sortedVisibleDemands.map((demand) => {
                const proofs = getProofsForDemand(demand.id);
                const hasProofs = proofs.decisions.length > 0 || proofs.exchanges.length > 0;

                return (
                  <Card
                    key={demand.id}
                    className={cn(
                      'transition-all hover:shadow-lg cursor-pointer',
                      demand.priority === 'urgent' && 'border-l-4 border-l-red-500 bg-red-500/5',
                      demand.priority === 'high' && 'border-l-4 border-l-amber-500 bg-amber-500/5',
                      demand.isOverdue && 'ring-2 ring-orange-500/50',
                    )}
                    onClick={() => {
                      setSelectedDemand(demand);
                      setShowDetailsModal(true);
                      addToast(`Ouverture des détails de ${demand.id}`, 'info');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0',
                              darkMode ? 'bg-slate-700' : 'bg-gray-100'
                            )}
                          >
                            {demand.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-mono text-xs text-orange-400 font-bold">{demand.id}</span>
                              <BureauTag bureau={demand.bureau} />
                              <Badge
                                variant={
                                  demand.priority === 'urgent' ? 'urgent' :
                                  demand.priority === 'high' ? 'warning' : 'default'
                                }
                                pulse={demand.priority === 'urgent'}
                                className="text-[10px]"
                              >
                                {demand.priority}
                              </Badge>
                              <Badge
                                variant={demand.status === 'validated' ? 'success' : demand.status === 'rejected' ? 'urgent' : 'warning'}
                                className="text-[10px]"
                              >
                                {demand.status === 'pending' ? 'pending' : demand.status}
                              </Badge>
                              {demand.isOverdue && (
                                <Badge variant="urgent" className="text-[10px]">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Retard ({demand.delayDays}j)
                                </Badge>
                              )}
                              <Badge variant="info" className="text-[10px]">J+{demand.delayDays}</Badge>
                              {hasProofs && (
                                <Badge variant="default" className="text-[10px]">
                                  🔗 {proofs.decisions.length + proofs.exchanges.length} preuves
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-base mb-1">{demand.subject}</h3>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span>Type: {demand.type}</span>
                              <span>•</span>
                              <span>Date: {demand.date}</span>
                              {demand.amount !== '—' && demand.amount !== 'N/A' && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-400 font-semibold">{demand.amount}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {demand.amount !== '—' && demand.amount !== 'N/A' && (
                            <p className="font-mono font-bold text-lg text-amber-400 mb-1">{demand.amount}</p>
                          )}
                          <p className="text-xs text-slate-400">{demand.date}</p>
                        </div>
                      </div>

                      {/* Actions rapides */}
                      <div
                        className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            const confirmValidate = window.confirm(`Voulez-vous vraiment valider la demande ${demand.id} ?`);
                            if (confirmValidate) {
                              handleValidate(demand);
                            }
                          }}
                          className="text-xs"
                          disabled={demand.status !== 'pending'}
                        >
                          ✓ Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="info"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDemand(demand);
                            setShowDetailsModal(true);
                            addToast(`Ouverture des détails de ${demand.id}`, 'info');
                          }}
                          className="text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Détails
                        </Button>
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestComplement(demand);
                          }}
                          className="text-xs"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Complément
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssign(demand);
                          }}
                          className="text-xs"
                          disabled={demand.status !== 'pending'}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Affecter
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            const confirmReject = window.confirm(`Voulez-vous vraiment rejeter la demande ${demand.id} ?`);
                            if (confirmReject) {
                              handleReject(demand);
                            }
                          }}
                          className="text-xs"
                          disabled={demand.status !== 'pending'}
                        >
                          ✕ Rejeter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

                {sortedVisibleDemands.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-slate-400">Aucune demande trouvée avec les filtres sélectionnés</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* === PILOTAGE === */}
        <TabsContent value="pilotage">
          <div className="space-y-4">
            <Tabs
              value={pilotageSubTab}
              onValueChange={(value) => {
                const next = safePilotageSubTab(value) ?? 'timeline';
                setPilotageSubTab(next);
                setTabInUrl({ tab: 'pilotage', subtab: next, group: null });
              }}
            >
              <TabsList className="bg-slate-900/60">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline">
                <DemandTimeline demands={filteredDemands} />
              </TabsContent>

              <TabsContent value="heatmap">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Grouper par:</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={heatmapGroupBy === 'bureau' ? 'default' : 'outline'}
                        onClick={() => {
                          setHeatmapGroupBy('bureau');
                          addToast('Groupement par bureau', 'info');
                        }}
                      >
                        Bureau
                      </Button>
                      <Button
                        size="sm"
                        variant={heatmapGroupBy === 'priority' ? 'default' : 'outline'}
                        onClick={() => {
                          setHeatmapGroupBy('priority');
                          addToast('Groupement par priorité', 'info');
                        }}
                      >
                        Priorité
                      </Button>
                      <Button
                        size="sm"
                        variant={heatmapGroupBy === 'type' ? 'default' : 'outline'}
                        onClick={() => {
                          setHeatmapGroupBy('type');
                          addToast('Groupement par type', 'info');
                        }}
                      >
                        Type
                      </Button>
                    </div>
                  </div>
                  <DemandHeatmap
                    demands={filteredDemands}
                    bureaux={bureaux}
                    groupBy={heatmapGroupBy}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* === INSIGHTS === */}
        <TabsContent value="insights">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Synthèse</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <div>Volume total: <span className="font-bold text-white">{globalStats.total}</span></div>
                <div>À traiter: <span className="font-bold text-white">{globalStats.pending}</span> • Validées: <span className="font-bold text-emerald-400">{globalStats.validated}</span> • Rejetées: <span className="font-bold text-rose-400">{globalStats.rejected}</span></div>
                <div>En retard: <span className="font-bold text-amber-400">{globalStats.overdue}</span> • Délai moyen: <span className="font-bold text-white">{globalStats.avgDelay}j</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Par bureau (charge & délais)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs text-slate-400">
                  <div>Bureau</div>
                  <div className="text-right">Total</div>
                  <div className="text-right">Urgentes</div>
                  <div className="text-right">Délai moy</div>
                </div>
                <div className="space-y-2">
                  {bureaux
                    .filter((b) => statsByBureau[b.code]?.total > 0)
                    .map((b) => (
                      <button
                        key={b.code}
                        className="w-full grid grid-cols-4 gap-2 text-sm items-center rounded-md border border-slate-700/60 hover:border-orange-500/50 px-3 py-2 transition-colors"
                        onClick={() => {
                          setMainTab('organisation');
                          setOrganisationAxis('bureau');
                          setSelectedGroup(b.code);
                          setTabInUrl({ tab: 'organisation', subtab: 'bureau', group: b.code });
                          addToast(`Filtrage des demandes du bureau ${b.code}`, 'info');
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span>{b.icon}</span>
                          <span className="font-semibold" style={{ color: b.color }}>{b.code}</span>
                        </div>
                        <div className="text-right font-mono">{statsByBureau[b.code]?.total ?? 0}</div>
                        <div className="text-right font-mono text-red-400">{statsByBureau[b.code]?.urgent ?? 0}</div>
                        <div className="text-right font-mono text-amber-400">{statsByBureau[b.code]?.avgDelay ?? 0}j</div>
                      </button>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modale détails */}
      <DemandDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedDemand(null);
        }}
        demand={selectedDemand}
        onAction={handleAction}
        onRequestComplement={() => {
          setShowDetailsModal(false);
          setShowComplementModal(true);
        }}
      />

      {/* Modale complément */}
      <RequestComplementModal
        isOpen={showComplementModal}
        onClose={() => {
          setShowComplementModal(false);
          setSelectedDemand(null);
        }}
        demand={selectedDemand}
        onSend={(message, attachments) => {
          if (selectedDemand) {
            addActionLog({
              userId: 'USR-001',
              userName: 'A. DIALLO',
              userRole: 'Directeur Général',
              action: 'request_complement',
              module: 'demandes',
              targetId: selectedDemand.id,
              targetType: 'Demande',
              targetLabel: selectedDemand.subject,
              details: `Demande de complément envoyée: ${message.substring(0, 50)}...`,
              bureau: selectedDemand.bureau,
            });
            addToast(`Demande de complément envoyée pour ${selectedDemand.id}`, 'success');
          }
        }}
      />

      {/* Modale affectation */}
      <IntelligentAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedDemand(null);
        }}
        demand={selectedDemand}
        employees={employees}
        bureaux={bureaux}
        onAssign={(employeeId) => {
          if (selectedDemand) {
            handleAssign(selectedDemand, employeeId);
            // La modale se ferme automatiquement dans IntelligentAssignmentModal
          }
        }}
      />
    </div>
  );
}
