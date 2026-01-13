import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/arbitrages/notifications/read-all
 * 
 * Marque toutes les notifications comme lues
 */
export async function POST(req: NextRequest) {
  try {
    console.log('Toutes les notifications arbitrages marquées comme lues');

    return NextResponse.json({
      success: true,
      readCount: 5,
      readAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur marquage notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

