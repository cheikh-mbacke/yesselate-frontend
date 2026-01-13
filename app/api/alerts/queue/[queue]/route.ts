import { NextRequest, NextResponse } from 'next/server';
import { generateMockAlerts } from '@/lib/data/alerts';

/**
 * GET /api/alerts/queue/[queue]
 * Récupérer les alertes d'une file spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queue: string }> }
) {
  try {
    const { queue } = await params;
    const { searchParams } = request.nextUrl;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    // Générer les alertes
    let alerts = generateMockAlerts(100);

    // Filtrer par queue/severity
    switch (queue) {
      case 'critical':
        alerts = alerts.filter(a => a.type === 'critical' && a.status === 'open');
        break;
      case 'warning':
        alerts = alerts.filter(a => a.type === 'warning' && a.status === 'open');
        break;
      case 'sla':
        alerts = alerts.filter(a => a.status === 'escalated');
        break;
      case 'blocked':
        alerts = alerts.filter(a => a.metadata?.blocked === true);
        break;
      case 'acknowledged':
        alerts = alerts.filter(a => a.status === 'acknowledged');
        break;
      case 'resolved':
        alerts = alerts.filter(a => a.status === 'resolved');
        break;
      case 'info':
        alerts = alerts.filter(a => a.type === 'info');
        break;
      default:
        // All alerts
        break;
    }

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
      queue,
    });
  } catch (error) {
    console.error('Error fetching queue alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue alerts', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

