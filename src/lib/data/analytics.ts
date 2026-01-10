/**
 * analytics.ts
 * ============
 * 
 * Données et utilitaires pour le module Analytics
 * Contient des métriques réalistes et des fonctions de calcul
 */

import { demands, bureaux } from './index';
import type { Demand } from '@/lib/types/bmo.types';

// ============================================
// TYPES
// ============================================

export interface KPIMetric {
  id: string;
  name: string;
  category: 'performance' | 'financial' | 'operations' | 'quality';
  value: number;
  unit: string;
  target?: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number; // Pourcentage de changement
  status: 'good' | 'warning' | 'critical';
  description: string;
  lastUpdated: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface BureauPerformance {
  bureauCode: string;
  bureauName: string;
  totalDemands: number;
  validated: number;
  pending: number;
  rejected: number;
  overdue: number;
  avgDelay: number;
  validationRate: number;
  slaCompliance: number;
  score: number; // Score global sur 100
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: string;
  acknowledged: boolean;
}

// ============================================
// UTILITAIRES
// ============================================

const calcDelay = (dateStr: string) => {
  const [d, m, y] = (dateStr ?? '').split('/').map(Number);
  if (!d || !m || !y) return 0;
  const t = new Date(y, m - 1, d).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.ceil((Date.now() - t) / 86400000));
};

// ============================================
// CALCUL DES MÉTRIQUES
// ============================================

export function calculateKPIs(): KPIMetric[] {
  const allDemands = (demands as Demand[]).map((d) => ({
    ...d,
    delay: calcDelay(d.date),
    isOverdue: calcDelay(d.date) > 7 && d.status !== 'validated',
  }));

  const total = allDemands.length;
  const validated = allDemands.filter((d) => d.status === 'validated').length;
  const pending = allDemands.filter((d) => (d.status ?? 'pending') === 'pending').length;
  const overdue = allDemands.filter((d) => d.isOverdue).length;
  
  const validationRate = total > 0 ? (validated / total) * 100 : 0;
  const avgDelay = total > 0
    ? allDemands.reduce((sum, d) => sum + d.delay, 0) / total
    : 0;
  const slaCompliance = total > 0 ? ((total - overdue) / total) * 100 : 0;

  return [
    {
      id: 'kpi-validation-rate',
      name: 'Taux de validation',
      category: 'performance',
      value: Math.round(validationRate),
      unit: '%',
      target: 85,
      trend: validationRate >= 85 ? 'up' : validationRate < 70 ? 'down' : 'stable',
      trendValue: validationRate >= 85 ? 12 : -5,
      status: validationRate >= 85 ? 'good' : validationRate >= 70 ? 'warning' : 'critical',
      description: 'Pourcentage de demandes validées',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'kpi-avg-delay',
      name: 'Délai moyen',
      category: 'operations',
      value: Math.round(avgDelay * 10) / 10,
      unit: 'jours',
      target: 3,
      trend: avgDelay <= 3 ? 'up' : avgDelay > 5 ? 'down' : 'stable',
      trendValue: avgDelay <= 3 ? -15 : 8,
      status: avgDelay <= 3 ? 'good' : avgDelay <= 5 ? 'warning' : 'critical',
      description: 'Temps moyen de traitement',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'kpi-sla-compliance',
      name: 'Conformité SLA',
      category: 'quality',
      value: Math.round(slaCompliance),
      unit: '%',
      target: 90,
      trend: slaCompliance >= 90 ? 'up' : slaCompliance < 75 ? 'down' : 'stable',
      trendValue: slaCompliance >= 90 ? 8 : -12,
      status: slaCompliance >= 90 ? 'good' : slaCompliance >= 75 ? 'warning' : 'critical',
      description: 'Respect des délais SLA',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'kpi-pending',
      name: 'En attente',
      category: 'operations',
      value: pending,
      unit: 'demandes',
      target: 10,
      trend: pending <= 10 ? 'up' : pending > 20 ? 'down' : 'stable',
      trendValue: pending <= 10 ? -20 : 15,
      status: pending <= 10 ? 'good' : pending <= 20 ? 'warning' : 'critical',
      description: 'Demandes en attente de traitement',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'kpi-productivity',
      name: 'Productivité',
      category: 'performance',
      value: Math.round((validated / Math.max(1, validated + pending)) * 100),
      unit: '%',
      target: 80,
      trend: 'stable',
      trendValue: 3,
      status: 'good',
      description: 'Ratio validation vs total',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'kpi-quality-score',
      name: 'Score qualité',
      category: 'quality',
      value: Math.round((validationRate * 0.4 + slaCompliance * 0.4 + (100 - avgDelay * 10) * 0.2)),
      unit: '/100',
      target: 85,
      trend: 'up',
      trendValue: 5,
      status: 'good',
      description: 'Score global de qualité',
      lastUpdated: new Date().toISOString(),
    },
  ];
}

