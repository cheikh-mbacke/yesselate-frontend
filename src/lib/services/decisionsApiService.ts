/**
 * SERVICE: API Décisions - Pattern Pilotage
 */
import type { DecisionsFilter } from '@/lib/stores/decisionsWorkspaceStore';

export interface Decision {
  id: string; ref: string; titre: string; description: string;
  type: 'strategique' | 'operationnel' | 'financier' | 'rh' | 'technique';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'executed';
  niveau: 'dg' | 'direction' | 'bureau' | 'equipe';
  auteur: { id: string; name: string; role: string };
  approbateurs: { id: string; name: string; status: string; date?: string }[];
  dateCreation: string; dateDecision?: string; dateExecution?: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  montantImpact?: number; linkedDossiers?: string[];
}

export interface DecisionsStats {
  total: number; draft: number; pending: number; approved: number; rejected: number; executed: number;
  byType: Record<string, number>; byNiveau: Record<string, number>; byImpact: Record<string, number>;
  criticalPending: number; montantTotal: number; avgApprovalTime: number; ts: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const formatMontant = (m: number): string => m >= 1e9 ? `${(m/1e9).toFixed(1)} Md` : m >= 1e6 ? `${(m/1e6).toFixed(0)} M` : m >= 1e3 ? `${(m/1e3).toFixed(0)} K` : m.toLocaleString('fr-FR');

const mockDecisions: Decision[] = [
  {
    id: 'DEC001',
    ref: 'DEC-2026-001',
    titre: 'Lancement projet infrastructure Alpha',
    description: 'Approbation du démarrage de la phase 1 du projet d\'infrastructure Alpha. Ce projet stratégique vise à moderniser les infrastructures critiques de l\'entreprise avec un budget initial de 2.5 milliards FCFA. La phase 1 comprend la construction de nouveaux bureaux et l\'installation de systèmes de sécurité avancés.',
    type: 'strategique',
    status: 'pending',
    niveau: 'dg',
    auteur: { id: 'EMP001', name: 'Ahmed Koné', role: 'DG' },
    approbateurs: [
      { id: 'CA01', name: 'Conseil d\'Administration', status: 'pending' },
      { id: 'COMEX', name: 'COMEX', status: 'pending' },
    ],
    dateCreation: '2026-01-08',
    impact: 'critical',
    montantImpact: 2_500_000_000,
    linkedDossiers: ['PROJ-ALPHA-001', 'BC-2026-045'],
  },
  {
    id: 'DEC002',
    ref: 'DEC-2026-002',
    titre: 'Recrutement équipe technique',
    description: 'Validation du budget pour le recrutement de 5 ingénieurs seniors spécialisés en infrastructure cloud. Ces profils sont essentiels pour accompagner la transformation digitale de l\'entreprise.',
    type: 'rh',
    status: 'approved',
    niveau: 'direction',
    auteur: { id: 'EMP002', name: 'Marie Claire', role: 'DRH' },
    approbateurs: [
      { id: 'DG', name: 'Direction Générale', status: 'approved', date: '2026-01-09' },
    ],
    dateCreation: '2026-01-05',
    dateDecision: '2026-01-09',
    impact: 'medium',
    montantImpact: 150_000_000,
  },
  {
    id: 'DEC003',
    ref: 'DEC-2026-003',
    titre: 'Changement fournisseur béton',
    description: 'Nouveau partenariat avec un fournisseur de béton suite à la rupture de contrat avec l\'ancien partenaire. Le nouveau fournisseur offre de meilleures conditions tarifaires et une qualité certifiée.',
    type: 'operationnel',
    status: 'executed',
    niveau: 'bureau',
    auteur: { id: 'EMP003', name: 'Paul Martin', role: 'Chef BAP' },
    approbateurs: [{ id: 'DAF', name: 'DAF', status: 'approved', date: '2026-01-07' }],
    dateCreation: '2026-01-03',
    dateDecision: '2026-01-07',
    dateExecution: '2026-01-10',
    impact: 'high',
    linkedDossiers: ['FOURN-2026-012'],
  },
  {
    id: 'DEC004',
    ref: 'DEC-2026-004',
    titre: 'Allocation budget urgence chantier C12',
    description: 'Déblocage de fonds supplémentaires pour des travaux de sécurité urgents sur le chantier C12. Des anomalies structurelles ont été détectées nécessitant une intervention immédiate.',
    type: 'financier',
    status: 'pending',
    niveau: 'dg',
    auteur: { id: 'EMP004', name: 'Sophie Diallo', role: 'DAF' },
    approbateurs: [
      { id: 'DG', name: 'Direction Générale', status: 'pending' },
      { id: 'SECU', name: 'Responsable Sécurité', status: 'pending' },
    ],
    dateCreation: '2026-01-10',
    impact: 'critical',
    montantImpact: 85_000_000,
    linkedDossiers: ['CHAN-C12-2026', 'BC-2026-089'],
  },
  {
    id: 'DEC005',
    ref: 'DEC-2026-005',
    titre: 'Mise à jour procédures qualité',
    description: 'Révision complète des normes ISO pour le projet Beta. Mise à jour des procédures qualité pour se conformer aux nouvelles exigences réglementaires.',
    type: 'technique',
    status: 'draft',
    niveau: 'equipe',
    auteur: { id: 'EMP005', name: 'Jean Dupont', role: 'Ing. Qualité' },
    approbateurs: [],
    dateCreation: '2026-01-09',
    impact: 'low',
  },
  {
    id: 'DEC006',
    ref: 'DEC-2026-006',
    titre: 'Acquisition nouveau matériel BTP',
    description: 'Achat de 3 nouvelles pelleteuses et 2 bulldozers pour renforcer la capacité opérationnelle des équipes terrain. Investissement stratégique pour améliorer la productivité.',
    type: 'operationnel',
    status: 'pending',
    niveau: 'direction',
    auteur: { id: 'EMP006', name: 'Ibrahim Traoré', role: 'Directeur Opérations' },
    approbateurs: [
      { id: 'DAF', name: 'DAF', status: 'pending' },
      { id: 'DG', name: 'Direction Générale', status: 'pending' },
    ],
    dateCreation: '2026-01-11',
    impact: 'high',
    montantImpact: 320_000_000,
    linkedDossiers: ['ACHAT-2026-023'],
  },
  {
    id: 'DEC007',
    ref: 'DEC-2026-007',
    titre: 'Formation équipe sécurité',
    description: 'Programme de formation certifiante pour l\'équipe sécurité sur les nouvelles normes de sécurité incendie et les procédures d\'évacuation.',
    type: 'rh',
    status: 'approved',
    niveau: 'bureau',
    auteur: { id: 'EMP007', name: 'Fatou Sarr', role: 'Responsable Formation' },
    approbateurs: [
      { id: 'DRH', name: 'DRH', status: 'approved', date: '2026-01-08' },
    ],
    dateCreation: '2026-01-07',
    dateDecision: '2026-01-08',
    impact: 'medium',
    montantImpact: 12_000_000,
  },
  {
    id: 'DEC008',
    ref: 'DEC-2026-008',
    titre: 'Renouvellement assurance flotte véhicules',
    description: 'Renouvellement du contrat d\'assurance pour la flotte de 45 véhicules de l\'entreprise. Comparaison de 3 offres et sélection du meilleur rapport qualité/prix.',
    type: 'financier',
    status: 'executed',
    niveau: 'direction',
    auteur: { id: 'EMP008', name: 'Moussa Diop', role: 'Responsable Logistique' },
    approbateurs: [
      { id: 'DAF', name: 'DAF', status: 'approved', date: '2026-01-06' },
    ],
    dateCreation: '2026-01-04',
    dateDecision: '2026-01-06',
    dateExecution: '2026-01-08',
    impact: 'medium',
    montantImpact: 28_000_000,
  },
  {
    id: 'DEC009',
    ref: 'DEC-2026-009',
    titre: 'Déploiement système ERP nouvelle génération',
    description: 'Migration vers un nouveau système ERP pour améliorer la gestion des ressources et optimiser les processus métier. Projet majeur sur 18 mois.',
    type: 'technique',
    status: 'pending',
    niveau: 'dg',
    auteur: { id: 'EMP009', name: 'Aminata Ba', role: 'DSI' },
    approbateurs: [
      { id: 'DG', name: 'Direction Générale', status: 'pending' },
      { id: 'COMEX', name: 'COMEX', status: 'pending' },
    ],
    dateCreation: '2026-01-12',
    impact: 'critical',
    montantImpact: 1_200_000_000,
    linkedDossiers: ['PROJ-ERP-2026', 'BC-2026-156'],
  },
  {
    id: 'DEC010',
    ref: 'DEC-2026-010',
    titre: 'Ouverture nouveau bureau régional',
    description: 'Création d\'un nouveau bureau régional dans la zone Est pour étendre notre présence géographique et mieux servir nos clients locaux.',
    type: 'strategique',
    status: 'pending',
    niveau: 'dg',
    auteur: { id: 'EMP010', name: 'Ousmane Diallo', role: 'Directeur Commercial' },
    approbateurs: [
      { id: 'DG', name: 'Direction Générale', status: 'pending' },
      { id: 'CA01', name: 'Conseil d\'Administration', status: 'pending' },
    ],
    dateCreation: '2026-01-13',
    impact: 'high',
    montantImpact: 450_000_000,
    linkedDossiers: ['PROJ-BUREAU-EST'],
  },
  {
    id: 'DEC011',
    ref: 'DEC-2026-011',
    titre: 'Partenariat stratégique fournisseur électricité',
    description: 'Signature d\'un partenariat avec un nouveau fournisseur d\'électricité pour réduire les coûts énergétiques de 15% sur les 3 prochaines années.',
    type: 'financier',
    status: 'approved',
    niveau: 'direction',
    auteur: { id: 'EMP011', name: 'Kadiatou Camara', role: 'Responsable Achats' },
    approbateurs: [
      { id: 'DAF', name: 'DAF', status: 'approved', date: '2026-01-11' },
    ],
    dateCreation: '2026-01-09',
    dateDecision: '2026-01-11',
    impact: 'high',
    linkedDossiers: ['PART-ELEC-2026'],
  },
  {
    id: 'DEC012',
    ref: 'DEC-2026-012',
    titre: 'Rejet - Modernisation système téléphonie',
    description: 'Projet de modernisation du système téléphonie interne rejeté car jugé non prioritaire compte tenu des autres investissements en cours.',
    type: 'technique',
    status: 'rejected',
    niveau: 'direction',
    auteur: { id: 'EMP012', name: 'Boubacar Sy', role: 'Chef IT' },
    approbateurs: [
      { id: 'DSI', name: 'DSI', status: 'rejected', date: '2026-01-10' },
    ],
    dateCreation: '2026-01-08',
    dateDecision: '2026-01-10',
    impact: 'low',
    montantImpact: 35_000_000,
  },
];

export const decisionsApiService = {
  async getAll(filter?: DecisionsFilter, sortBy?: string, page = 1, limit = 20): Promise<{ data: Decision[]; total: number; page: number; totalPages: number }> {
    await delay(300);
    let data = [...mockDecisions];
    if (filter?.status) data = data.filter(d => d.status === filter.status);
    if (filter?.type) data = data.filter(d => d.type === filter.type);
    if (filter?.niveau) data = data.filter(d => d.niveau === filter.niveau);
    if (filter?.search) { const q = filter.search.toLowerCase(); data = data.filter(d => d.ref.toLowerCase().includes(q) || d.titre.toLowerCase().includes(q)); }
    if (sortBy === 'impact') { const order = { critical: 0, high: 1, medium: 2, low: 3 }; data.sort((a, b) => order[a.impact] - order[b.impact]); }
    const total = data.length; const totalPages = Math.ceil(total / limit); const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },
  async getById(id: string): Promise<Decision | undefined> { await delay(200); return mockDecisions.find(d => d.id === id); },
  async getStats(): Promise<DecisionsStats> {
    await delay(250); const data = mockDecisions;
    const draft = data.filter(d => d.status === 'draft').length;
    const pending = data.filter(d => d.status === 'pending').length;
    const approved = data.filter(d => d.status === 'approved').length;
    const rejected = data.filter(d => d.status === 'rejected').length;
    const executed = data.filter(d => d.status === 'executed').length;
    const criticalPending = data.filter(d => d.status === 'pending' && d.impact === 'critical').length;
    const montantTotal = data.reduce((a, d) => a + (d.montantImpact || 0), 0);
    const byType: Record<string, number> = {}; const byNiveau: Record<string, number> = {}; const byImpact: Record<string, number> = {};
    data.forEach(d => { byType[d.type] = (byType[d.type] || 0) + 1; byNiveau[d.niveau] = (byNiveau[d.niveau] || 0) + 1; byImpact[d.impact] = (byImpact[d.impact] || 0) + 1; });
    return { total: data.length, draft, pending, approved, rejected, executed, byType, byNiveau, byImpact, criticalPending, montantTotal, avgApprovalTime: 48, ts: new Date().toISOString() };
  },
  formatMontant,
  getStatusLabel: (s: string): string => ({ draft: 'Brouillon', pending: 'En attente', approved: 'Approuvée', rejected: 'Rejetée', executed: 'Exécutée' }[s] || s),
  getTypeLabel: (t: string): string => ({ strategique: 'Stratégique', operationnel: 'Opérationnel', financier: 'Financier', rh: 'RH', technique: 'Technique' }[t] || t),
  getNiveauLabel: (n: string): string => ({ dg: 'DG', direction: 'Direction', bureau: 'Bureau', equipe: 'Équipe' }[n] || n),
  getStatusColor: (s: string): string => ({ draft: 'slate', pending: 'amber', approved: 'emerald', rejected: 'red', executed: 'blue' }[s] || 'slate'),
  getImpactColor: (i: string): string => ({ critical: 'red', high: 'amber', medium: 'blue', low: 'slate' }[i] || 'slate'),
};

