import { NextRequest, NextResponse } from 'next/server';
import { getMockDataForDomain } from '@/lib/mocks/analyticsMockData';

/**
 * GET /api/analytics/domains/[domainId]/[dataSource]
 * Récupère les données d'une source spécifique pour un domaine
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { domainId: string; dataSource: string } }
) {
  try {
    const { domainId, dataSource } = params;

    if (!domainId || !dataSource) {
      return NextResponse.json(
        { error: 'Domain ID and data source are required' },
        { status: 400 }
      );
    }

    // Pour l'instant, utiliser les données mockées
    // TODO: Remplacer par un appel à la base de données
    const mockData = getMockDataForDomain(domainId);
    const data = mockData?.[dataSource as keyof typeof mockData] || [];

    return NextResponse.json({
      data,
      domainId,
      dataSource,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching domain data source:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

