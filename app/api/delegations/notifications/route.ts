import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/delegations/notifications
 * 
 * Récupère les notifications de délégation
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Mock notifications
    const notifications = [
      {
        id: 'NOTIF-001',
        type: 'delegation_request',
        title: 'Nouvelle délégation demandée',
        message: 'Amadou DIOP demande une délégation de validation budget',
        delegationId: 'DEL-001',
        createdAt: '2026-01-10T09:00:00Z',
        read: false,
        priority: 'haute'
      },
      {
        id: 'NOTIF-002',
        type: 'delegation_approved',
        title: 'Délégation approuvée',
        message: 'Votre délégation DEL-002 a été approuvée',
        delegationId: 'DEL-002',
        createdAt: '2026-01-10T08:30:00Z',
        read: true,
        priority: 'normale'
      },
      {
        id: 'NOTIF-003',
        type: 'delegation_expiring',
        title: 'Délégation expire bientôt',
        message: 'La délégation DEL-003 expire dans 2 jours',
        delegationId: 'DEL-003',
        createdAt: '2026-01-10T07:00:00Z',
        read: false,
        priority: 'moyenne'
      }
    ];

    let filtered = notifications;
    if (unreadOnly) {
      filtered = notifications.filter(n => !n.read);
    }

    return NextResponse.json({
      success: true,
      data: filtered.slice(0, limit),
      unreadCount: notifications.filter(n => !n.read).length,
      total: notifications.length
    });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
