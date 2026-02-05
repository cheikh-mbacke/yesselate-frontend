/**
 * ====================================================================
 * MOCK DATA: Absences
 * Données de démonstration pour les absences
 * ====================================================================
 */

import type { Absence } from '@/lib/types/substitution.types';
import { mockEmployees } from './employees-mock-data';

export const mockAbsences: Absence[] = [
  {
    id: 'ABS-001',
    employeeId: 'EMP-004',
    employee: mockEmployees[3], // Aminata Touré
    type: 'maladie',
    startDate: new Date('2026-01-08'),
    endDate: new Date('2026-01-15'),
    status: 'approved',
    reason: 'Grippe saisonnière',
    description: 'Certificat médical fourni - 7 jours de repos prescrit',
    approvedBy: 'EMP-003',
    approvedAt: new Date('2026-01-07T14:30:00'),
    substitutionId: 'SUB-012',
    createdAt: new Date('2026-01-07T09:00:00'),
    updatedAt: new Date('2026-01-07T14:30:00'),
  },
  {
    id: 'ABS-002',
    employeeId: 'EMP-007',
    employee: mockEmployees[6], // Ibrahim Sanogo
    type: 'formation',
    startDate: new Date('2026-01-10'),
    endDate: new Date('2026-01-17'),
    status: 'approved',
    reason: 'Formation certifiante PMP à Paris',
    description: 'Formation Project Management Professional - Certification internationale',
    approvedBy: 'EMP-001',
    approvedAt: new Date('2025-12-15T10:00:00'),
    substitutionId: 'SUB-008',
    createdAt: new Date('2025-12-10T08:00:00'),
    updatedAt: new Date('2025-12-15T10:00:00'),
  },
  {
    id: 'ABS-003',
    employeeId: 'EMP-002',
    employee: mockEmployees[1], // Marie Koné
    type: 'conge',
    startDate: new Date('2026-01-20'),
    endDate: new Date('2026-02-03'),
    status: 'pending',
    reason: 'Congés annuels 2026',
    description: 'Congés annuels programmés - 2 semaines',
    createdAt: new Date('2026-01-05T11:00:00'),
    updatedAt: new Date('2026-01-05T11:00:00'),
  },
  {
    id: 'ABS-004',
    employeeId: 'EMP-010',
    employee: mockEmployees[9], // Adjoua Assi
    type: 'maladie',
    startDate: new Date('2026-01-06'),
    endDate: new Date('2026-01-08'),
    status: 'approved',
    reason: 'Consultation médicale',
    description: 'Intervention chirurgicale mineure - 3 jours',
    approvedBy: 'EMP-007',
    approvedAt: new Date('2026-01-05T16:00:00'),
    createdAt: new Date('2026-01-05T14:00:00'),
    updatedAt: new Date('2026-01-05T16:00:00'),
  },
  {
    id: 'ABS-005',
    employeeId: 'EMP-005',
    employee: mockEmployees[4], // Koffi Bamba
    type: 'autre',
    startDate: new Date('2026-01-12'),
    endDate: new Date('2026-01-12'),
    status: 'approved',
    reason: 'Événement familial',
    description: 'Mariage - 1 jour autorisé',
    approvedBy: 'EMP-001',
    approvedAt: new Date('2026-01-02T09:00:00'),
    createdAt: new Date('2026-01-01T10:00:00'),
    updatedAt: new Date('2026-01-02T09:00:00'),
  },
  {
    id: 'ABS-006',
    employeeId: 'EMP-006',
    employee: mockEmployees[5], // Fatoumata Diallo
    type: 'formation',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-01-19'),
    status: 'approved',
    reason: 'Formation SYSCOHADA révisé',
    description: 'Mise à jour réglementation comptable - 5 jours',
    approvedBy: 'EMP-001',
    approvedAt: new Date('2025-12-20T11:00:00'),
    createdAt: new Date('2025-12-18T08:00:00'),
    updatedAt: new Date('2025-12-20T11:00:00'),
  },
  {
    id: 'ABS-007',
    employeeId: 'EMP-008',
    employee: mockEmployees[7], // Aya Diabaté
    type: 'maladie',
    startDate: new Date('2026-01-11'),
    endDate: new Date('2026-01-13'),
    status: 'approved',
    reason: 'Malaise',
    description: 'Certificat médical - Repos 3 jours',
    approvedBy: 'EMP-003',
    approvedAt: new Date('2026-01-10T15:00:00'),
    createdAt: new Date('2026-01-10T14:30:00'),
    updatedAt: new Date('2026-01-10T15:00:00'),
  },
  {
    id: 'ABS-008',
    employeeId: 'EMP-001',
    employee: mockEmployees[0], // Jean Kouassi
    type: 'conge',
    startDate: new Date('2026-02-10'),
    endDate: new Date('2026-02-21'),
    status: 'pending',
    reason: 'Congés annuels',
    description: 'Congés programmés - 2 semaines',
    createdAt: new Date('2026-01-08T09:00:00'),
    updatedAt: new Date('2026-01-08T09:00:00'),
  },
  {
    id: 'ABS-009',
    employeeId: 'EMP-011',
    employee: mockEmployees[10], // Seydou Traoré
    type: 'formation',
    startDate: new Date('2026-01-22'),
    endDate: new Date('2026-01-24'),
    status: 'pending',
    reason: 'Séminaire droit des affaires OHADA',
    description: 'Séminaire régional - 3 jours à Dakar',
    createdAt: new Date('2026-01-06T10:00:00'),
    updatedAt: new Date('2026-01-06T10:00:00'),
  },
  {
    id: 'ABS-010',
    employeeId: 'EMP-009',
    employee: mockEmployees[8], // Mamadou Coulibaly
    type: 'maladie',
    startDate: new Date('2026-01-03'),
    endDate: new Date('2026-01-05'),
    status: 'approved',
    reason: 'Grippe',
    description: 'Certificat médical - 3 jours de repos',
    approvedBy: 'EMP-001',
    approvedAt: new Date('2026-01-02T17:00:00'),
    createdAt: new Date('2026-01-02T16:00:00'),
    updatedAt: new Date('2026-01-02T17:00:00'),
  },
  {
    id: 'ABS-011',
    employeeId: 'EMP-012',
    employee: mockEmployees[11], // Clarisse Ouattara
    type: 'autre',
    startDate: new Date('2026-01-16'),
    endDate: new Date('2026-01-17'),
    status: 'approved',
    reason: 'Déménagement',
    description: 'Changement de domicile - 2 jours',
    approvedBy: 'EMP-001',
    approvedAt: new Date('2026-01-10T09:00:00'),
    createdAt: new Date('2026-01-09T14:00:00'),
    updatedAt: new Date('2026-01-10T09:00:00'),
  },
  {
    id: 'ABS-012',
    employeeId: 'EMP-003',
    employee: mockEmployees[2], // Yao N'Guessan
    type: 'conge',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-15'),
    status: 'pending',
    reason: 'Congés annuels',
    description: 'Vacances familiales - 2 semaines',
    createdAt: new Date('2026-01-10T10:00:00'),
    updatedAt: new Date('2026-01-10T10:00:00'),
  },
  {
    id: 'ABS-013',
    employeeId: 'EMP-005',
    employee: mockEmployees[4], // Koffi Bamba
    type: 'formation',
    startDate: new Date('2026-02-05'),
    endDate: new Date('2026-02-07'),
    status: 'pending',
    reason: 'Formation BIM avancé',
    description: 'Formation Building Information Modeling - 3 jours',
    createdAt: new Date('2026-01-11T08:00:00'),
    updatedAt: new Date('2026-01-11T08:00:00'),
  },
  {
    id: 'ABS-014',
    employeeId: 'EMP-004',
    employee: mockEmployees[3], // Aminata Touré
    type: 'conge',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-04-14'),
    status: 'pending',
    reason: 'Congés Pâques',
    description: 'Congés de printemps - 2 semaines',
    createdAt: new Date('2026-01-09T11:00:00'),
    updatedAt: new Date('2026-01-09T11:00:00'),
  },
  {
    id: 'ABS-015',
    employeeId: 'EMP-002',
    employee: mockEmployees[1], // Marie Koné
    type: 'maladie',
    startDate: new Date('2025-12-28'),
    endDate: new Date('2026-01-02'),
    status: 'approved',
    reason: 'Gastro-entérite',
    description: 'Certificat médical - 6 jours de repos',
    approvedBy: 'EMP-007',
    approvedAt: new Date('2025-12-27T16:00:00'),
    substitutionId: 'SUB-003',
    createdAt: new Date('2025-12-27T15:00:00'),
    updatedAt: new Date('2025-12-27T16:00:00'),
  },
  {
    id: 'ABS-016',
    employeeId: 'EMP-010',
    employee: mockEmployees[9], // Adjoua Assi
    type: 'conge',
    startDate: new Date('2026-02-14'),
    endDate: new Date('2026-02-16'),
    status: 'rejected',
    reason: 'Week-end prolongé',
    description: 'Demande rejetée - période de forte activité',
    createdAt: new Date('2026-01-20T10:00:00'),
    updatedAt: new Date('2026-01-22T14:00:00'),
  },
  {
    id: 'ABS-017',
    employeeId: 'EMP-008',
    employee: mockEmployees[7], // Aya Diabaté
    type: 'formation',
    startDate: new Date('2026-02-24'),
    endDate: new Date('2026-02-28'),
    status: 'pending',
    reason: 'Formation LegalTech',
    description: 'Formation outils numériques juridiques - 5 jours',
    createdAt: new Date('2026-01-15T09:00:00'),
    updatedAt: new Date('2026-01-15T09:00:00'),
  },
  {
    id: 'ABS-018',
    employeeId: 'EMP-007',
    employee: mockEmployees[6], // Ibrahim Sanogo
    type: 'autre',
    startDate: new Date('2026-01-25'),
    endDate: new Date('2026-01-25'),
    status: 'approved',
    reason: 'Rendez-vous administratif',
    description: 'Renouvellement documents - 1 jour',
    approvedBy: 'EMP-001',
    approvedAt: new Date('2026-01-20T10:00:00'),
    createdAt: new Date('2026-01-19T14:00:00'),
    updatedAt: new Date('2026-01-20T10:00:00'),
  },
  {
    id: 'ABS-019',
    employeeId: 'EMP-011',
    employee: mockEmployees[10], // Seydou Traoré
    type: 'maladie',
    startDate: new Date('2026-01-14'),
    endDate: new Date('2026-01-16'),
    status: 'approved',
    reason: 'Angine',
    description: 'Certificat médical - 3 jours de repos',
    approvedBy: 'EMP-003',
    approvedAt: new Date('2026-01-13T17:00:00'),
    createdAt: new Date('2026-01-13T16:30:00'),
    updatedAt: new Date('2026-01-13T17:00:00'),
  },
  {
    id: 'ABS-020',
    employeeId: 'EMP-006',
    employee: mockEmployees[5], // Fatoumata Diallo
    type: 'conge',
    startDate: new Date('2026-03-20'),
    endDate: new Date('2026-03-27'),
    status: 'pending',
    reason: 'Congés de printemps',
    description: 'Vacances familiales - 1 semaine',
    createdAt: new Date('2026-01-25T09:00:00'),
    updatedAt: new Date('2026-01-25T09:00:00'),
  },
];

