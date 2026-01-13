/**
 * ====================================================================
 * MOCK DATA: Commentaires
 * Données de démonstration pour les commentaires
 * ====================================================================
 */

import type { Comment } from '@/lib/types/substitution.types';
import { mockEmployees } from './employees-mock-data';

export const mockComments: Comment[] = [
  // Commentaires sur SUB-001
  {
    id: 'COM-001',
    entityType: 'substitution',
    entityId: 'SUB-001',
    userId: 'EMP-001',
    user: mockEmployees[0], // Jean Kouassi
    content: '@EMP-003 Peux-tu prendre en charge ce dossier urgent ? Le client attend une réponse aujourd\'hui pour le contrat de construction.',
    mentions: ['EMP-003'],
    createdAt: new Date('2026-01-10T09:30:00'),
    updatedAt: new Date('2026-01-10T09:30:00'),
  },
  {
    id: 'COM-002',
    entityType: 'substitution',
    entityId: 'SUB-001',
    userId: 'EMP-003',
    user: mockEmployees[2], // Yao N'Guessan
    content: 'OK @EMP-001, je m\'en occupe immédiatement. J\'aurai besoin du dossier complet avec les annexes techniques.',
    mentions: ['EMP-001'],
    parentId: 'COM-001',
    createdAt: new Date('2026-01-10T10:15:00'),
    updatedAt: new Date('2026-01-10T10:15:00'),
  },
  {
    id: 'COM-003',
    entityType: 'substitution',
    entityId: 'SUB-001',
    userId: 'EMP-001',
    user: mockEmployees[0],
    content: 'Parfait ! Je t\'envoie tous les documents par email. Le client est disponible cet après-midi pour un point.',
    mentions: [],
    parentId: 'COM-001',
    createdAt: new Date('2026-01-10T10:20:00'),
    updatedAt: new Date('2026-01-10T10:20:00'),
  },
  {
    id: 'COM-004',
    entityType: 'substitution',
    entityId: 'SUB-001',
    userId: 'EMP-003',
    user: mockEmployees[2],
    content: 'Dossier traité ✅ Le contrat a été validé et signé. Le client est satisfait.',
    mentions: [],
    parentId: 'COM-001',
    resolvedAt: new Date('2026-01-10T17:00:00'),
    createdAt: new Date('2026-01-10T17:00:00'),
    updatedAt: new Date('2026-01-10T17:00:00'),
  },

  // Commentaires sur SUB-002
  {
    id: 'COM-005',
    entityType: 'substitution',
    entityId: 'SUB-002',
    userId: 'EMP-007',
    user: mockEmployees[6], // Ibrahim Sanogo
    content: 'Urgent : Ce projet a 5 jours de retard. @EMP-005 peux-tu reprendre la coordination ?',
    mentions: ['EMP-005'],
    createdAt: new Date('2026-01-09T08:00:00'),
    updatedAt: new Date('2026-01-09T08:00:00'),
  },
  {
    id: 'COM-006',
    entityType: 'substitution',
    entityId: 'SUB-002',
    userId: 'EMP-005',
    user: mockEmployees[4], // Koffi Bamba
    content: '@EMP-007 Oui, je prends. J\'ai besoin du planning mis à jour et de la liste des tâches critiques.',
    mentions: ['EMP-007'],
    parentId: 'COM-005',
    createdAt: new Date('2026-01-09T08:30:00'),
    updatedAt: new Date('2026-01-09T08:30:00'),
  },
  {
    id: 'COM-007',
    entityType: 'substitution',
    entityId: 'SUB-002',
    userId: 'EMP-002',
    user: mockEmployees[1], // Marie Koné
    content: 'Les plans structurels sont prêts. Je les partage sur le drive commun.',
    mentions: [],
    createdAt: new Date('2026-01-09T11:00:00'),
    updatedAt: new Date('2026-01-09T11:00:00'),
  },

  // Commentaires sur ABS-001 (Absence)
  {
    id: 'COM-008',
    entityType: 'absence',
    entityId: 'ABS-001',
    userId: 'EMP-003',
    user: mockEmployees[2], // Yao N'Guessan
    content: 'Absence approuvée. @EMP-008 tu prends le relais sur les dossiers en cours d\'Aminata.',
    mentions: ['EMP-008'],
    createdAt: new Date('2026-01-07T14:35:00'),
    updatedAt: new Date('2026-01-07T14:35:00'),
  },
  {
    id: 'COM-009',
    entityType: 'absence',
    entityId: 'ABS-001',
    userId: 'EMP-008',
    user: mockEmployees[7], // Aya Diabaté
    content: 'OK @EMP-003, j\'ai récupéré les 3 dossiers prioritaires. Tout est sous contrôle.',
    mentions: ['EMP-003'],
    parentId: 'COM-008',
    createdAt: new Date('2026-01-07T15:00:00'),
    updatedAt: new Date('2026-01-07T15:00:00'),
  },

  // Commentaires sur DEL-001 (Délégation)
  {
    id: 'COM-010',
    entityType: 'delegation',
    entityId: 'DEL-001',
    userId: 'EMP-007',
    user: mockEmployees[6], // Ibrahim Sanogo
    content: '@EMP-001 Je te délègue la validation des documents et l\'approbation des dépenses pendant ma formation. Les limites budgétaires habituelles s\'appliquent.',
    mentions: ['EMP-001'],
    createdAt: new Date('2026-01-08T09:05:00'),
    updatedAt: new Date('2026-01-08T09:05:00'),
  },
  {
    id: 'COM-011',
    entityType: 'delegation',
    entityId: 'DEL-001',
    userId: 'EMP-001',
    user: mockEmployees[0],
    content: 'Compris @EMP-007. J\'assure la continuité. Bonne formation !',
    mentions: ['EMP-007'],
    parentId: 'COM-010',
    createdAt: new Date('2026-01-08T09:30:00'),
    updatedAt: new Date('2026-01-08T09:30:00'),
  },

  // Autres commentaires variés
  {
    id: 'COM-012',
    entityType: 'substitution',
    entityId: 'SUB-003',
    userId: 'EMP-002',
    user: mockEmployees[1],
    content: 'Les calculs de structure sont terminés. Validation requise avant envoi au client.',
    mentions: [],
    createdAt: new Date('2026-01-08T14:00:00'),
    updatedAt: new Date('2026-01-08T14:00:00'),
  },
  {
    id: 'COM-013',
    entityType: 'substitution',
    entityId: 'SUB-004',
    userId: 'EMP-006',
    user: mockEmployees[5],
    content: '⚠️ Attention : Le budget du projet dépasse de 15%. Révision nécessaire.',
    mentions: [],
    createdAt: new Date('2026-01-09T16:00:00'),
    updatedAt: new Date('2026-01-09T16:00:00'),
  },
  {
    id: 'COM-014',
    entityType: 'substitution',
    entityId: 'SUB-004',
    userId: 'EMP-007',
    user: mockEmployees[6],
    content: '@EMP-006 Merci pour l\'alerte. On organise une réunion demain matin pour ajuster.',
    mentions: ['EMP-006'],
    parentId: 'COM-013',
    createdAt: new Date('2026-01-09T16:30:00'),
    updatedAt: new Date('2026-01-09T16:30:00'),
  },
  {
    id: 'COM-015',
    entityType: 'absence',
    entityId: 'ABS-003',
    userId: 'EMP-002',
    user: mockEmployees[1],
    content: 'Demande de congés pour janvier. @EMP-007 besoin de ton approbation.',
    mentions: ['EMP-007'],
    createdAt: new Date('2026-01-05T11:05:00'),
    updatedAt: new Date('2026-01-05T11:05:00'),
  },
  {
    id: 'COM-016',
    entityType: 'substitution',
    entityId: 'SUB-005',
    userId: 'EMP-009',
    user: mockEmployees[8],
    content: 'Migration serveur terminée avec succès. Aucun incident à signaler.',
    mentions: [],
    createdAt: new Date('2026-01-07T18:00:00'),
    updatedAt: new Date('2026-01-07T18:00:00'),
  },
  {
    id: 'COM-017',
    entityType: 'delegation',
    entityId: 'DEL-002',
    userId: 'EMP-011',
    user: mockEmployees[10],
    content: 'Premier jour de délégation. J\'ai pris connaissance de tous les dossiers en cours.',
    mentions: [],
    createdAt: new Date('2026-01-15T09:00:00'),
    updatedAt: new Date('2026-01-15T09:00:00'),
  },
  {
    id: 'COM-018',
    entityType: 'substitution',
    entityId: 'SUB-006',
    userId: 'EMP-010',
    user: mockEmployees[9],
    content: 'Les plans AutoCAD sont prêts pour révision. @EMP-001 tu peux valider ?',
    mentions: ['EMP-001'],
    createdAt: new Date('2026-01-10T15:00:00'),
    updatedAt: new Date('2026-01-10T15:00:00'),
  },
  {
    id: 'COM-019',
    entityType: 'substitution',
    entityId: 'SUB-006',
    userId: 'EMP-001',
    user: mockEmployees[0],
    content: '@EMP-010 Plans validés ✅ Quelques ajustements mineurs sur la façade nord. Je t\'envoie mes annotations.',
    mentions: ['EMP-010'],
    parentId: 'COM-018',
    createdAt: new Date('2026-01-10T16:00:00'),
    updatedAt: new Date('2026-01-10T16:00:00'),
  },
  {
    id: 'COM-020',
    entityType: 'absence',
    entityId: 'ABS-006',
    userId: 'EMP-006',
    user: mockEmployees[5],
    content: 'Formation SYSCOHADA très enrichissante ! Beaucoup de nouveautés à partager avec l\'équipe.',
    mentions: [],
    createdAt: new Date('2026-01-19T17:00:00'),
    updatedAt: new Date('2026-01-19T17:00:00'),
  },
  {
    id: 'COM-021',
    entityType: 'substitution',
    entityId: 'SUB-007',
    userId: 'EMP-012',
    user: mockEmployees[11],
    content: 'Documents administratifs préparés pour la réunion de demain.',
    mentions: [],
    createdAt: new Date('2026-01-09T17:30:00'),
    updatedAt: new Date('2026-01-09T17:30:00'),
  },
  {
    id: 'COM-022',
    entityType: 'substitution',
    entityId: 'SUB-008',
    userId: 'EMP-005',
    user: mockEmployees[4],
    content: '🎨 Nouveaux designs architecturaux soumis au client. En attente de retour.',
    mentions: [],
    createdAt: new Date('2026-01-11T11:00:00'),
    updatedAt: new Date('2026-01-11T11:00:00'),
  },
  {
    id: 'COM-023',
    entityType: 'delegation',
    entityId: 'DEL-006',
    userId: 'EMP-004',
    user: mockEmployees[3],
    content: '@EMP-008 Je suis en arrêt maladie. Merci de traiter les recherches juridiques urgentes.',
    mentions: ['EMP-008'],
    createdAt: new Date('2026-01-08T08:00:00'),
    updatedAt: new Date('2026-01-08T08:00:00'),
  },
  {
    id: 'COM-024',
    entityType: 'substitution',
    entityId: 'SUB-009',
    userId: 'EMP-003',
    user: mockEmployees[2],
    content: 'Contrat de partenariat révisé. Tous les points juridiques sont conformes.',
    mentions: [],
    createdAt: new Date('2026-01-10T14:30:00'),
    updatedAt: new Date('2026-01-10T14:30:00'),
  },
  {
    id: 'COM-025',
    entityType: 'absence',
    entityId: 'ABS-010',
    userId: 'EMP-009',
    user: mockEmployees[8],
    content: 'De retour au bureau après 3 jours d\'arrêt. Merci pour le support pendant mon absence.',
    mentions: [],
    createdAt: new Date('2026-01-06T08:00:00'),
    updatedAt: new Date('2026-01-06T08:00:00'),
  },
  {
    id: 'COM-026',
    entityType: 'substitution',
    entityId: 'SUB-010',
    userId: 'EMP-007',
    user: mockEmployees[6],
    content: 'Point d\'avancement projet : 65% complété. Livraison prévue dans les délais.',
    mentions: [],
    createdAt: new Date('2026-01-11T16:00:00'),
    updatedAt: new Date('2026-01-11T16:00:00'),
  },
  {
    id: 'COM-027',
    entityType: 'delegation',
    entityId: 'DEL-010',
    userId: 'EMP-003',
    user: mockEmployees[2],
    content: 'Délégation permanente activée pour partage de charge. @EMP-004 on coordonne nos dossiers hebdomadairement.',
    mentions: ['EMP-004'],
    createdAt: new Date('2025-10-01T09:00:00'),
    updatedAt: new Date('2025-10-01T09:00:00'),
  },
  {
    id: 'COM-028',
    entityType: 'substitution',
    entityId: 'SUB-011',
    userId: 'EMP-002',
    user: mockEmployees[1],
    content: 'Étude de faisabilité terminée. Tous les critères techniques sont validés ✅',
    mentions: [],
    createdAt: new Date('2026-01-08T17:00:00'),
    updatedAt: new Date('2026-01-08T17:00:00'),
  },
  {
    id: 'COM-029',
    entityType: 'absence',
    entityId: 'ABS-016',
    userId: 'EMP-010',
    user: mockEmployees[9],
    content: 'Demande rejetée mais je comprends. Je reprogrammerai mes congés à une période plus calme.',
    mentions: [],
    createdAt: new Date('2026-01-22T15:00:00'),
    updatedAt: new Date('2026-01-22T15:00:00'),
  },
  {
    id: 'COM-030',
    entityType: 'substitution',
    entityId: 'SUB-012',
    userId: 'EMP-008',
    user: mockEmployees[7],
    content: 'Dossiers d\'Aminata gérés pendant son absence. Tout s\'est bien passé. Bon rétablissement !',
    mentions: [],
    createdAt: new Date('2026-01-15T17:00:00'),
    updatedAt: new Date('2026-01-15T17:00:00'),
  },
];

