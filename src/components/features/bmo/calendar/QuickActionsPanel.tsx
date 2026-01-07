'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Filter,
  RefreshCw,
  Download,
  Upload,
  Bell,
  Eye
} from 'lucide-react';

interface QuickActionsPanelProps {
  onQuickAction: (action: string) => void;
  stats: {
    urgentCount: number;
    overloadedDays: number;
    criticalAlerts: number;
  };
}

export function QuickActionsPanel({ onQuickAction, stats }: QuickActionsPanelProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [expanded, setExpanded] = useState(false);

  const quickActions = [
    {
      id: 'focus-urgent',
      label: 'Focus Urgences',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      count: stats.urgentCount,
      action: () => {
        onQuickAction('focus-urgent');
        addToast('Filtres appliqués : Urgences uniquement', 'info');
      },
    },
    {
      id: 'focus-overload',
      label: 'Voir Surcharges',
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      count: stats.overloadedDays,
      action: () => {
        onQuickAction('focus-overload');
        addToast(`${stats.overloadedDays} jour(s) en surcharge`, 'warning');
      },
    },
    {
      id: 'view-all',
      label: 'Vue Tous Bureaux',
      icon: Eye,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      action: () => {
        onQuickAction('view-all');
        addToast('Filtres réinitialisés', 'info');
      },
    },
    {
      id: 'export',
      label: 'Exporter Planning',
      icon: Download,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      action: () => {
        addToast('Export du planning en cours...', 'info');
        // TODO: Implémenter export
      },
    },
    {
      id: 'notify',
      label: 'Notifications',
      icon: Bell,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      count: stats.criticalAlerts,
      action: () => {
        addToast(`${stats.criticalAlerts} alerte(s) critique(s)`, 'warning');
      },
    },
    {
      id: 'refresh',
      label: 'Actualiser',
      icon: RefreshCw,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      action: () => {
        window.location.reload();
      },
    },
  ];

  return (
    <Card className={cn(
      'transition-all duration-300',
      expanded ? 'shadow-lg' : 'shadow-md'
    )}>
      <CardHeader 
        className="pb-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
            Actions Rapides BMO
          </span>
          <Badge variant="info" className="text-xs">
            {stats.urgentCount + stats.criticalAlerts} alertes
          </Badge>
        </CardTitle>
      </CardHeader>
      
      {expanded && (
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={cn(
                    'p-3 rounded-lg border transition-all hover:scale-105 group',
                    'flex flex-col items-center gap-2',
                    action.bgColor,
                    darkMode ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg',
                    action.bgColor,
                    'group-hover:scale-110 transition-transform'
                  )}>
                    <Icon className={cn('w-5 h-5', action.color)} />
                  </div>
                  <span className="text-xs font-semibold text-center">{action.label}</span>
                  {action.count !== undefined && action.count > 0 && (
                    <Badge
                      variant={action.id.includes('urgent') || action.id.includes('critical') ? 'urgent' : 'warning'}
                      className="text-[9px]"
                    >
                      {action.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