// Statistiques des absences
export const absencesStats = {
  total: mockAbsences.length,
  byType: {
    maladie: mockAbsences.filter(a => a.type === 'maladie').length,
    conge: mockAbsences.filter(a => a.type === 'conge').length,
    formation: mockAbsences.filter(a => a.type === 'formation').length,
    autre: mockAbsences.filter(a => a.type === 'autre').length,
  },
  byStatus: {
    pending: mockAbsences.filter(a => a.status === 'pending').length,
    approved: mockAbsences.filter(a => a.status === 'approved').length,
    rejected: mockAbsences.filter(a => a.status === 'rejected').length,
  },
  currentAbsences: mockAbsences.filter(a => 
    a.status === 'approved' && 
    new Date(a.endDate) >= new Date() && 
    new Date(a.startDate) <= new Date()
  ).length,
  upcomingAbsences: mockAbsences.filter(a => 
    new Date(a.startDate) > new Date()
  ).length,
};

// Absences par bureau
export const absencesByBureau = {
  BTP: mockAbsences.filter(a => a.employee.bureau === 'BTP'),
  BJ: mockAbsences.filter(a => a.employee.bureau === 'BJ'),
  BS: mockAbsences.filter(a => a.employee.bureau === 'BS'),
};

// Absences actuelles (en cours aujourd'hui)
export const currentAbsences = mockAbsences.filter(a => {
  const today = new Date();
  return a.status === 'approved' && 
         new Date(a.startDate) <= today && 
         new Date(a.endDate) >= today;
});

