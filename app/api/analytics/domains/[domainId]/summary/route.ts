import { NextRequest, NextResponse } from 'next/server';
import { getMockDataForDomain } from '@/lib/mocks/analyticsMockData';

/**
 * GET /api/analytics/domains/[domainId]/summary
 * Récupère le résumé d'un domaine
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { domainId: string } }
) {
  try {
    const { domainId } = params;

    if (!domainId) {
      return NextResponse.json(
        { error: 'Domain ID is required' },
        { status: 400 }
      );
    }

    // Pour l'instant, utiliser les données mockées
    // TODO: Remplacer par un appel à la base de données
    const mockData = getMockDataForDomain(domainId);
    const summary = mockData?.summary || {};

    return NextResponse.json({
      summary,
      domainId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching domain summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

