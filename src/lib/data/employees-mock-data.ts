/**
 * ====================================================================
 * MOCK DATA: Employés
 * Données de démonstration pour les employés
 * ====================================================================
 */

import type { Employee } from '@/lib/types/substitution.types';

export const mockEmployees: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Jean Kouassi',
    email: 'jean.kouassi@yesselate.ci',
    phone: '+225 07 12 34 56 78',
    bureau: 'BTP',
    role: 'Géomètre Expert',
    competences: ['Topographie', 'Cadastre', 'Bornage', 'GPS RTK'],
    disponibilite: 'available',
    chargeActuelle: 45,
    score: 92,
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'EMP-002',
    name: 'Marie Koné',
    email: 'marie.kone@yesselate.ci',
    phone: '+225 07 23 45 67 89',
    bureau: 'BTP',
    role: 'Ingénieur Civil',
    competences: ['Structures', 'Béton', 'Calculs', 'AutoCAD'],
    disponibilite: 'busy',
    chargeActuelle: 78,
    score: 88,
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 'EMP-003',
    name: 'Yao N\'Guessan',
    email: 'yao.nguessan@yesselate.ci',
    phone: '+225 07 34 56 78 90',
    bureau: 'BJ',
    role: 'Avocat Senior',
    competences: ['Droit des affaires', 'Contentieux', 'Contrats', 'Arbitrage'],
    disponibilite: 'available',
    chargeActuelle: 32,
    score: 95,
    avatar: 'https://i.pravatar.cc/150?img=8',
  },
  {
    id: 'EMP-004',
    name: 'Aminata Touré',
    email: 'aminata.toure@yesselate.ci',
    phone: '+225 07 45 67 89 01',
    bureau: 'BJ',
    role: 'Juriste Consultant',
    competences: ['Droit public', 'Marchés publics', 'Conseil juridique'],
    disponibilite: 'absent',
    chargeActuelle: 0,
    score: 87,
    avatar: 'https://i.pravatar.cc/150?img=9',
  },
  {
    id: 'EMP-005',
    name: 'Koffi Bamba',
    email: 'koffi.bamba@yesselate.ci',
    phone: '+225 07 56 78 90 12',
    bureau: 'BS',
    role: 'Architecte Principal',
    competences: ['Conception', 'Permis', 'Urbanisme', 'BIM'],
    disponibilite: 'available',
    chargeActuelle: 55,
    score: 90,
    avatar: 'https://i.pravatar.cc/150?img=15',
  },
  {
    id: 'EMP-006',
    name: 'Fatoumata Diallo',
    email: 'fatoumata.diallo@yesselate.ci',
    phone: '+225 07 67 89 01 23',
    bureau: 'BS',
    role: 'Comptable Expert',
    competences: ['Comptabilité générale', 'Fiscalité', 'Audit', 'SYSCOHADA'],
    disponibilite: 'available',
    chargeActuelle: 40,
    score: 91,
    avatar: 'https://i.pravatar.cc/150?img=10',
  },
  {
    id: 'EMP-007',
    name: 'Ibrahim Sanogo',
    email: 'ibrahim.sanogo@yesselate.ci',
    phone: '+225 07 78 90 12 34',
    bureau: 'BTP',
    role: 'Chef de Projet',
    competences: ['Gestion de projet', 'Planning', 'Budget', 'Coordination'],
    disponibilite: 'busy',
    chargeActuelle: 85,
    score: 93,
    avatar: 'https://i.pravatar.cc/150?img=13',
  },
  {
    id: 'EMP-008',
    name: 'Aya Diabaté',
    email: 'aya.diabate@yesselate.ci',
    phone: '+225 07 89 01 23 45',
    bureau: 'BJ',
    role: 'Parajuriste',
    competences: ['Recherche juridique', 'Rédaction', 'Veille juridique'],
    disponibilite: 'available',
    chargeActuelle: 28,
    score: 82,
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: 'EMP-009',
    name: 'Mamadou Coulibaly',
    email: 'mamadou.coulibaly@yesselate.ci',
    phone: '+225 07 90 12 34 56',
    bureau: 'BS',
    role: 'Ingénieur Système',
    competences: ['Infrastructure', 'Réseau', 'Sécurité', 'Cloud'],
    disponibilite: 'available',
    chargeActuelle: 50,
    score: 89,
    avatar: 'https://i.pravatar.cc/150?img=14',
  },
  {
    id: 'EMP-010',
    name: 'Adjoua Assi',
    email: 'adjoua.assi@yesselate.ci',
    phone: '+225 07 01 23 45 67',
    bureau: 'BTP',
    role: 'Dessinateur Projeteur',
    competences: ['AutoCAD', 'Revit', 'Plans techniques', 'Maquettes 3D'],
    disponibilite: 'busy',
    chargeActuelle: 72,
    score: 86,
    avatar: 'https://i.pravatar.cc/150?img=16',
  },
  {
    id: 'EMP-011',
    name: 'Seydou Traoré',
    email: 'seydou.traore@yesselate.ci',
    phone: '+225 07 12 34 56 78',
    bureau: 'BJ',
    role: 'Avocat Junior',
    competences: ['Droit civil', 'Procédure', 'Rédaction d\'actes'],
    disponibilite: 'available',
    chargeActuelle: 35,
    score: 79,
    avatar: 'https://i.pravatar.cc/150?img=17',
  },
  {
    id: 'EMP-012',
    name: 'Clarisse Ouattara',
    email: 'clarisse.ouattara@yesselate.ci',
    phone: '+225 07 23 45 67 89',
    bureau: 'BS',
    role: 'Assistante de Direction',
    competences: ['Secrétariat', 'Organisation', 'Communication', 'Bureautique'],
    disponibilite: 'available',
    chargeActuelle: 42,
    score: 88,
    avatar: 'https://i.pravatar.cc/150?img=18',
  },
];

