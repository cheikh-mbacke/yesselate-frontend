/**
 * Analytics Charts pour Gestion Employés
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
// Effectifs Trend - Line Chart
// ================================
export function EmployeesHeadcountTrendChart() {
  const data = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Effectif total',
        data: [245, 248, 252, 255, 258, 262],
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'CDI',
        data: [210, 212, 215, 218, 220, 223],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'CDD/Stagiaires',
        data: [35, 36, 37, 37, 38, 39],
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
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
// Department Distribution - Doughnut
// ================================
export function EmployeesDepartmentChart() {
  const data = {
    labels: ['Technique', 'Commercial', 'Finance', 'RH', 'Support', 'Autre'],
    datasets: [
      {
        data: [35, 25, 15, 12, 8, 5],
        backgroundColor: [
          'rgba(20, 184, 166, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(100, 116, 139, 0.8)',
        ],
        borderColor: [
          'rgb(20, 184, 166)',
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(168, 85, 247)',
          'rgb(16, 185, 129)',
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
// Skills Matrix - Bar Horizontal
// ================================
export function EmployeesSkillsChart() {
  const data = {
    labels: ['Dev Backend', 'Dev Frontend', 'DevOps', 'Data Science', 'Design UX', 'Gestion Projet'],
    datasets: [
      {
        label: 'Nombre d\'employés',
        data: [42, 38, 25, 18, 15, 32],
        backgroundColor: 'rgba(20, 184, 166, 0.8)',
        borderColor: 'rgb(20, 184, 166)',
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
        beginAtZero: true,
      },
      y: {
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
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
}

// ================================
// Performance Distribution - Bar
// ================================
export function EmployeesPerformanceChart() {
  const data = {
    labels: ['Excellent', 'Bon', 'Satisfaisant', 'À améliorer', 'Insuffisant'],
    datasets: [
      {
        label: 'Nombre d\'employés',
        data: [45, 82, 68, 38, 12],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(251, 146, 60)',
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
// Retention Rate - Line
// ================================
export function EmployeesRetentionChart() {
  const data = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Taux de rétention (%)',
        data: [94, 95, 94, 96, 95, 97],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: 'rgb(16, 185, 129)',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Objectif (95%)',
        data: [95, 95, 95, 95, 95, 95],
        borderColor: 'rgb(251, 191, 36)',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
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
            return `${context.dataset.label}: ${context.parsed.y}%`;
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
            return value + '%';
          },
        },
        min: 90,
        max: 100,
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
// Contract Types - Doughnut
// ================================
export function EmployeesContractTypesChart() {
  const data = {
    labels: ['CDI', 'CDD', 'Stagiaire', 'Alternance', 'Freelance'],
    datasets: [
      {
        data: [75, 12, 8, 3, 2],
        backgroundColor: [
          'rgba(20, 184, 166, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(100, 116, 139, 0.8)',
        ],
        borderColor: [
          'rgb(20, 184, 166)',
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(168, 85, 247)',
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
// Seniority Distribution - Bar
// ================================
export function EmployeesSeniorityChart() {
  const data = {
    labels: ['< 1 an', '1-3 ans', '3-5 ans', '5-10 ans', '> 10 ans'],
    datasets: [
      {
        label: 'Nombre d\'employés',
        data: [42, 68, 55, 48, 32],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
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

