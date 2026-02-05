/**
 * Analytics Charts pour Validation Contrats
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
// Trend Chart - Line Chart
// ================================
export function ContratsTrendChart() {
  const data = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Validés',
        data: [45, 52, 48, 61, 65, 58, 72],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Rejetés',
        data: [8, 12, 7, 9, 11, 8, 6],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'En négociation',
        data: [5, 7, 6, 8, 7, 9, 5],
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
        displayColors: true,
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
// Status Distribution - Doughnut Chart
// ================================
export function ContratsStatusChart() {
  const data = {
    labels: ['Validés', 'En attente', 'Rejetés', 'Négociation', 'Urgents'],
    datasets: [
      {
        data: [62, 16, 11, 7, 4],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.9)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)',
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
// Validation Time - Bar Chart
// ================================
export function ContratsValidationTimeChart() {
  const data = {
    labels: ['< 1 jour', '1-3 jours', '3-7 jours', '7-14 jours', '> 14 jours'],
    datasets: [
      {
        label: 'Nombre de contrats',
        data: [12, 28, 35, 18, 7],
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
// Performance by Bureau - Bar Chart
// ================================
export function ContratsPerformanceByBureauChart() {
  const data = {
    labels: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
    datasets: [
      {
        label: 'Taux de validation (%)',
        data: [92, 88, 85, 90, 87],
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
// Monthly Comparison - Bar Chart
// ================================
export function ContratsMonthlyComparisonChart() {
  const data = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Mois actuel',
        data: [52, 48, 61, 65, 58, 72],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Mois précédent',
        data: [45, 42, 55, 59, 52, 67],
        backgroundColor: 'rgba(100, 116, 139, 0.5)',
        borderColor: 'rgb(100, 116, 139)',
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

// ================================
// Financial by Type - Doughnut Chart
// ================================
export function ContratsFinancialByTypeChart() {
  const data = {
    labels: ['Fournitures', 'Services', 'Travaux', 'Prestations', 'Autres'],
    datasets: [
      {
        data: [35, 28, 20, 12, 5],
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(100, 116, 139, 0.8)',
        ],
        borderColor: [
          'rgb(168, 85, 247)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(251, 191, 36)',
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
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}M FCFA`;
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
// Financial Evolution - Line Chart
// ================================
export function ContratsFinancialEvolutionChart() {
  const data = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Montant total (M FCFA)',
        data: [180, 195, 205, 220, 235, 240, 245],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: 'rgb(168, 85, 247)',
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
            return `Montant: ${context.parsed.y}M FCFA`;
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

