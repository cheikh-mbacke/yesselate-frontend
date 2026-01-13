'use client';

/**
 * Suggestions IA intelligentes pour la gouvernance
 * Analyse les patterns RACI et alertes pour proposer des optimisations
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Sparkles, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';

interface AISuggestion {
  id: string;
  type: 'optimization' | 'risk' | 'pattern' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  confidence: number; // 0-100
}

interface AISuggestionsProps {
  raciData: Array<{
    activity: string;
    category: string;
    criticality: string;
    roles: Record<string, string>;
    locked?: boolean;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    bureau?: string;
    ownership?: { role?: string };
  }>;
  onApplySuggestion?: (suggestionId: string) => void;
}

export function AISuggestions({ raciData, alerts, onApplySuggestion }: AISuggestionsProps) {
  const { darkMode } = useAppStore();

  const suggestions = useMemo(() => {
    const items: AISuggestion[] = [];

    // 1. Détecter les activités critiques sans rôle Accountable
    const criticalWithoutA = raciData.filter(r => 
      r.criticality === 'critical' && 
      !Object.values(r.roles).includes('A')
    );
    if (criticalWithoutA.length > 0) {
      items.push({
        id: 'critical-no-a',
        type: 'risk',
        priority: 'high',
        title: `${criticalWithoutA.length} activité(s) critique(s) sans rôle Accountable`,
        description: 'Les activités critiques doivent avoir un rôle A (Accountable) clairement défini pour garantir la responsabilité.',
        impact: 'Risque de confusion des responsabilités et de blocages',
        confidence: 95,
        action: {
          label: 'Voir les activités',
          onClick: () => {
            // Scroller vers les activités concernées
            document.querySelector('[data-critical-no-a]')?.scrollIntoView({ behavior: 'smooth' });
          },
        },
      });
    }

    // 2. Détecter les bureaux surchargés (>50% des activités)
    const bureauLoad: Record<string, number> = {};
    raciData.forEach(row => {
      Object.entries(row.roles).forEach(([bureau, role]) => {
        if (role !== '-') {
          bureauLoad[bureau] = (bureauLoad[bureau] || 0) + 1;
        }
      });
    });
    const totalActivities = raciData.length;
    const overloadedBureaux = Object.entries(bureauLoad)
      .filter(([_, count]) => (count / totalActivities) > 0.5)
      .map(([bureau, count]) => ({ bureau, rate: (count / totalActivities) * 100 }));
    
    if (overloadedBureaux.length > 0) {
      overloadedBureaux.forEach(({ bureau, rate }) => {
        items.push({
          id: `overload-${bureau}`,
          type: 'risk',
          priority: rate > 70 ? 'high' : 'medium',
          title: `Bureau ${bureau} surchargé (${Math.round(rate)}%)`,
          description: `${bureau} est impliqué dans plus de ${Math.round(rate)}% des activités. Risque de goulot d'étranglement.`,
          impact: 'Risque de retard dans le traitement des activités',
          confidence: 85,
        });
      });
    }

    // 3. Détecter les alertes sans ownership RACI clair
    const alertsWithoutRACI = alerts.filter(a => 
      a.severity === 'critical' && 
      (!a.ownership?.role || a.ownership.role === 'R')
    );
    if (alertsWithoutRACI.length > 0) {
      items.push({
        id: 'alerts-no-raci',
        type: 'pattern',
        priority: 'high',
        title: `${alertsWithoutRACI.length} alerte(s) critique(s) sans ownership clair`,
        description: 'Ces alertes nécessitent un rôle Accountable (A) défini dans la matrice RACI pour clarifier la responsabilité.',
        impact: 'Risque d\'escalade inappropriée ou de retard de traitement',
        confidence: 80,
      });
    }

    // 4. Détecter les patterns de délégation (trop de R, pas assez de A)
    const avgAccountablePerActivity = raciData.reduce((sum, row) => {
      const accountableCount = Object.values(row.roles).filter(r => r === 'A').length;
      return sum + accountableCount;
    }, 0) / raciData.length;

    if (avgAccountablePerActivity < 0.5) {
      items.push({
        id: 'delegation-pattern',
        type: 'optimization',
        priority: 'medium',
        title: 'Pattern de délégation à optimiser',
        description: `Moyenne de ${avgAccountablePerActivity.toFixed(1)} rôle(s) Accountable par activité. Idéalement ≥ 1 pour garantir la responsabilité.`,
        impact: 'Clarification des responsabilités et amélioration de la traçabilité',
        confidence: 75,
      });
    }

    // 5. Recommandation: Activités similaires à regrouper
    const categories = new Map<string, string[]>();
    raciData.forEach(row => {
      if (!categories.has(row.category)) {
        categories.set(row.category, []);
      }
      categories.get(row.category)!.push(row.activity);
    });

    const largeCategories = Array.from(categories.entries())
      .filter(([_, activities]) => activities.length >= 5);
    
    if (largeCategories.length > 0) {
      largeCategories.forEach(([category, activities]) => {
        items.push({
          id: `group-${category}`,
          type: 'recommendation',
          priority: 'low',
          title: `${activities.length} activités dans la catégorie "${category}"`,
          description: `Regrouper ces activités similaires pourrait simplifier la gestion et améliorer la cohérence RACI.`,
          impact: 'Simplification de la matrice et meilleure lisibilité',
          confidence: 60,
        });
      });
    }

    // Trier par priorité puis par confiance
    return items.sort((a, b) => {
      const priorityRank = { high: 3, medium: 2, low: 1 };
      if (priorityRank[a.priority] !== priorityRank[b.priority]) {
        return priorityRank[b.priority] - priorityRank[a.priority];
      }
      return b.confidence - a.confidence;
    });
  }, [raciData, alerts]);

  if (suggestions.length === 0) {
    return (
      <Card className="bg-emerald-400/8 border-emerald-400/20">
        <CardContent className="p-4 text-center">
          <span className="text-2xl block mb-2">✅</span>
          <p className="text-sm text-emerald-300/80 font-semibold">
            Aucune optimisation détectée
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Votre matrice RACI est bien équilibrée !
          </p>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="w-4 h-4" />;
      case 'optimization': return <TrendingUp className="w-4 h-4" />;
      case 'pattern': return <Sparkles className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'risk': return 'text-red-300/80 border-red-400/30 bg-red-400/8';
      case 'optimization': return 'text-blue-300/80 border-blue-400/30 bg-blue-400/8';
      case 'pattern': return 'text-purple-300/80 border-purple-400/30 bg-purple-400/8';
      case 'recommendation': return 'text-amber-300/80 border-amber-400/30 bg-amber-400/8';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400/80" />
          Suggestions IA ({suggestions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={cn(
              'p-3 rounded-lg border transition-all',
              getTypeColor(suggestion.type)
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1">
                {getIcon(suggestion.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-semibold">{suggestion.title}</h4>
                    <Badge
                      variant={suggestion.priority === 'high' ? 'urgent' : suggestion.priority === 'medium' ? 'warning' : 'default'}
                      className="text-[9px]"
                    >
                      {suggestion.priority}
                    </Badge>
                    <Badge variant="info" className="text-[9px]">
                      {suggestion.confidence}% confiance
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-300 mb-2">{suggestion.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-[9px] sm:text-[10px] text-slate-400 italic">
                💡 Impact: {suggestion.impact}
              </p>
              {suggestion.action && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    suggestion.action?.onClick();
                    onApplySuggestion?.(suggestion.id);
                  }}
                  className="text-[9px] h-5"
                >
                  {suggestion.action.label}
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

