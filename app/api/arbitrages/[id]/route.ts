import { NextRequest, NextResponse } from 'next/server';
import { arbitragesVivants, arbitrages } from '@/lib/data';

/**
 * GET /api/arbitrages/[id]
 * ========================
 * Récupérer un arbitrage spécifique par son ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Chercher dans les vivants
    const vivant = arbitragesVivants.find((a: any) => a.id === id);
    if (vivant) {
      return NextResponse.json({ ...vivant, _type: 'vivant' });
    }

    // Chercher dans les simples
    const simple = arbitrages.find((a: any) => a.id === id);
    if (simple) {
      return NextResponse.json({ ...simple, _type: 'simple' });
    }

    return NextResponse.json(
      { error: 'Arbitrage not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching arbitrage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch arbitrage' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/arbitrages/[id]
 * ==========================
 * Mettre à jour un arbitrage
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Mise à jour réelle dans la base de données
    
    return NextResponse.json({
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating arbitrage:', error);
    return NextResponse.json(
      { error: 'Failed to update arbitrage' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/arbitrages/[id]
 * ===========================
 * Supprimer un arbitrage
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Suppression réelle dans la base de données
    
    return NextResponse.json({
      success: true,
      message: 'Arbitrage deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting arbitrage:', error);
    return NextResponse.json(
      { error: 'Failed to delete arbitrage' },
      { status: 500 }
    );
  }
}
