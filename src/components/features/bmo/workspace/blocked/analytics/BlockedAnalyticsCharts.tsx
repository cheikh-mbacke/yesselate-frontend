/**
 * Analytics Charts pour Dossiers Bloqués
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

// ================================
// Trend Chart - Evolution blocages
// ================================
export function BlockedTrendChart() {
  const data = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
    datasets: [
      {
        label: 'Critiques',
        data: [12, 15, 18, 14, 20, 16],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Haute priorité',
        data: [25, 28, 22, 30, 26, 24],
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Moyenne priorité',
        data: [18, 16, 20, 17, 15, 19],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
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

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
}

// ================================
// Impact Distribution - Doughnut
// ================================
export function BlockedImpactChart() {
  const data = {
    labels: ['Critique', 'Haute', 'Moyenne', 'Basse'],
    datasets: [
      {
        data: [16, 24, 19, 8],
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
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgb(203, 213, 225)',
          font: { size: 12 },
          padding: 15,
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
  };

  return (
    <div className="h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
}

// ================================
// Resolution Time - Bar Chart
// ================================
export function BlockedResolutionTimeChart() {
  const data = {
    labels: ['< 24h', '1-3j', '3-7j', '7-14j', '> 14j'],
    datasets: [
      {
        label: 'Nombre de dossiers',
        data: [8, 22, 18, 12, 7],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
          display: false,
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
          font: { size: 11 },
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

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
}

// ================================
// Bureau Performance - Horizontal Bar
// ================================
export function BlockedBureauPerformanceChart() {
  const data = {
    labels: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
    datasets: [
      {
        label: 'Taux de résolution (%)',
        data: [88, 92, 85, 90, 87],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgb(15, 23, 42)',
        titleColor: 'rgb(226, 232, 240)',
        bodyColor: 'rgb(203, 213, 225)',
        borderColor: 'rgb(51, 65, 85)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            return `Taux: ${context.parsed.x}%`;
          },
        },
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
          callback: function (value: any) {
            return value + '%';
          },
        },
        beginAtZero: true,
        max: 100,
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
}

// ================================
// Status Distribution - Doughnut
// ================================
export function BlockedStatusChart() {
  const data = {
    labels: ['En attente', 'Escaladé', 'Résolu', 'Substitué'],
    datasets: [
      {
        data: [38, 22, 32, 8],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgb(203, 213, 225)',
          font: { size: 12 },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgb(15, 23, 42)',
        titleColor: 'rgb(226, 232, 240)',
        bodyColor: 'rgb(203, 213, 225)',
        borderColor: 'rgb(51, 65, 85)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}%`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
}

// ================================
// Financial Impact - Line Chart
// ================================
export function BlockedFinancialImpactChart() {
  const data = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
    datasets: [
      {
        label: 'Impact financier (M FCFA)',
        data: [45, 52, 48, 56, 61, 54],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: 'rgb(239, 68, 68)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
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
        callbacks: {
          label: function (context: any) {
            return `Impact: ${context.parsed.y}M FCFA`;
          },
        },
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
          callback: function (value: any) {
            return value + 'M';
          },
        },
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
}

// ================================
// Type Distribution - Bar Chart
// ================================
export function BlockedTypeDistributionChart() {
  const data = {
    labels: ['Admin', 'Technique', 'Budget', 'Juridique', 'RH'],
    datasets: [
      {
        label: 'Nombre de blocages',
        data: [18, 25, 12, 9, 3],
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(100, 116, 139, 0.8)',
        ],
        borderColor: [
          'rgb(168, 85, 247)',
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
          'rgb(100, 116, 139)',
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
          display: false,
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

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
}

