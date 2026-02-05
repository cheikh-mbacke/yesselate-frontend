/**
 * Types pour le module Demandes
 */

export type DemandeStatus = 'pending' | 'urgent' | 'validated' | 'rejected' | 'overdue';

export type DemandeService = 'achats' | 'finance' | 'juridique' | 'rh' | 'autre';

export type DemandePriority = 'low' | 'normal' | 'high' | 'critical';

export type DemandeMainCategory = 'overview' | 'statut' | 'actions' | 'services';

export interface Demande {
  id: string;
  reference: string;
  title: string;
  description?: string;
  status: DemandeStatus;
  priority: DemandePriority;
  service: DemandeService;
  montant?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  assignedTo?: string;
  metadata?: Record<string, any>;
}

export interface DemandeStats {
  total: number;
  newToday: number;
  pending: number;
  urgent: number;
  validated: number;
  rejected: number;
  overdue: number;
  avgResponseTime: number; // heures
  approvalRate: number; // pourcentage
  completionRate: number; // pourcentage
  satisfactionScore: number; // 1-5
}

export interface DemandeFilters {
  status?: DemandeStatus[];
  priority?: DemandePriority[];
  service?: DemandeService[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  search?: string;
}

export interface DemandeTrend {
  date: string;
  count: number;
  status: DemandeStatus;
}

export interface ServiceStats {
  service: DemandeService;
  total: number;
  pending: number;
  urgent: number;
  validated: number;
  rejected: number;
}

