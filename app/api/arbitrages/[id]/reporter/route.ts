import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/arbitrages/[id]/reporter
 * ==================================
 * Reporter un arbitrage avec justification
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newDeadline, reason, reportedBy } = body;

    if (!newDeadline || !reason) {
      return NextResponse.json(
        { error: 'newDeadline and reason are required' },
        { status: 400 }
      );
    }

    // TODO: Mettre à jour l'arbitrage dans la base de données
    
    return NextResponse.json({
      success: true,
      message: 'Arbitrage reporté avec succès',
      newDeadline,
      reportedAt: new Date().toISOString(),
      reportedBy: reportedBy || 'A. DIALLO',
    });
  } catch (error) {
    console.error('Error reporter arbitrage:', error);
    return NextResponse.json(
      { error: 'Failed to reporter arbitrage' },
      { status: 500 }
    );
  }
}
