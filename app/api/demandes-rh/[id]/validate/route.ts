import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/demandes-rh/[id]/validate - Valider une demande
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { comment, validatorName, validatorRole } = body;
    
    // En production: mettre à jour dans la base de données
    // await db.demandesRH.update({ 
    //   where: { id }, 
    //   data: { 
    //     statut: 'validée',
    //     validatedBy: validatorName,
    //     validatedAt: new Date(),
    //     validationComment: comment,
    //   } 
    // });
    
    // Créer un événement timeline
    // await db.rhEvents.create({
    //   demandeId: id,
    //   action: 'validated',
    //   actor: validatorName,
    //   details: comment,
    // });
    
    return NextResponse.json({
      success: true,
      message: `Demande ${id} validée`,
      validatedAt: new Date().toISOString(),
      validatedBy: validatorName,
    });
  } catch (error) {
    console.error(`Erreur POST /api/demandes-rh/validate:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation de la demande' },
      { status: 500 }
    );
  }
}

