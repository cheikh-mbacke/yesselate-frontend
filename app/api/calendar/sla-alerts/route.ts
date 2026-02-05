import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/calendar/sla-alerts
 * Récupère les événements avec SLA pour le Centre d'Alertes
 */

export async function GET(request: NextRequest) {
  try {
    // TODO: Remplacer par la vraie logique de récupération depuis la base de données
    // Pour l'instant, on retourne des données mockées
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Mock data - À remplacer par la vraie logique
    const overdue: any[] = [];
    const atRisk: any[] = [];
    const todayEvents: any[] = [];

    // Simuler quelques événements
    // En production, utiliser CalendarSLAService pour récupérer les vrais événements

    return NextResponse.json({
      overdue,
      atRisk,
      today: todayEvents,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching SLA alerts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des alertes SLA' },
      { status: 500 }
    );
  }
}

