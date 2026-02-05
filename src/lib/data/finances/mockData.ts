/**
 * Mock Data pour le module Finances
 * Données réalistes pour développement et tests
 */

export interface Transaction {
  id: string;
  type: 'revenue' | 'expense' | 'transfer';
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'overdue';
  client?: string;
  project?: string;
  bureau: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  attachments?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  clientEmail: string;
  project: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  amountPaid: number;
  bureau: string;
  notes?: string;
  termsConditions?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  bureau: string;
  project?: string;
  allocated: number;
  consumed: number;
  remaining: number;
  percentage: number;
  period: string;
  startDate: string;
  endDate: string;
  status: 'within' | 'warning' | 'exceeded';
  breakdown: BudgetBreakdown[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetBreakdown {
  month: string;
  allocated: number;
  consumed: number;
  percentage: number;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: string;
  reference: string;
  date: string;
  notes?: string;
  processedBy: string;
  createdAt: string;
}

// ================================
// MOCK TRANSACTIONS
// ================================
export const mockTransactions: Transaction[] = [
  {
    id: 'TRX-2025-001',
    type: 'revenue',
    category: 'Facturation',
    description: 'Paiement Client Alpha - Construction Siège Social',
    amount: 450000000,
    currency: 'XOF',
    date: '2025-01-15',
    status: 'completed',
    client: 'Alpha Corporation',
    project: 'PROJ-2024-045',
    bureau: 'BTP',
    paymentMethod: 'Virement bancaire',
    reference: 'VIR-2025-001',
    notes: 'Paiement reçu suite à facture FAC-2024-312',
    createdBy: 'Marie Diallo',
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 'TRX-2025-002',
    type: 'expense',
    category: 'Achats',
    description: 'Achat matériaux construction - Chantier A',
    amount: 85000000,
    currency: 'XOF',
    date: '2025-01-14',
    status: 'approved',
    project: 'PROJ-2024-045',
    bureau: 'BTP',
    paymentMethod: 'Chèque',
    reference: 'CHQ-2025-008',
    notes: 'Ciment, fer à béton, agrégats',
    createdBy: 'Jean Kouassi',
    createdAt: '2025-01-14T08:15:00Z',
    updatedAt: '2025-01-14T14:20:00Z',
  },
  {
    id: 'TRX-2025-003',
    type: 'revenue',
    category: 'Acompte',
    description: 'Acompte 30% - Projet Beta Rénovation',
    amount: 125000000,
    currency: 'XOF',
    date: '2025-01-12',
    status: 'pending',
    client: 'Beta Industries',
    project: 'PROJ-2025-003',
    bureau: 'BJ',
    paymentMethod: 'Virement bancaire',
    reference: 'PENDING-001',
    notes: 'En attente de confirmation bancaire',
    createdBy: 'Fatou Sow',
    createdAt: '2025-01-12T16:45:00Z',
    updatedAt: '2025-01-12T16:45:00Z',
  },
  {
    id: 'TRX-2025-004',
    type: 'expense',
    category: 'Salaires',
    description: 'Salaires Janvier 2025 - Personnel BTP',
    amount: 320000000,
    currency: 'XOF',
    date: '2025-01-01',
    status: 'completed',
    bureau: 'BTP',
    paymentMethod: 'Virement multiple',
    reference: 'SAL-2025-01',
    notes: '45 employés',
    createdBy: 'RH Service',
    createdAt: '2025-01-01T06:00:00Z',
    updatedAt: '2025-01-01T06:00:00Z',
  },
  {
    id: 'TRX-2025-005',
    type: 'expense',
    category: 'Équipement',
    description: 'Location équipement lourd - Excavatrice',
    amount: 45000000,
    currency: 'XOF',
    date: '2025-01-10',
    status: 'approved',
    project: 'PROJ-2024-045',
    bureau: 'BTP',
    paymentMethod: 'Virement bancaire',
    reference: 'VIR-2025-015',
    notes: 'Location mensuelle',
    createdBy: 'Jean Kouassi',
    createdAt: '2025-01-10T09:30:00Z',
    updatedAt: '2025-01-10T11:45:00Z',
  },
  {
    id: 'TRX-2024-456',
    type: 'revenue',
    category: 'Facturation',
    description: 'Solde final - Projet Gamma Extension',
    amount: 890000000,
    currency: 'XOF',
    date: '2024-12-28',
    status: 'overdue',
    client: 'Gamma Corp',
    project: 'PROJ-2024-021',
    bureau: 'BTP',
    paymentMethod: 'Virement bancaire',
    reference: 'FAC-2024-289',
    notes: 'En retard de 18 jours',
    createdBy: 'Marie Diallo',
    createdAt: '2024-12-28T14:20:00Z',
    updatedAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'TRX-2025-006',
    type: 'expense',
    category: 'Services',
    description: 'Consulting technique - Expert structure',
    amount: 28000000,
    currency: 'XOF',
    date: '2025-01-08',
    status: 'pending',
    project: 'PROJ-2025-003',
    bureau: 'BJ',
    paymentMethod: 'Virement bancaire',
    reference: 'PEND-006',
    notes: 'En attente approbation DAF',
    createdBy: 'Fatou Sow',
    createdAt: '2025-01-08T11:20:00Z',
    updatedAt: '2025-01-08T11:20:00Z',
  },
  {
    id: 'TRX-2025-007',
    type: 'transfer',
    category: 'Transfert interne',
    description: 'Transfert BTP vers BS - Projet commun',
    amount: 150000000,
    currency: 'XOF',
    date: '2025-01-14',
    status: 'completed',
    bureau: 'BTP',
    paymentMethod: 'Virement interne',
    reference: 'TRF-INT-001',
    notes: 'Financement projet inter-bureau',
    createdBy: 'DAF',
    createdAt: '2025-01-14T15:30:00Z',
    updatedAt: '2025-01-14T15:30:00Z',
  },
];

// ================================
// MOCK INVOICES
// ================================
export const mockInvoices: Invoice[] = [
  {
    id: 'INV-2025-001',
    invoiceNumber: 'FAC-2025-001',
    client: 'Alpha Corporation',
    clientEmail: 'finance@alphacorp.com',
    project: 'PROJ-2024-045',
    items: [
      {
        id: '1',
        description: 'Fondations et gros œuvre',
        quantity: 1,
        unitPrice: 250000000,
        total: 250000000,
      },
      {
        id: '2',
        description: 'Maçonnerie et finitions',
        quantity: 1,
        unitPrice: 150000000,
        total: 150000000,
      },
      {
        id: '3',
        description: 'Installation électrique',
        quantity: 1,
        unitPrice: 50000000,
        total: 50000000,
      },
    ],
    subtotal: 450000000,
    tax: 0,
    total: 450000000,
    currency: 'XOF',
    issueDate: '2025-01-10',
    dueDate: '2025-02-10',
    status: 'sent',
    paymentStatus: 'paid',
    amountPaid: 450000000,
    bureau: 'BTP',
    notes: 'Merci pour votre confiance',
    termsConditions: 'Paiement sous 30 jours. Pénalités de retard: 1% par mois.',
    createdBy: 'Marie Diallo',
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 'INV-2025-002',
    invoiceNumber: 'FAC-2025-002',
    client: 'Beta Industries',
    clientEmail: 'compta@betaind.com',
    project: 'PROJ-2025-003',
    items: [
      {
        id: '1',
        description: 'Acompte 30% - Rénovation complète',
        quantity: 1,
        unitPrice: 125000000,
        total: 125000000,
      },
    ],
    subtotal: 125000000,
    tax: 0,
    total: 125000000,
    currency: 'XOF',
    issueDate: '2025-01-12',
    dueDate: '2025-01-27',
    status: 'sent',
    paymentStatus: 'unpaid',
    amountPaid: 0,
    bureau: 'BJ',
    notes: 'Premier versement du projet',
    termsConditions: 'Paiement sous 15 jours.',
    createdBy: 'Fatou Sow',
    createdAt: '2025-01-12T14:00:00Z',
    updatedAt: '2025-01-12T14:00:00Z',
  },
  {
    id: 'INV-2024-289',
    invoiceNumber: 'FAC-2024-289',
    client: 'Gamma Corp',
    clientEmail: 'payments@gammacorp.com',
    project: 'PROJ-2024-021',
    items: [
      {
        id: '1',
        description: 'Solde final - Extension usine',
        quantity: 1,
        unitPrice: 890000000,
        total: 890000000,
      },
    ],
    subtotal: 890000000,
    tax: 0,
    total: 890000000,
    currency: 'XOF',
    issueDate: '2024-12-15',
    dueDate: '2024-12-30',
    status: 'overdue',
    paymentStatus: 'unpaid',
    amountPaid: 0,
    bureau: 'BTP',
    notes: 'RELANCE: Paiement en retard',
    termsConditions: 'Paiement sous 15 jours. Pénalités de retard appliquées.',
    createdBy: 'Marie Diallo',
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'INV-2025-003',
    invoiceNumber: 'FAC-2025-003',
    client: 'Delta Services',
    clientEmail: 'admin@deltaservices.com',
    project: 'PROJ-2025-008',
    items: [
      {
        id: '1',
        description: 'Maintenance préventive - Trimestre 1',
        quantity: 3,
        unitPrice: 12000000,
        total: 36000000,
      },
    ],
    subtotal: 36000000,
    tax: 0,
    total: 36000000,
    currency: 'XOF',
    issueDate: '2025-01-05',
    dueDate: '2025-02-05',
    status: 'sent',
    paymentStatus: 'partial',
    amountPaid: 12000000,
    bureau: 'BJ',
    notes: 'Contrat de maintenance annuel',
    termsConditions: 'Paiement mensuel',
    createdBy: 'Fatou Sow',
    createdAt: '2025-01-05T08:30:00Z',
    updatedAt: '2025-01-10T12:00:00Z',
  },
];

// ================================
// MOCK BUDGETS
// ================================
export const mockBudgets: Budget[] = [
  {
    id: 'BDG-2025-001',
    name: 'Budget Opérationnel 2025',
    category: 'Opérationnel',
    bureau: 'BTP',
    allocated: 5000000000,
    consumed: 3200000000,
    remaining: 1800000000,
    percentage: 64,
    period: 'Q1-2025',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    status: 'within',
    breakdown: [
      { month: 'Janvier', allocated: 1666666667, consumed: 1200000000, percentage: 72 },
      { month: 'Février', allocated: 1666666667, consumed: 1100000000, percentage: 66 },
      { month: 'Mars', allocated: 1666666666, consumed: 900000000, percentage: 54 },
    ],
    createdBy: 'DAF',
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2025-01-15T18:00:00Z',
  },
  {
    id: 'BDG-2025-002',
    name: 'Budget Projets Infrastructure',
    category: 'Projets',
    bureau: 'BTP',
    allocated: 8000000000,
    consumed: 7200000000,
    remaining: 800000000,
    percentage: 90,
    period: 'Q1-2025',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    status: 'warning',
    breakdown: [
      { month: 'Janvier', allocated: 2666666667, consumed: 2500000000, percentage: 94 },
      { month: 'Février', allocated: 2666666667, consumed: 2400000000, percentage: 90 },
      { month: 'Mars', allocated: 2666666666, consumed: 2300000000, percentage: 86 },
    ],
    createdBy: 'DAF',
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2025-01-15T18:00:00Z',
  },
  {
    id: 'BDG-2025-003',
    name: 'Budget Ressources Humaines',
    category: 'RH',
    bureau: 'Tous',
    allocated: 2000000000,
    consumed: 2100000000,
    remaining: -100000000,
    percentage: 105,
    period: 'Q1-2025',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    status: 'exceeded',
    breakdown: [
      { month: 'Janvier', allocated: 666666667, consumed: 700000000, percentage: 105 },
      { month: 'Février', allocated: 666666667, consumed: 700000000, percentage: 105 },
      { month: 'Mars', allocated: 666666666, consumed: 700000000, percentage: 105 },
    ],
    createdBy: 'DAF',
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2025-01-15T18:00:00Z',
  },
  {
    id: 'BDG-2025-004',
    name: 'Budget Marketing & Communication',
    category: 'Marketing',
    bureau: 'Tous',
    allocated: 500000000,
    consumed: 280000000,
    remaining: 220000000,
    percentage: 56,
    period: 'Q1-2025',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    status: 'within',
    breakdown: [
      { month: 'Janvier', allocated: 166666667, consumed: 100000000, percentage: 60 },
      { month: 'Février', allocated: 166666667, consumed: 90000000, percentage: 54 },
      { month: 'Mars', allocated: 166666666, consumed: 90000000, percentage: 54 },
    ],
    createdBy: 'DAF',
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2025-01-15T18:00:00Z',
  },
  {
    id: 'BDG-2025-005',
    name: 'Budget Maintenance & Équipement',
    category: 'Équipement',
    bureau: 'BTP',
    allocated: 1200000000,
    consumed: 650000000,
    remaining: 550000000,
    percentage: 54,
    period: 'Q1-2025',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    status: 'within',
    breakdown: [
      { month: 'Janvier', allocated: 400000000, consumed: 250000000, percentage: 63 },
      { month: 'Février', allocated: 400000000, consumed: 200000000, percentage: 50 },
      { month: 'Mars', allocated: 400000000, consumed: 200000000, percentage: 50 },
    ],
    createdBy: 'DAF',
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2025-01-15T18:00:00Z',
  },
];

// ================================
// MOCK PAYMENT RECORDS
// ================================
export const mockPaymentRecords: PaymentRecord[] = [
  {
    id: 'PAY-2025-001',
    invoiceId: 'INV-2025-001',
    amount: 450000000,
    currency: 'XOF',
    method: 'Virement bancaire',
    reference: 'VIR-2025-001',
    date: '2025-01-15',
    notes: 'Paiement intégral reçu',
    processedBy: 'Marie Diallo',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 'PAY-2025-002',
    invoiceId: 'INV-2025-003',
    amount: 12000000,
    currency: 'XOF',
    method: 'Virement bancaire',
    reference: 'VIR-2025-008',
    date: '2025-01-10',
    notes: 'Premier paiement mensuel',
    processedBy: 'Fatou Sow',
    createdAt: '2025-01-10T12:00:00Z',
  },
];

// ================================
// HELPER FUNCTIONS
// ================================
export function getTransactionById(id: string): Transaction | undefined {
  return mockTransactions.find((t) => t.id === id);
}

export function getInvoiceById(id: string): Invoice | undefined {
  return mockInvoices.find((i) => i.id === id);
}

export function getBudgetById(id: string): Budget | undefined {
  return mockBudgets.find((b) => b.id === id);
}

export function getTransactionsByType(type: Transaction['type']): Transaction[] {
  return mockTransactions.filter((t) => t.type === type);
}

export function getTransactionsByStatus(status: Transaction['status']): Transaction[] {
  return mockTransactions.filter((t) => t.status === status);
}

export function getInvoicesByStatus(status: Invoice['status']): Invoice[] {
  return mockInvoices.filter((i) => i.status === status);
}

export function getBudgetsByStatus(status: Budget['status']): Budget[] {
  return mockBudgets.filter((b) => b.status === status);
}

export function getTotalRevenue(): number {
  return mockTransactions
    .filter((t) => t.type === 'revenue' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpenses(): number {
  return mockTransactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getPendingAmount(): number {
  return mockTransactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getOverdueAmount(): number {
  return mockInvoices
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + (i.total - i.amountPaid), 0);
}

