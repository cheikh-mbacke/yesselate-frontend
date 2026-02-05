/**
 * API service pour le module Validation-BC - Maître d'Ouvrage
 */

import axios from 'axios';
import type {
  DocumentValidation,
  ValidationStats,
  ValidationFiltres,
  Validateur,
  RegleMetier,
  TypeDocument,
  StatutDocument,
} from '../types/validationTypes';

// ================================
// Données mock (à remplacer par les vraies API)
// ================================

const mockDocuments: DocumentValidation[] = [
  {
    id: '1',
    numero: 'BC-2026-0048',
    titre: 'Bon de commande - Fournitures informatiques',
    description: 'Acquisition de matériel informatique',
    type: 'BC',
    statut: 'EN_ATTENTE',
    priorite: 'ELEVEE',
    service: 'ACHATS',
    demandeur: 'Jean Dupont',
    demandeurId: 'user-1',
    montant: 50000,
    devise: 'EUR',
    dateCreation: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dateEcheance: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    delaiMoyen: 2.3,
    tags: ['informatique', 'matériel'],
  },
  {
    id: '2',
    numero: 'FACT-2026-0123',
    titre: 'Facture Fournisseur ABC',
    description: 'Facture pour prestations de service',
    type: 'FACTURE',
    statut: 'VALIDE',
    priorite: 'NORMALE',
    service: 'FINANCE',
    demandeur: 'Marie Martin',
    demandeurId: 'user-2',
    validateur: 'Sophie Bernard',
    validateurId: 'user-3',
    montant: 25000,
    devise: 'EUR',
    dateCreation: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dateValidation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    delaiMoyen: 4,
    tags: ['facture', 'prestation'],
  },
  {
    id: '3',
    numero: 'AVEN-2026-0056',
    titre: 'Avenant Contrat XYZ',
    description: 'Modification des termes du contrat',
    type: 'AVENANT',
    statut: 'URGENT',
    priorite: 'CRITIQUE',
    service: 'JURIDIQUE',
    demandeur: 'Pierre Durand',
    demandeurId: 'user-4',
    montant: 100000,
    devise: 'EUR',
    dateCreation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    dateEcheance: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    delaiMoyen: 1,
    tags: ['avenant', 'contrat'],
  },
];

// ================================
// Fonctions API
// ================================

/**
 * Récupère les statistiques de validation
 */
export async function getValidationStats(
  filtres?: ValidationFiltres
): Promise<ValidationStats> {
  // TODO: Remplacer par un vrai appel API
  // const response = await axios.get('/api/validation-bc/stats', { params: filtres });
  // return response.data;

  // Données mock
  const filteredDocs = applyFilters(mockDocuments, filtres);

  const totalDocuments = filteredDocs.length;
  const enAttente = filteredDocs.filter((d) => d.statut === 'EN_ATTENTE').length;
  const valides = filteredDocs.filter((d) => d.statut === 'VALIDE').length;
  const rejetes = filteredDocs.filter((d) => d.statut === 'REJETE').length;
  const urgents = filteredDocs.filter((d) => d.statut === 'URGENT').length;
  const tauxValidation = totalDocuments > 0 ? (valides / totalDocuments) * 100 : 0;
  const delaiMoyen =
    filteredDocs.reduce((sum, d) => sum + (d.delaiMoyen || 0), 0) / totalDocuments || 0;

  return {
    totalDocuments,
    enAttente,
    valides,
    rejetes,
    urgents,
    tauxValidation,
    delaiMoyen,
    anomalies: 0,
    parType: {
      BC: filteredDocs.filter((d) => d.type === 'BC').length,
      FACTURE: filteredDocs.filter((d) => d.type === 'FACTURE').length,
      AVENANT: filteredDocs.filter((d) => d.type === 'AVENANT').length,
    },
    parStatut: {
      EN_ATTENTE: enAttente,
      VALIDE: valides,
      REJETE: rejetes,
      URGENT: urgents,
    },
    parService: {
      ACHATS: filteredDocs.filter((d) => d.service === 'ACHATS').length,
      FINANCE: filteredDocs.filter((d) => d.service === 'FINANCE').length,
      JURIDIQUE: filteredDocs.filter((d) => d.service === 'JURIDIQUE').length,
      AUTRES: filteredDocs.filter((d) => d.service === 'AUTRES').length,
    },
  };
}

/**
 * Récupère les documents avec filtres
 */
export async function getValidationDocuments(
  filtres?: ValidationFiltres
): Promise<DocumentValidation[]> {
  // TODO: Remplacer par un vrai appel API
  // const response = await axios.get('/api/validation-bc/documents', { params: filtres });
  // return response.data;

  return applyFilters(mockDocuments, filtres);
}

/**
 * Récupère un document par ID
 */
