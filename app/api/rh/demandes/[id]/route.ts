/**
 * API Route: GET/POST /api/rh/demandes/[id]
 * Récupère ou met à jour une demande RH spécifique
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock detailed demand data
    const detailedDemand = {
      id,
      type: 'conges',
      numero: 'CONG-2026-001',
      agent: {
        id: 'AGT001',
        nom: 'Abdoulaye DIOP',
        matricule: 'MAT-001',
        bureau: 'Bureau Technique',
        poste: 'Ingénieur Chef de Projet',
        email: 'a.diop@nicerenovation.sn',
        telephone: '+221 77 123 45 67',
        dateEntree: '2020-03-15',
        soldeConges: 25
      },
      statut: 'en_cours',
      priorite: 'normale',
      objet: 'Congé annuel - 15 jours',
      description: 'Demande de congés pour période estivale. Planification famille.',
      motif: 'Congé annuel',
      dateDebut: '2026-07-01',
      dateFin: '2026-07-15',
      duree: 15,
      montant: null,
      devise: null,
      validations: [
        {
          niveau: 1,
          valideur: 'Chef de Service',
          valideurId: 'VAL001',
          statut: 'approuve',
          date: '2026-01-08T10:30:00Z',
          commentaire: 'Approuvé. Bonnes vacances !',
          signature: true
        },
        {
          niveau: 2,
          valideur: 'DRH',
          valideurId: 'VAL002',
          statut: 'en_attente',
          date: null,
          commentaire: null,
          signature: false
        },
        {
          niveau: 3,
          valideur: 'Direction Générale',
          valideurId: 'VAL003',
          statut: 'en_attente',
          date: null,
          commentaire: null,
          signature: false
        }
      ],
      documents: [
        {
          id: 'DOC001',
          nom: 'formulaire_conges.pdf',
          type: 'application/pdf',
          taille: 245000,
          url: '/uploads/documents/formulaire_conges.pdf',
          uploadedAt: '2026-01-07T14:25:00Z',
          uploadedBy: 'AGT001'
        }
      ],
      historique: [
        {
          id: 'HIST001',
          action: 'creation',
          description: 'Demande créée',
          date: '2026-01-07T14:20:00Z',
          auteur: 'Abdoulaye DIOP',
          auteurId: 'AGT001'
        },
        {
          id: 'HIST002',
          action: 'soumission',
          description: 'Demande soumise pour validation',
          date: '2026-01-07T14:30:00Z',
          auteur: 'Abdoulaye DIOP',
          auteurId: 'AGT001'
        },
        {
          id: 'HIST003',
          action: 'validation_niveau_1',
          description: 'Approuvée par Chef de Service',
          date: '2026-01-08T10:30:00Z',
          auteur: 'Chef de Service',
          auteurId: 'VAL001',
          commentaire: 'Approuvé. Bonnes vacances !'
        }
      ],
      commentaires: [
        {
          id: 'COM001',
          texte: 'Merci de bien vouloir valider rapidement',
          date: '2026-01-08T09:00:00Z',
          auteur: 'Abdoulaye DIOP',
          auteurId: 'AGT001',
          reponseA: null
        },
        {
          id: 'COM002',
          texte: 'Validé niveau 1',
          date: '2026-01-08T10:30:00Z',
          auteur: 'Chef de Service',
          auteurId: 'VAL001',
          reponseA: 'COM001'
        }
      ],
      impact: {
        absencesSimultanees: 2,
        chargeEquipe: 'normale',
        projetsConcernes: ['PROJ-001', 'PROJ-003'],
        remplacant: {
          nom: 'Mamadou BA',
          matricule: 'MAT-003'
        }
      },
      createdAt: '2026-01-07T14:20:00Z',
      updatedAt: '2026-01-08T10:30:00Z',
      createdBy: 'AGT001',
      tags: ['congé', 'été', 'planifié']
    };

    return NextResponse.json({
      success: true,
      data: detailedDemand,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Erreur API /api/rh/demandes:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de la demande',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Simulate update
    return NextResponse.json({
      success: true,
      message: 'Demande mise à jour avec succès',
      data: {
        id,
        ...body,
        updatedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Erreur API PATCH /api/rh/demandes:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de la demande',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Simulate deletion
    return NextResponse.json({
      success: true,
      message: 'Demande supprimée avec succès',
      data: { id },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Erreur API DELETE /api/rh/demandes:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression de la demande',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

