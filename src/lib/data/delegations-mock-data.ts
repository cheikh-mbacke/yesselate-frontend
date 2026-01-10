/**
 * ====================================================================
 * MOCK DATA: Délégations
 * Données de démonstration pour les délégations et règles
 * ====================================================================
 */

import type { Delegation, DelegationRule } from '@/lib/types/substitution.types';
import { mockEmployees } from './employees-mock-data';

export const mockDelegations: Delegation[] = [
  {
    id: 'DEL-001',
    fromUserId: 'EMP-007',
    fromUser: mockEmployees[6], // Ibrahim Sanogo (Chef de Projet)
    toUserId: 'EMP-001',
    toUser: mockEmployees[0], // Jean Kouassi
    type: 'temporary',
    permissions: ['validate_documents', 'approve_expenses', 'sign_contracts'],
    startDate: new Date('2026-01-10'),
    endDate: new Date('2026-01-17'),
    status: 'active',
    reason: 'Formation PMP à Paris',
    ruleId: 'RULE-001',
    createdAt: new Date('2026-01-08T09:00:00'),
    updatedAt: new Date('2026-01-08T09:00:00'),
  },
  {
    id: 'DEL-002',
    fromUserId: 'EMP-003',
    fromUser: mockEmployees[2], // Yao N'Guessan (Avocat Senior)
    toUserId: 'EMP-011',
    toUser: mockEmployees[10], // Seydou Traoré (Avocat Junior)
    type: 'temporary',
    permissions: ['review_contracts', 'legal_advice', 'client_meetings'],
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-01-22'),
    status: 'active',
    reason: 'Congés annuels',
    ruleId: 'RULE-002',
    createdAt: new Date('2026-01-05T10:00:00'),
    updatedAt: new Date('2026-01-05T10:00:00'),
  },
  {
    id: 'DEL-003',
    fromUserId: 'EMP-001',
    fromUser: mockEmployees[0], // Jean Kouassi
    toUserId: 'EMP-010',
    toUser: mockEmployees[9], // Adjoua Assi
    type: 'permanent',
    permissions: ['validate_plans', 'technical_review'],
    startDate: new Date('2025-12-01'),
    status: 'active',
    reason: 'Délégation technique permanente',
    createdAt: new Date('2025-12-01T08:00:00'),
    updatedAt: new Date('2025-12-01T08:00:00'),
  },
  {
    id: 'DEL-004',
    fromUserId: 'EMP-005',
    fromUser: mockEmployees[4], // Koffi Bamba (Architecte)
    toUserId: 'EMP-002',
    toUser: mockEmployees[1], // Marie Koné (Ingénieur)
    type: 'temporary',
    permissions: ['review_permits', 'approve_designs'],
    startDate: new Date('2026-01-12'),
    endDate: new Date('2026-01-12'),
    status: 'active',
    reason: 'Événement familial',
    createdAt: new Date('2026-01-02T09:00:00'),
    updatedAt: new Date('2026-01-02T09:00:00'),
  },
  {
    id: 'DEL-005',
    fromUserId: 'EMP-006',
    fromUser: mockEmployees[5], // Fatoumata Diallo (Comptable)
    toUserId: 'EMP-012',
    toUser: mockEmployees[11], // Clarisse Ouattara
    type: 'temporary',
    permissions: ['process_invoices', 'basic_accounting'],
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-01-19'),
    status: 'active',
    reason: 'Formation SYSCOHADA',
    ruleId: 'RULE-003',
    createdAt: new Date('2025-12-20T11:00:00'),
    updatedAt: new Date('2025-12-20T11:00:00'),
  },
  {
    id: 'DEL-006',
    fromUserId: 'EMP-004',
    fromUser: mockEmployees[3], // Aminata Touré
    toUserId: 'EMP-008',
    toUser: mockEmployees[7], // Aya Diabaté
    type: 'temporary',
    permissions: ['legal_research', 'document_drafting'],
    startDate: new Date('2026-01-08'),
    endDate: new Date('2026-01-15'),
    status: 'active',
    reason: 'Maladie - Grippe',
    createdAt: new Date('2026-01-07T09:00:00'),
    updatedAt: new Date('2026-01-07T09:00:00'),
  },
  {
    id: 'DEL-007',
    fromUserId: 'EMP-009',
    fromUser: mockEmployees[8], // Mamadou Coulibaly (IT)
    toUserId: 'EMP-012',
    toUser: mockEmployees[11], // Clarisse Ouattara
    type: 'permanent',
    permissions: ['it_support_level1', 'password_reset'],
    startDate: new Date('2025-11-15'),
    status: 'active',
    reason: 'Support IT de premier niveau',
    createdAt: new Date('2025-11-15T08:00:00'),
    updatedAt: new Date('2025-11-15T08:00:00'),
  },
  {
    id: 'DEL-008',
    fromUserId: 'EMP-007',
    fromUser: mockEmployees[6], // Ibrahim Sanogo
    toUserId: 'EMP-005',
    toUser: mockEmployees[4], // Koffi Bamba
    type: 'temporary',
    permissions: ['approve_deliverables', 'client_communications'],
    startDate: new Date('2025-12-28'),
    endDate: new Date('2026-01-05'),
    status: 'inactive',
    reason: 'Congés de fin d\'année',
    createdAt: new Date('2025-12-15T10:00:00'),
    updatedAt: new Date('2026-01-06T08:00:00'),
  },
  {
    id: 'DEL-009',
    fromUserId: 'EMP-002',
    fromUser: mockEmployees[1], // Marie Koné
    toUserId: 'EMP-010',
    toUser: mockEmployees[9], // Adjoua Assi
    type: 'temporary',
    permissions: ['technical_calculations', 'autocad_work'],
    startDate: new Date('2026-01-20'),
    endDate: new Date('2026-02-03'),
    status: 'inactive',
    reason: 'Congés annuels (planifié)',
    createdAt: new Date('2026-01-05T11:00:00'),
    updatedAt: new Date('2026-01-05T11:00:00'),
  },
  {
    id: 'DEL-010',
    fromUserId: 'EMP-003',
    fromUser: mockEmployees[2], // Yao N'Guessan
    toUserId: 'EMP-004',
    toUser: mockEmployees[3], // Aminata Touré
    type: 'permanent',
    permissions: ['legal_review', 'client_consultations'],
    startDate: new Date('2025-10-01'),
    status: 'active',
    reason: 'Partage de charge - Bureau Juridique',
    ruleId: 'RULE-002',
    createdAt: new Date('2025-10-01T08:00:00'),
    updatedAt: new Date('2025-10-01T08:00:00'),
  },
  {
    id: 'DEL-011',
    fromUserId: 'EMP-001',
    fromUser: mockEmployees[0], // Jean Kouassi
    toUserId: 'EMP-002',
    toUser: mockEmployees[1], // Marie Koné
    type: 'temporary',
    permissions: ['site_inspections', 'measurements'],
    startDate: new Date('2026-02-10'),
    endDate: new Date('2026-02-21'),
    status: 'inactive',
    reason: 'Congés annuels (planifié)',
    createdAt: new Date('2026-01-08T09:00:00'),
    updatedAt: new Date('2026-01-08T09:00:00'),
  },
  {
    id: 'DEL-012',
    fromUserId: 'EMP-010',
    fromUser: mockEmployees[9], // Adjoua Assi
    toUserId: 'EMP-002',
    toUser: mockEmployees[1], // Marie Koné
    type: 'temporary',
    permissions: ['drawing_review', 'technical_support'],
    startDate: new Date('2026-01-06'),
    endDate: new Date('2026-01-08'),
    status: 'inactive',
    reason: 'Consultation médicale',
    createdAt: new Date('2026-01-05T14:00:00'),
    updatedAt: new Date('2026-01-09T08:00:00'),
  },
  {
    id: 'DEL-013',
    fromUserId: 'EMP-011',
    fromUser: mockEmployees[10], // Seydou Traoré
    toUserId: 'EMP-008',
    toUser: mockEmployees[7], // Aya Diabaté
    type: 'temporary',
    permissions: ['legal_drafting', 'file_management'],
    startDate: new Date('2026-01-22'),
    endDate: new Date('2026-01-24'),
    status: 'inactive',
    reason: 'Séminaire OHADA (planifié)',
    createdAt: new Date('2026-01-06T10:00:00'),
    updatedAt: new Date('2026-01-06T10:00:00'),
  },
  {
    id: 'DEL-014',
    fromUserId: 'EMP-005',
    fromUser: mockEmployees[4], // Koffi Bamba
    toUserId: 'EMP-001',
    toUser: mockEmployees[0], // Jean Kouassi
    type: 'temporary',
    permissions: ['permit_applications', 'urban_planning'],
    startDate: new Date('2026-02-05'),
    endDate: new Date('2026-02-07'),
    status: 'inactive',
    reason: 'Formation BIM (planifié)',
    createdAt: new Date('2026-01-11T08:00:00'),
    updatedAt: new Date('2026-01-11T08:00:00'),
  },
  {
    id: 'DEL-015',
    fromUserId: 'EMP-006',
    fromUser: mockEmployees[5], // Fatoumata Diallo
    toUserId: 'EMP-009',
    toUser: mockEmployees[8], // Mamadou Coulibaly
    type: 'permanent',
    permissions: ['expense_approval', 'supplier_payments'],
    startDate: new Date('2025-09-01'),
    status: 'active',
    reason: 'Délégation croisée Finance-IT',
    ruleId: 'RULE-004',
    createdAt: new Date('2025-09-01T08:00:00'),
    updatedAt: new Date('2025-09-01T08:00:00'),
  },
];

