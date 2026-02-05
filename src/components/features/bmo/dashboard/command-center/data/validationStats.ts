/**
 * Helpers pour calculer les statistiques des validations
 * Utilisé pour les badges de navigation dynamiques
 */

import { validationsMock } from './validationsMock';

export function getValidationStats() {
  return {
    enAttente: validationsMock.filter((v) => v.statut === 'en_attente').length,
    validees: validationsMock.filter((v) => v.statut === 'validee').length,
    rejetees: validationsMock.filter((v) => v.statut === 'rejetee').length,
    retards: validationsMock.filter((v) => v.delai < 0).length,
    total: validationsMock.length,
  };
}

