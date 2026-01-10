import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GET /api/calendar/conflicts
 * ============================
 * 
 * Détecte et retourne tous les conflits dans le calendrier
 * 
 * Query params:
 * - bureau: Filtrer par bureau
 * - startDate: Date de début pour la recherche (ISO)
 * - endDate: Date de fin pour la recherche (ISO)
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bureau = searchParams.get('bureau');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // TODO: Remplacer par vrai appel BDD/API
    const { calendarEvents, detectConflicts } = await import('@/lib/data/calendar');

    // Filtrer par bureau si spécifié
    let events = bureau 
      ? calendarEvents.filter(e => e.bureau === bureau)
      : calendarEvents;

    // Filtrer par période si spécifié
    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      events = events.filter(e => {
        const eventStart = new Date(e.start).getTime();
        return eventStart >= start && eventStart <= end;
      });
    }

    // Détecter les conflits
    const conflictIds = detectConflicts(events);

    // Grouper les conflits par paires
    const conflicts: Array<{
      id: string;
      events: any[];
      reason: string;
      severity: 'critical' | 'warning' | 'info';
      affectedPeople: string[];
    }> = [];

    const processedPairs = new Set<string>();

    events.forEach((event1, idx) => {
      if (!conflictIds.has(event1.id)) return;

      events.slice(idx + 1).forEach(event2 => {
        if (!conflictIds.has(event2.id)) return;

        const pairId = [event1.id, event2.id].sort().join('|');
        if (processedPairs.has(pairId)) return;

        // Vérifier si même personne
        const sharedAssignees = event1.assignees?.filter(a1 =>
          event2.assignees?.some(a2 => a2.id === a1.id)
        );

        if (!sharedAssignees || sharedAssignees.length === 0) return;

        // Vérifier si chevauchement temporel
        const start1 = new Date(event1.start).getTime();
        const end1 = new Date(event1.end).getTime();
        const start2 = new Date(event2.start).getTime();
        const end2 = new Date(event2.end).getTime();

        if (start1 < end2 && end1 > start2) {
          processedPairs.add(pairId);

          // Calculer la sévérité
          let severity: 'critical' | 'warning' | 'info' = 'warning';
          if (event1.priority === 'critical' || event2.priority === 'critical') {
            severity = 'critical';
          } else if (event1.priority === 'urgent' || event2.priority === 'urgent') {
            severity = 'warning';
          } else {
            severity = 'info';
          }

          conflicts.push({
            id: pairId,
            events: [
              {
                id: event1.id,
                title: event1.title,
                start: event1.start,
                end: event1.end,
                priority: event1.priority,
                location: (event1 as any).location,
              },
              {
                id: event2.id,
                title: event2.title,
                start: event2.start,
                end: event2.end,
                priority: event2.priority,
                location: (event2 as any).location,
              },
            ],
            reason: `${sharedAssignees.length} participant(s) en conflit`,
            severity,
            affectedPeople: sharedAssignees.map(a => a.name),
          });
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        conflicts,
        total: conflicts.length,
        bySeverity: {
          critical: conflicts.filter(c => c.severity === 'critical').length,
          warning: conflicts.filter(c => c.severity === 'warning').length,
          info: conflicts.filter(c => c.severity === 'info').length,
        },
      },
    });
  } catch (error) {
    console.error('Error detecting conflicts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la détection des conflits',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendar/conflicts/resolve
 * =====================================
 * 
 * Résout un conflit en replanifiant un événement
 * 
 * Body:
 * - conflictId: ID du conflit
 * - eventId: ID de l'événement à replanifier
 * - newStart: Nouvelle date de début
 * - newEnd: Nouvelle date de fin
 * - reason: Motif de la replanification
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { conflictId, eventId, newStart, newEnd, reason } = body;

    if (!conflictId || !eventId || !newStart || !newEnd) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres manquants',
        },
        { status: 400 }
      );
    }

    // TODO: Mettre à jour l'événement en BDD
    // Pour l'instant, on simule juste une réponse

    return NextResponse.json({
      success: true,
      message: 'Conflit résolu avec succès',
      data: {
        conflictId,
        eventId,
        oldStart: 'xxx',
        oldEnd: 'xxx',
        newStart,
        newEnd,
        reason,
        resolvedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la résolution du conflit',
      },
      { status: 500 }
    );
  }
}
