/**
 * ====================================================================
 * MOCK DATA: Timeline & Documents
 * Données de démonstration pour la timeline et les documents
 * ====================================================================
 */

import type { TimelineEvent, Document } from '@/lib/types/substitution.types';
import { mockEmployees } from './employees-mock-data';

// ================================
// Timeline Events
// ================================

export const mockTimelineEvents: TimelineEvent[] = [
  // SUB-001 Timeline
  {
    id: 'TL-001',
    entityType: 'substitution',
    entityId: 'SUB-001',
    type: 'created',
    userId: 'EMP-001',
    user: mockEmployees[0],
    description: 'Substitution créée pour absence maladie',
    metadata: { reason: 'absence', urgency: 'critical' },
    icon: '➕',
    color: 'blue',
    createdAt: new Date('2026-01-10T08:00:00'),
  },
  {
    id: 'TL-002',
    entityType: 'substitution',
    entityId: 'SUB-001',
    type: 'assigned',
    userId: 'EMP-001',
    user: mockEmployees[0],
    description: 'Assigné à Yao N\'Guessan',
    metadata: { substitutId: 'EMP-003', autoAssigned: false },
    icon: '👤',
    color: 'green',
    createdAt: new Date('2026-01-10T08:30:00'),
  },
  {
    id: 'TL-003',
    entityType: 'substitution',
    entityId: 'SUB-001',
    type: 'commented',
    userId: 'EMP-001',
    user: mockEmployees[0],
    description: 'Commentaire ajouté',
    metadata: { commentId: 'COM-001' },
    icon: '💬',
    color: 'gray',
    createdAt: new Date('2026-01-10T09:30:00'),
  },
  {
    id: 'TL-004',
    entityType: 'substitution',
    entityId: 'SUB-001',
    type: 'completed',
    userId: 'EMP-003',
    user: mockEmployees[2],
    description: 'Substitution terminée avec succès',
    metadata: { duration: '9 heures', satisfaction: 5 },
    icon: '✅',
    color: 'emerald',
    createdAt: new Date('2026-01-10T17:00:00'),
  },

  // SUB-002 Timeline
  {
    id: 'TL-005',
    entityType: 'substitution',
    entityId: 'SUB-002',
    type: 'created',
    userId: 'EMP-007',
    user: mockEmployees[6],
    description: 'Substitution créée - Projet en retard',
    metadata: { reason: 'blocage', urgency: 'high', delay: 5 },
    icon: '➕',
    color: 'blue',
    createdAt: new Date('2026-01-09T07:30:00'),
  },
  {
    id: 'TL-006',
    entityType: 'substitution',
    entityId: 'SUB-002',
    type: 'escalated',
    userId: 'EMP-007',
    user: mockEmployees[6],
    description: 'Escaladé à la direction',
    metadata: { level: 'Direction', reason: 'Retard important' },
    icon: '⚠️',
    color: 'amber',
    createdAt: new Date('2026-01-09T08:00:00'),
  },
  {
    id: 'TL-007',
    entityType: 'substitution',
    entityId: 'SUB-002',
    type: 'assigned',
    userId: 'EMP-007',
    user: mockEmployees[6],
    description: 'Assigné à Koffi Bamba',
    metadata: { substitutId: 'EMP-005' },
    icon: '👤',
    color: 'green',
    createdAt: new Date('2026-01-09T08:30:00'),
  },

  // ABS-001 Timeline (Absence)
  {
    id: 'TL-008',
    entityType: 'absence',
    entityId: 'ABS-001',
    type: 'created',
    userId: 'EMP-004',
    user: mockEmployees[3],
    description: 'Demande d\'absence pour maladie',
    metadata: { type: 'maladie', duration: 7 },
    icon: '📅',
    color: 'blue',
    createdAt: new Date('2026-01-07T09:00:00'),
  },
  {
    id: 'TL-009',
    entityType: 'absence',
    entityId: 'ABS-001',
    type: 'approved',
    userId: 'EMP-003',
    user: mockEmployees[2],
    description: 'Absence approuvée',
    metadata: { approvedBy: 'Yao N\'Guessan' },
    icon: '✅',
    color: 'green',
    createdAt: new Date('2026-01-07T14:30:00'),
  },
  {
    id: 'TL-010',
    entityType: 'absence',
    entityId: 'ABS-001',
    type: 'commented',
    userId: 'EMP-003',
    user: mockEmployees[2],
    description: 'Commentaire ajouté',
    metadata: { commentId: 'COM-008' },
    icon: '💬',
    color: 'gray',
    createdAt: new Date('2026-01-07T14:35:00'),
  },

  // DEL-001 Timeline (Délégation)
  {
    id: 'TL-011',
    entityType: 'delegation',
    entityId: 'DEL-001',
    type: 'created',
    userId: 'EMP-007',
    user: mockEmployees[6],
    description: 'Délégation créée pour formation',
    metadata: { type: 'temporary', duration: 7, permissions: 3 },
    icon: '🔄',
    color: 'blue',
    createdAt: new Date('2026-01-08T09:00:00'),
  },
  {
    id: 'TL-012',
    entityType: 'delegation',
    entityId: 'DEL-001',
    type: 'approved',
    userId: 'EMP-001',
    user: mockEmployees[0],
    description: 'Délégation acceptée',
    metadata: { autoApproved: true, ruleId: 'RULE-001' },
    icon: '✅',
    color: 'green',
    createdAt: new Date('2026-01-08T09:05:00'),
  },

  // Autres événements
  {
    id: 'TL-013',
    entityType: 'substitution',
    entityId: 'SUB-003',
    type: 'created',
    userId: 'EMP-002',
    user: mockEmployees[1],
    description: 'Substitution créée - Calculs structurels',
    metadata: { reason: 'technique' },
    icon: '➕',
    color: 'blue',
    createdAt: new Date('2026-01-08T10:00:00'),
  },
  {
    id: 'TL-014',
    entityType: 'substitution',
    entityId: 'SUB-003',
    type: 'updated',
    userId: 'EMP-002',
    user: mockEmployees[1],
    description: 'Mise à jour des informations',
    metadata: { field: 'description' },
    icon: '✏️',
    color: 'gray',
    createdAt: new Date('2026-01-08T11:00:00'),
  },
  {
    id: 'TL-015',
    entityType: 'absence',
    entityId: 'ABS-002',
    type: 'created',
    userId: 'EMP-007',
    user: mockEmployees[6],
    description: 'Demande d\'absence pour formation',
    metadata: { type: 'formation', destination: 'Paris' },
    icon: '📅',
    color: 'blue',
    createdAt: new Date('2025-12-10T08:00:00'),
  },
  {
    id: 'TL-016',
    entityType: 'absence',
    entityId: 'ABS-002',
    type: 'approved',
    userId: 'EMP-001',
    user: mockEmployees[0],
    description: 'Absence approuvée',
    metadata: {},
    icon: '✅',
    color: 'green',
    createdAt: new Date('2025-12-15T10:00:00'),
  },
  // ... Continuer avec les autres événements pour atteindre 50
];

