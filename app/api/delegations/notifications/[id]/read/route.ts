import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/delegations/notifications/[id]/read
 * 
 * Marque une notification comme lue
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params;

    // TODO: Marquer comme lue en BDD
    console.log(`Notification ${notificationId} marquée comme lue`);

    return NextResponse.json({
      success: true,
      id: notificationId,
      readAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
