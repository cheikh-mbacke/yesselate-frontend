import { NextRequest, NextResponse } from 'next/server';
import { generateMockAlerts } from '@/lib/data/alerts';

/**
 * GET /api/alerts/sla
 * Récupérer les alertes avec SLA dépassé
 */
export async function GET(request: NextRequest) {
  try {
    let alerts = generateMockAlerts(100);
    
    // Filtrer les alertes avec SLA dépassé
    alerts = alerts.filter(a => a.status === 'escalated');
    
    // Calculer les violations par catégorie
    const violations = alerts.length;
    const reasons: Record<string, number> = {};
    
    alerts.forEach(alert => {
      const reason = alert.metadata?.slaReason || 'Délai de traitement dépassé';
      reasons[reason] = (reasons[reason] || 0) + 1;
    });

    return NextResponse.json({
      alerts,
      violations,
      reasons,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching SLA violations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SLA violations', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
