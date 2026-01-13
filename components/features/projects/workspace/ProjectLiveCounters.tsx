'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectStats {
  total: number;
  active: number;
  blocked: number;
  late: number;
  highRisk: number;
  completed: number;
  avgComplexity: number;
  avgRisk: number;
  informal: number;
  missingDecision: number;
}

export function ProjectLiveCounters() {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/projects/stats', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        
        // Simuler une tendance basée sur le risque
        if (data.highRisk > 5) setTrend('down');
        else if (data.highRisk <= 2) setTrend('up');
        else setTrend('stable');
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-700 rounded w-1/3" />
            <div className="h-8 bg-slate-700 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-rose-400" />;
      default:
        return <Minus className="w-5 h-5 text-slate-400" />;
    }
  };

  const criticalCount = stats.blocked + stats.late + stats.highRisk;

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate-400">Portefeuille projets</h3>
              {getTrendIcon()}
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-slate-500">projets au total</p>
          </div>
          
          {criticalCount > 0 && (
            <Badge variant="urgent" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {criticalCount} critiques
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Actifs */}
          <div className={cn(
            'p-3 rounded-xl border transition-colors',
            'bg-emerald-500/10 border-emerald-500/30'
          )}>
            <div className="flex items-center justify-between mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-2xl font-bold text-emerald-300">{stats.active}</span>
            </div>
            <p className="text-xs text-slate-400">Actifs</p>
          </div>

          {/* Bloqués */}
          <div className={cn(
            'p-3 rounded-xl border transition-colors',
            'bg-rose-500/10 border-rose-500/30'
          )}>
            <div className="flex items-center justify-between mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-2xl font-bold text-rose-300">{stats.blocked}</span>
            </div>
            <p className="text-xs text-slate-400">Bloqués</p>
          </div>

          {/* En retard */}
          <div className={cn(
            'p-3 rounded-xl border transition-colors',
            'bg-amber-500/10 border-amber-500/30'
          )}>
            <div className="flex items-center justify-between mb-1">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-2xl font-bold text-amber-300">{stats.late}</span>
            </div>
            <p className="text-xs text-slate-400">En retard</p>
          </div>

          {/* À risque */}
          <div className={cn(
            'p-3 rounded-xl border transition-colors',
            'bg-purple-500/10 border-purple-500/30'
          )}>
            <div className="flex items-center justify-between mb-1">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              <span className="text-2xl font-bold text-purple-300">{stats.highRisk}</span>
            </div>
            <p className="text-xs text-slate-400">Risque élevé</p>
          </div>
        </div>

        {/* Métriques secondaires */}
        <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-400">Complexité moy.</p>
            <p className="text-lg font-mono font-semibold text-purple-300">
              {stats.avgComplexity}/100
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Risque moy.</p>
            <p className="text-lg font-mono font-semibold text-amber-300">
              {stats.avgRisk}/100
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Informels</p>
            <p className="text-lg font-mono font-semibold text-slate-300">
              {stats.informal}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

