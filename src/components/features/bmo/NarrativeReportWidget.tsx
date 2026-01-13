'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Copy, Check } from 'lucide-react';

interface NarrativeReportWidgetProps {
  totals: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: number;
  };
  periodData: Array<{ month?: string; demandes: number; validations: number; rejets: number; budget: number }>;
  previousPeriod?: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: number;
  };
  risks: number;
  className?: string;
}

interface ReportSection {
  title: string;
  content: string;
  type?: 'summary' | 'performance' | 'trend' | 'risk' | 'recommendation';
}

export function NarrativeReportWidget({
  totals,
  periodData,
  previousPeriod,
  risks,
  className,
}: NarrativeReportWidgetProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const report = useMemo(() => {
    const validationRate = totals.demandes > 0 ? (totals.validations / totals.demandes) * 100 : 0;
    const rejectionRate = totals.demandes > 0 ? (totals.rejets / totals.demandes) * 100 : 0;

    const sections: ReportSection[] = [];

    // Résumé exécutif
    sections.push({
      title: 'Résumé exécutif',
      type: 'summary',
      content: `Sur la période analysée, un total de ${totals.demandes.toLocaleString('fr-FR')} demandes ont été traitées, avec ${totals.validations.toLocaleString('fr-FR')} validations réussies (taux de ${validationRate.toFixed(1)}%) et ${totals.rejets.toLocaleString('fr-FR')} rejets (taux de ${rejectionRate.toFixed(1)}%). Le budget total traité s'élève à ${totals.budget.toFixed(1)} milliards FCFA.`,
    });

    // Performance
    if (validationRate >= 80) {
      sections.push({
        title: 'Performance opérationnelle',
        type: 'performance',
        content: `L'organisation démontre une performance exceptionnelle avec un taux de validation de ${validationRate.toFixed(1)}%, bien au-dessus des standards. Cette performance témoigne d'un processus de validation efficace et d'une qualité élevée des dossiers soumis.`,
      });
    } else if (validationRate < 60) {
      sections.push({
        title: 'Performance opérationnelle',
        type: 'performance',
        content: `Le taux de validation de ${validationRate.toFixed(1)}% est en dessous des attentes et nécessite une attention particulière. Une analyse approfondie des causes de rejet est recommandée pour identifier les points d'amélioration.`,
      });
    }

    // Tendances
    if (periodData.length >= 6) {
      const recent = periodData.slice(-3);
      const previous = periodData.slice(-6, -3);
      const recentAvg = recent.reduce((sum, m) => sum + m.demandes, 0) / recent.length;
      const previousAvg = previous.reduce((sum, m) => sum + m.demandes, 0) / previous.length;
      const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

      if (Math.abs(trend) > 10) {
        sections.push({
          title: 'Analyse des tendances',
          type: 'trend',
          content: `Les trois derniers mois montrent une ${trend > 0 ? 'croissance' : 'diminution'} significative du volume de demandes (${Math.abs(trend).toFixed(1)}%). Cette évolution ${trend > 0 ? 'nécessite une adaptation des ressources' : 'pourrait indiquer des opportunités d\'optimisation'}.`,
        });
      }
    }

    // Risques
    if (risks > 0 || rejectionRate > 20) {
      sections.push({
        title: 'Points d\'attention',
        type: 'risk',
        content: `${risks > 0 ? `${risks} risque(s) critique(s) détecté(s). ` : ''}${rejectionRate > 20 ? `Le taux de rejet de ${rejectionRate.toFixed(1)}% est préoccupant. ` : ''}Il est recommandé de mettre en place un plan d'action correctif pour identifier et résoudre les causes récurrentes.`,
      });
    }

    // Recommandations
    const recommendations: string[] = [];
    if (validationRate < 75) {
      recommendations.push('Améliorer la qualité des dossiers soumis en amont');
    }
    if (rejectionRate > 15) {
      recommendations.push('Analyser les motifs de rejet récurrents et former les équipes');
    }
    if (risks > 5) {
      recommendations.push('Prioriser la résolution des risques critiques identifiés');
    }
    if (recommendations.length > 0) {
      sections.push({
        title: 'Recommandations',
        type: 'recommendation',
        content: recommendations.join(' • '),
      });
    }

    return sections;
  }, [totals, periodData, previousPeriod, risks]);

  const fullReport = useMemo(() => {
    return report.map((s) => `## ${s.title}\n\n${s.content}`).join('\n\n');
  }, [report]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullReport);
      setCopied(true);
      addToast('Rapport copié dans le presse-papiers', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Erreur lors de la copie', 'error');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([fullReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-narratif-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Rapport téléchargé', 'success');
  };

  return (
    <DashboardCard
      title="📝 Rapport Narratif Automatique"
      subtitle="Synthèse textuelle des performances"
      icon="📝"
      borderColor="#06B6D4"
      className={className}
    >
      <div className="space-y-3">
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Réduire' : 'Développer'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="text-xs"
          >
            {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied ? 'Copié' : 'Copier'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Télécharger
          </Button>
        </div>

        {/* Rapport */}
        <div className={cn('space-y-3', !isExpanded && 'max-h-64 overflow-y-auto')}>
          {report.map((section, idx) => (
            <div
              key={idx}
              className={cn(
                'p-3 rounded-lg border-l-4',
                darkMode ? 'bg-slate-800/30' : 'bg-gray-50',
                section.type === 'summary'
                  ? 'border-l-blue-400/60'
                  : section.type === 'performance'
                  ? 'border-l-emerald-400/60'
                  : section.type === 'trend'
                  ? 'border-l-purple-400/60'
                  : section.type === 'risk'
                  ? 'border-l-red-400/60'
                  : 'border-l-amber-400/60'
              )}
            >
              <h4 className="text-xs font-semibold mb-1">{section.title}</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

