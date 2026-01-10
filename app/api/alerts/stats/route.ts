import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/alerts/stats
 * Retourne les statistiques des alertes
 */
export async function GET(request: NextRequest) {
  try {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 300));

    // Générer des statistiques réalistes
    const now = new Date();
    const stats = {
      total: 47,
      critical: 8,
      high: 15,
      medium: 18,
      low: 6,
      resolved: 152,
      resolvedToday: 12,
      averageResolutionTime: 4.5, // hours
      byType: [
        { type: 'technical', count: 12, label: 'Techniques' },
        { type: 'administrative', count: 18, label: 'Administratives' },
        { type: 'financial', count: 9, label: 'Financières' },
        { type: 'quality', count: 8, label: 'Qualité' },
      ],
      byBureau: [
        { bureau: 'Dakar Centre', count: 15 },
        { bureau: 'Dakar Plateau', count: 12 },
        { bureau: 'Pikine', count: 10 },
        { bureau: 'Guédiawaye', count: 8 },
        { bureau: 'Rufisque', count: 2 },
      ],
      trend: {
        week: -8, // -8% par rapport à la semaine dernière
        month: +12, // +12% par rapport au mois dernier
      },
      performance: {
        resolutionRate: 94.5, // % des alertes résolues dans les délais
        averageResponseTime: 1.2, // heures
        escalationRate: 12.5, // % des alertes escaladées
      },
      recentResolutions: [
        {
          id: 'ALT-2026-047',
          title: 'Retard livraison matériaux',
          resolvedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          resolvedBy: 'Marie Diop',
          duration: 3.5, // hours
        },
        {
          id: 'ALT-2026-046',
          title: 'Conflit planning équipes',
          resolvedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
          resolvedBy: 'Amadou Seck',
          duration: 2.1,
        },
        {
          id: 'ALT-2026-045',
          title: 'Dépassement budget prévisionnel',
          resolvedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
          resolvedBy: 'Fatou Ndiaye',
          duration: 6.8,
        },
      ],
      ts: now.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error generating alert stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate statistics',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

