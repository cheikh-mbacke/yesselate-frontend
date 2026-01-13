import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GET /api/calendar/events/[id]
 * ==============================
 * 
 * Récupère les détails d'un événement spécifique
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Remplacer par vrai appel BDD/API
    const { calendarEvents, detectConflicts } = await import('@/lib/data/calendar');

    const event = calendarEvents.find(e => e.id === id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Événement non trouvé',
        },
        { status: 404 }
      );
    }

    // Détecter les conflits
    const conflicts = detectConflicts(calendarEvents);
    const hasConflict = conflicts.has(event.id);

    // Trouver les événements en conflit
    const conflictingEvents = hasConflict
      ? calendarEvents.filter(e => {
          if (e.id === event.id || !conflicts.has(e.id)) return false;

          // Vérifier si même personne
          const sharedAssignees = event.assignees?.filter(a1 =>
            e.assignees?.some(a2 => a2.id === a1.id)
          );

          if (!sharedAssignees || sharedAssignees.length === 0) return false;

          // Vérifier si chevauchement temporel
          const start1 = new Date(event.start).getTime();
          const end1 = new Date(event.end).getTime();
          const start2 = new Date(e.start).getTime();
          const end2 = new Date(e.end).getTime();

          return start1 < end2 && end1 > start2;
        })
      : [];

    const now = Date.now();
    const slaOverdue = event.slaDueAt && new Date(event.slaDueAt).getTime() < now && event.status === 'open';

    const enrichedEvent = {
      ...event,
      hasConflict,
      conflictingEvents: conflictingEvents.map(e => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
      })),
      isOverdue: slaOverdue,
      slaStatus: slaOverdue ? 'overdue' : 'ok',
    };

    return NextResponse.json({
      success: true,
      data: enrichedEvent,
    });
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération de l'événement",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/calendar/events/[id]
 * ================================
 * 
 * Met à jour un événement
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Mettre à jour en BDD
    // Pour l'instant, on simule juste une réponse

    const updatedEvent = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: 'Événement mis à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour de l'événement",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/events/[id]
 * =================================
 * 
 * Supprime (annule) un événement
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const reason = searchParams.get('reason') || 'Annulé sans raison spécifiée';

    // TODO: Marquer comme annulé en BDD

    return NextResponse.json({
      success: true,
      message: 'Événement annulé avec succès',
      data: {
        id,
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'annulation de l'événement",
      },
      { status: 500 }
    );
  }
}
