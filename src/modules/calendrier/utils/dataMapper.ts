/**
 * Utilitaires de mapping entre les données de la base (snake_case) et le format utilisé dans les composants
 * Permet de maintenir une compatibilité avec les composants existants
 */

import type {
  Jalon,
  EvenementCalendrier,
  Absence,
  Chantier,
} from '../types/calendrierTypes';

/**
 * Mapper un jalon de la DB vers le format utilisé dans les composants
 */
export function mapJalonForComponent(jalon: Jalon) {
  return {
    id: jalon.id.toString(),
    chantierId: jalon.chantier_id?.toString() || '',
    libelle: jalon.libelle,
    type: jalon.type || 'INTERNE',
    dateDebut: jalon.date_debut || '',
    dateFin: jalon.date_fin || '',
    estEnRetard: jalon.est_retard,
    estASLARisque: jalon.est_sla_risque,
    statut: jalon.statut || 'À venir',
  };
}

/**
 * Mapper un événement de la DB vers le format utilisé dans les composants
 */
export function mapEvenementForComponent(event: EvenementCalendrier) {
  return {
    id: event.id.toString(),
    type: event.type || 'EVENEMENT',
    titre: event.titre || '',
    description: event.description || undefined,
    dateDebut: event.date_debut || '',
    dateFin: event.date_fin || '',
    chantierId: event.chantier_id?.toString() || undefined,
  };
}

/**
 * Mapper une absence de la DB vers le format utilisé dans les composants
 */
export function mapAbsenceForComponent(absence: Absence) {
  return {
    id: absence.id.toString(),
    employeId: absence.user_id.toString(),
    employeNom: absence.employe_nom || `User ${absence.user_id}`,
    type: absence.type || 'ABSENCE',
    dateDebut: absence.date_debut || '',
    dateFin: absence.date_fin || '',
    statut: absence.statut || 'DEMANDE',
    chantierId: absence.chantier_id?.toString() || undefined,
    equipeId: absence.equipe_id?.toString() || undefined,
  };
}

/**
 * Mapper un chantier de la DB vers le format utilisé dans les composants
 */
export function mapChantierForComponent(chantier: Chantier) {
  return {
    id: chantier.id.toString(),
    code: chantier.code,
    nom: chantier.nom,
    dateDebut: chantier.date_debut || undefined,
    dateFin: chantier.date_fin || undefined,
    statut: undefined, // Non dans le schéma SQL
  };
}

