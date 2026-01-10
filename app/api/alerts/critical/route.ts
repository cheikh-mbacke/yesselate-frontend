import { NextRequest, NextResponse } from 'next/server';
import { generateMockAlerts } from '@/lib/data/alerts';

/**
 * GET /api/alerts/critical
 * Récupérer les alertes critiques en temps réel
 */
export async function GET(request: NextRequest) {
  try {
    let alerts = generateMockAlerts(100);
    
    // Filtrer les alertes critiques uniquement
    alerts = alerts.filter(a => a.type === 'critical' && a.status === 'open');
    
    // Trier par date de création (plus récentes en premier)
    alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      alerts,
      count: alerts.length,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching critical alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch critical alerts', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
