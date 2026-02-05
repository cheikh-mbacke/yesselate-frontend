import { NextRequest, NextResponse } from 'next/server';
import { demandesRH } from '@/lib/data/bmo-mock-2';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/demandes-rh/[id] - Détail d'une demande
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const demande = demandesRH.find((d: any) => d.id === id);
    
    if (!demande) {
      return NextResponse.json(
        { error: 'Demande non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(demande);
  } catch (error) {
    console.error(`Erreur GET /api/demandes-rh:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la demande' },
      { status: 500 }
    );
  }
}

// PATCH /api/demandes-rh/[id] - Mettre à jour une demande
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // En production: mettre à jour dans la base de données
    // await db.demandesRH.update({ where: { id }, data: body });
    
    return NextResponse.json({
      success: true,
      message: `Demande ${id} mise à jour`,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Erreur PATCH /api/demandes-rh:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la demande' },
      { status: 500 }
    );
  }
}

// DELETE /api/demandes-rh/[id] - Supprimer une demande
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // En production: supprimer de la base de données
    // await db.demandesRH.delete({ where: { id } });
    
    return NextResponse.json({
      success: true,
      message: `Demande ${id} supprimée`,
    });
  } catch (error) {
    console.error(`Erreur DELETE /api/demandes-rh:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la demande' },
      { status: 500 }
    );
  }
}

