import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/arbitrages/notifications/[id]
 * Récupère une notification spécifique
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params;

    const notification = {
      id: notificationId,
      type: 'escalade',
      title: 'Arbitrage escaladé',
      message: 'Un arbitrage nécessite votre attention',
      arbitrageId: 'ARB-001',
      createdAt: new Date().toISOString(),
      read: false,
      priority: 'haute'
    };

    return NextResponse.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Erreur récupération notification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/arbitrages/notifications/[id]
 * Met à jour une notification (marquer comme lue)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params;
    const body = await req.json();

    console.log(`Notification ${notificationId} mise à jour:`, body);

    return NextResponse.json({
      success: true,
      id: notificationId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur mise à jour notification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/arbitrages/notifications/[id]
 * Supprime une notification
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params;

    console.log(`Notification ${notificationId} supprimée`);

    return NextResponse.json({
      success: true,
      id: notificationId,
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur suppression notification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
