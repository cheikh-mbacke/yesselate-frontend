import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/arbitrages/notifications
 * 
 * Récupère les notifications d'arbitrages
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Mock notifications
    const notifications = [
      {
        id: 'NOTIF-ARB-001',
        type: 'escalade',
        title: 'Arbitrage escaladé',
        message: 'L\'arbitrage ARB-001 a été escaladé au comité de direction',
        arbitrageId: 'ARB-001',
        createdAt: '2026-01-10T09:00:00Z',
        read: false,
        priority: 'critique',
        montant: 150000000,
      },
      {
        id: 'NOTIF-ARB-002',
        type: 'deadline',
        title: 'Échéance proche',
        message: 'L\'arbitrage ARB-002 doit être tranché avant demain',
        arbitrageId: 'ARB-002',
        createdAt: '2026-01-10T08:30:00Z',
        read: false,
        priority: 'haute',
        montant: 80000000,
      },
      {
        id: 'NOTIF-ARB-003',
        type: 'decision',
        title: 'Décision requise',
        message: 'Votre validation est requise sur ARB-003',
        arbitrageId: 'ARB-003',
        createdAt: '2026-01-10T07:00:00Z',
        read: true,
        priority: 'moyenne',
        montant: 45000000,
      },
      {
        id: 'NOTIF-ARB-004',
        type: 'complement',
        title: 'Complément reçu',
        message: 'Les documents complémentaires ont été fournis',
        arbitrageId: 'ARB-004',
        createdAt: '2026-01-09T16:00:00Z',
        read: true,
        priority: 'normale',
        montant: 25000000,
      },
    ];

    let filtered = notifications;
    if (unreadOnly) {
      filtered = notifications.filter(n => !n.read);
    }

    return NextResponse.json({
      success: true,
      data: filtered.slice(0, limit),
      unreadCount: notifications.filter(n => !n.read).length,
      total: notifications.length,
      criticalCount: notifications.filter(n => n.priority === 'critique' && !n.read).length,
    });
  } catch (error) {
    console.error('Erreur récupération notifications arbitrages:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

