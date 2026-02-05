import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/alerts/trends
 * Récupérer les tendances des alertes sur une période
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const period = searchParams.get('period') || 'week';

    // Générer des données de tendances mockées
    let trends = [];
    
    switch (period) {
      case 'day':
        // 24 heures par heure
        for (let i = 23; i >= 0; i--) {
          const date = new Date();
          date.setHours(date.getHours() - i);
          trends.push({
            date: date.toISOString(),
            critical: Math.floor(Math.random() * 5),
            warning: Math.floor(Math.random() * 10) + 5,
            info: Math.floor(Math.random() * 15) + 10,
            resolved: Math.floor(Math.random() * 20) + 15,
          });
        }
        break;

      case 'week':
        // 7 jours
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          trends.push({
            date: date.toISOString().split('T')[0],
            critical: Math.floor(Math.random() * 8) + 2,
            warning: Math.floor(Math.random() * 15) + 5,
            info: Math.floor(Math.random() * 20) + 10,
            resolved: Math.floor(Math.random() * 30) + 20,
          });
        }
        break;

      case 'month':
        // 30 jours
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          trends.push({
            date: date.toISOString().split('T')[0],
            critical: Math.floor(Math.random() * 10) + 3,
            warning: Math.floor(Math.random() * 20) + 8,
            info: Math.floor(Math.random() * 25) + 12,
            resolved: Math.floor(Math.random() * 40) + 25,
          });
        }
        break;
    }

    return NextResponse.json({
      trends,
      period,
      summary: {
        totalCritical: trends.reduce((sum, t) => sum + t.critical, 0),
        totalWarning: trends.reduce((sum, t) => sum + t.warning, 0),
        totalInfo: trends.reduce((sum, t) => sum + t.info, 0),
        totalResolved: trends.reduce((sum, t) => sum + t.resolved, 0),
      },
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching alert trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

