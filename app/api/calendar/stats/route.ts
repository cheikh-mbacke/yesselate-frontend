import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GET /api/calendar/stats
 * ========================
 * 
 * Récupère les statistiques globales du calendrier
 * - Total événements
 * - Événements du jour
 * - Événements de la semaine
 * - Retards SLA
 * - Conflits détectés
 * - Événements terminés
 * 
 * Query params:
 * - bureau: Filtrer par bureau (optionnel)
 * - month: Filtrer par mois (optionnel)
 * - year: Filtrer par année (optionnel)
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bureau = searchParams.get('bureau');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // TODO: Remplacer par vrai appel BDD/API
    const { calculateStats, calendarEvents } = await import('@/lib/data/calendar');

    // Appliquer filtres si présents
    let filteredEvents = [...calendarEvents];

    if (bureau) {
      filteredEvents = filteredEvents.filter(e => e.bureau === bureau);
    }

    if (month && year) {
      const targetMonth = parseInt(month) - 1; // 0-indexed
      const targetYear = parseInt(year);
      filteredEvents = filteredEvents.filter(e => {
        const date = new Date(e.start);
        return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
      });
    }

    const stats = calculateStats(filteredEvents);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching calendar stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
      },
      { status: 500 }
    );
  }
}
