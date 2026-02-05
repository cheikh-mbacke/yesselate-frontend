import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/arbitrages/[id]/complement
 * ====================================
 * Demander des compléments d'information
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { requestedFrom, questions, deadline, requestedBy } = body;

    if (!requestedFrom || !questions) {
      return NextResponse.json(
        { error: 'requestedFrom and questions are required' },
        { status: 400 }
      );
    }

    // TODO: Créer une demande de complément dans la base de données
    
    return NextResponse.json({
      success: true,
      message: 'Demande de complément envoyée',
      requestId: `REQ-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      requestedBy: requestedBy || 'A. DIALLO',
    });
  } catch (error) {
    console.error('Error requesting complement:', error);
    return NextResponse.json(
      { error: 'Failed to request complement' },
      { status: 500 }
    );
  }
}