// Employés par bureau
export const employeesByBureau = {
  BTP: mockEmployees.filter(e => e.bureau === 'BTP'),
  BJ: mockEmployees.filter(e => e.bureau === 'BJ'),
  BS: mockEmployees.filter(e => e.bureau === 'BS'),
};

// Employés disponibles
export const availableEmployees = mockEmployees.filter(
  e => e.disponibilite === 'available'
);

// Employés avec charge faible (< 50%)
export const lowWorkloadEmployees = mockEmployees.filter(
  e => e.chargeActuelle < 50 && e.disponibilite === 'available'
);

// Top performers
export const topPerformers = mockEmployees
  .filter(e => e.score >= 90)
  .sort((a, b) => b.score - a.score);

// Recherche d'employé par nom
export function searchEmployeesByName(query: string): Employee[] {
  const q = query.toLowerCase();
  return mockEmployees.filter(
    e => e.name.toLowerCase().includes(q) ||
         e.email.toLowerCase().includes(q) ||
         e.role.toLowerCase().includes(q)
  );
}

// Recherche d'employé par compétence
export function searchEmployeesByCompetence(competence: string): Employee[] {
  const q = competence.toLowerCase();
  return mockEmployees.filter(e =>
    e.competences.some(c => c.toLowerCase().includes(q))
  );
}

// Trouver le meilleur substitut
export function findBestSubstitute(
  bureau: string,
  competences: string[],
  excludeIds: string[] = []
): Employee | null {
  const candidates = mockEmployees.filter(e =>
    e.bureau === bureau &&
    e.disponibilite === 'available' &&
    !excludeIds.includes(e.id) &&
    e.chargeActuelle < 80 &&
    competences.some(c => e.competences.some(ec => ec.toLowerCase().includes(c.toLowerCase())))
  );

  if (candidates.length === 0) return null;

  // Scoring: disponibilité (40%) + compétences (40%) + charge (20%)
  return candidates.sort((a, b) => {
    const scoreA = (a.score * 0.4) + 
                   (a.competences.length * 10 * 0.4) + 
                   ((100 - a.chargeActuelle) * 0.2);
    const scoreB = (b.score * 0.4) + 
                   (b.competences.length * 10 * 0.4) + 
                   ((100 - b.chargeActuelle) * 0.2);
    return scoreB - scoreA;
  })[0];
}

