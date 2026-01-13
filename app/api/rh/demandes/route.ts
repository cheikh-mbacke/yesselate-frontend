/**
 * API Route: GET /api/rh/demandes
 * Récupère la liste des demandes RH avec filtres
 */

import { NextRequest, NextResponse } from 'next/server';

// Types
export interface DemandeRH {
  id: string;
  type: 'conges' | 'depenses' | 'deplacement' | 'avances';
  numero: string;
  agent: {
    id: string;
    nom: string;
    matricule: string;
    bureau: string;
    poste: string;
  };
  statut: 'brouillon' | 'en_cours' | 'validee' | 'rejetee' | 'annulee';
  priorite: 'normale' | 'urgente' | 'critique';
  objet: string;
  description?: string;
  montant?: number;
  devise?: string;
  dateDebut?: string;
  dateFin?: string;
  duree?: number;
  validations: {
    niveau: number;
    valideur: string;
    statut: 'en_attente' | 'approuve' | 'rejete';
    date?: string;
    commentaire?: string;
  }[];
  documents?: {
    id: string;
    nom: string;
    type: string;
    taille: number;
    url: string;
  }[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags?: string[];
}

// Mock data
const mockDemandes: DemandeRH[] = [
  {
    id: 'DEM-2026-001',
    type: 'conges',
    numero: 'CONG-2026-001',
    agent: {
      id: 'AGT001',
      nom: 'Abdoulaye DIOP',
      matricule: 'MAT-001',
      bureau: 'Bureau Technique',
      poste: 'Ingénieur Chef de Projet'
    },
    statut: 'en_cours',
    priorite: 'normale',
    objet: 'Congé annuel - 15 jours',
    description: 'Demande de congés pour période estivale',
    dateDebut: '2026-07-01',
    dateFin: '2026-07-15',
    duree: 15,
    validations: [
      {
        niveau: 1,
        valideur: 'Chef de Service',
        statut: 'approuve',
        date: '2026-01-08T10:30:00Z',
        commentaire: 'Approuvé'
      },
      {
        niveau: 2,
        valideur: 'DRH',
        statut: 'en_attente'
      }
    ],
    documents: [
      {
        id: 'DOC001',
        nom: 'formulaire_conges.pdf',
        type: 'application/pdf',
        taille: 245000,
        url: '/uploads/documents/formulaire_conges.pdf'
      }
    ],
    createdAt: '2026-01-07T14:20:00Z',
    updatedAt: '2026-01-08T10:30:00Z',
    createdBy: 'AGT001',
    tags: ['congé', 'été', 'planifié']
  },
  {
    id: 'DEM-2026-002',
    type: 'depenses',
    numero: 'DEP-2026-002',
    agent: {
      id: 'AGT002',
      nom: 'Fatou SALL',
      matricule: 'MAT-002',
      bureau: 'Bureau Administratif',
      poste: 'Responsable Administratif'
    },
    statut: 'validee',
    priorite: 'urgente',
    objet: 'Frais de mission Thiès',
    description: 'Remboursement frais mission supervision chantier',
    montant: 75000,
    devise: 'XOF',
    dateDebut: '2026-01-05',
    dateFin: '2026-01-05',
    validations: [
      {
        niveau: 1,
        valideur: 'Chef de Service',
        statut: 'approuve',
        date: '2026-01-06T09:15:00Z'
      },
      {
        niveau: 2,
        valideur: 'Direction Financière',
        statut: 'approuve',
        date: '2026-01-06T15:45:00Z'
      }
    ],
    documents: [
      {
        id: 'DOC002',
        nom: 'factures_mission.pdf',
        type: 'application/pdf',
        taille: 820000,
        url: '/uploads/documents/factures_mission.pdf'
      },
      {
        id: 'DOC003',
        nom: 'justificatifs.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        taille: 156000,
        url: '/uploads/documents/justificatifs.xlsx'
      }
    ],
    createdAt: '2026-01-05T18:30:00Z',
    updatedAt: '2026-01-06T15:45:00Z',
    createdBy: 'AGT002',
    tags: ['mission', 'remboursement', 'thiès']
  },
  {
    id: 'DEM-2026-003',
    type: 'deplacement',
    numero: 'DEPL-2026-003',
    agent: {
      id: 'AGT003',
      nom: 'Mamadou BA',
      matricule: 'MAT-003',
      bureau: 'Bureau Technique',
      poste: 'Conducteur de Travaux'
    },
    statut: 'en_cours',
    priorite: 'critique',
    objet: 'Mission urgente Saint-Louis',
    description: 'Intervention urgente suite problème chantier',
    dateDebut: '2026-01-11',
    dateFin: '2026-01-13',
    duree: 3,
    validations: [
      {
        niveau: 1,
        valideur: 'Chef de Projet',
        statut: 'approuve',
        date: '2026-01-10T08:00:00Z',
        commentaire: 'Mission urgente validée'
      },
      {
        niveau: 2,
        valideur: 'Direction',
        statut: 'en_attente'
      }
    ],
    createdAt: '2026-01-09T16:45:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
    createdBy: 'AGT003',
    tags: ['urgent', 'saint-louis', 'chantier']
  },
  {
    id: 'DEM-2026-004',
    type: 'avances',
    numero: 'AVA-2026-004',
    agent: {
      id: 'AGT004',
      nom: 'Aïssatou DIAGNE',
      matricule: 'MAT-004',
      bureau: 'Bureau Commercial',
      poste: 'Chargée de Clientèle'
    },
    statut: 'brouillon',
    priorite: 'normale',
    objet: 'Avance sur salaire - 200 000 FCFA',
    description: 'Avance pour frais médicaux',
    montant: 200000,
    devise: 'XOF',
    validations: [
      {
        niveau: 1,
        valideur: 'Chef de Service',
        statut: 'en_attente'
      },
      {
        niveau: 2,
        valideur: 'DRH',
        statut: 'en_attente'
      }
    ],
    createdAt: '2026-01-10T11:20:00Z',
    updatedAt: '2026-01-10T11:20:00Z',
    createdBy: 'AGT004',
    tags: ['avance', 'médical']
  },
  {
    id: 'DEM-2026-005',
    type: 'conges',
    numero: 'CONG-2026-005',
    agent: {
      id: 'AGT005',
      nom: 'Ousmane NDIAYE',
      matricule: 'MAT-005',
      bureau: 'Bureau Logistique',
      poste: 'Responsable Logistique'
    },
    statut: 'rejetee',
    priorite: 'normale',
    objet: 'Congé exceptionnel - 3 jours',
    dateDebut: '2026-01-15',
    dateFin: '2026-01-17',
    duree: 3,
    validations: [
      {
        niveau: 1,
        valideur: 'Chef de Service',
        statut: 'rejete',
        date: '2026-01-09T14:30:00Z',
        commentaire: 'Période de forte activité, merci de reporter'
      }
    ],
    createdAt: '2026-01-08T09:00:00Z',
    updatedAt: '2026-01-09T14:30:00Z',
    createdBy: 'AGT005',
    tags: ['congé', 'exceptionnel']
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres de filtrage
    const type = searchParams.get('type');
    const statut = searchParams.get('statut');
    const priorite = searchParams.get('priorite');
    const agent = searchParams.get('agent');
    const bureau = searchParams.get('bureau');
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filtrage
    let filtered = [...mockDemandes];

    if (type) {
      filtered = filtered.filter(d => d.type === type);
    }

    if (statut) {
      filtered = filtered.filter(d => d.statut === statut);
    }

    if (priorite) {
      filtered = filtered.filter(d => d.priorite === priorite);
    }

    if (agent) {
      filtered = filtered.filter(d => d.agent.id === agent || d.agent.nom.toLowerCase().includes(agent.toLowerCase()));
    }

    if (bureau) {
      filtered = filtered.filter(d => d.agent.bureau.toLowerCase().includes(bureau.toLowerCase()));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(d =>
        d.numero.toLowerCase().includes(searchLower) ||
        d.objet.toLowerCase().includes(searchLower) ||
        d.agent.nom.toLowerCase().includes(searchLower) ||
        d.description?.toLowerCase().includes(searchLower) ||
        d.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (dateDebut) {
      filtered = filtered.filter(d => d.dateDebut && d.dateDebut >= dateDebut);
    }

    if (dateFin) {
      filtered = filtered.filter(d => d.dateFin && d.dateFin <= dateFin);
    }

    // Tri
    filtered.sort((a, b) => {
      const aVal = a[sort as keyof DemandeRH] as string;
      const bVal = b[sort as keyof DemandeRH] as string;
      
      if (order === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    // Pagination
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      filters: {
        type,
        statut,
        priorite,
        agent,
        bureau,
        search,
        dateDebut,
        dateFin
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API /api/rh/demandes:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération des demandes',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
