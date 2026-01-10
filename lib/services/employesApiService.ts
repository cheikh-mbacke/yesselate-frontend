/**
 * Service API pour la gestion des Employés
 * ==========================================
 */

// ============================================
// TYPES
// ============================================

export type EmployeStatus = 'actif' | 'conge' | 'formation' | 'mission' | 'suspendu' | 'inactif';

export type EmployePoste =
  | 'direction'
  | 'chef_service'
  | 'chef_projet'
  | 'ingenieur'
  | 'technicien'
  | 'comptable'
  | 'administratif'
  | 'support';

export interface Employe {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: EmployePoste;
  departement: string;
  status: EmployeStatus;
  dateEmbauche: string;
  salaire: number;
  evaluation: number; // 0-5
  competences: string[];
  isSPOF: boolean; // Single Point of Failure
  riskScore: number; // 0-100
  projetsActifs: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployesStats {
  total: number;
  actifs: number;
  enConge: number;
  enFormation: number;
  enMission: number;
  spofCount: number;
  riskCount: number;
  avgEvaluation: number;
  salaireTotal: number;
  parPoste: Array<{ poste: EmployePoste; count: number }>;
  parDepartement: Array<{ departement: string; count: number }>;
  ts: string;
}

export interface EmployeFilters {
  status?: EmployeStatus[];
  poste?: EmployePoste[];
  departement?: string;
  isSPOF?: boolean;
  evaluationMin?: number;
  search?: string;
}

// ============================================
// MOCK DATA
// ============================================

const mockEmployes: Employe[] = [
  {
    id: 'EMP-001',
    matricule: 'MAT-001',
    nom: 'Diallo',
    prenom: 'Ahmed',
    email: 'ahmed.diallo@bmo.sn',
    telephone: '+221 77 XXX XX XX',
    poste: 'chef_projet',
    departement: 'BTP',
    status: 'actif',
    dateEmbauche: '2020-03-15',
    salaire: 1850000,
    evaluation: 4.5,
    competences: ['Gestion de projet', 'Routes', 'Leadership'],
    isSPOF: true,
    riskScore: 75,
    projetsActifs: 3,
    createdAt: '2020-03-15T08:00:00Z',
    updatedAt: '2026-01-10T10:30:00Z',
  },
  {
    id: 'EMP-002',
    matricule: 'MAT-002',
    nom: 'Sall',
    prenom: 'Fatou',
    email: 'fatou.sall@bmo.sn',
    telephone: '+221 77 YYY YY YY',
    poste: 'ingenieur',
    departement: 'BTP',
    status: 'actif',
    dateEmbauche: '2021-06-01',
    salaire: 1250000,
    evaluation: 4.2,
    competences: ['CAO', 'Béton armé', 'Topographie'],
    isSPOF: false,
    riskScore: 25,
    projetsActifs: 2,
    createdAt: '2021-06-01T08:00:00Z',
    updatedAt: '2026-01-09T14:20:00Z',
  },
];

// ============================================
// SERVICE
// ============================================

class EmployesApiService {
  private baseUrl = '/api/bmo/employes';

  async getStats(): Promise<EmployesStats> {
    await this.delay(300);

    return {
      total: 127,
      actifs: 108,
      enConge: 12,
      enFormation: 4,
      enMission: 3,
      spofCount: 8,
      riskCount: 15,
      avgEvaluation: 3.8,
      salaireTotal: 142500000,
      parPoste: [
        { poste: 'direction', count: 5 },
        { poste: 'chef_service', count: 12 },
        { poste: 'chef_projet', count: 18 },
        { poste: 'ingenieur', count: 35 },
        { poste: 'technicien', count: 42 },
        { poste: 'comptable', count: 6 },
        { poste: 'administratif', count: 7 },
        { poste: 'support', count: 2 },
      ],
      parDepartement: [
        { departement: 'BTP', count: 85 },
        { departement: 'Finance', count: 12 },
        { departement: 'RH', count: 8 },
        { departement: 'Juridique', count: 5 },
        { departement: 'IT', count: 7 },
        { departement: 'Administration', count: 10 },
      ],
      ts: new Date().toISOString(),
    };
  }

  async getList(filters?: EmployeFilters): Promise<Employe[]> {
    await this.delay(400);
    let results = [...mockEmployes];

    if (filters?.isSPOF !== undefined) {
      results = results.filter((e) => e.isSPOF === filters.isSPOF);
    }

    if (filters?.status) {
      results = results.filter((e) => filters.status!.includes(e.status));
    }

    return results;
  }

  async getById(id: string): Promise<Employe | null> {
    await this.delay(200);
    return mockEmployes.find((e) => e.id === id) || null;
  }

  async create(data: Partial<Employe>): Promise<Employe> {
    await this.delay(500);
    return {
      id: `EMP-${Date.now()}`,
      matricule: `MAT-${Math.floor(Math.random() * 1000)}`,
      nom: data.nom || '',
      prenom: data.prenom || '',
      email: data.email || '',
      telephone: data.telephone || '',
      poste: data.poste || 'technicien',
      departement: data.departement || '',
      status: data.status || 'actif',
      dateEmbauche: new Date().toISOString().split('T')[0],
      salaire: data.salaire || 0,
      evaluation: 3.0,
      competences: data.competences || [],
      isSPOF: false,
      riskScore: 0,
      projetsActifs: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  formatMontant(montant: number): string {
    if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(2)} M`;
    if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
    return montant.toString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const employesApiService = new EmployesApiService();