// ================================
// Documents
// ================================

export const mockDocuments: Document[] = [
  // Documents SUB-001
  {
    id: 'DOC-001',
    name: 'Contrat_Construction_ACME.pdf',
    type: 'application/pdf',
    size: 245678,
    url: '/documents/contrat-construction-acme.pdf',
    thumbnailUrl: '/thumbnails/doc-001.jpg',
    entityType: 'substitution',
    entityId: 'SUB-001',
    uploadedBy: 'EMP-001',
    uploadedAt: new Date('2026-01-10T08:15:00'),
    metadata: {
      pages: 12,
      signed: true,
      version: '1.0',
    },
  },
  {
    id: 'DOC-002',
    name: 'Annexe_Technique_Plans.dwg',
    type: 'application/acad',
    size: 1234567,
    url: '/documents/annexe-technique-plans.dwg',
    entityType: 'substitution',
    entityId: 'SUB-001',
    uploadedBy: 'EMP-001',
    uploadedAt: new Date('2026-01-10T08:20:00'),
    metadata: {
      software: 'AutoCAD 2024',
      layers: 25,
    },
  },

  // Documents ABS-001
  {
    id: 'DOC-003',
    name: 'Certificat_Medical_Aminata.pdf',
    type: 'application/pdf',
    size: 87654,
    url: '/documents/certificat-medical-aminata.pdf',
    thumbnailUrl: '/thumbnails/doc-003.jpg',
    entityType: 'absence',
    entityId: 'ABS-001',
    uploadedBy: 'EMP-004',
    uploadedAt: new Date('2026-01-07T09:05:00'),
    metadata: {
      pages: 1,
      confidential: true,
      validUntil: '2026-01-15',
    },
  },

  // Documents SUB-002
  {
    id: 'DOC-004',
    name: 'Planning_Projet_MAJ.xlsx',
    type: 'application/vnd.ms-excel',
    size: 345678,
    url: '/documents/planning-projet-maj.xlsx',
    entityType: 'substitution',
    entityId: 'SUB-002',
    uploadedBy: 'EMP-007',
    uploadedAt: new Date('2026-01-09T08:45:00'),
    metadata: {
      sheets: 3,
      lastModified: '2026-01-09',
    },
  },
  {
    id: 'DOC-005',
    name: 'Liste_Taches_Critiques.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 67890,
    url: '/documents/liste-taches-critiques.docx',
    thumbnailUrl: '/thumbnails/doc-005.jpg',
    entityType: 'substitution',
    entityId: 'SUB-002',
    uploadedBy: 'EMP-007',
    uploadedAt: new Date('2026-01-09T08:50:00'),
  },

  // Documents SUB-003
  {
    id: 'DOC-006',
    name: 'Calculs_Structure_Batiment_A.pdf',
    type: 'application/pdf',
    size: 567890,
    url: '/documents/calculs-structure-batiment-a.pdf',
    thumbnailUrl: '/thumbnails/doc-006.jpg',
    entityType: 'substitution',
    entityId: 'SUB-003',
    uploadedBy: 'EMP-002',
    uploadedAt: new Date('2026-01-08T14:30:00'),
    metadata: {
      pages: 45,
      software: 'Robot Structural Analysis',
      validated: true,
    },
  },

  // Documents ABS-006
  {
    id: 'DOC-007',
    name: 'Programme_Formation_SYSCOHADA.pdf',
    type: 'application/pdf',
    size: 123456,
    url: '/documents/programme-formation-syscohada.pdf',
    thumbnailUrl: '/thumbnails/doc-007.jpg',
    entityType: 'absence',
    entityId: 'ABS-006',
    uploadedBy: 'EMP-006',
    uploadedAt: new Date('2025-12-18T08:30:00'),
  },

  // Documents SUB-004
  {
    id: 'DOC-008',
    name: 'Budget_Projet_Revise.xlsx',
    type: 'application/vnd.ms-excel',
    size: 234567,
    url: '/documents/budget-projet-revise.xlsx',
    entityType: 'substitution',
    entityId: 'SUB-004',
    uploadedBy: 'EMP-006',
    uploadedAt: new Date('2026-01-09T16:15:00'),
    metadata: {
      sheets: 5,
      currency: 'FCFA',
      totalBudget: 45000000,
    },
  },

  // Plus de documents pour atteindre 25
  {
    id: 'DOC-009',
    name: 'Rapport_Inspection_Site.pdf',
    type: 'application/pdf',
    size: 1345678,
    url: '/documents/rapport-inspection-site.pdf',
    thumbnailUrl: '/thumbnails/doc-009.jpg',
    entityType: 'substitution',
    entityId: 'SUB-005',
    uploadedBy: 'EMP-001',
    uploadedAt: new Date('2026-01-07T15:00:00'),
    metadata: {
      pages: 28,
      photos: 45,
      location: 'Chantier Cocody',
    },
  },
  {
    id: 'DOC-010',
    name: 'Plans_Architecture_Facade.pdf',
    type: 'application/pdf',
    size: 2345678,
    url: '/documents/plans-architecture-facade.pdf',
    thumbnailUrl: '/thumbnails/doc-010.jpg',
    entityType: 'substitution',
    entityId: 'SUB-006',
    uploadedBy: 'EMP-010',
    uploadedAt: new Date('2026-01-10T15:30:00'),
  },
  // ... Ajouter 15 documents supplémentaires
];

