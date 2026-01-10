import { NextRequest, NextResponse } from 'next/server';
import { generateMockAlerts } from '@/lib/data/alerts';

/**
 * GET /api/alerts/blocked
 * Récupérer les alertes bloquées
 */
export async function GET(request: NextRequest) {
  try {
    let alerts = generateMockAlerts(100);
    
    // Filtrer les alertes bloquées
    alerts = alerts.filter(a => a.metadata?.blocked === true);
    
    // Calculer les raisons de blocage
    const reasons: Record<string, number> = {
      'En attente validation': 3,
      'En attente signature': 2,
      'Dépendance externe': 1,
      'Information manquante': 2,
    };

    return NextResponse.json({
      alerts: alerts.slice(0, 10), // Limiter à 10 pour l'affichage
      total: alerts.length,
      reasons,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching blocked alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked alerts', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
