/**
 * Analytics Charts pour Validation Paiements
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

// Register Chart.js components
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

// ================================
// Paiements Trend - Line Chart
// ================================
export function PaiementsTrendChart() {
  const data = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Validés',
        data: [45, 52, 48, 61, 55, 67],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'En attente',
        data: [28, 32, 35, 29, 31, 27],
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Rejetés',
        data: [5, 8, 6, 4, 7, 5],
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
        <CardTitle className="text-slate-200 text-sm">Évolution des paiements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={data} options={chartOptionsBase} />
        </div>
      </CardContent>
    </Card>
  );
}

// ================================
// Distribution par Type - Doughnut
// ================================
export function PaiementsTypesChart() {
  const data = {
    labels: ['Fournisseurs', 'Salaires', 'Services', 'Frais', 'Autres'],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(100, 116, 139, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(251, 191, 36)',
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

// ================================
// Statut - Bar Chart
// ================================
export function PaiementsStatusChart() {
  const data = {
    labels: ['En attente', 'Validés', 'Rejetés', 'Planifiés'],
    datasets: [
      {
        label: 'Nombre de paiements',
        data: [45, 120, 15, 28],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
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
        <CardTitle className="text-slate-200 text-sm">Paiements par statut</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

// ================================
// Urgence - Line Chart
// ================================
export function PaiementsUrgencyChart() {
  const data = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Critiques',
        data: [3, 5, 4, 7, 6, 2, 1],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Haute priorité',
        data: [8, 12, 10, 15, 11, 5, 3],
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Normale',
        data: [25, 28, 30, 32, 29, 15, 10],
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
        <CardTitle className="text-slate-200 text-sm">Paiements par urgence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={data} options={chartOptionsBase} />
        </div>
      </CardContent>
    </Card>
  );
}

// ================================
// Performance Bureau - Bar Chart
// ================================
export function PaiementsBureauChart() {
  const data = {
    labels: ['BF', 'DG', 'BMCM', 'BFC', 'BAA'],
    datasets: [
      {
        label: 'Taux de validation',
        data: [92, 88, 85, 90, 87],
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

// ================================
// Distribution Montants - Doughnut
// ================================
export function PaiementsAmountChart() {
  const data = {
    labels: ['< 10K', '10K-50K', '50K-100K', '100K-500K', '> 500K'],
    datasets: [
      {
        data: [45, 35, 12, 6, 2],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
          'rgb(168, 85, 247)',
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
        <CardTitle className="text-slate-200 text-sm">Distribution des montants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

// ================================
// Temps de Validation - Bar Chart
// ================================
export function PaiementsValidationTimeChart() {
  const data = {
    labels: ['< 1j', '1-2j', '2-3j', '3-5j', '> 5j'],
    datasets: [
      {
        label: 'Nombre de paiements',
        data: [65, 45, 25, 15, 10],
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
        <CardTitle className="text-slate-200 text-sm">Temps de validation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

// ================================
// Composant Principal
// ================================
export function PaiementsAnalyticsCharts() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PaiementsTrendChart />
        <PaiementsTypesChart />
        <PaiementsStatusChart />
        <PaiementsUrgencyChart />
        <PaiementsBureauChart />
        <PaiementsAmountChart />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PaiementsValidationTimeChart />
      </div>
    </div>
  );
}

