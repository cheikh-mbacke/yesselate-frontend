/**
 * Analytics Charts pour Projets en Cours
 * Graphiques interactifs avec Chart.js
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
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptionsBase = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'rgb(203, 213, 225)',
        font: { size: 12 },
      },
    },
    tooltip: {
      backgroundColor: 'rgb(15, 23, 42)',
      titleColor: 'rgb(226, 232, 240)',
      bodyColor: 'rgb(203, 213, 225)',
      borderColor: 'rgb(51, 65, 85)',
      borderWidth: 1,
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(51, 65, 85, 0.3)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgb(148, 163, 184)',
      },
    },
    y: {
      grid: {
        color: 'rgba(51, 65, 85, 0.3)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgb(148, 163, 184)',
      },
      beginAtZero: true,
    },
  },
};

export function ProjetsTrendChart() {
  const data = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Actifs',
        data: [45, 48, 52, 50, 55, 58],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Terminés',
        data: [12, 15, 18, 20, 22, 25],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'En retard',
        data: [5, 6, 5, 7, 6, 5],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 text-sm">Évolution des projets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={data} options={chartOptionsBase} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjetsTypesChart() {
  const data = {
    labels: ['Infrastructure', 'IT', 'Stratégique', 'Opérationnel', 'Autres'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(100, 116, 139, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(34, 197, 94)',
          'rgb(100, 116, 139)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    ...chartOptionsBase,
    plugins: {
      ...chartOptionsBase.plugins,
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgb(203, 213, 225)',
          font: { size: 12 },
          padding: 15,
        },
      },
    },
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 text-sm">Répartition par type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjetsStatusChart() {
  const data = {
    labels: ['Planifié', 'En cours', 'Terminé', 'En retard', 'Bloqué'],
    datasets: [
      {
        label: 'Nombre',
        data: [15, 28, 12, 5, 3],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(100, 116, 139, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(99, 102, 241)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(100, 116, 139)',
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    ...chartOptionsBase,
    plugins: {
      ...chartOptionsBase.plugins,
      legend: {
        display: false,
      },
    },
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 text-sm">Projets par statut</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjetsBudgetHealthChart() {
  const data = {
    labels: ['< 50%', '50-75%', '75-90%', '90-100%', '> 100%'],
    datasets: [
      {
        label: 'Nombre',
        data: [18, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    ...chartOptionsBase,
    plugins: {
      ...chartOptionsBase.plugins,
      legend: {
        display: false,
      },
    },
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 text-sm">Santé budgétaire</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjetsCompletionRateChart() {
  const data = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      {
        label: 'Taux de complétion (%)',
        data: [65, 68, 72, 75],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    ...chartOptionsBase,
    plugins: {
      ...chartOptionsBase.plugins,
      legend: {
        display: false,
      },
    },
    scales: {
      ...chartOptionsBase.scales,
      y: {
        ...chartOptionsBase.scales.y,
        max: 100,
      },
    },
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 text-sm">Taux de complétion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjetsTimelineChart() {
  const data = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Livraisons prévues',
        data: [12, 15, 18, 20],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Livraisons réelles',
        data: [11, 14, 16, 18],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 text-sm">Analyse temporelle</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={data} options={chartOptionsBase} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjetsResourceUtilizationChart() {
  const data = {
    labels: ['BF', 'BMCM', 'BFC', 'BAA', 'BCT'],
    datasets: [
      {
        label: 'Taux d\'utilisation (%)',
        data: [82, 78, 85, 80, 75],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    ...chartOptionsBase,
    plugins: {
      ...chartOptionsBase.plugins,
      legend: {
        display: false,
      },
    },
    scales: {
      ...chartOptionsBase.scales,
      y: {
        ...chartOptionsBase.scales.y,
        max: 100,
      },
    },
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 text-sm">Utilisation des ressources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjetsAnalyticsCharts() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjetsTrendChart />
        <ProjetsTypesChart />
        <ProjetsStatusChart />
        <ProjetsBudgetHealthChart />
        <ProjetsCompletionRateChart />
        <ProjetsTimelineChart />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjetsResourceUtilizationChart />
      </div>
    </div>
  );
}

