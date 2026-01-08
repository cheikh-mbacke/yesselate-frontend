'use client';

/**
 * Détecteur de patterns RACI avancé
 * Identifie les anomalies, optimisations, et risques organisationnels
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { AlertTriangle, TrendingDown, Users, Shield } from 'lucide-react';

interface Pattern {
  id: string;
  type: 'anomaly' | 'optimization' | 'risk' | 'opportunity';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedActivities: string[];
  recommendation: string;
  confidence: number;
}

interface RACIPatternDetectorProps {
  raciData: Array<{
    activity: string;
    category: string;
    criticality: string;
    roles: Record<string, string>;
    locked?: boolean;
  }>;
  bureaux: string[];
}

export function RACIPatternDetector({ raciData, bureaux }: RACIPatternDetectorProps) {
  const { darkMode } = useAppStore();

  const patterns = useMemo(() => {
    const detected: Pattern[] = [];

    // 1. Détecter les activités critiques sans Accountable
    const criticalNoA = raciData.filter(r => 
      r.criticality === 'critical' && !Object.values(r.roles).includes('A')
    );
    if (criticalNoA.length > 0) {
      detected.push({
        id: 'critical-no-a',
        type: 'risk',
        severity: 'critical',
        title: `${criticalNoA.length} activité(s) critique(s) sans Accountable`,
        description: 'Risque majeur : activités critiques sans responsable final défini',
        affectedActivities: criticalNoA.map(a => a.activity),
        recommendation: 'Assigner un rôle A (Accountable) pour chaque activité critique',
        confidence: 95,
      });
    }

    // 2. Détecter les bureaux en surcharge (>60% des activités)
    const bureauLoad: Record<string, number> = {};
    raciData.forEach(row => {
      Object.entries(row.roles).forEach(([bureau, role]) => {
        if (role === 'R' || role === 'A') {
          bureauLoad[bureau] = (bureauLoad[bureau] || 0) + 1;
        }
      });
    });

    Object.entries(bureauLoad).forEach(([bureau, count]) => {
      const rate = (count / raciData.length) * 100;
      if (rate > 60) {
        const affected = raciData
          .filter(r => r.roles[bureau] === 'R' || r.roles[bureau] === 'A')
          .map(r => r.activity);
        
        detected.push({
          id: `overload-${bureau}`,
          type: 'risk',
          severity: rate > 75 ? 'critical' : 'high',
          title: `Bureau ${bureau} en surcharge (${Math.round(rate)}%)`,
          description: `${bureau} est responsable de ${Math.round(rate)}% des activités. Risque de goulot d'étranglement.`,
          affectedActivities: affected.slice(0, 5), // Limiter l'affichage
          recommendation: `Redistribuer certaines activités vers d'autres bureaux ou augmenter la capacité de ${bureau}`,
          confidence: 85,
        });
      }
    });

    // 3. Détecter les activités avec plusieurs Accountable (violation RACI)
    raciData.forEach(row => {
      const accountableCount = Object.values(row.roles).filter(r => r === 'A').length;
      if (accountableCount > 1) {
        detected.push({
          id: `multiple-a-${row.activity}`,
          type: 'anomaly',
          severity: 'high',
          title: `Activité "${row.activity}" avec ${accountableCount} Accountable`,
          description: 'Violation du principe RACI : une seule personne doit être Accountable',
          affectedActivities: [row.activity],
          recommendation: 'Désigner un seul Accountable et transformer les autres en Responsible (R) ou Consulted (C)',
          confidence: 90,
        });
      }
    });

    // 4. Détecter les opportunités d'optimisation (catégories similaires)
    const categoryGroups = new Map<string, string[]>();
    raciData.forEach(row => {
      if (!categoryGroups.has(row.category)) {
        categoryGroups.set(row.category, []);
      }
      categoryGroups.get(row.category)!.push(row.activity);
    });

    categoryGroups.forEach((activities, category) => {
      if (activities.length >= 8) {
        // Vérifier la cohérence des rôles dans cette catégorie
        const roles = new Set<string>();
        activities.forEach(activity => {
          const row = raciData.find(r => r.activity === activity);
          if (row) {
            Object.values(row.roles).forEach(role => roles.add(role));
          }
        });

        if (roles.size < 3) {
          detected.push({
            id: `optimize-${category}`,
            type: 'optimization',
            severity: 'medium',
            title: `Opportunité d'optimisation : ${activities.length} activités similaires dans "${category}"`,
            description: `Ces activités partagent des patterns RACI similaires. Regroupement possible pour simplification.`,
            affectedActivities: activities.slice(0, 5),
            recommendation: 'Créer un template RACI pour cette catégorie et appliquer aux activités similaires',
            confidence: 70,
          });
        }
      }
    });

    // 5. Détecter les activités isolées (sans interaction entre bureaux)
    const isolated = raciData.filter(row => {
      const activeRoles = Object.values(row.roles).filter(r => r !== '-');
      return activeRoles.length === 1;
    });

    if (isolated.length > raciData.length * 0.3) {
      detected.push({
        id: 'isolated-activities',
        type: 'opportunity',
        severity: 'low',
        title: `${isolated.length} activité(s) isolée(s) détectée(s)`,
        description: 'Plusieurs activités n\'impliquent qu\'un seul bureau. Opportunité de transversalité ?',
        affectedActivities: isolated.slice(0, 5).map(a => a.activity),
        recommendation: 'Évaluer l\'opportunité de créer des interactions transversales pour améliorer la collaboration',
        confidence: 60,
      });
    }

    // Trier par sévérité puis confiance
    const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
    return detected.sort((a, b) => {
      if (severityRank[a.severity] !== severityRank[b.severity]) {
        return severityRank[b.severity] - severityRank[a.severity];
      }
      return b.confidence - a.confidence;
    });
  }, [raciData, bureaux]);

  if (patterns.length === 0) {
    return (
      <Card className="bg-emerald-400/8 border-emerald-400/20">
        <CardContent className="p-4 text-center">
          <Shield className="w-8 h-8 mx-auto mb-2 text-emerald-300/80" />
          <p className="text-sm text-emerald-300/80 font-semibold">
            Aucun pattern anormal détecté
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Votre matrice RACI semble bien équilibrée !
          </p>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: Pattern['type']) => {
    switch (type) {
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      case 'risk': return <Shield className="w-4 h-4" />;
      case 'optimization': return <TrendingDown className="w-4 h-4" />;
      case 'opportunity': return <Users className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Pattern['type'], severity: Pattern['severity']) => {
    if (severity === 'critical') return 'bg-red-400/10 border-red-400/30 text-red-300/80';
    if (severity === 'high') return 'bg-orange-400/10 border-orange-400/30 text-orange-300/80';
    if (type === 'optimization') return 'bg-blue-400/10 border-blue-400/30 text-blue-300/80';
    return 'bg-amber-400/10 border-amber-400/30 text-amber-300/80';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400/80" />
          Détection de Patterns ({patterns.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patterns.slice(0, 5).map((pattern) => (
          <div
            key={pattern.id}
            className={cn(
              'p-3 rounded-lg border transition-all',
              getTypeColor(pattern.type, pattern.severity)
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1">
                {getIcon(pattern.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-semibold">{pattern.title}</h4>
                    <Badge
                      variant={
                        pattern.severity === 'critical'
                          ? 'urgent'
                          : pattern.severity === 'high'
                          ? 'warning'
                          : 'default'
                      }
                      className="text-[9px]"
                    >
                      {pattern.severity}
                    </Badge>
                    <Badge variant="info" className="text-[9px]">
                      {pattern.confidence}% confiance
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-300 mb-2">{pattern.description}</p>
            {pattern.affectedActivities.length > 0 && (
              <div className="mb-2">
                <p className="text-[9px] sm:text-[10px] text-slate-400 mb-1">Activités concernées :</p>
                <div className="flex flex-wrap gap-1">
                  {pattern.affectedActivities.map((act, idx) => (
                    <Badge key={idx} variant="default" className="text-[8px] sm:text-[9px]">
                      {act}
                    </Badge>
                  ))}
                  {pattern.affectedActivities.length >= 5 && (
                    <Badge variant="default" className="text-[8px] sm:text-[9px]">
                      +{pattern.affectedActivities.length - 5} autres
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <div className={cn(
              "p-2 rounded text-[9px] sm:text-[10px] mt-2",
              darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
            )}>
              <span className="font-semibold text-blue-300/80">💡 Recommandation:</span>
              <p className="text-slate-300 mt-0.5">{pattern.recommendation}</p>
            </div>
          </div>
        ))}
        {patterns.length > 5 && (
          <p className="text-[9px] sm:text-[10px] text-slate-400 text-center">
            +{patterns.length - 5} autre(s) pattern(s) détecté(s)
          </p>
        )}
      </CardContent>
    </Card>
  );
}