// Absences à venir (dans les 30 prochains jours)
export const upcomingAbsences = mockAbsences.filter(a => {
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  return new Date(a.startDate) > today && 
         new Date(a.startDate) <= thirtyDaysLater;
});

// Conflits d'absences (2 personnes du même bureau absentes en même temps)
export function detectAbsenceConflicts() {
  const conflicts: any[] = [];
  
  mockAbsences.forEach((abs1, i) => {
    mockAbsences.slice(i + 1).forEach(abs2 => {
      if (abs1.employee.bureau === abs2.employee.bureau &&
          abs1.status === 'approved' && abs2.status === 'approved') {
        const start1 = new Date(abs1.startDate);
        const end1 = new Date(abs1.endDate);
        const start2 = new Date(abs2.startDate);
        const end2 = new Date(abs2.endDate);
        
        // Vérifier si les périodes se chevauchent
        if (start1 <= end2 && start2 <= end1) {
          conflicts.push({
            id: `CONFLICT-${abs1.id}-${abs2.id}`,
            type: 'absence_overlap',
            severity: 'warning',
            description: `${abs1.employee.name} et ${abs2.employee.name} sont absents simultanément (${abs1.employee.bureau})`,
            entities: [abs1.id, abs2.id],
            startDate: start1 > start2 ? start1 : start2,
            endDate: end1 < end2 ? end1 : end2,
          });
        }
      }
    });
  });
  
  return conflicts;
}

