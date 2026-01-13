/**
 * Hook de toast spécialisé pour Validation Contrats
 * Inspiré de useAlertToast
 */

'use client';

import { useToast } from '@/components/ui/toast';

export function useContratToast() {
  const { showToast } = useToast();

  return {
    // Succès génériques
    success: (title: string, message?: string) =>
      showToast({ type: 'success', title, message }),

    // Erreurs génériques
    error: (title: string, message?: string) =>
      showToast({ type: 'error', title, message, duration: 7000 }),

    // Avertissements
    warning: (title: string, message?: string) =>
      showToast({ type: 'warning', title, message }),

    // Info
    info: (title: string, message?: string) =>
      showToast({ type: 'info', title, message }),

    // Actions de validation
    contratValidated: (reference: string) =>
      showToast({
        type: 'success',
        title: 'Contrat validé',
        message: `Le contrat ${reference} a été validé avec succès`,
      }),

    contratsValidated: (count: number) =>
      showToast({
        type: 'success',
        title: `${count} contrat${count > 1 ? 's' : ''} validé${count > 1 ? 's' : ''}`,
        message: 'Les contrats ont été validés avec succès',
      }),

    // Actions de rejet
    contratRejected: (reference: string) =>
      showToast({
        type: 'warning',
        title: 'Contrat rejeté',
        message: `Le contrat ${reference} a été rejeté`,
      }),

    contratsRejected: (count: number) =>
      showToast({
        type: 'warning',
        title: `${count} contrat${count > 1 ? 's' : ''} rejeté${count > 1 ? 's' : ''}`,
        message: 'Les contrats ont été rejetés',
      }),

    // Négociation
    contratNegotiation: (reference: string) =>
      showToast({
        type: 'info',
        title: 'Négociation initiée',
        message: `Une demande de négociation a été envoyée pour ${reference}`,
      }),

    // Escalade
    contratEscalated: (reference: string) =>
      showToast({
        type: 'warning',
        title: 'Contrat escaladé',
        message: `Le contrat ${reference} a été escaladé à la direction`,
      }),

    contratsEscalated: (count: number) =>
      showToast({
        type: 'warning',
        title: `${count} contrat${count > 1 ? 's' : ''} escaladé${count > 1 ? 's' : ''}`,
        message: 'Les contrats ont été transmis au niveau supérieur',
      }),

    // Export
    exportSuccess: (format: string) =>
      showToast({
        type: 'success',
        title: 'Export réussi',
        message: `Le fichier ${format.toUpperCase()} a été téléchargé`,
      }),

    exportError: () =>
      showToast({
        type: 'error',
        title: 'Erreur d\'export',
        message: 'Impossible d\'exporter les données actuellement',
        duration: 7000,
      }),

    // Filtres
    filtersApplied: (count: number) =>
      showToast({
        type: 'info',
        title: 'Filtres appliqués',
        message: `${count} filtre${count > 1 ? 's' : ''} actif${count > 1 ? 's' : ''}`,
      }),

    filtersCleared: () =>
      showToast({
        type: 'info',
        title: 'Filtres réinitialisés',
        message: 'Tous les filtres ont été supprimés',
      }),

    // Synchronisation
    syncSuccess: () =>
      showToast({
        type: 'success',
        title: 'Données synchronisées',
        message: 'Les contrats ont été mis à jour',
      }),

    syncError: () =>
      showToast({
        type: 'error',
        title: 'Erreur de synchronisation',
        message: 'Impossible de mettre à jour les données',
        duration: 7000,
      }),

    // Erreurs d'action
    actionError: (action: string) =>
      showToast({
        type: 'error',
        title: 'Erreur',
        message: `Impossible d'effectuer l'action: ${action}`,
        duration: 7000,
      }),

    // Données manquantes
    missingData: (field: string) =>
      showToast({
        type: 'warning',
        title: 'Données incomplètes',
        message: `Le champ "${field}" est requis`,
      }),

    // Sélection
    selectionRequired: () =>
      showToast({
        type: 'warning',
        title: 'Sélection requise',
        message: 'Veuillez sélectionner au moins un contrat',
      }),

    // Notification d'expiration
    expirationWarning: (reference: string, days: number) =>
      showToast({
        type: 'warning',
        title: 'Expiration imminente',
        message: `Le contrat ${reference} expire dans ${days} jour${days > 1 ? 's' : ''}`,
        duration: 8000,
      }),

    // Notification de nouveau contrat
    newContract: (reference: string) =>
      showToast({
        type: 'info',
        title: 'Nouveau contrat',
        message: `Le contrat ${reference} nécessite votre attention`,
        duration: 6000,
      }),
  };
}

