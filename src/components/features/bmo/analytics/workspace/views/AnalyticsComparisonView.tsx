/**
 * AnalyticsComparisonView.tsx
 * ============================
 * 
 * Vue comparaison bureaux et périodes
 */

'use client';

import { useState, useMemo } from 'react';
import { FluentCard, FluentCardContent, FluentCardHeader, FluentCardTitle } from '@/components/ui/fluent-card';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpDown, DollarSign, Activity } from 'lucide-react';
import { calculateBureauPerformance, calculateFinancialPerformance } from '@/lib/data/analytics';
import { formatFCFA } from '@/lib/utils/format-currency';
import { bureaux } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { AnalyticsMainCategory } from '@/lib/stores/analyticsCommandCenterStore';

type ComparisonType = 'bureaux' | 'periods';

interface AnalyticsComparisonViewProps {
  category?: AnalyticsMainCategory;
  subCategory?: string;
}

export function AnalyticsComparisonView({ category, subCategory }: AnalyticsComparisonViewProps = {}) {
  const [comparisonType, setComparisonType] = useState<ComparisonType>('bureaux');
  const [selectedBureaux, setSelectedBureaux] = useState<string[]>([]);
  
  const bureauPerf = useMemo(() => calculateBureauPerformance(), []);

  const toggleBureau = (code: string) => {
    setSelectedBureaux(prev => 
      prev.includes(code) 
        ? prev.filter(b => b !== code)
        : [...prev, code]
    );
  };

  const selectedData = useMemo(() => {
    const selected = selectedBureaux.length > 0 
      ? bureauPerf.filter(b => selectedBureaux.includes(b.bureauCode))
      : bureauPerf.slice(0, 5);

    return selected;
  }, [bureauPerf, selectedBureaux]);

  // Données pour graphique comparatif
  const comparisonData = selectedData.map(b => ({
    bureau: b.bureauCode,
    score: b.score,
    validation: b.validationRate,
    sla: b.slaCompliance,
    delai: Math.max(0, 10 - b.avgDelay) * 10, // Inverse pour que plus c'est haut, mieux c'est
  }));

  // Données pour radar
  const radarData = [
    {
      metric: 'Score',
      ...Object.fromEntries(selectedData.map(b => [b.bureauCode, b.score])),
    },
    {
      metric: 'Validation %',
      ...Object.fromEntries(selectedData.map(b => [b.bureauCode, b.validationRate])),
    },
    {
      metric: 'SLA %',
      ...Object.fromEntries(selectedData.map(b => [b.bureauCode, b.slaCompliance])),
    },
    {
      metric: 'Efficacité',
      ...Object.fromEntries(selectedData.map(b => [b.bureauCode, Math.max(0, 100 - b.avgDelay * 10)])),
    },
  ];

  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Comparaisons & Benchmarks
            {category && category !== 'overview' && (
              <span className="ml-2 text-lg font-normal text-slate-500">
                • {category === 'performance' ? 'Performance' : 
                    category === 'trends' ? 'Tendances' : 
                    category === 'financial' ? 'Financier' : 
                    category === 'alerts' ? 'Alertes' : 
                    category === 'reports' ? 'Rapports' : 
                    category === 'kpis' ? 'KPIs' : 
                    category === 'bureaux' ? 'Bureaux' : category}
              </span>
            )}
          </h2>
          <p className="text-slate-500 text-sm">
            {category === 'performance' 
              ? 'Comparez les performances des KPIs entre bureaux'
              : category === 'trends'
              ? 'Comparez les tendances entre bureaux ou périodes'
              : category === 'financial'
              ? 'Comparez les données financières entre bureaux'
              : category === 'alerts'
              ? 'Comparez les alertes entre bureaux'
              : category === 'reports'
              ? 'Comparez les rapports entre bureaux'
              : category === 'kpis'
              ? 'Comparez les KPIs entre bureaux'
              : 'Comparez les performances entre bureaux ou périodes'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FluentButton
            size="sm"
            variant={comparisonType === 'bureaux' ? 'primary' : 'secondary'}
            onClick={() => setComparisonType('bureaux')}
          >
            🏢 Bureaux
          </FluentButton>
          <FluentButton
            size="sm"
            variant={comparisonType === 'periods' ? 'primary' : 'secondary'}
            onClick={() => setComparisonType('periods')}
          >
            📅 Périodes
          </FluentButton>
        </div>
      </div>

      {comparisonType === 'bureaux' && (
        <>
          {/* Sélection bureaux */}
          <FluentCard>
            <FluentCardHeader>
              <FluentCardTitle className="text-sm">
                Sélectionner les bureaux à comparer ({selectedBureaux.length || 'Top 5'} sélectionnés)
              </FluentCardTitle>
            </FluentCardHeader>
            <FluentCardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {bureaux.map((bureau) => {
                  const perf = bureauPerf.find(b => b.bureauCode === bureau.code);
                  const isSelected = selectedBureaux.includes(bureau.code);
                  
                  return (
                    <button
                      key={bureau.code}
                      onClick={() => toggleBureau(bureau.code)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-left',
                        isSelected
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{bureau.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{bureau.code}</div>
                          <div className="text-xs text-slate-500 truncate">{bureau.name}</div>
                        </div>
                      </div>
                      {perf && (
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={perf.score >= 80 ? 'success' : perf.score >= 60 ? 'warning' : 'urgent'}
                            className="text-xs"
                          >
                            {perf.score}
                          </Badge>
                          <span className="text-xs text-slate-500">{perf.totalDemands} dem.</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </FluentCardContent>
          </FluentCard>

          {/* Graphique comparatif */}
          <FluentCard>
            <FluentCardHeader>
              <FluentCardTitle className="text-sm">
                📊 Comparaison Multi-Critères
              </FluentCardTitle>
            </FluentCardHeader>
            <FluentCardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="bureau" 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="score" fill={COLORS[0]} name="Score /100" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="validation" fill={COLORS[1]} name="Validation %" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sla" fill={COLORS[2]} name="SLA %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FluentCardContent>
          </FluentCard>

          {/* Radar Chart */}
          <FluentCard>
            <FluentCardHeader>
              <FluentCardTitle className="text-sm">
                🎯 Analyse Radar (Performance globale)
              </FluentCardTitle>
            </FluentCardHeader>
            <FluentCardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    {selectedData.map((bureau, idx) => (
                      <Radar
                        key={bureau.bureauCode}
                        name={bureau.bureauCode}
                        dataKey={bureau.bureauCode}
                        stroke={COLORS[idx % COLORS.length]}
                        fill={COLORS[idx % COLORS.length]}
                        fillOpacity={0.2}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </FluentCardContent>
          </FluentCard>

          {/* Tableau comparatif */}
          <FluentCard>
            <FluentCardHeader>
              <FluentCardTitle className="text-sm">
                Résumé
              </FluentCardTitle>
            </FluentCardHeader>
            <FluentCardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 px-3 font-semibold">Bureau</th>
                      <th className="text-center py-2 px-3 font-semibold">Score</th>
                      <th className="text-center py-2 px-3 font-semibold">Valid. %</th>
                      <th className="text-center py-2 px-3 font-semibold">SLA %</th>
                      <th className="text-center py-2 px-3 font-semibold">Délai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.map((bureau) => (
                      <tr 
                        key={bureau.bureauCode}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {bureaux.find(b => b.code === bureau.bureauCode)?.icon}
                            </span>
                            <span className="font-semibold">{bureau.bureauCode}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Badge 
                            variant={bureau.score >= 80 ? 'success' : bureau.score >= 60 ? 'warning' : 'urgent'}
                            className="text-xs"
                          >
                            {bureau.score}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-center">{bureau.validationRate}%</td>
                        <td className="py-2 px-3 text-center">{bureau.slaCompliance}%</td>
                        <td className="py-2 px-3 text-center">
                          <span className={cn(
                            'font-medium text-xs',
                            bureau.avgDelay <= 3 ? 'text-emerald-500' :
                            bureau.avgDelay <= 5 ? 'text-amber-500' :
                            'text-red-500'
                          )}>
                            {bureau.avgDelay}j
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FluentCardContent>
          </FluentCard>
        </>
      )}

      {comparisonType === 'periods' && (
        <FluentCard>
          <FluentCardContent className="p-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Comparaison Périodes</h3>
            <p className="text-slate-500 mb-4">
              Fonctionnalité disponible prochainement
            </p>
            <p className="text-sm text-slate-400">
              Vous pourrez comparer les performances entre différentes périodes
              (mois, trimestres, années) pour identifier les tendances.
            </p>
          </FluentCardContent>
        </FluentCard>
      )}
    </div>
  );
}

