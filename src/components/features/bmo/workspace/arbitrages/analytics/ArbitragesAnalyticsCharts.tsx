/**
 * Analytics Charts pour Arbitrages Vivants
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

export function ArbitragesTrendChart() {
  const data = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Détectés',
        data: [12, 15, 18, 14, 16, 20],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Résolus',
        data: [10, 13, 15, 12, 14, 18],
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
        <CardTitle className="text-slate-200 text-sm">Évolution des arbitrages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={data} options={chartOptionsBase} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ArbitragesTypesChart() {
  const data = {
    labels: ['Ressources', 'Budget', 'Goulot', 'Conflit', 'Autres'],
    datasets: [
      {
        data: [35, 28, 20, 12, 5],
        backgroundColor: [
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(100, 116, 139, 0.8)',
        ],
        borderColor: [
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
          'rgb(251, 191, 36)',
          'rgb(168, 85, 247)',
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

export function ArbitragesStatusChart() {
  const data = {
    labels: ['Ouvert', 'En cours', 'Résolu', 'Escaladé'],
    datasets: [
      {
        label: 'Nombre',
        data: [25, 18, 45, 8],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
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
        <CardTitle className="text-slate-200 text-sm">Arbitrages par statut</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ArbitragesResolutionTimeChart() {
  const data = {
    labels: ['< 1j', '1-2j', '2-5j', '5-7j', '> 7j'],
    datasets: [
      {
        label: 'Nombre',
        data: [35, 28, 20, 12, 8],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
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
    indexAxis: 'y' as const,
    scales: {
      ...chartOptionsBase.scales,
      x: {
        ...chartOptionsBase.scales.x,
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        beginAtZero: true,
      },
      y: {
        ...chartOptionsBase.scales.y,
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 text-sm">Temps de résolution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ArbitragesPriorityChart() {
  const data = {
    labels: ['Critique', 'Élevée', 'Normale', 'Basse'],
    datasets: [
      {
        label: 'Nombre',
        data: [15, 25, 35, 10],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(100, 116, 139, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(251, 191, 36)',
          'rgb(59, 130, 246)',
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
        <CardTitle className="text-slate-200 text-sm">Par priorité</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ArbitragesImpactChart() {
  const data = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
    datasets: [
      {
        label: 'Impact élevé',
        data: [5, 7, 6, 9, 8],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Impact moyen',
        data: [12, 15, 14, 16, 13],
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Impact faible',
        data: [20, 22, 21, 24, 23],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 text-sm">Analyse d'impact</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={data} options={chartOptionsBase} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ArbitragesBureauChart() {
  const data = {
    labels: ['BF', 'DG', 'BMCM', 'BFC', 'BAA'],
    datasets: [
      {
        label: 'Taux de résolution',
        data: [85, 82, 78, 80, 75],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgb(249, 115, 22)',
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
        <CardTitle className="text-slate-200 text-sm">Performance par bureau</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ArbitragesAnalyticsCharts() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ArbitragesTrendChart />
        <ArbitragesTypesChart />
        <ArbitragesStatusChart />
        <ArbitragesResolutionTimeChart />
        <ArbitragesPriorityChart />
        <ArbitragesImpactChart />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ArbitragesBureauChart />
      </div>
    </div>
  );
}

