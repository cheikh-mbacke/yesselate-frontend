import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/delegations/notifications/[id]
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
      type: 'delegation_request',
      title: 'Nouvelle délégation demandée',
      message: 'Une demande de délégation nécessite votre attention',
      createdAt: new Date().toISOString(),
      read: false
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
 * DELETE /api/delegations/notifications/[id]
 * 
 * Supprime/ignore une notification
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params;

    // TODO: Supprimer en BDD
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
