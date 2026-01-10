import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/analytics/alerts/:id/resolve
 * 
 * Marque une alerte comme résolue
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: alertId } = await params;
    const body = await request.json();
    const { resolution, notes, userId } = body;

    if (!resolution) {
      return NextResponse.json(
        { error: 'Le champ resolution est requis' },
        { status: 400 }
      );
    }

    // Simuler la résolution de l'alerte
    const resolvedAlert = {
      id: alertId,
      status: 'resolved',
      resolution,
      notes: notes || '',
      resolvedAt: new Date().toISOString(),
      resolvedBy: userId || 'current-user',
    };

    return NextResponse.json({
      success: true,
      alert: resolvedAlert,
      message: 'Alerte résolue avec succès',
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur POST /api/analytics/alerts/:id/resolve:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la résolution de l\'alerte' },
      { status: 500 }
    );
  }
}