export function calculateBureauPerformance(): BureauPerformance[] {
  const allDemands = (demands as Demand[]).map((d) => ({
    ...d,
    delay: calcDelay(d.date),
    isOverdue: calcDelay(d.date) > 7 && d.status !== 'validated',
  }));

  return bureaux.map((bureau) => {
    const bureauDemands = allDemands.filter((d) => d.bureau === bureau.code);
    const total = bureauDemands.length;
    const validated = bureauDemands.filter((d) => d.status === 'validated').length;
    const pending = bureauDemands.filter((d) => (d.status ?? 'pending') === 'pending').length;
    const rejected = bureauDemands.filter((d) => d.status === 'rejected').length;
    const overdue = bureauDemands.filter((d) => d.isOverdue).length;
    
    const avgDelay = total > 0
      ? bureauDemands.reduce((sum, d) => sum + d.delay, 0) / total
      : 0;
    const validationRate = total > 0 ? (validated / total) * 100 : 0;
    const slaCompliance = total > 0 ? ((total - overdue) / total) * 100 : 0;
    
    // Score global (pondéré)
    const score = Math.round(
      validationRate * 0.4 +
      slaCompliance * 0.3 +
      (100 - Math.min(avgDelay * 10, 100)) * 0.3
    );

    return {
      bureauCode: bureau.code,
      bureauName: bureau.name,
      totalDemands: total,
      validated,
      pending,
      rejected,
      overdue,
      avgDelay: Math.round(avgDelay * 10) / 10,
      validationRate: Math.round(validationRate),
      slaCompliance: Math.round(slaCompliance),
      score,
    };
  }).sort((a, b) => b.score - a.score);
}

export function generateTrendData(period: 'week' | 'month' | 'quarter' = 'month'): TrendDataPoint[] {
  const points = period === 'week' ? 7 : period === 'month' ? 30 : 90;
  const data: TrendDataPoint[] = [];
  
  const now = new Date();
  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simulation de données avec une tendance croissante et un peu de variation
    const baseValue = 50 + (points - i) * 0.5;
    const variation = Math.random() * 10 - 5;
    const value = Math.round(baseValue + variation);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value,
      label: period === 'week' ? date.toLocaleDateString('fr-FR', { weekday: 'short' }) : undefined,
    });
  }
  
  return data;
}

export function detectAlerts(): Alert[] {
  const kpis = calculateKPIs();
  const alerts: Alert[] = [];

  kpis.forEach((kpi) => {
    if (kpi.status === 'critical') {
      alerts.push({
        id: `alert-${kpi.id}`,
        type: 'critical',
        category: kpi.category,
        title: `${kpi.name} critique`,
        description: `${kpi.name} est à ${kpi.value}${kpi.unit}, en dessous de l'objectif de ${kpi.target}${kpi.unit}`,
        metric: kpi.name,
        value: kpi.value,
        threshold: kpi.target || 0,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    } else if (kpi.status === 'warning' && kpi.target) {
      alerts.push({
        id: `alert-${kpi.id}`,
        type: 'warning',
        category: kpi.category,
        title: `${kpi.name} à surveiller`,
        description: `${kpi.name} est à ${kpi.value}${kpi.unit}, proche de la limite`,
        metric: kpi.name,
        value: kpi.value,
        threshold: kpi.target,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
  });

  // Alertes spécifiques
  const bureauPerf = calculateBureauPerformance();
  bureauPerf.forEach((perf) => {
    if (perf.score < 60) {
      alerts.push({
        id: `alert-bureau-${perf.bureauCode}`,
        type: 'warning',
        category: 'performance',
        title: `Performance bureau ${perf.bureauCode}`,
        description: `Le bureau ${perf.bureauName} a un score de ${perf.score}/100`,
        metric: 'Score bureau',
        value: perf.score,
        threshold: 70,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
  });

  return alerts.sort((a, b) => {
    const priority = { critical: 0, warning: 1, info: 2 };
    return priority[a.type] - priority[b.type];
  });
}

// ============================================
// DONNÉES MOCK SUPPLÉMENTAIRES
// ============================================

export const mockComparisons = {
  lastMonth: {
    total: 38,
    validated: 30,
    pending: 5,
    rejected: 3,
    avgDelay: 3.2,
    slaCompliance: 87,
  },
  thisMonth: {
    total: 42,
    validated: 33,
    pending: 8,
    rejected: 1,
    avgDelay: 2.8,
    slaCompliance: 92,
  },
};

export const mockFinancialData = {
  budgetTotal: 2500000000, // 2.5 Mds FCFA
  budgetConsumed: 1875000000, // 1.875 Mds
  budgetRemaining: 625000000, // 625M
  avgCostPerDemand: 45000000, // 45M
  byCategory: [
    { category: 'Infrastructure', amount: 950000000, percentage: 38 },
    { category: 'Services', amount: 525000000, percentage: 21 },
    { category: 'Équipement', amount: 300000000, percentage: 12 },
    { category: 'Formation', amount: 100000000, percentage: 4 },
  ],
};

export const mockOperationalData = {
  activeProjects: 18,
  completedProjects: 12,
  delayedProjects: 3,
  onTrackProjects: 15,
  avgProjectDuration: 45, // jours
  resourceUtilization: 78, // %
};

