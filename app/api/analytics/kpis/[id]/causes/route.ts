import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/kpis/[id]/causes
 * Récupère l'analyse des causes pour un KPI
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'KPI ID is required' },
        { status: 400 }
      );
    }

    // Pour l'instant, utiliser des données mockées
    // TODO: Remplacer par un appel à la base de données ou un service d'analyse
    const causesData = [
      { factor: 'Facteur A', impact: 35, type: 'positive', description: 'Amélioration des processus' },
      { factor: 'Facteur B', impact: -20, type: 'negative', description: 'Retards dans les livraisons' },
      { factor: 'Facteur C', impact: 15, type: 'positive', description: 'Optimisation des ressources' },
      { factor: 'Facteur D', impact: -10, type: 'negative', description: 'Conditions météorologiques' },
    ];

    return NextResponse.json({
      data: causesData,
      kpiId: id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching KPI causes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

