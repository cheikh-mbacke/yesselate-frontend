/**
 * SERVICE: API Employés - Pattern Pilotage
 */
import type { EmployesFilter } from '@/lib/stores/employesWorkspaceStore';

export interface Employe {
  id: string; matricule: string; name: string; poste: string; bureau: string; email?: string; phone?: string;
  status: 'actif' | 'conges' | 'mission' | 'absent' | 'inactif';
  contrat: 'CDI' | 'CDD'; dateEmbauche: string; dateFinContrat?: string;
  salaire: number; congesRestants: number; spof: boolean; scoreEvaluation?: number;
  competences: string[]; riskScore: number;
}

export interface EmployesStats {
  total: number; actifs: number; enConges: number; enMission: number; absents: number;
  byBureau: Record<string, number>; byContrat: Record<string, number>;
  spofCount: number; salaireTotal: number; avgEvaluation: number; riskCount: number; ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const formatMontant = (m: number): string => m >= 1e6 ? `${(m/1e6).toFixed(0)} M` : m >= 1e3 ? `${(m/1e3).toFixed(0)} K` : m.toLocaleString('fr-FR');

const mockEmployes: Employe[] = [
  { id: 'EMP001', matricule: 'SEN-2020-001', name: 'Jean Dupont', poste: 'Chef de projet', bureau: 'BT', email: 'jdupont@company.sn', status: 'actif', contrat: 'CDI', dateEmbauche: '2020-03-15', salaire: 1_200_000, congesRestants: 18, spof: true, scoreEvaluation: 4.2, competences: ['Gestion projet', 'BTP', 'CAO'], riskScore: 45 },
  { id: 'EMP002', matricule: 'SEN-2021-015', name: 'Marie Claire', poste: 'Comptable senior', bureau: 'DAF', status: 'actif', contrat: 'CDI', dateEmbauche: '2021-06-01', salaire: 950_000, congesRestants: 22, spof: false, scoreEvaluation: 4.5, competences: ['Comptabilité', 'Fiscalité'], riskScore: 15 },
  { id: 'EMP003', matricule: 'SEN-2022-008', name: 'Paul Martin', poste: 'Ingénieur études', bureau: 'BT', status: 'conges', contrat: 'CDI', dateEmbauche: '2022-01-10', salaire: 1_100_000, congesRestants: 5, spof: true, scoreEvaluation: 3.8, competences: ['Calcul structures', 'Béton'], riskScore: 55 },
  { id: 'EMP004', matricule: 'SEN-2023-022', name: 'Sophie Diallo', poste: 'Assistante RH', bureau: 'RH', status: 'actif', contrat: 'CDD', dateEmbauche: '2023-09-01', dateFinContrat: '2026-03-01', salaire: 650_000, congesRestants: 12, spof: false, scoreEvaluation: 4.0, competences: ['Paie', 'Recrutement'], riskScore: 30 },
  { id: 'EMP005', matricule: 'SEN-2019-003', name: 'Ahmed Koné', poste: 'Directeur technique', bureau: 'BMO', status: 'mission', contrat: 'CDI', dateEmbauche: '2019-01-02', salaire: 2_500_000, congesRestants: 8, spof: true, scoreEvaluation: 4.8, competences: ['Direction', 'Stratégie', 'BTP'], riskScore: 70 },
  { id: 'EMP006', matricule: 'SEN-2024-001', name: 'Fatou Sow', poste: 'Juriste', bureau: 'BJ', status: 'actif', contrat: 'CDD', dateEmbauche: '2024-02-15', dateFinContrat: '2026-02-15', salaire: 800_000, congesRestants: 20, spof: false, scoreEvaluation: 3.9, competences: ['Droit contrats', 'Contentieux'], riskScore: 25 },
];

export const employesApiService = {
  async getAll(filter?: EmployesFilter, sortBy?: string, page = 1, limit = 20): Promise<{ data: Employe[]; total: number; page: number; totalPages: number }> {
    await delay(300);
    let data = [...mockEmployes];
    if (filter?.status) data = data.filter(e => e.status === filter.status);
    if (filter?.bureau) data = data.filter(e => e.bureau === filter.bureau);
    if (filter?.contrat) data = data.filter(e => e.contrat === filter.contrat);
    if (filter?.spof) data = data.filter(e => e.spof);
    if (filter?.search) { const q = filter.search.toLowerCase(); data = data.filter(e => e.name.toLowerCase().includes(q) || e.matricule.toLowerCase().includes(q) || e.poste.toLowerCase().includes(q)); }
    if (sortBy === 'risk') data.sort((a, b) => b.riskScore - a.riskScore);
    else if (sortBy === 'salary') data.sort((a, b) => b.salaire - a.salaire);
    const total = data.length; const totalPages = Math.ceil(total / limit); const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },
  async getById(id: string): Promise<Employe | undefined> { await delay(200); return mockEmployes.find(e => e.id === id); },
  async getStats(): Promise<EmployesStats> {
    await delay(250);
    const data = mockEmployes;
    const actifs = data.filter(e => e.status === 'actif').length;
    const enConges = data.filter(e => e.status === 'conges').length;
    const enMission = data.filter(e => e.status === 'mission').length;
    const absents = data.filter(e => e.status === 'absent').length;
    const spofCount = data.filter(e => e.spof).length;
    const riskCount = data.filter(e => e.riskScore > 50).length;
    const salaireTotal = data.reduce((a, e) => a + e.salaire, 0);
    const avgEvaluation = data.reduce((a, e) => a + (e.scoreEvaluation || 0), 0) / data.length;
    const byBureau: Record<string, number> = {}; const byContrat: Record<string, number> = {};
    data.forEach(e => { byBureau[e.bureau] = (byBureau[e.bureau] || 0) + 1; byContrat[e.contrat] = (byContrat[e.contrat] || 0) + 1; });
    return { total: data.length, actifs, enConges, enMission, absents, byBureau, byContrat, spofCount, salaireTotal, avgEvaluation, riskCount, ts: new Date().toISOString() };
  },
  formatMontant,
  getStatusLabel: (s: string): string => ({ actif: 'Actif', conges: 'En congés', mission: 'En mission', absent: 'Absent', inactif: 'Inactif' }[s] || s),
  getStatusColor: (s: string): string => ({ actif: 'emerald', conges: 'blue', mission: 'indigo', absent: 'amber', inactif: 'slate' }[s] || 'slate'),
};

