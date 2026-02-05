import { NextRequest, NextResponse } from 'next/server';
import { generateMockAlerts } from '@/lib/data/alerts';

/**
 * GET /api/alerts/search
 * Recherche full-text dans les alertes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    if (!query || query.length < 2) {
      return NextResponse.json({
        alerts: [],
        total: 0,
        page,
        limit,
        hasMore: false,
        message: 'Query too short (minimum 2 characters)',
      });
    }

    // Générer les alertes
    let alerts = generateMockAlerts(100);

    // Recherche full-text
    const searchLower = query.toLowerCase();
    alerts = alerts.filter(a => {
      const titleMatch = a.title.toLowerCase().includes(searchLower);
      const descMatch = a.description?.toLowerCase().includes(searchLower);
      const sourceMatch = a.source?.toLowerCase().includes(searchLower);
      const tagsMatch = a.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      return titleMatch || descMatch || sourceMatch || tagsMatch;
    });

    // Tri par pertinence (simpliste : prioriser les matches dans le titre)
    alerts.sort((a, b) => {
      const aScore = a.title.toLowerCase().includes(searchLower) ? 10 : 1;
      const bScore = b.title.toLowerCase().includes(searchLower) ? 10 : 1;
      return bScore - aScore;
    });

    // Pagination
    const total = alerts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAlerts = alerts.slice(startIndex, endIndex);

    return NextResponse.json({
      alerts: paginatedAlerts,
      total,
      page,
      limit,
      hasMore: endIndex < total,
      query,
    });
  } catch (error) {
    console.error('Error searching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to search alerts', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

