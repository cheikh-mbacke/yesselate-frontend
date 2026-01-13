import { useMemo } from 'react';

/**
 * Hook pour analyser la matrice RACI et générer des insights
 * Détecte les incohérences, surcharges, et suggère des optimisations
 */
export function useRACIAnalytics(raciData: Array<{
  activity: string;
  category: string;
  criticality: string;
  roles: Record<string, string>;
  locked?: boolean;
}>) {
  return useMemo(() => {
    const insights = {
      conflicts: [] as Array<{ activity: string; issue: string; severity: 'critical' | 'warning' | 'info' }>,
      overloads: [] as Array<{ bureau: string; activityCount: number; recommendation: string }>,
      gaps: [] as Array<{ activity: string; missingRole: string; impact: string }>,
      suggestions: [] as Array<{ activity: string; suggestion: string; confidence: number }>,
    };

    // 1. Détecter les conflits (plusieurs Accountable sur une même activité)
    raciData.forEach((row) => {
      const accountableCount = Object.values(row.roles).filter(r => r === 'A').length;
      if (accountableCount > 1) {
        insights.conflicts.push({
          activity: row.activity,
          issue: `${accountableCount} responsables Accountable détectés (devrait être 1)`,
          severity: 'critical',
        });
      }

      // Activité critique sans Accountable
      if (row.criticality === 'critical' && !Object.values(row.roles).includes('A')) {
        insights.gaps.push({
          activity: row.activity,
          missingRole: 'A',
          impact: 'Activité critique sans responsable final',
        });
      }
    });

    // 2. Détecter les surcharges par bureau
    const bureauCounts: Record<string, number> = {};
    raciData.forEach((row) => {
      Object.entries(row.roles).forEach(([bureau, role]) => {
        if (role === 'R' || role === 'A') {
          bureauCounts[bureau] = (bureauCounts[bureau] || 0) + 1;
        }
      });
    });

    Object.entries(bureauCounts).forEach(([bureau, count]) => {
      if (count > 10) {
        insights.overloads.push({
          bureau,
          activityCount: count,
          recommendation: `Considérer la délégation ou la redistribution de ${count - 8} activités`,
        });
      }
    });

    // 3. Suggestions intelligentes basées sur les patterns
    raciData.forEach((row) => {
      // Activité verrouillée mais non critique → suggérer déverrouillage
      if (row.locked && row.criticality !== 'critical') {
        insights.suggestions.push({
          activity: row.activity,
          suggestion: 'Déverrouiller pour permettre la flexibilité',
          confidence: 70,
        });
      }

      // Activité critique sans Responsible → suggérer d'assigner
      if (row.criticality === 'critical' && !Object.values(row.roles).includes('R')) {
        insights.suggestions.push({
          activity: row.activity,
          suggestion: 'Assigner un Responsible pour l\'exécution',
          confidence: 90,
        });
      }
    });

    return insights;
  }, [raciData]);
}

