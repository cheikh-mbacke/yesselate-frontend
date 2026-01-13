/**
 * Types pour le Centre de Commandement Gouvernance
 */

import type { LucideIcon } from 'lucide-react';

// Configuration des catégories principales
export interface MainCategoryConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  badge?: number;
  badgeType?: 'default' | 'warning' | 'critical';
}

// Configuration des sous-catégories
export interface SubCategoryConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number;
  badgeType?: 'default' | 'warning' | 'critical';
}

// Configuration des sous-sous-catégories
export interface SubSubCategoryConfig {
  id: string;
  label: string;
  count?: number;
}

// KPI Item
export interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'success' | 'warning' | 'critical' | 'neutral';
  sparkline?: number[];
}

// Surveillance item pour les tableaux
export interface SurveillanceItem {
  id: string;
  reference: string;
  designation: string;
  project?: string;
  responsable?: string;
  dateEcheance?: string;
  status: 'on-track' | 'at-risk' | 'late' | 'blocked' | 'completed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  progress?: number;
  alerts?: number;
  lastUpdate?: string;
  metadata?: Record<string, any>;
}

// Alert item
export interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  source: string;
  timestamp: string;
  project?: string;
  assignee?: string;
  isRead: boolean;
  actions?: { label: string; action: string }[];
}

// Decision item
export interface DecisionItem {
  id: string;
  reference: string;
  subject: string;
  requestedBy: string;
  deadline: string;
  impact: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
  type: 'budget' | 'scope' | 'planning' | 'contract' | 'hr';
}

// Escalation item
export interface EscalationItem {
  id: string;
  reference: string;
  subject: string;
  origin: string;
  escalatedTo: string;
  level: 1 | 2 | 3;
  deadline: string;
  daysOpen: number;
  status: 'new' | 'acknowledged' | 'in-progress' | 'resolved';
}

