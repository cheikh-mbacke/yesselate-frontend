/**
 * Types pour les modales et panels du module Calendrier
 */

// ================================
// Types de modales
// ================================

export type CalendrierModalType =
  | 'sla-detail'
  | 'conflit-detail'
  | 'jalon-detail'
  | 'absence-detail'
  | 'simulation-ia'
  | 'timeline-globale'
  | 'heatmap-charges'
  | 'multi-ressources'
  | 'vue-croisee'
  | 'planning-projet'
  | 'creer-evenement'
  | 'traiter-sla'
  | 'resoudre-conflit'
  | 'replanifier'
  | 'export'
  | 'alert-config';

export interface CalendrierModalState {
  type: CalendrierModalType | null;
  isOpen: boolean;
  data: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// ================================
// Types de detail panel
// ================================

export type CalendrierDetailPanelType = 'sla' | 'conflit' | 'jalon' | 'absence' | 'instance' | null;

export interface CalendrierDetailPanelState {
  isOpen: boolean;
  type: CalendrierDetailPanelType;
  entityId: string | null;
  data: Record<string, any>;
}

// ================================
// Types de pop-ups contextuels
// ================================

export type CalendrierContextualPopupType =
  | 'sla-depasse'
  | 'conflit-detecte'
  | 'retard-critique'
  | 'absence-non-couverte'
  | 'instance-urgente';

export interface CalendrierContextualPopup {
  id: string;
  type: CalendrierContextualPopupType;
  title: string;
  message: string;
  data: Record<string, any>;
  timestamp: string;
  dismissed?: boolean;
}