// Statistiques des commentaires
export const commentsStats = {
  total: mockComments.length,
  byEntityType: {
    substitution: mockComments.filter(c => c.entityType === 'substitution').length,
    absence: mockComments.filter(c => c.entityType === 'absence').length,
    delegation: mockComments.filter(c => c.entityType === 'delegation').length,
  },
  withMentions: mockComments.filter(c => c.mentions.length > 0).length,
  resolved: mockComments.filter(c => c.resolvedAt).length,
  threads: mockComments.filter(c => c.parentId).length,
};

// Obtenir les commentaires d'une entité
export function getCommentsByEntity(entityType: string, entityId: string) {
  return mockComments.filter(
    c => c.entityType === entityType && c.entityId === entityId
  ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

// Obtenir les commentaires racines (sans parent)
export function getRootComments(entityType: string, entityId: string) {
  return mockComments.filter(
    c => c.entityType === entityType && 
         c.entityId === entityId && 
         !c.parentId
  ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

// Obtenir les réponses d'un commentaire
export function getCommentReplies(commentId: string) {
  return mockComments.filter(
    c => c.parentId === commentId
  ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

// Obtenir les commentaires mentionnant un utilisateur
export function getCommentsMentioningUser(userId: string) {
  return mockComments.filter(
    c => c.mentions.includes(userId)
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Obtenir les commentaires non résolus avec mentions
export function getUnresolvedMentions(userId: string) {
  return mockComments.filter(
    c => c.mentions.includes(userId) && !c.resolvedAt
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

