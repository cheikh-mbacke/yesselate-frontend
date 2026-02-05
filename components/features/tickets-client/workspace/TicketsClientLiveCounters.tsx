'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Ticket,
  AlertCircle,
  Clock,
  UserCheck,
  CheckCircle2,
  ArrowUpCircle,
  Pause,
  XCircle,
  ChevronRight,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface TicketCounters {
  total: number;
  nouveau: number;
  enCours: number;
  enAttenteClient: number;
  enAttenteInterne: number;
  escalade: number;
  resolu: number;
  clos: number;
  annule: number;
  horsDelaiSLA: number;
  critique: number;
  haute: number;
}

interface CounterCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'slate' | 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'orange';
  onClick?: () => void;
  highlight?: boolean;
}

// ============================================
// COUNTER CARD
// ============================================

const colorStyles = {
  slate: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700',
  blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-700',
  amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-700',
  rose: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-800/30 hover:border-rose-300 dark:hover:border-rose-700',
  purple: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200/50 dark:border-purple-800/30 hover:border-purple-300 dark:hover:border-purple-700',
  orange: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200/50 dark:border-orange-800/30 hover:border-orange-300 dark:hover:border-orange-700',
};

const textColors = {
  slate: 'text-slate-600 dark:text-slate-400',
  blue: 'text-blue-600 dark:text-blue-400',
  amber: 'text-amber-600 dark:text-amber-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  rose: 'text-rose-600 dark:text-rose-400',
  purple: 'text-purple-600 dark:text-purple-400',
  orange: 'text-orange-600 dark:text-orange-400',
};

function CounterCard({ label, value, icon, color, onClick, highlight }: CounterCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'relative flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
        colorStyles[color],
        onClick && 'cursor-pointer hover:shadow-sm',
        highlight && 'ring-2 ring-offset-2 ring-orange-500'
      )}
    >
      <div className={cn('flex-shrink-0', textColors[color])}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{label}</div>
        <div className={cn('text-2xl font-bold', textColors[color])}>{value}</div>
      </div>
      {onClick && (
        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
      )}
      {highlight && value > 0 && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
        </span>
      )}
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface TicketsClientLiveCountersProps {
  counters?: TicketCounters | null;
  loading?: boolean;
  onOpenQueue?: (queue: string) => void;
}

export function TicketsClientLiveCounters({
  counters,
  loading,
  onOpenQueue,
}: TicketsClientLiveCountersProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const data = counters ?? {
    total: 0,
    nouveau: 0,
    enCours: 0,
    enAttenteClient: 0,
    enAttenteInterne: 0,
    escalade: 0,
    resolu: 0,
    clos: 0,
    annule: 0,
    horsDelaiSLA: 0,
    critique: 0,
    haute: 0,
  };

  return (
    <div className="space-y-4">
      {/* Alertes critiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <CounterCard
          label="Critiques"
          value={data.critique}
          icon={<AlertCircle className="w-5 h-5" />}
          color="rose"
          onClick={() => onOpenQueue?.('critique')}
          highlight={data.critique > 0}
        />
        <CounterCard
          label="Hors délai SLA"
          value={data.horsDelaiSLA}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          onClick={() => onOpenQueue?.('hors_delai')}
          highlight={data.horsDelaiSLA > 0}
        />
        <CounterCard
          label="Escaladés"
          value={data.escalade}
          icon={<ArrowUpCircle className="w-5 h-5" />}
          color="purple"
          onClick={() => onOpenQueue?.('escalade')}
          highlight={data.escalade > 0}
        />
      </div>

      {/* Statuts principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <CounterCard
          label="Nouveaux"
          value={data.nouveau}
          icon={<Ticket className="w-5 h-5" />}
          color="blue"
          onClick={() => onOpenQueue?.('nouveau')}
        />
        <CounterCard
          label="En cours"
          value={data.enCours}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
          onClick={() => onOpenQueue?.('en_cours')}
        />
        <CounterCard
          label="Attente client"
          value={data.enAttenteClient}
          icon={<UserCheck className="w-5 h-5" />}
          color="amber"
          onClick={() => onOpenQueue?.('en_attente_client')}
        />
        <CounterCard
          label="Attente interne"
          value={data.enAttenteInterne}
          icon={<Pause className="w-5 h-5" />}
          color="slate"
          onClick={() => onOpenQueue?.('en_attente_interne')}
        />
        <CounterCard
          label="Résolus"
          value={data.resolu}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
          onClick={() => onOpenQueue?.('resolu')}
        />
        <CounterCard
          label="Clos"
          value={data.clos}
          icon={<XCircle className="w-5 h-5" />}
          color="slate"
          onClick={() => onOpenQueue?.('clos')}
        />
      </div>
    </div>
  );
}

