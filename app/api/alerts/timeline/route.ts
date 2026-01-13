/**
 * GET /api/alerts/timeline
 * Timeline chronologique des alertes
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    const severity = searchParams.get('severity'); // 'critical' | 'warning' | 'all'

    // Générer timeline des N derniers jours
    const timeline = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      // Générer alertes pour ce jour (simulation)
      const alertsCount = Math.floor(Math.random() * 8) + 2;
      const alerts = Array.from({ length: alertsCount }, (_, j) => ({
        id: `ALERT-${date.toISOString().split('T')[0]}-${j + 1}`,
        type: Math.random() > 0.3 ? 'warning' : 'critical',
        title: [
          'Blocage validation BC',
          'Retard paiement',
          'Contrat expirant',
          'Charge bureau excessive',
          'SLA dépassé',
          'Ressource indisponible',
        ][Math.floor(Math.random() * 6)],
        source: ['BF', 'BCG', 'BJA', 'BOP', 'BRH'][Math.floor(Math.random() * 5)],
        createdAt: new Date(dayStart.getTime() + Math.random() * (dayEnd.getTime() - dayStart.getTime())).toISOString(),
        status: Math.random() > 0.5 ? 'acknowledged' : Math.random() > 0.3 ? 'resolved' : 'open',
      }));

      return {
        date: dayStart.toISOString().split('T')[0],
        dateFormatted: dayStart.toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        alerts: severity && severity !== 'all' 
          ? alerts.filter((a) => a.type === severity)
          : alerts,
        stats: {
          total: alerts.length,
          critical: alerts.filter((a) => a.type === 'critical').length,
          warning: alerts.filter((a) => a.type === 'warning').length,
          acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
          resolved: alerts.filter((a) => a.status === 'resolved').length,
          open: alerts.filter((a) => a.status === 'open').length,
        },
      };
    });

    // Stats globales
    const globalStats = {
      totalAlerts: timeline.reduce((acc, day) => acc + day.stats.total, 0),
      avgPerDay: Math.round(timeline.reduce((acc, day) => acc + day.stats.total, 0) / timeline.length),
      criticalRate: Math.round(
        (timeline.reduce((acc, day) => acc + day.stats.critical, 0) /
          timeline.reduce((acc, day) => acc + day.stats.total, 0)) *
          100
      ),
      resolutionRate: Math.round(
        (timeline.reduce((acc, day) => acc + day.stats.resolved, 0) /
          timeline.reduce((acc, day) => acc + day.stats.total, 0)) *
          100
      ),
    };

    return NextResponse.json({
      timeline,
      stats: globalStats,
      period: { days, startDate: timeline[0]?.date, endDate: timeline[timeline.length - 1]?.date },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching alerts timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts timeline' },
      { status: 500 }
    );
  }
}

