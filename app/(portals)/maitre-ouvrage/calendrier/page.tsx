'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  ActivityPlanningModal,
  ActivityDetailsPanel,
  RescheduleSimulator,
  PilotingStatistics,
} from '@/components/features/bmo/calendar';
import { ModernStatistics } from '@/components/features/bmo/calendar/ModernStatistics';
import { JournalCharts } from '@/components/features/bmo/calendar/JournalCharts';
import { CalendarFilters } from '@/components/features/bmo/calendar/CalendarFilters';
import { BMOResolveModal } from '@/components/features/bmo/calendar/BMOResolveModal';
import { BureauTimelineView } from '@/components/features/bmo/calendar/BureauTimelineView';
import { HeatmapView } from '@/components/features/bmo/calendar/HeatmapView';
import { QuickActionsPanel } from '@/components/features/bmo/calendar/QuickActionsPanel';
import { SmartSuggestions } from '@/components/features/bmo/calendar/SmartSuggestions';
import { FocusModePanel } from '@/components/features/bmo/calendar/FocusModePanel';
import { CalendarSidebar } from '@/components/features/bmo/calendar/CalendarSidebar';
import { CalendarRibbon } from '@/components/features/bmo/calendar/CalendarRibbon';
import { WorkWeekView } from '@/components/features/bmo/calendar/WorkWeekView';
import { CalendarNavigationBar } from '@/components/features/bmo/calendar/CalendarNavigationBar';
import { ModernCalendarGrid, EventCard, IntelligentDashboard, AlternativeCalendarView } from '@/components/features/bmo/calendar';
import { EscalateToBMOModal } from '@/components/features/bmo/alerts/EscalateToBMOModal';
import { AdvancedSearch } from '@/components/features/bmo/calendar/AdvancedSearch';
import { usePageNavigation, useCrossPageLinks } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
import { CalendarExport } from '@/components/features/bmo/calendar/CalendarExport';
import {
  agendaEvents,
  plannedAbsences,
  blockedDossiers,
  paymentsN1,
  contractsToSign,
  bureaux,
} from '@/lib/data';
import type { CalendarEvent } from '@/lib/types/bmo.types';

type CalendarView = 'overview' | 'statistics' | 'timeline' | 'heatmap' | 'journal';
type CalendarViewType = 'day' | 'workweek' | 'week' | 'month';

