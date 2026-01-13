/**
 * API Route: POST /api/rh/demandes/[id]/comments
 * Ajoute un commentaire à une demande RH
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock comments
    const comments = [
      {
        id: 'COM001',
        demandeId: id,
        texte: 'Merci de bien vouloir valider rapidement',
        date: '2026-01-08T09:00:00Z',
        auteur: 'Abdoulaye DIOP',
        auteurId: 'AGT001',
        reponseA: null
      },
      {
        id: 'COM002',
        demandeId: id,
        texte: 'Validé niveau 1',
        date: '2026-01-08T10:30:00Z',
        auteur: 'Chef de Service',
        auteurId: 'VAL001',
        reponseA: 'COM001'
      },
      {
        id: 'COM003',
        demandeId: id,
        texte: 'Documents justificatifs à ajouter',
        date: '2026-01-08T14:15:00Z',
        auteur: 'DRH',
        auteurId: 'VAL002',
        reponseA: null
      }
    ];

    return NextResponse.json({
      success: true,
      data: comments,
      total: comments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API GET /api/rh/demandes/comments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des commentaires',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { texte, auteurId, auteurNom, reponseA } = body;

    // Validation
    if (!texte || !auteurId || !auteurNom) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres manquants',
          details: 'texte, auteurId et auteurNom sont requis'
        },
        { status: 400 }
      );
    }

    // Create comment
    const newComment = {
      id: `COM-${Date.now()}`,
      demandeId: id,
      texte,
      date: new Date().toISOString(),
      auteur: auteurNom,
      auteurId,
      reponseA: reponseA || null
    };

    return NextResponse.json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      data: newComment,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur API POST /api/rh/demandes/comments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'ajout du commentaire',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
