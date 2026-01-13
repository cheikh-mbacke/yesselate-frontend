import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/calendar/notifications
 * 
 * Récupère les notifications du calendrier
 */
export async function GET(request: NextRequest) {
  try {
    const notifications = [
      {
        id: 'notif-cal-1',
        type: 'upcoming',
        eventId: 'evt-1',
        title: 'Événement dans 1 heure',
        message: 'Réunion Direction Générale commence dans 1 heure',
        priority: 'high',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        read: false,
        actionUrl: '/maitre-ouvrage/calendrier?event=evt-1',
      },
      {
        id: 'notif-cal-2',
        type: 'conflict',
        eventId: 'conflict-1',
        title: 'Conflit détecté',
        message: 'Chevauchement entre 2 événements le 11/01',
        priority: 'high',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        actionUrl: '/maitre-ouvrage/calendrier?conflicts=true',
      },
      {
        id: 'notif-cal-3',
        type: 'overdue',
        eventId: 'evt-5',
        title: 'Deadline dépassée',
        message: 'Rapport mensuel aurait dû être soumis hier',
        priority: 'critical',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        read: true,
        actionUrl: '/maitre-ouvrage/calendrier?event=evt-5',
      },
      {
        id: 'notif-cal-4',
        type: 'reminder',
        eventId: 'evt-3',
        title: 'Rappel formation',
        message: 'Formation Sécurité demain à 9h',
        priority: 'medium',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        read: false,
        actionUrl: '/maitre-ouvrage/calendrier?event=evt-3',
      },
      {
        id: 'notif-cal-5',
        type: 'change',
        eventId: 'evt-2',
        title: 'Événement modifié',
        message: 'L\'horaire de la réunion a été changé',
        priority: 'medium',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        read: true,
        actionUrl: '/maitre-ouvrage/calendrier?event=evt-2',
      },
    ];

    const summary = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {
        upcoming: notifications.filter(n => n.type === 'upcoming').length,
        conflict: notifications.filter(n => n.type === 'conflict').length,
        overdue: notifications.filter(n => n.type === 'overdue').length,
        reminder: notifications.filter(n => n.type === 'reminder').length,
        change: notifications.filter(n => n.type === 'change').length,
      },
      byPriority: {
        critical: notifications.filter(n => n.priority === 'critical').length,
        high: notifications.filter(n => n.priority === 'high').length,
        medium: notifications.filter(n => n.priority === 'medium').length,
        low: notifications.filter(n => n.priority === 'low').length,
      },
    };

    return NextResponse.json({
      notifications,
      summary,
      ts: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/calendar/notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendar/notifications
 * 
 * Marque une notification comme lue
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, action } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId requis' },
        { status: 400 }
      );
    }

    // Actions possibles: 'read', 'dismiss', 'snooze'
    return NextResponse.json({
      message: 'Notification traitée avec succès',
      notificationId,
      action: action || 'read',
      updatedAt: new Date().toISOString(),
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur POST /api/calendar/notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors du traitement de la notification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/notifications
 * 
 * Supprime une notification
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'ID de notification requis' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Notification supprimée avec succès',
      notificationId,
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur DELETE /api/calendar/notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression de la notification' },
      { status: 500 }
    );
  }
}

