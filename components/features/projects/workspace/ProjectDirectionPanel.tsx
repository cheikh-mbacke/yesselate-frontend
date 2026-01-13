'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FluentButton } from '@/components/ui/fluent-button';
import { 
  AlertTriangle, 
  ListChecks, 
  TrendingUp, 
  PlayCircle,
  Calendar,
  DollarSign,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DecisionItem {
  id: string;
  name: string;
  status: string;
  risk: number;
  complexity: number;
  daysOverdue?: number;
  budgetOverrun?: number;
}

export function ProjectDirectionPanel() {
  const [decisionItems, setDecisionItems] = useState<DecisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDecisionItems();
  }, []);

  const loadDecisionItems = async () => {
    try {
      const res = await fetch('/api/projects?queue=decision&limit=10', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setDecisionItems(data.items || []);
      }
    } catch (error) {
      console.error('Erreur chargement centre de décision:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDecisionCenter = () => {
    window.dispatchEvent(new CustomEvent('project:open-decision-center'));
  };

  const criticalItems = decisionItems.filter(item => 
    item.risk >= 60 || item.status === 'blocked' || (item.daysOverdue && item.daysOverdue > 0)
  );

  if (loading) {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-700 rounded w-1/2" />
            <div className="h-20 bg-slate-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (criticalItems.length === 0) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <ListChecks className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-300/90">Portefeuille sain</h3>
              <p className="text-sm text-slate-400">
                Aucun projet critique nécessitant une décision immédiate
              </p>
            </div>
            <Badge variant="success" className="text-xs">✓ OK</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bannière principale */}
      <Card className="border-amber-500/20 bg-amber-500/10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-300/90">Centre de décision — Direction</h3>
                  <p className="text-sm text-slate-400">
                    {criticalItems.length} projet{criticalItems.length > 1 ? 's' : ''} nécessite{criticalItems.length > 1 ? 'nt' : ''} votre attention
                  </p>
                </div>
              </div>

              {/* Métriques rapides */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <p className="text-xs text-slate-400">Bloqués</p>
                  <p className="text-xl font-bold text-rose-300">
                    {criticalItems.filter(i => i.status === 'blocked').length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-slate-400">En retard</p>
                  <p className="text-xl font-bold text-amber-300">
                    {criticalItems.filter(i => i.daysOverdue && i.daysOverdue > 0).length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-slate-400">Risque élevé</p>
                  <p className="text-xl font-bold text-purple-300">
                    {criticalItems.filter(i => i.risk >= 60).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <FluentButton variant="warning" size="sm" onClick={openDecisionCenter}>
                <ListChecks className="w-4 h-4 mr-2" />
                Ouvrir le centre
              </FluentButton>
              <Badge variant="urgent" className="text-xs justify-center">
                Ctrl+D
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu top 3 */}
      <Card className="border-slate-200/20 bg-white/5 dark:border-slate-800">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-3 text-slate-400">Projets prioritaires (top 3)</h4>
          <div className="space-y-2">
            {criticalItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className={cn(
                  'p-3 rounded-xl border transition-colors cursor-pointer',
                  'hover:bg-slate-800/50',
                  item.risk >= 60 && 'border-rose-300/30 bg-rose-900/10',
                  item.status === 'blocked' && 'border-amber-300/30 bg-amber-900/10'
                )}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('project:open', { detail: { projectId: item.id } }));
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-orange-300/80">{item.id}</span>
                      <Badge 
                        variant={item.status === 'blocked' ? 'urgent' : 'warning'} 
                        className="text-[9px]"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{item.name}</p>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-right">
                    {item.risk >= 60 && (
                      <Badge variant="urgent" className="text-[9px]">
                        ⚠️ {item.risk}
                      </Badge>
                    )}
                    {item.daysOverdue && item.daysOverdue > 0 && (
                      <Badge variant="warning" className="text-[9px]">
                        +{item.daysOverdue}j
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

