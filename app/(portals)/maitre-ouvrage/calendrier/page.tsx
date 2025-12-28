'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { agendaEvents } from '@/lib/data';

export default function CalendrierPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  // Types d'événements avec leurs styles
  const eventTypes = {
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

  // Générer les jours de la semaine
  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Lundi
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }, [selectedDate]);

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
            Planning et échéances importantes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === 'day' ? 'default' : 'secondary'}
            onClick={() => setView('day')}
          >
            Jour
          </Button>
          <Button
            size="sm"
            variant={view === 'week' ? 'default' : 'secondary'}
            onClick={() => setView('week')}
          >
            Semaine
          </Button>
          <Button
            size="sm"
            variant={view === 'month' ? 'default' : 'secondary'}
            onClick={() => setView('month')}
          >
            Mois
          </Button>
          <Button onClick={() => addToast('Nouvel événement créé', 'success')}>
            + Ajouter
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">
              {todayEvents.length}
            </p>
            <p className="text-[10px] text-slate-400">Aujourd&apos;hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">
              {urgentEvents.length}
            </p>
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
        <h2 className="font-bold">
          {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
        </h2>
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

          return (
            <Card
              key={i}
              className={cn(
                'min-h-[200px]',
                isToday && 'ring-2 ring-orange-500'
              )}
            >
              <CardHeader className="p-2 pb-1">
                <div
                  className={cn(
                    'text-center',
                    isToday && 'text-orange-400 font-bold'
                  )}
                >
                  <p className="text-[10px] uppercase">
                    {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </p>
                  <p className="text-lg font-bold">{day.getDate()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {dayEvents.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center">
                    Aucun événement
                  </p>
                ) : (
                  dayEvents.map((event, ei) => {
                    const typeInfo =
                      eventTypes[event.type as keyof typeof eventTypes];
                    return (
                      <div
                        key={ei}
                        className={cn(
                          'p-1.5 rounded text-[10px] cursor-pointer hover:opacity-80',
                          typeInfo?.color + '/20'
                        )}
                        onClick={() =>
                          addToast(`Événement: ${event.title}`, 'info')
                        }
                      >
                        <div className="flex items-center gap-1">
                          <span>{typeInfo?.icon}</span>
                          <span className="font-semibold truncate">
                            {event.time}
                          </span>
                        </div>
                        <p className="truncate">{event.title}</p>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Liste des événements à venir */}
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
              const typeInfo =
                eventTypes[event.type as keyof typeof eventTypes];
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg cursor-pointer',
                    darkMode
                      ? 'bg-slate-700/30 hover:bg-slate-700/50'
                      : 'bg-gray-100 hover:bg-gray-200'
                  )}
                  onClick={() => addToast(`Événement: ${event.title}`, 'info')}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-lg',
                      typeInfo?.color + '/20'
                    )}
                  >
                    {typeInfo?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">
                      {event.title}
                    </h4>
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
                  <Badge
                    variant={
                      event.priority === 'urgent' || event.priority === 'critical'
                        ? 'urgent'
                        : event.priority === 'high'
                        ? 'warning'
                        : 'default'
                    }
                  >
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
