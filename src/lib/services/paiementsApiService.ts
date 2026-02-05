/**
 * ====================================================================
 * SERVICE: API Validation Paiements
 * ====================================================================
 */

import type { PaiementFilter, PaiementDecisionEntry } from '@/lib/stores/paiementsWorkspaceStore';
import type { PaiementsActiveFilters } from '@/components/features/bmo/workspace/paiements';

export interface Paiement {
  id: string;
  reference: string;
  type: 'facture' | 'acompte' | 'solde' | 'avance' | 'retenue' | 'avoir';
  fournisseur: {
    id: string;
    name: string;
    rib: string;
    contact: string;
  };
  montant: number;
  devise: string;
  dateFacture: string;
  dateEcheance: string;
  dateReception: string;
  status: 'pending' | 'validated' | 'rejected' | 'scheduled' | 'paid' | 'blocked';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  bureau: string;
  responsible: string;
  projet?: string;
  contratRef?: string;
  bcRef?: string;
  description: string;
  justificatifs: { id: string; name: string; type: string; uploadedAt: string }[];
  validations: {
    comptable: boolean;
    financier: boolean;
    direction: boolean;
  };
  historique: { at: string; action: string; by: string; details: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface PaiementsStats {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  scheduled: number;
  paid: number;
  blocked: number;
  totalMontant: number;
  avgMontant: number;
  byUrgency: Record<string, number>;
  byType: Record<string, number>;
  tresorerieDisponible: number;
  echeancesJ7: number;
  echeancesJ30: number;
  ts: string;
}

// Mock data
const MOCK_PAIEMENTS: Paiement[] = [
  {
    id: 'PAY-2024-001',
    reference: 'FAC-2024-001',
    type: 'facture',
    fournisseur: { id: 'FRN-001', name: 'SOGEA SATOM', rib: 'SN001234567890', contact: 'M. Diop' },
    montant: 125000000,
    devise: 'FCFA',
    dateFacture: '2024-01-10',
    dateEcheance: '2024-02-10',
    dateReception: '2024-01-12',
    status: 'pending',
    urgency: 'critical',
    bureau: 'DF',
    responsible: 'Mme FALL',
    projet: 'PRJ-2024-001',
    contratRef: 'CTR-2024-001',
    description: 'Situation n°3 - Travaux de fondation',
    justificatifs: [
      { id: 'DOC-1', name: 'Facture_FAC-2024-001.pdf', type: 'pdf', uploadedAt: '2024-01-12T10:00:00Z' },
      { id: 'DOC-2', name: 'Attachement_situation3.xlsx', type: 'xlsx', uploadedAt: '2024-01-12T10:05:00Z' },
    ],
    validations: { comptable: true, financier: false, direction: false },
    historique: [
      { at: '2024-01-12T10:00:00Z', action: 'reception', by: 'Comptabilité', details: 'Réception facture' },
      { at: '2024-01-13T14:00:00Z', action: 'validation', by: 'Comptabilité', details: 'Validation comptable OK' },
    ],
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-13T14:00:00Z',
  },
  {
    id: 'PAY-2024-002',
    reference: 'FAC-2024-002',
    type: 'facture',
    fournisseur: { id: 'FRN-002', name: 'MATFORCE', rib: 'SN009876543210', contact: 'Mme Sarr' },
    montant: 45000000,
    devise: 'FCFA',
    dateFacture: '2024-01-08',
    dateEcheance: '2024-01-25',
    dateReception: '2024-01-10',
    status: 'pending',
    urgency: 'high',
    bureau: 'DF',
    responsible: 'Mme FALL',
    bcRef: 'BC-2024-015',
    description: 'Fourniture matériaux - Lot ferraillage',
    justificatifs: [
      { id: 'DOC-3', name: 'Facture_FAC-2024-002.pdf', type: 'pdf', uploadedAt: '2024-01-10T09:00:00Z' },
    ],
    validations: { comptable: true, financier: true, direction: false },
    historique: [
      { at: '2024-01-10T09:00:00Z', action: 'reception', by: 'Comptabilité', details: 'Réception facture' },
    ],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
  },
  {
    id: 'PAY-2024-003',
    reference: 'AV-2024-001',
    type: 'avance',
    fournisseur: { id: 'FRN-003', name: 'ELEC AFRIQUE', rib: 'SN001122334455', contact: 'M. Mbaye' },
    montant: 89000000,
    devise: 'FCFA',
    dateFacture: '2024-01-15',
    dateEcheance: '2024-01-22',
    dateReception: '2024-01-15',
    status: 'pending',
    urgency: 'medium',
    bureau: 'DF',
    responsible: 'M. NDIAYE',
    contratRef: 'CTR-2024-005',
    description: 'Avance démarrage - Lot électricité',
    justificatifs: [],
    validations: { comptable: false, financier: false, direction: false },
    historique: [
      { at: '2024-01-15T11:00:00Z', action: 'reception', by: 'DF', details: 'Demande d\'avance reçue' },
    ],
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: 'PAY-2024-004',
    reference: 'FAC-2024-003',
    type: 'facture',
    fournisseur: { id: 'FRN-004', name: 'SENELEC', rib: 'SN005566778899', contact: 'Service entreprises' },
    montant: 8500000,
    devise: 'FCFA',
    dateFacture: '2024-01-01',
    dateEcheance: '2024-01-31',
    dateReception: '2024-01-05',
    status: 'validated',
    urgency: 'low',
    bureau: 'DAF',
    responsible: 'M. BA',
    description: 'Facture électricité - Sites industriels - Janvier',
    justificatifs: [
      { id: 'DOC-4', name: 'Facture_SENELEC_Jan.pdf', type: 'pdf', uploadedAt: '2024-01-05T08:00:00Z' },
    ],
    validations: { comptable: true, financier: true, direction: true },
    historique: [
      { at: '2024-01-05T08:00:00Z', action: 'reception', by: 'DAF', details: 'Réception facture' },
      { at: '2024-01-10T16:00:00Z', action: 'validation', by: 'DG', details: 'Validation définitive' },
    ],
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-10T16:00:00Z',
  },
  {
    id: 'PAY-2024-005',
    reference: 'FAC-2024-004',
    type: 'solde',
    fournisseur: { id: 'FRN-005', name: 'CSE BTP', rib: 'SN002233445566', contact: 'M. Fall' },
    montant: 320000000,
    devise: 'FCFA',
    dateFacture: '2024-01-18',
    dateEcheance: '2024-02-18',
    dateReception: '2024-01-19',
    status: 'blocked',
    urgency: 'critical',
    bureau: 'DF',
    responsible: 'Mme FALL',
    projet: 'PRJ-2023-008',
    contratRef: 'CTR-2023-012',
    description: 'Solde de tout compte - Projet Autoroute Mbour',
    justificatifs: [
      { id: 'DOC-5', name: 'DGD_Final.pdf', type: 'pdf', uploadedAt: '2024-01-19T10:00:00Z' },
      { id: 'DOC-6', name: 'PV_Reception.pdf', type: 'pdf', uploadedAt: '2024-01-19T10:05:00Z' },
    ],
    validations: { comptable: true, financier: false, direction: false },
    historique: [
      { at: '2024-01-19T10:00:00Z', action: 'reception', by: 'DF', details: 'Réception demande solde' },
      { at: '2024-01-20T09:00:00Z', action: 'blocage', by: 'DF', details: 'Blocage - Réserves non levées' },
    ],
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function formatMontant(montant: number): string {
  if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(1)} Md`;
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(0)} M`;
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
  return montant.toLocaleString('fr-FR');
}

export const paiementsApiService = {
  async getAll(filter?: PaiementFilter, sortBy?: string, page = 1, limit = 20): Promise<{
    data: Paiement[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await delay(300);
    let data = [...MOCK_PAIEMENTS];

    // Filtres simples (ancien format)
    if (filter?.status) data = data.filter(p => p.status === filter.status);
    if (filter?.urgency) data = data.filter(p => p.urgency === filter.urgency);
    if (filter?.fournisseur) {
      data = data.filter(p => p.fournisseur.name.toLowerCase().includes(filter.fournisseur!.toLowerCase()));
    }
    if (filter?.minMontant) data = data.filter(p => p.montant >= filter.minMontant!);
    if (filter?.maxMontant) data = data.filter(p => p.montant <= filter.maxMontant!);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      data = data.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.fournisseur.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'montant') data.sort((a, b) => b.montant - a.montant);
    else if (sortBy === 'urgency') {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      data.sort((a, b) => order[a.urgency] - order[b.urgency]);
    } else if (sortBy === 'echeance') {
      data.sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime());
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },

  /**
   * Nouvelle méthode: Applique les filtres avancés (PaiementsActiveFilters)
   */
  async getAllWithAdvancedFilters(
    filters: PaiementsActiveFilters,
    sortBy?: string,
    page = 1,
    limit = 20
  ): Promise<{
    data: Paiement[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await delay(300);
    let data = [...MOCK_PAIEMENTS];

    // Urgence (multi-sélection)
    if (filters.urgency && filters.urgency.length > 0) {
      data = data.filter(p => filters.urgency.includes(p.urgency));
    }

    // Bureaux (multi-sélection)
    if (filters.bureaux && filters.bureaux.length > 0) {
      data = data.filter(p => filters.bureaux.includes(p.bureau));
    }

    // Types de paiement (multi-sélection)
    if (filters.types && filters.types.length > 0) {
      data = data.filter(p => filters.types.includes(p.type));
    }

    // Statut (multi-sélection)
    if (filters.status && filters.status.length > 0) {
      data = data.filter(p => filters.status.includes(p.status));
    }

    // Montant (range)
    if (filters.amountRange?.min !== undefined) {
      data = data.filter(p => p.montant >= filters.amountRange.min!);
    }
    if (filters.amountRange?.max !== undefined) {
      data = data.filter(p => p.montant <= filters.amountRange.max!);
    }

    // Date range (échéance)
    if (filters.dateRange?.start) {
      data = data.filter(p => new Date(p.dateEcheance) >= new Date(filters.dateRange!.start));
    }
    if (filters.dateRange?.end) {
      data = data.filter(p => new Date(p.dateEcheance) <= new Date(filters.dateRange!.end));
    }

    // Fournisseurs (multi-sélection)
    if (filters.fournisseurs && filters.fournisseurs.length > 0) {
      data = data.filter(p => filters.fournisseurs!.includes(p.fournisseur.id));
    }

    // Responsables (multi-sélection)
    if (filters.responsables && filters.responsables.length > 0) {
      data = data.filter(p => filters.responsables!.includes(p.responsible));
    }

    // Tri
    if (sortBy === 'montant') data.sort((a, b) => b.montant - a.montant);
    else if (sortBy === 'urgency') {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      data.sort((a, b) => order[a.urgency] - order[b.urgency]);
    } else if (sortBy === 'echeance') {
      data.sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime());
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, totalPages };
  },

  async getById(id: string): Promise<Paiement | undefined> {
    await delay(200);
    return MOCK_PAIEMENTS.find(p => p.id === id);
  },

  async getStats(): Promise<PaiementsStats> {
    await delay(250);
    const pending = MOCK_PAIEMENTS.filter(p => p.status === 'pending').length;
    const validated = MOCK_PAIEMENTS.filter(p => p.status === 'validated').length;
    const rejected = MOCK_PAIEMENTS.filter(p => p.status === 'rejected').length;
    const scheduled = MOCK_PAIEMENTS.filter(p => p.status === 'scheduled').length;
    const paid = MOCK_PAIEMENTS.filter(p => p.status === 'paid').length;
    const blocked = MOCK_PAIEMENTS.filter(p => p.status === 'blocked').length;

    const byUrgency: Record<string, number> = {};
    const byType: Record<string, number> = {};
    MOCK_PAIEMENTS.forEach(p => {
      byUrgency[p.urgency] = (byUrgency[p.urgency] || 0) + 1;
      byType[p.type] = (byType[p.type] || 0) + 1;
    });

    const totalMontant = MOCK_PAIEMENTS.reduce((acc, p) => acc + p.montant, 0);

    return {
      total: MOCK_PAIEMENTS.length,
      pending,
      validated,
      rejected,
      scheduled,
      paid,
      blocked,
      totalMontant,
      avgMontant: totalMontant / MOCK_PAIEMENTS.length,
      byUrgency,
      byType,
      tresorerieDisponible: 850000000,
      echeancesJ7: 2,
      echeancesJ30: 4,
      ts: new Date().toISOString(),
    };
  },

  async validatePaiement(
    paiementId: string,
    notes: string,
    userId: string,
    userName: string,
    userRole: string
  ): Promise<PaiementDecisionEntry> {
    await delay(500);
    const paiement = await this.getById(paiementId);
    if (!paiement) throw new Error('Paiement not found');

    const payload = { paiementId, action: 'validation', notes, userId, userName, userRole, at: new Date().toISOString() };
    const hash = await sha256Hex(JSON.stringify(payload));

    return {
      id: `DEC-${Date.now()}`,
      at: new Date().toISOString(),
      action: 'validation',
      paiementId,
      paiementRef: paiement.reference,
      fournisseur: paiement.fournisseur.name,
      montant: paiement.montant,
      userId,
      userName,
      userRole,
      details: `Validation paiement: ${notes}`,
      hash: `SHA-256:${hash}`,
    };
  },

  async rejectPaiement(
    paiementId: string,
    reason: string,
    userId: string,
    userName: string,
    userRole: string
  ): Promise<PaiementDecisionEntry> {
    await delay(500);
    const paiement = await this.getById(paiementId);
    if (!paiement) throw new Error('Paiement not found');

    const payload = { paiementId, action: 'rejet', reason, userId, userName, userRole, at: new Date().toISOString() };
    const hash = await sha256Hex(JSON.stringify(payload));

    return {
      id: `DEC-${Date.now()}`,
      at: new Date().toISOString(),
      action: 'rejet',
      paiementId,
      paiementRef: paiement.reference,
      fournisseur: paiement.fournisseur.name,
      montant: paiement.montant,
      userId,
      userName,
      userRole,
      details: `Rejet paiement: ${reason}`,
      hash: `SHA-256:${hash}`,
    };
  },

  async schedulePaiement(
    paiementId: string,
    dateExecution: string,
    userId: string,
    userName: string,
    userRole: string
  ): Promise<PaiementDecisionEntry> {
    await delay(500);
    const paiement = await this.getById(paiementId);
    if (!paiement) throw new Error('Paiement not found');

    const payload = { paiementId, action: 'report', dateExecution, userId, userName, userRole, at: new Date().toISOString() };
    const hash = await sha256Hex(JSON.stringify(payload));

    return {
      id: `DEC-${Date.now()}`,
      at: new Date().toISOString(),
      action: 'report',
      paiementId,
      paiementRef: paiement.reference,
      fournisseur: paiement.fournisseur.name,
      montant: paiement.montant,
      userId,
      userName,
      userRole,
      details: `Paiement planifié pour le ${new Date(dateExecution).toLocaleDateString('fr-FR')}`,
      hash: `SHA-256:${hash}`,
    };
  },

  async bulkValidate(
    paiementIds: string[],
    notes: string,
    userId: string,
    userName: string,
    userRole: string
  ): Promise<PaiementDecisionEntry[]> {
    await delay(1000);
    const decisions: PaiementDecisionEntry[] = [];
    const batchId = `BATCH-VAL-${Date.now()}`;

    for (const paiementId of paiementIds) {
      const paiement = await this.getById(paiementId);
      if (paiement) {
        const payload = { batchId, paiementId, action: 'validation', notes, userId, userName, userRole, at: new Date().toISOString() };
        const hash = await sha256Hex(JSON.stringify(payload));
        decisions.push({
          id: `DEC-${Date.now()}-${paiementId}`,
          at: new Date().toISOString(),
          action: 'validation',
          paiementId,
          paiementRef: paiement.reference,
          fournisseur: paiement.fournisseur.name,
          montant: paiement.montant,
          userId,
          userName,
          userRole,
          details: `Validation en lot (${batchId}): ${notes}`,
          hash: `SHA-256:${hash}`,
          batchId,
        });
      }
    }
    return decisions;
  },

  async exportData(format: 'json' | 'csv', filter?: PaiementFilter): Promise<Blob> {
    await delay(500);
    const { data } = await this.getAll(filter, undefined, 1, 1000);
    
    if (format === 'json') {
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    }
    
    const headers = ['ID', 'Référence', 'Type', 'Fournisseur', 'Montant', 'Échéance', 'Statut', 'Urgence'];
    const rows = data.map(p => [
      p.id, p.reference, p.type, p.fournisseur.name, p.montant, p.dateEcheance, p.status, p.urgency
    ].join(','));
    return new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
  },

  formatMontant,

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      validated: 'Validé',
      rejected: 'Rejeté',
      scheduled: 'Planifié',
      paid: 'Payé',
      blocked: 'Bloqué',
    };
    return labels[status] || status;
  },

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      facture: 'Facture',
      acompte: 'Acompte',
      solde: 'Solde',
      avance: 'Avance',
      retenue: 'Retenue',
      avoir: 'Avoir',
    };
    return labels[type] || type;
  },
};

