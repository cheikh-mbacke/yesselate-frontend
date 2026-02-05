'use client';

import React, { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Activity, Clock, User, FileText, CheckCircle2, AlertTriangle, PlayCircle, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  projectId: string;
  action: string;
  actor: string;
  actorRole: string;
  details: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface ProjectTimelineProps {
  open: boolean;
  projectId?: string;
  onClose: () => void;
}

export function ProjectTimeline({ open, projectId, onClose }: ProjectTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'major' | 'recent'>('all');

  useEffect(() => {
    if (open) {
      loadTimeline();
    }
  }, [open, projectId]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const url = projectId 
        ? `/api/projects/${encodeURIComponent(projectId)}/timeline`
        : '/api/projects/timeline';
      
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Erreur chargement timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (action: string) => {
    if (action.includes('created')) return <PlayCircle className="w-4 h-4 text-emerald-400" />;
    if (action.includes('updated')) return <FileText className="w-4 h-4 text-blue-400" />;
    if (action.includes('completed')) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (action.includes('blocked')) return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    if (action.includes('suspended')) return <Pause className="w-4 h-4 text-amber-400" />;
    return <Activity className="w-4 h-4 text-slate-400" />;
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'recent') {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return new Date(event.createdAt).getTime() > dayAgo;
    }
    if (filter === 'major') {
      return ['created', 'completed', 'blocked', 'suspended', 'cancelled'].some(
        action => event.action.toLowerCase().includes(action)
      );
    }
    return true;
  });

  return (
    <FluentModal 
      open={open} 
      title={projectId ? `Timeline — Projet ${projectId}` : 'Timeline globale'} 
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Filtres */}
        <div className="flex gap-2">
          <FluentButton
            size="sm"
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            Tous
          </FluentButton>
          <FluentButton
            size="sm"
            variant={filter === 'recent' ? 'primary' : 'secondary'}
            onClick={() => setFilter('recent')}
          >
            24h
          </FluentButton>
          <FluentButton
            size="sm"
            variant={filter === 'major' ? 'primary' : 'secondary'}
            onClick={() => setFilter('major')}
          >
            Majeurs
          </FluentButton>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-20 bg-slate-700 rounded" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun événement</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className="relative pl-6 pb-3"
              >
                {/* Timeline line */}
                {index !== filteredEvents.length - 1 && (
                  <div className="absolute left-2 top-6 bottom-0 w-px bg-slate-700" />
                )}

                {/* Event card */}
                <div className={cn(
                  'p-3 rounded-xl border transition-colors',
                  'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40'
                )}>
                  {/* Icon */}
                  <div className="absolute left-0 top-3 w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                    {getIcon(event.action)}
                  </div>

                  {/* Content */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm capitalize">{event.action}</div>
                        {event.details && (
                          <p className="text-xs text-slate-400 mt-1">{event.details}</p>
                        )}
                      </div>
                      <Badge variant="default" className="text-[9px] flex-none">
                        {formatDate(event.createdAt)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <User className="w-3 h-3" />
                      <span>{event.actor}</span>
                      {event.actorRole && (
                        <>
                          <span>•</span>
                          <span>{event.actorRole}</span>
                        </>
                      )}
                    </div>

                    {!projectId && event.projectId && (
                      <div className="pt-2 border-t border-slate-700/50 mt-2">
                        <span className="text-xs text-slate-400">
                          Projet: <span className="font-mono text-purple-300">{event.projectId}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400">
            {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
          </span>
          <FluentButton size="sm" variant="secondary" onClick={onClose}>
            Fermer
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diff = now - date.getTime();
  
  // Moins d'une heure
  if (diff < 60 * 60 * 1000) {
    const mins = Math.floor(diff / (60 * 1000));
    return mins <= 1 ? 'À l\'instant' : `Il y a ${mins} min`;
  }
  
  // Moins de 24h
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `Il y a ${hours}h`;
  }
  
  // Plus vieux
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