export async function getValidationDocumentById(id: string): Promise<DocumentValidation | null> {
  // TODO: Remplacer par un vrai appel API
  // const response = await axios.get(`/api/validation-bc/documents/${id}`);
  // return response.data;

  return mockDocuments.find((d) => d.id === id) || null;
}

/**
 * Valide un document
 */
export async function validerDocument(
  id: string,
  commentaire?: string
): Promise<DocumentValidation> {
  // TODO: Remplacer par un vrai appel API
  // const response = await axios.post(`/api/validation-bc/documents/${id}/valider`, { commentaire });
  // return response.data;

  const doc = mockDocuments.find((d) => d.id === id);
  if (!doc) throw new Error('Document non trouvé');

  return {
    ...doc,
    statut: 'VALIDE',
    dateValidation: new Date().toISOString(),
    commentaire,
  };
}

/**
 * Rejette un document
 */
export async function rejeterDocument(
  id: string,
  commentaire: string
): Promise<DocumentValidation> {
  // TODO: Remplacer par un vrai appel API
  // const response = await axios.post(`/api/validation-bc/documents/${id}/rejeter`, { commentaire });
  // return response.data;

  const doc = mockDocuments.find((d) => d.id === id);
  if (!doc) throw new Error('Document non trouvé');

  return {
    ...doc,
    statut: 'REJETE',
    dateRejet: new Date().toISOString(),
    commentaire,
  };
}

/**
 * Récupère les validateurs
 */
export async function getValidateurs(): Promise<Validateur[]> {
  // TODO: Remplacer par un vrai appel API
  // const response = await axios.get('/api/validation-bc/validateurs');
  // return response.data;

  return [
    {
      id: '1',
      nom: 'Sophie Bernard',
      service: 'FINANCE',
      email: 's.bernard@example.com',
      documentsEnCours: 12,
      documentsValides: 87,
      documentsRejetes: 8,
      delaiMoyen: 2.3,
      tauxValidation: 92,
    },
    {
      id: '2',
      nom: 'Pierre Durand',
      service: 'ACHATS',
      email: 'p.durand@example.com',
      documentsEnCours: 8,
      documentsValides: 45,
      documentsRejetes: 3,
      delaiMoyen: 1.8,
      tauxValidation: 94,
    },
  ];
}

/**
 * Récupère les règles métier
 */
export async function getReglesMetier(): Promise<RegleMetier[]> {
  // TODO: Remplacer par un vrai appel API
  // const response = await axios.get('/api/validation-bc/regles-metier');
  // return response.data;

  return [
    {
      id: '1',
      nom: 'Validation automatique < 1000 EUR',
      description: 'Les documents de moins de 1000 EUR sont validés automatiquement',
      typeDocument: 'BC',
      condition: 'montant < 1000',
      action: 'VALIDATION_AUTOMATIQUE',
      active: true,
      priorite: 'NORMALE',
    },
    {
      id: '2',
      nom: 'Escalade si délai > 5 jours',
      description: 'Escalade vers le responsable si délai de validation > 5 jours',
      typeDocument: 'BC',
      condition: 'delai > 5',
      action: 'ESCALADE',
      active: true,
      priorite: 'ELEVEE',
    },
  ];
}

// ================================
// Helpers
// ================================

function applyFilters(
  documents: DocumentValidation[],
  filtres?: ValidationFiltres
): DocumentValidation[] {
  if (!filtres) return documents;

  return documents.filter((doc) => {
    if (filtres.types && !filtres.types.includes(doc.type)) return false;
    if (filtres.statuts && !filtres.statuts.includes(doc.statut)) return false;
    if (filtres.services && !filtres.services.includes(doc.service)) return false;
    if (filtres.validateurs && !filtres.validateurs.includes(doc.validateurId || '')) return false;
    if (filtres.demandeurs && !filtres.demandeurs.includes(doc.demandeurId || '')) return false;
    if (filtres.projets && !filtres.projets.includes(doc.projetId || '')) return false;
    if (filtres.montantMin && doc.montant < filtres.montantMin) return false;
    if (filtres.montantMax && doc.montant > filtres.montantMax) return false;
    if (filtres.dateDebut) {
      const dateCreation = new Date(doc.dateCreation);
      if (dateCreation < filtres.dateDebut) return false;
    }
    if (filtres.dateFin) {
      const dateCreation = new Date(doc.dateCreation);
      if (dateCreation > filtres.dateFin) return false;
    }
    if (filtres.recherche) {
      const search = filtres.recherche.toLowerCase();
      const matches =
        doc.numero.toLowerCase().includes(search) ||
        doc.titre.toLowerCase().includes(search) ||
        doc.description?.toLowerCase().includes(search) ||
        doc.demandeur.toLowerCase().includes(search);
      if (!matches) return false;
    }
    return true;
  });
}