export const mockDelegationRules: DelegationRule[] = [
  {
    id: 'RULE-001',
    name: 'Chef de Projet → Chef de Projet (même bureau)',
    description: 'Délégation automatique entre chefs de projet du même bureau pour validation documents et approbation dépenses',
    fromRole: 'Chef de Projet',
    toRole: 'Chef de Projet',
    permissions: ['validate_documents', 'approve_expenses', 'sign_contracts'],
    conditions: {
      sameBureau: true,
      maxDuration: 30, // jours
      requiresApproval: false,
    },
    autoApprove: true,
    active: true,
    createdAt: new Date('2025-12-01T08:00:00'),
  },
  {
    id: 'RULE-002',
    name: 'Avocat Senior → Avocat Junior/Parajuriste',
    description: 'Délégation juridique pour révision contrats et conseils clients',
    fromRole: 'Avocat Senior',
    toRole: 'Avocat Junior',
    permissions: ['review_contracts', 'legal_advice', 'client_meetings'],
    conditions: {
      sameBureau: true,
      maxDuration: 21, // jours
      requiresApproval: false,
      minExperience: 1, // année
    },
    autoApprove: true,
    active: true,
    createdAt: new Date('2025-11-15T08:00:00'),
  },
  {
    id: 'RULE-003',
    name: 'Comptable → Assistant Comptable',
    description: 'Délégation comptable pour factures et opérations courantes',
    fromRole: 'Comptable Expert',
    toRole: 'Assistante de Direction',
    permissions: ['process_invoices', 'basic_accounting', 'expense_reports'],
    conditions: {
      sameBureau: true,
      maxDuration: 14, // jours
      requiresApproval: true,
      maxAmount: 500000, // FCFA
    },
    autoApprove: false,
    active: true,
    createdAt: new Date('2025-10-01T08:00:00'),
  },
  {
    id: 'RULE-004',
    name: 'Délégations croisées inter-services',
    description: 'Délégations permanentes entre services pour opérations courantes',
    fromRole: 'Tous',
    toRole: 'Tous',
    permissions: ['basic_operations', 'routine_tasks'],
    conditions: {
      sameBureau: false,
      requiresApproval: true,
      permanent: true,
    },
    autoApprove: false,
    active: true,
    createdAt: new Date('2025-09-01T08:00:00'),
  },
  {
    id: 'RULE-005',
    name: 'Ingénieur/Architecte → Dessinateur',
    description: 'Délégation technique pour validation plans et révision dessins',
    fromRole: 'Ingénieur Civil',
    toRole: 'Dessinateur Projeteur',
    permissions: ['validate_plans', 'technical_review', 'drawing_approval'],
    conditions: {
      sameBureau: true,
      maxDuration: 7, // jours
      requiresApproval: false,
      projectType: ['residential', 'commercial'],
    },
    autoApprove: true,
    active: true,
    createdAt: new Date('2025-11-01T08:00:00'),
  },
];

