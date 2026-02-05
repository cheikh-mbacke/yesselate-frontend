'use client';

import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Bureau } from '@/lib/types/bmo.types';

interface ComparisonChartProps {
  bureaux: Bureau[];
  performanceData: any[];
  selectedBureaux: string[];
}

export function ComparisonChart({ bureaux, performanceData, selectedBureaux }: ComparisonChartProps) {
  const radarData = useMemo(() => {
    if (selectedBureaux.length === 0 || selectedBureaux.includes('ALL')) {
      return [];
    }

    return selectedBureaux.map(bureauCode => {
      const bureau = bureaux.find(b => b.code === bureauCode);
      if (!bureau) return null;

      // Calculer les métriques pour ce bureau (simulation)
      const bureauData = performanceData.filter((d: any) => d.bureau === bureauCode);
      
      return {
        subject: bureau.code,
        demandes: bureauData.reduce((sum: number, d: any) => sum + (d.demandes || 0), 0),
        validations: bureauData.reduce((sum: number, d: any) => sum + (d.validations || 0), 0),
        efficacite: bureau.completion || 50,
        charge: bureau.tasks || 0,
        budget: parseFloat((bureau.budget || '0').replace(/,/g, '')) || 0,
      };
    }).filter(Boolean);
  }, [bureaux, performanceData, selectedBureaux]);

  if (radarData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">📊 Comparaison multi-bureaux</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 text-center py-8">
            Sélectionnez au moins un bureau pour comparer
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">📊 Comparaison multi-bureaux (Radar)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Radar
                name="Demandes"
                dataKey="demandes"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
              <Radar
                name="Validations"
                dataKey="validations"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
              <Radar
                name="Efficacité"
                dataKey="efficacite"
                stroke="#F97316"
                fill="#F97316"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