// Statistiques
export const timelineStats = {
  total: mockTimelineEvents.length,
  byType: {
    created: mockTimelineEvents.filter(e => e.type === 'created').length,
    updated: mockTimelineEvents.filter(e => e.type === 'updated').length,
    assigned: mockTimelineEvents.filter(e => e.type === 'assigned').length,
    completed: mockTimelineEvents.filter(e => e.type === 'completed').length,
    escalated: mockTimelineEvents.filter(e => e.type === 'escalated').length,
    commented: mockTimelineEvents.filter(e => e.type === 'commented').length,
    approved: mockTimelineEvents.filter(e => e.type === 'approved').length,
    rejected: mockTimelineEvents.filter(e => e.type === 'rejected').length,
  },
  byEntityType: {
    substitution: mockTimelineEvents.filter(e => e.entityType === 'substitution').length,
    absence: mockTimelineEvents.filter(e => e.entityType === 'absence').length,
    delegation: mockTimelineEvents.filter(e => e.entityType === 'delegation').length,
  },
};

export const documentsStats = {
  total: mockDocuments.length,
  byType: {
    pdf: mockDocuments.filter(d => d.type === 'application/pdf').length,
    excel: mockDocuments.filter(d => d.type.includes('excel')).length,
    word: mockDocuments.filter(d => d.type.includes('word')).length,
    autocad: mockDocuments.filter(d => d.type.includes('acad')).length,
  },
  totalSize: mockDocuments.reduce((acc, d) => acc + d.size, 0),
  byEntityType: {
    substitution: mockDocuments.filter(d => d.entityType === 'substitution').length,
    absence: mockDocuments.filter(d => d.entityType === 'absence').length,
    delegation: mockDocuments.filter(d => d.entityType === 'delegation').length,
  },
};

// Fonctions utilitaires
export function getTimelineByEntity(entityType: string, entityId: string) {
  return mockTimelineEvents
    .filter(e => e.entityType === entityType && e.entityId === entityId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export function getDocumentsByEntity(entityType: string, entityId: string) {
  return mockDocuments.filter(
    d => d.entityType === entityType && d.entityId === entityId
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