export default function CalendrierPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, actionLogs } = useBMOStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState<CalendarView>('overview');
  const [calendarViewType, setCalendarViewType] = useState<CalendarViewType>('workweek');
  const [selectedBureaux, setSelectedBureaux] = useState<string[]>(bureaux.map(b => b.code));
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<CalendarEvent | null>(null);
  const [activities, setActivities] = useState<CalendarEvent[]>(agendaEvents as CalendarEvent[]);
  const [detectedConflicts, setDetectedConflicts] = useState<Array<{ type: string; description: string; severity: string }>>([]);
  const [showRescheduleSimulator, setShowRescheduleSimulator] = useState(false);
  const [activityToReschedule, setActivityToReschedule] = useState<CalendarEvent | null>(null);
  const [journalFilters, setJournalFilters] = useState<{
    bureau?: string;
    project?: string;
    actionType?: string;
  }>({});
  const [calendarFilters, setCalendarFilters] = useState<{
    bureau?: string;
    project?: string;
    type?: string;
    priority?: string;
  }>({});
  const [focusMode, setFocusMode] = useState<{
    type?: 'bureau' | 'project' | 'priority';
    value?: string;
  }>({});
  const [selectedBlocker, setSelectedBlocker] = useState<{
    id: string;
    type: 'blocked' | 'contract' | 'payment' | 'other';
    severity: 'critical' | 'high' | 'medium';
    title: string;
    description: string;
    bureau?: string;
    project?: string;
    supplier?: string;
    situation?: string;
    daysBlocked?: number;
  } | null>(null);
  const [showBMOResolveModal, setShowBMOResolveModal] = useState(false);
  const [showBlockerDetailsPanel, setShowBlockerDetailsPanel] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [searchFilters, setSearchFilters] = useState<any>(null);
  const [showAlternativeView, setShowAlternativeView] = useState(false);

  // Types d'événements avec leurs styles
  const eventTypes: Record<string, { icon: string; color: string; label: string }> = {
    meeting: { icon: '📅', color: 'bg-blue-500', label: 'Réunion' },
    visio: { icon: '💻', color: 'bg-purple-500', label: 'Visio' },
    deadline: { icon: '⏰', color: 'bg-red-500', label: 'Échéance' },
    site: { icon: '🏗️', color: 'bg-orange-500', label: 'Visite terrain' },
    delivery: { icon: '📦', color: 'bg-emerald-500', label: 'Livraison' },
    legal: { icon: '⚖️', color: 'bg-amber-500', label: 'Juridique' },
    inspection: { icon: '🔍', color: 'bg-cyan-500', label: 'Inspection' },
    training: { icon: '📚', color: 'bg-pink-500', label: 'Formation' },
    hr: { icon: '👥', color: 'bg-indigo-500', label: 'RH' },
  };

  // Générer les jours de la semaine
  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }, [selectedDate]);

  // Grouper les événements par date (agendaEvents + nouvelles activités) en évitant les doublons
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, (typeof agendaEvents[0] | CalendarEvent)[]> = {};
    const seenIds = new Set<string>();
    
    // Ajouter les événements existants
    agendaEvents.forEach((event) => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      const key = `agenda-${event.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        grouped[event.date].push(event);
      }
    });
    
    // Ajouter les nouvelles activités (priorité sur agendaEvents en cas de doublon)
    activities.forEach((activity) => {
      if (!grouped[activity.date]) {
        grouped[activity.date] = [];
      }
      const key = `activity-${activity.id}`;
      // Retirer l'éventuel doublon d'agendaEvents
      const existingIndex = grouped[activity.date].findIndex(e => e.id === activity.id);
      if (existingIndex >= 0) {
        grouped[activity.date].splice(existingIndex, 1);
        seenIds.delete(`agenda-${activity.id}`);
      }
      if (!seenIds.has(key)) {
        seenIds.add(key);
        grouped[activity.date].push(activity);
      }
    });
    
    return grouped;
  }, [activities]);

  // Échéances à 7 jours (incluant nouvelles activités)
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);

    return [...agendaEvents, ...activities]
      .filter((e) => {
        const eventDate = new Date(e.date);
        return eventDate >= today && eventDate <= in7Days && e.type === 'deadline';
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activities]);

  // Périodes de surcharge (jours avec > 3 événements)
  const overloadPeriods = useMemo(() => {
    return Object.entries(eventsByDate)
      .filter(([, events]) => events.length > 3)
      .map(([date, events]) => ({
        date,
        count: events.length,
        events,
      }));
  }, [eventsByDate]);

  // Absences actives et à venir
  const activeAbsences = useMemo(() => {
    const today = new Date();
    return plannedAbsences.filter((a) => {
      const endDate = new Date(a.endDate);
      return endDate >= today;
    });
  }, []);

  // CE QUI CASSE L'ORGA
  const orgaBreakers = useMemo(() => {
    const breakers: Array<{
      id: string;
      type: 'blocked' | 'payment' | 'contract' | 'absence';
      severity: 'critical' | 'high' | 'medium';
      title: string;
      description: string;
      bureau?: string;
      link: string;
    }> = [];

    // Dossiers bloqués critiques
    blockedDossiers
      .filter((d) => d.delay >= 5 || d.impact === 'critical')
      .forEach((d) => {
        breakers.push({
          id: d.id,
          type: 'blocked',
          severity: d.delay >= 7 ? 'critical' : 'high',
          title: `Dossier bloqué ${d.delay}j`,
          description: d.subject,
          bureau: d.bureau,
          link: '/maitre-ouvrage/substitution',
        });
      });

    // Paiements urgents (échéance < 5 jours)
    paymentsN1.forEach((p) => {
      const dueDate = new Date(p.dueDate.split('/').reverse().join('-'));
      const today = new Date();
      const diffDays = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays <= 5 && diffDays >= 0) {
        breakers.push({
          id: p.id,
          type: 'payment',
          severity: diffDays <= 2 ? 'critical' : 'high',
          title: `Paiement urgent J-${diffDays}`,
          description: `${p.beneficiary} - ${p.amount} FCFA`,
          bureau: p.bureau,
          link: '/maitre-ouvrage/validation-paiements',
        });
      }
    });

    // Contrats urgents
    contractsToSign
      .filter((c) => c.status === 'pending')
      .forEach((c) => {
        breakers.push({
          id: c.id,
          type: 'contract',
          severity: 'medium',
          title: 'Contrat en attente',
          description: c.subject,
          bureau: c.bureau,
          link: '/maitre-ouvrage/validation-contrats',
        });
      });

    // Absences critiques
    activeAbsences
      .filter((a) => a.impact === 'high')
      .forEach((a) => {
        breakers.push({
          id: a.id,
          type: 'absence',
          severity: 'high',
          title: `Absence: ${a.employeeName}`,
          description: `${a.startDate} → ${a.endDate}`,
          bureau: a.bureau,
          link: '/maitre-ouvrage/substitution',
        });
      });

    return breakers.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [activeAbsences]);

  // Stats (incluant nouvelles activités)
  const allEventsForStats = useMemo(() => [...agendaEvents, ...activities], [activities]);
  const todayEvents = useMemo(() => allEventsForStats.filter(
    (e) => e.date === new Date().toISOString().split('T')[0]
  ), [allEventsForStats]);
  const urgentEvents = useMemo(() => allEventsForStats.filter(
    (e) => e.priority === 'urgent' || e.priority === 'critical'
  ), [allEventsForStats]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Fonction de détection automatique des conflits
  const detectConflicts = (activityData: Partial<CalendarEvent>, existingActivityId?: string): Array<{ type: string; description: string; severity: string }> => {
    const conflicts: Array<{ type: string; description: string; severity: string }> = [];
    
    if (!activityData.date || !activityData.bureau) return conflicts;

    const activityDate = activityData.date;
    const activityBureau = activityData.bureau;
    const activityTime = activityData.time || '10:00';

    // 1. Détection de surcharge (plus de 3 événements le même jour pour ce bureau)
    const sameDayActivities = activities.filter(a => 
      a.date === activityDate && 
      a.bureau === activityBureau &&
      a.id !== existingActivityId
    );
    if (sameDayActivities.length >= 3) {
      conflicts.push({
        type: 'overload',
        description: `${sameDayActivities.length} activités déjà planifiées ce jour pour ${activityBureau}`,
        severity: sameDayActivities.length >= 5 ? 'critical' : 'high',
      });
    }

    // 2. Détection d'absence (participants absents)
    if (activityData.participants) {
      const activityDateObj = new Date(activityDate);
      const absentParticipants = activityData.participants.filter(p => {
        const absence = plannedAbsences.find(a => 
          a.bureau === p.bureau &&
          a.employeeName.includes(p.name.split(' ')[0]) &&
          new Date(a.startDate.split('/').reverse().join('-')) <= activityDateObj &&
          new Date(a.endDate.split('/').reverse().join('-')) >= activityDateObj
        );
        return absence;
      });
      if (absentParticipants.length > 0) {
        conflicts.push({
          type: 'absence',
          description: `${absentParticipants.length} participant(s) absent(s) à cette date`,
          severity: absentParticipants.length === activityData.participants.length ? 'critical' : 'high',
        });
      }
    }

    // 3. Détection de chevauchement temporel
    const overlappingActivities = activities.filter(a => 
      a.date === activityDate &&
      a.bureau === activityBureau &&
      a.id !== existingActivityId &&
      a.time &&
      activityTime &&
      Math.abs(parseInt(a.time.split(':')[0]) - parseInt(activityTime.split(':')[0])) < 2
    );
    if (overlappingActivities.length > 0) {
      conflicts.push({
        type: 'overlap',
        description: `${overlappingActivities.length} activité(s) chevauchant(nt) cette plage horaire`,
        severity: 'high',
      });
    }

    // 4. Détection de projet simultané
    if (activityData.project) {
      const sameProjectActivities = activities.filter(a =>
        a.project === activityData.project &&
        a.date === activityDate &&
        a.id !== existingActivityId
      );
      if (sameProjectActivities.length > 0) {
        conflicts.push({
          type: 'resource',
          description: `${sameProjectActivities.length} autre(s) activité(s) sur le projet ${activityData.project} le même jour`,
          severity: 'medium',
        });
      }
    }

    // 5. Vérification des dépendances non respectées
    if (activityData.dependencies && activityData.dependencies.length > 0) {
      const unmetDependencies = activityData.dependencies.filter(depId => {
        const depActivity = activities.find(a => a.id === depId);
        if (!depActivity) return true;
        const depDate = new Date(depActivity.date);
        const actDate = new Date(activityDate);
        return depDate > actDate || depActivity.status === 'cancelled';
      });
      if (unmetDependencies.length > 0) {
        conflicts.push({
          type: 'dependency',
          description: `${unmetDependencies.length} dépendance(s) non respectée(s)`,
          severity: 'critical',
        });
      }
    }

    return conflicts;
  };

  // Filtrer les activités selon les bureaux sélectionnés et les filtres
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];
    
    // Filtre par bureau
    if (selectedBureaux.length < bureaux.length) {
      filtered = filtered.filter(a => !a.bureau || selectedBureaux.includes(a.bureau));
    }
    
    // Filtres additionnels
    if (calendarFilters.bureau) {
      filtered = filtered.filter(a => a.bureau === calendarFilters.bureau);
    }
    if (calendarFilters.project) {
      filtered = filtered.filter(a => a.project?.includes(calendarFilters.project || ''));
    }
    if (calendarFilters.type) {
      filtered = filtered.filter(a => a.type === calendarFilters.type);
    }
    if (calendarFilters.priority) {
      filtered = filtered.filter(a => a.priority === calendarFilters.priority);
    }
    
    return filtered;
  }, [activities, selectedBureaux, calendarFilters]);

  const handleBureauToggle = (bureauCode: string) => {
    setSelectedBureaux(prev => 
      prev.includes(bureauCode)
        ? prev.filter(b => b !== bureauCode)
        : [...prev, bureauCode]
    );
  };

  // Navigation selon la vue active
  const handlePreviousWeek = () => {
    const newDate = new Date(selectedDate);
    if (calendarViewType === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (calendarViewType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setSelectedDate(newDate);
    addToast(`Navigation vers ${newDate.toLocaleDateString('fr-FR')}`, 'info');
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    if (calendarViewType === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (calendarViewType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
    addToast(`Navigation vers ${newDate.toLocaleDateString('fr-FR')}`, 'info');
  };

  const handleToday = () => {
    setSelectedDate(new Date());
    addToast('Navigation vers aujourd\'hui', 'success');
  };

  // Gestionnaire pour changer de vue
  const handleViewChange = (view: CalendarViewType) => {
    setCalendarViewType(view);
    addToast(`Vue changée: ${view === 'day' ? 'Jour' : view === 'workweek' || view === 'week' ? 'Semaine' : 'Mois'}`, 'success');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden w-full max-w-full -m-4">
      {/* CalendarRibbon (style Outlook) */}
      <CalendarRibbon
        activeView={calendarViewType}
        onViewChange={handleViewChange}
        onNewEvent={() => {
          setEditingActivity(null);
          setDetectedConflicts([]);
          setShowPlanningModal(true);
          addToast('Ouverture du formulaire de planification', 'info');
        }}
        onFilter={() => {
          setShowFiltersPanel(!showFiltersPanel);
          addToast(showFiltersPanel ? 'Fermeture des filtres' : 'Ouverture des filtres', 'info');
        }}
        onPrint={() => {
          window.print();
          addToast('Impression du calendrier...', 'info');
        }}
        onDisplayClick={() => {
          // Basculer entre vue calendrier standard et vue alternative
          setShowAlternativeView(!showAlternativeView);
          addToast(
            showAlternativeView 
              ? 'Retour à la vue calendrier standard' 
              : 'Affichage alternatif: Blocages et événements',
            'info'
          );
        }}
        onHelpClick={() => {
          // Ouvrir la documentation ou l'aide
          const helpMessage = `
            Raccourcis clavier:
            - Ctrl/Cmd + N : Nouvel événement
            - Ctrl/Cmd + F : Recherche
            - Ctrl/Cmd + E : Export
            - Échap : Fermer modales
            - Ctrl/Cmd + ←/→ : Navigation semaine
          `;
          addToast('Aide: Consultez la barre de raccourcis ci-dessus', 'info');
          // Optionnel: ouvrir une modale d'aide avec plus de détails
          window.alert('Raccourcis clavier:\n- Ctrl/Cmd + N : Nouvel événement\n- Ctrl/Cmd + F : Recherche\n- Ctrl/Cmd + E : Export\n- Échap : Fermer modales\n- Ctrl/Cmd + ←/→ : Navigation semaine');
        }}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden w-full max-w-full">
        {/* CalendarSidebar (style Outlook) */}
        <CalendarSidebar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedBureaux={selectedBureaux}
          onBureauToggle={handleBureauToggle}
          activities={activities}
        />

        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col overflow-hidden w-full max-w-full">
          {/* Navigation Bar avec outils avancés */}
          <div className="flex items-center justify-between border-b border-slate-700/50 bg-slate-800/30 px-4 py-2">
            <CalendarNavigationBar
              currentDate={selectedDate}
              viewType={calendarViewType}
              onPrevious={handlePreviousWeek}
              onNext={handleNextWeek}
              onToday={handleToday}
            />
            <div className="flex items-center gap-2">
              <AdvancedSearch
                activities={activities}
                onSelectActivity={(id) => {
                  setSelectedActivity(id);
                  addToast(`Navigation vers l'activité sélectionnée`, 'info');
                }}
                onFilterChange={(filters) => {
                  setSearchFilters(filters);
                  if (filters.query || filters.bureau || filters.type || filters.priority) {
                    addToast('Filtres de recherche appliqués', 'info');
                  }
                }}
              />
              <CalendarExport
                activities={activities}
                onImport={(imported) => {
                  setActivities([...activities, ...imported]);
                  addToast(`${imported.length} activité(s) importée(s)`, 'success');
                }}
              />
            </div>
          </div>

          {/* Panneau de filtres */}
          {showFiltersPanel && (
            <div className="border-b border-slate-700/50 bg-slate-800/50 p-4">
              <CalendarFilters 
                filters={calendarFilters} 
                onFiltersChange={(newFilters) => {
                  setCalendarFilters(newFilters);
                  addToast('Filtres appliqués', 'success');
                }}
              />
            </div>
          )}

          {/* Calendar View Content */}
          <div className="flex-1 overflow-auto p-4 w-full max-w-full overflow-x-hidden">
            {/* Vue alternative: Blocages et événements */}
            {showAlternativeView ? (
              <AlternativeCalendarView
                activities={activities}
                onResolveBlocker={(blockerId) => {
                  const blocked = blockedDossiers.find(b => b.id === blockerId);
                  const contract = contractsToSign.find(c => c.id === blockerId);
                  
                  if (blocked) {
                    setSelectedBlocker({
                      id: blockerId,
                      type: 'blocked',
                      severity: (blocked.impact === 'critical' ? 'critical' : 
                                blocked.impact === 'high' ? 'high' : 'medium') as 'critical' | 'high' | 'medium',
                      title: `Dossier bloqué ${blocked.delay || 0}j`,
                      description: blocked.reason || blocked.subject,
                      bureau: blocked.bureau,
                      project: blocked.project,
                      situation: blocked.reason,
                      daysBlocked: blocked.delay,
                    });
                    setShowBMOResolveModal(true);
                  } else if (contract) {
                    setSelectedBlocker({
                      id: blockerId,
                      type: 'contract',
                      severity: 'medium',
                      title: 'Contrat en attente',
                      description: contract.subject,
                      bureau: contract.bureau,
                      supplier: contract.partner,
                    });
                    setShowBMOResolveModal(true);
                  }
                }}
                onViewBlockerDetails={(blockerId) => {
                  const blocked = blockedDossiers.find(b => b.id === blockerId);
                  const contract = contractsToSign.find(c => c.id === blockerId);
                  
                  if (blocked) {
                    setSelectedBlocker({
                      id: blockerId,
                      type: 'blocked',
                      severity: (blocked.impact === 'critical' ? 'critical' : 
                                blocked.impact === 'high' ? 'high' : 'medium') as 'critical' | 'high' | 'medium',
                      title: `Dossier bloqué ${blocked.delay || 0}j`,
                      description: blocked.reason || blocked.subject,
                      bureau: blocked.bureau,
                      project: blocked.project,
                      situation: blocked.reason,
                      daysBlocked: blocked.delay,
                    });
                    setShowBlockerDetailsPanel(true);
                  } else if (contract) {
                    setSelectedBlocker({
                      id: blockerId,
                      type: 'contract',
                      severity: 'medium',
                      title: 'Contrat en attente',
                      description: contract.subject,
                      bureau: contract.bureau,
                      supplier: contract.partner,
                    });
                    setShowBlockerDetailsPanel(true);
                  }
                }}
                onEscalateBlocker={(blockerId) => {
                  const blocked = blockedDossiers.find(b => b.id === blockerId);
                  const contract = contractsToSign.find(c => c.id === blockerId);
                  
                  if (blocked) {
                    setSelectedBlocker({
                      id: blockerId,
                      type: 'blocked',
                      severity: (blocked.impact === 'critical' ? 'critical' : 
                                blocked.impact === 'high' ? 'high' : 'medium') as 'critical' | 'high' | 'medium',
                      title: `Dossier bloqué ${blocked.delay || 0}j`,
                      description: blocked.reason || blocked.subject,
                      bureau: blocked.bureau,
                      project: blocked.project,
                      situation: blocked.reason,
                      daysBlocked: blocked.delay,
                    });
                    setShowEscalateModal(true);
                  } else if (contract) {
                    setSelectedBlocker({
                      id: blockerId,
                      type: 'contract',
                      severity: 'medium',
                      title: 'Contrat en attente',
                      description: contract.subject,
                      bureau: contract.bureau,
                      supplier: contract.partner,
                    });
                    setShowEscalateModal(true);
                  }
                }}
                onViewEventDetails={(eventId) => {
                  setSelectedActivity(eventId);
                  addToast('Ouverture des détails de l\'événement', 'info');
                }}
              />
            ) : (
              <>
                {/* Dashboard intelligent pour vue d'ensemble */}
                {activeView === 'overview' && (
                  <div className="mb-6">
                    <IntelligentDashboard activities={activities} selectedDate={selectedDate} />
                  </div>
                )}

                {/* Vue selon le type sélectionné */}
                {activeView === 'overview' ? (
              <ModernCalendarGrid
                activities={filteredActivities}
                selectedDate={selectedDate}
                viewType={calendarViewType}
                onActivityClick={(activity) => {
                  setSelectedActivity(activity.id);
                  addActionLog({
                    userId: 'USR-001',
                    userName: 'A. DIALLO',
                    userRole: 'Directeur Général',
                    module: 'calendar',
                    action: 'validation',
                    targetId: activity.id,
                    targetLabel: activity.title,
                    details: `Consultation de l'activité ${activity.title}`,
                  });
                  addToast(`Consultation: ${activity.title}`, 'info');
                }}
                onTimeSlotClick={(date, hour) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                  setEditingActivity({
                    id: '',
                    title: '',
                    type: 'meeting',
                    date: dateStr,
                    time: timeStr,
                    priority: 'normal',
                    status: 'planned',
                    createdAt: new Date().toISOString(),
                    createdBy: 'USR-001',
                  });
                  setShowPlanningModal(true);
                  addToast(`Planification d'activité à ${timeStr}`, 'info');
                }}
                onDateClick={(date) => {
                  setSelectedDate(date);
                  setCalendarViewType('day');
                  addToast(`Navigation vers ${date.toLocaleDateString('fr-FR')}`, 'info');
                }}
              />
            ) : null}
              </>
            )}

            {/* Autres vues spécialisées (seulement si pas en vue alternative) */}
            {!showAlternativeView && (
              <>
            {activeView === 'heatmap' && (
              <HeatmapView activities={filteredActivities} selectedDate={selectedDate} />
            )}

            {activeView === 'timeline' && (
              <BureauTimelineView activities={filteredActivities} weekDays={weekDays} />
            )}

            {activeView === 'statistics' && (
              <div className="space-y-6">
                <PilotingStatistics 
                  activities={activities} 
                  actionLogs={actionLogs.map(l => ({
                    ...l,
                    targetId: l.targetId || '',
                  }))}
                />
                <ModernStatistics 
                  activities={activities} 
                  actionLogs={actionLogs.map(l => ({
                    ...l,
                    targetId: l.targetId || '',
                  }))}
                />
              </div>
            )}

            {activeView === 'journal' && (
              <div className="space-y-6">
                <JournalCharts 
                  actionLogs={actionLogs.filter(l => l.module === 'calendar' || l.module === 'alerts').map(l => ({
                    ...l,
                    targetId: String(l.targetId || ''),
                  }))}
                  journalFilters={journalFilters}
                />
              </div>
            )}
              </>
            )}

            {/* Fallback pour compatibilité */}
            {(calendarViewType === 'workweek' || calendarViewType === 'week') && activeView !== 'overview' ? (
              <WorkWeekView
                selectedDate={selectedDate}
                activities={filteredActivities}
                onActivityClick={(activity) => {
                  setSelectedActivity(activity.id);
                  addActionLog({
                    userId: 'USR-001',
                    userName: 'A. DIALLO',
                    userRole: 'Directeur Général',
                    module: 'calendar',
                    action: 'validation',
                    targetId: activity.id,
                    targetLabel: activity.title,
                    details: `Consultation de l'activité ${activity.title}`,
                  });
                  addToast(`Consultation: ${activity.title}`, 'info');
                }}
                onTimeSlotClick={(date, hour) => {
                  // Ouvrir modal de planification avec date/heure pré-remplies
                  const dateStr = date.toISOString().split('T')[0];
                  const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                  setEditingActivity({
                    id: '',
                    title: '',
                    type: 'meeting',
                    date: dateStr,
                    time: timeStr,
                    priority: 'normal',
                    status: 'planned',
                    createdAt: new Date().toISOString(),
                    createdBy: 'USR-001',
                  });
                  setShowPlanningModal(true);
                  addToast(`Planification d'activité à ${timeStr}`, 'info');
                }}
              />
            ) : calendarViewType === 'day' && activeView === 'overview' ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h2>
                </div>
                <WorkWeekView
                  selectedDate={selectedDate}
                  activities={filteredActivities.filter(a => {
                    const activityDate = new Date(a.date);
                    return activityDate.toDateString() === selectedDate.toDateString();
                  })}
                  onActivityClick={(activity) => {
                    setSelectedActivity(activity.id);
                    addToast(`Consultation: ${activity.title}`, 'info');
                  }}
                  onTimeSlotClick={(date, hour) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                    setEditingActivity({
                      id: '',
                      title: '',
                      type: 'meeting',
                      date: dateStr,
                      time: timeStr,
                      priority: 'normal',
                      status: 'planned',
                      createdAt: new Date().toISOString(),
                      createdBy: 'USR-001',
                    });
                    setShowPlanningModal(true);
                  }}
                />
              </div>
            ) : calendarViewType === 'month' && activeView === 'overview' ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </h2>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {/* En-têtes des jours */}
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-slate-400 p-2">
                      {day}
                    </div>
                  ))}
                  {/* Jours du mois */}
                  {(() => {
                    const year = selectedDate.getFullYear();
                    const month = selectedDate.getMonth();
                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    const daysInMonth = lastDay.getDate();
                    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Lundi = 0
                    
                    const days = [];
                    // Jours du mois précédent
                    for (let i = 0; i < startingDayOfWeek; i++) {
                      const date = new Date(year, month, -i);
                      days.push({ date, isCurrentMonth: false });
                    }
                    // Jours du mois actuel
                    for (let i = 1; i <= daysInMonth; i++) {
                      const date = new Date(year, month, i);
                      days.push({ date, isCurrentMonth: true });
                    }
                    // Remplir jusqu'à 42 cases (6 semaines)
                    while (days.length < 42) {
                      const currentLength = days.length;
                      const dayIndex: number = currentLength - daysInMonth - startingDayOfWeek + 1;
                      const nextMonthDate: Date = new Date(year, month + 1, dayIndex);
                      days.push({ date: nextMonthDate, isCurrentMonth: false });
                    }
                    
                    return days.map(({ date, isCurrentMonth }: { date: Date; isCurrentMonth: boolean }, idx: number) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const dayActivities = filteredActivities.filter(a => a.date === dateStr);
                      const isToday = dateStr === new Date().toISOString().split('T')[0];
                      const isSelected = dateStr === selectedDate.toISOString().split('T')[0];
                      
                      return (
                        <Card
                          key={idx}
                          className={cn(
                            'min-h-[80px] cursor-pointer transition-all hover:scale-105',
                            !isCurrentMonth && 'opacity-50',
                            isSelected && 'ring-2 ring-orange-500',
                            isToday && 'bg-orange-500/10'
                          )}
                          onClick={() => {
                            setSelectedDate(date);
                            setCalendarViewType('day');
                            addToast(`Navigation vers ${date.toLocaleDateString('fr-FR')}`, 'info');
                          }}
                        >
                          <CardHeader className="p-2 pb-1">
                            <div className={cn('text-xs font-semibold', isToday && 'text-orange-400')}>
                              {date.getDate()}
                            </div>
                          </CardHeader>
                          <CardContent className="p-1 space-y-1">
                            {dayActivities.slice(0, 2).map(activity => (
                              <div
                                key={activity.id}
                                className="text-[9px] p-1 rounded bg-blue-500/20 truncate"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedActivity(activity.id);
                                }}
                              >
                                {eventTypes[activity.type]?.icon} {activity.title.substring(0, 15)}
                              </div>
                            ))}
                            {dayActivities.length > 2 && (
                              <div className="text-[8px] text-slate-400 text-center">
                                +{dayActivities.length - 2}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-slate-400">Vue non disponible pour ce type de calendrier</p>
                </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2 mb-4 overflow-x-auto">
        <Button
          size="sm"
          variant={activeView === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveView('overview')}
          className="transition-all whitespace-nowrap"
        >
          📋 Vue d'ensemble
        </Button>
        <Button
          size="sm"
          variant={activeView === 'heatmap' ? 'default' : 'ghost'}
          onClick={() => setActiveView('heatmap')}
          className="transition-all whitespace-nowrap"
        >
          🔥 Heatmap
        </Button>
        <Button
          size="sm"
          variant={activeView === 'timeline' ? 'default' : 'ghost'}
          onClick={() => setActiveView('timeline')}
          className="transition-all whitespace-nowrap"
        >
          📊 Timeline Gantt
        </Button>
        <Button
          size="sm"
          variant={activeView === 'statistics' ? 'default' : 'ghost'}
          onClick={() => setActiveView('statistics')}
          className="transition-all whitespace-nowrap"
        >
          📈 Statistiques
        </Button>
        <Button
          size="sm"
          variant={activeView === 'journal' ? 'default' : 'ghost'}
          onClick={() => setActiveView('journal')}
          className="transition-all whitespace-nowrap"
        >
          📜 Journal ({actionLogs.filter(l => l.module === 'calendar' || l.module === 'alerts').length})
        </Button>
      </div>

      {/* Tab: Vue d'ensemble */}
      {activeView === 'overview' && (
        <>
          {/* Widgets de synthèse BMO */}
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            {/* Échéances à 7 jours */}
            <Card className="border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  ⏰ Échéances à 7 jours
                  <Badge variant="urgent">{upcomingDeadlines.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 max-h-40 overflow-y-auto">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">Aucune échéance</p>
                ) : (
                  upcomingDeadlines.slice(0, 5).map((event, idx) => {
                    const typeInfo = eventTypes[event.type];
                    const eventDate = new Date(event.date);
                    const diffDays = Math.ceil(
                      (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const uniqueDeadlineKey = event.id 
                      ? `deadline-${event.id}-${idx}-${event.date}` 
                      : `deadline-${idx}-${event.date}-${event.title?.substring(0, 10)}`;
                    return (
                      <div
                        key={uniqueDeadlineKey}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded text-xs transition-colors hover:opacity-80 cursor-pointer',
                          darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                        )}
                        onClick={() => {
                          setSelectedActivity(event.id);
                        }}
                      >
                        <span>{typeInfo?.icon || '📌'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{event.title}</p>
                          <p className="text-[10px] text-slate-400">{event.date}</p>
                        </div>
                        <Badge variant={diffDays <= 2 ? 'urgent' : diffDays <= 4 ? 'warning' : 'default'}>
                          J-{diffDays}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Surcharges */}
            <Card className="border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  🔥 Surcharges
                  <Badge variant="warning">{overloadPeriods.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 max-h-40 overflow-y-auto">
                {overloadPeriods.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">Aucune surcharge détectée</p>
                ) : (
                  overloadPeriods.map((period, i) => (
                    <div
                      key={i}
                      className={cn('flex items-center gap-2 p-2 rounded text-xs cursor-pointer hover:opacity-80', darkMode ? 'bg-amber-500/10' : 'bg-amber-50')}
                      onClick={() => {
                        const periodDate = new Date(period.date);
                        setSelectedDate(periodDate);
                        setCalendarViewType('day');
                        addToast(`Navigation vers ${period.date}`, 'info');
                      }}
                    >
                      <span>⚠️</span>
                      <div className="flex-1">
                        <p className="font-semibold">{period.date}</p>
                      </div>
                      <Badge variant="warning">{period.count} évts</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Absences */}
            <Card className="border-blue-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  👥 Absences
                  <Badge variant="info">{activeAbsences.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 max-h-40 overflow-y-auto">
                {activeAbsences.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">Aucune absence planifiée</p>
                ) : (
                  activeAbsences.map((absence) => (
                    <div
                      key={absence.id}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded text-xs cursor-pointer hover:opacity-80',
                        absence.impact === 'high' ? 'bg-red-500/10' : darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                      )}
                      onClick={() => {
                        const startDate = new Date(absence.startDate.split('/').reverse().join('-'));
                        setSelectedDate(startDate);
                        setCalendarViewType('day');
                        addToast(`Navigation vers absence: ${absence.employeeName}`, 'info');
                      }}
                    >
                      <span>{absence.type === 'congé' ? '🏖️' : '✈️'}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{absence.employeeName}</p>
                        <p className="text-[10px] text-slate-400">{absence.startDate} → {absence.endDate}</p>
                      </div>
                      <BureauTag bureau={absence.bureau} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{todayEvents.length}</p>
                <p className="text-[10px] text-slate-400">Aujourd'hui</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-red-400">{urgentEvents.length}</p>
                <p className="text-[10px] text-slate-400">Urgents</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">
                  {allEventsForStats.filter((e) => e.type === 'deadline').length}
                </p>
                <p className="text-[10px] text-slate-400">Échéances</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {allEventsForStats.filter((e) => e.type === 'meeting').length}
                </p>
                <p className="text-[10px] text-slate-400">Réunions</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions Rapides BMO */}
          <QuickActionsPanel
            onQuickAction={(action) => {
              if (action === 'focus-urgent') {
                setCalendarFilters({ ...calendarFilters, priority: 'urgent' });
                setActiveView('overview');
                addToast('Focus sur les activités urgentes', 'info');
              } else if (action === 'focus-overload') {
                setActiveView('heatmap');
                addToast('Affichage de la heatmap des surcharges', 'info');
              } else if (action === 'view-all') {
                setCalendarFilters({});
                addToast('Affichage de toutes les activités', 'info');
              }
            }}
            stats={{
              urgentCount: activities.filter(a => a.priority === 'urgent' || a.priority === 'critical').length,
              overloadedDays: Object.values(eventsByDate).filter(events => events.length > 3).length,
              criticalAlerts: orgaBreakers.filter(b => b.severity === 'critical').length,
            }}
          />

          {/* SECTION 1: Outils de pilotage BMO */}
          <div className="space-y-4 mb-6 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">🧭 Outils de pilotage BMO</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
            </div>
            
            {/* Mode Focus */}
            <FocusModePanel
            activeFocus={focusMode}
            onFocusChange={(focus) => {
              setFocusMode(focus);
              if (focus.type === 'bureau' && focus.value) {
                setCalendarFilters({ ...calendarFilters, bureau: focus.value });
              } else if (focus.type === 'priority' && focus.value) {
                setCalendarFilters({ ...calendarFilters, priority: focus.value });
              } else {
                setCalendarFilters({});
              }
            }}
          />

          {/* Suggestions Intelligentes */}
          <SmartSuggestions
            activities={activities}
            onApplySuggestion={(suggestion) => {
              if (suggestion.type === 'overload') {
                setCalendarFilters({ bureau: suggestion.data.bureau, priority: 'urgent' });
                addToast(`Focus sur ${suggestion.data.bureau} - Sur urgentes`, 'info');
              } else if (suggestion.type === 'conflict') {
                const dateObj = new Date(suggestion.data.date);
                setSelectedDate(dateObj);
                addToast(`Navigation vers le ${dateObj.toLocaleDateString('fr-FR')}`, 'info');
              } else if (suggestion.type === 'optimization') {
                setActiveView('heatmap');
                addToast('Affichage de la heatmap pour optimisation', 'info');
              }
            }}
          />

            {/* Filtres BMO */}
            <CalendarFilters filters={calendarFilters} onFiltersChange={setCalendarFilters} />
          </div>

          {/* SECTION 2: Calendrier hebdomadaire */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">📅 Calendrier hebdomadaire</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
            </div>

            {/* Navigation semaine */}
            <div className="flex items-center justify-between mb-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePreviousWeek}
              className="transition-all hover:scale-105 hover:bg-orange-500/10"
            >
              ← Semaine précédente
            </Button>
            <div className="text-center">
              <h2 className="font-bold text-lg">{formatDate(weekDays[0])} - {formatDate(weekDays[6])}</h2>
              <Button
                size="xs"
                variant="ghost"
                onClick={handleToday}
                className="text-[10px] mt-1 hover:bg-orange-500/10"
              >
                📍 Aujourd'hui
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNextWeek}
              className="transition-all hover:scale-105 hover:bg-orange-500/10"
            >
              Semaine suivante →
            </Button>
          </div>

          {/* Vue semaine */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayEvents = eventsByDate[dateStr] || [];
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const isOverloaded = dayEvents.length > 3;

          return (
            <Card key={`day-${dateStr}`} className={cn('min-h-[180px] transition-all', isToday && 'ring-2 ring-orange-500 shadow-lg', isOverloaded && 'border-amber-500/50')}>
              <CardHeader className="p-2 pb-1">
                <div className={cn('text-center', isToday && 'text-orange-400 font-bold')}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] uppercase tracking-wide">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                    {dayEvents.length > 0 && (
                      <Badge variant="info" className="text-[8px] px-1 py-0">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-bold">{day.getDate()}</p>
                  {/* Indicateur de bureaux concernés */}
                  {dayEvents.length > 0 && (() => {
                    const bureauxConcernes = Array.from(new Set(dayEvents.map(e => e.bureau).filter(Boolean)));
                    if (bureauxConcernes.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-1 justify-center mt-1">
                          {bureauxConcernes.slice(0, 3).map((bureau) => (
                            bureau && <BureauTag key={bureau} bureau={bureau} className="text-[8px] px-1 py-0" />
                          ))}
                          {bureauxConcernes.length > 3 && (
                            <span className="text-[8px] text-slate-400">+{bureauxConcernes.length - 3}</span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {dayEvents.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center">Aucun événement</p>
                ) : (
                  dayEvents.slice(0, 4).map((event, ei) => {
                    const typeInfo = eventTypes[event.type];
                    // Créer une clé unique en combinant date, index et ID
                    const uniqueKey = event.id 
                      ? `day-event-${dateStr}-${event.id}-${ei}` 
                      : `day-event-${dateStr}-${ei}-${event.title?.substring(0, 10)}`;
                    return (
                      <div
                        key={uniqueKey}
                        className={cn('p-1.5 rounded text-[10px] cursor-pointer hover:opacity-80 transition-all hover:scale-[1.02]', typeInfo?.color + '/20')}
                        onClick={() => {
                          setSelectedActivity(event.id);
                          const activity = activities.find(a => a.id === event.id) || event;
                          if (activity) {
                            addActionLog({
                              userId: 'USR-001',
                              userName: 'A. DIALLO',
                              userRole: 'Directeur Général',
                              module: 'calendar',
                              action: 'validation',
                              targetId: event.id,
                              targetLabel: event.title,
                              details: `Consultation de l'activité ${event.title}`,
                            });
                          }
                        }}
                        title={event.title}
                      >
                        <div className="flex items-center gap-1">
                          <span>{typeInfo?.icon}</span>
                          <span className="font-semibold truncate text-[9px]">{event.time}</span>
                        </div>
                        <p className="truncate font-medium text-[9px]">{event.title}</p>
                        {event.bureau && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <BureauTag bureau={event.bureau} className="text-[8px] px-1 py-0" />
                            {event.project && (
                              <span className="text-[8px] text-slate-400 truncate">{event.project}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                {dayEvents.length > 4 && <p className="text-[9px] text-center text-slate-400">+{dayEvents.length - 4} autres</p>}
              </CardContent>
            </Card>
          );
            })}
          </div>
          </div>

          {/* SECTION 3: Blocages organisationnels */}
          {orgaBreakers.length > 0 && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider">🚨 Blocages organisationnels</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
              </div>
              
              <Card className="border-red-500/30 bg-gradient-to-r from-red-500/5 to-orange-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                    💥 Ce qui casse l'organisation
                    <Badge variant="urgent">{orgaBreakers.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {orgaBreakers.slice(0, 6).map((breaker) => (
                <div
                  key={breaker.id}
                  className={cn(
                    'p-3 rounded-lg border-l-4 transition-all hover:scale-[1.02]',
                    breaker.severity === 'critical'
                      ? 'border-l-red-500 bg-red-500/10 hover:bg-red-500/15'
                      : breaker.severity === 'high'
                      ? 'border-l-amber-500 bg-amber-500/10 hover:bg-amber-500/15'
                      : 'border-l-blue-500 bg-blue-500/10 hover:bg-blue-500/15'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">
                      {breaker.type === 'blocked' ? '🚨' : breaker.type === 'payment' ? '💳' : breaker.type === 'contract' ? '📜' : '👤'}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={breaker.severity === 'critical' ? 'urgent' : breaker.severity === 'high' ? 'warning' : 'info'}>
                          {breaker.severity}
                        </Badge>
                        {breaker.bureau && <BureauTag bureau={breaker.bureau} />}
                      </div>
                      <p className="text-xs font-semibold mt-1">{breaker.title}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{breaker.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="xs" 
                      variant="ghost"
                      className="flex-1 text-[10px] border border-slate-600 hover:bg-slate-700/50 transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedBlocker({
                          id: breaker.id,
                          type: breaker.type as 'blocked' | 'contract' | 'payment' | 'other',
                          severity: breaker.severity as 'critical' | 'high' | 'medium',
                          title: breaker.title,
                          description: breaker.description,
                          bureau: breaker.bureau,
                          project: breaker.description.includes('PRJ-') 
                            ? breaker.description.match(/PRJ-[A-Z0-9-]+/)?.[0] 
                            : undefined,
                          situation: breaker.description.includes('Situation') 
                            ? breaker.description.match(/Situation[^•]*/)?.[0] 
                            : undefined,
                          daysBlocked: breaker.title.match(/(\d+)j/)?.[1] ? parseInt(breaker.title.match(/(\d+)j/)?.[1] || '0') : undefined,
                        });
                        setShowBlockerDetailsPanel(true);
                        addToast('Panneau de détails ouvert', 'info');
                      }}
                    >
                      📋 Voir détails
                    </Button>
                    <Button 
                      size="xs" 
                      variant={breaker.severity === 'critical' ? 'destructive' : 'warning'} 
                      className="flex-1 text-[10px] transition-all hover:scale-105"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedBlocker({
                          id: breaker.id,
                          type: breaker.type as 'blocked' | 'contract' | 'payment' | 'other',
                          severity: breaker.severity as 'critical' | 'high' | 'medium',
                          title: breaker.title,
                          description: breaker.description,
                          bureau: breaker.bureau,
                          project: breaker.description.includes('PRJ-') 
                            ? breaker.description.match(/PRJ-[A-Z0-9-]+/)?.[0] 
                            : undefined,
                          situation: breaker.description.includes('Situation') 
                            ? breaker.description.match(/Situation[^•]*/)?.[0] 
                            : undefined,
                          daysBlocked: breaker.title.match(/(\d+)j/)?.[1] ? parseInt(breaker.title.match(/(\d+)j/)?.[1] || '0') : undefined,
                        });
                        setShowBMOResolveModal(true);
                      }}
                    >
                      ⚡ Résoudre
                    </Button>
                  </div>
                  {breaker.severity !== 'critical' && (
                    <Button 
                      size="xs" 
                      variant="outline"
                      className="w-full mt-2 text-[10px] border-orange-500/50 text-orange-400 hover:bg-orange-500/10 transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedBlocker({
                          id: breaker.id,
                          type: breaker.type as 'blocked' | 'contract' | 'payment' | 'other',
                          severity: breaker.severity as 'critical' | 'high' | 'medium',
                          title: breaker.title,
                          description: breaker.description,
                          bureau: breaker.bureau,
                          project: breaker.description.includes('PRJ-') 
                            ? breaker.description.match(/PRJ-[A-Z0-9-]+/)?.[0] 
                            : undefined,
                          situation: breaker.description.includes('Situation') 
                            ? breaker.description.match(/Situation[^•]*/)?.[0] 
                            : undefined,
                          daysBlocked: breaker.title.match(/(\d+)j/)?.[1] ? parseInt(breaker.title.match(/(\d+)j/)?.[1] || '0') : undefined,
                        });
                        setShowEscalateModal(true);
                      }}
                    >
                      🔺 Escalader au BMO
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      )}

          {/* SECTION 4: Événements et activités */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">📋 Événements et activités</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
            </div>

      {/* Événements à venir */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">📋 Événements à venir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(() => {
            // Créer une liste unique en évitant les doublons par ID
            const seenIds = new Set<string>();
            const uniqueEvents: (typeof agendaEvents[0] | CalendarEvent)[] = [];
            
            // Ajouter d'abord les agendaEvents
            agendaEvents.forEach((event) => {
              if (new Date(event.date) >= new Date() && !seenIds.has(`agenda-${event.id}`)) {
                seenIds.add(`agenda-${event.id}`);
                uniqueEvents.push(event);
              }
            });
            
            // Puis ajouter les activities (en évitant les doublons)
            activities.forEach((activity) => {
              const key = `activity-${activity.id}`;
              if (new Date(activity.date) >= new Date() && !seenIds.has(key)) {
                seenIds.add(key);
                uniqueEvents.push(activity);
              }
            });
            
            return uniqueEvents
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 8)
              .map((event, i) => {
                const typeInfo = eventTypes[event.type];
                const eventKey = activities.find(a => a.id === event.id) 
                  ? `activity-${event.id}-${i}` 
                  : `agenda-${event.id}-${i}`;
                return (
                  <div
                    key={eventKey}
                    className={cn('flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors', darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-100 hover:bg-gray-200')}
                    onClick={() => {
                      const activity = activities.find(a => a.id === event.id) || event;
                      setSelectedActivity(event.id);
                    }}
                  >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-lg', typeInfo?.color + '/20')}>
                    {typeInfo?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                      {event.bureau && <BureauTag bureau={event.bureau} className="text-[9px]" />}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{event.date}</span>
                      <span>•</span>
                      <span>{event.time}</span>
                      {event.project && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[9px]">{event.project}</span>
                        </>
                      )}
                      {event.location && (
                        <>
                          <span>•</span>
                          <span>📍 {event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={event.priority === 'urgent' || event.priority === 'critical' ? 'urgent' : event.priority === 'high' ? 'warning' : 'default'} className="text-[9px]">
                      {typeInfo?.label}
                    </Badge>
                    {(event.priority === 'urgent' || event.priority === 'critical') && (
                      <Badge variant="urgent" className="text-[8px]">Prioritaire</Badge>
                    )}
                  </div>
                </div>
                );
              });
          })()}
        </CardContent>
      </Card>
          </div>
        </>
      )}

      {/* Tab: Heatmap */}
      {activeView === 'heatmap' && (
        <HeatmapView activities={activities} selectedDate={selectedDate} />
      )}

      {/* Tab: Timeline multi-bureaux (Gantt) */}
      {activeView === 'timeline' && (
        <BureauTimelineView activities={activities} weekDays={weekDays} />
      )}

      {/* Tab: Journal d'organisation */}
      {activeView === 'journal' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>📜 Journal d'organisation</span>
              <Badge variant="info">
                {actionLogs.filter((log) => {
                  if (log.module !== 'calendar' && log.module !== 'alerts') return false;
                  if (journalFilters.bureau && log.bureau !== journalFilters.bureau) return false;
                  if (journalFilters.actionType && log.action !== journalFilters.actionType) return false;
                  return true;
                }).length} entrées
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filtres */}
            <div className="mb-4 p-3 rounded-lg bg-slate-700/30 border border-slate-600">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold mb-1">Bureau</label>
                  <select
                    value={journalFilters.bureau || ''}
                    onChange={(e) => setJournalFilters({ ...journalFilters, bureau: e.target.value || undefined })}
                    className={cn(
                      'w-full px-2 py-1 rounded text-[9px] border',
                      darkMode
                        ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                        : 'bg-white border-gray-300 text-gray-700'
                    )}
                  >
                    <option value="">Tous</option>
                    {bureaux.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold mb-1">Type d'action</label>
                  <select
                    value={journalFilters.actionType || ''}
                    onChange={(e) => setJournalFilters({ ...journalFilters, actionType: e.target.value || undefined })}
                    className={cn(
                      'w-full px-2 py-1 rounded text-[9px] border',
                      darkMode
                        ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                        : 'bg-white border-gray-300 text-gray-700'
                    )}
                  >
                    <option value="">Tous</option>
                    <option value="creation">Création</option>
                    <option value="modification">Modification</option>
                    <option value="validation">Validation</option>
                    <option value="notification">Notification</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setJournalFilters({})}
                    className="text-[9px]"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </div>

            {/* Graphiques du Journal */}
            <JournalCharts 
              actionLogs={actionLogs.filter(log => log.targetId).map(log => ({
                module: log.module,
                action: log.action,
                timestamp: log.timestamp,
                targetId: log.targetId || '',
                bureau: log.bureau,
              }))} 
              journalFilters={journalFilters} 
            />

            <div className="space-y-2">
              {actionLogs
                .filter((log) => {
                  if (log.module !== 'calendar' && log.module !== 'alerts') return false;
                  if (journalFilters.bureau && log.bureau !== journalFilters.bureau) return false;
                  if (journalFilters.actionType && log.action !== journalFilters.actionType) return false;
                  return true;
                })
                .slice(0, 20)
                .map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg',
                      darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                        log.action === 'validation'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : log.action === 'modification'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-blue-500/20 text-blue-400'
                      )}
                    >
                      {log.userName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{log.id}</span>
                        <Badge variant="default">{log.action}</Badge>
                        {log.bureau && <BureauTag bureau={log.bureau} />}
                      </div>
                      <p className="text-xs font-semibold">
                        {log.userName} ({log.userRole})
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {log.targetLabel || log.targetId} • {log.details || 'Aucun détail'}
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modale Planification */}
      <ActivityPlanningModal
        isOpen={showPlanningModal}
        onClose={() => {
          setShowPlanningModal(false);
          setEditingActivity(null);
          setDetectedConflicts([]);
        }}
        onSave={(activityData) => {
          // Détecter les conflits avant sauvegarde
          const conflictData = detectConflicts(activityData, editingActivity?.id);
          const conflicts = conflictData.length > 0 ? conflictData.map(c => {
            // Déterminer le type de conflit basé sur la description
            let conflictType: 'overlap' | 'resource' | 'absence' | 'overload' | 'dependency' = 'overlap';
            if (c.description.includes('surcharge') || c.description.includes('overload')) {
              conflictType = 'overload';
            } else if (c.description.includes('absence')) {
              conflictType = 'absence';
            } else if (c.description.includes('dépendance') || c.description.includes('dependency')) {
              conflictType = 'dependency';
            } else if (c.description.includes('ressource') || c.description.includes('resource')) {
              conflictType = 'resource';
            }
            
            return {
              type: conflictType,
              description: c.description,
              severity: ((c.severity === 'critical' || c.severity === 'high' || c.severity === 'medium' || c.severity === 'low')
                ? c.severity
                : 'medium') as 'critical' | 'high' | 'medium' | 'low',
              detectedAt: new Date().toISOString(),
            };
          }) : undefined;
          
          // La confirmation est gérée dans la modale elle-même
          const newActivity: CalendarEvent = {
            id: editingActivity?.id || `ACT-${Date.now()}`,
            title: activityData.title || '',
            type: activityData.type || 'meeting',
            date: activityData.date || '',
            time: activityData.time || '10:00',
            priority: activityData.priority || 'normal',
            bureau: activityData.bureau,
            project: activityData.project,
            estimatedCharge: activityData.estimatedCharge,
            participants: activityData.participants,
            dependencies: activityData.dependencies,
            status: 'planned',
            createdAt: editingActivity?.createdAt || new Date().toISOString(),
            createdBy: editingActivity?.createdBy || 'USR-001',
            conflicts,
          };
          
          // Journaliser l'action
          addActionLog({
            userId: 'USR-001',
            userName: 'A. DIALLO',
            userRole: 'Directeur Général',
            module: 'calendar',
            action: editingActivity ? 'modification' : 'creation',
            targetId: newActivity.id,
            targetType: 'Activity',
            targetLabel: newActivity.title,
            details: editingActivity 
              ? `Activité modifiée: ${newActivity.title}` 
              : `Activité créée: ${newActivity.title} - Bureau: ${newActivity.bureau || 'N/A'}`,
            bureau: newActivity.bureau,
          });
          
          if (editingActivity) {
            setActivities(activities.map(a => a.id === editingActivity.id ? newActivity : a));
            addToast(`Activité "${newActivity.title}" modifiée avec succès`, 'success');
          } else {
            setActivities([...activities, newActivity]);
            addToast(`Activité "${newActivity.title}" créée et ajoutée au calendrier`, 'success');
          }
          
          setShowPlanningModal(false);
          setEditingActivity(null);
          setDetectedConflicts([]);
        }}
        existingActivity={editingActivity || undefined}
        conflicts={detectedConflicts}
        onConflictDetect={(activityData) => {
          // Recalculer les conflits en temps réel
          setDetectedConflicts(detectConflicts(activityData, editingActivity?.id));
        }}
      />

      {/* Panneau Détails Activité */}
      {selectedActivity && (() => {
        const activity = activities.find(a => a.id === selectedActivity);
        if (!activity) return null;
        return (
          <ActivityDetailsPanel
            isOpen={selectedActivity !== null}
            onClose={() => setSelectedActivity(null)}
            activity={activity}
            onEdit={() => {
              setEditingActivity(activity);
              setSelectedActivity(null);
              setShowPlanningModal(true);
            }}
            onReschedule={() => {
              const activity = activities.find(a => a.id === selectedActivity);
              if (activity) {
                setActivityToReschedule(activity);
                setShowRescheduleSimulator(true);
              }
            }}
            onComplete={() => {
              setActivities(activities.map(a => 
                a.id === activity.id ? { ...a, status: 'completed' as const } : a
              ));
              addActionLog({
                userId: 'USR-001',
                userName: 'A. DIALLO',
                userRole: 'Directeur Général',
                action: 'validation',
                module: 'calendar',
                targetId: activity.id,
                targetType: 'Activity',
                targetLabel: activity.title,
                details: 'Activité marquée comme terminée',
              });
            }}
            onCancel={() => {
              setActivities(activities.map(a => 
                a.id === activity.id ? { ...a, status: 'cancelled' as const } : a
              ));
            }}
            onAddNote={(note) => {
              const newNote = {
                id: `NOTE-${Date.now()}`,
                content: note,
                author: 'A. DIALLO',
                createdAt: new Date().toISOString(),
              };
              setActivities(activities.map(a => 
                a.id === activity.id 
                  ? { ...a, notes: [...(a.notes || []), newNote] }
                  : a
              ));
            }}
          />
        );
      })()}

      {/* Simulateur de replanification */}
      {activityToReschedule && (
        <RescheduleSimulator
          isOpen={showRescheduleSimulator}
          onClose={() => {
            setShowRescheduleSimulator(false);
            setActivityToReschedule(null);
          }}
          onConfirm={(newDate, newTime) => {
            setActivities(activities.map(a =>
              a.id === activityToReschedule.id
                ? { ...a, date: newDate, time: newTime, status: 'rescheduled' as const }
                : a
            ));
            addActionLog({
              userId: 'USR-001',
              userName: 'A. DIALLO',
              userRole: 'Directeur Général',
              action: 'modification',
              module: 'calendar',
              targetId: activityToReschedule.id,
              targetType: 'Activity',
              targetLabel: activityToReschedule.title,
              bureau: activityToReschedule.bureau,
              details: `Replanifié: ${newDate} à ${newTime}`,
            });
            addToast('Activité replanifiée avec succès', 'success');
            setShowRescheduleSimulator(false);
            setActivityToReschedule(null);
          }}
          activity={activityToReschedule}
          allActivities={activities}
        />
      )}

      {/* Modale BMO Résoudre */}
      {selectedBlocker && (
        <BMOResolveModal
          isOpen={showBMOResolveModal}
          onClose={() => {
            setShowBMOResolveModal(false);
            setSelectedBlocker(null);
          }}
          onAction={(action, data) => {
            // Gérer les actions BMO
            if (action === 'relaunch') {
              addToast(`Relance envoyée au bureau ${data.bureau}`, 'success');
            } else if (action === 'resolve') {
              addToast('Blocage marqué comme résolu', 'success');
              // Mettre à jour l'état pour retirer le blocage de la liste
            } else if (action === 'reschedule') {
              // Navigation vers replanification
              const relatedActivity = activities.find(a => 
                a.project === selectedBlocker.project || 
                a.bureau === selectedBlocker.bureau
              );
              if (relatedActivity) {
                setActivityToReschedule(relatedActivity);
                setShowRescheduleSimulator(true);
              }
            }
          }}
          blocker={selectedBlocker}
        />
      )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
