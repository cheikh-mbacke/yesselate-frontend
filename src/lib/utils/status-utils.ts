// ============================================
// Utilitaires de mapping des statuts
// Unifie l'affichage des statuts dans toute l'application
// WHY: Centralisation du mapping pour cohérence UI
// ============================================

import type { DocumentStatus } from '@/lib/types/document-validation.types';

export interface StatusBadgeConfig {
  variant: 'default' | 'info' | 'success' | 'warning' | 'urgent' | 'gold' | 'gray';
  label: string;
}

/**
 * Mappe un statut de document vers sa configuration de badge UI
 * WHY: Centralisation du mapping pour cohérence UI
 * NOTE: Les composants doivent créer leur propre <Badge> en utilisant cette config
 */
export function getStatusBadgeConfig(status: DocumentStatus | string): StatusBadgeConfig {
  const variants: Record<string, StatusBadgeConfig> = {
    // Statuts classiques
    pending: { variant: 'info', label: 'En attente' },
    anomaly_detected: { variant: 'warning', label: 'Anomalie' },
    correction_requested: { variant: 'warning', label: 'Correction demandée' },
    correction_in_progress: { variant: 'warning', label: 'Correction en cours' },
    corrected: { variant: 'info', label: 'Corrigé' },
    validated: { variant: 'success', label: 'Validé' },
    rejected: { variant: 'urgent', label: 'Refusé' }, // WHY: 'destructive' n'existe pas, utiliser 'urgent'
    // Workflow CIRIL
    draft_ba: { variant: 'default', label: 'Brouillon BA' },
    pending_bmo: { variant: 'info', label: 'En attente BMO' },
    audit_required: { variant: 'warning', label: 'Audit requis' },
    in_audit: { variant: 'warning', label: 'Audit en cours' },
    approved_bmo: { variant: 'success', label: 'Approuvé BMO' },
    rejected_bmo: { variant: 'urgent', label: 'Refusé BMO' }, // WHY: 'destructive' n'existe pas, utiliser 'urgent'
    sent_supplier: { variant: 'success', label: 'Envoyé fournisseur' },
    needs_complement: { variant: 'warning', label: 'Complément requis' },
    // Statuts additionnels
    in_review: { variant: 'info', label: 'En révision' },
    approved: { variant: 'success', label: 'Approuvé' },
    escalated: { variant: 'warning', label: 'Escaladé' },
    archived: { variant: 'default', label: 'Archivé' },
    // Statuts arbitrages
    decision_requise: { variant: 'urgent', label: 'Décision requise' },
    tranche: { variant: 'success', label: 'Tranché' },
    // Statuts clients
    active: { variant: 'success', label: 'Actif' },
    litige: { variant: 'urgent', label: 'Litige' },
    termine: { variant: 'default', label: 'Terminé' },
    prospect: { variant: 'info', label: 'Prospect' },
  };
  
  // Toujours mapper vers un label UI, ne jamais afficher le statut brut
  return variants[status] || { variant: 'default', label: 'Inconnu' };
}

/**
 * Helper pour obtenir uniquement le label d'un statut (sans variant)
 * WHY: Utile pour afficher du texte simple sans badge
 */
export function getStatusLabel(status: DocumentStatus | string): string {
  return getStatusBadgeConfig(status).label;
}