// Permissions disponibles
export const availablePermissions = [
  { id: 'validate_documents', label: 'Valider des documents', category: 'Général' },
  { id: 'approve_expenses', label: 'Approuver des dépenses', category: 'Financier' },
  { id: 'sign_contracts', label: 'Signer des contrats', category: 'Juridique' },
  { id: 'review_contracts', label: 'Réviser des contrats', category: 'Juridique' },
  { id: 'legal_advice', label: 'Conseiller juridique', category: 'Juridique' },
  { id: 'client_meetings', label: 'Rencontrer les clients', category: 'Commercial' },
  { id: 'validate_plans', label: 'Valider des plans', category: 'Technique' },
  { id: 'technical_review', label: 'Révision technique', category: 'Technique' },
  { id: 'review_permits', label: 'Réviser permis', category: 'Urbanisme' },
  { id: 'approve_designs', label: 'Approuver designs', category: 'Architecture' },
  { id: 'process_invoices', label: 'Traiter factures', category: 'Comptabilité' },
  { id: 'basic_accounting', label: 'Comptabilité courante', category: 'Comptabilité' },
  { id: 'it_support_level1', label: 'Support IT niveau 1', category: 'IT' },
  { id: 'password_reset', label: 'Réinitialiser mots de passe', category: 'IT' },
  { id: 'approve_deliverables', label: 'Approuver livrables', category: 'Projet' },
  { id: 'client_communications', label: 'Communications client', category: 'Commercial' },
  { id: 'technical_calculations', label: 'Calculs techniques', category: 'Technique' },
  { id: 'autocad_work', label: 'Travaux AutoCAD', category: 'Dessin' },
  { id: 'legal_research', label: 'Recherche juridique', category: 'Juridique' },
  { id: 'document_drafting', label: 'Rédaction documents', category: 'Général' },
];

