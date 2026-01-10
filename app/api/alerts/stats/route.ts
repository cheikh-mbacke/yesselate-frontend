import { NextRequest, NextResponse } from 'next/server';
import { calculateAlertStats } from '@/lib/data/alerts';

/**
 * GET /api/alerts/stats
 * Récupérer les statistiques globales des alertes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Extraire les filtres (pour stats filtrées)
    const filters = {
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      queue: searchParams.get('queue') || undefined,
      severity: searchParams.get('severity') || undefined,
    };

    // Calculer les stats
    const stats = calculateAlertStats();

    // Enrichir avec des métriques supplémentaires
    const enrichedStats = {
      ...stats,
      byQueue: {
        critical: stats.critical,
        warning: stats.warning,
        sla: stats.escalated,
        blocked: 0,
        acknowledged: stats.acknowledged,
        resolved: stats.resolved,
        info: stats.info,
      },
      byStatus: {
        open: stats.critical + stats.warning + stats.info,
        acknowledged: stats.acknowledged,
        resolved: stats.resolved,
        escalated: stats.escalated,
        closed: 0,
      },
      slaCompliance: 96, // %
      trends: {
        critical: { value: stats.critical, change: '+2', direction: 'up' },
        warning: { value: stats.warning, change: '-3', direction: 'down' },
        resolved: { value: stats.resolved, change: '+12', direction: 'up' },
      },
    };

    return NextResponse.json({ stats: enrichedStats });
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
