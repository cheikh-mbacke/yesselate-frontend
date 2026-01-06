'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  agendaEvents,
  plannedAbsences,
  blockedDossiers,
  paymentsN1,
  contractsToSign,
} from '@/lib/data';

export default function CalendrierPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // Grouper les événements par date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, typeof agendaEvents> = {};
    agendaEvents.forEach((event) => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  }, []);

  // Échéances à 7 jours
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);

    return agendaEvents
      .filter((e) => {
        const eventDate = new Date(e.date);
        return eventDate >= today && eventDate <= in7Days;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

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

  // Stats
  const todayEvents = agendaEvents.filter(
    (e) => e.date === new Date().toISOString().split('T')[0]
  );
  const urgentEvents = agendaEvents.filter(
    (e) => e.priority === 'urgent' || e.priority === 'critical'
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📅 Calendrier
            <Badge variant="info">{agendaEvents.length} événements</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Planning, échéances et gestion des surcharges
          </p>
        </div>
        <Button onClick={() => addToast('Nouvel événement créé', 'success')}>
          + Ajouter
        </Button>
      </div>

      {/* Widgets */}
      <div className="grid md:grid-cols-3 gap-3">
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
              upcomingDeadlines.slice(0, 5).map((event) => {
                const typeInfo = eventTypes[event.type];
                const eventDate = new Date(event.date);
                const diffDays = Math.ceil(
                  (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={event.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded text-xs',
                      darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                    )}
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
                  className={cn('flex items-center gap-2 p-2 rounded text-xs', darkMode ? 'bg-amber-500/10' : 'bg-amber-50')}
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
        <Card className="border-purple-500/30">
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
                    'flex items-center gap-2 p-2 rounded text-xs',
                    absence.impact === 'high' ? 'bg-red-500/10' : darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                  )}
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
      <div className="grid grid-cols-4 gap-3">
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
              {agendaEvents.filter((e) => e.type === 'deadline').length}
            </p>
            <p className="text-[10px] text-slate-400">Échéances</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {agendaEvents.filter((e) => e.type === 'meeting').length}
            </p>
            <p className="text-[10px] text-slate-400">Réunions</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation semaine */}
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 7);
            setSelectedDate(newDate);
          }}
        >
          ← Semaine précédente
        </Button>
        <h2 className="font-bold">{formatDate(weekDays[0])} - {formatDate(weekDays[6])}</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 7);
            setSelectedDate(newDate);
          }}
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
            <Card key={i} className={cn('min-h-[180px]', isToday && 'ring-2 ring-orange-500', isOverloaded && 'border-amber-500/50')}>
              <CardHeader className="p-2 pb-1">
                <div className={cn('text-center', isToday && 'text-orange-400 font-bold')}>
                  <p className="text-[10px] uppercase">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                  <p className="text-lg font-bold">{day.getDate()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {dayEvents.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center">Aucun événement</p>
                ) : (
                  dayEvents.slice(0, 4).map((event, ei) => {
                    const typeInfo = eventTypes[event.type];
                    return (
                      <div
                        key={ei}
                        className={cn('p-1.5 rounded text-[10px] cursor-pointer hover:opacity-80', typeInfo?.color + '/20')}
                        onClick={() => addToast(`Événement: ${event.title}`, 'info')}
                      >
                        <div className="flex items-center gap-1">
                          <span>{typeInfo?.icon}</span>
                          <span className="font-semibold truncate">{event.time}</span>
                        </div>
                        <p className="truncate">{event.title}</p>
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

      {/* CE QUI CASSE L'ORGA */}
      {orgaBreakers.length > 0 && (
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
                    'p-3 rounded-lg border-l-4',
                    breaker.severity === 'critical'
                      ? 'border-l-red-500 bg-red-500/10'
                      : breaker.severity === 'high'
                      ? 'border-l-amber-500 bg-amber-500/10'
                      : 'border-l-blue-500 bg-blue-500/10'
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
                      <p className="text-[10px] text-slate-400">{breaker.description}</p>
                    </div>
                  </div>
                  <Link href={breaker.link}>
                    <Button size="xs" variant={breaker.severity === 'critical' ? 'destructive' : 'warning'} className="w-full mt-2">
                      Résoudre →
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Événements à venir */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">📋 Événements à venir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {agendaEvents
            .filter((e) => new Date(e.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 8)
            .map((event, i) => {
              const typeInfo = eventTypes[event.type];
              return (
                <div
                  key={i}
                  className={cn('flex items-center gap-3 p-2 rounded-lg cursor-pointer', darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-100 hover:bg-gray-200')}
                  onClick={() => addToast(`Événement: ${event.title}`, 'info')}
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-lg', typeInfo?.color + '/20')}>
                    {typeInfo?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{event.date}</span>
                      <span>•</span>
                      <span>{event.time}</span>
                      {event.location && (
                        <>
                          <span>•</span>
                          <span>📍 {event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant={event.priority === 'urgent' || event.priority === 'critical' ? 'urgent' : event.priority === 'high' ? 'warning' : 'default'}>
                    {typeInfo?.label}
                  </Badge>
                </div>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
}