// Statistiques des délégations
export const delegationsStats = {
  total: mockDelegations.length,
  active: mockDelegations.filter(d => d.status === 'active').length,
  temporary: mockDelegations.filter(d => d.type === 'temporary').length,
  permanent: mockDelegations.filter(d => d.type === 'permanent').length,
  byBureau: {
    BTP: mockDelegations.filter(d => d.fromUser.bureau === 'BTP').length,
    BJ: mockDelegations.filter(d => d.fromUser.bureau === 'BJ').length,
    BS: mockDelegations.filter(d => d.fromUser.bureau === 'BS').length,
  },
};

// Délégations actives
export const activeDelegations = mockDelegations.filter(d => d.status === 'active');

// Délégations par employé (délégateur)
export function getDelegationsByEmployee(employeeId: string) {
  return mockDelegations.filter(d => d.fromUserId === employeeId);
}

// Délégations reçues par employé (délégataire)
export function getDelegationsReceivedByEmployee(employeeId: string) {
  return mockDelegations.filter(d => d.toUserId === employeeId);
}

// Vérifier si une délégation est valide pour une action
export function canPerformAction(
  delegationId: string,
  permission: string
): boolean {
  const delegation = mockDelegations.find(d => d.id === delegationId);
  if (!delegation || delegation.status !== 'active') return false;
  
  // Vérifier si la délégation a expiré
  if (delegation.endDate && new Date(delegation.endDate) < new Date()) {
    return false;
  }
  
  return delegation.permissions.includes(permission);
}

// Trouver les règles applicables
export function findApplicableRules(
  fromRole: string,
  toRole: string,
  bureau?: string
): DelegationRule[] {
  return mockDelegationRules.filter(rule => {
    if (!rule.active) return false;
    if (rule.fromRole !== 'Tous' && rule.fromRole !== fromRole) return false;
    if (rule.toRole !== 'Tous' && rule.toRole !== toRole) return false;
    if (rule.conditions.sameBureau && !bureau) return false;
    return true;
  });
}

