import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/demandes-rh/[id]/reject - Rejeter une demande
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { reason, rejectorName, rejectorRole } = body;
    
    if (!reason) {
      return NextResponse.json(
        { error: 'Un motif de rejet est requis' },
        { status: 400 }
      );
    }
    
    // En production: mettre à jour dans la base de données
    // await db.demandesRH.update({ 
    //   where: { id }, 
    //   data: { 
    //     statut: 'rejetée',
    //     rejectedBy: rejectorName,
    //     rejectedAt: new Date(),
    //     rejectionReason: reason,
    //   } 
    // });
    
    // Créer un événement timeline
    // await db.rhEvents.create({
    //   demandeId: id,
    //   action: 'rejected',
    //   actor: rejectorName,
    //   details: reason,
    // });
    
    return NextResponse.json({
      success: true,
      message: `Demande ${id} rejetée`,
      rejectedAt: new Date().toISOString(),
      rejectedBy: rejectorName,
      reason,
    });
  } catch (error) {
    console.error(`Erreur POST /api/demandes-rh/reject:`, error);
    return NextResponse.json(
      { error: 'Erreur lors du rejet de la demande' },
      { status: 500 }
    );
  }
}

