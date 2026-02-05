/**
 * Données mockées pour le module Demandes
 * Données réalistes pour développement et tests
 */

import type { Demande, DemandeStats, DemandeTrend, ServiceStats } from '../types/demandesTypes';

// Fonction utilitaire pour générer des IDs
function generateId(prefix: string = 'DEM'): string {
  return `${prefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
}

// Fonction utilitaire pour générer une date aléatoire
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Génération de demandes mockées
export const mockDemandes: Demande[] = [
  // En attente - Achats
  {
    id: generateId('BC'),
    reference: 'BC-2024-0892',
    title: 'BC Fournitures Bureau',
    description: 'Demande d\'achat de fournitures de bureau pour le 1er trimestre',
    status: 'pending',
    priority: 'high',
    service: 'achats',
    montant: 12500000,
    createdBy: 'Mohamed Fall',
    createdAt: randomDate(new Date(2024, 0, 1), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 15),
  },
  {
    id: generateId('BC'),
    reference: 'BC-2024-0901',
    title: 'BC Matériel Informatique',
    description: 'Achat d\'ordinateurs portables pour les nouveaux collaborateurs',
    status: 'pending',
    priority: 'normal',
    service: 'achats',
    montant: 45000000,
    createdBy: 'Awa Diop',
    createdAt: randomDate(new Date(2024, 0, 5), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 20),
  },
  {
    id: generateId('BC'),
    reference: 'BC-2024-0915',
    title: 'BC Équipements Sécurité',
    description: 'Achat d\'équipements de sécurité pour les chantiers',
    status: 'pending',
    priority: 'high',
    service: 'achats',
    montant: 32000000,
    createdBy: 'Ibrahima Ba',
    createdAt: randomDate(new Date(2024, 0, 10), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 25),
  },

  // En attente - Finance
  {
    id: generateId('FAC'),
    reference: 'FAC-2024-1234',
    title: 'Facture Transport',
    description: 'Validation facture de transport pour mission Dakar-Thiès',
    status: 'pending',
    priority: 'normal',
    service: 'finance',
    montant: 850000,
    createdBy: 'Fatou Ndiaye',
    createdAt: randomDate(new Date(2024, 0, 8), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 10),
  },
  {
    id: generateId('FAC'),
    reference: 'FAC-2024-1256',
    title: 'Facture Prestations',
    description: 'Facture prestations consulting Q1 2024',
    status: 'pending',
    priority: 'high',
    service: 'finance',
    montant: 15000000,
    createdBy: 'Moussa Diallo',
    createdAt: randomDate(new Date(2024, 0, 12), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 15),
  },

  // En attente - Juridique
  {
    id: generateId('AVE'),
    reference: 'AVE-2024-0156',
    title: 'Avenant Contrat Maintenance',
    description: 'Avenant pour prolongation contrat maintenance équipements',
    status: 'pending',
    priority: 'normal',
    service: 'juridique',
    createdBy: 'Khadija Seck',
    createdAt: randomDate(new Date(2024, 0, 15), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 28),
  },
  {
    id: generateId('AVE'),
    reference: 'AVE-2024-0167',
    title: 'Avenant Contrat Prestations',
    description: 'Modification des termes du contrat de prestations',
    status: 'pending',
    priority: 'low',
    service: 'juridique',
    createdBy: 'Ousmane Ndiaye',
    createdAt: randomDate(new Date(2024, 0, 18), new Date()),
    updatedAt: new Date(),
  },

  // Urgentes - Achats
  {
    id: generateId('BC'),
    reference: 'BC-2024-0880',
    title: 'BC Matériaux Urgent',
    description: 'Achat urgent de matériaux pour chantier en cours',
    status: 'urgent',
    priority: 'critical',
    service: 'achats',
    montant: 25000000,
    createdBy: 'Amadou Sy',
    createdAt: randomDate(new Date(2024, 0, 20), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 5),
  },
  {
    id: generateId('BC'),
    reference: 'BC-2024-0875',
    title: 'BC Équipements Chantier',
    description: 'Équipements manquants pour démarrage chantier',
    status: 'urgent',
    priority: 'critical',
    service: 'achats',
    montant: 18000000,
    createdBy: 'Mariama Diouf',
    createdAt: randomDate(new Date(2024, 0, 22), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 8),
  },

  // Urgentes - Finance
  {
    id: generateId('FAC'),
    reference: 'FAC-2024-1200',
    title: 'Facture Fournisseur Prioritaire',
    description: 'Paiement urgent facture fournisseur prioritaire',
    status: 'urgent',
    priority: 'critical',
    service: 'finance',
    montant: 50000000,
    createdBy: 'Idrissa Traoré',
    createdAt: randomDate(new Date(2024, 0, 25), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 1),
  },
  {
    id: generateId('FAC'),
    reference: 'FAC-2024-1211',
    title: 'Facture Sous-traitant',
    description: 'Validation paiement sous-traitant en attente',
    status: 'urgent',
    priority: 'high',
    service: 'finance',
    montant: 12500000,
    createdBy: 'Ndeye Sarr',
    createdAt: randomDate(new Date(2024, 0, 28), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 3),
  },

  // Urgentes - Juridique
  {
    id: generateId('AVE'),
    reference: 'AVE-2024-0145',
    title: 'Contrat Signature Urgente',
    description: 'Contrat nécessitant signature immédiate',
    status: 'urgent',
    priority: 'critical',
    service: 'juridique',
    createdBy: 'Papa Ndiaye',
    createdAt: randomDate(new Date(2024, 0, 30), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 2),
  },

  // En retard - Achats
  {
    id: generateId('BC'),
    reference: 'BC-2024-0820',
    title: 'BC Fournitures Retard',
    description: 'Bon de commande en retard de validation',
    status: 'overdue',
    priority: 'high',
    service: 'achats',
    montant: 8500000,
    createdBy: 'Alassane Mbaye',
    createdAt: new Date(2023, 11, 15),
    updatedAt: new Date(2023, 11, 20),
    dueDate: new Date(2024, 0, 10),
  },
  {
    id: generateId('BC'),
    reference: 'BC-2024-0835',
    title: 'BC Équipements Retard',
    description: 'Commande équipements non validée dans les délais',
    status: 'overdue',
    priority: 'high',
    service: 'achats',
    montant: 22000000,
    createdBy: 'Aissatou Diallo',
    createdAt: new Date(2023, 11, 20),
    updatedAt: new Date(2023, 11, 25),
    dueDate: new Date(2024, 0, 15),
  },

  // En retard - Finance
  {
    id: generateId('FAC'),
    reference: 'FAC-2024-1100',
    title: 'Facture Retard',
    description: 'Facture en retard de traitement',
    status: 'overdue',
    priority: 'high',
    service: 'finance',
    montant: 3200000,
    createdBy: 'Mamadou Sall',
    createdAt: new Date(2023, 11, 25),
    updatedAt: new Date(2023, 11, 30),
    dueDate: new Date(2024, 0, 5),
  },

  // Validées
  {
    id: generateId('BC'),
    reference: 'BC-2024-0800',
    title: 'BC Fournitures Validé',
    description: 'Bon de commande validé et transmis',
    status: 'validated',
    priority: 'normal',
    service: 'achats',
    montant: 6500000,
    createdBy: 'Samba Diop',
    createdAt: new Date(2023, 11, 10),
    updatedAt: new Date(2023, 11, 15),
  },
  {
    id: generateId('FAC'),
    reference: 'FAC-2024-1050',
    title: 'Facture Validée',
    description: 'Facture validée et en cours de paiement',
    status: 'validated',
    priority: 'normal',
    service: 'finance',
    montant: 12000000,
    createdBy: 'Aminata Ba',
    createdAt: new Date(2023, 11, 5),
    updatedAt: new Date(2023, 11, 8),
  },
  {
    id: generateId('AVE'),
    reference: 'AVE-2024-0120',
    title: 'Avenant Validé',
    description: 'Avenant de contrat validé',
    status: 'validated',
    priority: 'normal',
    service: 'juridique',
    createdBy: 'Ibrahima Faye',
    createdAt: new Date(2023, 11, 1),
    updatedAt: new Date(2023, 11, 3),
  },

  // Rejetées
  {
    id: generateId('BC'),
    reference: 'BC-2024-0750',
    title: 'BC Rejeté',
    description: 'Bon de commande rejeté - budget insuffisant',
    status: 'rejected',
    priority: 'normal',
    service: 'achats',
    montant: 50000000,
    createdBy: 'Ousmane Diop',
    createdAt: new Date(2023, 10, 20),
    updatedAt: new Date(2023, 10, 25),
  },
  {
    id: generateId('FAC'),
    reference: 'FAC-2024-1000',
    title: 'Facture Rejetée',
    description: 'Facture rejetée - justificatifs manquants',
    status: 'rejected',
    priority: 'normal',
    service: 'finance',
    montant: 850000,
    createdBy: 'Nafi Fall',
    createdAt: new Date(2023, 10, 15),
    updatedAt: new Date(2023, 10, 18),
  },
  {
    id: generateId('AVE'),
    reference: 'AVE-2024-0110',
    title: 'Avenant Rejeté',
    description: 'Avenant rejeté - conditions non conformes',
    status: 'rejected',
    priority: 'normal',
    service: 'juridique',
    createdBy: 'Mame Diarra',
    createdAt: new Date(2023, 10, 12),
    updatedAt: new Date(2023, 10, 15),
  },

  // Plus de demandes en attente pour avoir plus de données
  {
    id: generateId('BC'),
    reference: 'BC-2024-0920',
    title: 'BC Mobilier Bureau',
    description: 'Achat de mobilier pour nouveaux bureaux',
    status: 'pending',
    priority: 'normal',
    service: 'achats',
    montant: 8500000,
    createdBy: 'Mariama Ba',
    createdAt: randomDate(new Date(2024, 0, 3), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 18),
  },
  {
    id: generateId('FAC'),
    reference: 'FAC-2024-1267',
    title: 'Facture Services',
    description: 'Validation facture services techniques',
    status: 'pending',
    priority: 'normal',
    service: 'finance',
    montant: 6500000,
    createdBy: 'Papa Sarr',
    createdAt: randomDate(new Date(2024, 0, 7), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 12),
  },
  {
    id: generateId('BC'),
    reference: 'BC-2024-0935',
    title: 'BC Matériaux Chantier',
    description: 'Commande matériaux pour chantier Yoff',
    status: 'pending',
    priority: 'high',
    service: 'achats',
    montant: 55000000,
    createdBy: 'Alioune Sall',
    createdAt: randomDate(new Date(2024, 0, 14), new Date()),
    updatedAt: new Date(),
    dueDate: new Date(2024, 1, 22),
  },

  // Plus de validées
  ...Array.from({ length: 20 }, (_, i) => ({
    id: generateId('BC'),
    reference: `BC-2024-${String(800 + i).padStart(4, '0')}`,
    title: `BC Validé ${i + 1}`,
    description: `Bon de commande validé numéro ${i + 1}`,
    status: 'validated' as const,
    priority: (['low', 'normal', 'high'][Math.floor(Math.random() * 3)]) as any,
    service: (['achats', 'finance', 'juridique', 'rh'][Math.floor(Math.random() * 4)]) as any,
    montant: Math.floor(Math.random() * 50000000) + 1000000,
    createdBy: `User ${i + 1}`,
    createdAt: randomDate(new Date(2023, 9, 1), new Date(2023, 11, 31)),
    updatedAt: randomDate(new Date(2023, 10, 1), new Date()),
  })),
];

// Statistiques mockées
export const mockStats: DemandeStats = {
  total: 453,
  newToday: 0,
  pending: 45,
  urgent: 12,
  validated: 378,
  rejected: 15,
  overdue: 8,
  avgResponseTime: 2.3,
  approvalRate: 83,
  completionRate: 87,
  satisfactionScore: 4.2,
};

// Statistiques par service
export const mockServiceStats: ServiceStats[] = [
  {
    service: 'achats',
    total: 156,
    pending: 25,
    urgent: 6,
    validated: 120,
    rejected: 5,
  },
  {
    service: 'finance',
    total: 198,
    pending: 15,
    urgent: 4,
    validated: 175,
    rejected: 4,
  },
  {
    service: 'juridique',
    total: 45,
    pending: 5,
    urgent: 2,
    validated: 37,
    rejected: 1,
  },
  {
    service: 'rh',
    total: 54,
    pending: 0,
    urgent: 0,
    validated: 46,
    rejected: 8,
  },
];

// Tendances mockées (30 derniers jours)
export const mockTrends: DemandeTrend[] = (() => {
  const trends: DemandeTrend[] = [];
  const today = new Date();
  const statuses: Array<Demande['status']> = ['pending', 'urgent', 'validated', 'rejected', 'overdue'];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    trends.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 10,
      status,
    });
  }

  return trends;
})();

// Fonctions helper pour filtrer les mock data
export function getDemandesByStatus(status: string): Demande[] {
  return mockDemandes.filter((d) => d.status === status);
}

export function getDemandesByService(service: string): Demande[] {
  return mockDemandes.filter((d) => d.service === service);
}

export function getDemandesByStatusAndService(status: string, service: string): Demande[] {
  return mockDemandes.filter((d) => d.status === status && d.service === service);
}

export function getDemandeById(id: string): Demande | undefined {
  return mockDemandes.find((d) => d.id === id);
}

