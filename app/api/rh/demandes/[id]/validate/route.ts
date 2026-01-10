/**
 * API Route: POST /api/rh/demandes/[id]/validate
 * Valide ou rejette une demande RH à un niveau donné
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      niveau,
      action, // 'approuver' | 'rejeter'
      commentaire,
      valideurId,
      valideurNom
    } = body;

    // Validation
    if (!niveau || !action || !valideurId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres manquants',
          details: 'niveau, action et valideurId sont requis'
        },
        { status: 400 }
      );
    }

    if (!['approuver', 'rejeter'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Action invalide',
          details: 'action doit être "approuver" ou "rejeter"'
        },
        { status: 400 }
      );
    }

    // Simulate validation
    const validation = {
      niveau,
      valideur: valideurNom,
      valideurId,
      statut: action === 'approuver' ? 'approuve' : 'rejete',
      date: new Date().toISOString(),
      commentaire: commentaire || null,
      signature: action === 'approuver'
    };

    // Determine new demand status
    let nouveauStatut = 'en_cours';
    if (action === 'rejeter') {
      nouveauStatut = 'rejetee';
    } else if (niveau === 3) { // Last level
      nouveauStatut = 'validee';
    }

    return NextResponse.json({
      success: true,
      message: action === 'approuver' 
        ? `Demande approuvée au niveau ${niveau}` 
        : `Demande rejetée au niveau ${niveau}`,
      data: {
        id,
        validation,
        nouveauStatut,
        nextLevel: action === 'approuver' && niveau < 3 ? niveau + 1 : null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Erreur API /api/rh/demandes/validate:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la validation',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

