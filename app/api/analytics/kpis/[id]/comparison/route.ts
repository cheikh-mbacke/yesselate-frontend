import { NextRequest, NextResponse } from 'next/server';
import { getMockDataForDomain } from '@/lib/mocks/analyticsMockData';

/**
 * GET /api/analytics/kpis/[id]/comparison
 * Récupère les données de comparaison pour un KPI
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'KPI ID is required' },
        { status: 400 }
      );
    }

    // Pour l'instant, utiliser des données mockées
    // TODO: Remplacer par un appel à la base de données
    const comparisonData = [
      { name: 'Élément 1', value: 100, percentage: 100 },
      { name: 'Élément 2', value: 95, percentage: 95 },
      { name: 'Élément 3', value: 110, percentage: 110 },
      { name: 'Moyenne', value: 102, percentage: 102 },
    ];

    return NextResponse.json({
      data: comparisonData,
      kpiId: id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching KPI comparison:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

