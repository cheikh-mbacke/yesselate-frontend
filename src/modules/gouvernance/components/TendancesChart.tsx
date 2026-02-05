/**
 * Composant de graphique pour les tendances mensuelles
 * Utilise Chart.js pour afficher les évolutions
 */

'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { cn } from '@/lib/utils';
import { useGouvernanceData } from '../hooks/useGouvernanceData';
import type { TendanceMensuelle } from '../types/gouvernanceTypes';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TendancesChartProps {
  className?: string;
  type?: 'line' | 'bar';
}

export function TendancesChart({ className, type = 'line' }: TendancesChartProps) {
  const { data, isLoading } = useGouvernanceData('tendances');

  const tendances = (data as TendanceMensuelle[]) || [];

  if (isLoading) {
    return (
      <div className={cn('rounded-2xl bg-white/5 p-4 ring-1 ring-white/10', className)}>
        <div className="text-sm text-slate-400">Chargement des tendances...</div>
      </div>
    );
  }

  if (!tendances || tendances.length === 0) {
    return (
      <div className={cn('rounded-2xl bg-white/5 p-4 ring-1 ring-white/10', className)}>
        <div className="text-sm text-slate-400">Aucune donnée de tendance disponible</div>
      </div>
    );
  }

  const chartData = {
    labels: tendances.map((t) => t.mois),
    datasets: [
      {
        label: 'Projets actifs',
        data: tendances.map((t) => t.projets_actifs),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Budget consommé (%)',
        data: tendances.map((t) => (t.budget_consomme / 1000000).toFixed(1)),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Jalons validés',
        data: tendances.map((t) => t.jalons_valides),
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Risques critiques',
        data: tendances.map((t) => t.risques_critiques),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(203, 213, 225)',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Tendances mensuelles',
        color: 'rgb(255, 255, 255)',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(203, 213, 225)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
      y: {
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  };

  const ChartComponent = type === 'line' ? Line : Bar;

  return (
    <div className={cn('rounded-2xl bg-white/5 p-4 ring-1 ring-white/10', className)}>
      <div className="h-64">
        <ChartComponent data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

