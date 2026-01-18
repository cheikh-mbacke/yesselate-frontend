/**
 * Hook de toast spécialisé pour Validation Contrats
 * Inspiré de useAlertToast
 */

'use client';

import { useToast } from '@/components/features/bmo/ToastProvider';

export function useContratToast() {
  const { success, error, warning, info } = useToast();

  return {
    // Succès génériques
    success: (title: string, message?: string) =>
      success(message || title, message ? { title } : undefined),

    // Erreurs génériques
    error: (title: string, message?: string) =>
      error(message || title, message ? { title, duration: 7000 } : { duration: 7000 }),

    // Avertissements
    warning: (title: string, message?: string) =>
      warning(message || title, message ? { title } : undefined),

    // Info
    info: (title: string, message?: string) =>
      info(message || title, message ? { title } : undefined),

    // Actions de validation
    contratValidated: (reference: string) =>
      success(`Le contrat ${reference} a été validé avec succès`, { title: 'Contrat validé' }),

    contratsValidated: (count: number) =>
      success('Les contrats ont été validés avec succès', {
        title: `${count} contrat${count > 1 ? 's' : ''} validé${count > 1 ? 's' : ''}`,
      }),

    // Actions de rejet
    contratRejected: (reference: string) =>
      warning(`Le contrat ${reference} a été rejeté`, { title: 'Contrat rejeté' }),

    contratsRejected: (count: number) =>
      warning('Les contrats ont été rejetés', {
        title: `${count} contrat${count > 1 ? 's' : ''} rejeté${count > 1 ? 's' : ''}`,
      }),

    // Négociation
    contratNegotiation: (reference: string) =>
      info(`Une demande de négociation a été envoyée pour ${reference}`, { title: 'Négociation initiée' }),

    // Escalade
    contratEscalated: (reference: string) =>
      warning(`Le contrat ${reference} a été escaladé à la direction`, { title: 'Contrat escaladé' }),

    contratsEscalated: (count: number) =>
      warning('Les contrats ont été transmis au niveau supérieur', {
        title: `${count} contrat${count > 1 ? 's' : ''} escaladé${count > 1 ? 's' : ''}`,
      }),

    // Export
    exportSuccess: (format: string) =>
      success(`Le fichier ${format.toUpperCase()} a été téléchargé`, { title: 'Export réussi' }),

    exportError: () =>
      error('Impossible d\'exporter les données actuellement', { title: 'Erreur d\'export', duration: 7000 }),

    // Filtres
    filtersApplied: (count: number) =>
      info(`${count} filtre${count > 1 ? 's' : ''} actif${count > 1 ? 's' : ''}`, { title: 'Filtres appliqués' }),

    filtersCleared: () =>
      info('Tous les filtres ont été supprimés', { title: 'Filtres réinitialisés' }),

    // Synchronisation
    syncSuccess: () =>
      success('Les contrats ont été mis à jour', { title: 'Données synchronisées' }),

    syncError: () =>
      error('Impossible de mettre à jour les données', { title: 'Erreur de synchronisation', duration: 7000 }),

    // Erreurs d'action
    actionError: (action: string) =>
      error(`Impossible d'effectuer l'action: ${action}`, { title: 'Erreur', duration: 7000 }),

    // Données manquantes
    missingData: (field: string) =>
      warning(`Le champ "${field}" est requis`, { title: 'Données incomplètes' }),

    // Sélection
    selectionRequired: () =>
      warning('Veuillez sélectionner au moins un contrat', { title: 'Sélection requise' }),

    // Notification d'expiration
    expirationWarning: (reference: string, days: number) =>
      warning(`Le contrat ${reference} expire dans ${days} jour${days > 1 ? 's' : ''}`, {
        title: 'Expiration imminente',
        duration: 8000,
      }),

    // Notification de nouveau contrat
    newContract: (reference: string) =>
      info(`Le contrat ${reference} nécessite votre attention`, { title: 'Nouveau contrat', duration: 6000 }),
  };
}

