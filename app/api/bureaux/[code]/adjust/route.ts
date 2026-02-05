import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/bureaux/[code]/adjust
 * ================================
 * Ajuster les responsabilités d'un bureau
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { responsibilities, reason, adjustedBy } = body;

    // TODO: Enregistrer l'ajustement dans la base de données
    
    return NextResponse.json({
      success: true,
      message: 'Responsabilités ajustées avec succès',
      adjustmentId: `ADJ-${Date.now()}`,
      adjustedAt: new Date().toISOString(),
      adjustedBy: adjustedBy || 'A. DIALLO',
    });
  } catch (error) {
    console.error('Error adjusting bureau:', error);
    return NextResponse.json(
      { error: 'Failed to adjust bureau' },
      { status: 500 }
    );
  }
}

